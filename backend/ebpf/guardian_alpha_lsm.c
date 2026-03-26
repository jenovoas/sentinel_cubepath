#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>
#include <bpf/bpf_core_read.h>
#include "cortex_events.h"

char LICENSE[] SEC("license") = "GPL";
__u32 VERSION SEC("version") = 1;

#ifndef EACCES
#define EACCES 13
#endif

/* Path buffer size (aligned to eBPF limits) */
#define PATH_MAX 256

/* Whitelist map: Full path string -> allowed (1) or blocked (0) */
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10000);
    __type(key, char[PATH_MAX]);     /* Full path */
    __type(value, __u8);             /* 1 = allowed */
} whitelist_map SEC(".maps");

/* Event log map: ring buffer for audit trail to userspace */
struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);  /* 256KB buffer */
} events SEC(".maps");

/* Helper: Check if binary path is whitelisted */
static __always_inline int is_whitelisted(const char *path)
{
    __u8 *allowed;
    char key[PATH_MAX];
    int i;
    
    for (i = 0; i < PATH_MAX; i++) {
        key[i] = 0;
    }
    
    long ret = bpf_probe_read_kernel_str(key, sizeof(key), path);
    if (ret < 0) {
        return 0;
    }
    
    allowed = bpf_map_lookup_elem(&whitelist_map, key);
    if (!allowed) {
        return 0;
    }
    
    return *allowed;
}

/* Helper: Log event to ring buffer */
static __always_inline void log_event(__u32 pid, __u32 uid, 
                                      const char *filename, 
                                      __u8 action)
{
    struct cortex_event *e;
    
    e = bpf_ringbuf_reserve(&events, sizeof(*e), 0);
    if (!e) {
        return;
    }
    
    e->timestamp_ns = bpf_ktime_get_ns();
    e->pid = pid;
    e->event_type = (action == 1) ? EVENT_EXEC_ALLOWED : EVENT_EXEC_BLOCKED;
    e->entropy_signal = 0; 
    e->severity = (action == 1) ? SEVERITY_LOW : SEVERITY_HIGH;
    
    bpf_ringbuf_submit(e, 0);
}

/* LSM Hook: Intercept binary execution */
SEC("lsm/bprm_check_security")
int BPF_PROG(guardian_execve, struct linux_binprm *bprm, int ret)
{
    const char *filename;
    __u32 pid;
    __u32 uid;
    int whitelisted;
    
    if (ret != 0) {
        return ret;
    }
    
    pid = bpf_get_current_pid_tgid() >> 32;
    uid = bpf_get_current_uid_gid() & 0xFFFFFFFF;
    
    filename = BPF_CORE_READ(bprm, filename);
    if (!filename) {
        return -EACCES;
    }
    
    whitelisted = is_whitelisted(filename);
    
    if (!whitelisted) {
        log_event(pid, uid, filename, 0);
        bpf_printk("Guardian-Alpha [BLOCK]: Denied execution of %s (uid=%d)", filename, uid);
        return -EACCES;
    }
    
    log_event(pid, uid, filename, 1);
    bpf_printk("Guardian-Alpha [ALLOW]: Verified binary %s", filename);
    
    return 0;
}
#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>
#include "cortex_events.h"

/* Ring buffer for sending events to userspace */
struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024); // 256KB ring buffer
} burst_events SEC(".maps");

/* Per-CPU packet counter */
struct {
    __uint(type, BPF_MAP_TYPE_PERCPU_ARRAY);
    __type(key, __u32);
    __type(value, __u64);
    __uint(max_entries, 1);
} pkt_count SEC(".maps");

/* Timestamp of last check */
struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __type(key, __u32);
    __type(value, __u64);
    __uint(max_entries, 1);
} last_check SEC(".maps");

/* Configuration */
#define BURST_THRESHOLD_LOW     1000    // 1K pps
#define BURST_THRESHOLD_MEDIUM  10000   // 10K pps
#define BURST_THRESHOLD_HIGH    50000   // 50K pps
#define BURST_THRESHOLD_CRITICAL 100000 // 100K pps
#define CHECK_INTERVAL_NS       1000000000ULL // 1 second

SEC("xdp")
int detect_burst(struct xdp_md *ctx)
{
    __u32 key = 0;
    __u64 *count, *last_ts;
    __u64 now, elapsed_ns, pps;
    struct network_burst_event *event;
    
    // Get current timestamp (nanoseconds since boot)
    now = bpf_ktime_get_ns();
    
    // Increment packet counter
    count = bpf_map_lookup_elem(&pkt_count, &key);
    if (!count) {
        return XDP_PASS;
    }
    __sync_fetch_and_add(count, 1);
    
    // Check if it's time to calculate PPS
    last_ts = bpf_map_lookup_elem(&last_check, &key);
    if (!last_ts) {
        return XDP_PASS;
    }
    
    elapsed_ns = now - *last_ts;
    
    // Only check every CHECK_INTERVAL_NS (1 second)
    if (elapsed_ns < CHECK_INTERVAL_NS) {
        return XDP_PASS;
    }
    
    // Calculate packets per second
    pps = (*count * 1000000000ULL) / elapsed_ns;
    
    // Determine severity
    __u8 severity = SEVERITY_LOW;
    __u32 burst_detected = 0;
    
    if (pps >= BURST_THRESHOLD_CRITICAL) {
        severity = SEVERITY_CRITICAL;
        burst_detected = 1;
    } else if (pps >= BURST_THRESHOLD_HIGH) {
        severity = SEVERITY_HIGH;
        burst_detected = 1;
    } else if (pps >= BURST_THRESHOLD_MEDIUM) {
        severity = SEVERITY_MEDIUM;
        burst_detected = 1;
    } else if (pps >= BURST_THRESHOLD_LOW) {
        severity = SEVERITY_LOW;
        burst_detected = 1;
    }
    
    // Send event to userspace if burst detected
    if (burst_detected) {
        event = bpf_ringbuf_reserve(&burst_events, sizeof(*event), 0);
        if (event) {
            event->timestamp_ns = now;
            event->event_type = (severity >= SEVERITY_MEDIUM) ? EVENT_NETWORK_BURST : EVENT_NETWORK_NORMAL;
            event->packets_per_sec = (__u32)pps;
            event->severity = severity;
            event->entropy_signal = S60_SCALE_0 * (severity * 15 + 10);
            bpf_ringbuf_submit(event, 0);
        }
    }
    
    // Reset counter and timestamp
    *count = 0;
    *last_ts = now;
    
    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";

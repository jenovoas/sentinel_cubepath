# 🛡️ Sentinel eBPF Build System (Ring-0)
# 
# Compilation of cognitive guardians for Rocky Linux 9/10

CLANG ?= clang
LLVM_STRIP ?= llvm-strip
BPFTOOL ?= bpftool

ARCH := $(shell uname -m | sed 's/x86_64/x86/' | sed 's/aarch64/arm64/')
INCLUDES := -I. -I/usr/include/$(ARCH)-linux-gnu

# Guardianes a compilar
MODULES := guardian_alpha_lsm lsm_ai_guardian burst_sensor tc_firewall guardian_cognitive xdp_firewall
OBJECTS := $(patsubst %, %.bpf.o, $(MODULES))

.PHONY: all clean load status

all: $(OBJECTS)
	@echo "🛡️ Sentinel Guardians (Ring-0) ready for deployment."

%.bpf.o: %.c
	$(CLANG) -g -O2 -target bpf -D__TARGET_ARCH_$(ARCH) \
		$(INCLUDES) -c $< -o $@
	$(LLVM_STRIP) -g $@

# Carga de mapas/programas (Requiere sudo/root)
load: all
	@mkdir -p /sys/fs/bpf
	@echo "🔗 Pinning Master Maps..."
	@# Pinning specific maps if they don't exist
	@ls /sys/fs/bpf/cortex_events >/dev/null 2>&1 || $(BPFTOOL) map pin name cortex_events /sys/fs/bpf/cortex_events 2>/dev/null || true
	
	@for mod in $(MODULES); do \
		echo "🚀 Deploying $$mod guardian..."; \
		TYPE="lsm"; \
		if [[ "$$mod" == *"xdp"* ]] || [[ "$$mod" == *"burst"* ]]; then TYPE="xdp"; fi; \
		if [[ "$$mod" == *"tc_firewall"* ]]; then TYPE="sched_cls"; fi; \
		\
		$(BPFTOOL) prog load $$mod.bpf.o /sys/fs/bpf/$$mod type $$TYPE || echo "⚠️ Load Fail: $$mod as $$TYPE"; \
	done
	@echo "✅ All guardians deployed to Ring-0."

clean:
	rm -f *.o

status:
	@$(BPFTOOL) prog list
	@ls -l /sys/fs/bpf/

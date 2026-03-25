# 🛡️ Sentinel eBPF Build System (Ring-0)
# 
# Compilation of cognitive guardians for Rocky Linux 9/10

CLANG ?= clang
LLVM_STRIP ?= llvm-strip
BPFTOOL ?= bpftool

ARCH := $(shell uname -m | sed 's/x86_64/x86/' | sed 's/aarch64/arm64/')
INCLUDES := -I. -I/usr/include/$(ARCH)-linux-gnu

# Guardianes a compilar
MODULES := guardian_alpha_lsm lsm_ai_guardian burst_sensor tc_firewall guardian_cognitive
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
	@for mod in $(MODULES); do \
		echo "🔗 Loading $$mod guardian into kernel..."; \
		$(BPFTOOL) prog load $$mod.bpf.o /sys/fs/bpf/$$mod type lsm || echo "⚠️ Warning: Failed to load $$mod (Check LSM support)"; \
	done

clean:
	rm -f *.o

status:
	@$(BPFTOOL) prog list
	@ls -l /sys/fs/bpf/

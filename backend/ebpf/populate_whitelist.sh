#!/bin/bash
# populate_whitelist.sh — Pre-pobla la whitelist de Sentinel Ring-0
# Adaptado para sentinel-cubepath (Base-60 Stack)

set -e

BPF_SENTINEL_DIR="/sys/fs/bpf/sentinel"
MAP_PIN="${BPF_SENTINEL_DIR}/ai_whitelist"
LOG_FILE="/tmp/populate_whitelist.log"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()   { echo -e "${GREEN}[+]${NC} $1" | tee -a "$LOG_FILE"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

[[ $EUID -ne 0 ]] && error "Este script debe correr como root (sudo)"

log "Iniciando población de whitelist en ${MAP_PIN}..."

# Crear el mapa si no existe (o si queremos recrearlo)
if [ ! -e "${MAP_PIN}" ]; then
    log "Creando ai_whitelist..."
    mkdir -p "${BPF_SENTINEL_DIR}"
    bpftool map create "${MAP_PIN}" \
        type hash \
        key 256 \
        value 8 \
        entries 10000 \
        name ai_whitelist
fi

add_to_whitelist() {
    local path="$1"
    if [ ${#path} -gt 255 ]; then return; fi

    local key_hex
    key_hex=$(python3 -c "
path = '$path'
key_bytes = path.encode('utf-8') + b'\\x00' * (256 - len(path))
print(' '.join(f'{b:02x}' for b in key_bytes))
" 2>/dev/null)

    # El valor es __u64 (1 = ALLOW_AI) -> 01 00 00 00 00 00 00 00
    if bpftool map update pinned "${MAP_PIN}" key hex $key_hex value hex 01 00 00 00 00 00 00 00 2>/dev/null; then
        echo "  ALLOWED: $path"
    else
        warn "Fallo al agregar: $path"
    fi
}

add_if_exists() {
    local path="$1"
    if [ -f "$path" ] && [ -x "$path" ]; then
        add_to_whitelist "$path"
    fi
}

# Críticos de sistema
add_if_exists "/usr/bin/bash"
add_if_exists "/usr/bin/sh"
add_if_exists "/usr/bin/sudo"
add_if_exists "/usr/bin/env"
add_if_exists "/usr/sbin/sshd"
add_if_exists "/usr/bin/node"
add_if_exists "/usr/bin/npm"
add_if_exists "/usr/bin/python3"
add_if_exists "/usr/sbin/bpftool"

# Binarios de desarrollo (Hackathon context)
add_if_exists "/usr/bin/cargo"
add_if_exists "/usr/bin/rustc"
add_if_exists "/usr/bin/make"
add_if_exists "/usr/bin/git"

log "Población completada."

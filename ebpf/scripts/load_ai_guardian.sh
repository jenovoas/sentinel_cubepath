#!/bin/bash
# ME-60OS AI Guardian - Script de Carga con Permisos Granulares
# Copyright (c) 2026 ME-60OS Development Team

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EBPF_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$EBPF_DIR/build"
PIN_DIR="/sys/fs/bpf/ai_guardian"
OBJ_FILE="$BUILD_DIR/ai_guardian.o"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ME-60OS AI Guardian - Carga con Permisos Granulares${NC}"
echo "============================================================"

# 1. Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ ERROR: Este script debe ejecutarse como root${NC}"
    echo "   Uso: sudo $0"
    exit 1
fi

# 2. Verificar que el objeto BPF existe
if [ ! -f "$OBJ_FILE" ]; then
    echo -e "${RED}❌ ERROR: No se encuentra $OBJ_FILE${NC}"
    echo "   Ejecuta primero: cd $EBPF_DIR && make"
    exit 1
fi

# 3. Verificar que lsm_loader existe
if [ ! -f "$BUILD_DIR/lsm_loader" ]; then
    echo -e "${RED}❌ ERROR: No se encuentra lsm_loader${NC}"
    echo "   Ejecuta: cd $EBPF_DIR && make utils"
    exit 1
fi

# 4. Verificar LSM BPF habilitado
if ! grep -q "bpf" /sys/kernel/security/lsm; then
    echo -e "${RED}❌ ERROR: BPF LSM no está habilitado en el kernel${NC}"
    echo "   Verifica /sys/kernel/security/lsm"
    exit 1
fi

echo -e "${GREEN}✅ Verificaciones pasadas${NC}"
echo ""

# 5. Limpiar objetos anteriores si existen
if [ -d "$PIN_DIR" ]; then
    echo -e "${YELLOW}⚠️  Limpiando objetos BPF anteriores...${NC}"
    rm -rf "$PIN_DIR"
fi

# 6. Crear directorio de pinning
# Asegurar que root del fs bpf sea atravesable
chmod 755 /sys/fs/bpf

echo "📁 Creando directorio de pinning: $PIN_DIR"
mkdir -p "$PIN_DIR"

# 7. Cargar el módulo usando lsm_loader
echo "📦 Cargando módulo eBPF..."
"$BUILD_DIR/lsm_loader" "$OBJ_FILE" "$PIN_DIR" "me60os_ai_guardian_open"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ERROR: Falló la carga del módulo${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Módulo cargado exitosamente${NC}"
echo ""

# 8. Configurar permisos granulares (Opción C)
echo "🔐 Configurando permisos granulares..."

# Obtener usuario que invocó sudo (no root)
REAL_USER="${SUDO_USER:-$USER}"
REAL_UID=$(id -u "$REAL_USER")
REAL_GID=$(id -g "$REAL_USER")

echo "   Usuario objetivo: $REAL_USER (UID: $REAL_UID, GID: $REAL_GID)"

# Configurar permisos para el ring buffer (lectura/escritura para usuario)
# Nota: libbpf requiere permisos de escritura para abrir ring buffers
if [ -e "$PIN_DIR/cortex_events" ]; then
    chmod 666 "$PIN_DIR/cortex_events"
    chown root:$REAL_GID "$PIN_DIR/cortex_events"
    echo -e "   ${GREEN}✓${NC} cortex_events: lectura/escritura para $REAL_USER"
fi

# Configurar permisos para mapas de control (lectura/escritura para root, lectura para usuario)
for map in ai_agents_map ai_whitelist_map stats_map; do
    if [ -e "$PIN_DIR/$map" ]; then
        if [ "$map" == "ai_agents_map" ]; then
             chmod 664 "$PIN_DIR/$map"
             echo -e "   ${GREEN}✓${NC} $map: lectura/escritura para $REAL_USER"
        else
             chmod 644 "$PIN_DIR/$map"
             echo -e "   ${GREEN}✓${NC} $map: lectura para $REAL_USER"
        fi
        chown root:$REAL_GID "$PIN_DIR/$map"
    fi
done

# Configurar permisos del directorio
chmod 755 "$PIN_DIR"
chown root:$REAL_GID "$PIN_DIR"

echo ""
echo -e "${GREEN}✅ Permisos configurados${NC}"
echo ""

# 9. Inicializar whitelist con paths seguros básicos
echo "📝 Inicializando whitelist básica..."

# Función helper para agregar path a whitelist
add_to_whitelist() {
    local path="$1"
    # Convertir path a hex (256 bytes, rellenado con ceros)
    local path_hex=$(printf "%s" "$path" | xxd -p | tr -d '\n')
    local padding=$(printf '%0*d' $((512 - ${#path_hex})) 0 | sed 's/0/00/g')
    local key_hex="${path_hex}${padding}"
    
    # Valor: ALLOW_AI = 1 (8 bytes little-endian)
    local value_hex="0100000000000000"
    
    bpftool map update pinned "$PIN_DIR/ai_whitelist_map" \
        key hex $key_hex value hex $value_hex 2>/dev/null || true
}

# Paths seguros básicos (lectura permitida)
SAFE_PATHS=(
    "/etc/passwd"
    "/etc/group"
    "/etc/hostname"
    "/proc/cpuinfo"
    "/proc/meminfo"
    "/sys/kernel/security/lsm"
)

for path in "${SAFE_PATHS[@]}"; do
    add_to_whitelist "$path"
    echo -e "   ${GREEN}✓${NC} Agregado: $path"
done

echo ""
echo -e "${GREEN}✅ Whitelist inicializada${NC}"
echo ""

# 10. Mostrar estado final
echo "📊 Estado del módulo:"
echo ""
bpftool prog list | grep -A 3 "me60os_ai_guardian" || echo "   (Programas cargados pero no visibles en bpftool)"
echo ""
echo "📊 Mapas BPF:"
echo ""
bpftool map list | grep -A 2 "ai_guardian" || ls -lh "$PIN_DIR/"
echo ""

# 11. Instrucciones finales
echo "============================================================"
echo -e "${GREEN}✅ AI Guardian cargado exitosamente${NC}"
echo ""
echo "📍 Objetos pinned en: $PIN_DIR"
echo "🔐 Permisos configurados para usuario: $REAL_USER"
echo ""
echo "🧪 Para probar el ring buffer:"
echo "   python3 tests/test_ring_buffer.py"
echo ""
echo "🛑 Para descargar el módulo:"
echo "   sudo ./ebpf/scripts/unload_ai_guardian.sh"
echo "============================================================"

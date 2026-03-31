#!/bin/bash
# ME-60OS AI Guardian - Script de Descarga
# Copyright (c) 2026 ME-60OS Development Team

set -e

PIN_DIR="/sys/fs/bpf/ai_guardian"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 ME-60OS AI Guardian - Descarga${NC}"
echo "============================================================"

# Verificar root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ ERROR: Este script debe ejecutarse como root${NC}"
    echo "   Uso: sudo $0"
    exit 1
fi

# Verificar si está cargado
if [ ! -d "$PIN_DIR" ]; then
    echo -e "${YELLOW}⚠️  AI Guardian no está cargado${NC}"
    echo "   Directorio no encontrado: $PIN_DIR"
    exit 0
fi

echo "🗑️  Eliminando objetos BPF pinned..."

# Eliminar links primero (desadjunta programas LSM)
for link in "$PIN_DIR"/*_link; do
    if [ -e "$link" ]; then
        rm -f "$link"
        echo -e "   ${GREEN}✓${NC} Eliminado: $(basename "$link")"
    fi
done

# Eliminar mapas
for map in "$PIN_DIR"/*; do
    if [ -e "$map" ] && [ ! -d "$map" ]; then
        rm -f "$map"
        echo -e "   ${GREEN}✓${NC} Eliminado: $(basename "$map")"
    fi
done

# Eliminar directorio
rmdir "$PIN_DIR" 2>/dev/null || rm -rf "$PIN_DIR"

echo ""
echo -e "${GREEN}✅ AI Guardian descargado exitosamente${NC}"
echo ""
echo "📊 Para verificar:"
echo "   bpftool prog list | grep ai_guardian"
echo "   ls $PIN_DIR"
echo "============================================================"

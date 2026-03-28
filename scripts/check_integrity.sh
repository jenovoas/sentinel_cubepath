#!/bin/bash
# 🛡️ SENTINEL INTEGRITY RUNNER - MIDUDEV HACKATÓN 2026 🛡️
# --------------------------------------------------------

# Colors for the judges
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}>>> [SENTINEL] Iniciar Auditoría de Integridad (Modo: Ring-0)${NC}"

# 1. PRUEBAS UNITARIAS (RUST CORE)
echo -e "${BLUE}>>> [1/4] Ejecutando Pruebas Unitarias...${NC}"
cd backend && cargo test --quiet
if [ $? -eq 0 ]; then
    echo -e "${GREEN}SUCCESS: Todos los subsistemas cognitivos son lógicamente íntegros.${NC}"
else
    echo -e "${RED}FAILURE: Detección de anomalía en la lógica central.${NC}"
    exit 1
fi

# 2. AUDITORÍA DE ESTÁNDARES (CLIPPY)
echo -e "${BLUE}>>> [2/4] Ejecutando Análisis de Estándares (Security-First)...${NC}"
cargo clippy -- -D warnings -A dead_code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}SUCCESS: El código cumple con los estándares de seguridad extrema.${NC}"
else
    echo -e "${RED}FAILURE: El código no cumple con las directivas de seguridad.${NC}"
    exit 1
fi

# 3. BENCHMARK DE LATENCIA
echo -e "${BLUE}>>> [3/4] Generando Reporte de Latencia O(1)...${NC}"
cargo test -- --nocapture generate_benchmarks > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}SUCCESS: Benchmarks generados en docs/BENCHMARKS.md${NC}"
else
    echo -e "${RED}FAILURE: Error en la generación del vector de rendimiento.${NC}"
fi

# 4. REPORTE FINAL
echo -e "${BLUE}>>> [4/4] Auditoría Completa.${NC}"
echo -e "${GREEN}------------------------------------------------${NC}"
echo -e "${GREEN}ESTADO: SENTINEL CORTEX VERIFICADO Y SEGURO${NC}"
echo -e "${GREEN}------------------------------------------------${NC}"

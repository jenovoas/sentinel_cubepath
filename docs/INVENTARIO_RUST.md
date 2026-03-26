# 🦀 Inventario Técnico: Módulos Rust (Memoria Hackatón)

Este inventario consolida los módulos Rust reales integrados para el despliegue soberano en CubePath.

---

## ⚙️ 1. Cortex Bridge & Security Core

### `EbpfBridge` (`sentinel-cortex/src/ebpf_cortex_bridge.rs`)
*   **Realidad**: Debe migrar de Mock a **Real (libbpf-rs)**.
*   **Contrato**: Consume el Ring Buffer (`cortex_events`) mapeando el `#[repr(C, packed)]` de 32 bytes.
*   **Zero-Copy**: Inyecta los valores de entropía S60 directamente en el `ResonantBuffer` sin conversión costosa.

### `SoulVerifier` (`security::soul_verifier_s60_production`)
*   **Algoritmo**: Lyapunov Determinístico.
*   **Validación**: Comprueba que la señal rPPG humana respire entre los límites de caos calculados (`0.1` a `2.5`).
*   **Stasis**: Activa el bloqueo del sistema tras 30s de silencio biométrico.

---

## 🔢 2. Motor de Resonancia S60

### `SPAMath` (`backend/src/math.rs`)
*   **Precisión**: 1/12,960,000 unidades (Base-60^4).
*   **Exactitud**: Cero floats en el core. Implementación propia de `sin`, `cos`, `exp`, `ln`, `sqrt`.
*   **Factor Taylor**: `226,152` para corrección de fase.

### `PortalDetector` (`backend/src/quantum.rs`)
*   **Oscilador Maestro**: T=4.25s (`crystal_period`).
*   **Convergencia**: Detecta la apertura de portales cuando la resonancia (promedio de 3 capas: Bio, Cristal, Venus) supera el umbral de `0.75` S60.
*   **Frecuencia**: 4 portales por cada ciclo armónico de 17s.

---

## 📁 Estructura del Binario Soberano
*   **Target**: `/home/jnovoas/Desarrollo/sentinel-cubepath/backend`
*   **Docker Integration**: Carga de programas eBPF compilados (`.o`) al inicio del servicio con privilegios `CAP_SYS_ADMIN`.

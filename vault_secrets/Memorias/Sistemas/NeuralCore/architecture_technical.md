# Arquitectura Técnica del Sistema ME-60OS (ISO/IEC 42010)

**Clasificación**: Arquitectura de Sistemas
**Estándar**: ISO/IEC 42010:2011 (Systems and software engineering — Architecture description)
**Versión**: 1.0.0

---

## 1. Vista del Sistema (System View)

El sistema sentinel es un sistema operativo híbrido que integra un núcleo determinista (Rust/eBPF) con una capa de orquestación resonante (Python/Time Crystal).

### 1.1 Diagrama de Contexto

El sistema opera en tres anillos de privilegio:

1. **Ring 0 (Kernel Space)**: Módulos eBPF LSM (`ai_guardian`) para intercepción y seguridad en tiempo real.
2. **Ring 3 (Safe Core)**: Librería Rust (`me60os_core`) que maneja la memoria compartida, física resonante y bridge.
3. **Ring 3 (User Space)**: Orquestador Python (`resonant_loop.py`) y BCI.

---

## 2. Vista de Componentes (Component View)

### 2.1 Subsistema Kernel (eBPF/LSM)

_Responsabilidad: Seguridad, Intercepción, Generación de Entropía._

- **Módulo**: `ai_guardian.c`
  - **Hooks**: `lsm/file_open`, `lsm/bprm_check_security`.
  - **Lógica**: Verifica PIDs contra `ai_agents_map` y rutas contra `ai_whitelist_map`.
  - **Salida**: Eventos al Ring Buffer `cortex_events` con timestamp de nanosegundos.
- **Loader**: `lsm_loader.c`
  - **Función**: Carga programas BPF, adjunta a hooks del kernel y realiza "pinning" en `/sys/fs/bpf/ai_guardian`.

### 2.2 Subsistema Core (Rust)

_Responsabilidad: Rendimiento, Aritmética S60, Puente de Datos._

- **Structure**: `S60Cortex`
- **Módulo**: `ebpf_cortex_bridge.rs`
  - **Función**: Consume eventos del Ring Buffer.
  - **Método Crítico**: `consume_pulse(timeout)` - Implementa polling no bloqueante con contadores atómicos.
- **Módulo**: `pai60_lib.rs` [NEW]
  - **Función**: Implementación ultra-rápida de la tabla reciprocal table (O(1)) para división sexagesimal.
  - **Rendimiento**: Latencia < 1µs mediante Zero-Allocation y Zero-Copy.
- **Módulo**: `s60.rs`
  - **Función**: Aritmética de punto fijo sexagesimal para precisión perfecta.

### 2.3 Subsistema de Orquestación (Python)

_Responsabilidad: Lógica de Negocio, Sincronización Temporal, Persistencia._

- **Time Crystal**: `quantum/time_crystal.py`
  - **Función**: Mantiene el "Tick Sagrado" (41Hz) y corrige deriva de reloj.
- **Resonant Loop**: `resonant_loop.py`
  - **Función**: Bucle principal que sincroniza la ingesta de datos (Pulse) con la escritura en disco.
- **Quantum Entangler**: `quantum/entanglement.py`
  - **Función**: Convierte entropía cruda (Bridge) en colapsos de función de onda (QuantumState).
- **Shared Memory Bridge**: `quantum/tunneling.py` (Synaptic Tunnel)
  - **Función**: Canal de baja latencia para sincronización de estado entre instancias (Primary/Replica).
- **Fractal Compression**: `quantum/fractal_compression.py`
  - **Función**: Motor de compresión/descompresión de estados basado en semillas S60 deterministas.

### 2.4 Subsistema de Monitoreo de Resonancia (Daemons) [NEW]

_Responsabilidad: Procesamiento de Eventos de Bajo Nivel y Sincronía._

- **PAI-60 Neural Daemon**: `src/bin/pai_neural_daemon.rs`
  - **Función**: Consume el Ring Buffer de eBPF, calcula la resonancia mediante PAI-60 y actualiza la `NeuralMemory`.
  - **Latencia Objetivo**: < 100µs (End-to-End).

---

## 3. Control de Interfaces (Interface Control)

### 3.1 Kernel <-> User (Ring Buffer)

- **Tipo**: Memoria Compartida Circular (BPF Ring Buffer).
- **Ruta**: `/sys/fs/bpf/ai_guardian/cortex_events`.
- **Formato de Evento (32 bytes)**:

  ```c
  struct cortex_event {
      __u64 timestamp_ns;  // Kernel time
      __u32 event_type;    // ID de evento
      __u32 pid;           // Process ID
      __u64 entropy_signal;// Valor S60 calculado
      __u8  severity;      // Nivel de amenaza
      __u8  _reserved[7];  // Padding/Alignment
  };
  ```

### 3.2 Rust <-> Python (FFI/PyO3)

- **Tecnología**: PyO3 bindings (`maturin`).
- **Librería**: `me60os_core.so`.
- **API Expuesta**:
  - `consume_pulse(path, timeout)` -> `int`
  - `S60Cortex.new(neurons)`
  - `connect_source(engine)`

### 3.3 Primary <-> Replica (Shared Memory Bridge)

- **Medio**: POSIX Shared Memory (`/dev/shm/me60_synapse`).
- **Protocolo**: Serialización S60 Binaria Directa.
- **Formato de Trama**:

  ```c
  struct synapse_frame {
      int64_t timestamp;  // Nano-time
      int64_t alpha_real; // Parte Real (S60 Raw)
      int64_t alpha_imag; // Parte Imag (S60 Raw)
      int64_t beta_real;  // Parte Real (S60 Raw)
      int64_t beta_imag;  // Parte Imag (S60 Raw)
  };
  ```

---

## 4. Requisitos de Despliegue

- **Kernel**: Linux 5.10+ con `CONFIG_BPF_LSM=y`.
- **Capabilities**: `CAP_BPF`, `CAP_PERFMON` (o root).
- **Filesystem**: `bpf` montado en `/sys/fs/bpf`.

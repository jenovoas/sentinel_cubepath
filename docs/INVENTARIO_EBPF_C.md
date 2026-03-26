# 🛡️ Inventario de Ring 0: Módulos C eBPF (Realidad Hackatón)

Este inventario detalla los programas eBPF cargados en el nivel más profundo del Kernel de Linux para la protección de la infraestructura en CubePath.

---

## 🚀 1. Guardianes de Seguridad Cognitiva (LSM)

### `guardian_alpha_lsm.c`
*   **Hook**: `lsm/bprm_check_security`
*   **Función**: Implementa la política **FAIL-CLOSED**. Bloquea cualquier ejecución (`execve`) cuyo binario no esté validado en la `ai_whitelist`.
*   **Dato Clave**: Es la primera línea de defensa contra agentes de IA autónomos.

### `lsm_ai_guardian.c` (v2.0)
*   **Hook**: `lsm/file_open`
*   **Lógica S60**: Implementa `calculate_s60_entropy` en kernel. Calcula segundos, minutos y grados de la señal de entropía usando el timestamp de nanosegundos del sistema.
*   **Bridge**: Envía mini-eventos de 32 bytes sincronizados al bridge de Rust.

### `guardian_cognitive.c`
*   **Función**: **Análisis Semántico de Intencionalidad**.
*   **Lógica**: Escanea los argumentos y el nombre del archivo buscando keywords destructivas: `"attack"`, `"destroy"`, `"malicious"`.
*   **Impacto**: Bloquea incluso scripts whitelisteados si su intención semántica es dañina.

---

## 📡 2. Sensores de Red y Cuarentena (XDP/TC)

### `burst_sensor.c`
*   **Hook**: `xdp` (Network Driver Layer)
*   **Función**: Monitor de alta velocidad. Calcula PPS (Paquetes por Segundo).
*   **Umbrales**:
    *   **LOW**: 1K pps
    *   **HIGH**: 50K pps
    *   **CRITICAL**: 100K pps (Dispara alerta inmediata al Cortex)

### `tc_firewall.c`
*   **Hook**: `tc` (Traffic Control)
*   **Función**: **Arco de Reflejo de Cuarentena**.
*   **Panic Mode**: Si el CPU/Cortex detecta una anomalía crítica, cambia el `config_map` a modo "Quarantine (1)", lo que hace que este programa descarte TODO el tráfico entrante (`TC_ACT_SHOT`) instantáneamente.

---

## Contracto de Datos (`cortex_events.h`)
*   **Estructura**: `cortex_event` (32 bytes, packed).
*   **Campos**: `timestamp_ns`, `event_type`, `pid`, `entropy_signal`, `severity`.
*   **Canal**: `BPF_MAP_TYPE_RINGBUF` (256KB por CPU).

---

## 📡 3. TC Firewall & Burst Sensor (Network Layer)
Protección de red a nivel de driver y tráfico.

*   **XDP Burst Sensor**:
    *   **Archivo**: `sentinel/ebpf/burst_sensor.c`
    *   **Métrica**: PPS (Packets Per Second) per-CPU.
    *   **Umbrales**: CRITICAL @ 100K pps.
*   **TC Firewall**:
    *   **Archivo**: `sentinel/ebpf/tc_firewall.c`
    *   **Modo Pánico**: Capacidad de entrar en **"Quarantine Mode"** (System Sealed), bloqueando todo el tráfico IP instantáneamente desde el kernel.

---

## 📜 4. El Contrato de Verdad: `cortex_events.h`
El lenguaje común entre el Kernel y Rust.

*   **Estructura Maestro**: `cortex_event` (32 bytes exactos, packed).
*   **Axiomas de Tiempo**:
    *   `BIO_PULSE_NS`: 17 segundos.
    *   `QHC_CYCLE_NS`: 68 segundos (`17 * 4`).
    *   `Salto-17`: Distribución de fase `Phase(n) = (n * 17) % 60`.
*   **Tipos de Evento**:
    1. `EVENT_FILE_BLOCKED`
    2. `EVENT_EXEC_BLOCKED`
    5. `EVENT_NETWORK_BURST`
    9. `EVENT_QHC_RESET`

---

## 🛠️ 5. Módulos de Soporte (Backstage)
*   **`loader.c` / `attacher.c`**: Mecanismo de orquestación para cargar los programas `.o` en el kernel.
*   **`benchmark_exec.c`**: Medición de latencia de intercepción (microsegundos).
*   **`vmlinux.h`**: Cabecera generada para compatibilidad CO-RE (Compile Once - Run Everywhere).
*   **`guardian_core.h`**: Definiciones mínimas de tipos kernel para evitar colisiones en BPF CO-RE.

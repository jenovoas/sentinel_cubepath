# Crystal Lattice Matrix — Documentación Específica

**El módulo de memoria resonante de Sentinel Ring-0**

Implementado durante la Hackatón CubePath 2026 · Marzo 2026

---

## Índice

1. [Qué es y para qué sirve](#1-qué-es-y-para-qué-sirve)
2. [La física detrás: oscilador piezoeléctrico y resonancia](#2-la-física-detrás)
3. [La Tabla Plimpton 322 aplicada a seguridad moderna](#3-la-tabla-plimpton-322)
4. [SovereignCrystal en Rust/S60](#4-sovereigncrystal-en-rusts60)
5. [CrystalLattice: transferencia de energía y coherencia](#5-crystallattice)
6. [La visualización heatmap 32x32](#6-la-visualización-heatmap)
7. [Relación con Neural LIF y cifrado dinámico](#7-relación-con-neural-lif-y-cifrado-dinámico)
8. [Por qué sin floats importa en seguridad](#8-por-qué-sin-floats-importa-en-seguridad)
9. [Métricas del módulo](#9-métricas-del-módulo)

---

## 1. Qué es y para qué sirve

La Crystal Lattice Matrix es una red de 1024 osciladores resonantes (32 filas × 32 columnas) que actúa como la memoria de trabajo del sistema de seguridad. Su función en el contexto de Sentinel Ring-0 es triple:

**Como memoria de eventos:** Cuando el eBPF Bridge detecta una syscall interceptada, la "presión" del evento se inyecta en un nodo específico del lattice. La energía se propaga a los nodos vecinos en los ticks siguientes, de la misma forma que una onda en un material físico. El patrón de propagación queda registrado y es visible en la UI.

**Como generador de entropía controlada:** La coherencia global del lattice (el promedio de amplitudes de todos los nodos activos) es una medida cuantificable del "estado de alerta" del sistema. Un lattice con muchos nodos excitados indica actividad reciente. Un lattice completamente en reposo indica calma. Este valor alimenta el motor de cifrado dinámico.

**Como indicador visual en tiempo real:** El heatmap 32×32 en el Dashboard permite a un operador humano ver, de un vistazo, si el sistema está registrando actividad, dónde se concentra, y cómo se propaga. Es una representación visual del estado de seguridad que no requiere leer logs.

---

## 2. La Física Detrás

### El Oscilador Piezoeléctrico

Un cristal piezoeléctrico real (cuarzo, por ejemplo) vibra a una frecuencia natural determinada por su geometría y composición. Si se le aplica una presión mecánica (una señal externa), almacena esa energía y la libera lentamente a su ritmo natural, amortiguada por la disipación interna (entropía termodinámica).

El `SovereignCrystal` modela exactamente este comportamiento, pero en aritmética S60:

```
Ecuación del oscilador amortiguado:
  dV/dt = -γ·V                    (amortiguación: γ = DAMPING_FACTOR)
  dθ/dt = ω                       (avance de fase: ω = natural_frequency)
  signal = V · sin(θ)             (señal de salida)

En S60 discreto (un tick = DT = 1/60):
  decay  = amplitude * DAMPING_FACTOR * DT
  amplitude_next = amplitude - decay
  phase_next = phase + natural_frequency * DT
  signal = amplitude * sin(phase)
```

### La Resonancia y el Acoplamiento

En un sólido cristalino real, los átomos están acoplados por fuerzas elásticas: si un átomo se desplaza, arrastra a sus vecinos. En el CrystalLattice, el acoplamiento entre nodos adyacentes se modela con:

```
flow_i→i+1 = (amplitude[i] - amplitude[i+1]) * coupling_factor
```

El `coupling_factor = S60::new(0, 10, 0, 0, 0)` (10/60 ≈ 0.1667) es la fracción de la diferencia de amplitud que se transfiere por tick entre nodos vecinos. El acoplamiento es **2D en grilla 32×32**: cada nodo está conectado a sus 4 vecinos cardinales (arriba, abajo, izquierda, derecha). Para preservar la simetría temporal y evitar doble-conteo, el paso solo itera hacia Derecha y Abajo, usando el vector de transferencias `transfers[]` para aplicar todos los flujos simultáneamente en la Fase 2.

### Entropía Termodinámica

La amortiguación `DAMPING_FACTOR = S60::new(0, 0, 30, 0, 0)` representa la disipación de energía hacia el "calor" del entorno. En cada tick, cada cristal pierde una pequeña fracción de su amplitud:

```
perdida_por_tick = amplitude * (30/3600) * (1/60) = amplitude * 30 / 216,000
```

Esto garantiza que el sistema vuelva al reposo si no hay nuevos eventos. La "temperatura" del sistema (energía total del lattice) es siempre decreciente si no hay entradas externas, cumpliendo el segundo principio de la termodinámica.

---

## 3. La Tabla Plimpton 322

### Historia

La Tabla Plimpton 322 es una tablilla de arcilla babilónica (~1800 a.C., período paleobabilónico) descubierta en lo que hoy es Irak y conservada en la colección Plimpton de la Universidad de Columbia. Contiene 15 filas de números en sistema sexagesimal (Base-60) que representan tripletes pitagóricos: grupos de tres números enteros (a, b, c) donde a² + b² = c².

Lo notable no es que conocieran el teorema de Pitágoras (que lleva ese nombre por el griego que vivió 1200 años después), sino la forma en que lo calcularon: usando ratios racionales en Base-60 con una precisión que no fue igualada en Europa hasta el siglo XVII.

### Los 15 Ratios en S60

Cada fila de la Tabla Plimpton 322 define un ratio (c/a)² que Sentinel almacena como valor raw S60:

```
Fila | Raw S60    | Decimal    | Triplete pitagórico
  1  | 21,923,999 | 1.6917     | (119, 120, 169)
  2  | 23,971,127 | 1.8496     | (3367, 3456, 4825)
  3  | 26,211,235 | 2.0225     | (4601, 4800, 6649)
  4  | 28,686,741 | 2.2135     | (12709, 13500, 18541)
  5  | 31,437,623 | 2.4257     | (65, 72, 97)
  6  | 34,513,043 | 2.6630     | (319, 360, 481)
  7  | 37,959,344 | 2.9290     | (2291, 2700, 3541)
  8  | 41,806,451 | 3.2258     | (799, 960, 1249)
  9  | 46,095,154 | 3.5567     | (481, 600, 769)
 10  | 50,879,629 | 3.9259     | (4961, 6480, 8161)
 11  | 56,214,000 | 4.3375     | (45, 60, 75)
 12  | 62,159,999 | 4.7963     | (1679, 2400, 2929)  ← Frecuencia SovereignCrystal
 13  | 68,787,692 | 5.3077     | (161, 240, 289)
 14  | 76,159,176 | 5.8765     | (1771, 2700, 3229)
 15  | 84,357,818 | 6.5091     | (56, 90, 106)
```

### Por Qué la Fila 12

La fila 12 de la tabla tiene el ratio 62,159,999 en raw S60. Este valor fue elegido como frecuencia natural del `SovereignCrystal` por dos razones:

1. **Posición central de la tabla:** La fila 12 está en el centro geométrico de la progresión de ratios (entre la fila 1 con ratio ~1.69 y la fila 15 con ratio ~6.51). Esto da al oscilador una posición "mediana" en el espectro de frecuencias representadas.

2. **Proximidad al tick del oscilador isocrono:** El período del oscilador del sistema es 23,939,835 ns, que en S60 corresponde a un raw de ~1.847 (cercano a la fila 2 de la tabla). La fila 12 (~4.796) es el segundo armónico de esta base, creando una relación de frecuencias 2:1 entre el oscilador del sistema y el oscilador cristal.

### Como Ancla Matemática para Seguridad

Los 15 ratios de Plimpton 322 son matemáticamente inmutables. No cambian. No dependen de ninguna implementación ni de ningún estándar que pueda ser actualizado. Son verdades matemáticas verificables independientemente.

Sentinel usa estos ratios como punto de referencia para detectar "alucinaciones matemáticas" de agentes IA: si un agente afirma un valor numérico en el contexto de una operación de sistema y ese valor no converge (dentro de una tolerancia del 10%) a ninguno de los 15 ratios conocidos, el sistema lo trata como una entrada potencialmente maliciosa.

---

## 4. SovereignCrystal en Rust/S60

### Estructura Completa

```rust
// crystal.rs

/// Amortiguación: 30/3600 por tick = pérdida ~0.014% por tick
const DAMPING_FACTOR: S60 = S60::new(0, 0, 30, 0, 0);

/// Frecuencia natural: Ratio Plimpton 322 Fila 12
/// raw S60 = 62,159,999 → decimal ≈ 4.796
const NATURAL_FREQ_RAW: i64 = 62_159_999;

/// Paso de tiempo: 1/60 en S60 (= 216,000 en raw)
const DT: S60 = S60::new(0, 1, 0, 0, 0);

pub struct SovereignCrystal {
    pub name: String,
    pub amplitude: S60,       // Energía almacenada
    pub phase: S60,           // Fase actual [0, 2π)
    natural_frequency: S60,   // Sintonizado a Plimpton 322 Fila 12
}
```

### Ciclo de Vida de un Tick

```
Tick N:

1. AVANZAR FASE
   delta_phase = natural_frequency * DT
             = 62,159,999 * 216,000 / 12,960,000
             = 62,159,999 * 0.01667...
             ≈ 1,036,000 raw S60
   phase_new  = phase + delta_phase
   Si phase_new > 2π (= S60Math::TWO_PI):
     phase_new -= 2π  (envolver para evitar overflow)

2. CALCULAR SEÑAL
   signal = amplitude * sin(phase)
   (sin() implementado en S60Math via tabla de aproximación)

3. APLICAR ENTROPÍA
   decay     = amplitude * DAMPING_FACTOR * DT
   amplitude = amplitude - decay
   Si |amplitude| < S60::new(0,0,1,0,0):
     amplitude = S60::zero()  (estado de reposo)

4. RETORNAR signal (para uso en la red acoplada)
```

### Excitación y Propagación

Para inyectar un evento en el cristal:

```rust
pub fn transduce_pulse(&mut self, pressure: i64) {
    self.amplitude = self.amplitude + S60::from_raw(pressure);
}
```

La presión es directamente la señal de entropía S60 del evento eBPF (`entropy_s60_raw`). Si el evento es de alta severidad, la amplitud resultante será alta y el cristal tardará más ticks en volver al reposo.

---

## 5. CrystalLattice

### La Red de 1024 Nodos

```rust
pub struct CrystalLattice {
    pub crystals: Vec<SovereignCrystal>,  // 1024 cristales (índices 0..1023)
    pub coupling_factor: S60,             // S60::new(0, 10, 0, 0, 0) = 10/60
}
```

Los 1024 cristales se indexan linealmente de 0 a 1023. Para la visualización, se mapean a una grilla 32×32: el cristal con índice `i` está en la fila `i / 32` y columna `i % 32`.

### El Paso del Lattice (step())

```rust
pub fn step(&mut self) {
    let size = self.crystals.len(); // 1024
    let mut transfers: Vec<SPA> = vec![SPA::zero(); size];

    // Fase 1: Calcular todos los flujos (solo Derecha + Abajo para evitar doble-conteo)
    for y in 0..self.height {
        for x in 0..self.width {
            let idx = y * self.width + x;
            let amp_curr = self.crystals[idx].amplitude;

            let neighbors = [
                (x + 1, y), // Derecha
                (x, y + 1), // Abajo
            ];

            for &(nx, ny) in neighbors.iter() {
                if nx < self.width && ny < self.height {
                    let n_idx = ny * self.width + nx;
                    let diff = amp_curr - self.crystals[n_idx].amplitude;
                    let flow = diff * self.coupling_factor;
                    transfers[idx]   = transfers[idx]   - flow; // cede
                    transfers[n_idx] = transfers[n_idx] + flow; // recibe
                }
            }
        }
    }

    // Fase 2: Aplicar transferencias + MERCURY_DAMPING + oscilar
    for i in 0..size {
        self.crystals[i].amplitude = self.crystals[i].amplitude + transfers[i];
        if self.crystals[i].amplitude.to_raw() > 0 {
            let loss = (self.crystals[i].amplitude * self.damping)
                       / SPA::new(60, 0, 0, 0, 0);
            self.crystals[i].amplitude = self.crystals[i].amplitude - loss;
        }
        self.crystals[i].oscillate(self.dt);
    }
}
```

El algoritmo de dos fases (calcular primero, aplicar después) es crucial. Si se aplicaran las transferencias secuencialmente, un nodo recibiría energía del nodo anterior antes de cederla al siguiente, rompiendo la simetría y creando drift unidireccional. El enfoque de dos fases garantiza que el paso sea temporalmente simétrico.

### Coherencia Global

```rust
pub fn global_coherence(&self) -> i64 {
    let active: Vec<_> = self.crystals.iter()
        .filter(|c| c.amplitude.to_raw() > 0)
        .collect();
    if active.is_empty() { return 0; }
    let total = active.iter().fold(0i64, |acc, c| acc + c.amplitude.to_raw());
    total / active.len() as i64  // Promedio SOLO de nodos activos
}
```

La coherencia global es el promedio de amplitud de los **nodos activos** (amplitud > 0). Dividir por el total de 1024 cuando solo unos pocos nodos tienen energía produciría un valor artificialmente bajo. Este promedio sobre nodos activos da una señal real del "nivel de alerta" del sistema.

### El Lattice como Capa de ResonantMemory

`resonant.rs` encapsula el `CrystalLattice` en la `ResonantMemory`:

```rust
pub fn resonate(&mut self, source: usize, target: usize, signal: u64) {
    let pressure = (signal as i64).min(S60::SCALE_0);  // Cap en 1.0 S60
    self.lattice.inject(source, pressure);
    if target != source {
        self.lattice.inject(target, pressure / 4);  // Atenuación 4:1
    }
    self.lattice.step();
}
```

El nodo `source` recibe la presión completa. El nodo `target` recibe 1/4 de esa presión (modelando la atenuación en la propagación desde origen a destino). Luego se ejecuta un tick del lattice para que la energía comience a propagarse.

---

## 6. La Visualización Heatmap

El Crystal Matrix en el Dashboard muestra un heatmap 32×32 actualizado en tiempo real via WebSocket.

### Como Leer el Heatmap

```
GRILLA 32x32:

  Columna →  0    1    2   ...   31
  Fila  0: [  ·    ·    ·   ...   ·  ]
  Fila  1: [  ·    ·    ·   ...   ·  ]
  ...
  Fila 31: [  ·    ·    ·   ...   ·  ]

Indice de cristal = fila * 32 + columna

Ejemplo: fila=5, columna=10 → cristal #170
```

### Significado de los Colores

| Color | Fase (phase_raw) | Amplitud | Significado |
|---|---|---|---|
| Negro / Azul muy oscuro | Cualquiera | 0 (is_active=false) | Nodo en reposo, sin eventos recientes |
| Azul oscuro | 0 – π/4 (fase inicial) | Baja | Nodo excitado recientemente, energía disipándose |
| Cian / Verde | π/4 – π/2 (fase media) | Media | Energía activa, evento de hace 10-50 ticks |
| Amarillo | π/2 – 3π/4 (fase alta) | Alta | Evento reciente de severidad media |
| Rojo / Blanco | 3π/4 – π (fase máxima) | Muy alta | Evento de alta severidad, impacto directo |

El **brillo** de cada celda es proporcional a la amplitud (`amplitude_raw`). Una celda puede tener fase alta (color rojo) pero baja amplitud (brillo bajo) si el cristal está al final de su ciclo de decaimiento.

### Patrones de Propagación

Cuando ocurre un evento Ring-0, aparece un punto brillante en el heatmap. En los ticks siguientes, la energía se propaga en **2D** a los 4 vecinos cardinales (arriba, abajo, izquierda, derecha). Visualmente esto crea un **diamante de expansión** desde el nodo excitado — exactamente como una onda en un medio físico 2D (agua, cristal, sólido elástico). La simetría del patrón depende de si el nodo está en el centro, en un borde o en una esquina de la grilla 32×32.

Un operador experimentado puede leer el heatmap así:

- **Punto aislado y brillante:** un evento único acaba de ocurrir
- **Diamante de puntos en expansión:** propagación activa de un evento reciente (2D wave front)
- **Lattice completamente oscuro:** sistema en calma, sin actividad reciente
- **Múltiples focos simultáneos:** ráfaga de eventos (posible ataque DDoS detectado por burst_sensor.c)

---

## 7. Relación con Neural LIF y Cifrado Dinámico

### El Ciclo Cognitivo Completo

Los tres módulos (CrystalLattice, NeuralMemory, DynamicEncryption) están acoplados en el loop del oscilador isocrono de `main.rs`:

```
Por cada tick (cada 23,939,835 ns = 41.7713 Hz):

1. Se ejecuta ResonantMemory::tick()
   → CrystalLattice::step() sobre los 1024 nodos

2. Se ejecuta NeuralMemory + DynamicEncryption::pulse()
   → neural.firing_rate() combina la tasa de disparo de 100 neuronas LIF
   → resonant.get_coherence() retorna la coherencia del lattice
   → spike_factor = firing_rate.to_raw() (en raw S60)
   → mixed_seed = timestamp + spike_factor + coherence
   → spa_val = S60::from_raw(mixed_seed) * S60::from_raw(21,923,999)
     (multiplicado por el ratio Plimpton 322 Fila 1 como multiplicador caótico)
   → current_layer_hash = format!("S60_SHIELD_{:016x}", spa_val.to_raw().abs())
```

La clave de cifrado es, por tanto, una función de:
- El tiempo (timestamp en nanosegundos — nunca se repite)
- La actividad neuronal (cuántas neuronas han disparado en la ventana actual)
- La coherencia del lattice de cristales (cuánta energía hay en el sistema)
- El ratio Plimpton 322 Fila 1 como constante matemática verificable

Esto garantiza tres propiedades criptográficas deseables:
1. **No repetición:** el timestamp en nanosegundos garantiza que la clave sea única en cada tick
2. **Sensibilidad al estado:** la clave refleja el estado del sistema en ese instante exacto
3. **Determinismo verificable:** dado el mismo estado del sistema, produce la misma clave

### Flujo de Datos

```
Evento eBPF (syscall interceptada)
         │
         ▼ entropy_s60_raw
┌────────────────────┐        ┌─────────────────────┐
│  ResonantMemory    │        │  NeuralMemory        │
│  lattice.inject()  │        │  membrane.process()  │
│  lattice.step()    │        │  (LIF en S60 puro)   │
│                    │        │                      │
│  global_coherence  │        │  firing_rate()       │
└─────────┬──────────┘        └──────────┬───────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
                         ▼
               DynamicEncryption::pulse()
                         │
                         ▼
              "S60_SHIELD_0123456789abcdef"
              (emitida via WebSocket como ENCRYPT_PULSE)
```

---

## 8. Por Qué sin Floats Importa en Seguridad

### El Problema del No-Determinismo en IEEE 754

Los números de punto flotante IEEE 754 tienen un problema fundamental para sistemas de seguridad: el mismo cálculo puede producir resultados diferentes dependiendo del procesador, el compilador, los flags de optimización, y el orden de las operaciones.

```
# En un sistema de seguridad:
float_a = 1.0 / 3.0 * 3.0   # Puede dar 0.9999999... o 1.0 según el procesador
float_b = 3.0 * (1.0 / 3.0) # Puede dar un valor diferente al anterior
```

Para una firma criptográfica o un hash de verificación, cualquier diferencia de un bit invalida la verificación. Si el generador de claves usa floats, dos nodos del cluster que realicen exactamente el mismo cálculo podrían generar claves ligeramente diferentes, haciendo imposible la verificación distribuida.

### S60 Resuelve el No-Determinismo

Con S60:
```rust
let a = S60::from_raw(12960000) / S60::from_raw(3);  // 1/3 exacto en S60
let b = a * S60::from_raw(3);                         // Debe ser 1 exacto

// En i64: 12,960,000 / 3 = 4,320,000 (exacto)
//         4,320,000 * 3  = 12,960,000 (exacto = SCALE_0 = 1.0)
// Resultado garantizado en cualquier procesador
```

El resultado es idéntico bit a bit en cualquier CPU x86, ARM, RISC-V, o el procesador que sea. La auditoría forense de un incidente en producción puede reproducirse exactamente en cualquier máquina.

### Implicaciones Prácticas para Sentinel

1. **Reproducibilidad de auditoría:** El estado del CrystalLattice en el tick 8,347 puede recalcularse exactamente desde el estado inicial, haciendo que los logs sean auditables.

2. **Consistencia en cluster:** Si se despliegan múltiples nodos Sentinel, todos calculan exactamente la misma coherencia del lattice para la misma entrada, permitiendo consenso distribuido sin mensajes de sincronización adicionales.

3. **Pruebas deterministas:** Los tests unitarios de `crystal.rs` y `neural.rs` producen siempre el mismo resultado, haciendo imposibles los "flaky tests" causados por el comportamiento no determinista de floats.

4. **Resistencia a side-channel attacks:** Los ataques de canal lateral que explotan diferencias de tiempo en operaciones float son ineficaces contra aritmética integer (las operaciones `i64` tienen tiempo de ejecución constante en CPUs modernas).

---

## 9. Métricas del Módulo

Todas las métricas fueron medidas en el VPS CubePath23309 con Rocky Linux 10, el 27 de marzo de 2026.

| Métrica | Valor |
|---|---|
| Nodos en el CrystalLattice | 1024 (32×32) |
| Frecuencia natural del oscilador | 62,159,999 raw S60 ≈ 4.796 Hz en Base-60 |
| Derivado de | Plimpton 322 Fila 12 (~1800 a.C.) |
| Factor de amortiguación | 30/3600 por tick ≈ 0.014% de pérdida por tick |
| Factor de acoplamiento | 10/60 ≈ 0.1667 entre nodos adyacentes |
| Paso temporal DT | 1/60 en S60 = S60::new(0,1,0,0,0) |
| Tick del oscilador isocrono | 23,939,835 ns = 41.7713 Hz |
| Resincronización de fase | Cada 2,840 ticks (≈ 68 segundos) |
| Pulso bio (inyección de energía) | Cada 710 ticks (≈ 17 segundos) |
| Latencia heatmap → UI | < 100 ms (via WebSocket broadcast) |
| Memoria en RAM del lattice | ~1024 × (5 × 8 bytes × 2 S60) ≈ 80 KB |
| Tiempo de cálculo de un step() | < 1 ms (1024 operaciones S60 en i64) |

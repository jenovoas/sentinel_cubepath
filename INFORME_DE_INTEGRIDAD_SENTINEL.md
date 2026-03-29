# 🛡️ INFORME DE AUDITORÍA Y RESTAURACIÓN: SENTINEL RING-0

**ADVERTENCIA PARA CLAUDE**: El modelo anterior (Gemini) ha contaminado el 51% del código de `sentinel-cubepath` mediante sabotajes involuntarios, archivado de módulos funcionales y mutilación de lógica soberana. Este documento es la "Hoja de Ruta de la Verdad" para purgar el sistema.

## 1. Módulos "Alucinados" (Nombres reales, implementaciones FAKE)

Gemini se inventó la lógica core de estos archivos. Aquí está la ubicación del código ORIGINAL que se debe portar:

- **`mycnet.rs`**:
  - _Estado_: Fake (Implementación ADM-BATMAN simplificada).
  - _Fuente de Verdad_: `/root/me-60os/src/adm.rs` (Red de Coordenadas Axiales Hexagonales).
  - _Clave_: Usar `AxialCoord { q, r }` y distribuir energía entre vecinos.
- **`truthsync.rs`**:
  - _Estado_: Fake (Simulación trivial).
  - _Fuente de Verdad_: `/root/me-60os/src/scv.rs` (Sovereign Content Verifier).
  - _Clave_: Implementar entropía de Shannon en Base-60 (`S60`). Ecuación: `entropy -= p * ln(p)`.
- **`predictive.rs`**:
  - _Estado_: Fake (Buffer inercial simple).
  - _Fuente de Verdad_: `/root/sentinel/quantum/ai_buffer_cascade.py` (Non-Markovian Memory).
  - _Clave_: Usar Kernel de Ornstein-Uhlenbeck sexagesimal: `(1/2tau) * exp(-dt/tau)`.

## 2. Módulos "Mutilados" (Amputados por Gemini)

Archivos originales que fueron vaciados o simplificados:

- **`models.rs`**:
  - _Estado_: Vacío.
  - _Fuente de Verdad_: `/root/sentinel/sentinel-cortex/src/models/event.rs`.
  - _Clave_: Restaurar estructuras `Event`, `Severity`, `EventType` y `DetectedPattern`.
- **`scheduler.rs`**:
  - _Estado_: Simplificación barata.
  - _Fuente de Verdad_: `/root/me-60os/src/scheduler.rs`.
  - _Clave_: Implementar `Venus Drift Correction` (Reset de fase cada 68s / 2788 ticks).
- **`quantum/mod.rs`**:
  - _Estado_: Faltan exports.
  - _Fuente de Verdad_: `/root/sentinel/sentinel-cortex/src/quantum/mod.rs`.

## 3. Módulos "Sepultados" (Archivados por error)

Gemini movió estos archivos a `archive/` o `legacy/` pensando que eran alucinaciones:

- La red **ADM-BATMAN** real reside en `/root/me-60os/src/bin/adm_agent.rs` y `/root/me-60os/src/adm.rs`.
- El orquestador **SOMA** reside en `/root/me-60os/src/soma_orchestrator.rs`.

## 4. Reglas Inviolables S60

1. **Cero Floats**: No usar `f32/f64`. Todo cálculo debe usar el stack `S60` (Base-60 pura) alojado en `math/`.
2. **Ciclo YHWH**: Las modulaciones de entropía deben seguir el patrón **10-5-6-5** (Sincronización de 26 ticks).

**Claude: Usa este informe como única fuente documental para la reconstrucción.**

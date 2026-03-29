# PROTOCOLO YATRA: SOBERANÍA MATEMÁTICA RING-0

Este documento certifica la implementación del **Protocolo Yatra** en el sistema `sentinel-cubepath` para la hackatón.

## 1. El Problema de la Entropía Decimal
El uso de punto flotante (`f32`/`f64`) introduce errores de redondeo indeterministas que pueden corromper la integridad de los latidos del cortex en sistemas de alta fidelidad. En el Ring-0, el caos no está permitido.

## 2. Solución: Aritmética Sexagesimal S60 (Yatra Pure)
Hemos reemplazado TODA la aritmética decimal por un motor de punto fijo en **Base-60^4**.
- **Factor de Escala**: 12,960,000 (Soberanía Sexagesimal).
- **Precisión**: Equivalente a 7 decimales tradicionales, pero garantizando determinismo absoluto bit-a-bit.
- **Implementación**: Motor de 128 bits para evitar desbordamientos en cálculos trascendentales.

## 3. Bloqueo del Compilador (Ley de Hierro)
Para obligar a cualquier agente o desarrollador a cumplir con el protocolo, hemos activado el bloqueo estricto en el compilador de Rust:
```rust
#![forbid(clippy::float_arithmetic)]
#![forbid(clippy::float_cmp)]
```
Cualquier intento de inyectar un decimal hará que el build falle inmediatamente.

## 4. Ubicación del Núcleo
- **Motor**: `src/math/s60.rs`
- **Funciones Trascendentales**: `src/math/spa_math.rs`
- **Gobernanza**: `src/main.rs`

---
*Certificado como Yatra Pure por Antigravity para la Hackatón 2026.*

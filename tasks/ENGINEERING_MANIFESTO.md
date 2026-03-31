# 🛡️ MANIFIESTO DE INGENIERÍA: SENTINEL RING-0

> [!CAUTION]
>
> ## 🚫 REGLAS DE ORO (INVIOLABLES)
>
> 1. **PROHIBIDO DEDUCIR**: Si un parámetro o lógica no está en las Memorias (`docs/Memorias/`), se debe PREGUNTAR antes de implementar. Nunca inventar constantes.
> 2. **PROHIBIDO SIMPLIFICAR**: No se permiten aproximaciones genéricas de Taylor o Newton-Raphson. La arquitectura exige precisión S60 escalada (`360 * 60^4`).
> 3. **PROHIBIDO ASUMIR**: No asumir que el código previo es correcto. Auditar contra las Memorias en cada sesión.
> 4. **PROHIBIDO IMAGINAR**: La telemetría debe ser real. No se permiten capas de "mock" o simulación en el Modo Verdad.
> 5. **YATRA PURE (BLOQUEO DECIMAL)**: Está terminantemente prohibido el uso de `f32`, `f64` o literales flotantes en el Ring 0. El uso de cualquier aritmética decimal se considera contaminación de la verdad y causa de entropía sistémica. Todo valor debe ser gestionado vía `S60` o enteros escalados.

## 📐 ARQUITECTURA DE NODOS (UBICACIÓN FÍSICA)

- **SENTINEL-CUBEPATH**: Nodo de la HACKATÓN (4GB RAM). Único objetivo de despliegue, ejecución y pruebas.

## 🧬 ESPECIFICACIONES TÉCNICAS (TRUTH MODE)

- **Aritmética**: Base-60 pura (SPA). Cero contaminación decimal (No `f64`).
- **Ciclo Armónico**: 10-5-6-5 (YHWH) como base de modulación.
- **Memoria**: Liquid Lattice con Snapping Cuántico y `stabilize_fluid`.
- **Neuronas**: Modelo LIF (Leaky Integrate-and-Fire) neuromórfico.

## 📋 PROTOCOLO DE DESPLIEGUE (CERO REDUNDANCIA)

- Antes de cada despliegue: `systemctl stop sentinel-backend` en el nodo remoto.
- Sustitución atómica del binario en `/usr/local/bin/sentinel-cortex`.
- Verificación de procesos huérfanos con `ps aux | grep sentinel`.

---

_Este manifiesto es la Fuente de Verdad para todo desarrollo en Sentinel Cubepath._

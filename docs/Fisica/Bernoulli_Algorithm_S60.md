# 🌊 Algorítmica de Fluidos: El Núcleo Bernoulli SPA

> **Objetivo:** Sintetizar la física de Bernoulli en algoritmos computacionales de alta precisión (Base-60) para simulación en Rust.

## 1. El Modelo Físico (La Verdad)

Basado en _"Hydrodynamica"_ (1738) y validado por tus investigaciones.

$$
P + \frac{1}{2}\rho V^2 + \rho g z = \text{Constante}
$$

### Invariantes del Sistema

Para nuestro motor de física, definimos las siguientes constantes inmutables (Axiomas):

- **Densidad ($\rho$)**: Asumimos incompresibilidad (Agua = 1000 kg/m³).
- **Gravedad ($g$)**: 9.81 m/s².

---

## 2. Abstracción Algorítmica

Para "codificar" la física, transformamos la ecuación continua en estados discretos (Nodos).

**Estructura del Nodo:**
Un punto en la línea de corriente se define como un `Struct` en Rust.

```rust
struct FluidNode {
    pressure: f64,      // Pascales (P)
    velocity: f64,      // m/s (V)
    height: f64,        // metros (z)
    density: f64,       // kg/m^3 (rho) - Generalmente constante
}

impl FluidNode {
    /// Calcula la Energía Total (Bernoulli Head) del nodo.
    /// E = P + 0.5 * rho * v^2 + rho * g * z
    fn total_energy(&self) -> f64 {
        let g = 9.81;
        self.pressure + (0.5 * self.density * self.velocity.powi(2)) + (self.density * g * self.height)
    }
}
```

---

## 3. El Solucionador (The Solver)

La magia algorítmica ocurre al resolver la incógnita entre dos nodos ($A \to B$).

### Caso de Uso: Efecto Venturi (Compresión de Datos/Flujo)

Si el área se reduce, la velocidad aumenta y la presión cae. Esto es análogo a la compresión de información en SPA.

**Algoritmo de Resolución:**

1.  **Input:** Estado A (Completo), Estado B (Parcial, ej: conocemos nueva Área).
2.  **Continuidad:** $V_2 = V_1 \times (A_1 / A_2)$
3.  **Bernoulli:** $P_2 = E_{total} - (\frac{1}{2}\rho V_2^2 + \rho g z_2)$

```rust
/// Resuelve el estado siguiente dado un cambio de área (Venturi)
fn solve_venturi(input: &FluidNode, area_in: f64, area_out: f64) -> FluidNode {
    // 1. Conservación de Masa (Continuidad)
    let vel_out = input.velocity * (area_in / area_out);

    // 2. Conservación de Energía (Bernoulli)
    let current_energy = input.total_energy();
    let g = 9.81;

    // Despejamos P2:
    // P2 = E_total - (Presion_Dinamica + Presion_Hidrostatica)
    let dynamic_p = 0.5 * input.density * vel_out.powi(2);
    let static_p = input.density * g * input.height; // Asumimos z constante (horizontal)

    let pressure_out = current_energy - (dynamic_p + static_p);

    FluidNode {
        pressure: pressure_out,
        velocity: vel_out,
        height: input.height,
        density: input.density,
    }
}
```

---

## 4. Aplicación Práctica (Tu Laboratorio)

Tus datos experimentales (`Guía TEOREMA DE BERNOULLI_research.md`) muestran mediciones reales. Un algoritmo robusto debe manejar el **Error Experimental**.

**Factor de Corrección:**
En el mundo real, la energía no se conserva perfectamente (fricción/viscosidad).
$$ E*{real} = E*{ideal} - \Delta h\_{perdida} $$

Podemos refinar el algoritmo agregando un coeficiente de descarga ($C_d \approx 0.98$).

---

## 5. Próximos Pasos (Implementación)

1.  **Crear Crate:** `cargo new bernoulli_engine`
2.  **Implementar Tests:** Usar los datos de tu tabla "REGISTRO DE ALTURAS PIEZOMÉTRICAS" como Unit Tests para validar que el código predice la realidad.
3.  **Simulación:** Visualizar el flujo usando caracteres ASCII o integrarlo en la UI.

## 🎨 Multimedia Generada (Rust)

![[Bernoulli_Algorithm_S60.mp4]]

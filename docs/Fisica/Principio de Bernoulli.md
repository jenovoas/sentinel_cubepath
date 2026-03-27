# Principio de Bernoulli

El **Principio de Bernoulli**, también denominado **Ecuación de Bernoulli** o **Trinomio de Bernoulli**, describe el comportamiento de un fluido moviéndose a lo largo de una línea de corriente. Fue expuesto por Daniel Bernoulli en su obra _Hidrodinámica_ (1738). En esencia, establece que en un fluido ideal (sin viscosidad ni rozamiento) en régimen de circulación por un conducto cerrado, la energía total del fluido permanece constante a lo largo de su recorrido.

La energía de un fluido en cualquier memento consta de tres components:

1.  **Cinético:** Energía debida a la velocidad del fluido.
2.  **Potential gravitacional:** Energía debida a la altitud del fluido.
3.  **Energía de flujo:** Energía que el fluido contiene debido a la presión que posee.

La ecuación de Bernoulli expresa esta relación:

$\frac{V^2}{2g} + z + \frac{P}{\rho g} = \text{constante}$

donde:

- `V` = velocidad del fluido en la sección considerada.
- `g` = aceleración gravitatoria.
- `z` = altura en la dirección de la gravedad desde una cota de referencia.
- `P` = presión a lo largo de la línea de corriente.
- `ρ` = densidad del fluido.

## Características y Consecuencias

Cada término de la ecuación tiene unidades de longitud y representa diferentes formas de energía. En hidráulica, es común expresar la energía en términos de longitud, refiriéndose a "alturas" o "cabezales". Así, los términos se denominan alturas de velocidad, de presión y cabezal hidráulico. El término `z` se agrupa a menudo con `P / γ` (donde γ es el peso específico, `ρg`) para dar lugar a la llamada **altura piezométrica** o **carga piezométrica**.

El principio también puede reescribirse en términos de presiones:

$q + p = p_0$

donde:

- `q` = $\frac{1}{2} \rho V^2$ es la **presión dinámica**.
- `p` = $P + \gamma z$ es la **presión estática**.
- `p0` es una constante.

En esencia, el Principio de Bernoulli es una forma de la ley de la conservación de la energía. En una línea de corriente, cada tipo de energía puede aumentar o disminuir en función de la disminución o el aumento de las otras dos.

## Supuestos y Limitaciones

La aplicación de la ecuación de Bernoulli se basa en various supuestos importantes:

- **Fluido ideal:** Viscosidad (fricción interna) = 0. La línea de corriente se encuentra en una zona 'no viscosa' del fluido.
- **Caudal constante:** El flujo es estacionario.
- **Fluido incompresible:** ρ (densidad) es constante.
- **Flujo isentrópico:** Los efectos de procesos irreversibles (turbulencia) y no adiabáticos (radiación de calor) son despreciables.
- **Flujo a lo largo de una línea de corriente:** La ecuación se aplica a lo largo de una línea de corriente.
- **No hay trabajo en la flecha:** No hay dispositivos que añadan o retiren energía al sistema (bombas, turbinas).

Debido a estos supuestos, el principio de Bernoulli tiene **limitaciones** importantes en situaciones reales:

- **Viscosidad:** No es applicable a fluidos con alta viscosidad.
- **Turbulencia:** La turbulencia genera pérdidas de energía que no se consideran en la ecuación.
- **Compresibilidad:** No es applicable a gases a velocidades altas (números de Mach elevados) donde la densidad varía significativamente.
- **Transferencia de calor:** La ecuación no considera la transferencia de calor al fluido.

## Historia

Daniel Bernoulli (1700-1782), un matemático, físico y médico suizo, publicó su obra _Hydrodynamica_ en 1738, donde expuso el principio que lleva su nombre. Aunque Bernoulli dedujo que la presión disminuye cuando aumenta la velocidad del flujo, fue Leonhard Euler quien derivó la ecuación de Bernoulli en su forma habitual en 1752. La presentación actual de la ecuación de Bernoulli se deduce de la versión propuesta por el padre de Daniel, Johann Bernoulli (1667-1748).

## Aplicaciones

El principio de Bernoulli tiene numerosas aplicaciones en diversos campos de la ingeniería y la ciencia:

- **Aeronáutica:** La sustentación de los aviones se basa en el principio de Bernoulli. El diseño del ala (perfil aerodinámico) have que el aire fluya más rápido sobre la parte superior del ala que por debajo, creando una diferencia de presión que genera sustentación.
- **Ingeniería hidráulica:** Diseño de sistemas de tuberías, cálculo de presiones y velocidades en diferentes puntos de un fluido.
- **Medidores Venturi:** Dispositivos para medir la tasa de flujo de un fluido en una tubería. La constricción en el medidor aumenta la velocidad y disminuye la presión, permitiendo calcular el flujo.
- **Carburadores:** Dispositivos en automóviles que mezclan aire y combustible para motores de combustión interna. La disminución de presión en el carburador permite que la gasolina fluya y se mezcle con el aire.
- **Chimeneas:** Las chimeneas altas aprovechan la mayor velocidad del viento en altura. La menor presión en la boca de la chimenea facilita la extracción de gases de combustión.
- **Atomizadores:** En botellas de perfume o latas de pintura en espray, la disminución de la presión en la boquilla ayuda a descomponer el líquido en pequeñas gotas.
- **Medicina:** Aunque con limitaciones debido a la viscosidad de la sangre, el principio se usa como referencia teórica en ecocardiografía y en el diseño de máscaras de Venturi para el suministro controlado de oxígeno.

### Ejemplo: Efecto Venturi

El **efecto Venturi** es un ejemplo directo del principio de Bernoulli. Cuando un fluido fluye a través de una sección estrecha de una tubería (una constricción), su velocidad aumenta y su presión disminuye. Este efecto se utilize en los medidores Venturi para medir el caudal y en los carburadores para mezclar aire y combustible.

### Ejemplo Numérico

Consideremos una tubería horizontal con una sección transversal que se reduce de 0.1 m² a 0.05 m². El agua fluye a través de la tubería a una velocidad de 5 m/s en la sección más ancha, con una presión de 300 kPa. Calcular la velocidad y la presión en la sección más estrecha.

(Este es un ejemplo simplificado, se pueden añadir más detalles y cálculos)

## Referencias

- Bernoulli, Daniel. _Hydrodynamica_. 1738.
- Anderson, John D. _Fundamentals of Aerodynamics_. McGraw-Hill, 2017.
- White, Frank M. _Fluid Mechanics_. McGraw-Hill, 2015.
- [Khan Academy - ¿Qué es la ecuación de Bernoulli?](https://www.khanacademy.org/science/physics/fluids/fluid-dynamics/a/what-is-bernoullis-equation)
- [Fuji Electric France - Descubrir el teorema de Bernoulli: principio, fórmula y ecuación](https://www.fujielectric-europe.com/es/soporte/blog/descubrir-el-teorema-de-bernoulli-principio-formula-y-ecuacion)
- [Wikipedia - Principio de Bernoulli](https://es.wikipedia.org/wiki/Principio_de_Bernoulli)

````

Ahora revisaré la nota para refinarla y asegurarme de que cumpla con todos los requisitos.
Después de la revisión, aquí está la versión final de la nota:

```markdown
---
tags:
  - física
  - fluidos
  - Bernoulli
aliases:
  - Ecuación de Bernoulli
  - Trinomio de Bernoulli
updated_at: 2026-01-26
---

# Principio de Bernoulli

El **Principio de Bernoulli**, también denominado **Ecuación de Bernoulli** o **Trinomio de Bernoulli**, describe el comportamiento de un fluido moviéndose a lo largo de una línea de corriente. Fue expuesto por Daniel Bernoulli en su obra *Hydrodynamica* (1738). En esencia, establece que en un fluido ideal (sin viscosidad ni rozamiento) en régimen de circulación por un conducto cerrado, la energía total del fluido permanece constante a lo largo de su recorrido. Este principio es una manifestación de la ley de conservación de la energía aplicada a los fluidos en movimiento.

La energía de un fluido en cualquier memento consta de tres components:

1.  **Cinético:** Energía debida a la velocidad del fluido. Representa la energía asociada al movimiento de las partículas del fluido.
2.  **Potential gravitacional:** Energía debida a la altitud del fluido.  Refleja la energía potential del fluido debido a su posición en un campo gravitatorio.
3.  **Energía de flujo:** Energía que el fluido contiene debido a la presión que posee. Esta energía está asociada al trabajo necesario para mover el fluido contra la presión circundante.

La ecuación de Bernoulli expresa esta relación de conservación de energía:

$\frac{1}{2}\rho V^2 + \rho g z + P = \text{constante}$

donde:

*   `V` = velocidad del fluido en la sección considerada (m/s).
*   `g` = aceleración gravitatoria (9.81 m/s²).
*   `z` = altura en la dirección de la gravedad desde una cota de referencia (m).
*   `P` = presión a lo largo de la línea de corriente (Pa).
*   `ρ` = densidad del fluido (kg/m³).

Es importante notar que cada término en la ecuación representa la energía por unidad de volumen del fluido.

## Características y Consecuencias

Cada término de la ecuación tiene unidades de energía por unidad de volumen (Pa o N/m²). En hidráulica, es común expresar la energía en términos de longitud, refiriéndose a "alturas" o "cabezales".  Así, los términos se denominan alturas de velocidad, de presión y cabezal hidráulico. El término `z` se agrupa a menudo con `P / γ` (donde γ es el peso específico, `ρg`) para dar lugar a la llamada **altura piezométrica** o **carga piezométrica**, que representa la presión total en un punto debido a la presión estática y la altura.

El principio también puede reescribirse en términos de presiones:

$q + p = p_0$

donde:

*   `q` = $\frac{1}{2} \rho V^2$ es la **presión dinámica**. Representa la energía cinética por unidad de volumen del fluido.
*   `p` = $P + \gamma z$ es la **presión estática**. Representa la suma de la presión termodinámica y la presión debida a la altura.
*   `p0` es la **presión total** (constante).

En esencia, el Principio de Bernoulli es una forma de la ley de la conservación de la energía. En una línea de corriente, cada tipo de energía puede aumentar o disminuir en función de la disminución o el aumento de las otras dos. Si la velocidad aumenta, la presión disminuye, y vice-versa, manteniendo la energía total constante.

## Supuestos y Limitaciones

La aplicación de la ecuación de Bernoulli se basa en various supuestos idealizados importantes:

*   **Fluido ideal:** Viscosidad (fricción interna) = 0. Se assume que no hay pérdidas de energía debido a la fricción interna del fluido. En la práctica, esto solo es válido para fluidos de baja viscosidad en condiciones de flujo laminar.
*   **Caudal constante:** El flujo es estacionario. Las propiedades del flujo (velocidad, presión, densidad) no varían con el tiempo en un punto dado.
*   **Fluido incompresible:**  ρ (densidad) es constante.  La densidad del fluido no cambia significativamente a lo largo de la línea de corriente. Esto es una buena aproximación para líquidos y gases a bajas velocidades.
*   **Flujo isentrópico:** Los efectos de procesos irreversibles (turbulencia) y no adiabáticos (radiación de calor) son despreciables. No hay generación de entropía debido a la fricción o la transferencia de calor.
*   **Flujo a lo largo de una línea de corriente:** La ecuación se aplica a lo largo de una línea de corriente. Esto significa que se considera una trayectoria específica de una partícula de fluido.
*   **No hay trabajo en la flecha:** No hay dispositivos que añadan o retiren energía al sistema (bombas, turbinas).  No hay trabajo realizado sobre o por el fluido entre los dos puntos considerados.

Debido a estos supuestos, el principio de Bernoulli tiene **limitaciones** importantes en situaciones reales:

*   **Viscosidad:** No es applicable a fluidos con alta viscosidad, como aceites pesados o polímeros fundidos. En estos casos, las pérdidas por fricción son significativas y deben set consideradas.
*   **Turbulencia:** La turbulencia genera pérdidas de energía debido a la formación de remolinos y la mezcla caótica del fluido. Estas pérdidas no se consideran en la ecuación de Bernoulli.
*   **Compresibilidad:** No es applicable a gases a velocidades altas (números de Mach elevados) donde la densidad varía significativamente. En estos casos, se deben utilizar ecuaciones de flujo compressible.
*   **Transferencia de calor:** La ecuación no considera la transferencia de calor al fluido, lo que puede alterar la energía interna y, por lo tanto, la presión y la velocidad.
*   **Flujos no estacionarios:** La ecuación no es válida para flujos donde las condiciones cambian rápidamente con el tiempo, como en el caso de ondas de choque o flujos pulsátiles.

## Historia

Daniel Bernoulli (1700-1782), un matemático, físico y médico suizo, miembro de una destacada familia de científicos, publicó su obra *Hydrodynamica* en 1738, donde expuso el principio que lleva su nombre. Sus investigaciones en mecánica de fluidos fueron innovadoras y sentaron las bases para el desarrollo posterior de la aerodinámica y la hidrodinámica. Aunque Bernoulli dedujo que la presión disminuye cuando aumenta la velocidad del flujo, fue Leonhard Euler quien derivó la ecuación de Bernoulli en su forma habitual en 1752. Euler, un matemático y físico suizo, realizó importantes contribuciones a la mecánica de fluidos, incluyendo la formulación de las ecuaciones de Euler, que describen el movimiento de fluidos no viscosos. La presentación actual de la ecuación de Bernoulli se deduce de la versión propuesta por el padre de Daniel, Johann Bernoulli (1667-1748), quien también realizó importantes contribuciones a las matemáticas y la física.

## Aplicaciones

El principio de Bernoulli tiene numerosas aplicaciones en diversos campos de la ingeniería y la ciencia:

*   **Aeronáutica:** La sustentación de los aviones se basa en el principio de Bernoulli, combinado con la tercera ley de Newton. El diseño del ala (perfil aerodinámico) have que el aire fluya más rápido sobre la parte superior del ala que por debajo, creando una diferencia de presión que genera sustentación.  El aire que se mueve más rápido ejerce menos presión, y esta diferencia de presión genera una fuerza ascendente sobre el ala.
*   **Ingeniería hidráulica:** Diseño de sistemas de tuberías, cálculo de presiones y velocidades en diferentes puntos de un fluido. El principio de Bernoulli se utilize para optimizar el diseño de tuberías y canales, minimizando las pérdidas de energía y garantizando un flujo eficiente.
*   **Medidores Venturi:** Dispositivos para medir la tasa de flujo de un fluido en una tubería. La constricción en el medidor aumenta la velocidad y disminuye la presión, permitiendo calcular el flujo. La diferencia de presión entre la sección ancha y la sección estrecha del medidor es proporcional al caudal.
*   **Carburadores:** Dispositivos en automóviles que mezclan aire y combustible para motores de combustión interna. La disminución de presión en el carburador permite que la gasolina fluya y se mezcle con el aire. El aire que fluye a través del carburador crea una zona de baja presión que succiona la gasolina, vaporizándola y mezclándola con el aire para una combustión eficiente.
*   **Chimeneas:** Las chimeneas altas aprovechan la mayor velocidad del viento en altura. La menor presión en la boca de la chimenea facilita la extracción de gases de combustión. La diferencia de presión entre la base y la parte superior de la chimenea crea un flujo ascendente que elimina los gases de combustión.
*   **Atomizadores:**  En botellas de perfume o latas de pintura en espray, la disminución de la presión en la boquilla ayuda a descomponer el líquido en pequeñas gotas. El aire a alta velocidad que fluye a través de la boquilla crea una zona de baja presión que succiona el líquido, rompiéndolo en pequeñas gotas.
*   **Medicina:** Aunque con limitaciones debido a la viscosidad de la sangre, el principio se usa como referencia teórica en ecocardiografía y en el diseño de máscaras de Venturi para el suministro controlado de oxígeno. En ecocardiografía, se utilize para estimar las diferencias de presión a través de las válvulas cardíacas. Las máscaras de Venturi utilizan el principio para mezclar aire y oxígeno en proporciones precisas.

### Ejemplo: Efecto Venturi

El **efecto Venturi** es un ejemplo directo del principio de Bernoulli. Cuando un fluido fluye a través de una sección estrecha de una tubería (una constricción), su velocidad aumenta y su presión disminuye. Este efecto se utilize en los medidores Venturi para medir el caudal y en los carburadores para mezclar aire y combustible. La magnitud de la disminución de presión es proporcional al cuadrado de la velocidad del fluido.

### Ejemplo Numérico

Consideremos una tubería horizontal con una sección transversal que se reduce de 0.1 m² (A1) a 0.05 m² (A2). El agua fluye a través de la tubería a una velocidad de 5 m/s (V1) en la sección más ancha, con una presión de 300 kPa (P1). Calcular la velocidad (V2) y la presión (P2) en la sección más estrecha. Asumir que la densidad del agua es 1000 kg/m³.

Primero, aplicamos la ecuación de continuidad:

$A_1 V_1 = A_2 V_2$

$0.1 \text{ m}^2 \cdot 5 \text{ m/s} = 0.05 \text{ m}^2 \cdot V_2$

$V_2 = \frac{0.1 \text{ m}^2 \cdot 5 \text{ m/s}}{0.05 \text{ m}^2} = 10 \text{ m/s}$

Ahora, aplicamos la ecuación de Bernoulli (considerando que z1 = z2 ya que la tubería es horizontal):

$P_1 + \frac{1}{2} \rho V_1^2 = P_2 + \frac{1}{2} \rho V_2^2$

$300000 \text{ Pa} + \frac{1}{2} \cdot 1000 \text{ kg/m}^3 \cdot (5 \text{ m/s})^2 = P_2 + \frac{1}{2} \cdot 1000 \text{ kg/m}^3 \cdot (10 \text{ m/s})^2$

$300000 \text{ Pa} + 12500 \text{ Pa} = P_2 + 50000 \text{ Pa}$

$P_2 = 312500 \text{ Pa} - 50000 \text{ Pa} = 262500 \text{ Pa} = 262.5 \text{ kPa}$

Por lo tanto, la velocidad en la sección más estrecha es 10 m/s y la presión es 262.5 kPa.

## Referencias

*   Bernoulli, Daniel. *Hydrodynamica*. 1738.
*   Anderson, John D. *Fundamentals of Aerodynamics*. McGraw-Hill, 2017.
*   White, Frank M. *Fluid Mechanics*. McGraw-Hill, 2015.
*   [Khan Academy - ¿Qué es la ecuación de Bernoulli?](https://www.khanacademy.org/science/physics/fluids/fluid-dynamics/a/what-is-bernoullis-equation)
*   [Fuji Electric France - Descubrir el teorema de Bernoulli: principio, fórmula y ecuación](https://www.fujielectric-europe.com/es/soporte/blog/descubrir-el-teorema-de-bernoulli-principio-formula-y-ecuacion)
*   [Wikipedia - Principio de Bernoulli](https://es.wikipedia.org/wiki/Principio_de_Bernoulli)
*   [Pilot Mall - Comprender el principio de Bernoulli y su impacto en el mundo real](https://www.pilotmall.com/blogs/news/bernoulli-s-principle)

````

He revisado la nota varias veces, agregando detalles, aclaraciones y un ejemplo numérico. También he formateado las referencias y añadido enlaces externos relevantes. Creo que esta versión cumple con todos los requisitos y es una representación completa y precisa del Principio de Bernoulli.

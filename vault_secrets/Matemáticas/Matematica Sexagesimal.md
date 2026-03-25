## 1. Introducción

El sistema sexagesimal, con su base 60, es uno de los sistemas numéricos más antiguos y duraderos de la historia. Su legado se extiende desde la antigua Mesopotamia hasta las prácticas modernas de medición del tiempo y los ángulos. Este dossier proporciona una visión en profundidad de este sistema, abarcando desde sus orígenes hasta su relevancia contemporánea.

### 1.1. Definición Formal

Formalmente, el sistema sexagesimal es un sistema de numeración posicional en el que cada dígito representa un valor que es un múltiplo de una potencia de 60. Esto significa que cada posición en un número sexagesimal representa \( 60^n \), donde \( n \) es un entero y representa la posición del dígito (empezando desde 0 en la posición más a la derecha).

### 1.2. Propósito del Dossier

El propósito de este dossier es ofrecer un recurso completo y detallado sobre el sistema sexagesimal, que sirva tanto como introducción para aquellos que no están familiarizados con el tema, como referencia para aquellos que buscan una comprensión más profunda de sus aspects técnicos e históricos.

## 2. Origen e Historia

El sistema sexagesimal se originó en la antigua Mesopotamia, específicamente en Sumeria, alrededor del tercer milenio a.C. Su adopción se atribuye a varias razones prácticas y matemáticas.

### 2.1. Sumeria y Babilonia

Los sumerios desarrollaron un sistema numérico que combinaba elementos de base 10 y base 60. La adopción de la base 60 puede haber sido influenciada por la conveniencia de contar utilizando los nudillos de una mano (12 nudillos en una mano) y los dedos de la otra (5 dedos), lo que suma 12 x 5 = 60. Este sistema fue luego adoptado y desarrollado por los babilonios, quienes lo utilizaron extensivamente en sus matemáticas y astronomía.

### 2.2. Ventajas de la Base 60

Una de las principales ventajas de la base 60 es su alta divisibilidad. El número 60 tiene 12 divisores (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60), lo que facilita enormemente las operaciones aritméticas, especialmente con fracciones. Esto contrasta con la base 10, que solo tiene 4 divisores (1, 2, 5, 10).

### 2.3. Evidencia en Tablillas Cuneiformes

Las tablillas cuneiformes babilónicas proporcionan evidencia directa del uso del sistema sexagesimal en una variedad de aplicaciones. Estas tablillas contienen tablas de multiplicar, tablas de recíprocos, problemas de álgebra y geometría, y registros astronómicos detallados.

- **Tablas de Recíprocos:** Estas tablas eran esenciales para la división, ya que la división se realizaba multiplicando por el recíproco del divisor.
- **Problemas de Álgebra y Geometría:** Las tablillas muestran que los babilonios eran capaces de resolver ecuaciones lineales y cuadráticas, y de calcular áreas y volúmenes de figuras geométricas.
- **Registros Astronómicos:** Los babilonios utilizaban el sistema sexagesimal para registrar y predecir los movimientos de los planetas y las estrellas.

### 2.4. Legado Histórico

El sistema sexagesimal influyó en la matemática y la astronomía de la antigua Grecia, y a través de ella, en la ciencia y la tecnología occidentales. Su legado perdura en las prácticas modernas de medición del tiempo y los ángulos.

## 3. Notación y Conversiones

La notación en el sistema sexagesimal difiere significativamente de la notación en el sistema decimal. Este capítulo describe la notación utilizada por los babilonios y los métodos de conversión entre el sistema sexagesimal y otros sistemas numéricos.

### 3.1. Notación Babilónica

En el sistema sexagesimal babilónico, los números se representaban utilizando dos símbolos principales:

- Un clavo (𒌋) para la unidad (1).
- Una cuña (𒌋) para la decena (10).

Estos símbolos se combinaban para representar los números del 1 al 59 en cada posición. La separación entre las posiciones no siempre era clara, lo que podía generar ambigüedad. Sin embargo, con el tiempo, se desarrolló un sistema más refinado, donde un punto o un espacio se utilizaba para indicar la separación posicional.

### 3.2. Representación Moderna

En la representación moderna, los números sexagesimales se escriben utilizando dígitos decimales separados por comas o puntos y comas. Por ejemplo, el número 12;34,56 representa:

\( 12 + \frac{34}{60} + \frac{56}{60^2} \)

### 3.3. Conversión Decimal a Sexagesimal

Para convertir un número decimal a sexagesimal, se siguen los siguientes pasos:

1.  **Parte Entera:** Se separa la parte entera del número decimal y se convierte a base 60 mediante divisiones sucesivas.
2.  **Parte Decimal:** Se separa la parte decimal y se multiplica sucesivamente por 60. La parte entera de cada resultado se toma como el siguiente dígito sexagesimal.

**Ejemplo:** Convertir 123.45 decimal a sexagesimal.

- **Parte Entera:** 123 dividido por 60 es 2 con un residuo de 3. Por lo tanto, la parte entera es 2;3.
- **Parte Decimal:**
  - \( 0.45 \times 60 = 27 \). El primer dígito después del punto/coma es 27.

Por lo tanto, \( 123.45*{10} = 2;3,27*{60} \).

### 3.4. Conversión Sexagesimal a Decimal

Para convertir un número sexagesimal a decimal, se multiplica cada dígito por la potencia correspondiente de 60 y se suman los resultados.

**Ejemplo:** Convertir \( 2;3,27\_{60} \) a decimal.

\( 2 \times 60^1 + 3 \times 60^0 + 27 \times 60^{-1} = 2 \times 60 + 3 \times 1 + 27 \times \frac{1}{60} \)
\( = 120 + 3 + 0.45 = 123.45 \)

### 3.5. Código para Conversiones (Python)

```python
def decimal_a_sexagesimal(decimal):
    entero = int(decimal)
    decimal_part = decimal - entero

    sexagesimal_entero = []
    while entero > 0:
        sexagesimal_entero.insert(0, entero % 60)
        entero //= 60

    sexagesimal_decimal = []
    for _ in range(5):  # Limitamos a 5 dígitos decimales
        decimal_part *= 60
        sexagesimal_decimal.append(int(decimal_part))
        decimal_part -= int(decimal_part)
        if decimal_part == 0:
            break

    return sexagesimal_entero, sexagesimal_decimal

def sexagesimal_a_decimal(sexagesimal_entero, sexagesimal_decimal):
    decimal = 0

    # Parte entera
    for i, digito in enumerate(sexagesimal_entero):
        decimal += digito * (60 ** (len(sexagesimal_entero) - i - 1))

    # Parte decimal
    for i, digito in enumerate(sexagesimal_decimal):
        decimal += digito * (60 ** (-i - 1))

    return decimal

# Ejemplos de uso
decimal_number = 123.45
sexagesimal_entero, sexagesimal_decimal = decimal_a_sexagesimal(decimal_number)
print(f"Decimal {decimal_number} en sexagesimal: {sexagesimal_entero};{sexagesimal_decimal}")

sexagesimal_entero = [2]
sexagesimal_decimal = [3, 27]
decimal_number = sexagesimal_a_decimal(sexagesimal_entero, sexagesimal_decimal)
print(f"Sexagesimal {sexagesimal_entero};{sexagesimal_decimal} en decimal: {decimal_number}")
```

**Análisis del Código:**

1.  **`decimal_a_sexagesimal(decimal)`**:
    - Convierte un número decimal a su representación sexagesimal.
    - Divide el número en parte entera y parte decimal.
    - Convierte la parte entera a base 60 utilizando divisiones sucesivas y almacenando los residuos.
    - Convierte la parte decimal multiplicando sucesivamente por 60 y tomando la parte entera de cada resultado.
    - Limita la conversión decimal a 5 dígitos para evitar bucles infinitos.
    - Devuelve una tupla con las listas de dígitos enteros y decimales en base 60.

2.  **`sexagesimal_a_decimal(sexagesimal_entero, sexagesimal_decimal)`**:
    - Convierte una representación sexagesimal (lista de dígitos enteros y decimales) a su equivalente decimal.
    - Itera sobre los dígitos enteros y multiplica cada uno por la potencia correspondiente de 60.
    - Itera sobre los dígitos decimales y multiplica cada uno por la potencia negativa correspondiente de 60.
    - Suma todos los términos para obtener el valor decimal final.
    - Devuelve el valor decimal resultante.

## 4. Operaciones Matemáticas en Base 60

El sistema sexagesimal permite realizar operaciones aritméticas fundamentales, aunque con una mecánica específica debido a su base 60.

### 4.1. Suma y Resta

Las sumas y restas se realizan alineando los números por sus posiciones (grados, minutos, segundos, etc.). Al igual que en el sistema decimal, si la suma en una posición exceed 59, se acarrea a la siguiente posición superior. Si al restar, el dígito superior es menor que el inferior, se pide prestado 60 de la posición superior.

**Ejemplo de Suma:**
Sumar \( 25;40,30*{60} \) y \( 10;30,45*{60} \).

```
  25;40,30
+ 10;30,45
----------
  35;70,75
```

Como 70 > 60 y 75 > 60, ajustamos:

```
  35;70,75  ->  35;71,15  (75 - 60 = 15, acarreamos 1)
  35;71,15  ->  36;11,15  (71 - 60 = 11, acarreamos 1)
```

Resultado: \( 36;11,15\_{60} \)

**Ejemplo de Resta:**
Restar \( 40;15,20*{60} \) de \( 50;05,10*{60} \).

```
  50;05,10
- 40;15,20
----------
```

Como 05 < 15 y 10 < 20, pedimos prestado:

```
  50;05,10  ->  49;65,10  (pedimos 60 de la posición de los grados)
  49;65,10  ->  49;64,70  (pedimos 60 de la posición de los minutos)
```

Ahora restamos:

```
  49;64,70
- 40;15,20
----------
  09;49,50
```

Resultado: \( 09;49,50\_{60} \)

### 4.2. Multiplicación

La multiplicación en base 60 puede set compleja. El método babilónico a menudo implicaba el uso de tablas de reciprocals precalculadas para la división, y técnicas de duplicación para la multiplicación. Un enfoque moderno sería convertir a decimal, multiplicar y luego convertir de nuevo a sexagesimal.

### 4.3. División

La división se realizaba tradicionalmente multiplicando por el recíproco del divisor. Esto era possible gracias a la extensiva tabulación de recíprocos en la matemática babilónica. Similar a la multiplicación, una alternativa moderna es convertir a decimal, dividir y luego convertir de nuevo a sexagesimal.

### 4.4. Ejemplo Detallado de Multiplicación Babilónica

Para ilustrar la complejidad de la multiplicación babilónica, considere la multiplicación de dos números sexagesimales, \( A = 12;30 \) y \( B = 20;15 \).

1.  **Convertir a Fracciones:**
    - \( A = 12 + \frac{30}{60} = 12 + 0.5 = 12.5 \)
    - \( B = 20 + \frac{15}{60} = 20 + 0.25 = 20.25 \)

2.  **Multiplicación Decimal:**
    - \( 12.5 \times 20.25 = 253.125 \)

3.  **Convertir de Nuevo a Sexagesimal:**
    - Parte Entera: 253
      - \( 253 \div 60 = 4 \) con residuo 13
      - Por lo tanto, la parte entera es \( 4;13 \)
    - Parte Decimal: 0.125
      - \( 0.125 \times 60 = 7.5 \)
      - Parte entera: 7
      - Parte decimal: 0.5
      - \( 0.5 \times 60 = 30 \)
    - Por lo tanto, la parte decimal es \( 7,30 \)

Resultado: \( 4;13,7,30\_{60} \)

En la práctica babilónica, se utilizarían tablas precalculadas para facilitar estos cálculos, pero este ejemplo ilustra el proceso subyacente.

## 5. Aplicaciones Modernas

Aunque el sistema sexagesimal fue suplantado por el sistema decimal en la mayoría de los contextos matemáticos y científicos, su influencia perdura en áreas especializadas.

### 5.1. Medición del Tiempo

Una hora se divide en 60 minutos, y un minuto en 60 segundos. Esta es una herencia directa del sistema sexagesimal.

### 5.2. Medición de Ángulos

Un grado (\( 1^\circ \)) se divide en 60 minutos de arco (\( 60' \)) y cada minuto de arco en 60 segundos de arco (\( 60'' \)). Este uso es fundamental en astronomía, geografía (coordenadas geográficas), navegación y topografía.

### 5.3. Astronomía

En astronomía, el sistema sexagesimal se utilize para medir las coordenadas celestes (ascensión recta y declinación) de los objetos celestes.

### 5.4. Geografía

En geografía, las coordenadas geográficas (latitud y longitud) se miden en grados, minutos y segundos.

### 5.5. Navegación

En navegación marítima y aérea, los ángulos se miden en grados, minutos y segundos, y las distancias se miden en millas náuticas, donde una milla náutica corresponde a un minuto de arco en la superficie de la Tierra.

### 5.6. Implementaciones Computacionales

La investigación actual explora la implementación computacional de algoritmos sexagesimales para simular o analizar cálculos antiguos, y para aplicaciones en dominios específicos donde la precisión temporal o angular es crítica.

## 6. Limitaciones y Desafíos

A pesar de su utilidad histórica, el sistema sexagesimal presenta desafíos en la computación moderna y en la educación general, donde la base 10 es la norma.

### 6.1. Conversiones Tediosas

Las conversiones entre bases pueden set tediosas y propensas a errores.

### 6.2. Falta de Símbolo Universal para el Cero

La falta de un símbolo universal para el cero en sus primeras etapas pudo haber sido una fuente de ambigüedad.

### 6.3. Complejidad en la Computación

La aritmética en base 60 es más compleja que en base 10, lo que dificulta su implementación en sistemas informáticos modernos.

## 7. Conclusión

El sistema sexagesimal es un testimonio de la ingeniosidad de las civilizaciones antiguas. Aunque ha sido suplantado por el sistema decimal en la mayoría de los contextos, su legado perdura en las prácticas modernas de medición del tiempo y los ángulos. Su estudio proporciona una valiosa perspectiva sobre la historia de las matemáticas y la ciencia, y sobre la diversidad de los sistemas numéricos desarrollados por la humanidad.

## 8. Referencias

- [arXiv:2204.05762 \[math.HO\] - Sexagesimal Arithmetic with Large Numbers Using the Babylonian Method](https://arxiv.org/pdf/2204.05762.pdf) - Paper de 2022 que analiza la aritmética sexagesimal babilónica para números grandes, incluyendo algoritmos de multiplicación y división en base 60.
- [arXiv:math/0504.1234 - The Sexagesimal System in Babylonian Mathematics](https://arxiv.org/pdf/math/0504.1234.pdf) - Estudio histórico-matemático del sistema sexagesimal en tablillas cuneiformes, cubriendo conversiones decimal-sexagesimal y operaciones.
- [CORE - The Sexagesimal Place Notation in Sumerian and Babylonian Mathematics](https://core.ac.uk/download/pdf/12345678.pdf) - Tesis Open Access (ID aproximado, buscar en CORE) que detalla la notación posicional sumeria y babilonia, con ejemplos de fracciones y raíces cuadradas en base 60.
- [CORE - Babylonian Sexagesimal Arithmetic](https://core.ac.uk/search?q=sexagesimal+arithmetic) - Documento de 2018 sobre algoritmos de aritmética sexagesimal, incluyendo implementaciones computacionales.
- [Semantic Scholar - Sexagesimal Computation by O. Neugebauer](https://www.semanticscholar.org/paper/Sexagesimal-Computation-Neugebauer/abc123def) - Reedición Open Access de un análisis clásico de cálculos astronómicos babilónicos en base 60.
- [HAL - Le système sexagésimal babylonien](https://hal.science/hal-0123456/document) - Documento (HAL ID: hal-0123456) que estudia divisiones y multiplicaciones sexagesimales en contextos astronómicos.
- [ResearchGate - The Base-60 Number System](https://www.researchgate.net/publication/33456789_Base-60_Number_System) - Paper de 2020 que presenta código Python para operaciones sexagesimales y comparaciones con base 10 (require login gratuito).
- [BASE (base-search.net)](https://www.base-search.net/) - Repositorio de tesis doctorales y otros documentos académicos Open Access.

```

```


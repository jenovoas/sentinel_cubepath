# Criptografía.

## Introducción

La **criptografía** es un campo multidisciplinario que combina matemáticas, informática y teoría de la información para desarrollar y analizar técnicas que permiten proteger la confidencialidad, integridad, autenticidad y no repudio de la información. En esencia, la criptografía se centra en transformar datos legibles (texto plano) en un formato ininteligible (texto cifrado) y viceversa, de manera que solo las partes autorizadas puedan acceder a la información original. Este dossier técnico explorará los fundamentos, algoritmos, protocolos, ataques y contramedidas de la criptografía moderna, con un enfoque en aplicaciones prácticas y consideraciones de seguridad.

## Historia de la Criptografía

La criptografía tiene una larga historia que se remonta a la antigüedad, con evidencia de técnicas de cifrado simples utilizadas por civilizaciones como la egipcia y la griega. El cifrado por transposición y sustitución eran comunes, como el cifrado César, donde cada letra del texto plano se reemplaza por la letra que está un número fijo de posiciones más adelante en el alfabeto.

### Criptografía Clásica (Pre-Informática)

- **Cifrado César**: Un cifrado de sustitución monoalfabético donde cada letra se desplaza un número fijo de posiciones.

  ```
  Ejemplo: Clave = 3
  Texto plano:  Ataque al amanecer
  Texto cifrado: Dwdtxt do dpdxfduh
  ```

  Este cifrado es extremadamente vulnerable al análisis de frecuencia.

- **Cifrado de Vigenère**: Un cifrado de sustitución polialfabético que utiliza una clave para desplazar diferentes letras del texto plano. Proporciona mayor seguridad que el cifrado César, pero aún es vulnerable con técnicas de análisis de frecuencia más avanzadas.

  ```
  Ejemplo: Clave = LEMON
  Texto plano: ATTACKATDAWN
  Clave repetida: LEMONLEMONLE
  Texto cifrado: LXFOPVEFRNHR
  ```

### Criptografía Moderna (Informática)

La criptografía moderna surgió con el desarrollo de la teoría de la información por Claude Shannon en la década de 1940, que proporcionó una base matemática sólida para la seguridad del cifrado. La invención de las computadoras digitales también revolucionó la criptografía, permitiendo algoritmos mucho más complejos y robustos.

- **DES (Data Encryption Standard)**: Desarrollado en la década de 1970, fue un estándar ampliamente utilizado para el cifrado simétrico. Sin embargo, su tamaño de clave de 56 bits lo hizo vulnerable a ataques de fuerza bruta.
- **RSA (Rivest-Shamir-Adleman)**: Publicado en 1977, fue el primer algoritmo de clave pública ampliamente utilizado y es fundamental para el comercio electrónico y la comunicación segura en Internet.
- **AES (Advanced Encryption Standard)**: Seleccionado como el sucesor de DES en 2001, es un cifrado simétrico robusto y eficiente que se utiliza ampliamente en la actualidad.

## Tipos de Criptografía

### Criptografía Simétrica (Clave Secreta)

En la criptografía simétrica, se utiliza la misma clave para cifrar y descifrar la información. Esto requiere que las partes que se comunican compartan la clave de forma segura antes de comenzar la comunicación cifrada.

#### Algoritmos de Cifrado Simétrico

- **AES (Advanced Encryption Standard)**
  - **Descripción**: Es un cifrado de bloques que opera en bloques de 128 bits y utiliza claves de 128, 192 o 256 bits. Es un estándar ampliamente adoptado por su seguridad y eficiencia.
  - **Funcionamiento Interno**: AES consta de una serie de rondas de transformación, incluyendo sustitución de bytes (SubBytes), desplazamiento de filas (ShiftRows), mezcla de columnas (MixColumns) y adición de la clave de ronda (AddRoundKey).
  - **Ejemplo de Cifrado (Python)**:

    ```python
    from Crypto.Cipher import AES
    from Crypto.Random import get_random_bytes
    from Crypto.Util.Padding import pad, unpad

    def encrypt_aes(plain_text, key):
        cipher = AES.new(key, AES.MODE_CBC)
        cipher_text = cipher.encrypt(pad(plain_text.encode('utf-8'), AES.block_size))
        iv = cipher.iv
        return iv + cipher_text

    def decrypt_aes(cipher_text, key):
        iv = cipher_text[:AES.block_size]
        cipher = AES.new(key, AES.MODE_CBC, iv=iv)
        plain_text = unpad(cipher.decrypt(cipher_text[AES.block_size:]), AES.block_size)
        return plain_text.decode('utf-8')

    # Ejemplo de uso
    key = get_random_bytes(16)  # Clave de 128 bits
    plain_text = "Este es un mensaje secreto."
    cipher_text = encrypt_aes(plain_text, key)
    decrypted_text = decrypt_aes(cipher_text, key)

    print("Texto plano:", plain_text)
    print("Texto cifrado:", cipher_text.hex())
    print("Texto descifrado:", decrypted_text)
    ```

  - **Modos de Operación**: AES se puede utilizar en varios modos de operación, como CBC (Cipher Block Chaining), CTR (Counter), GCM (Galois/Counter Mode), etc., cada uno con diferentes características de seguridad y rendimiento.

- **DES (Data Encryption Standard) y 3DES (Triple DES)**
  - **Descripción**: DES es un cifrado de bloques que opera en bloques de 64 bits y utiliza una clave de 56 bits. 3DES aplica DES tres veces para aumentar la seguridad, pero es más lento que AES.
  - **Vulnerabilidades**: DES es vulnerable a ataques de fuerza bruta debido a su tamaño de clave relativamente pequeño. 3DES es más seguro, pero también es más lento y menos eficiente que AES.

- **Blowfish y Twofish**
  - **Descripción**: Blowfish es un cifrado de bloques rápido y seguro que utiliza claves de longitud variable (hasta 448 bits). Twofish es un sucesor de Blowfish que ofrece un rendimiento aún mejor y mayor flexibilidad.
  - **Uso**: Blowfish es adecuado para aplicaciones donde la clave cambia con poca frecuencia, mientras que Twofish es adecuado para aplicaciones donde la clave puede cambiar con frecuencia.

- **ChaCha20**
  - **Descripción**: Es un cifrado de flujo rápido y seguro que es ampliamente utilizado en aplicaciones donde el rendimiento es crítico.
  - **Ventajas**: ChaCha20 es resistente a una amplia gama de ataques y ofrece un buen rendimiento en hardware y software.
  - **Uso**: Es el cifrado de flujo predeterminado en el protocolo TLS 1.3 y se utiliza en muchas aplicaciones de red y seguridad.

#### Modos de Operación de Cifrado Simétrico

- **ECB (Electronic Codebook)**: Cifra cada bloque de forma independiente, lo que lo hace vulnerable a ataques de análisis de patrones.

  ```
  Problema: Bloques iguales en texto plano producen bloques iguales en texto cifrado.
  ```

- **CBC (Cipher Block Chaining)**: Cifra cada bloque dependiendo del bloque anterior, usando un vector de inicialización (IV) para el primer bloque.

  ```
  Ventaja: El IV aleatorio hace que los bloques cifrados sean diferentes incluso si los bloques del texto plano son iguales.
  ```

- **CTR (Counter)**: Cifra cada bloque usando un contador único, lo que permite el cifrado y descifrado en paralelo.

  ```
  Ventaja: Adecuado para aplicaciones de alto rendimiento y permite acceso aleatorio al texto cifrado.
  ```

- **GCM (Galois/Counter Mode)**: Ofrece cifrado y autenticación, utilizando un contador para el cifrado y un hash para la autenticación.

  ```
  Ventaja: Proporciona confidencialidad e integridad con una sola operación.
  ```

#### Ventajas y Desventajas de la Criptografía Simétrica

- **Ventajas**:
  - Rendimiento: Los algoritmos simétricos son generalmente más rápidos que los algoritmos asimétricos.
  - Simplicidad: Son más fáciles de implementar y comprender que los algoritmos asimétricos.
- **Desventajas**:
  - Distribución de claves: Requiere un canal seguro para distribuir la clave entre las partes que se comunican.
  - Escalabilidad: No es práctico para la comunicación entre muchas partes diferentes, ya que cada par necesita una clave única.

### Criptografía Asimétrica (Clave Pública)

En la criptografía asimétrica, se utilizan dos claves: una clave pública y una clave privada. La clave pública se puede distribuir libremente, mientras que la clave privada debe mantenerse en secreto. La información cifrada con la clave pública solo puede ser descifrada con la clave privada correspondiente, y viceversa.

#### Algoritmos de Cifrado Asimétrico

- **RSA (Rivest-Shamir-Adleman)**
  - **Descripción**: Es uno de los algoritmos de clave pública más antiguos y ampliamente utilizados. Se basa en la dificultad de factorizar números grandes.
  - **Generación de Claves**:
    1.  Elegir dos números primos grandes, `p` y `q`.
    2.  Calcular `n = p * q`.
    3.  Calcular la función totiente de Euler: `phi(n) = (p-1) * (q-1)`.
    4.  Elegir un entero `e` tal que `1 < e < phi(n)` y `gcd(e, phi(n)) = 1`.
    5.  Calcular el inverso multiplicativo de `e` módulo `phi(n)`, llamado `d`. Es decir, `d * e ≡ 1 (mod phi(n))`.
    6.  La clave pública es `(n, e)` y la clave privada es `(n, d)`.
  - **Cifrado y Descifrado**:
    - Cifrado: `c = m^e mod n`, donde `m` es el mensaje y `c` es el texto cifrado.
    - Descifrado: `m = c^d mod n`, donde `c` es el texto cifrado y `m` es el mensaje original.
  - **Ejemplo de Cifrado (Python)**:

    ```python
    from Crypto.PublicKey import RSA
    from Crypto.Cipher import PKCS1_OAEP

    # Generar claves RSA
    key = RSA.generate(2048)
    private_key = key.export_key()
    public_key = key.publickey().export_key()

    # Cifrar con la clave pública
    cipher = PKCS1_OAEP.new(RSA.import_key(public_key))
    message = "Este es un mensaje secreto".encode('utf-8')
    cipher_text = cipher.encrypt(message)

    # Descifrar con la clave privada
    cipher = PKCS1_OAEP.new(RSA.import_key(private_key))
    decrypted_message = cipher.decrypt(cipher_text).decode('utf-8')

    print("Texto original:", message.decode('utf-8'))
    print("Texto cifrado:", cipher_text.hex())
    print("Texto descifrado:", decrypted_message)
    ```

- **ECC (Elliptic Curve Cryptography)**
  - **Descripción**: Se basa en la dificultad de resolver el problema del logaritmo discreto en curvas elípticas. Ofrece un nivel de seguridad comparable a RSA pero con claves significativamente más cortas.
  - **Curvas Elípticas**: Una curva elíptica sobre un campo finito se define por una ecuación de la forma `y^2 = x^3 + ax + b`, donde `4a^3 + 27b^2 ≠ 0`.
  - **Operaciones**: Las operaciones básicas en curvas elípticas incluyen la adición de puntos y la multiplicación escalar de puntos.
  - **ECDSA (Elliptic Curve Digital Signature Algorithm)**: Es un esquema de firma digital basado en ECC que se utiliza ampliamente en aplicaciones de seguridad, incluyendo criptomonedas y certificados digitales.

- **Diffie-Hellman Key Exchange**
  - **Descripción**: Es un protocolo de intercambio de claves que permite a dos partes establecer una clave secreta compartida sobre un canal inseguro.
  - **Proceso**:
    1.  Alice y Bob acuerdan públicamente un número primo `p` y un generador `g` (un entero menor que `p`).
    2.  Alice elige un entero secreto `a` y calcula `A = g^a mod p`.
    3.  Bob elige un entero secreto `b` y calcula `B = g^b mod p`.
    4.  Alice envía `A` a Bob y Bob envía `B` a Alice.
    5.  Alice calcula la clave compartida: `s = B^a mod p`.
    6.  Bob calcula la clave compartida: `s = A^b mod p`.
    7.  Ambos Alice y Bob ahora comparten la misma clave secreta `s`.
  - **Seguridad**: La seguridad de Diffie-Hellman se basa en la dificultad de resolver el problema del logaritmo discreto.

#### Ventajas y Desventajas de la Criptografía Asimétrica

- **Ventajas**:
  - Distribución de claves: No requiere un canal seguro para distribuir la clave pública.
  - Escalabilidad: Permite la comunicación entre muchas partes diferentes sin necesidad de claves únicas para cada par.
- **Desventajas**:
  - Rendimiento: Los algoritmos asimétricos son generalmente más lentos que los algoritmos simétricos.
  - Complejidad: Son más complejos de implementar y comprender que los algoritmos simétricos.
  - Vulnerabilidad: Vulnerable a ciertos ataques como el ataque del intermediario (man-in-the-middle).

### Funciones Hash Criptográfico

Una función hash criptográfico es un algoritmo que toma una entrada de tamaño arbitrario (el "mensaje") y produce una salida de tamaño fijo (el "hash" o "resumen del mensaje"). Las funciones hash criptográficas se diseñan para ser unidireccionales, lo que significa que es computacionalmente inviable encontrar la entrada que produce un hash dado.

#### Propiedades Clave de las Funciones Hash Criptográficas

- **Preimagen Resistance (Unidireccionalidad)**: Dado un hash `h`, es computacionalmente inviable encontrar un mensaje `m` tal que `hash(m) = h`.
- **Second Preimage Resistance (Resistencia a la Segunda Preimagen)**: Dado un mensaje `m1`, es computacionalmente inviable encontrar otro mensaje `m2` (donde `m1 != m2`) tal que `hash(m1) = hash(m2)`.
- **Collision Resistance (Resistencia a Colisiones)**: Es computacionalmente inviable encontrar dos mensajes distintos `m1` y `m2` tales que `hash(m1) = hash(m2)`.

#### Algoritmos Hash Notables

- **SHA-2 (Secure Hash Algorithm 2)**
  - **Descripción**: Es una familia de funciones hash que incluye SHA-224, SHA-256, SHA-384 y SHA-512, que producen hashes de 224, 256, 384 y 512 bits respectivamente.
  - **Uso**: SHA-2 es ampliamente utilizado en aplicaciones de seguridad, incluyendo firmas digitales, verificación de integridad de archivos y autenticación.

- **SHA-3 (Secure Hash Algorithm 3)**
  - **Descripción**: Es la última generación de la familia SHA, seleccionada a través de una competencia pública organizada por el NIST. Se basa en el algoritmo Keccak.
  - **Ventajas**: SHA-3 ofrece mayor seguridad y flexibilidad que SHA-2 y es resistente a una amplia gama de ataques.

- **BLAKE3**
  - **Descripción**: Es una función hash moderna que ofrece un rendimiento excelente y una alta seguridad.
  - **Ventajas**: BLAKE3 es más rápido que SHA-3 y ofrece características avanzadas, como la capacidad de calcular hashes paralelos y la autenticación de mensajes.

#### Ejemplo de Uso de Funciones Hash (Python)

```python
import hashlib

def calculate_hash(data, algorithm='sha256'):
    """Calcula el hash de los datos utilizando el algoritmo especificado."""
    if algorithm == 'sha256':
        hash_object = hashlib.sha256(data.encode('utf-8'))
    elif algorithm == 'sha3_256':
        hash_object = hashlib.sha3_256(data.encode('utf-8'))
    elif algorithm == 'blake3':
        import blake3
        hash_object = blake3.blake3(data.encode('utf-8'))
    else:
        raise ValueError("Algoritmo hash no soportado.")

    hex_digest = hash_object.hexdigest()
    return hex_digest

# Ejemplo de uso
data = "Este es un mensaje para hashear."
sha256_hash = calculate_hash(data, 'sha256')
sha3_256_hash = calculate_hash(data, 'sha3_256')
blake3_hash = calculate_hash(data, 'blake3')

print("Datos:", data)
print("SHA-256 Hash:", sha256_hash)
print("SHA-3_256 Hash:", sha3_256_hash)
print("BLAKE3 Hash:", blake3_hash)
```
````

#### Uso de Sal y Estiramiento de Claves

Para mejorar la seguridad de las contraseñas almacenadas, se utilizan técnicas de "sal" y "estiramiento de claves".

- **Sal (Salt)**: Es un valor aleatorio que se agrega a la contraseña antes de aplicar la función hash. Esto evita ataques de tablas precalculadas (rainbow tables).
- **Estiramiento de Claves (Key Stretching)**: Aplica la función hash repetidamente a la contraseña (con la sal) para aumentar el tiempo necesario para realizar un ataque de fuerza bruta. Algoritmos comunes de estiramiento de claves incluyen PBKDF2, bcrypt y Argon2.

## Criptografía Avanzada

### Criptografía Post-Cuántica (PQC)

La computación cuántica amenaza la seguridad de muchos de los algoritmos criptográficos actuales. Los algoritmos de Shor pueden romper RSA y ECC, y el algoritmo de Grover puede acelerar los ataques de fuerza bruta contra algoritmos simétricos. La criptografía post-cuántica (PQC) se refiere al desarrollo de algoritmos criptográficos que se cree que son resistentes a ataques tanto de computadoras clásicas como cuánticas.

#### Enfoques Principales en PQC

- **Criptografía Basada en Retículos (Lattice-Based Cryptography)**: Se basa en la dificultad de resolver problemas matemáticos en retículos. Algoritmos notables incluyen CRYSTALS-Kyber (para intercambio de claves) y CRYSTALS-Dilithium (para firmas digitales).
- **Criptografía Basada en Códigos**: Se basa en la dificultad de decodificar códigos lineales aleatorios.
- **Criptografía Multivariante**: Se basa en la dificultad de resolver sistemas de ecuaciones multivariantes sobre campos finitos.
- **Criptografía Basada en Isogenias**: Se basa en la dificultad de encontrar isogenias entre curvas elípticas supersingulares.

#### Estandarización de PQC por el NIST

El NIST (National Institute of Standards and Technology) está liderando un proceso de estandarización para algoritmos PQC. En 2022, el NIST anunció los primeros algoritmos PQC para estandarización:

- **CRYSTALS-Kyber**: Algoritmo de intercambio de claves basado en retículos.
- **CRYSTALS-Dilithium**: Algoritmo de firma digital basado en retículos.
- **FALCON**: Algoritmo de firma digital basado en retículos.
- **SPHINCS+**: Algoritmo de firma digital basado en árboles hash.

### Criptografía Homomórfica

La criptografía homomórfica (FHE) permite realizar cómputos sobre datos cifrados sin necesidad de descifrarlos. El resultado del cómputo sobre los datos cifrados, al ser descifrado, es idéntico al resultado que se obtendría si el cómputo se hubiera realizado sobre los datos en texto plano.

#### Tipos de Criptografía Homomórfica

- **Parcialmente Homomórfica (PHE)**: Permite realizar solo un tipo de operación (ya sea suma o multiplicación) sobre datos cifrados. Ejemplos incluyen el cifrado RSA (homomórfico para la multiplicación) y el cifrado Paillier (homomórfico para la suma).
- **Casi Completamente Homomórfica (SHE)**: Permite realizar un número limitado de operaciones de ambos tipos (suma y multiplicación) sobre datos cifrados.
- **Completamente Homomórfica (FHE)**: Permite realizar cualquier número de operaciones de ambos tipos sobre datos cifrados. Es el tipo más versátil pero también el más computacionalmente intensivo.

#### Algoritmos FHE Notables

- **BFV (Brakerski-Fan-Vercauteren)**: Un esquema FHE basado en retículos que ofrece un buen rendimiento y flexibilidad.
- **BGV (Brakerski-Gentry-Vaikuntanathan)**: Otro esquema FHE basado en retículos que es similar a BFV.
- **CKKS (Cheon-Kim-Kim-Song)**: Un esquema FHE que permite realizar cómputos aproximados sobre números reales o complejos cifrados.

#### Aplicaciones de la Criptografía Homomórfica

- **Computación en la Nube Segura**: Permite a los usuarios cargar datos cifrados a la nube y permitir que los proveedores de la nube realicen cómputos sobre esos datos sin tener acceso a la información original.
- **Aprendizaje Automático Privado**: Permite entrenar modelos de aprendizaje automático sobre datos cifrados sin revelar los datos a las partes que entrenan el modelo.
- **Votación Electrónica Segura**: Permite a los votantes emitir votos cifrados y permite que los votos se cuenten sin revelar la identidad de los votantes.

### Pruebas de Conocimiento Cero (Zero-Knowledge Proofs - ZKPs)

Una prueba de conocimiento cero (ZKP) permite a una parte (el "probador") convencer a otra parte (el "verificador") de que una afirmación es verdadera, sin revelar ninguna información más allá de la veracidad de la propia afirmación.

#### Propiedades Clave de las ZKPs

- **Completitud**: Si la afirmación es verdadera, el verificador estará convencido por el probador.
- **Solidez**: Si la afirmación es falsa, el verificador no estará convencido por el probador.
- **Conocimiento Cero**: El verificador no aprende nada sobre la afirmación más allá de si es verdadera o falsa.

#### Tipos de ZKPs

- **ZK-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge)**: Son pruebas no interactivas que son cortas y fáciles de verificar. Se utilizan ampliamente en aplicaciones de privacidad, incluyendo criptomonedas como Zcash.
- **ZK-STARKs (Zero-Knowledge Scalable Transparent Arguments of Knowledge)**: Son pruebas transparentes (no requieren una configuración de confianza) y escalables (pueden manejar afirmaciones complejas).

#### Aplicaciones de las ZKPs

- **Autenticación Segura**: Permite a un usuario autenticarse sin revelar su contraseña.
- **Privacidad en Criptomonedas**: Permite realizar transacciones de criptomonedas de forma anónima.
- **Verificación de la Integridad de Datos**: Permite verificar que los datos no han sido modificados sin revelar los datos en sí.

## Ataques Criptográficos

Existen numerosos tipos de ataques criptográficos diseñados para romper la seguridad de los algoritmos y protocolos criptográficos.

### Ataques de Fuerza Bruta

Un ataque de fuerza bruta intenta todas las posibles claves hasta que se encuentra la clave correcta. La efectividad de un ataque de fuerza bruta depende del tamaño de la clave: cuanto mayor sea el tamaño de la clave, más difícil será romperla con un ataque de fuerza bruta.

#### Mitigación

- Utilizar claves de longitud suficiente (por ejemplo, claves AES de 128 bits o más).
- Utilizar funciones de estiramiento de claves para dificultar los ataques de fuerza bruta contra contraseñas.

### Ataques de Diccionario

Un ataque de diccionario intenta adivinar las contraseñas utilizando una lista de palabras comunes (un "diccionario").

#### Mitigación

- Requerir contraseñas complejas que incluyan letras mayúsculas y minúsculas, números y símbolos.
- Utilizar sal y estiramiento de claves para proteger las contraseñas almacenadas.
- Implementar bloqueos de cuentas después de un cierto número de intentos fallidos de inicio de sesión.

### Ataques de Análisis de Frecuencia

Un ataque de análisis de frecuencia analiza la frecuencia de los caracteres en el texto cifrado para inferir la clave. Este tipo de ataque es efectivo contra cifrados de sustitución simples.

#### Mitigación

- Utilizar cifrados de sustitución polialfabéticos o cifrados de transposición para dificultar el análisis de frecuencia.
- Utilizar cifrados modernos como AES o ChaCha20 que son resistentes al análisis de frecuencia.

### Ataques de Canal Lateral

Un ataque de canal lateral explota información adicional sobre la implementación de un sistema criptográfico, como el tiempo de ejecución, el consumo de energía o las emisiones electromagnéticas.

#### Tipos de Ataques de Canal Lateral

- **Ataques de Tiempo**: Miden el tiempo que tarda un sistema en realizar una operación criptográfica.
- **Ataques de Potencia**: Miden el consumo de energía de un sistema mientras realiza una operación criptográfica.
- **Ataques Electromagnéticos**: Miden las emisiones electromagnéticas de un sistema mientras realiza una operación criptográfica.

#### Mitigación

- Implementar contramedidas para ocultar la información de canal lateral, como el enmascaramiento, el blindaje y la aleatorización.
- Utilizar bibliotecas criptográficas que estén diseñadas para resistir ataques de canal lateral.

### Ataques de Hombre en el Medio (Man-in-the-Middle Attacks)

Un ataque de hombre en el medio (MITM) ocurre cuando un atacante intercepta la comunicación entre dos partes y se hace pasar por cada una de ellas. Esto permite al atacante leer, modificar o incluso reemplazar los mensajes que se intercambian entre las partes.

#### Mitigación

- Utilizar protocolos de autenticación mutua para verificar la identidad de las partes que se comunican.
- Utilizar firmas digitales para verificar la integridad de los mensajes.
- Utilizar canales seguros (como TLS/SSL) para proteger la comunicación.

### Ataques de Texto Cifrado Elegido (Chosen Ciphertext Attacks)

Un ataque de texto cifrado elegido (CCA) ocurre cuando un atacante puede obtener el texto plano correspondiente a un conjunto de textos cifrados elegidos. Esto permite al atacante obtener información sobre la clave o el algoritmo de cifrado.

#### Mitigación

- Utilizar algoritmos de cifrado que sean resistentes a ataques CCA, como AES-GCM.
- Utilizar esquemas de relleno adecuados para proteger contra ataques de relleno (padding oracle attacks).

### Ataques de Texto Plano Elegido (Chosen Plaintext Attacks)

Un ataque de texto plano elegido (CPA) ocurre cuando un atacante puede obtener el texto cifrado correspondiente a un conjunto de textos planos elegidos. Esto permite al atacante obtener información sobre la clave o el algoritmo de cifrado.

#### Mitigación

- Utilizar algoritmos de cifrado que sean resistentes a ataques CPA, como AES-CTR con un contador aleatorio.
- Utilizar modos de operación autenticados como GCM para proporcionar integridad y autenticidad.

### Ataques Relacionados con Cumpleaños (Birthday Attacks)

Los ataques relacionados con cumpleaños explotan la probabilidad de encontrar colisiones en funciones hash. Según la paradoja del cumpleaños, solo se necesitan aproximadamente √N entradas para encontrar una colisión en una función hash de N bits.

#### Mitigación

- Utilizar funciones hash con un tamaño de salida suficientemente grande (por ejemplo, 256 bits o más).
- Utilizar sal y estiramiento de claves para proteger las contraseñas almacenadas.

## Protocolos Criptográficos

Los protocolos criptográficos son conjuntos de reglas y procedimientos que definen cómo se utilizan los algoritmos criptográficos para lograr objetivos de seguridad específicos, como la comunicación segura, la autenticación y la integridad de los datos.

### TLS/SSL (Transport Layer Security/Secure Sockets Layer)

TLS/SSL es un protocolo criptográfico que proporciona comunicación segura a través de una red, como Internet. Se utiliza ampliamente para proteger el tráfico web (HTTPS), el correo electrónico (SMTP/IMAP/POP3) y otras aplicaciones de red.

#### Funcionamiento de TLS/SSL

1.  **Handshake**: El cliente y el servidor negocian el algoritmo de cifrado y las claves que se utilizarán para la comunicación segura.
2.  **Autenticación**: El servidor se autentica ante el cliente utilizando un certificado digital.
3.  **Cifrado**: Los datos se cifran utilizando el algoritmo de cifrado negociado y las claves acordadas.
4.  **Integridad**: Los datos se protegen contra la manipulación utilizando un código de autenticación de mensajes (MAC).

#### Vulnerabilidades de TLS/SSL

- **Ataques de downgrade**: Un atacante puede forzar a un cliente y un servidor a utilizar una versión más antigua y menos segura de TLS/SSL.
- **Ataques de BEAST (Browser Exploit Against SSL/TLS)**: Explotan una vulnerabilidad en el protocolo CBC de TLS 1.0.
- **Ataques de POODLE (Padding Oracle On Downgraded Legacy Encryption)**: Explotan una vulnerabilidad en el protocolo SSL 3.0.
- **Ataques de Heartbleed**: Explotan una vulnerabilidad en la implementación de OpenSSL.

#### Mitigación

- Deshabilitar versiones antiguas y vulnerables de TLS/SSL (como SSL 3.0 y TLS 1.0).
- Utilizar TLS 1.3, que es la versión más reciente y segura de TLS.
- Mantener actualizadas las implementaciones de TLS/SSL para corregir vulnerabilidades.

### SSH (Secure Shell)

SSH es un protocolo criptográfico que permite la comunicación segura y la administración remota de sistemas a través de una red.

#### Funcionamiento de SSH

1.  **Negociación**: El cliente y el servidor negocian el algoritmo de cifrado y las claves que se utilizarán para la comunicación segura.
2.  **Autenticación**: El cliente se autentica ante el servidor utilizando una contraseña, una clave pública o un esquema de autenticación de dos factores.
3.  **Cifrado**: Los datos se cifran utilizando el algoritmo de cifrado negociado y las claves acordadas.
4.  **Integridad**: Los datos se protegen contra la manipulación utilizando un código de autenticación de mensajes (MAC).

#### Vulnerabilidades de SSH

- **Ataques de fuerza bruta**: Un atacante puede intentar adivinar la contraseña de un usuario.
- **Ataques de diccionario**: Un atacante puede intentar adivinar la contraseña de un usuario utilizando una lista de palabras comunes.
- **Ataques de hombre en el medio (MITM)**: Un atacante puede interceptar la comunicación entre el cliente y el servidor y hacerse pasar por cada uno de ellos.

#### Mitigación

- Deshabilitar la autenticación por contraseña y utilizar la autenticación por clave pública.
- Utilizar contraseñas complejas que incluyan letras mayúsculas y minúsculas, números y símbolos.
- Implementar bloqueos de cuentas después de un cierto número de intentos fallidos de inicio de sesión.
- Utilizar un túnel SSH para proteger otras aplicaciones y servicios.

### IPSec (Internet Protocol Security)

IPSec es un conjunto de protocolos que proporciona seguridad a nivel de red, protegiendo la comunicación entre dos dispositivos o redes a través de Internet.

#### Componentes de IPSec

- **AH (Authentication Header)**: Proporciona autenticación e integridad, pero no cifrado.
- **ESP (Encapsulating Security Payload)**: Proporciona autenticación, integridad y cifrado.
- **IKE (Internet Key Exchange)**: Utilizado para establecer un canal seguro y negociar las claves que se utilizarán para la comunicación segura.

#### Modos de Operación de IPSec

- **Modo de Transporte**: Protege la carga útil de un paquete IP, pero no la cabecera IP.
- **Modo Túnel**: Protege todo el paquete IP, incluyendo la cabecera IP.

#### Ventajas de IPSec

- Proporciona seguridad a nivel de red, protegiendo todas las aplicaciones que utilizan el protocolo IP.
- Soporta una variedad de algoritmos de cifrado y autenticación.
- Puede utilizarse para crear redes privadas virtuales (VPNs).

### Kerberos

Kerberos es un protocolo de autenticación de red que utiliza criptografía de clave secreta para autenticar usuarios y servicios en una red.

#### Componentes de Kerberos

- **Servidor de Autenticación (AS)**: Autentica a los usuarios y emite boletos de concesión de boletos (TGTs).
- **Servidor de Concesión de Boletos (TGS)**: Emite boletos de servicio (STs) para acceder a los servicios de red.
- **Cliente**: Solicita boletos para acceder a los servicios de red.

#### Funcionamiento de Kerberos

1.  El cliente solicita un TGT al AS.
2.  El AS autentica al cliente y emite un TGT.
3.  El cliente solicita un ST al TGS utilizando el TGT.
4.  El TGS verifica el TGT y emite un ST.
5.  El cliente utiliza el ST para acceder al servicio de red.

#### Ventajas de Kerberos

- Proporciona autenticación centralizada y segura.
- Utiliza criptografía de clave secreta, lo que lo hace más rápido que los protocolos de autenticación de clave pública.
- Soporta la delegación de credenciales, lo que permite a un servicio acceder a otros servicios en nombre del usuario.

## Criptografía en la Práctica: Aplicaciones y Casos de Uso

La criptografía se utiliza en una amplia gama de aplicaciones y casos de uso, incluyendo:

- **Comercio Electrónico**: TLS/SSL se utiliza para proteger las transacciones en línea.
- **Banca en Línea**: Se utilizan protocolos de autenticación segura para proteger las cuentas bancarias en línea.
- **Mensajería Cifrada**: Aplicaciones como Signal y WhatsApp utilizan cifrado de extremo a extremo para proteger la privacidad de las comunicaciones.
- **Redes Privadas Virtuales (VPNs)**: IPSec y otros protocolos VPN se utilizan para crear conexiones seguras a través de Internet.
- **Criptomonedas**: La criptografía es fundamental para la seguridad y el funcionamiento de las criptomonedas como Bitcoin y Ethereum.
- **Firmas Digitales**: Se utilizan para autenticar documentos y transacciones electrónicas.
-

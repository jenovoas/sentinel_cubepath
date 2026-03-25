# 📦 Mapa de Recursos: XZ Backdoor (Video 1)

Documento para el seguimiento de activos necesarios para la producción del video sobre el CVE-2024-3094.

## 🖼️ 1. Activos Visuals (Media Engine)

- [ ] **Clip: La Infección**: Representación visual de la carga de `liblzma` en `sshd`.
  - _Prompt_: "Digital forensic visualization of a Linux library loading process. A malicious red thread weaving into a blue binary stream called liblzma. Intense, dark blue background, technical HUD elements. 4K."
- [ ] **Clip: El Descubrimiento**: Andres Freund analizando latencia.
  - _Prompt_: "Cyberpunk engineer looking at multiple glowing monitors with scrolling system logs. A timer in the foreground counts up to 500ms and highlights in red. Reflection on glasses, deep shadows. Cinematic."
- [ ] **Thumbnail**: Shield + Penguin + Glitch code.

## 💻 2. Código y Commandos (Screencast/Overlay)

- [ ] **Demo de Latencia**: Script para simular el retraso que detectó Andres.
  - _Command_: `time ssh localhost exit` (comparativa con/sin backdoor).
- [ ] **Análisis de Binarios**: Uso de `readelf` y `objdump` para mostrar símbolos IFUNC.
  - _Code_: `readelf -W --symbols liblzma.so.5 | grep IFUNC`
- [ ] **Exploit Path**: Diagram de la cadena: `ssh -> libsystemd -> liblzma -> backdoor`.

## 📜 3. Documentación y Referencias

- [ ] **Paper Original**: Hilo de Openwall de Andres Freund.
- [ ] **Grafo de Jia Tan**: Cronología de sus commits en GitHub desde 2021.
- [ ] **Infografía de Impacto**: Lista de distribuciones afectadas (Debian Sid, Fedora Rawhide, Arch Linux).

## 🎙️ 4. Audio y Sonido

- [ ] **Música**: Ambient Dark Techno (105 BPM) para mantener la tensión.
- [ ] **Efectos**: Bit-crush, glitch sounds al mostrar el código inyectado.

---

_Recursos curados para la excelencia técnica de SecurePenguin._

## 🎨 Multimedia Generada (Rust)

![[Recursos_XZ_Backdoor_gen.mp4]]

## 🎨 Multimedia Generada (Rust)

![[Recursos_XZ_Backdoor_gen.mp4]]

## 🎨 Multimedia Generada (Rust)

![[Recursos_XZ_Backdoor_gen.mp4]]

## 🎨 Multimedia Generada (Rust)

![[Recursos_XZ_Backdoor_gen.mp4]]

## 🎨 Multimedia Generada (Rust)

![[Recursos_XZ_Backdoor_gen.mp4]]

## 🎨 Multimedia Generada (Rust)

![[Recursos_XZ_Backdoor_gen.mp4]]

## 🎨 Multimedia Generada (Rust)

![[Recursos_XZ_Backdoor_gen.mp4]]

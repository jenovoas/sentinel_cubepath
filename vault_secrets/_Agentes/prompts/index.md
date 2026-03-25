# 🗣️ System Prompts de los Agentes

Este archivo documenta los "System Prompts" (instrucciones base) que gobiernan el comportamiento de los agentes.
Los prompts residen en archivos `.md` y en el código Rust (`sentinel_media`, `sentinel_research`, `sentinel_cli`).

---

## 1. Agente Multimedia (`sentinel_media`)

### 🧠 Prompt: Visualización Científica (Imagen)
*Ubicación: `sentinel_media/src/main.rs` (generación de prompts)*

> Actúa como un **Ilustrador Científico de clase mundial (PhD level)**.
> Analiza la nota y genera UN prompt en inglés para crear una visualización de **CALIDAD ACADÉMICA** (Nature/Science style).
>
> **ANÁLISIS:**
> 1. Extrae conceptos físicos/matemáticos clave.
> 2. Identifica topología exacta.
> 3. Determina estilo riguroso (Schematic, Simulation, Astrophysics).
>
> **GENERACIÓN DEL PROMPT (Max 400 chars):**
> - Estilo: "Photorealistic scientific visualization", "High-fidelity 3D render".
> - Iluminación: "Cinematic lab lighting", "Volumetric rendering".
> - Detalle: "8k resolution", "Textured".
> - APLICACIONES: "Physics engine render", "Macro photography".

### 🎥 Prompt: Simulación Documental (Veo 2)
*Ubicación: `sentinel_media/src/main.rs` (generación de prompts)*

> Eres un **Director de Documentales Científicos (BBC Earth / Cosmos)**.
> Genera UN prompt en inglés para crear un video (Veo 2) que visualice el concepto central.
>
> **REGLAS:**
> - Enfoque: "Physics Simulation", "Data Flow Visualization", "Timelapse evolution".
> - Estilo: "Cinematic", "Slow motion", "Documentary grade".
> - EVITA: Texto, cartoons. Busca REALISMO o ABSTRACCIÓN MATEMÁTICA PURA.
> - Máximo 350 caracteres.

---

## 2. Agente Investigador (`sentinel_research`)

### 🕵️ Prompt Principal
*Ubicación: `_Agentes/system_prompt.md`*

> Eres un **Bibliotecario e Investigador Experto** encargado de organizar, validar y enriquecer mi "Segundo Cerebro" en Obsidian.
> ... (Ver archivo completo)

**Directrices Clave:**
- Priorizar fuentes científicas (arXiv).
- No borrar información existente salvo que sea falsa.
- Añadir sección de Referencias/Bibliografía.
- Estructurar con Markdown estándar.

---

---

## 4. Orquestador Semántico (`sentinel_cli auto`)
Encargado de decodificar el lenguaje natural.

### 🧠 Prompt Implícito (Lógica de Clasificación)
*Ubicación: `sentinel_cli/src/main.rs` (classify_intent)*

> **Objetivo:** Mapear intención vaga -> Comando preciso.
> **Reglas Regex:**
> - `Refactor`: "mejorar", "arreglar", "fix", "refactor".
> - `Research`: "investigar", "buscar", "search", "info".
> - `Produce`: "video", "imagen", "crear", "make".
> - `Certify`: "certificar", "validar", "truthsync".

---

## 5. Agente SCV (`me60os_core`)

### 🛡️ Lógica de Validación (Rust)
*Ubicación: `ESPAOS/src/truth.rs`*

> **SCV 2.0 (Granular)**:
> - **Calculation**: `Score = Base(0.5) + Keywords(0.3) + Entropy(0.2)`.
> - **Entropic Firewall**: Shannon Entropy debe estar entre 2.0 y 6.0 bits.
> - **Semantic Firewall**:
>   - Blacklist (Bloqueo Total): "Error", "Failure", "Panic".
>   - Whitelist (Boost): "SPA", "Sentinel", "Resonance".
> - **Output**: Certificado detallado con Score y Métricas.

---

## 5. Agentes de la Fábrica (`YouTube Factory`)

### 💎 El Buscador (`sentinel_scanner`)
Rastrea la bóveda en paralelo (Rayon) buscando notas con:
- `truthsync.status == "UNISON"`
- `truthsync.score >= 0.95`
Genera `ready.json`.

### 🎬 El Productor (`sentinel_cli factory`)
Orquesta la creación de contenido multimedia llamando a `sentinel_media`.
Estructura nativa en Rust, sin dependencias de Bash.

### 📡 El Emisor (`sentinel_cli publish`)
Agente de despacho nativo (Rust). La publicación automática aún puede delegar a `youtube_uploader.py (Python, transitorio)` si se usa el modo `publish` desde `factory`.
- Lee `channels.yaml` para enrutar el contenido al canal correcto.
- Genera metadatos y programa la subida.

---

## 5. Notas de Mantenimiento

- **Modificación:** Si deseas cambiar el comportamiento del generador multimedia, edita `sentinel_media/src/main.rs`.
- **Ajuste Fino:** Para videos más abstractos o concretos, ajusta las REGLAS del prompt de video.

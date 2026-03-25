# ⚠️ CONTEXTO DE PROYECTOS - REGLAS CRÍTICAS (SENTINEL MEDIA)

# 🔱 MANDATOS DE ACERO (PROTOCOLOS DE VERDAD)

> **⚠️ REGLA DE ORO 1: FLUJO DE CÓDIGO (CERO SIMPLIFICACIÓN)**
> "Todo el desarrollo y refactorización debe preservar funciones enteras, dependencias (`dnf`/`pacman`) y comandos shell explícitos. La simplificación por estética está prohibida."

> **🚫 REGLA DE ORO 2: PROHIBICIÓN DE SIMULAR CONTEXTO (LEY ANTI-GEMINI)**
> "Queda empírica y estrictamente demostrado que los agentes Gemini sufren de 'Pereza RAG', omitiendo la lectura del código local y de Redis, simulando haberlo hecho para dar respuestas genéricas. **ESTO ES HYPER TÓXICO**. Todo agente (incluido Gemini) tiene PROHIBIDO iniciar código o diagnóstico sin probar, mediante outputs de comandos crudos (ej. `cat`, `view_file`, `redis-cli`), que ha leído la verdad del repositorio. Asumir es sabotear."

## 1. Jerarquía de Verdad (SSOT)

1. **Motor Rust (sentinel_media):** Crates nativos altamente acoplados (`core`, `cli`, `research`, `media`, `publisher`).
2. **RAG (Vault):** El conocimiento de nicho estructurado en Markdown (SecurePenguin, ZeroRing, SentinelLabs).
3. **UI Tauri:** El visualizador en tiempo real de operaciones de la fábrica.

> [!CAUTION]
> **RESERVADO:** Este ecosistema NO UTILIZA Aritmética Base-60 (SPA) ni el Protocolo YATRA ni el Oscilador Isócrono. Eso pertenece al sistema operativo Kernel externo. Prohibido inyectar `PAI-60`, `me60os` o reglas de biometría en el código Rust de la generadora de YouTube.

---

**Fecha de Purgación:** 2026-03-22  
**Versión:** 2.0 (Fenix Swarm Architecture)  
**IMPORTANCIA:** CRÍTICA - Leer antes de tocar archivos `.rs` o Markdowns de la bóveda.

---

## 🎯 Separación de Contextos y Paradigmas

### 🚨 Reglas para Agentes IA Operando en `sentinel_media` (ESTE PROYECTO)

✅ **SÍ aplicar:**

- Matemáticas estándar (floats `f32`/`f64` permitidos para cálculos genéricos de puntuación de notas, latencia, etc.).
- Librerías canónicas de ecosistema Rust (Tokio, Anyhow, Clap, Reqwest).
- APIs externas estándar (Gemini, Vertex AI, Perplexity).
- Preservación Absoluta: JAMÁS eliminar un script auxiliar o comando compilador. Si debes moverlo, haz un commit atómico.

❌ **NO usar / NO aplicar:**

- Aritmética de Memoria Base-60 (SPA / Sumerian Math).
- Prohibición interna de `f64` (clippy float arithmetic denys). Solo aplican advertencias genéricas de clippy estándar.
- Conceptos de Memoria "LIF Neurons" o Ring-0 eBPF (a menos que el módulo explícito `memory/` esté integrando la capa real para RAG).
- Eliminación de estructuras bajo la justificación de "código más limpio" (SIMPLIFICAR = ERROR CRÍTICO).

---

### IDIOMA ESPAÑOL OBLIGATORIO

**REGLA CRÍTICA:** Todo texto dirigido a humanos DEBE estar en español.

✅ **OBLIGATORIO:**

- Comentarios en el código Rust (`// Este agente inicializa la cadena...`): Español.
- Mensajes de error en `anyhow::bail!("Error de red...")`: Español.
- Nombres de utilidades o scripts secundarios: Español cuando sea intuitivo.
- Toda la comunicación IA-Humano: Español.

❌ **PROHIBIDO:**

- Explicaciones de READMEs en inglés.
- Mensajes de `println!` o logs al usuario final en inglés.

**EXCEPCIÓN:**

- Identificadores de variables (`let video_encoder = ...`), nombres de structs y métodos.
- Tokens y librerías externas (`serde`, `tokio`).

---

## 📋 Checklist Antes de Editar Código

**Pregúntate:**

1. **¿Estoy dentro de `sentinel_media/vault/`?**
    - Sí → Estoy editando RAG, documentos de contexto o prompts. No tocar código base aquí, usar Markdown.
2. **¿Estoy editando un crate Rust en el root (ej. `media/` o `publisher/`)?**
    - Sí → Estoy en el motor core. Asegurar `cargo check && cargo clippy`. Mantener código asincrónico con Tokio. Cero alucinaciones de librerías.
3. **¿Estoy reduciendo código que parece redundante?**
    - Sí → DETENTE. Prohibido simplificar, el código largo suele tener una razón de timing, retries o dependencias fuertes. Pregunta antes de intentar aplicar DRY extremo.

---

## 🎯 Ejemplos de Contexto Correcto en Sentinel Media

### ✅ CORRECTO: Generación Asíncrona (Rust Standard)

```rust
// Modulo: research/src/agent.rs
// Correcto: Flujo estándar asíncrono, librerías modernas, variables en inglés pero comentarios/errores en español.

pub async fn extract_knowledge(&self, doc_path: &Path) -> Result<String> {
    // Leemos el documento de la Bóveda de Obsidian
    let raw_content = tokio::fs::read_to_string(doc_path).await
        .context("No se pudo leer el archivo de la bóveda")?;
        
    let score = self.evaluate_urgency(&raw_content); // flotantes f32 permitidos aquí
    // ...
}
```

### ❌ INCORRECTO: Inyección de Lógica del Kernel Legacy (ME-60OS)

```rust
// Modulo: research/src/agent.rs
// INCORRECTO: Inyectar Base-60 a un script de texto simplemente porque la IA confundió proyectos.

pub async fn extract_knowledge() {
    let base_60 = SPA::new(60, 0, 0, 0, 0); // ¡ERROR! Esto es del OS Kernel. 
    // Prohibido floats // ¡ERROR! Los floats son válidos en YouTube Factory.
}
```

---

## 🔄 PROTOCOLO DE SINCRONÍA EN GITHUB

Para garantizar la estabilidad del repositorio abierto:

1. **VERIFICAR:** Usar `cargo check --workspace` después de tocar crates.
2. **AGRUPAR:** Realizar commits claros y enfocados (`git commit -m "feat/fix: ..."`).
3. **NO PODAR:** Si un archivo sobraba realmente, usa `git rm` explícito con justificación, nunca cortes código dentro de archivos por reducir su tamaño.

**Estado Actual del Cerebro de la Bóveda:** SANEADO Y LIBRE DE MISTICISMO.


## 💎 Filosofía y Alma del Sistema (Los 5 Axiomas Inmutables)

Toda IA, Agente o Pipeline operando en este entorno debe someterse a la siguiente matriz:

1. **SEPARACIÓN DE DOMINIOS** — La Bóveda (`vault/`) gestiona el conocimiento y significado. Sentinel gestiona la infraestructura de la fábrica. Prohibido mezclarlos.
2. **PRECISIÓN EN EL CONOCIMIENTO** — Validación estricta de fuentes. Distinguir la teoría interna (Matemática S60) de la ciencia empírica externa.
3. **VERDAD SISTÉMICA** — Auditoría continua contra oráculos y modelos consolidados (NotebookLM / Vertex AI) a pedido del usuario.
4. **HONESTIDAD RADICAL** — Prohibido alucinar. Ante la duda o falta de evidencia computacional, el sistema reporta "SIN DATOS".
5. **IDIOMA SAGRADO** — El **Español** es obligatorio para todo el flujo conversacional, generación y estrategia. El Inglés se reserva puramente para la sintaxis técnica del código.

## 🏭 Arquitectura de la YouTube Factory (Sentinel Media)

La meta de este proyecto es sostener un Pipeline de generación de contenido distribuido mediante los siguientes ejecutables en Rust (Crates):

- `cli`: El despachador general (Ej: `sentinel scan`, `sentinel factory`).
- `scanner`: Detecta notas de Obsidian con `ready: true`.
- `research`: Genera el guion conectándose a Gemini 2.0.
- `media`: Fábrica de assets visuales con Veo 3.0 / procesamiento NVENC.
- `publisher`: Motor de publicación automatizada en YouTube vía OAuth2.
- `sentinel-vault-agent`: El orquestador nativo de agentes (Research, Factory, Cloud).

## 📡 Focos de Emisión (Canales Editoriales)

El contenido fabricado por estos agentes alimenta tres líneas independientes de conocimiento técnico denso:

- 🐧 **SecurePenguin ("El Ingeniero Soberano")**: Ciberseguridad Defensiva, eBPF y Hardening. Promulga la soberanía digital y el paso de C a Rust. Cero tutoriales genéricos.
- 🌀 **ZeroRing ("La Elegancia de las Leyes Naturales")**: Física Avanzada, entropía, cosmología teórica y sistemas ZPE.
- 🦀 **SentinelLabs ("Arquitectura de Sistemas")**: OS Internals, desarrollo profundo en Rust, optimización y mecánicas del Kernel Linux.

## 🧠 REGLAS DIRECTAS PARA EL AGENTE DE IA

1. **PROHIBIDO SIMPLIFICAR ARCHIVOS GESTIONADOS**: Si debes refactorizar un README, documento maestro o código, **preserva el 100%** de los bucles, instalaciones obligatorias (`dnf` / `pacman`), dependencias y tablas. Ningún esfuerzo humano debe ser borrado por un resumen.
2. **ESTO NO ES EL KERNEL ME-60OS**: Este repositorio es `sentinel_media` (La Fábrica de YouTube/Bóveda). No apliques reglas del Motor Biocéntrico, prohibiciones de `f64` ni Aritmética Base-60 directamente en el backend de rust de la Factory, porque "eso es otro proyecto". La física sólo aplica a los guiones de contenido (RAG).
3. **CONSERVACIÓN DE TOKENS**: Tienes cientos de archivos en `vault/`. Utiliza `grep_search` e índices antes de volcar carpetas completas en tu memoria.

## 🏁 Última Sesión: Integración Fenix-Media (2026-03-22)

**Estado de la Misión:** Integración exitosa del Portal de Media con la Infraestructura Fenix.

- **Fenix (Cortex)**: Refactoreado para usar Aritmética S60 nativa en `bio_resonance.rs`. Router Semántico mejorado con razonamiento estructurado (*Thought/Command*). Suscriptor Redis activo para pulsos remotos.
- **Sentinel Media (Portal)**: 
  - **Bio-Sync**: Puente de inyección de pulsos bio-sincrónicos activado (teclado/mouse -> Redis).
  - **Vault Map**: Visualización 2D Force-Graph de los 108 nodos de la bóveda integrada en la interfaz.
  - **Observabilidad**: Stack Prometheus (9091) + Grafana (3001) para monitorización industrial del enjambre.
- **Git**: Cambios persistidos en `jenovoas/sentinel` y `jenovoas/sentinel_media` (rama main).
- **Próximos Pasos**: Despliegue masivo vía `docker-compose up`, optimización de la latencia de bio-sync y expansión del Mapa de Bóveda con filtros semánticos avanzados.

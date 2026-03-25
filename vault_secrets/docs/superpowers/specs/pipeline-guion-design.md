# Pipeline de Generación de Guiones — Diseño

> **Estado:** Aprobado por Jaime Novoa — 2026-03-15
> **Alcance:** Integración Opción B (archivo intermedio ready.json)
> **Herramienta personal — no requiere UI pulida**

---

## Objetivo

Conectar `sentinel_media_scanner` → `sentinel_media_research` → guion Markdown mediante `sentinel_media_cli`.
Primera fase del pipeline YouTube Factory. Solo guiones. Sin audio, video ni publicación.

---

## Flujo

```
[Bóveda .md con truthsync/scvsync score ≥ 0.9]
     ↓  sentinel_media_cli scan
[_Agentes/ready.json]
     ↓  sentinel_media_cli factory --research
[Canal/Guiones/YYYY-MM-DD_titulo.md]
[_Agentes/factory_state.json]
```

---

## Formatos de Archivo

### `_Agentes/ready.json`
Generado por `sentinel_media_cli scan`. Formato existente del scanner:
```json
[
  {
    "file": "/home/jnovoas/Desarrollo/obsidian/SecurePenguin/nota.md",
    "rel_path": "SecurePenguin/nota.md",
    "score": 1.0,
    "status": "UNISON"
  }
]
```

### `_Agentes/factory_state.json`
Estado por item. Permite relanzar sin reprocesar lo ya completado:
```json
[
  {
    "file": "/ruta/absoluta/nota.md",
    "estado": "pendiente|procesando|completado|error",
    "guion": "SecurePenguin/Guiones/2026-03-15_titulo.md",
    "error": null
  }
]
```

### Guion generado (`Canal/Guiones/YYYY-MM-DD_titulo.md`)
```markdown
---
canal: SecurePenguin
fuente: SecurePenguin/nota.md
generado: 2026-03-15
provider: gemini
---
# Hook (30s)
...
# Introducción
...
# Desarrollo
...
# CTA
...
```

La carpeta destino se infiere del `rel_path` de la nota fuente.

---

## Comandos

```bash
# Paso 1: escanear bóveda → ready.json
sentinel_media_cli scan [--vault <ruta>] [--min-score <float>]
# Defecto: --vault ~/Desarrollo/obsidian  --min-score 0.9

# Paso 2: generar guiones desde ready.json
sentinel_media_cli factory --research [--provider gemini|perplexity|groq]
# Defecto: --provider gemini
# Recuperable: salta items ya en estado "completado"

# Utilidades
sentinel_media_cli factory --status   # ver factory_state.json resumido
sentinel_media_cli factory --reset    # limpiar factory_state.json
```

---

## Módulos Afectados

| Módulo | Cambios |
|--------|---------|
| `sentinel_media_cli` | Añadir subcomando `scan` y flags `--research`, `--status`, `--reset` a `factory` |
| `sentinel_media_research` | Fix path `sentinel_keys.json` hardcodeado a ruta antigua |
| `sentinel_media_scanner` | Sin cambios — se invoca como proceso hijo desde `sentinel_media_cli scan` |

### Fix crítico — `sentinel_media_research/src/main.rs`

Cambiar ruta hardcodeada:
```rust
// ACTUAL (incorrecto)
let path = PathBuf::from("/home/jnovoas/Obsidian/_Agentes/sentinel_keys.json");

// CORRECTO — priorizar variable de entorno, fallback a ruta real
let path = std==env==var("BOVEDA_KEYS")
    .map(PathBuf::from)
    .unwrap_or_else(|_| PathBuf::from("/home/jnovoas/Desarrollo/obsidian/_Agentes/sentinel_keys.json"));
```

---

## Error Handling (mínimo viable)

- Si `ready.json` no existe: mensaje claro "Ejecuta primero sentinel_media_cli scan"
- Si un item falla en research: marcarlo como "error" en `factory_state.json`, continuar con el siguiente
- Si `sentinel_keys.json` no tiene claves válidas: error inmediato con mensaje

---

## Fuera de Alcance (esta versión)

- Audio, narrador, avatar digital
- Generación de video
- Publicación en YouTube
- Automatización / watcher / cron
- UI / TUI

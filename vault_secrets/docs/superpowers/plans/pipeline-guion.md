# Pipeline de Generación de Guiones — Plan de Implementación

> **Para agentes:** REQUIRED: Usar `superpowers:executing-plans` para implementar este plan. Pasos con checkbox para seguimiento.

**Objetivo:** Conectar scanner → research → guion Markdown mediante `sentinel_media_cli factory --research`.

**Arquitectura:** `sentinel_media_cli scan` guarda candidatos en `ready.json`. `sentinel_media_cli factory --research` lee ese archivo, invoca `sentinel_media_research` como subproceso por cada candidato, captura el output y lo guarda como guion en `Canal/Guiones/`. El estado persiste en `factory_state.json` para recuperación.

**Tech Stack:** Rust, Clap, Serde/JSON, subprocesos (`std==process==Command`), `sentinel_media_research` (binary), `sentinel_media_scanner` (binary)

**Spec:** `docs/superpowers/specs/2026-03-15-pipeline-guion-design.md`

---

## Chunk 1: Fix rutas hardcodeadas en sentinel_media_research

### Tarea 1: Corregir rutas en `sentinel_media_research/src/main.rs`

**Archivos:**
- Modificar: `_Agentes/sentinel_media_research/src/main.rs` líneas 51, 246, 273, 496, 511, 535

**Contexto:** Hay 7 rutas hardcodeadas a `/home/jnovoas/Obsidian/` que apuntan a la ubicación antigua.
La nueva ruta base es `/home/jnovoas/Desarrollo/obsidian/`.

- [ ] **Paso 1: Añadir función helper de ruta base**

Buscar la función `load_keys()` (alrededor de línea 47) y añadir antes de ella:

```rust
/// Devuelve la ruta base de la Bóveda. Prioriza variable de entorno BOVEDA_HOME.
fn sentinel_media_home() -> PathBuf {
    std==env==var("BOVEDA_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("/home/jnovoas/Desarrollo/obsidian"))
}
```

- [ ] **Paso 2: Reemplazar rutas hardcodeadas**

Aplicar estos reemplazos en `_Agentes/sentinel_media_research/src/main.rs`:

```
# Línea 51
ANTES:  let path = PathBuf::from("/home/jnovoas/Obsidian/_Agentes/sentinel_keys.json");
DESPUÉS: let path = sentinel_media_home().join("_Agentes/sentinel_keys.json");

# Línea 246
ANTES:  let path = PathBuf::from("/home/jnovoas/Obsidian/_Agentes/sentinel_usage.json");
DESPUÉS: let path = sentinel_media_home().join("_Agentes/sentinel_usage.json");

# Línea 273
ANTES:  let path = PathBuf::from("/home/jnovoas/Obsidian/_Agentes/ready.json");
DESPUÉS: let path = sentinel_media_home().join("_Agentes/ready.json");

# Línea 496
ANTES:  let fallback = "/home/jnovoas/Obsidian/_Agentes/.env";
DESPUÉS: let fallback = sentinel_media_home().join("_Agentes/.env");
         let fallback = fallback.to_str().unwrap_or("");

# Línea 535
ANTES:  PathBuf::from("/home/jnovoas/Obsidian/_Agentes")
DESPUÉS: sentinel_media_home().join("_Agentes")
```

- [ ] **Paso 3: Verificar compilación**

```bash
cd /home/jnovoas/Desarrollo/obsidian/_Agentes/sentinel_media_research
cargo check 2>&1 | tail -5
```
Esperado: `Finished` sin errores.

- [ ] **Paso 4: Commit**

```bash
git add _Agentes/sentinel_media_research/src/main.rs
git commit -m "fix(sentinel_media_research): reemplazar rutas hardcodeadas con sentinel_media_home()"
```

---

## Chunk 2: Añadir pipeline de guiones a sentinel_media_cli

### Tarea 2: Nuevas estructuras de datos en `sentinel_media_cli/src/main.rs`

**Archivos:**
- Modificar: `_Agentes/sentinel_media_cli/src/main.rs`

- [ ] **Paso 1: Añadir struct FactoryState**

Buscar la línea donde está `struct Candidate` (alrededor de línea 36) y añadir después:

```rust
#[derive(Serialize, Deserialize, Debug, Clone)]
struct FactoryState {
    file: String,
    rel_path: String,
    estado: String,        // "pendiente" | "procesando" | "completado" | "error"
    guion: Option<String>, // ruta al guion generado
    error: Option<String>,
}
```

- [ ] **Paso 2: Añadir funciones de gestión de factory_state.json**

Buscar la función `load_operations()` (alrededor de línea 67) y añadir antes de ella:

```rust
fn factory_state_path(base_dir: &Path) -> PathBuf {
    base_dir.join("_Agentes/factory_state.json")
}

fn load_factory_state(base_dir: &Path) -> Result<Vec<FactoryState>> {
    let path = factory_state_path(base_dir);
    if !path.exists() {
        return Ok(vec![]);
    }
    let content = std==fs==read_to_string(&path)?;
    Ok(serde_json::from_str(&content).unwrap_or_default())
}

fn save_factory_state(base_dir: &Path, state: &[FactoryState]) -> Result<()> {
    let path = factory_state_path(base_dir);
    let content = serde_json::to_string_pretty(state)?;
    std==fs==write(&path, content)?;
    Ok(())
}

fn infer_guion_path(rel_path: &str, base_dir: &Path) -> PathBuf {
    // Infiere la carpeta del canal desde rel_path
    // "SecurePenguin/nota.md" → base_dir/SecurePenguin/Guiones/
    let canal = Path::new(rel_path)
        .components()
        .next()
        .and_then(|c| c.as_os_str().to_str())
        .unwrap_or("Guiones");

    let fecha = chrono==Utc==now().format("%Y-%m-%d").to_string();
    let stem = Path::new(rel_path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("guion");

    base_dir
        .join(canal)
        .join("Guiones")
        .join(format!("{}_{}.md", fecha, stem))
}
```

- [ ] **Paso 3: Verificar compilación**

```bash
cd /home/jnovoas/Desarrollo/obsidian/_Agentes/sentinel_media_cli
cargo check 2>&1 | tail -5
```
Esperado: `Finished` sin errores.

---

### Tarea 3: Añadir flags `--research`, `--status`, `--reset`, `--provider` al comando Factory

**Archivos:**
- Modificar: `_Agentes/sentinel_media_cli/src/main.rs`

- [ ] **Paso 1: Añadir flags al enum Factory**

Buscar el bloque `Factory {` en el enum `Commands` (alrededor de línea 346) y añadir estos campos:

```rust
Factory {
    // ... campos existentes ...
    #[arg(long)]
    research: bool,
    #[arg(long, default_value = "gemini")]
    provider: String,
    #[arg(long)]
    status: bool,
    #[arg(long)]
    reset: bool,
    // ... resto de campos existentes ...
}
```

- [ ] **Paso 2: Añadir los nuevos campos al handler de Factory**

Buscar `Commands::Factory {` en el handler (alrededor de línea 1133) y añadir `research, provider, status, reset,` a la desestructuración.

- [ ] **Paso 3: Verificar compilación**

```bash
cd /home/jnovoas/Desarrollo/obsidian/_Agentes/sentinel_media_cli
cargo check 2>&1 | tail -5
```
Esperado: `Finished` sin errores.

---

### Tarea 4: Implementar el pipeline de research en el handler de Factory

**Archivos:**
- Modificar: `_Agentes/sentinel_media_cli/src/main.rs`

- [ ] **Paso 1: Añadir rama `--status` al handler**

Dentro de `Commands::Factory { ... } =>`, al inicio del bloque (antes del código existente de scan), añadir:

```rust
// --- MODO STATUS ---
if status {
    let state = load_factory_state(&base_dir)?;
    if state.is_empty() {
        println!("factory_state.json vacío o no existe. Ejecuta primero: sentinel_media_cli scan && sentinel_media_cli factory --research");
        return Ok(());
    }
    let completados = state.iter().filter(|s| s.estado == "completado").count();
    let errores = state.iter().filter(|s| s.estado == "error").count();
    let pendientes = state.iter().filter(|s| s.estado == "pendiente").count();
    println!("📊 Estado del factory:");
    println!("  ✅ Completados: {}", completados);
    println!("  ⏳ Pendientes:  {}", pendientes);
    println!("  ❌ Errores:     {}", errores);
    for item in &state {
        let icon = match item.estado.as_str() {
            "completado" => "✅",
            "error" => "❌",
            "procesando" => "⏳",
            _ => "📄",
        };
        println!("  {} {} → {}", icon, item.rel_path, item.guion.as_deref().unwrap_or("-"));
    }
    return Ok(());
}

// --- MODO RESET ---
if reset {
    let path = factory_state_path(&base_dir);
    if path.exists() {
        std==fs==remove_file(&path)?;
        println!("🗑️  factory_state.json eliminado. Próximo factory procesará todo desde cero.");
    } else {
        println!("factory_state.json no existe.");
    }
    return Ok(());
}
```

- [ ] **Paso 2: Añadir rama `--research` al handler**

Después del bloque de `--status` y `--reset`, añadir:

```rust
// --- MODO RESEARCH (genera guiones) ---
if research {
    let ready_path = base_dir.join("_Agentes/ready.json");
    if !ready_path.exists() {
        anyhow::bail!("❌ ready.json no encontrado. Ejecuta primero: sentinel_media_cli scan");
    }

    let content = std==fs==read_to_string(&ready_path)?;
    let candidates: Vec<Candidate> = serde_json::from_str(&content)
        .context("Error parseando ready.json")?;

    if candidates.is_empty() {
        println!("⚠️  ready.json está vacío. No hay candidatos para procesar.");
        return Ok(());
    }

    // Cargar estado previo (recuperación)
    let mut state = load_factory_state(&base_dir)?;

    // Sincronizar: añadir candidatos nuevos como "pendiente"
    for c in &candidates {
        if !state.iter().any(|s| s.file == c.file) {
            state.push(FactoryState {
                file: c.file.clone(),
                rel_path: c.rel_path.clone(),
                estado: "pendiente".to_string(),
                guion: None,
                error: None,
            });
        }
    }
    save_factory_state(&base_dir, &state)?;

    let total = state.iter().filter(|s| s.estado == "pendiente").count();
    println!("📝 Generando guiones para {} candidatos (provider: {})...", total, provider);

    let research_bin = check_and_compile("sentinel_media_research", "sentinel_media_research")?;

    for item in state.iter_mut() {
        if item.estado != "pendiente" {
            println!("  ⏭️  Saltando {} ({})", item.rel_path, item.estado);
            continue;
        }

        println!("  🔬 Procesando: {}", item.rel_path);
        item.estado = "procesando".to_string();
        save_factory_state(&base_dir, &state)?;

        let prompt = format!(
            "Genera un guion completo para YouTube sobre el contenido de este archivo. \
            Estructura: Hook (30s), Introducción, Desarrollo, Conclusión, CTA. \
            Idioma: español. Formato: Markdown.",
        );

        let mut cmd = Command::new(&research_bin);
        cmd.arg("--file").arg(&item.file)
           .arg("--prompt").arg(&prompt)
           .arg("--deep");

        match provider.as_str() {
            "perplexity" => { cmd.arg("--perplexity"); }
            "groq"       => { cmd.arg("--groq"); }
            _            => {} // gemini por defecto
        }

        let output = cmd.output()
            .context(format!("Error ejecutando sentinel_media_research para {}", item.rel_path))?;

        if output.status.success() {
            let guion_content = String::from_utf8_lossy(&output.stdout);
            let guion_path = infer_guion_path(&item.rel_path, &base_dir);

            // Crear directorio si no existe
            if let Some(parent) = guion_path.parent() {
                std==fs==create_dir_all(parent)?;
            }

            // Añadir frontmatter al guion
            let fecha = chrono==Utc==now().format("%Y-%m-%d").to_string();
            let frontmatter = format!(
                "---\ncanal: {}\nfuente: {}\ngenerado: {}\nprovider: {}\n---\n\n",
                Path::new(&item.rel_path).components().next()
                    .and_then(|c| c.as_os_str().to_str()).unwrap_or("unknown"),
                item.rel_path,
                fecha,
                provider
            );
            let contenido_final = format!("{}{}", frontmatter, guion_content);

            std==fs==write(&guion_path, contenido_final)?;

            item.estado = "completado".to_string();
            item.guion = Some(guion_path.to_string_lossy().to_string());
            println!("    ✅ Guion guardado: {}", guion_path.display());
        } else {
            let err = String::from_utf8_lossy(&output.stderr).to_string();
            item.estado = "error".to_string();
            item.error = Some(err.clone());
            println!("    ❌ Error: {}", err.lines().last().unwrap_or("desconocido"));
        }

        save_factory_state(&base_dir, &state)?;
    }

    let completados = state.iter().filter(|s| s.estado == "completado").count();
    let errores = state.iter().filter(|s| s.estado == "error").count();
    println!("\n📊 Resumen: {} completados, {} errores", completados, errores);
    return Ok(());
}
```

- [ ] **Paso 3: Verificar compilación**

```bash
cd /home/jnovoas/Desarrollo/obsidian/_Agentes/sentinel_media_cli
cargo check 2>&1 | grep -E "^error" | head -20
```
Esperado: sin errores `^error`.

- [ ] **Paso 4: Build release**

```bash
cd /home/jnovoas/Desarrollo/obsidian/_Agentes/sentinel_media_cli
cargo build --release 2>&1 | tail -5
```
Esperado: `Finished release`.

- [ ] **Paso 5: Commit**

```bash
git add _Agentes/sentinel_media_cli/src/main.rs
git commit -m "feat(sentinel_media_cli): implementar pipeline factory --research para generación de guiones"
```

---

## Chunk 3: Fix ruta en sentinel_media_cli + prueba end-to-end

### Tarea 5: Corregir ruta SKILLS_README en sentinel_media_cli

**Archivos:**
- Modificar: `_Agentes/sentinel_media_cli/src/main.rs` línea 1749

- [ ] **Paso 1: Corregir ruta**

```
ANTES:  std==fs==read_to_string("/home/jnovoas/Obsidian/_Agentes/SKILLS_README.md")
DESPUÉS: std==fs==read_to_string(
    format!("{}/Desarrollo/obsidian/_Agentes/SKILLS_README.md",
        std==env==var("HOME").unwrap_or_default())
)
```

- [ ] **Paso 2: Build final**

```bash
cd /home/jnovoas/Desarrollo/obsidian/_Agentes
cargo build --release -p sentinel_cli 2>&1 | tail -5
# o si cada crate es independiente:
cd sentinel_media_cli && cargo build --release 2>&1 | tail -5
```

- [ ] **Paso 3: Commit**

```bash
git add _Agentes/sentinel_media_cli/src/main.rs
git commit -m "fix(sentinel_media_cli): corregir ruta SKILLS_README a ubicación real"
```

---

### Tarea 6: Prueba end-to-end

**Prerequisito:** Tener `sentinel_keys.json` con al menos una clave Gemini válida en `_Agentes/`.

- [ ] **Paso 1: Verificar sentinel_keys.json**

```bash
ls /home/jnovoas/Desarrollo/obsidian/_Agentes/sentinel_keys.json
# Si no existe, crearlo con:
# { "gemini_api_keys": "TU_API_KEY_AQUI" }
```

- [ ] **Paso 2: Escanear la bóveda**

```bash
cd /home/jnovoas/Desarrollo/obsidian/_Agentes/sentinel_media_cli
./target/release/sentinel_cli scan --vault /home/jnovoas/Desarrollo/obsidian --min-score 0.9 --output /home/jnovoas/Desarrollo/obsidian/_Agentes/ready.json
```
Esperado: `✅ Scan complete. Saved to ready.json`

- [ ] **Paso 3: Verificar candidatos**

```bash
cat /home/jnovoas/Desarrollo/obsidian/_Agentes/ready.json | python3 -m json.tool | head -30
```
Esperado: lista JSON de notas con score ≥ 0.9

- [ ] **Paso 4: Si no hay candidatos — crear nota de prueba**

```bash
cat > /home/jnovoas/Desarrollo/obsidian/SecurePenguin/test_pipeline.md << 'EOF'
---
truthsync:
  status: UNISON
  score: 1.0
---
# Test Pipeline — XZ Backdoor

Análisis del backdoor XZ Utils (CVE-2024-3094) y sus implicaciones de seguridad.
EOF
```

Re-ejecutar el scan del Paso 2.

- [ ] **Paso 5: Verificar estado antes de procesar**

```bash
./target/release/sentinel_cli factory --status
```
Esperado: mensaje de factory_state.json vacío o lista de candidatos pendientes.

- [ ] **Paso 6: Generar guiones**

```bash
./target/release/sentinel_cli factory --research --provider gemini
```
Esperado: output mostrando procesamiento de cada candidato y `✅ Guion guardado: SecurePenguin/Guiones/...`

- [ ] **Paso 7: Verificar guion generado**

```bash
ls /home/jnovoas/Desarrollo/obsidian/SecurePenguin/Guiones/
cat /home/jnovoas/Desarrollo/obsidian/SecurePenguin/Guiones/*.md | head -40
```
Esperado: archivo Markdown con frontmatter y estructura Hook/Intro/Desarrollo/CTA.

- [ ] **Paso 8: Verificar estado final**

```bash
./target/release/sentinel_cli factory --status
```
Esperado: muestra items completados con ruta al guion.

- [ ] **Paso 9: Commit final**

```bash
cd /home/jnovoas/Desarrollo/obsidian
git add SecurePenguin/Guiones/ _Agentes/factory_state.json _Agentes/ready.json
git commit -m "test: primera ejecución end-to-end del pipeline de guiones"
```

---

## Referencia rápida de comandos finales

```bash
# Flujo completo
sentinel_media_cli scan --vault ~/Desarrollo/obsidian --min-score 0.9 --output ~/Desarrollo/obsidian/_Agentes/ready.json
sentinel_media_cli factory --research --provider gemini

# Utilidades
sentinel_media_cli factory --status
sentinel_media_cli factory --reset

# Con otro provider
sentinel_media_cli factory --research --provider perplexity
```

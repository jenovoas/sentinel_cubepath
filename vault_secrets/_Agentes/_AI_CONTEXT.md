# 🛡️ Bóveda Automatizada Context (Root)

> **Regla de Inicio**: TODO agente DEBE leer este archivo y `PROJECT_CONTEXT_RULES.md` íntegramente al iniciar la sesión. Las reglas y rutas han sido purgadas de repositorios heredados.

---

## 🏗️ Estado de Saneamiento DNA (Módulos Nativos)

El sistema ha sido reestructurado hacia una Factory de agentes limpios en Rust sobre el root (`sentinel_media`).

### 1. Ubicación de Prompts (DNA Obligatorio)

- Los prompts maestros para la IA del pipeline residen en `/home/jnovoas/Desarrollo/sentinel_media/vault/_Agentes/prompts/`.
- La orquestación en Rust debe enrutar y recuperar sus instrucciones dinámicas `youtube_architect` desde esta bóveda.

### 2. Gestión de Recursos

- Los motores de renderizado (`media`) consumen altos picos de hardware. El despliegue de dependencias incluye `libwebkit2gtk-4.1-dev` y compiladores C para Tauri.

### 3. Configuración del Entorno (Antigravity & Cargo)

- Todo agente AI autónomo como Google Antigravity debe operar dentro de las directrices de `sentinel_media`.
- Prevención fundamental: JAMÁS borrar un componente sin validación humana explícita. "Refactorizar" no significa borrar lógica.

## ⚙️ MANDATOS DE ACERO PARA LA IA

1. **NO SIMULAR Y NO SIMPLIFICAR**: La regla de oro. No te inventes comandos falsos ni reduzcas métodos complejos asumiendo que el usuario quiere ver "código limpio".
2. **ESPAÑOL COMO LÍMITE**: Toda respuesta humana, log, README y comentario va en Español sagrado.
3. **RUST NATIVE & BASH**: Si el pipeline de `sentinel_media` requiere un wrapper, hazlo asíncrono sobre Tokio. Las integraciones de UI son exclusivas para Tauri React en el folder gui.

---
_Sincronizado bajo pureza de contexto técnico de la YouTube Factory._

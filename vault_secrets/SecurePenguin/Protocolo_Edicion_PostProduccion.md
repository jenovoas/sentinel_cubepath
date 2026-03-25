# 🛠️ Protocolo de Edición y Post-Producción: SecurePenguin

Este documento define el flujo de trabajo desde que se genera el video crudo hasta que se autoriza su publicación official.

## 📥 1. Fase de Procesamiento (Raw to Master)

El Swarm genera clips individuales (`_gen.mp4`), pero la post-producción asegura la narrativa.

1.  **Ensamblaje (Stitching)**:
    - Commando: `sentinel factory --vault /path/to/SecurePenguin --stitch`
    - Resultado: Se genera un archivo `Master_Chain_[DATE]_gen.mp4`.
2.  **Revisión Técnica (QC - Quality Control)**:
    - Verificar que los diagrams de código sean legibles (4K).
    - Comprobar que la voz (V.O.) esté sincronizada con las transiciones visuals.
    - **Regla de Oro**: Si el video tiene alucinaciones visuals graves en el código, repetir la generación del clip específico con un prompt más restrictivo.

## 🧪 2. Post-Producción Avanzada (Opcional/Manual)

Si decides pasar el video por una suite de edición (Kdenlive, Resolve, Premiere):

- **Capas de Superposición**: Añadir logs de terminal reales grabados en `.webm`.
- **Audio**: Normalización a -14 LUFS (estándar de YouTube).
- **B-Roll**: Insertar los clips generados por Veo 3 Fast en los mementos de mayor tensión narrativa.

## 🧱 3. Recopilación de Contenidos Faltantes

Antes de exportar el Master, verifica que tienes:

- [ ] **Código Fuente**: Snippets reales de Rust o scripts de Bash comentados.
- [ ] **Diagrams de Red**: Representación visual de Namespaces o el backdoor IFUNC.
- [ ] **Miniatura (Thumbnail)**: Generar con Imagen 3 usando el prompt: _"Cyber-arcana style thumbnail, a glowing blue penguin holding a digital shield against high-tech icebergs, dramatic lighting, 4K."_
- [ ] **Transcripción**: Para subtítulos (SEO).

## 🚀 4. Checklist PRE-PUBLISH

Una vez que el video está en la carpeta de la bóveda:

1.  **Metadata SEO**:
    - **Título**: ¿Tiene el Gancho/Hook (ej. "500ms...")?
    - **Descripción**: ¿Incluye enlaces a GitHub y referencias bibliográficas?
2.  **Validación de Canal**:
    - Asegurar que `channels.yaml` tiene el mapeo `SecurePenguin: SecurePenguin`.
3.  **Staging**:
    - Mover el video definitivo a la carpeta raíz del canal en la bóveda.
    - Borrar versiones `_gen.mp4` temporales para evitar subidas duplicadas.

---

_Protocolo de Calidad generado por Antigravity ⚛️._

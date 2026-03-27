# 🧠 RAG (Retrieval-Augmented Generation) - Almacén Vectorial Semántico

RAG (Retrieval-Augmented Generation), o Generación Aumentada por Recuperación, representa una arquitectura fundamental en sistemas de inteligencia artificial que buscan armonizar la **recuperación de información contextual** con la **síntesis generativa de ideas**. En lugar de depender únicamente de su conocimiento interno, un modelo RAG accede a una base de conocimiento externa, enriqueciendo y fundamentando sus respuestas. Esto minimiza la "alucinación" (invención de información) y aumenta la precisión, acercando las respuestas a una representación más fiel de la realidad.

Este documento describe la implementación específica de un almacén vectorial RAG, diseñado para una búsqueda semántica de alta velocidad y eficiencia dentro del **Cortex Flow** de Sentinel.

## 🗄️ Arquitectura del Almacén Vectorial (Sentinel Memory)

Esta implementación se distingue por su enfoque en la eficiencia, baja latencia y la resonancia nativa con el ecosistema Sentinel, aprovechando Rust y el framework Candle. La **Memoria Vectorial** (nombre interno: `sentinel_memory.json`) actúa como un reflejo computacional del conocimiento persistente del agente.

- **Motor:** Desarrollado en Rust, el "metal" de Sentinel, utilizando Candle para la inferencia de modelos de aprendizaje automático. Rust asegura rendimiento, seguridad y control de recursos.
- **Modelo de Embedding:** `all-MiniLM-L6-v2`. Este modelo MiniLM (Lightweight and Minimal Language Model) genera embeddings vectoriales a partir del texto. Su arquitectura optimizada balancea velocidad de inferencia y precisión semántica. Los vectors de 384 dimensions ofrecen un equilibrio entre la representación detallada del significado y el coste computacional.
- **Almacenamiento:** Un archivo JSON local, `~/.sentinel_memory.json`, almacena los vectors. Esta elección simplifica la implementación y facilita el acceso rápido a los datos, si bien puede presentar limitaciones de escalabilidad para grandes volúmenes de información. El archivo se concibe como un _grafo latente_, una proyección vectorial del conocimiento.
- **Dimensión de Vectors:** Cada documento se representa mediante un vector de 384 dimensions. Esta dimensionalidad captura las sutilezas semánticas del texto, permitiendo comparaciones significativas entre conceptos.

## 🚀 Capacidades del Sistema RAG (Sentinel v8.5)

1. **Ingesta Inteligente:** El sistema escanea directorios e indexa fragmentos de texto relevantes, junto con metadatos sobre su origen. La ingesta automatizada simplifica la actualización y el mantenimiento de la base de conocimiento, creando un ciclo continuo de aprendizaje.
2. **Búsqueda Semántica:** A diferencia de la búsqueda basada en palabras clave, la búsqueda semántica encuentra información relevant incluso con terminología diferente. Esto se logra calculando la similitud coseno entre los vectors de los documentos y el vector de la consulta, revelando la _resonancia semántica_ entre las ideas.
3. **Cortex Flow L0:** Este almacén vectorial RAG actúa como la capa de consulta inicial (`L0`) para los agentes Sentinel. Antes de búsquedas externas, los agentes consultan esta memoria local, optimizando el rendimiento y minimizando la dependencia de recursos externos. Es la primera línea de defensa contra la "alucinación".

## 🛠️ Administración del Almacén Vectorial (Sentinel CLI)

### Rutas y Archivos

- **Ubicación del Archivo de Datos:** `~/.sentinel_memory.json`. Este archivo alberga la representación vectorial de toda la base de conocimiento, sirviendo como el núcleo de la memoria del agente.

### Commandos de Sincronización (sentinel memory)

- **Sincronización con Obsidian:** `sentinel memory ingest --path ~/documentos/Obsidian`. Indexa el contenido de las notas de Obsidian y lo almacena en el almacén vectorial. Ejecutar este commando periódicamente mantiene la base de conocimiento actualizada, reflejando la evolución del pensamiento.
- **Vaciar Memoria:** `sentinel memory clear`. Elimina todos los embeddings del almacén vectorial. Útil para empezar desde cero o depurar problemas.

### Consultas (sentinel memory)

- **Ejecutar Consultas:** `sentinel memory query "concepto clave"`. Realiza búsquedas semánticas en el almacén vectorial, utilizando un "concepto clave" como entrada. Devuelve los documentos más relevantes en función de su similitud semántica con la consulta, revelando conexiones inesperadas.

## Casos de Uso (Resonancia Armónica)

- **Asistente de Investigación:** Encuentra rápidamente información relevant dentro de una vasta base de conocimiento, optimizando la investigación. Imagina un bibliotecario cuántico que te guía instantáneamente a la información más relevant.
- **Sistema de Preguntas y Respuestas:** Construye sistemas de preguntas y respuestas que proporcionan respuestas precisas y contextualizadas basadas en el conocimiento almacenado.
- **Agente de Soporte:** Facilita la resolución de problemas al proporcionar a los agentes de soporte acceso rápido a información relevant sobre productos, servicios y políticas.

## Consideraciones Adicionales (Axiomas Inmutables Prime)

- **Escalabilidad:** La elección de un archivo JSON local para el almacenamiento puede limitar la escalabilidad para grandes volúmenes de datos. Considerar bases de datos vectoriales como ChromaDB o Weaviate para aplicaciones con mayores necesidades de escalabilidad.
- **Actualización de Embeddings:** Actualizar los embeddings periódicamente para reflejar cambios en el lenguaje y el conocimiento. Esto asegura la precisión y relevancia de la memoria vectorial.
- **Evaluación del Rendimiento:** Evaluar el rendimiento del sistema RAG con métricas como precisión, recall y latencia. Esto permite identificar áreas de mejora y optimizar la configuración.
- **Seguridad:** Proteger el archivo `~/.sentinel_memory.json` contra acceso no autorizado, ya que contiene una representación vectorial de tu conocimiento.

## Advertencias

- **Riesgo de "Sobre-Confianza":** RAG puede dar una falsa sensación de certeza. Valida siempre la información recuperada con fuentes externas.
- **Sesgos Inherentes:** Los embeddings reflejan los sesgos presentes en los datos de entrenamiento. Sé consciente de esto y busca diversificar tus fuentes de información.

## Referencias

- **all-MiniLM-L6-v2:** [Hugging Face Model Card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) - Documentación del modelo de embedding `all-MiniLM-L6-v2`.
- **Candle Framework:** [Candle Documentation](https://github.com/huggingface/candle) - Documentación official del framework Candle.
- **Similitud Coseno:** [Wikipedia - Coseno Similaridad](https://es.wikipedia.org/wiki/Coseno_similaridad) - Explicación del concepto de similitud coseno.
- **ChromaDB:** [ChromaDB Documentation](https://www.trychroma.com/) - Documentación de la base de datos vectorial ChromaDB.
- **Weaviate:** [Weaviate Documentation](https://weaviate.io/developers/) - Documentación de la base de datos vectorial Weaviate.

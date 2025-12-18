# .gemini/ - Librería de Automatización Documental

Esta carpeta contiene la "inteligencia operativa" para mantener la documentación y las especificaciones técnicas de **Calamar Loco** siempre sincronizadas y con alta calidad.

## 🗂️ Contenido

### 🎭 Prompts de Antigravity
Estos archivos contienen instrucciones estructuradas para ser utilizadas con el asistente Antigravity. Copia el contenido del archivo y pégalo en el chat para ejecutar la tarea correspondiente.

- **`sync-docs.md`**: Úsalo para auditar la cobertura documental. Ideal después de completar una fase o mergear grandes refactors. Actualiza la matriz de `docs/DOCS_AUDIT.md`.
- **`create-audio-spec.md`**: Genera o actualiza la especificación técnica de audio según la TASK-002.
- **`create-store-api-spec.md`**: Genera o actualiza la especificación técnica del Store (Zustand) según la TASK-012/018.
- **`create-contributing.md`**: Genera o actualiza la guía de contribución del proyecto.

### 🛠️ Scripts
- **`validate-links.cjs`**: Verifica que no haya links internos rotos.
  - **Uso:** `node .gemini/validate-links.cjs`
- **`audit-docs.cjs`**: Auditor de calidad documental (naming, TASK-ID, frontmatter, etc.).
  - **Uso:** `node .gemini/audit-docs.cjs`

## 🚀 Flujo de Trabajo Recomendado

1. **Al iniciar una TASK de documentación:** Usa el prompt específico de la librería para sentar las bases técnicas.
2. **Antes de un Release:** Ejecuta el script de validación de links para asegurar la integridad de la navegación.
3. **Mantenimiento Mensual:** Ejecuta el prompt de `sync-docs.md` para refrescar la matriz de cobertura y detectar "specs huérfanas".

---
🔗 Referencia principal: [TASK.MD](../docs/TASK.MD) | [DOCS_AUDIT.md](../docs/DOCS_AUDIT.md)

# Prompt: Sincronización Documental

**ACTÚA COMO:** Antigravity Gemini 3 Flash, auditor de documentación (docs-as-code).

**OBJETIVO:**
Auditar y sincronizar la cobertura de especificaciones técnicas en `docs/DOCS_AUDIT.md` basándose en la fuente de verdad del proyecto: `docs/TASK.MD`.

**INSTRUCCIONES:**

1. **Análisis de Cobertura:**
   - Lee `docs/TASK.MD` para identificar todas las tareas críticas (TASK-XXX).
   - Lee todos los archivos en `/docs/*.md` para verificar qué tareas tienen especificación técnica.
2. **Actualizar `docs/DOCS_AUDIT.md`:**
   - **Inventario:** Actualiza el inventario de archivos con su propósito y tareas cubiertas.
   - **Matriz de Cobertura:** Actualiza la tabla mapeando cada TASK con su documento de spec correspondiente. Marca con ✅ (OK), ⚠️ (Mínimo/Incompleto) o ❌ (Pendiente/Faltante).
3. **Generar Acciones Correctivas:**
   - Si una TASK crítica no tiene spec, lístala en la sección de "Pendientes".
   - Si una spec es inconsistente con el código actual, marca la necesidad de refactor documental.
4. **Resumen de Cambios:**
   - Detalla qué se ha actualizado en la auditoría técnica.

**SALIDA ESPERADA:**
Un reporte detallado en `docs/DOCS_AUDIT.md` que garantice la trazabilidad completa entre el backlog y la documentación técnica.

**GIT (OBLIGATORIO):**
Al finalizar, ejecutar:

git add docs/DOCS_AUDIT.md
git commit -m "docs: update DOCS_AUDIT after sync — [fecha]"
git push

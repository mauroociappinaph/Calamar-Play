# Prompt: Creación de Audio Spec

**ACTÚA COMO:** Antigravity Gemini 3 Flash, ingeniero de audio y arquitecto de sistemas.

**OBJETIVO:**
Generar o actualizar `docs/AUDIO_SPEC.md` alineado con la **TASK-002** y el estándar del repositorio.

**INSTRUCCIONES:**

1. **Estructura Requerida:**
   - H1: AUDIO_SPEC.md
   - Banner de alineación con `docs/TASK.MD`.
   - Introducción y Objetivos.
   - Especificación Técnica: Arquitectura del motor (`src/systems/audio/`), formatos de assets, capas del mixer, políticas de desbloqueo (Audio Unlock).
   - Tabla de Feedback Audiovisual.
   - Métricas de éxito.
2. **Contexto Técnico:**
   - El sistema debe ser desacoplado de React para evitar latencia.
   - Debe manejar crossfading y pitch randomization.
3. **Referencias:**
   - Linkear a `TASK.MD` y `README.md`.

**SALIDA ESPERADA:**
Un documento técnico profesional que sirva como plano para la implementación del sistema de audio de Calamar Loco.

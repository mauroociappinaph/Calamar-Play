# Prompt: Creación de Audio Spec

**ACTÚA COMO:** Antigravity Gemini 3 Flash, ingeniero de audio y arquitecto de sistemas.

**OBJETIVO:**
Generar o actualizar `docs/AUDIO_SPEC.md` alineado con **TASK-002** y el estándar documental del repositorio.

**INSTRUCCIONES:**

1. **Estructura Requerida:**
   - Título H1: AUDIO_SPEC.md
   - Banner de alineación con `[TASK.MD](./TASK.MD)` y referencia a TASK-002.
   - Sección de Introducción y Objetivos.
   - Especificación Técnica:
     - Arquitectura del motor (`src/systems/audio/`): interfaces, dependencias, desacople de React.
     - Formatos de assets: música, SFX, almacenamiento recomendado.
     - Capas del mixer: master, music, SFX, ambience.
     - Políticas de desbloqueo (Audio Unlock): manejo de interacción de usuario y fallback visual.
   - Tabla de Feedback Audiovisual: eventos, SFX, lógica de reproducción.
   - Métricas de éxito: latencia, memoria, engagement.
2. **Contexto Técnico:**
   - El sistema debe ser desacoplado de React para evitar latencia de re-render.
   - Debe manejar crossfading, pitch randomization y control de volumen por categoría.
3. **Referencias:**
   - Linkear a `[TASK.MD](./TASK.MD)` y `[README.md](../README.md)` en el footer.
   - Footer con fecha de última actualización.

**SALIDA ESPERADA:**
Un documento técnico profesional, listo para implementación, que sirva como plano para el sistema de audio de Calamar Loco y cumpla con el estándar documental del proyecto.

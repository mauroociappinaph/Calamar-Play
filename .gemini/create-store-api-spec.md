# Prompt: Creación de Store API Spec

**ACTÚA COMO:** Antigravity Gemini 3 Flash, arquitecto de estado y desarrollador senior.

**OBJETIVO:**
Generar o actualizar `docs/STORE_API.md` alineado con **TASK-012** (Documentar API del Store) y **TASK-018** (FSM), siguiendo el estándar documental del repositorio.

**INSTRUCCIONES:**

1. **Estructura Requerida:**
   - Título H1: STORE_API.md
   - Banner de alineación con `[TASK.MD](./TASK.MD)` y referencia a TASK-012 y TASK-018.
   - Sección de Introducción y Objetivo.
   - Definición del Estado (Zustand) dividido por dominios (Game, Player, etc.).
   - Especificación de Acciones (Public API) con firmas de TypeScript y descripciones.
   - Definición de la Máquina de Estados (FSM) de GameStatus: estados, transiciones, eventos.
   - Estrategia de Persistencia y Middlewares (ej: persist, immer, devtools).
2. **Estándares:**
   - Enfatizar el uso de inmutabilidad y selectores para evitar re-renders innecesarios.
   - Trazabilidad con el plan de refactor de la Fase 1 (slices, boundaries, barrels).
   - Ejemplo de uso de selectores y acciones en componentes.
3. **Referencias:**
   - Linkear a `[TASK.MD](./TASK.MD)`, `[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)` y `[README.md](../README.md)` en el footer.
   - Footer con fecha de última actualización.

**SALIDA ESPERADA:**
Un contrato técnico claro y profesional que defina cómo interactúa el motor del juego con el estado global de forma segura, performante y alineada con la arquitectura propuesta.

# Prompt: Creación de Store API Spec

**ACTÚA COMO:** Antigravity Gemini 3 Flash, arquitecto de estado y desarrollador senior.

**OBJETIVO:**
Generar o actualizar `docs/STORE_API.md` alineado con la **TASK-012** (Documentar API del Store) y la **TASK-018** (FSM).

**INSTRUCCIONES:**

1. **Estructura Requerida:**
   - H1: STORE_API.md
   - Banner de alineación con `docs/TASK.MD`.
   - Definición del Estado (Zustand) dividido por dominios (Game, Player).
   - Especificación de Acciones (Public API) con firmas de TypeScript.
   - Definición de la Máquina de Estados (FSM) de GameStatus.
   - Estrategia de Persistencia y Middlewares.
2. **Estándares:**
   - Enfatizar el uso de inmutabilidad y selectores.
   - Trazabilidad con el plan de refactor de la Fase 1.

**SALIDA ESPERADA:**
Un contrato técnico que defina cómo interactúa el motor del juego con el estado global de forma segura y performante.

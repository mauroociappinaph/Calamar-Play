# PROJECT_STRUCTURE.md

> 🏗️ Propuesta de Arquitectura de Software – alineada con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)
> Fecha de generación: 2025-12-17

## 1. Introducción y Visión
Este documento define la arquitectura objetivo para el proyecto **Calamar Loco**. El objetivo es migrar de una estructura plana y acoplada hacia una arquitectura modular basada en **Features** y **Sistemas de Responsabilidad Única (SRP)**, garantizando escalabilidad y mantenibilidad mediante patrones **DRY** y **Barrel Files**.

---

## 2. Inventario de la Estructura Actual
Actualmente, el proyecto presenta una estructura simplificada con lógica dispersa en la raíz:

- **Raíz:** `store.ts` (God State), `types.ts` (Global Types), `App.tsx` (Entry), `index.css`.
- **docs/:** Análisis de departamentos (sincronizados).
- **components/:**
    - `UI/`: `HUD.tsx` (Altamente acoplado al store).
    - `World/`: `LevelManager.tsx` (Hotspot: maneja spawn, colisiones y lógica), `Player.tsx`.
    - `System/`: `Audio.ts`.
- **configs:** `vite.config.ts`, `tsconfig.json`, `package.json`.

**Problemas detectados:**
- **Acoplamiento Directo:** Componentes de la vista (World) manejan lógica de negocio directamente.
- **Falta de SRP:** `LevelManager` es excesivamente complejo.
- **Imports Relativos:** Uso de `../../` que dificulta el refactor.

### Mapping rápido (estructura actual → estructura objetivo)

- `components/World/` → `src/world/`
- `components/UI/` → `src/features/ui/` (o `src/shared/components/` para componentes atómicos)
- `components/System/Audio.ts` → `src/systems/audio/` (scheduler/engine de audio sin React; integra Web Audio API y assets)

---

## 3. Principios de Arquitectura (SRP/DRY)

### A) Single Responsibility Principle (SRP)
Dividimos la lógica en tres capas claras:
1.  **Sistemas (Logic):** Lógica pura (clases o funciones) que no depende de React/ThreeFiber (ej: Pooling, Physics).
2.  **State (Data):** El estado se organiza por dominio dentro de `features/*/state`; no se crea un `src/state` global.
3.  **Features (UI/View):** Componentes visuales y hooks que consumen los sistemas y el estado.

### B) Don't Repeat Yourself (DRY)
- **Shared:** Todo lo que se use en más de una feature vive en `src/shared`.
- **Constants:** No más "magic numbers" en componentes. Todo reside en `src/shared/constants`.

### C) Barrel Files (index.ts) y Encapsulamiento
Para evitar el "acoplamiento spaghetti" y asegurar una API limpia por módulo:
- **Exports Explícitos:** Se prohíbe el uso de `export *` de forma indiscriminada. Se deben declarar explícitamente las funciones, tipos o componentes que forman parte de la API pública.
- **Excepción para Barrels:** Se permite/recomienda `export * from './public'` únicamente desde el archivo `index.ts` principal de una carpeta, siempre que `public.ts` contenga los exports explícitos.
- **Patrón `public.ts`:** Cada feature/sistema debe tener un archivo `public.ts` que defina su API externa.
- **Boundaries:** Desde fuera de una feature, solo está permitido importar desde su `index.ts` (ej: `@/features/game`). Nunca realizar imports profundos (ej: `@/features/game/internal/utils`).

### D) Regla de Imports y Alias Único
- **Alias Único:** Se utilizará un único alias `@` que apunta a `/src`.
- **Estructura de rutas:**
  - `@/app/...`
  - `@/features/...`
  - `@/shared/...`
  - `@/systems/...`
  - `@/world/...`
- **Ventaja:** Elimina la confusión de múltiples alias y mantiene las rutas predecibles.

## 4. Reglas SRP por capas (qué va en cada lugar)

- **`src/shared/`**: Código agnóstico al dominio. Utilidades matemáticas, constantes de configuración, hooks genéricos y componentes de UI atómicos que no conocen el estado global del juego.
- **`src/features/`**: Dominios de negocio que encapsulan estado (Zustand/FSM) y lógica reactiva. Cada feature es un módulo independiente que expone una API vía `index.ts`.
- **`src/systems/`**: El "motor" del juego. Lógica pura, imperativa y de alto rendimiento (Pooling, Audio Engine, Physics). No debe depender de React para su ejecución lógica interna.
- **`src/world/`**: El grafo de escena R3F. Contiene las representaciones visuales (Views) y la composición de la escena 3D. Se comunica con los sistemas para el movimiento y con las features para el estado.
- **`src/app/`**: Orquestación de alto nivel. Setup de providers, estilos globales y el componente raíz.

---

## 5. Estructura Objetivo del Repositorio

```text
/
├── .gemini/                # IA Tooling (Prompts, Validators, Generadores)
├── .github/workflows/      # Automatización CI/CD (GitHub Actions)
├── .husky/                 # Pre-commit hooks (Calidad local)
├── docs/                   # Documentación estratégica (TASK.MD, Specs)
├── public/                 # Assets pesados (.glb, .mp3, manifest.json)
├── src/
│   ├── app/                # Punto de entrada y configuraciones globales
│   │   ├── App.tsx         # Orquestador principal (Scene + UI)
│   │   ├── providers/      # Contextos o Providers globales
│   │   └── styles/         # CSS Global y variables de diseño
│   ├── features/           # Módulos de negocio (Estado + Comportamiento)
│   │   ├── game/           # FSM, Score, Niveles (TASK-018)
│   │   ├── combat/         # Lógica de disparo y munición (TASK-021)
│   │   ├── shop/           # Upgrades, Economía, Persistencia
│   │   ├── ui/             # HUD, Menús, Onboarding (TASK-022)
│   │   ├── ai/             # Adaptive AI & TensorFlow (TASK-024)
│   │   └── analytics/      # Telemetría y métricas (TASK-015)
│   ├── systems/            # Lógica pura / Engine (Independiente de React)
│   │   ├── pooling/        # Reciclaje de objetos (TASK-001)
│   │   ├── audio/          # Motor de audio y efectos (TASK-002)
│   │   ├── physics/        # Colisiones AABB / Raycasting
│   │   └── loop/           # Fixed Timestep & Accumulator (TASK-020)
│   ├── world/              # Escena 3D (Vistas R3F)
│   │   ├── actors/         # Player, Enemigos, Coleccionables
│   │   ├── stage/          # Piso, Cielo, Generadores de Pista
│   │   └── fx/             # Post-pro y Partículas (TASK-007)
│   ├── shared/             # Código compartido
│   │   ├── components/     # UI Atómica
│   │   ├── constants/      # Configuración y Balance
│   │   ├── hooks/          # Hooks de utilidad
│   │   └── types/          # Tipos globales
│   ├── main.tsx            # Inicialización React
│   └── types.ts            # (Temporal) hasta migración completa
├── tests/                  # Tests de integración y E2E
├── tools/                  # Scripts de Benchmarks y Tooling (TASK-011)
├── vite.config.ts
└── tsconfig.json
```

---

## 6. Política de Assets (Vite)

- **`public/assets/`**: Assets pesados (modelos 3D .glb, texturas grandes, audio) que se cargan mediante URL en runtime. Evita aumentar el tiempo de compilación.
- **`src/`**: Íconos SVG pequeños, estilos CSS, y assets críticos que se benefician del bundling (hash de nombre para cache-busting).

## 7. Barrel Files & Aliases

### Estándar de Exportación (Ejemplo: Game Feature)
`src/features/game/public.ts`:
```typescript
// Exportaciones explícitas (API Pública)
export { GameLoop } from './components/GameLoop';
export { useGameState } from './hooks/useGameState';
// Nota: state/ contiene sus propios types (ej. types.ts) y solo se exponen vía public.ts
export type { GameStatus } from './state/types';
```

`src/features/game/index.ts`:
```typescript
// Excepción permitida: export wildcard solo desde public.ts local
export * from './public';
```

### Configuración de Aliases (Único `@`):
**Vite / TS:**
```javascript
alias: {
  '@': path.resolve(__dirname, './src'),
}
```

## 8. Enforcement (Mantenimiento de SRP/DRY)

Para evitar el "Architectural Drift", se recomiendan estas prácticas:
- **Linting de Límites:** Usar ESLint con `no-restricted-imports` para prohibir que las features importen internals de otras features.
- **No imports entre features por subpath:** Una feature no puede importar internals de otra feature. Solo se permite importar la API pública vía `features/<feature>/index.ts` (y su `public.ts`).
- **API Check:** Solo se permite importar de una feature a través de su `index.ts` o `public.ts`.
- **No Store en Shared:** Si un componente en `shared` necesita el store, debe ser refactorizado o movido a una `feature`.

---

## 9. Plan de Migración Incremental

| Fase | Acción | Riesgo | Relación TASK |
| :--- | :--- | :--- | :--- |
| **1. Foundation** | Setup de `src/`, mover `types.ts`/`constants`. Iniciar `.github/workflows` y `tools/`. | Bajo | TASK-016, TASK-011 |
| **2. Systems Split** | Extraer lógica de Pooling y Timestep de `LevelManager` a `src/systems/`. | Medio | TASK-001, TASK-020 |
| **3. Feature Folders** | Mover HUD a `features/ui`, crear `features/game/state` (FSM) y `public.ts` iniciales. | Bajo | TASK-022, TASK-018 |
| **4. Entity Refactor** | Player y Environment migran a `src/world/entities` usando los nuevos sistemas. | Alto | TASK-005, TASK-006 |

## 10. Mapping con TASK.MD (Fuente de Verdad)

La arquitectura propuesta es el soporte físico para la ejecución de las tareas maestras:

- **TASK-001 (Pooling):** Se implementa como un sistema independiente en `src/systems/pooling`.
- **TASK-020 (Fixed Timestep):** Lógica desacoplada en `src/systems/loop`.
- **TASK-018 (FSM):** Máquina de estados centralizada en `src/features/game/state`.
- **TASK-015 (Analytics):** Encapsulado en `features/analytics`.
- **TASK-022 (UX/Onboarding):** Implementado en `features/ui/onboarding`.
- **TASK-024 (AI Ligera):** Lógica en `features/game/ai`.

---
🔗 Este documento define la visión técnica del proyecto y debe ser consultado antes de cualquier refactor mayor.
Última actualización: 2025-12-17

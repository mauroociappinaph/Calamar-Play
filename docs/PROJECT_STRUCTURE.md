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

---

## 3. Principios de Arquitectura (SRP/DRY)

### A) Single Responsibility Principle (SRP)
Dividimos la lógica en tres capas claras:
1.  **Sistemas (Logic):** Lógica pura (clases o funciones) que no depende de React/ThreeFiber (ej: Pooling, Physics).
2.  **State (Data):** Almacén de datos (Zustand) dividido por dominios.
3.  **Features (UI/View):** Componentes visuales y hooks que consumen los sistemas y el estado.

### B) Don't Repeat Yourself (DRY)
- **Shared:** Todo lo que se use en más de una feature vive en `src/shared`.
- **Constants:** No más "magic numbers" en componentes. Todo reside en `src/shared/constants`.

### C) Barrel Files (index.ts) y Encapsulamiento
Para evitar el "acoplamiento spaghetti" y asegurar una API limpia por módulo:
- **Prohibido `export *`:** Usar exports explícitos para mayor seguridad y mejor soporte de IDE/Treeshaking.
- **Patrón `public.ts`:** Cada feature/sistema debe tener un archivo `public.ts` que defina su API externa (qué funciones, tipos o componentes son visibles para el resto del app).
- **`index.ts` estricto:** El archivo `index.ts` en la raíz de la carpeta SOLO debe re-exportar desde `public.ts`.
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

- **`src/shared/`**: Tipos globales, constantes físicas, utilidades matemáticas genéricas, hooks que no dependen de la lógica de negocio y componentes UI atómicos (botones, modales) que **no** dependen del store.
- **`src/features/`**: Orquestación de UI + Hooks de dominio + lógica de negocio específica (Game, Shop, Onboarding, Analytics, AI). Es donde vive el "comportamiento" del juego.
- **`src/systems/`**: Lógica pura tipo "engine" (Pooling, Timestep Loop, Colisiones). Son agnósticos a React y ThreeFiber; procesan datos y cálculos puros.
- **`src/world/`**: Grafo de escena R3F. Contiene las "Views" y "Entities" (el modelo 3D y su renderizado). No debe contener lógica de negocio, solo bindings al estado y rendering.

---

## 4. Estructura Objetivo del Repositorio

```text
/
├── .github/workflows/      # CI/CD (TASK-016)
├── docs/                   # Documentación maestra (TASK-023)
├── public/                 # Assets estáticos (models, textures, audio)
│   └── assets/
├── src/
│   ├── app/                # Bootstrap, Providers (StoreProvider), App.tsx
│   ├── features/           # Módulos de negocio (Features)
│   │   ├── game/           # Core loop, scoring, combat (TASK-021)
│   │   │   └── state/      # FSM / Game Logic State (TASK-018)
│   │   ├── shop/           # Sistema de compras y upgrades
│   │   ├── ui/             # HUD, Menús, Onboarding (TASK-022)
│   │   └── analytics/      # Telemetría y eventos (TASK-015)
│   ├── shared/             # Código compartido (Cross-cutting concerns)
│   │   ├── components/     # UI Atómica (sin store)
│   │   ├── constants/      # Precios, velocidades, IDs
│   │   ├── hooks/          # Hooks genéricos
│   │   ├── types/          # Definiciones de TS
│   │   └── utils/          # Math, Randomgers
│   ├── systems/            # Lógica pura (Engine-like)
│   │   ├── pooling/        # Object Pooling (TASK-001)
│   │   ├── physics/        # Colisiones AABB / Physics puros
│   │   └── loop/           # Fixed Timestep Loop (TASK-020)
│   ├── world/              # Grafo de Escena (React Three Fiber)
│   │   ├── entities/       # Player, Obstacles (Views)
│   │   ├── environment/    # Sky, Lights, Water
│   │   └── effects/        # Post-processing (TASK-007)
│   ├── index.css
│   └── main.tsx
├── tools/                  # Tooling (Benchmarks TASK-011, Scripts)
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
export type { GameStatus } from './state/types';
```

`src/features/game/index.ts`:
```typescript
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
- **API Check:** Solo se permite importar de una feature a través de su `index.ts` o `public.ts`.
- **No Store en Shared:** Si un componente en `shared` necesita el store, debe ser refactorizado o movido a una `feature`.

---

| Fase | Acción | Riesgo | Relación TASK |
| :--- | :--- | :--- | :--- |
| **1. Foundation** | Setup de `src/`, mover `types.ts` y `shared/constants`. Configurar Alias único `@/`. | Bajo | - |
| **2. Systems Split** | Extraer lógica de Pooling y Timestep de `LevelManager` a `src/systems/`. | Medio | TASK-001, TASK-020 |
| **3. Feature Folders** | Mover HUD a `features/ui`, crear `features/game/state` (FSM) y `public.ts` iniciales. | Bajo | TASK-022, TASK-018 |
| **4. Entity Refactor** | Player y Environment migran a `src/world/entities` usando los nuevos sistemas. | Alto | TASK-005, TASK-006 |

---

## 7. Mapping con TASK.MD (Fuente de Verdad)

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

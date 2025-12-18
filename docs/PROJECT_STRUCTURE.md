# PROJECT_STRUCTURE.md

> 🏗️ Propuesta de Arquitectura de Software – alineada con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)
> Fecha de generación: 2025-12-17

## 1. Introducción y Visión
Este documento define la arquitectura objetivo para el proyecto **Calamar Play**. El objetivo es migrar de una estructura plana y acoplada hacia una arquitectura modular basada en **Features** y **Sistemas de Responsabilidad Única (SRP)**, garantizando escalabilidad y mantenibilidad mediante patrones **DRY** y **Barrel Files**.

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

### C) Barrel Files (index.ts)
- Cada carpeta principal tendrá un `index.ts`.
- **Regla:** Solo se exporta lo público. Los internos de la carpeta no deben ser importados desde fuera para evitar acoplamientos circulares.

### D) Regla de Imports y Alias
- Se prohíben los imports profundos: `import { X } from '@/features/game/components/Player'`.
- Se prefieren los imports vía barrel: `import { Player } from '@/features/game'`.
- Uso obligatorio de prefijos `@/` para claridad.

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
│   │   ├── shop/           # Sistema de compras y upgrades
│   │   ├── ui/             # HUD, Menús, Onboarding (TASK-022)
│   │   └── analytics/      # Telemetría y eventos (TASK-015)
│   ├── shared/             # Código compartido (Cross-cutting concerns)
│   │   ├── components/     # UI Atómica (Botones, Grids)
│   │   ├── constants/      # Precios, velocidades, IDs (unidades físicas)
│   │   ├── hooks/          # Custom hooks genéricos
│   │   ├── types/          # Definiciones de TS
│   │   └── utils/          # Math utils, lodash-lite
│   ├── systems/            # Lógica pura (Engine-like)
│   │   ├── pooling/        # Object Pooling (TASK-001)
│   │   ├── physics/        # Colisiones AABB / Raycasting
│   │   ├── loop/           # Fixed Timestep Loop (TASK-020)
│   │   └── state/          # Máquina de Estados / FSM (TASK-018)
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

## 5. Barrel Files & Aliases

### Plan de Barrels:
Propuesta de exportación en `src/features/game/index.ts`:
```typescript
export * from './components/GameLoop';
export * from './hooks/useGameState';
// No exportar internals de /internal_utils
```

### Configuración de Aliases:
**En `vite.config.ts`:**
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@app': path.resolve(__dirname, './src/app'),
    '@features': path.resolve(__dirname, './src/features'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@systems': path.resolve(__dirname, './src/systems'),
    '@world': path.resolve(__dirname, './src/world'),
  }
}
```

---

## 6. Plan de Migración Incremental

| Fase | Acción | Riesgo | Relación TASK |
| :--- | :--- | :--- | :--- |
| **1. Foundation** | Setup de `src/`, mover `types.ts` y `shared/constants`. Configurar Aliases. | Bajo | - |
| **2. Systems Split** | Extraer lógica de Pooling y Timestep de `LevelManager` a `src/systems`. | Medio | TASK-001, TASK-020 |
| **3. Feature Folders** | Mover HUD a `features/ui`, refactorizar Shop. | Bajo | TASK-022 |
| **4. Entity Refactor** | Player y Environment migran a `src/world/entities` usando los nuevos sistemas. | Alto | TASK-005, TASK-006 |

---

## 7. Mapping con TASK.MD (Fuente de Verdad)

La arquitectura propuesta es el soporte físico para la ejecución de las tareas maestras:

- **TASK-001 (Pooling):** Se implementa como un sistema independiente en `src/systems/pooling`.
- **TASK-020 (Fixed Timestep):** Lógica desacoplada en `src/systems/loop`.
- **TASK-018 (FSM):** Máquina de estados centralizada en `src/systems/state` o `features/game/state`.
- **TASK-015 (Analytics):** Encapsulado en `features/analytics`.
- **TASK-022 (UX/Onboarding):** Implementado en `features/ui/onboarding`.
- **TASK-024 (AI Ligera):** Lógica en `features/game/ai`.

---
🔗 Este documento define la visión técnica del proyecto y debe ser consultado antes de cualquier refactor mayor.
Última actualización: 2025-12-17

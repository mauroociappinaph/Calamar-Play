# PROJECT_ARCHITECTURE_REVIEW.md

> 🏗️ Revisión de Arquitectura y Refactores – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)
> Relacionado: TASK-023, TASK-012, TASK-018

## 1. Plan de Refactor Arquitectónico

Este plan es complementario y no modifica prioridades fuera del backlog oficial definido en `TASK.MD`. Sus acciones se aplicarán dentro de las tasks existentes.

La refactorización de la arquitectura seguirá la estrategia de 3 fases para minimizar el riesgo y alinear el trabajo técnico con los objetivos del producto.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo:** Mejorar la experiencia de desarrollo y sentar las bases para refactors más grandes sin alterar la lógica de negocio.
- **Acciones:**
  - **Configurar Alias de Paths en TS/Vite:** Implementar alias como `@/components`, `@/shared`, etc., para eliminar los imports relativos (`../../`) y limpiar el código.
  - **Crear Barrels Iniciales:** Introducir archivos `index.ts` en las carpetas principales (`components`, `components/UI`, `components/World`) para simplificar las importaciones.
  - **Centralizar Constantes:** Mover constantes mágicas (colores, valores de juego) a un directorio `/shared/constants`.

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
**Objetivo:** Con la base de tests de la Fase 1, comenzar a desacoplar los componentes más problemáticos.
- **Acciones:**
  - **Separar Lógica de UI:** Refactorizar componentes como `HUD` para que sean puramente presentacionales, extrayendo la lógica de estado a hooks personalizados.
  - **Refactorizar `LevelManager`:** Comenzar la extracción de responsabilidades del `LevelManager`. Separar la lógica de colisiones a un sistema independiente y la lógica de spawn a otro.
  - **Consolidar Helpers (DRY):** Extraer funciones de utilidad duplicadas a un directorio `/shared/lib` y cubrirlas con tests unitarios.

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
**Objetivo:** Realizar los cambios estructurales más grandes que permitirán el crecimiento futuro del juego.
- **Acciones:**
  - **Adoptar Arquitectura por Features:** Migrar gradualmente la estructura de carpetas hacia la propuesta en la sección 4 (ej. `/features/game`, `/features/shop`).
  - **Refactorizar Store con Slices:** Dividir el "god store" de Zustand en `slices` más pequeños y manejables, uno por cada dominio (ej. `createPlayerSlice`, `createGameSlice`).
  - **Endurecer Boundaries:** Implementar reglas de ESLint para forzar la regla de dependencia y prevenir importaciones cíclicas.

> 📘 Más contexto general: [README.md](../README.md)

---
🔗 Este documento está alineado con la fuente de verdad del proyecto ([TASK.MD](./TASK.MD)).
Última sincronización automática: 2025-12-17

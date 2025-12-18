# 🚀 Tablero de Ejecución Ágil: Calamar Loco (Sprint Board)

> � **Instrucciones de Uso:** Pegar este checklist en un Issue de GitHub, un Milestone de Project o en la sección de ejecución de `TASK.MD`. Marcar los checkboxes a medida que completes las subtareas. Úsalo como tablero vivo para el seguimiento diario del progreso.
>
> **Leyenda de Estado:**
> - [ ] 🔵 **Pendiente**
> - [~] 🟡 **En Progreso**
> - [x] ✅ **Hecho**

---

## 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
*Objetivo: ≥ 55 FPS en móvil e infraestructura de datos. 0 Balance de gameplay hasta estabilizar.*

### 🛠️ Core Engine & Performance (🔴 Alta Prioridad)

- **TASK-018: Implementar Máquina de Estados (FSM)**
    - [x] Implementar lógica de `GameStatus` FSM en `store.ts` `[DEP: Ninguna]` `[ESTADO: ✅]`
    - [x] Documentar estados y transiciones en `docs/STORE_API.md` `[ESTADO: ✅]`
    - [x] Actualizar matriz de cobertura en `docs/DOCS_AUDIT.md` `[ESTADO: ✅]`

- **TASK-001: Implementar Object Pooling**
    - [x] Crear sistema de Pool genérico en `src/systems/pooling/ObjectPool.ts` `[DEP: Ninguna]` `[ESTADO: ✅]`
    - [x] Refactorizar `LevelManager` para usar pooling en spawn de obstáculos/gemas `[ESTADO: ✅]`
    - [x] Crear tests unitarios en `tests/unit/objectPool.test.ts` (9 tests pasando) `[ESTADO: ✅]`
    - [x] Documentar arquitectura de pooling en `docs/GAMEPLAY_ENGINEER.md` `[ESTADO: ✅]`
    - [x] Actualizar matriz de cobertura en `docs/DOCS_AUDIT.md` `[ESTADO: ✅]`

- **TASK-020: Refactorizar Core Loop (Fixed Timestep)**
    - [x] Implementar FixedTimestepLoop con acumulador y callbacks separados `[DEP: TASK-001]` `[ESTADO: ✅]`
    - [x] Refactorizar LevelManager para usar fixed timestep en lógica de juego `[ESTADO: ✅]`
    - [x] Crear tests unitarios en `tests/unit/fixedTimestep.test.ts` (12 tests pasando) `[ESTADO: ✅]`
    - [x] Documentar lógica de desacople en `docs/GAMEPLAY_ENGINEER.md` `[ESTADO: ✅]`
    - [x] Actualizar matriz de cobertura en `docs/DOCS_AUDIT.md` `[ESTADO: ✅]`

- **TASK-005 & TASK-006: Optimización de Assets (LOD/Memoización)**
    - [x] Aplicar `useMemo` a geometrías/materiales en componentes `World` `[DEP: Ninguna]` `[ESTADO: ✅]`
    - [x] Implementar niveles de detalle (LOD) para modelos críticos `[ESTADO: ✅]`
    - [x] Validar contra presupuestos en `docs/TECHNICAL_DIRECTOR.md` `[ESTADO: ✅]`
    - [x] Actualizar matriz de cobertura en `docs/DOCS_AUDIT.md` `[ESTADO: ✅]`

### 🧪 Infraestructura de Calidad (🔴 Alta Prioridad)

- **TASK-010: Infraestructura de Testing (Vitest)**
    - [x] Configurar `vitest` y suite de tests unitarios inicial `[DEP: Ninguna]` `[ESTADO: ✅]`
    - [x] Implementar tests para lógica de score y vida en `store.ts` `[ESTADO: ✅]`
    - [x] Documentar estrategia en `docs/QA_TEST_LEAD.md` `[ESTADO: ✅]`

- **TASK-016: Pipeline de CI/CD (GitHub Actions)**
    - [x] Configurar workflow de Build, Test y Type-check `[DEP: TASK-010]` `[ESTADO: ✅]`
    - [x] Documentar flujo de despliegue en `docs/BUILD_ENGINEER_DEVOPS_GAMES.md` `[ESTADO: ✅]`

- **TASK-011: Benchmarks Automatizados**
    - [x] Implementar script de extracción de métricas de performance `[DEP: TASK-016]` `[ESTADO: ✅]`
    - [x] Documentar metodología de medición en `docs/QA_TEST_LEAD.md` `[ESTADO: ✅]`

- **TASK-015: Analytics y Telemetría**
    - [ ] Instrumentar eventos core (session, start, death) `[DEP: Ninguna]` `[ESTADO: 🔵]`
    - [ ] Validar pipeline de datos en `docs/DATA_ANALYST_GAME_INSIGHTS.md` `[ESTADO: 🔵]`

---

## 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
*Objetivo: Retención D1 > 40%. Hacer el juego "justo" y agradable.*

### 🎮 Gameplay Loops (🔴 Alta / 🟡 Media)

- **TASK-017: Sistema de Checkpoints (🔴)**
    - [ ] Implementar lógica de guardado/carga de progreso en runtime `[DEP: TASK-018]` `[ESTADO: 🔵]`
    - [ ] Crear UI de feedback "Checkpoint Alcanzado" `[ESTADO: 🔵]`
    - [ ] Documentar mecánica en `docs/LEAD_GAME_DESIGNER.md` `[ESTADO: 🔵]`

- **TASK-022: Onboarding Básico y Mejoras de UX (🟡)**
    - [ ] Implementar sistema de tooltips contextuales dinámicos `[DEP: Ninguna]` `[ESTADO: 🔵]`
    - [ ] Rediseñar jerarquía visual del HUD (outlines/glows) `[ESTADO: 🔵]`
    - [ ] Documentar principios aplicados en `docs/UX_UI_SPECIALIST_GAME_EXPERIENCE.md` `[ESTADO: 🔵]`

- **TASK-002: Sistema de Audio Completo (🟡)**
    - [ ] Implementar `AudioEngine` y sistemas de crossfade `[DEP: Ninguna]` `[ESTADO: 🔵]`
    - [ ] Integrar assets musicales y SFX tropicales `[ESTADO: 🔵]`
    - [ ] Validar especificación en `docs/AUDIO_SPEC.md` `[ESTADO: 🔵]`

- **TASK-019: Balance de Economía y Dificultad (🟡)**
    - [ ] Ajustar curvas de velocidad y costes basándose en datos `[DEP: TASK-015]` `[ESTADO: 🔵]`
    - [ ] Documentar tablas de balance en `docs/GAME_ECONOMY_DESIGNER.md` `[ESTADO: 🔵]`

---

## 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
*Objetivo: Retención D7 > 15%. Rejugabilidad extrema.*

### ⚔️ Nuevas Mecánicas & IA (🟡 Media / 🟢 Baja)

- **TASK-021: Sistema de Combate MVP (🟡)**
    - [ ] Implementar lógica de disparo, munición y colisión con enemigos `[DEP: TASK-020]` `[ESTADO: 🔵]`
    - [ ] Documentar sistema de combate en `docs/LEAD_GAME_DESIGNER.md` `[ESTADO: 🔵]`

- **TASK-024: Integración de IA Ligera (🟡)**
    - [ ] Implementar `AdaptiveAiManager.ts` con lógica DDA `[DEP: TASK-015, TASK-020]` `[ESTADO: 🔵]`
    - [ ] Integrar feedback visual de IA en HUD `[ESTADO: 🔵]`
    - [ ] Validar arquitectura en `docs/AI_SPEC.md` `[ESTADO: 🔵]`

- **TASK-014: Leaderboard e Interacción Social (🟢)**
    - [ ] Implementar ranking local y botón "Compartir Récord" `[DEP: Ninguna]` `[ESTADO: 🔵]`
    - [ ] Documentar en `docs/LEADERBOARD_SPEC.md` `[ESTADO: 🔵]`

- **TASK-008 & TASK-009: PWA y Optimization (🟡)**
    - [ ] Configurar Manifest, Service Worker e iconos `[DEP: Ninguna]` `[ESTADO: 🔵]`
    - [ ] Realizar optimización de Build final (Code splitting) `[ESTADO: 🔵]`
    - [ ] Documentar en `docs/BUILD_ENGINEER_DEVOPS_GAMES.md` `[ESTADO: 🔵]`

---

## 🧹 Tareas Transversales (Ongoing)

- **TASK-013: Mantenimiento de Estándares**
    - [ ] Auditar cumplimiento de `CONTRIBUTING.md` en nuevos PRs `[ESTADO: 🔵]`
    - [ ] Ejecutar validación de links con script `.gemini/validate-links.js` `[ESTADO: 🔵]`

- **TASK-023: Sincronización Documental**
    - [ ] Ejecutar prompt `.gemini/sync-docs.md` tras completar cada Task principal `[ESTADO: 🔵]`
    - [ ] Mantener `docs/DOCS_AUDIT.md` como fuente de confianza del estado de specs `[ESTADO: 🔵]`

---
🔗 Referencia: [TASK.MD](./TASK.MD) | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | [DOCS_AUDIT.md](./DOCS_AUDIT.md)
Actualizado: 17/12/2025

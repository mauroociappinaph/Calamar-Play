# 🚀 Plan Maestro de Ejecución: Calamar Loco (Fase 1-3)

> 📋 Este documento detalla la hoja de ruta técnica y documental para la implementación del proyecto, alineado con [TASK.MD](./TASK.MD) y la arquitectura en [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

---

## 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
*Foco: Lograr ≥ 55 FPS en móvil e infraestructura de datos. Ninguna feature de gameplay nueva hasta completar esto.*

### 🛠️ Core Engine & Performance (🔴 Alta Prioridad)
- [ ] **TASK-018: Implementar Máquina de Estados (FSM)**
    - [ ] Implementar `GameStatus` FSM en `store.ts` según `docs/STORE_API.md`.
    - [ ] Validar transiciones (ej: no se puede entrar a `SHOP` desde `MENU`).
    - [ ] Actualizar `docs/DOCS_AUDIT.md` matriz TASK-018.
- [ ] **TASK-001: Implementar Object Pooling**
    - [ ] Crear sistema de pool genérico para obstáculos y gemas.
    - [ ] Refactorizar `LevelManager` para usar `acquire/release` en lugar de `instantiate/destroy`.
    - [ ] Verificar reducción de GC Spikes en Chrome Profiler.
- [ ] **TASK-020: Refactorizar Core Loop (Fixed Timestep)**
    - [ ] Desacoplar lógica física de `useFrame` (render loop).
    - [ ] Implementar acumulador de tiempo para actualizaciones constantes (60Hz).
    - [ ] Validar en `docs/GAMEPLAY_ENGINEER.md`.
- [ ] **TASK-005 & TASK-006: Optimización de Assets (LOD/Memoización)**
    - [ ] Aplicar `useMemo` a todas las geometrías y materiales pesados.
    - [ ] Implementar componentes LOD para modelos complejos según `docs/ART_DIRECTOR_TECH_ARTIST.md`.
    - [ ] Validar contra los **Performance Budgets** de `docs/TECHNICAL_DIRECTOR.md`.

### 🧪 Infraestructura de Calidad (🔴 Alta Prioridad)
- [ ] **TASK-010: Infraestructura de Testing**
    - [ ] Configurar `vitest` y `happy-dom`.
    - [ ] Escribir tests unitarios para la lógica del `store.ts` (score, damage, status).
- [ ] **TASK-016: Pipeline de CI/CD**
    - [ ] Crear GitHub Action para `build`, `test` y `type-check`.
    - [ ] Configurar despliegue automático a Vercel para ramas `feature/*` (Preview).
- [ ] **TASK-011: Benchmarks Automatizados**
    - [ ] Implementar script `test:perf` según la guía en `docs/QA_TEST_LEAD.md`.
    - [ ] Integrar reporte de performance en los PRs de GitHub.
- [ ] **TASK-015: Analytics y Telemetría**
    - [ ] Integrar Plausible/Custom tracker.
    - [ ] Instrumentar eventos: `session_start`, `game_over`, `level_up`.
    - [ ] Validar en `docs/DATA_ANALYST_GAME_INSIGHTS.md`.

---

## 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
*Foco: Mejorar el primer minuto de juego y reducir la frustración.*

### 🎮 Gameplay Loops (🔴 Alta / 🟡 Media)
- [ ] **TASK-017: Sistema de Checkpoints (🔴)**
    - [ ] Implementar lógica de guardado de estado en puntos clave del nivel.
    - [ ] UI: Mensaje visual "Checkpoint alcanzado".
    - [ ] Validar lógica en `docs/LEAD_GAME_DESIGNER.md`.
- [ ] **TASK-022: Onboarding y Mejoras de UX (🟡)**
    - [ ] Implementar tooltips contextuales (tutorial dinámico).
    - [ ] Aplicar rediseño de HUD (contraste y jerarquía) según `docs/UX_UI_SPECIALIST_GAME_EXPERIENCE.md`.
- [ ] **TASK-002: Sistema de Audio Completo (🟡)**
    - [ ] Implementar `AudioEngine` desacoplado según `docs/AUDIO_SPEC.md`.
    - [ ] Agregar música adaptativa y lógica de "Audio Unlock".
    - [ ] Actualizar `docs/DOCS_AUDIT.md` matriz TASK-002.
- [ ] **TASK-019: Balance de Economía (🟡)**
    - [ ] Ajustar multiplicadores de velocidad y costes de la tienda.
    - [ ] Validar con datos de telemetría (depende de TASK-015).

---

## 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
*Foco: Rejugabilidad y competitividad.*

### ⚔️ Nuevas Mecánicas & IA (🟡 Media / 🟢 Baja)
- [ ] **TASK-021: Sistema de Combate MVP (🟡)**
    - [ ] Implementar mecánica de proyectiles y colisión con enemigos.
    - [ ] UI: Indicador de munición en HUD.
- [ ] **TASK-024: Integración de IA Ligera (🟡)**
    - [ ] Implementar `AdaptiveAiManager.ts` con reglas heurísticas.
    - [ ] (Opcional) Integrar modelo TensorFlow.js según `docs/AI_SPEC.md`.
- [ ] **TASK-014: Leaderboard e Interacción Social (🟢)**
    - [ ] Implementar ranking local persistente en `localStorage`.
    - [ ] Agregar botón "Compartir Récord" según `docs/LEADERBOARD_SPEC.md`.
- [ ] **TASK-008 & TASK-009: PWA y Optimization (🟡)**
    - [ ] Configurar Manifest y Service Worker para modo offline.
    - [ ] Code-splitting agresivo para bajar TTI < 3s.

---

## 🧹 Tareas Transversales (Ongoing)
- [ ] **TASK-013: Guía de Contribución**
    - [ ] Verificar integridad de `CONTRIBUTING.md`.
- [ ] **TASK-023: Documentación Unificada**
    - [ ] Correr script `.gemini/validate-links.js` semanalmente.
    - [ ] Ejecutar prompt `.gemini/sync-docs.md` después de cada hito de Phase.

---
🔗 Referencia principal: [TASK.MD](./TASK.MD) | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
Última actualización: 17/12/2025

---
version: 1.4
lastUpdated: 2025-12-17
reviewedBy: Game Engineering Dept.
status: Approved
changelog: |
  - v1.4: Alineación estratégica completa. Sincronizados todos los documentos de análisis. Añadidas tareas críticas faltantes (Checkpoints, Combate, QA, Analytics). Re-priorizado el backlog y actualizado el roadmap a un modelo de 3 fases.
  - v1.3: Añadido bloque meta YAML, resumen ejecutivo y campos de seguimiento.
---

# 📋 Task.MD - Plan Maestro de Ejecución Unificado
## Proyecto: Calamar Loco

**Última actualización:** 17/12/2025
**Versión:** 1.4
**Autoridad:** Decisión conjunta de todos los Leads de área.

---

## 1. Objetivo General y Estrategia Unificada

**Calamar Loco** es un endless runner 3D con el objetivo de convertirse en un producto pulido, optimizado y con alta retención. Este plan unifica las directrices de todos los departamentos en una estrategia de tres fases:

1.  **🚀 FASE 1: FUNDACIÓN (Estabilización y Medición).** El objetivo principal es lograr un **rendimiento estable y predecible en dispositivos móviles** y establecer la **infraestructura básica de calidad y datos**. No se añadirán nuevas features de gameplay hasta que el juego sea estable y medible.
2.  **🎯 FASE 2: RETENCIÓN (Diversión y Equidad).** Con una base sólida, el foco se mueve a **mejorar el core loop, balancear la dificultad y la economía, y optimizar la experiencia de usuario (UX)** para que los jugadores quieran volver.
3.  **🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido).** Una vez el juego es estable y divertido, se añadirán **nuevos sistemas y contenido** para aumentar la profundidad y mantener el interés a largo plazo.

### 🎯 DECISIÓN TÉCNICA CONFIRMADA
**Framework evaluado y aprobado:** React Three Fiber (Three.js) es la tecnología correcta y se mantendrá. El foco es la optimización, no la migración.

## 🔍 Resumen Ejecutivo (Métricas de Proyecto)

| Métrica | Valor Actual | Fuente |
|----------|---------------|--------|
| Tareas totales | 24 | Task List Unificada |
| % completadas | 0 % | GitHub Project |
| FPS promedio móvil (Target) | ≥ 55 | Performance Benchmarks |
| Tamaño de bundle (Target) | < 500 KB | Build Output |
| Retención D7 (North Star) | > 15% | Analytics Dashboard |
| Estado general | Inestable (En desarrollo activo) | CI/CD Metrics (Pendiente) |

---

## 🤖 Plan Personal de Integración de IA Ligera (Desarrollo Individual)

Este proyecto se desarrolla íntegramente por **una sola persona**.
Se incorporará un pequeño módulo de **IA ligera** junto con **vibe coding** (asistentes de código IA, como Cline o Cursor) para acelerar prototipos y automatizar tareas repetitivas.

**Propósito:**
- Aplicar **Machine Learning ligero** dentro de un entorno web (React Three Fiber) sin backend.
- Mostrar dominio del flujo completo **IA → Gameplay → UX** en ejecución client-side (Vercel deploy).

**Lineamientos:**
1. Usar asistentes IA solo para boilerplate o tests rápidos; la lógica central y evaluación son manuales.
2. Documentar experimentos en `/docs/AI_NOTES.md`.
3. Priorizar modelos client-side sin servidor ni almacenamiento externo.

**Implementaciones previstas:**
- **Adaptive AI Manager:** reglas locales que ajustan la dificultad según rendimiento.
- **Mini modelo TensorFlow.js:** red neuronal secuencial (3→3→1) entrenada en runtime para ajuste de dificultad en tiempo real.

---

## 2. Backlog de Tareas Unificado

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)

#### TASK-001: Implementar Object Pooling para Entidades
- **Descripción:** Reutilizar instancias de obstáculos, gemas, etc., para eliminar la creación constante de objetos y los consecuentes picos de Garbage Collection (GC).
- **Prioridad:** 🔴 Alta
- **Dependencias:** Ninguna

#### TASK-005: Optimizar Geometrías y Materiales (Memoización)
- **Descripción:** Auditar y asegurar que todas las geometrías y materiales se crean usando `useMemo` para evitar re-renders innecesarios.
- **Prioridad:** 🔴 Alta
- **Dependencias:** Ninguna

#### TASK-006: Implementar LOD (Level of Detail)
- **Descripción:** Reducir la complejidad de los objetos lejanos para aligerar la carga en la GPU, especialmente en móviles.
- **Prioridad:** 🔴 Alta
- **Dependencias:** TASK-005

#### TASK-007: Optimizar Sistema de Partículas
- **Descripción:** Reducir el `PARTICLE_COUNT` en dispositivos móviles y optimizar su shader para mejorar el fill-rate.
- **Prioridad:** 🔴 Alta
- **Dependencias:** Ninguna

#### TASK-010: Implementar Infraestructura de Testing
- **Descripción:** Configurar `vitest` y escribir la primera suite de tests unitarios para la lógica de estado crítica en `store.ts`.
- **Prioridad:** 🔴 Alta
- **Dependencias:** Ninguna

#### TASK-011: Implementar Benchmarks de Performance
- **Descripción:** Crear un sistema automatizado para medir FPS, uso de memoria y tiempos de carga en cada PR para prevenir regresiones.
- **Prioridad:** 🔴 Alta
- **Dependencias:** TASK-016

#### TASK-015: Implementar Analytics y Telemetría Básica
- **Descripción:** Integrar un proveedor de analytics (ej. Plausible) y enviar los eventos fundamentales (session_start, game_start, death, level_complete).
- **Prioridad:** 🔴 Alta
- **Dependencias:** Ninguna

#### TASK-016: Implementar Infraestructura de CI/CD
- **Descripción:** Crear un pipeline básico en GitHub Actions que ejecute build, tests y type-checking en cada PR.
- **Prioridad:** 🔴 Alta
- **Dependencias:** Ninguna

#### TASK-018: Implementar Máquina de Estados de Juego (FSM)
- **Descripción:** Refactorizar la gestión de `GameStatus` en `store.ts` para usar una máquina de estados finita que prevenga transiciones inválidas (ej. `SHOP` y `PLAYING` al mismo tiempo).
- **Prioridad:** 🔴 Alta
- **Dependencias:** Ninguna

#### TASK-020: Refactorizar Core Loop con Fixed Timestep
- **Descripción:** Separar la lógica de física/gameplay de la lógica de render, implementando un loop de actualización a timestep fijo para asegurar consistencia independientemente del framerate.
- **Prioridad:** 🔴 Alta
- **Dependencias:** TASK-001

---

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)

#### TASK-003: Diseñar Patrones de Nivel Predefinidos
- **Descripción:** Crear patrones de spawn prediseñados que incluyan "momentos de respiro" para mejorar el flow del juego y reducir la fatiga.
- **Prioridad:** 🟡 Media
- **Dependencias:** TASK-001

#### TASK-017: Implementar Sistema de Checkpoints
- **Descripción:** Guardar el progreso del jugador (letras, score) en puntos clave para que la muerte no signifique una pérdida total y frustrante.
- **Prioridad:** 🔴 Alta
- **Dependencias:** TASK-018

#### TASK-019: Balance Inicial de Economía y Dificultad
- **Descripción:** Ajustar la curva de velocidad, el valor de las gemas y el coste de los upgrades en la tienda para reducir el grind y hacer la progresión más satisfactoria.
- **Prioridad:** 🟡 Media
- **Dependencias:** TASK-015 (para medir impacto)

#### TASK-022: Implementar Onboarding Básico y Mejoras de UX
- **Descripción:** Añadir tooltips contextuales para el primer uso y aplicar mejoras de jerarquía y contraste en el HUD para facilitar la comprensión inmediata del juego.
- **Prioridad:** 🟡 Media
- **Dependencias:** Ninguna

#### TASK-002: Completar Sistema de Audio
- **Descripción:** Expandir el sistema de audio con música de fondo tropical, efectos de sonido variados y controles de volumen.
- **Prioridad:** 🟡 Media
- **Dependencias:** Ninguna

---

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)

#### TASK-021: Sistema de Combate (MVP)
- **Descripción:** Implementar una mecánica de disparo con munición limitada para que el jugador tenga agencia ofensiva contra los enemigos.
- **Prioridad:** 🟡 Media
- **Dependencias:** TASK-020

#### TASK-008: Implementar PWA (Progressive Web App)
- **Descripción:** Agregar manifest.json y service worker para permitir que el juego se instale en dispositivos y tenga capacidades offline básicas.
- **Prioridad:** 🟡 Media
- **Dependencias:** Ninguna

#### TASK-009: Configurar Build de Producción Optimizado
- **Descripción:** Optimizar la configuración de Vite (code splitting, tree shaking, compresión) para reducir el tamaño del bundle y los tiempos de carga.
- **Prioridad:** 🟡 Media
- **Dependencias:** Ninguna

#### TASK-014: Implementar Sistema de Leaderboard
- **Descripción:** Agregar una tabla de puntuaciones locales (localStorage) y un botón para compartir el score, fomentando la competitividad.
- **Prioridad:** 🟢 Baja
- **Dependencias:** Ninguna

#### TASK-004: Agregar Haptic Feedback para Móvil
- **Descripción:** Implementar vibración del dispositivo para mejorar el feedback táctil en colisiones y recolecciones.
- **Prioridad:** 🟢 Baja
- **Dependencias:** Ninguna

#### TASK-012: Documentar API del Store
- **Descripción:** Documentar con JSDoc todas las acciones y el estado del store para facilitar el mantenimiento.
- **Prioridad:** 🟢 Baja
- **Dependencias:** Ninguna

#### TASK-013: Crear Guía de Contribución
- **Descripción:** Crear `CONTRIBUTING.md` con convenciones de código y procesos de PR.
- **Prioridad:** 🟢 Baja
- **Dependencias:** Ninguna

#### TASK-023: Sistema de Documentación Unificado
- **Descripción:** Implementar la arquitectura de información y las plantillas propuestas por el Technical Writer para mantener la coherencia documental.
- **Prioridad:** 🟡 Media (Ongoing)
- **Dependencias:** Ninguna

#### TASK-024: Integración de IA Ligera (Desarrollo Individual)
- **Descripción:** Implementar una IA adaptativa local o modelo TensorFlow.js entrenado en el navegador para ajustar la dificultad o proveer feedback en tiempo real basado en datos del jugador. Utilizar *vibe coding* como soporte productivo.
- **Prioridad:** 🟡 Media
- **Dependencias:** TASK-015 (Analytics / Telemetría) y TASK-020 (Core Loop)
- **Subtareas:**
  1. Crear módulo `AdaptiveAiManager.ts` con reglas adaptativas.
  2. Prototipar modelo TensorFlow.js simple (3→3→1) entrenado runtime.
  3. Integrar output de IA en la velocidad y HUD (`IA Confidence` display).
  4. Documentar proceso en `/docs/AI_NOTES.md` y README ("AI Edition").
  5. Publicar versión demo **Calamar Loco AI Edition** en Vercel.

---

## 3. Roadmap de Implementación Unificado

| Fase | Objetivo Principal | Tareas Clave | Criterio de Éxito Principal |
|------|--------------------|--------------|-----------------------------|
| **1: Fundación** (Semanas 1-4) | Estabilidad y Medición | TASK-001, 005, 006, 007, 010, 011, 015, 016, 018, 020 | ≥ 55 FPS estables en móvil; Crash rate < 1%; Funnel de onboarding medible. |
| **2: Retención** (Semanas 5-8) | Diversión y Equidad | TASK-017, 019, 022, 003, 002 | Retención D1 > 40%; Session Length > 5 minutos. |
| **3: Expansión** (Post Semana 8) | Profundidad y Contenido | TASK-021, 008, 009, 014, 004 y resto del backlog | Retención D7 > 15%; Métricas de uso de nuevas features > 30%. |

---

## 4. Métricas de Éxito del Proyecto (Alineadas)

| Métrica | Target | Cómo Medir | Fase Relevante |
|---------|--------|------------|----------------|
| FPS en móvil (p95) | ≥ 55 FPS | Performance Benchmarks (TASK-011) | 1 |
| Crash-free Sessions | > 99% | Error Tracking (Sentry/Similar) | 1 |
| Tiempo de Carga (TTI) | < 3 segundos | Lighthouse / CI (TASK-016) | 1 |
| Retención D1 | > 40% | Analytics (TASK-015) | 2 |
| Session Length Promedio | > 8 minutos | Analytics (TASK-015) | 2 y 3 |
| **Retención D7 (North Star)** | **> 15%** | **Analytics (TASK-015)** | **3** |
| Feature Usage (Combate) | > 30% | Analytics (TASK-015) | 3 |

---
---
**Próximos pasos personales:**
- Iniciar la rama `feature/ai-demo`.
- Documentar avances en `/docs/AI_NOTES.md`.
- Iterar el módulo de IA ligera hasta obtener una demo funcional en Vercel.
---

*Este documento ahora sirve como la única fuente de verdad para la planificación y priorización del proyecto. Todos los demás documentos de análisis deben referirse a este plan.*


# QA_TEST_LEAD.md

1) Diagnóstico ejecutivo en 10 líneas
Estado actual inestable para release: sin suite de tests funcional, GC spikes causan stuttering en móviles, estados de juego no validados, colisiones físicas inexactas. 3 riesgos críticos: crashes por memoria en escenas densas (TASK-005), progreso perdido por estados inválidos (SHOP+PLAYING simultáneo), input lag en touch events móviles. 3 vacíos: tests unitarios ausentes (TASK-010), benchmarks performance faltantes (TASK-011), tests e2e no implementados. 3 quick wins: agregar limits velocidad (previene exploits), validar transiciones estado, implementar smoke tests manuales. **Chequeo TASK:** El diagnóstico original era correcto. El nuevo plan unificado ha corregido la priorización: **TASK-010 (Tests)** y **TASK-011 (Benchmarks)** han sido elevados a **prioridad 🔴 Alta** y son componentes centrales de la Fase 1. Además, se ha añadido **TASK-016 (CI/CD)** para automatizar la ejecución de estas validaciones de calidad.

2) Estrategia de testing recomendada (pirámide)
Pirámide objetivo: unit tests (80%) para lógica store (takeDamage, collectGem), físicas (colisiones), utilities; integration tests (15%) para flujos input→estado→render, audio triggers, UI state sync; E2E tests (5%) para critical path: start→play→fail/win→retry→progression. No testear: animaciones CSS (coste alto, bajo riesgo), assets loading (browser dependent), offline mode (no implementado). Compensar con smoke tests diarios (5 min manual: load→play 1 min→shop→restart).

3) Auditoría de cobertura actual
Suites existentes: ninguna suite funcional (SUPUESTO: TASK-010 menciona Vitest pero no implementado); ubicación: package.json scripts vacío de test; comandos: npm test no definido. Cobertura: módulos store.ts/UI.tsx/LevelManager.tsx sin tests; calidad asserts: nulo (no hay tests). Señales fragilidad: dependencias temporales (useFrame), estado global mutable (Zustand sin validaciones), closures recreados. Tabla:

| Área | Tests existentes | Riesgo | Hueco | Test propuesto | Prioridad |
|------|-----------------|--------|-------|----------------|-----------|
| Store (Zustand) | None | Alto (bugs estado) | takeDamage, collectGem | Unit tests con mocks | Alta |
| Colisiones físicas | None | Alto (tunneling) | hit detection | Integration tests | Alta |
| Input handling | None | Medio (touch lag) | multi-touch, swipe | E2E tests | Media |
| Performance | None (TASK-011) | Alto (GC spikes) | FPS/memoria leaks | Benchmarks | Alta |
| UI state | None | Medio (sync issues) | shop→playing transitions | Integration tests | Media |

4) Matriz de casos E2E (obligatoria)
Casos construidos para critical path: onboarding (menu→play), core loop (evasión→recolecta), failures (muerte→retry), progression (letras→level up→shop), settings (audio, controles). Automatable: sí para desktop, no para móviles (touch específico).

| ID | Flujo | Precondición | Pasos | Resultado esperado | Severidad | Automatable | Notas |
|----|-------|--------------|-------|---------------------|-----------|-------------|-------|
| E2E-001 | Start game | Menu screen | Tap/click "A NADAR" | Game starts, status PLAYING, speed=22.5 | Critical | Sí | Audio init required |
| E2E-002 | Collect gem | Playing, gem visible | Move to gem position | Score increases by 50/100, particle burst | Major | Sí | RNG position |
| E2E-003 | Collect letter | Playing, letter visible | Move to letter position | Letter collected, UI updates, speed +5% | Critical | Sí | Sequential collection |
| E2E-004 | Avoid obstacle | Playing, obstacle ahead | Jump/swipe over | No damage, continues | Critical | Sí | Timing critical |
| E2E-005 | Take damage | Playing, immortality off | Hit obstacle/missile | Lives decrease, no game over if lives >0 | Critical | Sí | Lives=3 initially |
| E2E-006 | Game over | Lives=1, hit obstacle | Take damage | Lives=0, status GAME_OVER, speed=0 | Critical | Sí | UI shows stats |
| E2E-007 | Retry | Game over screen | Click "REINTENTAR" | Reset to initial state, start game | Critical | Sí | Audio init |
| E2E-008 | Level progression | All letters collected | Collect final letter | Level increases, lanes +2, shop portal appears | Major | Sí | Word: CALAMARLOCO |
| E2E-009 | Shop access | Level up, playing | Run into shop portal | Status changes to SHOP | Critical | Sí | Portal z=-100 |
| E2E-010 | Buy item | In shop, score >=1000 | Select "DOBLE SALTO", confirm | hasDoubleJump=true, score decreases | Major | No | Touch UI |
| E2E-011 | Use immortality | Has immortality, playing | Press space/tap center | isImmortalityActive=true, 5s duration | Major | No | Mobile input |
| E2E-012 | Victory | Level=3, all letters | Collect final letter | Status VICTORY, score +5000 | Major | Sí | Max level |
| E2E-013 | Audio toggle | Playing | Assume no toggle (missing) | Audio plays on actions | Minor | No | Manual verification |
| E2E-014 | Haptic feedback | Mobile, take damage | Hit obstacle | Device vibrates | Minor | No | Mobile only |
| E2E-015 | Pause/resume | No pause (missing) | N/A | N/A | Minor | No | Feature gap |
| E2E-016 | Multi-touch | Mobile, playing | Multiple taps | Only center tap processes | Minor | No | Input validation |
| E2E-017 | Background/foreground | Playing, switch app | Return to app | Game resumes correctly | Major | No | Browser dependent |
| E2E-018 | Network loss | No online features | N/A | No impact | Minor | Sí | Offline by design |
| E2E-019 | LocalStorage | Restart game | Check saved scores | Leaderboard persists | Minor | Sí | localStorage API |
| E2E-020 | Resolution change | Desktop, resize window | Continue playing | Camera adapts | Minor | Sí | Dynamic sizing |

5) Casos límite y "nasty paths"
Input: multi-touch simultáneo (3+ fingers) causa input queue overflow; key rollover (WASD+A) procesa último; gamepad connect/disconnect durante gameplay no handled. Timing: lag spikes (>100ms) causan tunneling (objeto atraviesa player); background/foreground (>30s) pierde WebGL context; throttling CPU (6x slowdown) rompe físicas. Física/colisiones: high speed (velocidad >45) tunneling; stacking objetos (>10 concurrentes) performance drop; missile prediction inexacta. UI: resoluciones extremas (320x240) HUD cropped; safe areas iPhone notch; idioma largo (portugués) text overflow. Data: localStorage corrupto (manual edit) carga defaults; version mismatch (old data) migra gracefully; cache stale (old assets) loads current. Network: offline during load (PWA) usa cache; latencia variable (no realtime); retries failed loads (3 attempts).

6) Benchmarks y performance testing (estabilidad + regresión)
Benchmarks mínimos: FPS p95 >50 móvil / >55 desktop; long tasks <100ms count <5/minuto; memoria crecimiento <10MB/sesión, leaks <1MB/hora; bundle <500KB gzipped; TTI <3s. Perf smoke: escenario nivel 1, 30s gameplay, outputs: FPS logs, memoria heap, console errors. Tabla:

| Métrica | Objetivo (rango) | Cómo medir | Frecuencia | Gate de release |
|---------|------------------|------------|------------|-----------------|
| FPS | 50-60 móvil, 55-65 desktop | stats.js p95 | Cada PR + nightly | Sí (<50 = block) |
| Memoria | <100MB peak, <5MB crecimiento | Chrome DevTools | Nightly | Sí (>100MB = block) |
| Bundle size | <500KB gzipped | vite build | PR | Sí (>500KB = warn) |
| Load time | <3s TTI | Lighthouse | Build | Sí (>3s = block) |
| JS errors | 0 por sesión | Console logs | E2E | Sí (>0 = fail) |

7) Métricas de estabilidad y calidad
Crash-free sessions: >95%; error rate JS exceptions <0.1%; ANR/long task rate <5%; bug escape rate <10% (pre-prod vs prod); flakiness rate tests <5%; MTTR <4h. Instrumentación: error tracking (Sentry), logging (console.error + custom events), performance monitoring (Web Vitals).

8) Checklist de release (obligatorio)
Build/config: envs válidos (API_KEY placeholder), version bump (package.json), sourcemaps enabled (vite.config), feature flags off (no dev code). Smoke tests: manual (load→play 1min→shop→game over→retry) + automatizados (E2E-001 to E2E-003). Compatibilidad: browsers (Chrome 90+, Safari 14+, Firefox 88+), dispositivos (iPhone 12+, Android Snapdragon 865+), resolutions (360x640 min). Performance gates: FPS >50 móvil, memoria <100MB, load <3s. Seguridad: CSP headers (no inline scripts), permisos minimal (no geolocation), secrets not exposed. Rollback: git tags, Vercel deploy history, feature toggles ready. Post-release: monitor 24h (analytics crashes, user feedback), hotfix pipeline ready.

## 9. Plan de Acción de QA (Alineado con Roadmap Maestro)

El rol de QA es garantizar la calidad, estabilidad y performance del producto en cada etapa del desarrollo. El plan de QA se integra directamente en el roadmap estratégico de 3 fases.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo de QA:** Construir la red de seguridad. Pasar de un proceso sin tests a uno donde la calidad es un gate automático.
- **Acciones:**
  - **Implementar Frameworks de Testing (TASK-010):** Configurar `vitest` para tests unitarios y `Playwright` para E2E.
  - **Crear Suite de Tests Unitarios Core:** Escribir tests para la lógica de estado en `store.ts` (cálculo de score, daño, etc.). El objetivo es una cobertura > 80% del store.
  - **Desarrollar Benchmarks de Performance (TASK-011):** Crear scripts para medir FPS, uso de memoria y TTI de forma consistente.
  - **Integrar con CI/CD (TASK-016):** Añadir los tests y benchmarks como un paso obligatorio en el pipeline de CI. Un PR no se puede mergear si rompe los tests o degrada la performance más allá de un umbral.
  - **Definir Procesos:** Establecer el checklist de release, el proceso de triage de bugs y las métricas de estabilidad.

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
**Objetivo de QA:** Asegurar que las nuevas mecánicas de gameplay sean robustas y no introduzcan regresiones.
- **Acciones:**
  - **Tests de Integración:** Escribir tests para los nuevos sistemas como **Checkpoints (TASK-017)** y la **Máquina de Estados (TASK-018)**. Validar que el estado del juego se guarda y restaura correctamente.
  - **Testing de Balance:** Ejecutar los casos de la matriz E2E de forma manual y automatizada para validar el impacto del **Balance de Economía y Dificultad (TASK-019)**.
  - **Validación de UX:** Realizar pruebas manuales en múltiples dispositivos para verificar las mejoras de **Onboarding y UX (TASK-022)**, prestando especial atención a los touch targets y la claridad del HUD.

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
**Objetivo de QA:** Validar la calidad y estabilidad de las features de expansión a gran escala.
- **Acciones:**
  - **Testing de Nuevas Features:** Crear planes de test y casos E2E para el **Sistema de Combate (TASK-021)** y futuros sistemas como el árbol de perks.
  - **Testing Exploratorio:** Realizar testing exploratorio en nuevos biomas o modos de juego para encontrar bugs no obvios.
  - **Ampliar Regresión Automatizada:** Añadir los flujos críticos de las nuevas features a la suite de regresión automatizada para protegerlos a futuro.
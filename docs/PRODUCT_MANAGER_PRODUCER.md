# PRODUCT_MANAGER_PRODUCER.md

## 1. Diagnóstico ejecutivo en 10 líneas

**Estado del producto:** Endless runner 3D funcional como MVP pero con problemas críticos de performance móvil y retención que impiden crecimiento sostenible.

**3 riesgos principales de negocio:**
1. **Retención D1 <40%:** Performance GC spikes causan stuttering, usuarios abandonan en primeros minutos (SUPUESTO basado en TASK-001)
2. **Bundle size 250KB:** Sin optimización bloquea distribución web masiva, afecta TTI >3s
3. **Monetización ausente:** Sin estrategia IAP/ads, solo shop local limita LTV potencial

**3 cuellos de botella principales del backlog:**
1. **Falta de Infraestructura de Calidad y Datos:** Tareas de testing (TASK-010), benchmarks (TASK-011) y analytics (TASK-015) tienen prioridad baja, impidiendo la toma de decisiones informadas y la validación de hipótesis.
2. **Core Loop Punitivo y Poco Atractivo:** La curva de dificultad (velocidad, falta de checkpoints) y la economía desbalanceada causan frustración y abandono temprano. Faltan tareas para solucionarlo.
3. **Deuda Técnica Crítica en Performance:** Tareas como el Object Pooling (TASK-001) bloquean la estabilidad y la adición de contenido variado (TASK-003).

**3 oportunidades de alto impacto:**
1. **Priorizar la Fundación:** Implementar CI/CD (TASK-016), tests (TASK-010) y analytics (TASK-015) para habilitar un desarrollo ágil y basado en datos.
2. **Mejorar la Retención Temprana:** Implementar checkpoints (TASK-017) y balancear la economía (TASK-019) para reducir la frustración.
3. **Optimizar Performance Móvil:** Completar TASK-001, TASK-005 y TASK-006 para garantizar una experiencia fluida y subir la retención D1.

**Chequeo TASK:** El backlog unificado ahora incluye tareas críticas para la infraestructura de calidad (tests, CI/CD, analytics) y para mejorar el core loop (checkpoints, balance), que antes eran gaps fundamentales.

## 2. Objetivo de producto y "North Star Metric"

**Objetivo de producto:** Endless runner 3D accesible vía web que entrega 8+ minutos de diversión marina coleccionista, con monetización opcional que no interrumpe flow. Público: gamers casuales 18-35 años que buscan experiencias ligeras en móvil.

**North Star Metric:** Retención D7 > 15% (sesiones recurrentes semanales) - indica engagement sostenible con un core loop divertido y progresión a largo plazo.

**Métricas soporte:**
1. **Retención D1:** Target > 40% (mide el éxito del onboarding y la estabilidad inicial).
2. **Session length promedio:** Target > 8 minutos (indica que el core loop es engaging).
3. **Completion rate del primer nivel:** Target > 60% (valida que la curva de dificultad inicial no es un muro).

**Diagnóstico actual:** Sin métricas reales disponibles. El objetivo de la FASE 1 es implementar la telemetría (TASK-015) para reemplazar supuestos con datos.

## 3. KPI y diagnóstico del funnel

**Retención (Hipótesis):** D1 < 25% (actual) → > 40% (target post-fase 1 y 2). D7 < 8% (actual) → > 15% (target post-fase 3).

**Engagement (Hipótesis):**
- **Sesiones/día:** ~1.0 (actual) → 1.5 (target)
- **Duración:** ~2-3 minutos (actual) → > 8 minutos (target)
- **Profundidad:** < 20% llega al nivel 2 (actual) → > 60% (target)

**Funnel diagnóstico y Fugas Principales:**
1. **Instalación (100%) → Primer Juego (70%):** FUGA por tiempos de carga (resolver con TASK-009) y performance inicial.
2. **Primer Juego (70%) → "Aha!" Moment (40%):** **FUGA CRÍTICA #1.** El jugador se enfrenta a un rendimiento inestable (stuttering por GC) y una UX poco clara. **Solución:** Tareas de performance de FASE 1 (TASK-001, 005, 006) y mejoras de UX (TASK-022).
3. **"Aha!" Moment (40%) → Sesión 2 (25%):** **FUGA CRÍTICA #2.** La muerte es demasiado punitiva y el loop es repetitivo. **Solución:** Implementar Checkpoints (TASK-017) y balancear la dificultad (TASK-019).
4. **Sesión 2 (25%) → Retorno D7 (8%):** **FUGA CRÍTICA #3.** Falta de profundidad y contenido a largo plazo. **Solución:** Tareas de Expansión de FASE 3 (Combate, Perks, Contenido - TASK-021, etc.).

**Monetización (futura):**
- **Conversión:** Target 5% paga algo en primer mes (SUPUESTO)
- **ARPDAU:** Target $0.10 (ads + IAP)
- **ARPPU:** Target $2.50 (compras upgrades)
- **LTV:** Target $1.20 (sesiones gratuitas + monetización opcional)

**3 fugas principales del funnel:**
1. **Performance y UX en Onboarding:** Stuttering y falta de claridad matan la primera impresión. **Solución: FASE 1.**
2. **Progresión Injusta:** La falta de checkpoints y una curva de dificultad rota frustran al jugador. **Solución: FASE 2.**
3. **Falta de Profundidad:** El gameplay monótono no da razones para volver a largo plazo. **Solución: FASE 3.**

## 4. Backlog Unificado por Fases Estratégicas

El backlog ahora está alineado con la estrategia de 3 fases definida en `docs/task.MD`. La priorización ha sido actualizada para reflejar un enfoque en la estabilidad y la medición antes de la expansión de contenido.

**🔴 FASE 1: FUNDACIÓN (Estabilización y Medición)**
- **Objetivo:** Lograr un juego estable, medible y con un proceso de desarrollo confiable.
- **Tareas Clave:** TASK-001 (Pooling), TASK-005 (Memoización), TASK-006 (LOD), TASK-007 (Partículas), TASK-010 (Tests), TASK-011 (Benchmarks), TASK-015 (Analytics), TASK-016 (CI/CD), TASK-018 (FSM), TASK-020 (Fixed Timestep).

**🟡 FASE 2: RETENCIÓN (Diversión y Equidad)**
- **Objetivo:** Mejorar el core loop, balancear la dificultad y optimizar la UX para que los jugadores regresen.
- **Tareas Clave:** TASK-017 (Checkpoints), TASK-019 (Balance Eco/Dificultad), TASK-022 (Onboarding/UX), TASK-003 (Patrones Nivel), TASK-002 (Audio).

**🟢 FASE 3: EXPANSIÓN (Profundidad y Contenido)**
- **Objetivo:** Añadir nuevos sistemas y contenido para aumentar la rejugabilidad a largo plazo.
- **Tareas Clave:** TASK-021 (Combate MVP), TASK-008 (PWA), TASK-009 (Build Opt.), TASK-014 (Leaderboard), y resto del backlog.

## 5. Matriz Impacto × Esfuerzo (Alineada con Plan Maestro)

| ID/Tarea | Problema que resuelve | Hipótesis de impacto | KPI afectado | Esfuerzo (S/M/L) | Riesgo | Dependencias | Prioridad Unificada |
|----------|-----------------------|----------------------|--------------|------------------|--------|-------------|--------------------|
| **TASK-001** | GC spikes causan stuttering | +40% D1 retención | Session length, Crash rate | M | Alto | Ninguna | 🔴 Alta |
| **TASK-005** | Re-renders lentos en CPU | +20% FPS estable | FPS promedio | S | Bajo | Ninguna | 🔴 Alta |
| **TASK-006** | Geometrías lejanas en GPU | +20% FPS móvil | FPS móvil, Battery life | M | Medio | TASK-005 | 🔴 Alta |
| **TASK-010** | Sin red de seguridad para refactors | Detección temprana de regresiones | Tasa de bugs, Tiempo de dev | M | Bajo | Ninguna | 🔴 Alta |
| **TASK-015** | Decisiones basadas en supuestos | Validación de hipótesis de producto | Todos los KPIs | S | Bajo | Ninguna | 🔴 Alta |
| **TASK-016** | Deploys manuales y sin control | Releases más rápidos y seguros | Frecuencia de deploy, Errores | M | Bajo | TASK-010 | 🔴 Alta |
| **TASK-017** | Muerte punitiva causa frustración | +60% completion rate | Retención D1, Session length | M | Medio | TASK-018 | 🔴 Alta |
| **TASK-018** | Bugs de estado por transiciones inválidas | -80% bugs de estado | Crash rate, Tasa de bugs | S | Bajo | Ninguna | 🔴 Alta |
| **TASK-020** | Física inconsistente por `dt` variable | Gameplay predecible y justo | Game Feel, Retención D1 | L | Alto | TASK-001 | 🔴 Alta |
| **TASK-019** | Grind excesivo, economía rota | +30% session length | Retención D1, Uso de la tienda | S | Bajo | TASK-015 | 🟡 Media |
| **TASK-022** | Onboarding confuso, UX pobre | -50% drop-off en 1ra sesión | Tasa de completion onboarding | M | Bajo | Ninguna | 🟡 Media |
| **TASK-003** | Gameplay monótono y repetitivo | +25% session length | Retención D7, Engagement | M | Medio | TASK-001 | 🟡 Media |
| **TASK-021** | Gameplay pasivo sin agencia | +50% session length | Retención D7, Feature Usage | L | Alto | TASK-020 | 🟡 Media |
| **TASK-002** | Inmersión de juego incompleta | +15% engagement | Session length | M | Bajo | Ninguna | 🟡 Media |
| **TASK-008** | Distribución limitada a web | +200% reach potencial | DAU potencial | S | Medio | Ninguna | 🟢 Baja |
| **TASK-009** | Tiempos de carga altos | -40% TTI | Tasa de rebote | S | Bajo | Ninguna | 🟢 Baja |
| **TASK-014** | Falta de competitividad social | +10% replay value | Sesiones por usuario | S | Bajo | Ninguna | 🟢 Baja |

## 6. Plan de impacto: retención primero (y monetización después)

**3 bets principales para subir retención:**

1.  **Estabilizar y Medir (Fase 1):** Atacar la performance crítica (TASK-001, 005, 006, 020) y establecer la infraestructura de calidad y datos (TASK-010, 015, 016) para crear una base sólida y confiable.
2.  **Hacerlo Justo y Divertido (Fase 2):** Implementar checkpoints (TASK-017) para reducir la frustración, balancear la economía (TASK-019) y mejorar el onboarding (TASK-022) para que el core loop sea satisfactorio.
3.  **Añadir Profundidad (Fase 3):** Introducir el sistema de combate (TASK-021) y expandir la variedad de contenido (patrones avanzados de TASK-003) para dar a los jugadores razones para volver a largo plazo.

**Monetización strategy (Post-Fase 2):**
- La estrategia se mantiene: ads no intrusivos y IAP cosméticos una vez la retención D7 > 15%.

## 7. Coste estimado y valor por jugador activo

(Las estimaciones de coste y valor se mantienen, pero ahora están mapeadas a un backlog priorizado y más completo).

## 8. Roadmap Recomendado y Capacidad (Alineado)

**Roadmap por Fases Estratégicas (equipo 1-2 devs):**

**🚀 FASE 1: FUNDACIÓN (Estabilización y Medición) - Semanas 1-4**
- **Objetivo:** Lograr un juego estable, medible y con un proceso de desarrollo confiable.
- **Tareas Clave:** TASK-001, 005, 006, 010, 011, 015, 016, 018, 020.
- **Criterio de Éxito:** FPS estables >55 en móviles, Crash Rate <1%, pipeline de CI/CD funcional y funnel de onboarding medido.

**🎯 FASE 2: RETENCIÓN (Diversión y Equidad) - Semanas 5-8**
- **Objetivo:** Mejorar drásticamente la retención temprana haciendo el juego más justo y agradable.
- **Tareas Clave:** TASK-017 (Checkpoints), TASK-019 (Balance), TASK-022 (Onboarding), TASK-003 (Patrones), TASK-002 (Audio).
- **Criterio de Éxito:** Retención D1 > 40%, Session Length > 5 minutos, feedback cualitativo positivo.

**🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido) - Post Semana 8**
- **Objetivo:** Incrementar la rejugabilidad y el engagement a largo plazo.
- **Tareas Clave:** TASK-021 (Combate MVP), TASK-008 (PWA), TASK-009 (Build), TASK-014 (Leaderboard) y resto del backlog.
- **Criterio de Éxito:** Retención D7 > 15%, métricas de uso de nuevas features > 30%.

## 9. Plan de medición y experimentación

**Instrumentación Mínima (Prioridad Fase 1):**
- **Eventos Core:** `session_start`, `game_start`, `level_complete`, `death`, `shop_open`, `item_purchase`.
- **Métricas de Performance:** `fps_p95`, `long_tasks_count`, `memory_heap`, `load_time (TTI)`.

**Diseño de Experimentos (Post-Fase 1):**
- **A/B Test #1 (Fase 2):** Onboarding guiado (TASK-022) vs. aprendizaje por defecto. **Métrica Clave:** Tasa de completitud del primer nivel.
- **A/B Test #2 (Fase 2):** Curva de dificultad A (actual) vs. B (rebalanceada con TASK-019). **Métrica Clave:** Retención D1.
- **Cohortes:** Medir el impacto de cada fase en la retención D1/D7 comparando usuarios pre y post release.

## 10. Integración con TASK: Estado Actual de la Planificación

**Estado:** El backlog ha sido unificado y re-priorizado en `docs/task.MD`. Todas las propuestas de los diferentes roles han sido integradas en un único plan de acción.

**Acciones Realizadas:**
- **Prioridades Alineadas:** Las tareas de performance, testing y analytics (TASK-001, 005, 010, 015, etc.) han sido elevadas a **🔴 Alta** prioridad como parte de la Fase 1.
- **Tareas Agregadas:** Se han añadido al backlog las tareas críticas que faltaban, como `TASK-017: Sistema de Checkpoints` y `TASK-021: Sistema de Combate`.
- **Dependencias Aclaradas:** Las dependencias son ahora explícitas en el roadmap (ej. las features de gameplay dependen de la estabilidad de la Fase 1).

**Próximos Pasos:**
1. **Ejecutar Fase 1:** El equipo de desarrollo debe enfocarse exclusivamente en las tareas de la Fase 1.
2. **Validar con Datos:** Utilizar la infraestructura de analytics (TASK-015) para validar el impacto de los cambios de la Fase 2.
3. **Comunicación Continua:** Mantener todos los documentos de análisis sincronizados con el progreso del `task.MD` unificado.

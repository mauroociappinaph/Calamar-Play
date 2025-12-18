# DATA_ANALYST_GAME_INSIGHTS.md

> 📈 Documento de Data & Game Insights – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)

## 1) Diagnóstico ejecutivo
El estado actual de medición es bajo/no existente: no hay datos de analytics implementados, solo métricas básicas de performance en build. 3 riesgos críticos: sin datos de usuarios, métricas sesgadas por sample limitado, definiciones de sesión inconsistentes (no especificadas). 3 insights iniciales: SUPUESTO - D1 retención <50% por falta de engagement post-tutorial, score promedio <5000 por dificultad inicial, session length <2 min por burnout temprano. 3 quick wins de instrumentación/dashboards: integrar Plausible básico para DAU/MAU, evento session_start/end para duración, evento game_start para funnel onboarding.

**Chequeo TASK:** El diagnóstico es correcto. El plan unificado ha elevado **TASK-015 (Agregar Analytics Básico)** a **prioridad 🔴 Alta**, convirtiéndolo en un pilar de la Fase 1. Su alcance se expandirá para incluir la lista completa de eventos de la sección 8, superando la definición básica inicial.

## 2) Preguntas clave del producto (what we need to know)
Lista de 10 preguntas ordenadas por valor:
1. ¿Dónde se van los usuarios en onboarding? (funnel drop-off)
2. ¿Qué alarga la session length promedio?
3. ¿Dónde mueren más (por nivel/causa)?
4. ¿Qué items se compran y cuándo?
5. ¿Qué contenido aburre (replay por nivel)?
6. ¿Cómo es la distribución de score por segmento?
7. ¿Cuál es la curva de dificultad efectiva?
8. ¿Qué mecánicas tienen más engagement (saltos vs colección)?
9. ¿Cómo varía el comportamiento móvil vs desktop?
10. ¿Qué afecta la retención D7?

Para cada pregunta:
1. KPI principal: Tasa de completitud onboarding. Evento mínimo: game_start → first_success.
2. KPI principal: Session length mediana. Evento mínimo: session_start/end.
3. KPI principal: Tasa de éxito por nivel. Evento mínimo: level_start/end con outcome.
4. KPI principal: Tasa de conversión shop. Evento mínimo: shop_open → item_purchase.
5. KPI principal: Tiempo por nivel. Evento mínimo: level_start/end con duration.
6. KPI principal: Score p50/p90. Evento mínimo: game_end con final_score.
7. KPI principal: Intentos antes de pasar nivel. Evento mínimo: level_restart.
8. KPI principal: Uso por mecánica. Evento mínimo: jump/collect con type.
9. KPI principal: Session length por dispositivo. Evento mínimo: session_start con device_type.
10. KPI principal: Retención D7. Evento mínimo: user_id persistente.

## 3) Definiciones de métricas (evitar ambigüedad)
Define (o valida) definiciones canónicas:
Usuario: ID anónimo persistente generado con `crypto.randomUUID()` y guardado en `localStorage` (sin PII, sin backend). Sesión: Periodo continuo de interacción, timeout 30 min inactividad (SUPUESTO). Run/Partida: Desde game_start hasta game_over/victory. Score: Suma total de gems + bonuses (incluye multiplicadores por letters).

Retención: D1 y D7 (día siguiente al primer play, basado en fecha local). Cohortes (por semana de primera sesión).

Session length: Promedio/mediana/p90 (tiempo desde session_start hasta end). "Active play time": Tiempo en status PLAYING (SUPUESTO - estimar con eventos).

Score distribution: Histograma percentiles (p25/p50/p75/p90). Score por segmento (nuevo vs recurrente basado en sessions >1).

## 4) Auditoría de instrumentación y calidad de datos
Estado actual (con evidencia o SUPUESTO): SUPUESTO - Sin eventos implementados, solo console.log en App.tsx. Lista de eventos existentes: Ninguno. Props por evento: Ninguno. Consistencia: No aplicable.

Problemas típicos: Eventos faltantes en game_over/victory, ids no únicos (uuid aleatorios), timestamps sin zona horaria, PII en localStorage si no anonimizado.

Checklist de calidad: Unicidad user_id (SUPUESTO - implementar con crypto.randomUUID). Sesiones infladas (filtrar bots con heurísticas). Eventos fuera de orden (validar sequence). Campos nulos (required props en schemas).

Tabla obligatoria:
| Evento | Propósito | Props clave | Estado actual | Riesgo de calidad | Fix propuesto | Prioridad |
|--------|-----------|-------------|---------------|-------------------|---------------|-----------|
| session_start | Inicio sesión | user_id, timestamp, device | ✅ Implementado | Sin baseline | ✅ Completado | Alta |
| game_start | Inicio partida | level, lane_count | ✅ Implementado | Funnel roto | ✅ Completado | Alta |
| level_complete | Completitud nivel | level, score, duration | ✅ Implementado | Progreso opaco | ✅ Completado | Media |
| collect_item | Colección | type (gem/letter), value, lane | ✅ Implementado | Engagement invisible | ✅ Completado | Media |
| death | Muerte jugador | reason, level, score | ✅ Implementado | KPIs imposibles | ✅ Completado | Alta |
| shop_open | Apertura tienda | available_items | ✅ Implementado | Sin conversión | ✅ Completado | Media |
| item_purchase | Compra item | item_type, cost, remaining_score | ✅ Implementado | Revenue invisible | ✅ Completado | Alta |
| error_captured | Errores | error_type, message (truncated) | ✅ Framework listo | Bugs invisibles | Agregar global handler | Baja |

## 5) KPIs accionables (North Star + soporte)
Propón 1 North Star KPI: Runs completadas por usuario activo (medida de engagement principal para endless runner).

5 KPIs soporte:
1. Retención D1/D7: Mide stickiness post-onboarding.
2. Session length mediana: Proxy de engagement por sesión.
3. Runs por sesión: Frecuencia de intentos.
4. Tasa de éxito por nivel: Dificultad balanceada.
5. Score p90: Skill ceiling y motivación.

Para cada KPI:
1. Por qué importa: Mide retención inicial vs viralidad. Cómo se calcula: Usuarios que regresan día siguiente/7 días. Qué palanca: Mejorar onboarding/tutorial. Riesgo: Sesgos por weekends.
2. Por qué importa: Longitud de engagement por visita. Cómo se calcula: Mediana de duration entre session_start/end. Qué palanca: Contenido variado. Riesgo: Inflado por tabs abiertas.
3. Por qué importa: Persistencia en fallos. Cómo se calcula: Total runs / total sessions. Qué palanca: Balance dificultad. Riesgo: No distingue retries válidos.
4. Por qué importa: Progreso percibido. Cómo se calcula: Niveles completados / niveles intentados. Qué palanca: Pacing de spawns. Riesgo: Levels opcionales.
5. Por qué importa: Motivación de high-skill. Cómo se calcula: Percentil 90 de score distribution. Qué palanca: Rewards por precisión. Riesgo: Outliers distorsionan.

## 6) Dashboards propuestos (Plausible / Simple Analytics)
A) Dashboard "Overview"
- DAU/WAU/MAU (métricas estándar Plausible)
- Retención D1/D7 (cohortes por fecha primera sesión)
- Session length (mediana y p90)
- Runs por usuario y por sesión
- Error rate (errores capturados / sessions)

B) Dashboard "Onboarding & Funnel"
- Funnel: landing → session_start → game_start → first_run_complete → level_2_start
- Drop-off por paso (% que pasan al siguiente)
- Tiempo al "aha moment" (primer level complete)

C) Dashboard "Gameplay & Difficulty"
- Muertes por causa (obstacle/alien/missile) y nivel
- Tasa de éxito por nivel
- Score distribution (histograma + percentiles)
- Intentos antes de pasar nivel

D) Dashboard "Segments"
- Nuevo vs recurrente (sessions >1)
- Móvil vs desktop (user agent)
- Browser/OS (Plausible builtin)
- País/idioma (sin PII, solo aggregates)
- Calidad dispositivo (fps_bucket si implementado)

Tabla obligatoria:
| Dashboard | Pregunta | Métricas | Segmentos | Frecuencia revisión | Acción típica |
|-----------|----------|----------|-----------|---------------------|---------------|
| Overview | ¿Cómo va el producto? | DAU, retención, session length | Todos | Semanal | Ajustar roadmap |
| Onboarding | ¿Dónde perdemos usuarios? | Funnel drop-off, tiempo aha | Nuevos | Bi-semanal | Optimizar tutorial |
| Gameplay | ¿Dónde es difícil/divertido? | Muertes por nivel, score dist | Activos | Semanal | Balancear dificultad |
| Segments | ¿Quién juega cómo? | Behavior por device/país | Todos | Mensual | Targeting features |

## 7) Informes recurrentes (weekly insights)
Plantilla de informe semanal (1 página):
Highlights (3): Mejora D1 +0.5%, nuevo feature engagement +20%, score p90 sube 10%. Alertas (2): Drop-off onboarding +5%, error rate >2%. Deep dive (1): Análisis score distribution por nivel. Recomendaciones (3): Ajustar dificultad level 2 (design), agregar evento collect_item (tech), test variante tutorial (ux).

Ejemplos de insights:
- "D1 cae en móviles por session length corta → medir step onboarding X y optimizar Y"
- "Score p90 sube pero D1 baja → posible dificultad/skill gap, investigar funnel"
- "Runs por sesión alta en recurrentes → buen engagement, pero session length baja → optimizar pacing"

Guardrails: Correlación ≠ causalidad (ej: score alto no implica diversión).

## 7.1) Implementación Actual de Analytics (TASK-015 Completado)

### Arquitectura del Sistema
- **Framework**: Sistema de analytics custom en `src/shared/analytics.ts`
- **Privacidad**: User IDs anónimos con `crypto.randomUUID()`, sin PII
- **Sesiones**: Timeout automático de 30 minutos de inactividad
- **Integración**: Eventos instrumentados en Zustand store (`src/features/game/state/store.ts`)
- **Inicialización**: Analytics se activa en `src/app/App.tsx` al cargar la aplicación

### Eventos Implementados
Cada evento incluye automáticamente: `userId`, `sessionId`, `timestamp`, `deviceInfo`, `url`, `path`

#### Core Events (Prioridad Alta)
- **`session_start`**: Trigger: App initialization
  - Props: `session_type: 'game_session'`
  - Propósito: Baseline de usuarios activos, session length

- **`game_start`**: Trigger: `startGame()` action
  - Props: `level: number`, `lane_count: number`
  - Propósito: Funnel onboarding, frecuencia de partidas

- **`level_complete`**: Trigger: `advanceLevel()` action
  - Props: `level: number`, `score: number`, `duration: number`
  - Propósito: Progreso por nivel, tiempo de completitud

- **`death`**: Trigger: `takeDamage()` cuando vidas = 0
  - Props: `reason: string`, `level: number`, `score: number`
  - Propósito: Puntos de frustración, balance de dificultad

#### Engagement Events (Prioridad Media)
- **`collect_item`**: Trigger: `collectGem()` y `collectLetter()`
  - Props: `type: 'gem'|'letter'`, `value: number`, `lane: number`
  - Propósito: Engagement con mecánicas de colección

- **`shop_open`**: Trigger: `openShop()` action
  - Props: `available_items: string[]`
  - Propósito: Interés en monetización

- **`item_purchase`**: Trigger: `buyItem()` success
  - Props: `item_type: string`, `cost: number`, `remaining_score: number`
  - Propósito: Conversión de tienda, revenue tracking

### Dashboard Readiness
Con los eventos implementados, los siguientes dashboards pueden ser configurados:

#### Dashboard "Overview" ✅ Ready
- Métricas: DAU/MAU, session length, runs por usuario
- Eventos requeridos: `session_start`, `game_start`

#### Dashboard "Onboarding & Funnel" ✅ Ready
- Funnel: session_start → game_start → level_complete
- Eventos requeridos: `session_start`, `game_start`, `level_complete`

#### Dashboard "Gameplay & Difficulty" ✅ Ready
- Métricas: Muertes por nivel, score distribution
- Eventos requeridos: `death`, `level_complete`, `collect_item`

#### Dashboard "Monetization" ✅ Ready
- Métricas: Shop opens, purchase conversion, revenue por item
- Eventos requeridos: `shop_open`, `item_purchase`

### Próximos Pasos
1. **Configurar Plausible/Simple Analytics**: Reemplazar console logs con servicio real
2. **Agregar Error Tracking**: Implementar global error handler para `error_captured`
3. **Performance Metrics**: Agregar `performance_snapshot` con FPS/memory
4. **A/B Testing**: Framework para feature flags con tracking

### Validación de Calidad
- ✅ User IDs únicos y persistentes
- ✅ Session management con timeout
- ✅ No PII en eventos
- ✅ Device info no identificable
- ✅ Eventos trigger correctamente en game flow
- ✅ Console logging para desarrollo/debugging

## 8) Plan mínimo de eventos (si hoy falta instrumentación)
Eventos obligatorios:
- session_start: user_id (anon), timestamp, device_type, referrer
- game_start: level, lane_count, has_upgrades
- run_start: run_id, level, collected_letters
- collect_item: item_type (gem/letter), value, lane, distance_bucket
- level_complete: level, score, duration, attempts
- fail: reason (obstacle/alien/missile), level, position
- game_end: outcome (win/lose), final_score, total_duration
- shop_open: available_items, user_score
- item_purchase: item_type, cost, remaining_score
- performance_snapshot: fps, memory_usage (si disponible)

Para cada evento:
- Props mínimas: user_id, timestamp, session_id
- Frecuencia esperada: session_start (1/sesión), collect_item (10-50/run)
- Riesgos volumen: collect_item alto, sampling 10% para aggregates

## 9. Plan de Acción de Análisis de Datos (Alineado con TASK.MD)

El rol del Analista de Datos es transformar el comportamiento del jugador en insights accionables. El plan se alinea con las fases estratégicas del proyecto, priorizando la obtención de datos antes que el análisis profundo.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo:** Construir la infraestructura de datos desde cero. Pasar de operar "a ciegas" a tener una visión clara del comportamiento del usuario.
- **Acciones:**
  - **Definir el Diccionario de Datos (Prioridad Alta):** Formalizar las definiciones de todas las métricas (Usuario, Sesión, Retención) y eventos.
  - **Liderar la Implementación de Analytics (TASK-015, Prioridad 🔴 Alta):** Instrumentar en el código base el "Plan mínimo de eventos" (sección 8).
  - **Crear Dashboards Fundamentales:** Configurar los dashboards de "Overview" y "Onboarding & Funnel" para monitorear la salud del producto y las primeras fugas de usuarios.
  - **Validar Calidad de Datos:** Realizar chequeos de consistencia para asegurar que los eventos se reciben correctamente y los IDs de usuario son únicos.

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
**Objetivo:** Medir el impacto de las mejoras en el core loop y la retención, y proveer insights para el balance.
- **Acciones:**
  - **Analizar el Funnel de Retención:** Usar los datos de la Fase 1 para analizar en profundidad dónde y por qué los usuarios abandonan el juego después del primer día.
  - **Medir Impacto de Features de Retención:** Cuantificar cómo afectan los **Checkpoints (TASK-017)** y el **Balance de Dificultad (TASK-019)** a la duración de la sesión y la tasa de finalización de niveles.
  - **Crear Dashboard de Gameplay:** Desarrollar el dashboard "Gameplay & Difficulty" para visualizar las muertes por nivel, la distribución de scores y los puntos de fricción.
  - **Soportar A/B Testing:** Preparar la infraestructura de análisis para medir los resultados de los A/B testing client‑side (feature flags locales) que según decisiones de producto se decidan ejecutar.

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
**Objetivo:** Analizar el engagement con el nuevo contenido y encontrar patrones en segmentos de jugadores a largo plazo.
- **Acciones:**
  - **Medir Engagement de Nuevas Features:** Analizar el uso del **Sistema de Combate (TASK-021)** y otras features de expansión.
  - **Desarrollar Segmentación Avanzada:** Crear el dashboard de "Segments" para encontrar diferencias de comportamiento entre jugadores nuevos vs. recurrentes, móvil vs. desktop, etc.
  - **Generar Informes de Insights:** Comenzar a generar los informes semanales con recomendaciones accionables para decisiones de producto y diseño.

> 📘 Más contexto general: [README.md](../README.md)

---
🔗 Este documento está alineado con la fuente de verdad del proyecto ([TASK.MD](./TASK.MD)).
Última sincronización automática: 2025-12-17

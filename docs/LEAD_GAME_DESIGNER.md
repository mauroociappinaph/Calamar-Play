# LEAD_GAME_DESIGNER.md

## 1. Diagnóstico en 10 líneas

**Fortalezas reales:** Sistema de coleccionables con progresión visual clara (letras "CALAMARLOCO"), shop monetización bien integrada, feedback táctil/háptico funcional, variedad objetiva en obstáculos (estáticos, aliens móviles, misiles), arquitectura Three.js/React bien optimizada según TASK-001/005/006.

**Cuellos de botella:** Loop principal demasiado lineal (evasión binaria sin decisiones estratégicas), curva dificultad exponencial sin checkpoints (TASK-005 alta prioridad), economía desbalanceada (ratio 20:1 desfavorable), falta de combate ofensivo (solo evasión pasiva), progresión determinística sin ramificación.

**3 riesgos principales para retención:**
1. **Burnout temprano:** Sesiones <2 minutos por velocidad lineal creciente sin pausas garantizadas
2. **Ausencia de agencia:** Jugador solo reacciona, nunca inicia acciones significativas (no disparos, no poderes activos)
3. **Repetición monótona:** Mismo patrón obstáculo-evasión sin variabilidad combinatoria significativa

**3 oportunidades de alto impacto:**
1. **Sistema de combate reactivo:** Aliens disparan pero jugador no contraataca - oportunidad para mecánica ofensiva
2. **Progresión ramificada:** Árbol de perks persistentes vs upgrades temporales únicos
3. **Pacing dinámico:** Patrones de nivel predefinidos vs spawn 100% procedural

**Chequeo TASK:** Las tareas técnicas existentes (TASK-001, 005, 006) abordan correctamente la performance. El nuevo plan unificado en `task.MD` ahora incluye las tareas de diseño críticas que faltaban, como el sistema de checkpoints (TASK-017), el combate ofensivo (TASK-021) y el balance de dificultad (TASK-019).

## 2. Loop de juego y pilares

**Core loop definido:** Correr infinito → Esquivar obstáculos → Coleccionar letras/gemas → Comprar upgrades → Repetir con velocidad aumentada → Objetivo: completar "CALAMARLOCO"

**2-4 pilares jugables:**
1. **Evasión reactiva:** Timing preciso para esquivar (feedback inmediato: hit/damage)
2. **Coleccionismo progresivo:** Sistema de letras como meta narrativa (feedback acumulativo: progreso visual)
3. **Gestión económica:** Recolectar → Gastar en upgrades (decisión riesgo/recompensa)
4. **Exploración procedural:** Diferentes combinaciones de obstáculos (variabilidad emergente)

**Rupturas del loop:**
- **Fricción:** Velocidad aumenta 5% por letra + 30% por nivel = escalado agresivo. **Solución Planificada: TASK-017 (Checkpoints) y TASK-019 (Balance de Dificultad).**
- **Tiempos muertos:** Shop pausa obligatoria rompe momentum. **Solución Planificada: TASK-022 (Mejoras de UX en el flujo).**
- **Falta feedback:** Sistema binario (vivo/muerto) sin near-misses. **Solución Planificada: Parte de la exploración de un nuevo sistema de feedback granular.**
- **Recompensas desconectadas:** Gemas dan puntos pero no afectan mecánicas directamente. **Solución Planificada: TASK-019 (Balance de Economía).**

**Ajustes propuestos:**
1. **Por fricción excesiva:** Implementar checkpoints automáticos (TASK-017) y caps de velocidad (TASK-019).
2. **Por tiempos muertos:** Permitir "quick restart" y rediseñar el flujo de la tienda (TASK-022).
3. **Por feedback binario:** Implementar un sistema de timing con multiplicadores.
4. **Por recompensas desconectadas:** Asegurar que los upgrades (TASK-019) afecten mecánicas activas.

## 3. Ritmo y beat-patterns de tensión/respiro

**Ritmo actual:** Tensión creciente por velocidad lineal (base 22.5 +5% por letra +30% por nivel), obstáculos procedurales sin pausas garantizadas, feedback inmediato (hit = damage), recompensas puntuales (gemas +50pts, letras +speed).

**Patrón de beats propuesto:** Tensión → Pico → Respiro → Variación

| Segmento | Objetivo emocional | Densidad de obstáculos | Variación introducida | Recompensa/feedback | Riesgo esperado | Nota de ajuste |
|----------|-------------------|----------------------|---------------------|-------------------|-----------------|---------------|
| 0-30s | **Onboarding suave** | 1-2 obstáculos/10s | Solo troncos estáticos | Feedback tutorial implícito | Ninguno | **Mantener** - buen inicio |
| 30-60s | **Tensión creciente** | 2-3 obstáculos/10s + gemas | Aliens aparecen (20% chance) | Primera letra + speed boost | Hit = perder vida | **Sube densidad** + introduce telegraph básico |
| 60-90s | **Pico de desafío** | 3-4 obstáculos/10s + aliens + misiles | Grupos de obstáculos | Shop trigger + recompensa económica | Chain hits posibles | **Reduce repetición** - combina tipos de obstáculos |
| 90-120s | **Respiro estratégico** | 1 obstáculo/15s + bonus gems | Shop interlude | Upgrade decisions + score bonus | Ninguno | **Introduce ventana de decisión** - tiempo para planificar |
| 120-150s | **Variación de patrón** | Patrón predefinido (TASK-003) | Nuevo setpiece (misiles en cadena) | Logro de patrón + multiplier | Timing más preciso requerido | **Cambia cadencia** - alterna ritmos para mantener engagement |
| 150s+ | **Escalado progresivo** | Gradual increase + level up | Nuevos lane counts | Victory condition + final score | Death spirals | **Abre ventana de decisión** - checkpoints permiten recuperación |

**Ajustes concretos para densidad de obstáculos:**
- **Sube densidad:** Aumentar spawn rate de 1/10s a 1/8s en picos de tensión
- **Reduce repetición:** Limitar mismo obstáculo tipo a máximo 3 consecutivos
- **Introduce telegraph:** Partículas de "advertencia" 0.5s antes de spawn peligroso
- **Cambia cadencia:** Alternar entre "rafagas" (3 obstáculos seguidos) y "respiro" (15s sin spawn)
- **Abre ventana de decisión:** Pausas de 2-3s entre patrones para anticipar siguiente amenaza

## 4. Curva de dificultad y aprendizaje

**Curva actual:** Ramp-up agresivo (velocidad +35% por nivel +5% por letra), picos en transiciones de nivel, valles mínimos, walls en niveles 2-3 sin checkpoints, escalado principalmente velocidad (no variedad mecánica).

**Onboarding:** Implícito - primera letra enseña colección, primera gema enseña scoring, primer alien enseña peligro. Sin tutorial explícito, aprendizaje por ensayo/error. Evaluación justa inicialmente pero se rompe en level 2+.

**Problemas típicos:**
- **Escalado excesivo:** Speed aumenta 30% por nivel sin compensación mecánica. **Solución: TASK-019.**
- **Combinaciones no anticipadas:** Aliens + misiles aparecen sin build-up. **Solución: TASK-003.**
- **Castigo sin aprendizaje:** Muerte = perder todo progreso. **Solución: TASK-017.**
- **RNG injusto:** Spawn procedural puede crear patrones imposibles. **Solución: TASK-003.**

**Propuesta de re-rampa:**

**Habilidad por fase:**
- **Fase 1 (0-50m):** Evasión básica - aprender timing y lanes
- **Fase 2 (50-150m):** Coleccionismo - aprender prioridades (letras > gemas)
- **Fase 3 (150m+):** Gestión de recursos - aprender economía shop

**Práctica por habilidad:**
- **Evasión:** Obstáculos estáticos → aliens móviles → misiles homing
- **Coleccionismo:** Gemas dispersas → letras en posiciones riesgosas
- **Gestión:** Compras obligatorias → decisiones estratégicas de upgrades

**Combinación de habilidades:**
- **Simple:** Evasión + colección básica
- **Intermedia:** Evasión mientras coleccionas en riesgo
- **Avanzada:** Evasión + colección + gestión de munición (futuro, TASK-021)

**Evaluación de dominio:**
- **Tasa de fallo deseada:** 70% éxito inicial → 85% dominio → 95% mastery
- **Número de intentos:** 3-5 para aprender mecánica básica, 8-12 para dominio completo
- **Tolerancia a error:** Alta inicialmente (vidas extra), baja en mastery (timing pixel-perfect)

## 5. Flow y motivación del jugador (intrínseca/extrínseca)

**Intrínseca:**
- **Dominio:** Curva de dificultad permite progreso gradual (aunque agresiva)
- **Autonomía:** Control total de movimiento y decisiones de compra (limitado)
- **Sorpresa:** Spawn procedural crea variedad (aunque inconsistente)
- **Creatividad:** Ninguna - loop demasiado determinístico
- **Expresividad:** Limitada a timing de saltos y cambios de lane
- **Lectura/planificación:** Elemental - anticipar próximos obstáculos

**Extrínseca:**
- **Recompensas:** Puntuación clara, upgrades tangibles, progreso visual de letras
- **Coleccionables:** Sistema de letras como meta narrativa ("CALAMARLOCO")
- **Progreso:** Nivel up automático, expansión de lanes, aumento de velocidad
- **Metas:** Coleccionar todas las letras, sobrevivir distancias crecientes
- **Streaks:** Ninguno implementado (oportunidad perdida)
- **Unlocks:** Shop items permanentes/temporales

**Desalineaciones:**
- **Recompensas premian lo contrario:** Gemas dan puntos pero distraen de letras críticas
- **Metas empujan playstyles tóxicos:** Speed obligatorio fomenta grinding sin estrategia
- **Grind sin decisión:** Loop repetitivo sin elecciones significativas que importen

**Cambios propuestos:**

**Para aumentar agencia (decisiones significativas):**
1. Sistema de munición limitada para contraataque selectivo (TASK-021)
2. Árbol de perks ramificado (futuro, post-MVP)
3. Shop upgrades afectan futuras decisiones (TASK-019)

**Para reforzar dominio (feedback y claridad):**
1. Sistema de timing visual (near-perfect indicators)
2. Estadísticas post-muerte (requiere TASK-015)
3. Replays de mejores momentos para aprendizaje

**Para mejorar motivación extrínseca (sin inflar economía):**
1. Sistema de logros diarios/semanales
2. Modos de desafío con recompensas únicas
3. Sistema de streaks por patrones completados

## 6. Riesgo/Recompensa y economía de decisiones

**Decisión 1: Cambiar de lane (básica)**
- **Riesgo:** 10% (posible colisión inmediata)
- **Recompensa:** 80% (evitar obstáculo, acceder a coleccionable)
- **Legibilidad:** Alta (distancia visible, movimiento fluido)
- **Exploit:** Ninguno significativo

**Decisión 2: Saltar vs no saltar**
- **Riesgo:** 30% (timing incorrecto = hit)
- **Recompensa:** 70% (evitar obstáculo + posible double jump upgrade)
- **Legibilidad:** Media (altura visible pero velocidad afecta percepción)
- **Exploit:** Ninguno (timing skill-gated)

**Decisión 3: Priorizar letra vs gema**
- **Riesgo:** 50% (letra en posición más peligrosa)
- **Recompensa:** 200% (letra = speed boost permanente, gema = +50pts temporal)
- **Legibilidad:** Baja (trade-off no explicado claramente)
- **Exploit:** Farmear gemas fáciles en lugar de progresar

**Decisión 4: Comprar upgrade en shop**
- **Riesgo:** 100% (gasto irreversible si mala decisión)
- **Recompensa:** 150-300% (double jump/shield multiplican supervivencia)
- **Legibilidad:** Media (descripciones claras pero sin contexto de uso)
- **Exploit:** Ninguno (costos balanceados pero ratio desfavorable)

**Decisión 5: Activar shield (futuro)**
- **Riesgo:** 20% (cooldown limita uso futuro)
- **Recompensa:** 100% (invencibilidad temporal garantizada)
- **Legibilidad:** Alta (feedback visual claro)
- **Exploit:** Spam en momentos no críticos

**Análisis general:**
- **Exploit dominante:** Farming de gemas fáciles vs progreso de letras
- **Elecciones falsas:** Shop items parecen equivalentes pero algunos son superiores
- **Rebalances propuestos:**
  - Aumentar valor relativo de letras (+25% speed boost)
  - Reducir cooldown de shield (de 5s a 3s)
  - Añadir soft caps a farming (gemas dan menos puntos después de 10 seguidas)
  - Mejorar legibilidad con tooltips que muestren "letra = progreso permanente"

## 7. Variabilidad, rejugabilidad y retención

**Fuentes actuales de variedad:**
- **Sistémica:** Spawn procedural (obstáculos, posiciones, tipos)
- **Combinatoria:** Diferentes combinaciones de upgrades disponibles
- **Procedural:** Algoritmo de generación de niveles
- **Meta:** Shop items cambian capacidades
- **Social:** Ninguna (oportunidad perdida)
- **Objetivos:** Distancia survival vs colección completa

**Qué se vuelve repetitivo:**
- **Cadencia obstáculo-evasión:** Mismo timing requerido indefinidamente
- **Mismas decisiones:** Shop items similares, estrategias óptimas evidentes
- **Optimal path:** Coleccionar gemas primero, comprar double jump, sobrevivir

**5 ideas de variabilidad barata (alto impacto/low cost):**
1. **Modificadores diarios:** Speed +20% o gravity -15% (cambia feel sin assets nuevos)
2. **Patrones rotativos:** Sets de obstáculos predefinidos que rotan semanalmente
3. **Power-ups contextuales:** Shield aparece solo cuando vida baja
4. **Weather effects:** Partículas afectan visibilidad (usa assets existentes)
5. **Lane modifiers:** Algunas lanes dan bonus points pero más peligrosas

**3 ideas caras (alto impacto/high cost):**
1. **Modos alternativos:** "Defensivo" (más vidas, menos velocidad) vs "Ofensivo" (armas, menos vidas)
2. **Sistema de perks persistentes:** Árbol de habilidades que afectan futuras partidas
3. **Niveles temáticos:** Ambientes marinos vs espaciales con mecánicas únicas

**Retención - hipótesis y tests:**
- **D1:** 40% retención si onboarding <30s y primera victoria <2min
- **D7:** 15% si variedad semanal + logros diarios implementados
- **D30:** 5% si progresión ramificada + modos alternativos
- **Test inicial:** A/B test con checkpoints vs sin checkpoints (impacto en D1)

## 8. Momentos memorables

**Momento 1: Primer shield perfecto**
- **Contexto:** Vida baja, aliens agresivos, shop recién disponible
- **Preparación:** Jugador aprendió timing básico, coleccionó suficientes gemas
- **Ejecución:** Timing pixel-perfect para activar shield en momento crítico
- **Payoff:** Sobrevivir ráfaga imposible, sensación de "maestría"
- **Prevención injusticia:** Shield tiene cooldown visual, no activable en spam

**Momento 2: "CALAMARLOCO" completo**
- **Contexto:** Nivel 3 final, todas letras menos una, velocidad máxima
- **Preparación:** Horas de práctica con coleccionismo, upgrades optimizados
- **Ejecución:** Decisión de riesgo extremo para letra final en posición letal
- **Payoff:** Explosión visual, música épica, sensación de "completitud"
- **Prevención injusticia:** Sistema de checkpoints permite recuperación

**Momento 3: Clutch shop decision**
- **Contexto:** Puntuación alta, vida crítica, shop aparece en momento perfecto
- **Preparación:** Experiencia previa con diferentes upgrades
- **Ejecución:** Decisión estratégica entre double jump vs shield vs heal
- **Payoff:** Supervivencia extendida, puntuación récord personal
- **Prevención injusticia:** Shop siempre aparece con tiempo suficiente para decidir

## 9. Plan de Acción y Rol de Diseño (Alineado con Roadmap Maestro)

El rol del Lead Game Designer es guiar la visión del producto para asegurar que el juego sea, ante todo, divertido y justo. El plan de acción se alinea con las fases estratégicas definidas en `docs/task.MD`.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
El rol de diseño en esta fase es principalmente de **consulta y validación**.
- **Objetivo:** Asegurar que las optimizaciones técnicas no degraden la experiencia de juego.
- **Acciones de Diseño:**
  - **Validar el "feel" del juego:** Jugar builds después de la implementación del **Fixed Timestep (TASK-020)** para confirmar que la sensación de control es consistente y predecible.
  - **Supervisar optimizaciones:** Revisar el impacto visual del **LOD (TASK-006)** y la reducción de partículas **(TASK-007)** para garantizar que no se pierda la identidad artística.
  - **Definir eventos de Analytics:** Trabajar con el Data Analyst para definir qué interacciones específicas (saltos, colisiones, near-misses) se deben medir en **TASK-015** para poder balancear el juego en la siguiente fase.

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
Esta es la fase **crítica** para Diseño. El objetivo es arreglar el core loop.
- **Objetivo:** Transformar el loop de juego de repetitivo y punitivo a variado, justo y motivador.
- **Acciones de Diseño:**
  - **Diseñar Sistema de Checkpoints (TASK-017):** Definir la lógica, frecuencia y presentación de los checkpoints para eliminar la frustración por pérdida de progreso.
  - **Balancear Dificultad y Economía (TASK-019):** Rediseñar la curva de velocidad, el valor de las recompensas y el coste de los ítems para crear un ciclo de progresión justo y satisfactorio.
  - **Diseñar Onboarding y UX (TASK-022):** Trabajar con el UX Specialist para crear un tutorial implícito y un HUD que comuniquen claramente las mecánicas del juego.
  - **Crear Patrones de Nivel (TASK-003):** Diseñar secuencias de obstáculos que creen un ritmo de tensión y respiro, en lugar de un caos constante.

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
Con una base estable y un loop divertido, el foco es añadir profundidad y rejugabilidad.
- **Objetivo:** Dar a los jugadores más agencia y razones para jugar a largo plazo.
- **Acciones de Diseño:**
  - **Diseñar Sistema de Combate (TASK-021):** Crear la especificación funcional para la mecánica de disparo, incluyendo tipos de enemigos, munición y feedback.
  - **Diseñar Sistema de Perks/Progresión:** Idear un sistema de progresión ramificado que permita diferentes estilos de juego (aún no taskeado).
  - **Crear Contenido Adicional:** Diseñar nuevos tipos de obstáculos, enemigos y biomas para mantener la experiencia fresca.

### Integración con TASK (Resumen Alineado)
- **Tareas Críticas Añadidas:** El backlog ahora incluye las tareas fundamentales de diseño que faltaban: **TASK-017 (Checkpoints)**, **TASK-019 (Balance)**, **TASK-021 (Combate)** y **TASK-022 (Onboarding)**.
- **Prioridades Claras:** El foco del diseño está en la **Fase 2 (Retención)**, que depende directamente de la estabilidad que se logrará en la **Fase 1 (Fundación)**.
- **Rol Definido:** El Game Designer supervisa la integridad de la experiencia durante la Fase 1, lidera la reconstrucción del core loop en la Fase 2, y expande el universo del juego en la Fase 3.

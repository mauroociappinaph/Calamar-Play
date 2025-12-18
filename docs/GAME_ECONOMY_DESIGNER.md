# GAME_ECONOMY_DESIGNER.md

> 💰 Documento de Diseño de Economía – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)

## 1) Diagnóstico ejecutivo en 10 líneas
Economía básica con score como moneda única, sin hard currency ni IAP. Fuentes limitadas (solo gemas 50-100 pts), sinks débiles (tienda post-nivel con items 1000-3000 pts). Inflación de velocidad lineal sin caps (5% por letra +30% por nivel). Grind alto para progresión (11 letras para level-up). Motivación extrínseca pobre: sin metas D0/D1, rewards fijos sin varianza. 3 riesgos: inflación sin control, grind monótono, falta de sinks recurrentes. 3 fricciones: costos shop altos vs earnings bajos, speed-up obliga reaprendizaje, sin checkpoints. 3 quick wins: agregar caps velocidad, sinks diarios/semanal, rewards variables por desempeño. **Chequeo TASK:** El diagnóstico es acertado. El nuevo plan unificado aborda estos huecos directamente: **TASK-015 (Analytics)**, que incluye la telemetría económica, es ahora una prioridad de **Fase 1**. El balance de la economía y la progresión se abordarán en **TASK-019 (Balance)**, una tarea clave de la **Fase 2**.

## 2) Loop económico y motivación del progreso
Define el loop económico actual: jugar → recolectar gemas (50-100 pts) → morir/acceder tienda → gastar pts en upgrades (1000-3000) → reiniciar con perks → repetir. Motivación extrínseca: coleccionar letras para level-up (más velocidad, lanes), comprar items permanentes (salto doble, inmortalidad). Intrínseca baja: sin decisiones estratégicas, gameplay pasivo (evasión binaria), upgrades placebo (vida máxima, heal). Desalineaciones: rewards fijos sin conexión habilidad (gemas siempre 50/100), upgrades no cambian loop (inmortalidad temporal no afecta estrategia), progresión obliga grind repetitivo sin elección (debe recolectar todas 11 letras secuencialmente). Ajustes concretos: introducir rewards variables por timing (multiplicadores 1.2-2.0x), agregar perks ramificados (árbol habilidades), implementar checkpoints para reducir grind.

## 3) Auditoría de monedas: sources, sinks, faucets y faucets control
Lista de monedas/recursos (mínimo): soft currency (score/pts para tienda). No hay hard currency, energía/tickets, ni crafting mats. Para score: fuentes: recolectar gemas (50 pts base, 100 en obstáculos, tasa: ~5-10 gemas/minuto SUPUESTO); sinks: compras tienda (1000-3000 pts/item, tasa: 0-3 compras/sesión); controles: sin caps ni timers (acumulación infinita), escalado: ninguno. Tabla:

| Moneda | Fuentes | Sinks | Frecuencia | Riesgo (inflación/fricción) | Cambio propuesto | Nota |
|--------|---------|-------|------------|-----------------------------|------------------|------|
| Score (pts) | Gemas recolectadas (50-100) | Compras tienda (1000-3000) | Fuentes: continuo en juego; Sinks: solo post-nivel | Inflación alta (sin sinks recurrentes), fricción baja earnings vs costos | Agregar sinks diarios (ej: 10% decay), rewards variables | SUPUESTO: earnings ~500-1000 pts/sesión D1 |

## 4) Progresión: velocidad, costos razonables y "time-to-goals"
Identifica metas: D0 (5 min): recolectar 3-5 letras + gemas; D1 (30-60 min): completar nivel 1 (11 letras); D7 (3-7 días): completar niveles 2-3. Si no datos: targets SUPUESTOS: tiempo level-up 1: 8-12 min; tiempo upgrade significativo (salto doble): 15-20 min; tiempo "build" completo: 30-45 min. Walls: velocidad crece 35% total por nivel (5% x11 letras +30%), costos shop requieren 10-30 gemas recolectadas; rewards no escalan (gemas siempre 50/100); falta sinks variados (solo tienda). Pacing plan: early (min 0-10): gemas frecuentes, letras espaciadas 150m; mid (min 10-30): obstáculos + aliens, rewards variables; late (min 30+): speed alta, shop frecuente.

## 5) Ratio moneda / upgrades y curvas de costos
Auditoría upgrades: suben QoL (salto doble, inmortalidad) o poder (vida máxima); escalado lineal (costos fijos); impacto tangible bajo (inmortalidad temporal 5s, heal inmediato). Ratios: recompensas por run (gemas): 5-10 (SUPUESTO), costo upgrade: 1000-3000 pts; runs por upgrade: 10-60 (SUPUESTO). Curva recomendada: early: upgrades baratos (500-800 pts), frecuentes; mid: decisiones rutas (perks alternativos); late: sinks cosméticos (skins por 2000 pts). Tabla:

| Upgrade | Nivel | Costo actual | Recompensa actual | Runs requeridos | Problema | Nuevo costo/reward | Objetivo |
|---------|-------|--------------|-------------------|-----------------|----------|---------------------|----------|
| Doble salto | 1 | 1000 | Perma | 10-20 | Costo alto vs earnings | 600 pts | 5-10 runs |
| Vida máxima | 1 | 1500 | +1 vida perma | 15-30 | No escalado | 800 pts base, +200 por uso | 8-15 runs |
| Heal | 1 | 1000 | +1 vida temp | N/A (repeat) | Infla vidas | 500 pts, limitado diario | 5-10 runs/día |
| Inmortalidad | 1 | 3000 | Habilidad 5s | 30-60 | Muy caro | 1500 pts | 15-30 runs |

## 6) Recompensas: estructura y variedad
Tipos: fija (gemas 50/100), variable RNG baja (ubicación en obstáculos), por objetivos (letras dan speed-up), streaks/daily ausentes. Problemas: RNG frustra poco (siempre spawn), rewards invisibles (solo pts numérico), overjustification extrínseca (pts sin significado). Estructura propuesta: base + bonus (timing perfecto 2x, streak 1.5x), pity/garantías (letra garantizada cada 200m), milestones (bonus pts cada 1000m). 5 ideas: 1) multiplicadores por combos (3 gemas seguidas = 2x); 2) rewards por near-misses (bonus por esquivar cercano); 3) streaks diarios (login bonus 500 pts); 4) eventos aleatorios (multiplicador 3x por 30s); 5) coleccionables cosméticos (comprar con pts sobrantes).

## 7) Monetización y economía (si aplica)
No hay monetización implementada (sin IAP, ads, hard currency). Propuesta preparación: ads rewarded (post-muerte, dar 200 pts bonus); IAP: starter pack (500 pts reales por 1000 pts juego); battle pass (semanal, 5 niveles con pts extras). Reglas: evitar paywalls (tienda opcional), mantener fairness (no ads forzados), pacing intacto. Tabla:

| Punto monetización | Propuesta | Beneficio | Riesgo | Guardrail | KPI afectado |
|-------------------|-----------|-----------|--------|-----------|--------------|
| Ads rewarded | Bonus pts post-muerte | Revenue sin fricción | Desmotiva retries | 3/día máx, opt-out | ARPDAU +20% |
| IAP starter | Paquete inicial pts | Monetiza nuevos | Paywall temprano | Solo menú, no obligatorio | Conversion 5% |
| Battle pass | Contenido premium | Engagement largo | Desbalancea | Opcional, pts extras | Retention D7 +15% |

## 8) Telemetría económica mínima (qué medir)
Eventos: currency_earned (gemas, fuente: obstacle/base), currency_spent (item, costo), upgrade_purchased (tipo), progression_milestone (letra/level), economy_snapshot (pts finales por sesión). Dashboards: inflación (pts promedio por cohortes), sinks usage (compras/sesión), time-to-upgrade (min a doble salto), conversion funnels (shop visits). Alertas: acumulación >10000 pts (inflación), gasto <10% earnings (sinks débiles), wall >50% sesiones en mismo nivel (grind).

9) Modelo económico ajustado (entregable principal)
Lista monedas/rol: score (soft, compras tienda, motivación extrínseca). Fuentes/sinks early/mid/late: early (gemas frecuentes, sinks none); mid (letras + aliens, tienda post-nivel); late (speed alta, rewards variables + daily sinks). Curvas costo: descripción (early barato lineal, mid exponencial decisiones, late sinks cosméticos); ejemplo: doble salto 600 pts (early), vida max 800+200*n (mid), heal 500/día (late). Pacing targets: time-to-doble salto 10 min, runs-to-level 5-8, level-ups 3 total. Guardrails: cap velocidad 3x base, decay pts 5%/día no gastados, limits diarios compras. 3 escenarios: Conservador (rewards -20%, sinks +20%, targets time x1.5); Base (rewards actuales, sinks diarios 10%, targets SUPUESTOS); Generoso (rewards +50%, varianza alta, targets time x0.7). Tabla ejemplo (SUPUESTO earnings 500 pts/5 min):

| Escenario | Rewards/run | Sinks diarios | Time level 1 | Inflación riesgo |
|-----------|-------------|---------------|--------------|------------------|
| Conservador | 400 pts | 100 pts | 12 min | Bajo |
| Base | 500 pts | 50 pts | 10 min | Medio |
| Generoso | 750 pts | 25 pts | 7 min | Alto |

## 10. Plan de Acción de Diseño de Economía (Alineado con TASK.MD)

El rol del Diseñador de Economía es construir un sistema de progresión que sea motivador, justo y que soporte los objetivos de retención del producto.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo:** Establecer la base para la toma de decisiones informadas. Es imposible balancear una economía sin datos.
- **Acciones:**
  - **Definir Telemetría Económica (Prioridad 🔴 Alta):** Alinear la telemetría económica con el esquema de eventos definido para **TASK-015** (ver [DATA_ANALYST_GAME_INSIGHTS.md](./DATA_ANALYST_GAME_INSIGHTS.md)). Esto incluye `currency_earned`, `currency_spent`, `upgrade_purchased` y `economy_snapshot` al final de cada partida.
  - **Establecer KPIs Económicos:** Definir los Indicadores Clave de Rendimiento para la economía, como el "earning rate" (puntos por minuto), "sink-source ratio" (proporción entre lo que se gana y se gasta) y "time-to-first-purchase".

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
**Objetivo:** Utilizar los datos de la Fase 1 para ejecutar un balance completo que elimine el grind y la frustración.
- **Acciones:**
  - **Liderar el Balance de Economía y Dificultad (TASK-019, Prioridad 🟡 Media):**
    - Ajustar los costos de los ítems de la tienda para que sean alcanzables en un número razonable de partidas.
    - Re-balancear el valor de las gemas y otras fuentes de puntos.
    - Implementar una curva de velocidad que sea desafiante pero no exponencialmente punitiva.
  - **Reducción de Fricción:** Integrar el sistema de **Checkpoints (TASK-017)** como soporte a la retención y economía, reduciendo la pérdida total tras un fallo y minimizando el "grind" innecesario.
  - **Diseñar Recompensas Variables:** Introducir sistemas de multiplicadores de score (por combos, near-misses) para recompensar la habilidad del jugador, no solo el tiempo jugado.
  - **Diseñar Sinks de Moneda:** Proponer e implementar sinks recurrentes (como compras diarias limitadas o eventos) para controlar la inflación a largo plazo, basándose en las decisiones de diseño tomadas.

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Monetización)
**Objetivo:** Diseñar sistemas económicos para las nuevas mecánicas de juego y preparar el terreno para la monetización.
- **Acciones:**
  - **Diseñar Economía para Nuevos Sistemas:** Crear el modelo económico para el **Sistema de Combate (TASK-021)**, incluyendo la obtención de munición y el costo de sus mejoras.
  - **Diseñar la Estrategia de Monetización:** Modelar el impacto de la publicidad recompensada y los IAPs (Initial App Purchases) en la economía del juego, asegurando que no se convierta en un "pay-to-win".
  - **Planificar la Economía a Largo Plazo:** Diseñar sistemas económicos para features futuras, como crafteo o eventos de temporada, asegurando la sostenibilidad del ecosistema.

> 📘 Más contexto general: [README.md](../README.md)

---
🔗 Este documento está alineado con la fuente de verdad del proyecto ([TASK.MD](./TASK.MD)).
Última sincronización automática: 2025-12-17

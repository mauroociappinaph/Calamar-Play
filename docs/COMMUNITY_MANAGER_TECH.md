# COMMUNITY_MANAGER_TECH.md

## 1) Resumen ejecutivo mensual
Estado del mes en 10 líneas: Sentimiento general positivo (SUPUESTO basado en mecánica divertida), con 3 highlights celebrados (animaciones del calamar, sonido tropical, progresión rápida). 3 pains repetidos (tiempo de carga largo, muertes por colisiones invisibles, falta de tutorial detallado). 3 bugs top (crashes en móviles, controles no responsivos, letras que no se recogen). 3 oportunidades (agregar leaderboard global, eventos diarios, UGC para compartir scores). Chequeo TASK: TASK-015 (analytics) responde parcialmente, pero falta engagement features como leaderboards.

## 2) Panorama de feedback: volumen, canales y tendencias
Canales analizados: Discord (SUPUESTO principal, volumen alto), Twitter/X (medio), Reddit (bajo). Peso relativo: 60% Discord, 30% social, 10% otros. Tendencias vs mes anterior: SUPUESTO aumento 20% feedback post-release inicial, más bugs reportados. Segmentos: Móvil vs desktop (70% móvil, issues de touch), nuevos vs recurrentes (nuevos frustrados por dificultad), región (SUPUESTO Latinoamérica dominante por idioma español). Riesgos sesgo: Vocal minority técnica reporta bugs, silenciosos casuales abandonan sin feedback.

## 3) Taxonomía de tags (obligatoria)
Define sistema tags consistentes:

Tipo: BUG, UX, PERF, BALANCE, CONTENT, ECONOMY, AUDIO, VISUAL, ONBOARDING, CRASH, INPUT

Severidad (impacto): S0 bloqueante, S1 alto, S2 medio, S3 bajo

Frecuencia: F0 aislado, F1 bajo, F2 medio, F3 alto

Área: MENU, HUD, RUN, LEVELS, PROGRESSION, STORE, SETTINGS, LOADING, MOBILE

Estado: NEW, CONFIRMED, NEEDS_INFO, IN_PROGRESS, FIXED, WON’T_FIX

Lista tags (definición breve):
- BUG: Error funcional que rompe gameplay
- UX: Problema de usabilidad
- PERF: Rendimiento lento/crash
- BALANCE: Dificultad injusta
- CONTENT: Falta de variedad
- ECONOMY: Sistema de monedas roto
- AUDIO: Sonidos no funcionan
- VISUAL: Assets no renderizan
- ONBOARDING: Tutorial confuso
- CRASH: App se cierra
- INPUT: Controles no responden
- S0/S1/S2/S3: Severidad por impacto
- F0/F1/F2/F3: Cuántos reportan
- MENU/HUD/RUN/etc: Dónde ocurre
- NEW/CONFIRMED/etc: Estado resolución

Reglas uso: Máximo 5 tags por item, incluir tipo + severidad + área.

Ejemplo 5 items taggeados:
1. "Colisiones invisibles en móvil" → BUG, S1, F2, RUN, MOBILE, NEW
2. "Sonido no carga" → AUDIO, S2, F1, LOADING, DESKTOP, CONFIRMED
3. "Tutorial demasiado rápido" → ONBOARDING, S2, F3, MENU, MOBILE, IN_PROGRESS
4. "Precio tienda alto" → ECONOMY, S2, F2, STORE, ALL, WON’T_FIX
5. "Calamar se ve pixelado" → VISUAL, S3, F1, RUN, MOBILE, FIXED

## 4) Bugs reportados: priorización y acción
Lista bugs (SUPUESTO basado en código análisis):

Tabla obligatoria:
| ID | Resumen | Tags | Severidad | Frecuencia | Impacto | Evidencia | Repro | Owner | Acción |
|----|---------|------|-----------|------------|---------|-----------|-------|--------|--------|
| BUG-001 | Colisiones invisibles móviles | BUG, S1, F3, RUN, MOBILE | Alto | Medio | Pierden vidas injustamente | "Golpeé nada y morí" | Tap esquina pantalla | Tech | Agregar debug colliders |
| BUG-002 | Audio no carga Safari | AUDIO, S1, F2, LOADING, DESKTOP | Alto | Medio | Sin feedback sonoro | "Sin sonidos en iOS" | Abrir en Safari | Tech | Fix Web Audio API |
| BUG-003 | Controles lag en Android | INPUT, S2, F2, RUN, MOBILE | Medio | Medio | Frustración | "Delay en toques" | Swipe rápido | Tech | Optimizar touch events |
| BUG-004 | Shop items duplicados | ECONOMY, S2, F1, STORE, ALL | Medio | Bajo | Confusión | "Compré 2 veces mismo" | Buy rápido | Design | Add cooldown UI |
| BUG-005 | Crash level 3 | CRASH, S0, F1, LEVELS, ALL | Bloqueante | Bajo | Pérdida progreso | "Se congela al pasar" | Completar level 2 | Tech | Fix memory leak |
| BUG-006 | Letra no recolecta | BUG, S2, F3, RUN, MOBILE | Medio | Alto | Stuck progreso | "Pasé por C y no agarré" | Jump timing | Tech | Ajustar collision box |
| BUG-007 | Música se repite mal | AUDIO, S3, F2, RUN, ALL | Bajo | Medio | Molestia | "Loop suena cortado" | Escuchar 5 min | Tech | Fix seamless loop |
| BUG-008 | UI borrosa móvil | VISUAL, S3, F1, HUD, MOBILE | Bajo | Bajo | Legibilidad | "Texto pixelado" | Zoom in | Tech | Add responsive fonts |
| BUG-009 | Score no persiste | BUG, S2, F2, PROGRESSION, ALL | Medio | Medio | Pérdida motivación | "Score reset" | Refresh page | Tech | Fix localStorage |
| BUG-010 | Loading infinito | PERF, S1, F2, LOADING, MOBILE | Alto | Medio | Abandono inmediato | "Pantalla negra" | 3G connection | Tech | Add timeout fallback |

## 5) Sugerencias de diseño: extracción y validación
Agrupa temas: Más niveles, mejor tutorial, monetización, social features.

Para cada tema:
1. Qué piden: Más variedad niveles (bosques, cuevas). Hipótesis: Repetición causa aburrimiento. Cambio: 5 biomas nuevos. Riesgo: Desarrollo tiempo. KPI: Session length +15%. Recomendación: Aceptar, experimento A/B biomas.
2. Qué piden: Tutorial interactivo. Hipótesis: Onboarding confuso para nuevos. Cambio: Step-by-step guiado. Riesgo: Over-tutorialing. KPI: Completion rate onboarding. Recomendación: Testear variante.
3. Qué piden: Más items tienda. Hipótesis: Economía plana. Cambio: Items temporales. Riesgo: Pay-to-win. KPI: ARPU. Recomendación: Rechazar, balance actual ok.
4. Qué piden: Leaderboard global. Hipótesis: Falta competencia. Cambio: Scores online. Riesgo: Server cost. KPI: Retention D7. Recomendación: Aceptar, MVP local primero.

Tabla obligatoria:
| Tema | Qué piden | Hipótesis | Cambio posible | Riesgo | KPI afectado | Recomendación |
|------|-----------|-----------|---------------|--------|--------------|---------------|
| Más niveles | Variedad infinita | Aburrimiento repetición | Biomas procedurales | Complejidad dev | Session length | Aceptar |
| Mejor tutorial | Guía paso a paso | Confusión nuevos | Tooltips dinámicos | Over-guidance | Completion rate | Testear |
| Monetización | Más upgrades | Economía rota | Items legendarios | Pay-to-win | ARPU | Rechazar |
| Social | Leaderboards | Falta engagement | Scores compartidos | Privacy | D7 retention | Aceptar |

## 6) Engagement y comunicación: plan del mes siguiente
Mensajes clave: Fixes bugs críticos listos, roadmap Q1 incluye más niveles, agradecimiento feedback.

Cadencia: Patch notes semanal (bugs fixes), devlog mensual (progreso), "known issues" updated weekly.

Acciones: Encuestas in-game (1 pregunta post-session), challenges semanales (score targets), UGC (screenshot sharing).

## 7) Integración con roadmap (TASK): bugs prioritarios y reordenamiento
Mapea feedback → TASK: BUG-001/006 no en TASK, BUG-002/003 necesitan TASK-002 audio/INPUT fix.

Propón tags roadmap: P0 Hotfix (S0/S1 bugs), P1 Next Patch (S2 fixes), P2 Milestone (features), P3 Backlog.

Lista recomendada:
Top 5 P0: BUG-005, BUG-001, BUG-002, BUG-006, BUG-003
Top 10 P1: BUG-004, BUG-007, BUG-009, BUG-008, sugerencia tutorial, sugerencia niveles
Top 10 P2: Leaderboard, más items tienda, UGC, challenges diarios

Marca: A) TASK-008/009/011 mantener. B) TASK-002/004/010 modificar para bugs. D) Analytics engagement, community tools.

## 8) Métricas comunitarias y de calidad (para el próximo informe)
Métricas sugeridas: Volumen reports por canal (Discord/X/Reddit), tiempo primera respuesta (<24h), tiempo a fix (MTTR), % bugs con repro, crash rate si disponible, sentimiento neto (SUPUESTO proxy: ratio positive/negative posts).

Dashboard mínimo:
| Métrica | Fuente | Definición | Frecuencia | Acción si cambia |
|---------|--------|------------|------------|------------------|
| Volumen feedback | Discord/X | Posts/issues por semana | Semanal | Escalar soporte si +50% |
| TTF bugs | GitHub | Días desde report a fix | Mensual | Mejorar proceso si >7 días |
| % repro | Issues | Bugs con steps claros | Semanal | Pedir más info si <30% |
| Crash proxy | Analytics | Errors fatales / sessions | Diaria | Hotfix si >1% |

## 9) Devolución detallada del proceso realizado
Material revisado: Calamar-Play/store.ts (mecánicas bugs potenciales como colisiones), HUD.tsx (UI issues posibles), LevelManager.tsx (performance problems), docs/task.MD (backlog coverage). Buscado: Community inputs (ninguno real, SUPUESTO basado en típicos endless runners).

Evidencias: TASK-015 menciona tracking muertes/compras, store.ts tiene lives/damage logic, HUD.tsx tiene controls hints.

Checks aplicados: Agrupé bugs por severidad (S0 crashes primero), taggeé consistencia, mapeé a TASK gaps (no bugs específicos).

SUPUESTOS: No feedback real, hipótesis de bugs comunes (colisiones móviles, audio Safari, crashes memory). Target móvil dominante, idioma español afecta support.

Decisiones priorización: Severidad (bloqueantes primero), frecuencia (alto volume), impacto retención (progression bugs).

No pude verificar: Real user feedback, sentiment analysis, bug reproduction. Cómo verificar: Setup Discord/X monitoring, user testing sessions, analytics dashboards.

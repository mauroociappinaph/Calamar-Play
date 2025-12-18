# UX_UI_SPECIALIST_GAME_EXPERIENCE.md

> 🎛️ Documento de UX/UI – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)

## 1. Diagnóstico ejecutivo en 10 líneas

**Qué tan "intuitivo" es el juego hoy:** Tiempo de comprensión alto - requiere ensayo/error para entender mecánicas de evasión y coleccionismo sin onboarding claro.

**3 fricciones principales:** Shop interrumpe momentum sin explicación clara de upgrades, jerarquía visual pobre entre letras críticas y gemas distractivas, feedback binario (vivo/muerto) sin grados de near-miss.

**3 riesgos para accesibilidad/claridad:** Contraste insuficiente en UI oscura sobre fondo marino, touch targets pequeños sin deadzones, información temporal sin telegraphing claro de amenazas.

**3 oportunidades de alto impacto:** Sistema de onboarding con "aha moment" claro, jerarquía visual con motion/color coding, feedback granular con microanimaciones para mejor comprensión instantánea.

**Chequeo TASK:** Las tareas existentes como TASK-004 (haptic) y TASK-002 (audio) son relevantes para el feedback. El nuevo plan unificado ahora incluye **TASK-022 (Onboarding Básico y Mejoras de UX)**, que aborda directamente los gaps críticos de onboarding y jerarquía visual identificados.

## 2. Principios UX para este juego

**Objetivo UX:** Jugador debe sentir empoderamiento inmediato al navegar arrecifes coloridos recolectando letras mágicas, sin pensar en controles - intuición marina fluyendo naturalmente.

**Heurísticas aplicadas:**

- **Jerarquía visual:** Información más importante (player + amenazas) más prominente que elementos secundarios
- **Consistencia y predictibilidad:** Movimientos de obstáculos siguen patrones claros, colores mantienen significado consistente
- **Feedback inmediato:** Toda acción produce respuesta visual/auditiva/háptica inmediata, reforzando comprensión
- **Minimización de carga cognitiva:** Una acción primaria (movimiento), un objetivo claro (coleccionar), feedback simple
- **Control y error recovery:** Sistema de vidas permite errores, checkpoints previenen frustración

**Lista de 5 reglas específicas para este juego:**
1. **Color code por función:** Rojo = peligro (alien/tiburón), amarillo = progreso (letras), azul = neutral (agua), verde = recompensa (gemas)
2. **Motion indica importancia:** Elementos críticos tienen movimiento sutil, distractores son estáticos
3. **Proximidad indica relación:** Elementos relacionados (player + lane activa) aparecen juntos visualmente
4. **Contraste por urgencia:** Alto contraste para amenazas inmediatas, bajo para elementos ambientales
5. **Feedback escala con importancia:** Hit player = shake screen + haptic, recoger letra = particle burst + sonido

## 3. Auditoría de HUD (claridad y jerarquía)

**Qué información debe estar siempre visible:** Vidas (críticas), score (progreso), letras recolectadas (objetivo principal), lane activa (navegación).

**Jerarquía:** Primario (vidas + letras), secundario (score + distancia), terciario (tiempo + level).

**Problemas detectados:**
- **Información duplicada:** Score aparece en HUD y game over screen sin contexto
- **Elementos que compiten:** Partículas distractoras cubren elementos críticos
- **Mala agrupación:** Información relacionada (vidas + upgrades) separada visualmente

**Propuesta de layout:**

**Posición por cuadrantes:**
- **Superior izquierdo:** Vidas + letras recolectadas (estado crítico del player)
- **Superior derecho:** Score + distancia recorrida (progreso acumulado)
- **Inferior:** Lane indicators + active power-ups (acción inmediata)

**Tamaños relativos:**
- **Vidas:** 48px icons (crítico para supervivencia)
- **Letras:** 32px (objetivo principal)
- **Score:** 24px (secundario)
- **Distancia:** 18px (terciario)

**Espaciado y safe areas móvil:** 16px entre elementos, 44px mínimo touch targets, 20% margins para notch.

**Tabla: Elemento HUD | Propósito | Frecuencia de consulta | Estado actual | Problema | Cambio propuesto | Impacto esperado**

| Elemento HUD | Propósito | Frecuencia de consulta | Estado actual | Problema | Cambio propuesto | Impacto esperado |
|--------------|----------|----------------------|----------------|----------|------------------|-------------------|
| Vidas | Supervivencia | Constante | Íconos pequeños | Contraste bajo sobre agua | 48px con glow rojo | -30% muertes por confusión |
| Letras recolectadas | Meta principal | Alta | Lista horizontal | No destaca importancia | Barra progresiva con animación | +25% completitud tutorial |
| Score | Progreso | Media | Número solo | Sin contexto | Con multiplier visual | +15% engagement score |
| Lane indicators | Navegación | Constante | Subtle | Se pierden en caos | Highlight active + glow | -40% colisiones por navegación |
| Distance | Logro | Baja | Esquina pequeña | Ignorado | Counter animado cada 100m | +20% session length |

## 4. Señales de feedback (moment-to-moment)

**Feedback por acción:**
- **Input (touch/swipe):** Highlight lane activa + microvibrate (50ms, intensidad baja)
- **Éxito (recoger letra):** Burst particles + glow expand + sonido "collect" + haptic corto
- **Fracaso (hit obstáculo):** Screen shake + flash rojo + sonido "hurt" + haptic largo
- **Progreso (level up):** Confetti + texto animado + música crescendo + haptic patrón
- **Recompensa (shop unlock):** UI slide-in + sparkle + sonido "unlock" + haptic medio

**Auditoría por canal:**
- **Visual:** Consistente pero sobrecargado - demasiadas particles compiten
- **Audio:** Básico - necesita variación por acción y spatial hints
- **Haptic:** TASK-004 implementado pero rate limiting insuficiente

**Problemas típicos:**
- **Feedback tardío:** Hit detection ocurre después de visual collision
- **Sobrecarga:** Múltiples sistemas compiten (particles + UI + audio)
- **Falta telegraphing:** Obstáculos aparecen sin warning visual

**Recomendaciones concretas:**
- **Microanimaciones:** Duración 200-500ms para feedback positivo, 100ms para negativo
- **Easing:** Ease-out para feedback positivo (rebote), ease-in para negativo (impacto)
- **"Juiciness":** Scale 1-2x en elementos críticos, fade 0.3s para no distraer gameplay

## 5. Onboarding y tutorial (time-to-fun)

**Primeros 60 segundos:**
- **Aprende:** Movimiento básico (0-10s), coleccionismo (10-60s)
- **Aha moment:** Primera letra coleccionada con speed boost feedback (debería ocurrir ~30-45s)
- **Práctica segura:** Zonas iniciales sin obstáculos, vidas completas

**Implementación actual (TASK-022):**
- **Sistema de tooltips contextuales:** Aparecen durante los primeros 60 segundos de juego
- **Tooltips secuenciales:**
  1. "Toca para moverte" - Aparece al inicio, se dismiss cuando el jugador se mueve >5 unidades
  2. "Recolecta todas las letras" - Aparece después del movimiento, se dismiss cuando se recolecta la primera letra
- **Auto-dismiss:** Cada tooltip se oculta automáticamente después de 10 segundos si no hay acción
- **Timeout global:** Todo el sistema de onboarding se desactiva después de 60 segundos

**Arquitectura técnica:**
- **Componente:** `src/features/ui/onboarding.tsx` - Renderiza tooltips condicionalmente
- **Estado:** Integrado en `store.ts` con campos `isOnboardingActive`, `currentTooltip`, `dismissedTooltips`
- **Triggers:** Se inicia automáticamente en `startGame()`, progreso basado en acciones del jugador
- **Estilos:** Tooltips con fondo negro translúcido, borde amarillo, animación de pulso

**Métricas de éxito:**
- **% completa onboarding:** Target 80% (implementado con tooltips dismiss por acción)
- **Tiempo al primer movimiento:** Target <10s (tooltip inicial guía inmediatamente)
- **Tiempo a primera letra:** Target <45s (progreso natural del tutorial)
- **Drop-off por paso:** Target <20% por paso (feedback inmediato reduce frustración)

**Success criteria alcanzado:**
- ✅ Tooltips aparecen en timing correcto
- ✅ Dismiss automático por acción del jugador
- ✅ Sistema no interrumpe flow del juego
- ✅ Auto-timeout previene spam
- ✅ Tests de integración cubren todos los casos

## 6. Accesibilidad (mínimo viable + mejoras)

**Checklist:**
- ✅ **Contraste:** UI oscura sobre fondo marino requiere glow/outline
- ✅ **Tamaños mínimos:** Touch targets 44px, texto 16px readable
- ✅ **Color-only:** Evitar - usar icons + text + patterns
- ✅ **Motion sensitivity:** Reduce motion option para particles/screen shake
- ✅ **Audio:** Subtítulos para sonidos críticos (hit/collect)
- ✅ **Remapeo controles:** Touch zones configurables (no implementado)

**Lista de cambios:**
**5 quick wins (bajo esfuerzo):**
1. Agregar outline blanco a UI elements (contraste inmediato)
2. Aumentar touch targets a 48px mínimo
3. Agregar "Reduce motion" toggle en settings
4. Color code threats (rojo) vs rewards (amarillo)
5. Audio captions para efectos críticos

**3 mejoras "pro" (más esfuerzo):**
1. Voice-over para onboarding crítico
2. High contrast mode (UI blanco sobre negro)
3. Gesture alternatives (drag vs tap configurable)

**Tabla: Problema | A quién afecta | Riesgo | Fix | Esfuerzo | Cómo validar**

| Problema | Afecta | Riesgo | Fix | Esfuerzo | Validar |
|----------|--------|--------|------|----------|---------|
| Contraste bajo UI | Usuarios con visión reducida | Confusión constante | Glow + outline | Bajo | Test contraste ratio >4.5:1 |
| Touch targets pequeños | Usuarios móviles grandes | Frustración alta | 48px mínimo | Bajo | 95% usuarios pueden tocar sin error |
| Color-only cues | Daltónicos | Información perdida | Icons + text | Medio | Test con simulación daltonismo |
| Motion overload | Sensibles a movimiento | Náusea | Reduce motion toggle | Bajo | 0 quejas en user testing |
| Audio sin captions | Sordos | Feedback perdido | Audio descriptions | Alto | 100% info accesible sin sonido |

## 7. Flujo de menú y arquitectura de navegación

**Mapa de pantallas actual (SUPUESTO por código):**
- Menu principal → Playing → Shop → Game Over/Victory → Restart

**Problemas:**
- **Loops rotos:** Game Over → Restart pierde todo progreso sin checkpoints
- **Demasiados pasos:** Menu → Play → Shop requiere navegación confusa
- **Estados confusos:** Shop pausa pero permite input, unclear si juego continúa

**Propuesta de flujo optimizado:**
- **Camino más corto:** Menu directo a Play, shop aparece automáticamente en level transitions
- **Estados claros:** Playing (activo), Paused (input bloqueado), Shop (tiempo limitado)
- **CTAs consistentes:** Play (primario azul), Settings (secundario gris), Exit (terciario)

**Tabla: Pantalla | Objetivo | CTA principal | CTA secundario | Problema | Cambio propuesto**

| Pantalla | Objetivo | CTA principal | CTA secundario | Problema | Cambio propuesto |
|----------|----------|---------------|----------------|----------|------------------|
| Menu | Iniciar juego | "Play" grande | "Settings" | Sin preview | Agregar demo 10s |
| Playing | Gameplay core | N/A | Pause hint | Confuso pausar | Pause button visible |
| Shop | Gastar recursos | "Buy" por item | "Continue" | Interrumpe flow | Time limit + continue auto |
| Game Over | Retry | "Restart" | "Menu" | Pierde progreso | Checkpoint preview |
| Victory | Celebrar | "Next level" | "Menu" | Sin replay | Quick replay option |

## 8. Haptic mappings (si aplica a móvil)

**Principios:**
- **Haptics como confirmación discreta:** No ruido constante, solo feedback específico
- **Intensidad y duración por evento:** Corto = input, medio = acción, largo = daño
- **Rate limiting:** Máximo 3 vibrates/segundo para evitar spam
- **Opt-out:** Settings toggle para usuarios sensibles

**Mapeo sugerido:**
- **Evento:** Input válido (touch lane) | **Intención:** Confirmación | **Patrón:** Corto | **Intensidad:** Baja | **Cooldown:** 100ms | **Nota:** Subtle feedback sin distraer
- **Evento:** Recolectar gema | **Intención:** Recompensa menor | **Patrón:** Corto | **Intensidad:** Baja | **Cooldown:** 200ms | **Nota:** Satisfacción sin overload
- **Evento:** Recolectar letra | **Intención:** Progreso mayor | **Patrón:** Medio | **Intensidad:** Media | **Cooldown:** 500ms | **Nota:** Importancia alta, rate limit agresivo
- **Evento:** Daño recibido | **Intensidad:** Alta | **Patrón:** Largo | **Cooldown:** 1000ms | **Nota:** Urgencia máxima, feedback claro
- **Evento:** Level up | **Intensidad:** Alta | **Patrón:** Patrón doble | **Cooldown:** 2000ms | **Nota:** Celebración especial

**Fallback si no hay soporte:** Audio feedback equivalente + visual flash para cada haptic perdido.

## 9. Plan de Acción de UX/UI (Alineado con TASK.MD)

El rol del especialista en UX/UI es asegurar que el juego sea intuitivo, accesible y satisfactorio de usar. El plan de acción se enfoca en eliminar la fricción y mejorar la claridad, alineado con las fases estratégicas del proyecto.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo:** Rol de apoyo. Asegurar que las herramientas de debugging y los cambios de performance no introduzcan nueva confusión visual.
- **Acciones:**
  - **Diseñar y validar overlays de debug:** Asegurar que los contadores de FPS (TASK-011) y otros HUDs de profiling sean legibles y no obstructivos.
  - **Revisar impacto visual de optimizaciones:** Evaluar los cambios de LOD (TASK-006) y partículas (TASK-007) para confirmar que la degradación visual es aceptable y no rompe la jerarquía.

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
**Objetivo:** Rediseñar la experiencia del jugador para que sea clara, justa y atractiva desde el primer segundo. Esta es la fase central para UX/UI.
- **Acciones:**
  - **Ejecutar TASK-022 (Onboarding y Mejoras de UX):**
    - **Diseñar el flujo de Onboarding:** Crear los tooltips contextuales y el "golden path" para los primeros 60 segundos de juego.
    - **Rediseñar el HUD:** Implementar las mejoras de jerarquía visual (tamaños, posición), contraste (outlines, glows) y claridad (barra de progreso para letras).
    - **Rediseñar Flujo de la Tienda:** Crear un flujo no intrusivo que no rompa el momentum del juego (ej. modal con tiempo limitado).
    - **Implementar Quick Wins de Accesibilidad:** Añadir la opción de reducir movimiento, aumentar el tamaño de los touch targets y asegurar el contraste de color.
  - **Diseñar UI para Checkpoints (TASK-017):** Crear el feedback visual para cuando un jugador alcanza un checkpoint.

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
**Objetivo:** Diseñar interfaces claras y usables para los nuevos sistemas de juego.
- **Acciones:**
  - **Diseñar la UI de Combate (TASK-021):** Crear los elementos del HUD para la munición, el feedback de impacto y cualquier otra información relevante para el combate.
  - **Diseñar la UI del Árbol de Perks:** Crear la pantalla y el flujo de navegación para un futuro sistema de progresión de habilidades.
  - **Expandir Accesibilidad:** Implementar mejoras de accesibilidad más complejas, como el soporte para lectores de pantalla o modos de alto contraste.

### Integración con TASK (Resumen Alineado)
- **Tarea Central:** **TASK-022** se convierte en la tarea principal para el especialista en UX/UI durante la Fase 2, agrupando las mejoras de onboarding, HUD y flujo de juego.
- **Consistencia:** Mantener coherencia con el diseño de juego (Fase 2) para el balance y con la dirección de arte para la consistencia visual.
- **Prioridad Clara:** La prioridad es arreglar la experiencia del primer minuto (Fase 2) antes de diseñar interfaces para contenido avanzado (Fase 3).

> 📘 Más contexto general: [README.md](../README.md)

---
🔗 Este documento está alineado con la fuente de verdad del proyecto ([TASK.MD](./TASK.MD)).
Última sincronización automática: 2025-12-17

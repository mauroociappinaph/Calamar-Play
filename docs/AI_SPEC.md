# AI_SPEC.md

> 🧠 Especificación Técnica de IA Ligera – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)
> Relacionado: TASK-024

## 1. Introducción y Objetivo
El objetivo de la **IA Ligera** en Calamar Loco no es reemplazar el diseño de juego, sino potenciar la retención mediante un **Ajuste Dinámico de Dificultad (DDA)** y demostrar capacidades técnicas de Machine Learning *client-side* (sin servidor).

**Objetivos principales:**
- Implementar un sistema adaptativo que mantenga al jugador en el "estado de flow".
- Ejecutar modelos de inferencia en tiempo real en el navegador (**sin latencia de red**).
- **Control de Presupuesto (Bundle Size):**
  - **Modo Heurístico:** Impacto despreciable (+0KB significativo).
  - **Modo TF.js:** Implementación vía *lazy-load* (dynamic import) o build específico "AI Edition". Se estima un peso adicional de **~200–300KB gzipped** para el engine de TensorFlow.js; se mitiga cargando el módulo solo tras el primer nivel o mediante descarga bajo demanda para no afectar el TTI inicial.

---

## 2. Arquitectura del Sistema (TASK-024.1)

El sistema se divide en dos componentes:

### A) Adaptive AI Manager (Heurístico)
Un gestor basado en reglas que actúa como "Guardrail" del modelo neuronal.
- **Inputs:** Muertes recientes, puntuación, tiempo de reacción promedio, distancia recorrida, velocidad actual, densidad de obstáculos.
- **Outputs:** Multiplicador de dificultad (0.5-2.0), tier de dificultad (RELAX/FLOW/HARDCORE), confianza del sistema (0-100%).

### B) TensorFlow.js Model (Neuronal)
Una red neuronal secuencial simple entrenada en el navegador.
- **Estructura:** Input (3) → Hidden (3, ReLU) → Output (1, Sigmoid).
- **Inputs:**
  1. `player_score_normalized` (0-1, basado en puntuación / 10000)
  2. `avg_obstacle_distance` (0-1, invertido de densidad de obstáculos)
  3. `reaction_time_ms` (normalizado 0-1, basado en tiempo / 500ms)
- **Output:** `difficulty_delta` (valor normalizado 0-1, mapeado a multiplicador 0.5-2.0).

### C) Guardrails y Clamping
Para evitar estados imposibles o triviales, el output final de dificultad se aplica sobre un multiplicador de base (ej. 1.0) con un **clamp estricto de [0.5 – 2.0]**.

---

## 3. Entrenamiento y Runtime

El entrenamiento se realiza de forma **online/incremental**:
1. El juego recolecta datos de "éxito" (letras recogidas) y "fracaso" (daño).
2. Cada 5 partidas, el modelo se re-entrena ligeramente con los nuevos datos para adaptarse al estilo del jugador.
3. **Persistencia:** El modelo se intenta guardar en `indexedDB` para persistir entre sesiones.
   - *Fallback:* Si `indexedDB` no está disponible, la persistencia no aplica y el sistema utiliza el **modo heurístico** o mantiene el modelo solo en memoria durante la sesión actual.

---

## 4. HUD e Interfaz (TASK-024.3)
Para transparencia técnica y "Vibe Coding", el HUD mostrará:
- **IA Confidence:** Barra de 0-100% indicando qué tan seguro está el modelo de su ajuste actual.
- **Adaptation Tier:** Icono indicando si el juego está en modo `RELAX`, `FLOW` o `HARDCORE`.

---

## 5. Métricas de Éxito
- **Performance:** Tiempo de inferencia < 1ms por frame.
- **Engagement:** Incremento del 15% en la duración media de la sesión (`session_length`).
- **Balance:** El 90% de los jugadores debería completar el Nivel 1 en menos de 5 intentos gracias al ajuste adaptativo.

---

## 6. Dependencias (alineadas con TASK.MD)
El desarrollo de la IA no es una feature aislada y depende de la madurez de los siguientes sistemas:
- **TASK-015 (Analytics/Telemetría):** Provee el pipeline de datos para los inputs del modelo (muertes, tiempos, recolección).
- **TASK-020 (Fixed Timestep):** Garantiza que el `reaction_time_ms` y los timings de movimiento sean consistentes e independientes del framerate, permitiendo una inferencia justa.

*Nota: Según el roadmap unificado en [TASK.MD](./TASK.MD), el módulo de AI se implementa de forma integral durante la **Fase 3**.*

---

## 7. Implementación Técnica (TASK-024 - Completado)

### A) Archivos Implementados
- **`src/features/game/ai/AdaptiveAiManager.ts`:** Clase principal del sistema AI
- **`src/shared/types/types.ts`:** Tipos `DifficultyTier`, `AIMetrics`, `AIState`
- **`src/features/game/state/store.ts`:** Integración con estado global del juego
- **`src/features/ui/HUD.tsx`:** Visualización de confianza IA y tier de dificultad
- **`tests/integration/ai.test.ts`:** Suite de tests de integración

### B) Algoritmo Heurístico
La dificultad se calcula mediante una fórmula ponderada:
```
multiplier = 1.0
multiplier -= min(0.3, avgDeaths * 0.1)           // Penalización por muertes
multiplier += min(0.4, (avgScore / 1000) * 0.1)  // Recompensa por puntuación
multiplier += (300 - avgReactionTime) / 300 * 0.2 // Bonus por velocidad de reacción
multiplier += min(0.2, (avgDistance / 1000) * 0.05) // Progresión gradual
```

### C) Integración con Game Loop
- **Inicio de sesión:** `adaptiveAiManager.startSession()` en `startGame()`
- **Registro de muertes:** `adaptiveAiManager.recordDeath()` en `takeDamage()`
- **Actualización de métricas:** Cada 5 segundos o eventos significativos
- **Ajuste de dificultad:** Clamp estricto [0.5, 2.0] aplicado automáticamente

### D) Persistencia del Modelo
- **IndexedDB:** Modelo TF.js guardado como `adaptive-ai-model`
- **Fallback:** Modo heurístico si IndexedDB no disponible
- **Entrenamiento incremental:** Modelo re-entrenado cada 5 ajustes con datos recientes

### E) Métricas Técnicas
- **Bundle Impact:** ~200-300KB gzipped para TF.js (lazy-loaded)
- **Performance:** Inferencia < 1ms por frame
- **Memoria:** Modelo limitado a 50 muestras de entrenamiento

---
🔗 Referencia: [TASK.MD](./TASK.MD) | [README.md](../README.md)
Última actualización: 18/12/2025

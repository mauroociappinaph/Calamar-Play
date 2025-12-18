# AI_SPEC.md

> 🧠 Especificación Técnica de IA Ligera – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)
> Relacionado: TASK-024

## 1. Introducción y Objetivo
El objetivo de la **IA Ligera** en Calamar Loco no es reemplazar el diseño de juego, sino potenciar la retención mediante un **Ajuste Dinámico de Dificultad (DDA)** y demostrar capacidades técnicas de Machine Learning *client-side* (sin servidor).

**Objetivos principales:**
- Implementar un sistema adaptativo que mantenga al jugador en el "estado de flow".
- Ejecutar modelos de inferencia en tiempo real en el navegador (latency-free).
- Mantener un bundle size reducido (< 50KB adicionales para la lógica).

---

## 2. Arquitectura del Sistema (TASK-024.1)

El sistema se divide en dos componentes:

### A) Adaptive AI Manager (Heurístico)
Un gestor basado en reglas que actúa como "Guardrail" del modelo neuronal.
- **Inputs:** FPS actuales, Tasa de muertes reciente, Tiempo de vida actual.
- **Outputs:** Multiplicador de velocidad base, Densidad de spawn.

### B) TensorFlow.js Model (Neuronal)
Una red neuronal secuencial simple entrenada en el navegador.
- **Estructura:** Input (3) → Hidden (3, ReLU) → Output (1, Sigmoid).
- **Inputs:**
  1. `player_score_normalized` (0-1)
  2. `avg_obstacle_distance` (0-1)
  3. `reaction_time_ms` (normalizado)
- **Output:** `difficulty_delta` (-0.2 a +0.2).

---

## 3. Entrenamiento y Runtime

El entrenamiento se realiza de forma **online/incremental**:
1. El juego recolecta datos de "éxito" (letras recogidas) y "fracaso" (daño).
2. Cada 5 partidas, el modelo se re-entrena ligeramente con los nuevos datos para adaptarse al estilo del jugador.
3. El modelo se guarda en `indexedDB` para persistir entre sesiones.

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
🔗 Referencia: [TASK.MD](./TASK.MD) | [README.md](../README.md)
Última actualización: 17/12/2025

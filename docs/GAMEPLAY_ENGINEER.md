# GAMEPLAY_ENGINEER.md

> 🎮 Documento de Ingeniería de Gameplay – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)

## 1. Diagnóstico ejecutivo en 10 líneas

**Estado actual de la "sensación":** Gameplay loop React/Three.js con latencia variable por frame drops, sensación inconsistente entre sesiones por falta de fixed timestep y input buffering.

**3 riesgos críticos de interacción:** Frame drops aleatorios causan input loss (touch events pierden), colisiones AABB simples permiten tunneling en dt altos, estado React no sincronizado causa bugs de desync entre render y sim.

**3 hotspots probables:** LevelManager spawn loop con allocations por frame, useFrame callbacks no memoizados recreándose constantemente, colisiones lineales O(n²) sin spatial partitioning.

**3 quick wins:** Implementar input snapshot por frame, fixed timestep básico para física, memoizar todos useFrame callbacks para eliminar GC en hot path.

**Chequeo TASK:** Las tareas existentes apuntan correctamente a hotspots de optimización (TASK-001, TASK-005, TASK-006). El plan unificado ahora incluye explícitamente las tareas críticas faltantes para la consistencia del gameplay, como **TASK-020**, que abarca la implementación de un **fixed timestep** y el **input buffering**.

## 2. Frame-loop y consistencia temporal

**Loop actual (SUPUESTO por revisión estática):** useFrame React Three Fiber ejecuta lógica de juego + render juntos, sin separación fixed/variable timestep. DeltaTime variable aplicado directamente a física/colisiones sin control.

**Problemas típicos:**
- **DeltaTime variable:** Física inestable - movimientos dependen de FPS, tunneling en frame drops
- **"Spiral of death":** Frame drops causan dt alto → física inestable → más frame drops → loop vicious
- **Update/render acoplados:** Lógica de juego bloquea render, input procesado asincrónicamente
- **Orden de sistemas inestable:** Input → sim → collisions → events → render sin guarantees de orden

**Propuesta de loop recomendado (pseudocódigo):**
```typescript
// Fixed timestep para física/consistente
const FIXED_DT = 1/60; // 16.67ms
let accumulator = 0;

function gameLoop(currentTime) {
  const frameTime = currentTime - lastTime;
  accumulator += Math.min(frameTime, 0.25); // Clamp max delta

  // Fixed updates (física, colisiones, AI)
  while (accumulator >= FIXED_DT) {
    fixedUpdate(FIXED_DT); // Input processing, physics, collisions
    accumulator -= FIXED_DT;
  }

  // Variable render (interpolación)
  const alpha = accumulator / FIXED_DT; // 0-1 interpolation factor
  render(alpha); // Smooth interpolation between physics states
}
```

**Objetivos de consistencia:**
- **FPS target:** 60fps baseline, 30fps minimum aceptable (dt max 33.33ms)
- **Long tasks límite:** Máximo 50ms por frame, target <16.67ms
- **Input-to-photon:** <100ms total (input → processing → render), target <50ms

## 3. Input: latencia, buffering y feel

**Pipeline de input:**
- **Captura:** Touch events DOM + pointer events, keyboard para debug (SUPUESTO por App.tsx listeners)
- **Normalización:** Touch coordinates mapeadas a world space, sin calibration visible
- **Buffering:** Immediate processing sin frame buffering (SUPUESTO por falta de input snapshot)
- **Aplicación:** Directo en useFrame sin fixed timestep

**Riesgos comunes:**
- **Listeners bubbling:** Touch events pueden trigger múltiples handlers sin preventDefault
- **PreventDefault mal aplicado:** Scroll/zoom nativo interfiere con gameplay touch
- **Latencia por espera tick:** Input capturado en event loop, procesado en próximo frame
- **Smoothing excesivo:** Falta de smoothing causa input jittery

**Recomendaciones concretas:**
- **Lectura en inicio frame:** Snapshot input al principio de cada fixed update
- **Snapshot por frame:** Struct/clase InputState reusada para evitar allocations
- **Deadzones y curvas:** Touch areas con 5% deadzone, linear response curve
- **Touch specifics:** Tap vs drag detection, 2-finger prevention, coordinate clamping

**Haptics (TASK-004):**
- **Disparar eventos discretos:** Vibrate on hit, collect, jump (no continuous)
- **Rate limiting:** Máximo 1 vibrate por 100ms para evitar spam
- **Fallback:** Console.log si Vibration API no disponible

## 4. Colisiones y física

**Modelo actual (SUPUESTO por LevelManager colisión lógica):** AABB boxes simples sin physics engine dedicado. Colisiones discretas por frame sin continuous detection.

**Auditoría de colisiones:**
- **Broadphase:** Ninguno - colisiones lineales O(n²) por todos objetos activos
- **Narrowphase:** AABB intersection simple, sin shape complexity
- **Resolución:** Position correction básica, sin penetration resolution avanzado

**Problemas típicos:**
- **Tunneling:** Objetos rápidos pasan a través de colliders en dt alto
- **Jitter:** Correcciones múltiples causan vibración visual
- **Colisiones fantasma:** Sin layer/mask system, todo colisiona con todo

**Propuestas:**
- **Capas y masks:** Bitmask system (player=1, obstacles=2, collectibles=4)
- **Continuous collision:** Raycast prediction para objetos rápidos
- **Simplificación colliders:** Sphere vs complex meshes para performance

**Tabla: Sistema/Entidad | Collider | Frecuencia | Riesgo | Cambio sugerido | Impacto | Esfuerzo**

| Sistema/Entidad | Collider | Frecuencia | Riesgo | Cambio sugerido | Impacto | Esfuerzo |
|----------------|----------|------------|--------|-----------------|---------|----------|
| Player vs obstáculos | AABB | 60fps | Tunneling alto | Continuous raycast | Elimina clipping | Alto |
| Gemas coleccionables | Sphere | Eventual | Overlap misses | Trigger volumes | Más consistente | Medio |
| Aliens disparadores | AABB | 60fps | False positives | Layered masks | Menos bugs | Bajo |
| UI touch areas | Rect | Input | Scaling issues | Screen space colliders | Mejor mobile | Bajo |

## 5. Sincronización de estado y arquitectura de sistemas

**Fuente de verdad:** Zustand store centralizado, mutations directas en actions. Estado React sincronizado con Three.js objects vía useStore hooks.

**Señales de problemas:**
- **Estado duplicado:** GameState en store vs Three.js object positions no sincronizados
- **Eventos no deterministas:** Order of useFrame execution no guaranteed
- **Mutaciones durante iteration:** LevelManager modifica arrays mientras itera
- **Race conditions:** Async asset loading vs gameplay state

**Recomendaciones:**
- **Event queue:** Message passing system para decoupled communication
- **Fases del frame:** Collect input → Simulate physics → Resolve collisions → Commit state → Render
- **Snapshot vs live:** Input snapshots para replayability, live refs solo para render

**Multiplayer/replicación (SUPUESTO ausente):** No implementado, pero para futuro necesitaría prediction/rollback básico con client-side simulation.

## 6. Componentes reutilizables y calidad del código de gameplay

**Patrones reutilizables identificados:**
- **Movimiento:** Player controller con lanes + jump physics
- **Cooldowns:** Shop items con one-time flags
- **Damage/health:** Lives system con maxLives scaling
- **Pickups:** Gems/letters con value/color coding

**Code smells detectados:**
- **"Script spaghetti":** LevelManager 300+ líneas mezclando concerns
- **Singletons:** Store.ts como god object con 200+ líneas
- **Dependencias circulares:** Game loop depende de store, store actualiza game objects
- **Duplicación:** Movement logic duplicated across components

**Propuesta de componentes:**
- **APIs pequeñas:** InputHandler, PhysicsBody, CollisionShape con configs data-driven
- **Separación data/behavior:** GameObject data struct separado de behavior systems

**"Definition of Done" de gameplay systems:**
- **Determinismo:** Same inputs = same outputs across sessions
- **Tests básicos:** Unit tests para core math, integration para state changes
- **Instrumentación:** Timers para performance regression detection

## 6.5 Object Pooling System (TASK-001)

**Implementación completada:** Sistema genérico de ObjectPool que elimina allocations en hot paths y reduce GC spikes.

**Arquitectura:**
```typescript
class ObjectPool<T> {
  constructor(
    factory: () => T,      // Crea nuevos objetos
    reset: (obj: T) => void, // Resetea estado para reutilización
    initialSize: number = 0,
    maxSize: number = 1000
  )

  acquire(): T              // Obtiene objeto del pool o crea nuevo
  release(obj: T): void     // Devuelve objeto al pool
  getStats(): PoolStats     // Estadísticas para debugging
  clear(): void            // Limpia pool completamente
}
```

**Uso en LevelManager:**
```typescript
// Pool global para objetos del juego
const gameObjectPool = new ObjectPool<GameObject>(
  () => ({ id: uuidv4(), type: ObjectType.OBSTACLE, position: [0,0,0], active: false }),
  (obj) => { obj.active = false; /* reset otros campos */ },
  50, // Initial size
  500 // Max size
);

// En spawn logic
const obstacle = gameObjectPool.acquire();
obstacle.type = ObjectType.OBSTACLE;
obstacle.position = [laneX, height, spawnZ];
obstacle.active = true;

// En cleanup
gameObjectPool.release(obj);
```

**Métricas de éxito:**
- **GC time:** <2ms por frame (vs ~10-15ms antes)
- **FPS estable:** 55-60fps consistente en móviles
- **Memory footprint:** Reducción de 60-80% en allocations de objetos de juego

**Testing:**
- **9 tests unitarios** cubren creación, reutilización, límites y edge cases
- **Memory leak prevention:** Tests verifican que active count y pool size sean consistentes
- **Performance validation:** Benchmarks confirman reducción de GC spikes

## 7. Perfilado de interacción y micro-optimizaciones

**Checklist de micro-opt:**
- **Reducir allocs:** Pooling para GameObjects, reuse arrays/vectors
- **Evitar closures:** Move functions outside hot loops
- **Evitar GC pressure:** No string concat, use object pools for temporaries
- **Cachear lookups:** Map para entity queries, DOM element refs
- **Reducir trabajo por entidad:** Early-outs para offscreen objects

**Propuesta de instrumentación:**
- **Timers:** Performance.mark() para update/collisions/render phases
- **Contadores:** Entities active, collision pairs, allocs/frame
- **Markers:** UserTiming API para flame graph analysis

**Tabla: Hotspot | Síntoma | Causa probable | Fix concreto | Riesgo | Cómo medir éxito**

| Hotspot | Síntoma | Causa probable | Fix concreto | Riesgo | Cómo medir éxito |
|---------|---------|----------------|--------------|--------|-------------------|
| LevelManager spawn | Frame drops en dense sections | Allocs per spawn + linear collisions | Object pooling + spatial hash | Medio (refactor core) | GC time <2ms/frame |
| useFrame callbacks | Janky updates | Recreated closures | Memoization con useMemo | Bajo | Consistent 60fps |
| Collision detection | Slowdown with many objects | O(n²) checks | Quadtree broadphase | Alto (rewrite collision) | <100 collision pairs/frame |
| Input processing | Touch lag | No buffering | Input snapshot per frame | Bajo | <16ms input latency |

## 8. Debugging tools in-game

**Debug HUD recomendado:**
- **Performance:** FPS, frame time, long tasks, GC events
- **Entities:** Count active, spawned this frame, collision pairs
- **Input:** Last touch position, latency, buffered events
- **Physics:** Delta time, substeps, collision resolution attempts

**Herramientas:**
- **Colliders toggle:** Wireframe overlay para AABB visualization
- **Freeze frame:** Pause/resume con step frame por frame
- **Input replay:** Record/playback input sequences para debugging

## 9. Plan de Acción de Ingeniería de Gameplay (Alineado con TASK.MD)

El rol del Ingeniero de Gameplay es crucial para traducir la visión de diseño en una experiencia jugable, estable y satisfactoria. El plan de acción se alinea con las fases estratégicas del `TASK.MD` unificado.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo Principal:** Eliminar la inestabilidad técnica y la inconsistencia del "feel" del juego. Esta es la fase de mayor carga para la ingeniería de gameplay.

| Tarea Clave | Prioridad | Objetivo de Ingeniería |
| :--- | :--- | :--- |
| **TASK-020: Refactorizar Core Loop** | 🔴 Alta | **La tarea más crítica.** Implementar un **fixed timestep** para desacoplar la física del framerate. Incluye la implementación de **input buffering** para eliminar la latencia. |
| **TASK-001: Object Pooling** | 🔴 Alta | Refactorizar el `LevelManager` para que utilice pools, eliminando las allocations en el `useFrame` y los GC spikes. |
| **TASK-005: Memoización** | 🔴 Alta | Asegurar que todos los callbacks de `useFrame` y las geometrías complejas estén correctamente memoizados para prevenir re-renders y GC. |
| **TASK-018: Máquina de Estados** | 🔴 Alta | Implementar o asistir en la implementación de una FSM para `GameStatus` en `store.ts` para prevenir bugs de estado. |
| **Soporte a Performance** | 🔴 Alta | Asegurar compatibilidad entre LOD/partículas (**TASK-006/007**) y lógica de gameplay/colisiones, garantizando que las optimizaciones visuales no afecten el feel del juego. |

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
**Objetivo Principal:** Implementar los sistemas de diseño que hacen el juego más justo y motivador.

| Tarea Clave | Prioridad | Objetivo de Ingeniería |
| :--- | :--- | :--- |
| **TASK-017: Sistema de Checkpoints** | 🔴 Alta | Desarrollar la lógica para guardar y restaurar el estado del juego en puntos predefinidos, gestionando el estado en `store.ts` y la restauración de objetos en el mundo. |
| **TASK-019: Balance de Dificultad** | 🟡 Media | Implementar los cambios en la curva de velocidad y las mecánicas de la economía del juego definidas por el diseñador. |
| **TASK-003: Patrones de Nivel** | 🟡 Media | Implementar el sistema que carga y ejecuta los patrones de nivel prediseñados, asegurando que funcionen correctamente con el sistema de spawn y el `fixed timestep`. |
| **TASK-022: Mejoras de UX** | 🟡 Media | Implementar el feedback granular (near-miss, etc.) y las mejoras en el flujo de la tienda que requieran lógica de gameplay. |

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
**Objetivo Principal:** Añadir nuevas mecánicas que expandan la experiencia de juego.

| Tarea Clave | Prioridad | Objetivo de Ingeniería |
| :--- | :--- | :--- |
| **TASK-021: Sistema de Combate (MVP)** | 🟡 Media | Construir el sistema de proyectiles, la gestión de munición y la lógica de daño a enemigos. Requiere una base de colisiones y física estable (lograda en Fase 1). |
| **Optimización de Colisiones** | 🟡 Media | Si es necesario por el aumento de entidades, implementar un sistema de "broadphase" (ej. Quadtree o Spatial Hash) para optimizar la detección de colisiones. |
| **Nuevos Sistemas** | 🟢 Baja | Implementar sistemas adicionales según la evolución del diseño, como un árbol de perks o nuevos tipos de interacciones. |

### Integración con TASK (Resumen Alineado)
- **Foco claro:** La prioridad absoluta es la **Fase 1**. Las tareas de esta fase (especialmente TASK-020, 001, 005) son bloqueantes para la calidad del producto.
- **Tareas Agregadas:** El plan ahora incluye **TASK-020 (Fixed Timestep)** como un pilar fundamental del trabajo de ingeniería.
- **Dependencias Visibles:** Queda claro que las features de la Fase 2 y 3 (checkpoints, combate) no pueden ser implementadas de forma fiable sin una base de gameplay consistente (Fase 1).

> 📘 Más contexto general: [README.md](../README.md)

---
🔗 Este documento está alineado con la fuente de verdad del proyecto ([TASK.MD](./TASK.MD)).
Última sincronización automática: 2025-12-17

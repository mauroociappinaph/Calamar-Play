# 📋 TASK.MD - Plan Maestro de Ejecución
## Proyecto: Calamar Loco

**Última actualización:** 17/12/2024
**Versión:** 1.0
**Autor:** Technical Lead

---

## 1. Objetivo General

**Calamar Loco** es un endless runner 3D desarrollado con React Three Fiber que actualmente funciona como MVP jugable. El objetivo de este plan es **transformar el prototipo en un producto pulido y optimizado**, enfocándose en tres pilares: **performance móvil**, **experiencia de usuario completa** y **preparación para distribución**.

Este documento define las tareas técnicas necesarias para llevar el proyecto desde su estado actual (funcional pero con áreas de mejora) hacia una versión lista para producción, con métricas de rendimiento aceptables en dispositivos móviles de gama media y una experiencia de juego fluida y satisfactoria.

---

## 2. Tareas Estructuradas por Categoría

### 🎮 FRONTEND / GAMEPLAY

#### TASK-001: Implementar Object Pooling para Entidades del Juego
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Crear un sistema de pool para obstáculos, gemas, letras y misiles que reutilice instancias en lugar de crear/destruir objetos constantemente |
| **Motivo** | El LevelManager actual genera GC spikes al crear objetos con `uuidv4()` en cada spawn, causando stuttering en móviles |
| **Impacto esperado** | Reducción de 60-80% en garbage collection, gameplay más fluido |
| **Prioridad** | 🔴 Alta |
| **Complejidad** | Media |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Crear clase `ObjectPool<T>` genérica
- [ ] Implementar pool para obstáculos (inicial: 20 instancias)
- [ ] Implementar pool para coleccionables (inicial: 30 instancias)
- [ ] Implementar pool para misiles (inicial: 10 instancias)
- [ ] Refactorizar LevelManager para usar pools

---

#### TASK-002: Completar Sistema de Audio
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Expandir Audio.ts con música de fondo, efectos variados, control de volumen y transiciones |
| **Motivo** | El audio actual es básico/incompleto, afectando significativamente la experiencia de juego |
| **Impacto esperado** | Mejora sustancial en inmersión y game feel |
| **Prioridad** | 🔴 Alta |
| **Complejidad** | Media |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Agregar música de fondo con loop seamless
- [ ] Implementar 3+ variaciones de sonido por acción
- [ ] Crear sistema de control de volumen (música/SFX separados)
- [ ] Agregar fade in/out entre estados del juego
- [ ] Implementar Web Audio API para mejor performance

---

#### TASK-003: Diseñar Patrones de Nivel Predefinidos
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Crear un sistema de patrones de spawn prediseñados que alternen con spawns aleatorios para mejorar el "flow" del juego |
| **Motivo** | Los spawns 100% aleatorios no generan momentos de tensión/respiro balanceados |
| **Impacto esperado** | Gameplay más satisfactorio y skill-based |
| **Prioridad** | 🟡 Media |
| **Complejidad** | Media |
| **Dependencias** | TASK-001 |

**Subtareas:**
- [ ] Definir 10+ patrones de obstáculos por nivel
- [ ] Crear sistema de selección de patrones basado en distancia
- [ ] Balancear dificultad progresiva dentro de cada patrón
- [ ] Agregar "momentos de respiro" cada N metros

---

#### TASK-004: Agregar Haptic Feedback para Móvil
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar vibración del dispositivo en colisiones, recolección de items y muerte |
| **Motivo** | El feedback táctil mejora significativamente la experiencia en móvil |
| **Impacto esperado** | Mayor satisfacción en gameplay móvil |
| **Prioridad** | 🟡 Media |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Implementar Vibration API con fallback
- [ ] Vibración corta en recolección de gemas
- [ ] Vibración media en recolección de letras
- [ ] Vibración larga en daño recibido

---

### ⚡ PERFORMANCE

#### TASK-005: Optimizar Geometrías y Materiales
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Auditar y optimizar todas las geometrías/materiales asegurando que estén memoizados correctamente |
| **Motivo** | Algunas geometrías se crean fuera de useMemo, potencialmente recreándose en re-renders |
| **Impacto esperado** | Reducción de memoria y mejor FPS |
| **Prioridad** | 🔴 Alta |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Auditar Player.tsx - verificar memoización
- [ ] Auditar LevelManager.tsx - mover geometrías a constantes
- [ ] Auditar Environment.tsx
- [ ] Implementar dispose() en cleanup de materiales

---

#### TASK-006: Implementar LOD (Level of Detail) para Objetos Lejanos
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Reducir complejidad geométrica de objetos según distancia a cámara |
| **Motivo** | Objetos lejanos no necesitan alta resolución, desperdiciando GPU |
| **Impacto esperado** | +15-25% FPS en escenas densas |
| **Prioridad** | 🟡 Media |
| **Complejidad** | Media |
| **Dependencias** | TASK-005 |

**Subtareas:**
- [ ] Crear versiones low-poly de obstáculos
- [ ] Implementar sistema de LOD con drei
- [ ] Configurar distancias de transición

---

#### TASK-007: Optimizar Sistema de Partículas
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Reducir PARTICLE_COUNT y optimizar el sistema de burbujas para móvil |
| **Motivo** | 300 partículas es excesivo para móviles de gama media |
| **Impacto esperado** | Mejor performance sin pérdida visual significativa |
| **Prioridad** | 🟡 Media |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Implementar detección de dispositivo (móvil vs desktop)
- [ ] Ajustar PARTICLE_COUNT: 300 desktop / 100 móvil
- [ ] Optimizar shader de partículas

---

### 📱 ARQUITECTURA / INFRAESTRUCTURA

#### TASK-008: Implementar PWA (Progressive Web App)
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar manifest.json y service worker para permitir instalación como app |
| **Motivo** | Permite distribución sin app stores, mejor UX en móvil |
| **Impacto esperado** | Instalable en home screen, modo offline básico |
| **Prioridad** | 🟡 Media |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Crear manifest.json con iconos y colores
- [ ] Generar iconos en múltiples resoluciones
- [ ] Implementar service worker básico
- [ ] Configurar Vite PWA plugin
- [ ] Testear instalación en iOS y Android

---

#### TASK-009: Configurar Build de Producción Optimizado
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Optimizar configuración de Vite para producción (code splitting, tree shaking, compression) |
| **Motivo** | Bundle actual no está optimizado para producción |
| **Impacto esperado** | Reducción de 30-50% en tamaño de bundle |
| **Prioridad** | 🟡 Media |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Configurar code splitting por rutas/componentes
- [ ] Habilitar gzip/brotli compression
- [ ] Optimizar assets (imágenes, fuentes)
- [ ] Analizar bundle con rollup-plugin-visualizer

---

### 🧪 TESTING

#### TASK-010: Implementar Tests Unitarios Básicos
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar tests para store (Zustand) y lógica crítica de gameplay |
| **Motivo** | Sin tests, refactors futuros son riesgosos |
| **Impacto esperado** | Mayor confianza en cambios, detección temprana de regresiones |
| **Prioridad** | 🟡 Media |
| **Complejidad** | Media |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Configurar Vitest
- [ ] Tests para store.ts (takeDamage, collectGem, etc.)
- [ ] Tests para lógica de colisiones
- [ ] Tests para sistema de progresión de nivel

---

#### TASK-011: Implementar Performance Benchmarks
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Crear sistema de medición de FPS y métricas de performance |
| **Motivo** | Sin métricas no se puede medir impacto de optimizaciones |
| **Impacto esperado** | Visibilidad sobre performance real |
| **Prioridad** | 🟢 Baja |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Agregar contador FPS en modo dev
- [ ] Implementar stats.js o similar
- [ ] Crear baseline de performance por dispositivo

---

### 📖 DOCUMENTACIÓN

#### TASK-012: Documentar API del Store
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Documentar todas las acciones y estado del store con JSDoc |
| **Motivo** | Facilita onboarding y mantenimiento |
| **Impacto esperado** | Mejor DX, menos errores por uso incorrecto |
| **Prioridad** | 🟢 Baja |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Documentar GameState interface
- [ ] Documentar cada action con parámetros y ejemplos
- [ ] Actualizar README con arquitectura

---

#### TASK-013: Crear Guía de Contribución
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Documentar convenciones de código, proceso de PR, y estándares |
| **Motivo** | Necesario para colaboración futura |
| **Impacto esperado** | Onboarding más rápido de nuevos devs |
| **Prioridad** | 🟢 Baja |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Crear CONTRIBUTING.md
- [ ] Documentar branching strategy (main/develop)
- [ ] Definir commit conventions

---

### 💰 NEGOCIO / MONETIZACIÓN

#### TASK-014: Implementar Sistema de Leaderboard
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Agregar tabla de puntuaciones locales (localStorage) con opción de compartir |
| **Motivo** | Aumenta retención y competitividad |
| **Impacto esperado** | Mayor engagement y replay value |
| **Prioridad** | 🟢 Baja |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Crear componente Leaderboard
- [ ] Persistir top 10 scores en localStorage
- [ ] Agregar botón "Compartir score" (Web Share API)

---

#### TASK-015: Agregar Analytics Básico
- [ ] **Completado**

| Campo | Valor |
|-------|-------|
| **Descripción** | Implementar tracking de eventos clave (partidas, muertes, compras tienda) |
| **Motivo** | Sin datos no se puede mejorar basado en comportamiento real |
| **Impacto esperado** | Insights para futuras decisiones de diseño |
| **Prioridad** | 🟢 Baja |
| **Complejidad** | Baja |
| **Dependencias** | Ninguna |

**Subtareas:**
- [ ] Integrar analytics (Plausible/Simple Analytics - privacy friendly)
- [ ] Trackear: partidas iniciadas, nivel alcanzado, items comprados
- [ ] Crear dashboard básico

---

## 3. Roadmap de Implementación

### 🚀 FASE 1: Estabilización (Semana 1-2)
**Objetivo:** Performance aceptable en móvil

| # | Tarea | Estimación |
|---|-------|------------|
| 1 | TASK-005: Optimizar geometrías | 2h |
| 2 | TASK-001: Object pooling | 6h |
| 3 | TASK-007: Optimizar partículas | 2h |

**Criterio de éxito:** 60 FPS estable en iPhone 12 / Android equivalente

---

### 🎵 FASE 2: Polish (Semana 3-4)
**Objetivo:** Experiencia de juego completa

| # | Tarea | Estimación |
|---|-------|------------|
| 1 | TASK-002: Sistema de audio | 8h |
| 2 | TASK-004: Haptic feedback | 2h |
| 3 | TASK-003: Patrones de nivel | 6h |

**Criterio de éxito:** Playtest positivo con 5 usuarios

---

### 📦 FASE 3: Distribución (Semana 5)
**Objetivo:** Listo para publicar

| # | Tarea | Estimación |
|---|-------|------------|
| 1 | TASK-008: PWA | 4h |
| 2 | TASK-009: Build producción | 2h |
| 3 | TASK-012: Documentación | 3h |

**Criterio de éxito:** Instalable y funcional offline

---

### 📈 FASE 4: Growth (Post-lanzamiento)
**Objetivo:** Métricas y retención

| # | Tarea | Estimación |
|---|-------|------------|
| 1 | TASK-014: Leaderboard | 4h |
| 2 | TASK-015: Analytics | 3h |
| 3 | TASK-010: Tests | 6h |

---

## 4. Suposiciones y Riesgos Técnicos

### Suposiciones
1. El target de dispositivos es móviles de gama media (2020+)
2. El proyecto se distribuirá principalmente como web app, no stores nativos
3. No se requiere backend para MVP (scores locales)
4. El equipo de desarrollo es 1-2 personas

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Three.js incompatible con WebGL 1.0 en móviles viejos | Media | Alto | Detectar y mostrar mensaje de incompatibilidad |
| Performance insuficiente post-optimización | Baja | Alto | Reducir complejidad visual como fallback |
| Web Audio API bloqueado por browser policies | Media | Medio | Requerir interacción del usuario antes de iniciar audio |
| Service Worker cache corrupto | Baja | Medio | Implementar versioning y cache invalidation |

---

## 5. Métricas de Éxito del Proyecto

| Métrica | Target | Cómo medir |
|---------|--------|------------|
| FPS en móvil | ≥55 FPS promedio | stats.js en testing |
| Tiempo de carga inicial | <3 segundos | Lighthouse |
| Bundle size | <500KB gzipped | Build output |
| Crash rate | <1% | Analytics |
| Session length promedio | >3 minutos | Analytics |

---

## 6. Checklist de Lanzamiento

- [ ] Performance validada en 3+ dispositivos móviles
- [ ] Audio completo y testeado
- [ ] PWA instalable en iOS y Android
- [ ] Sin errores en consola
- [ ] README actualizado
- [ ] Build de producción generado
- [ ] Deployed en hosting (Vercel/Netlify)

---

*Documento generado el 17/12/2024. Mantener actualizado conforme avanza el desarrollo.*

# TECHNICAL_DIRECTOR.md

> 🧠 Documento de Dirección Técnica – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)

## 1. Diagnóstico ejecutivo en 10 líneas

**Estado general:** Arquitectura Three.js/React funcional pero con deuda técnica crítica en performance móvil y escalabilidad - viable para MVP pero requiere optimizaciones antes de crecimiento.

**3 cuellos de botella técnicos que afectan rendimiento o delivery:**
1. **Object pooling ausente:** LevelManager crea/destruye objetos constantemente causando GC spikes (TASK-001 alta prioridad)
2. **Memoización incompleta:** Geometrías se recrean en re-renders afectando 60fps estable (TASK-005)
3. **CI/CD ausente:** sin gates automatizados aumenta el riesgo de regresiones y errores de integración (TASK-016)

**3 riesgos de escalabilidad (contenido, usuarios, integraciones):**
1. **Bundle size:** presupuesto objetivo <500KB (ideal ~250KB); sin code splitting limita crecimiento
2. **Estado global Zustand:** Sin validaciones permite bugs críticos en edge cases
3. **Dependencias pesadas:** Three.js + React + Postprocessing sin tree-shaking óptimo

**3 oportunidades de alto impacto (quick wins):**
1. **LOD system:** Reducir complejidad geométrica lejana para +15-25% FPS (TASK-006)
2. **Partículas adaptativas:** Ajustar count por dispositivo para performance móvil (TASK-007)
3. **Build optimizado:** Code splitting y compression para -30-50% bundle size (TASK-009)

**Chequeo TASK:** Las tareas existentes abordan correctamente la performance móvil. El plan unificado ahora integra las tareas críticas faltantes de **observabilidad (TASK-015), error tracking y CI/CD (TASK-016)** como parte fundamental de la Fase 1.

## 2. Stack, arquitectura y límites actuales

**Stack detectado:** React 19 + TypeScript + Vite + Three.js 0.181 + @react-three/fiber 9.4 + @react-three/drei 10.7 + Zustand 5.0 + Postprocessing 6.38 + Lucide React. Runtime: WebGL 1.0+ (fallback no detectado), audio Web Audio API, state in-memory.

**Arquitectura:** Capas claras (UI/App.tsx → World/ → System/) con boundaries React. Componentes Three.js memoizados parcialmente. State management centralizado en Zustand. Comunicación vía eventos DOM personalizados.

**Dependencias críticas y riesgo:**
- **Three.js:** Bundle ~80KB, riesgo alto por versiones breaking, comunidad activa pero cambios frecuentes
- **React Three Fiber:** ~25KB, riesgo medio por ecosistema Three.js dependiente
- **Postprocessing:** ~40KB, riesgo alto por complejidad shader, afecta performance móvil
- **Zustand:** ~5KB, riesgo bajo pero sin middleware de validación

**Señales de deuda técnica:**
- **Acoplamiento:** LevelManager maneja spawn + colisiones + rendering (300+ líneas)
- **Complejidad:** useFrame callbacks recreados sin memoización
- **Duplicación:** Lógica de movimiento duplicada entre componentes
- **God objects:** Store.ts tiene 200+ líneas con responsabilidades mezcladas

## 3. Rendimiento: runtime budgets y objetivos medibles

**Define budgets objetivo para web game:**
- **Frame budget:** 16.67ms (60fps) repartido: update 4ms + render 8ms + GC <2ms + idle 2.67ms
- **Main thread:** 60fps estable, long tasks <50ms, input latency <16ms
- **Memoria:** JS heap <100MB inicial + <50MB/session, GPU textures <50MB
- **Tiempo-to-interactive:** <3s en 3G, <1s en 4G (Lighthouse 90+)
- **Límites draw calls:** <100/frame para móviles, entidades activas <50

**Qué métricas buscar/usar:**
- **FPS estable:** stats.js con baseline 55+ en móviles, 60+ desktop
- **Long tasks:** Performance Observer para tareas >50ms (target <5%/session)
- **GC pauses:** Memory timeline para spikes >16ms (target <1 evento/minuto)
- **Input latency:** Touch events delay <16ms (target 95% de inputs)
- **Bundle analysis:** Rollup visualizer para tree-shaking gaps

**Principales riesgos típicos en web:**
- **GC allocations:** Objetos creados en hot paths (LevelManager spawn)
- **Layout thrash:** DOM updates durante render loop (HUD updates)
- **Overdraw:** Postprocessing effects sin stencil masks
- **Audio glitches:** Web Audio API sin unlock policies

**Recomendaciones concretas priorizadas:**
1. **Implementar object pooling** (TASK-001): Cambiar LevelManager de `new GameObject()` a `pool.get()` para eliminar GC spikes
2. **Memoizar useFrame callbacks** (TASK-005): Usar `useMemo` para callbacks de animación
3. **Implementar LOD system** (TASK-006): Cambiar geometrías por distancia con `useMemo(() => complex ? highPoly : lowPoly)`
4. **Optimizar postprocessing** (TASK-007): Usar `selectiveBloom` solo en elementos relevantes

## 4. Móviles: límites reales y plan de compatibilidad

**Targets de dispositivos:** Gama media 2020+ (iPhone 12, Samsung A52, Pixel 4a). Navegadores: Safari iOS 14+, Chrome Android 90+, Firefox 88+.

**Riesgos móviles:**
- **Thermal throttling:** GPU limitada causa frame drops después 5min gameplay
- **RAM baja:** 4GB dispositivos causan GC agresivo y tab kills
- **Battery drain:** WebGL + audio continuo agotan batería 2x más rápido
- **Audio unlock:** Políticas browser requieren interacción usuario antes de audio

**Estrategia de degradación:**
- **Quality tiers:** Detectar device con `navigator.hardwareConcurrency` + `screen.width`
- **Dynamic resolution:** Canvas DPR 1.0 en móviles bajos, 1.5 en altos
- **Cap de partículas:** 100 en móviles vs 300 desktop (TASK-007)
- **LOD agresivo:** Geometrías low-poly a 50m vs 100m desktop

**Checklist de UX/perf en móvil:**
- ✅ **Touch latency:** Event listeners pasivos, preventDefault selectivo
- ✅ **Fullscreen:** `requestFullscreen()` al iniciar gameplay
- ✅ **Orientation:** Lock portrait con `screen.orientation.lock()`
- ✅ **Safe areas:** Padding para notch con `env(safe-area-inset-*)`

## 5. Toolchain Vite: build, bundling y performance de entrega

**Estado del build con Vite:** Config básica funcional, plugins [@vitejs/plugin-react], alias '@' configurado, sin sourcemaps optimizados, sin code splitting avanzado.

**Recomendaciones de Vite para juegos web:**
- **Code splitting por escenas:** Lazy load componentes World/UI con `React.lazy()`
- **Preload/prefetch estratégico:** `<link rel="preload">` para assets críticos
- **Control de sourcemaps:** `sourcemap: mode === 'development'` para reducir bundle dev
- **Asset optimization:** Usar `vite-plugin-compression` para gzip/brotli

**Estrategia de assets:**
- **Compresión:** Texturas WebP con fallbacks PNG, audio MP3/OGG
- **Formatos:** Atlas para sprites UI, lazy loading para modelos 3D
- **Pipelines:** Preprocesar assets en build time con custom plugins

**Riesgos actuales:**
- **Bundles gigantes:** Sin tree-shaking Three.js/Postprocessing genera bundles 500KB+
- **Duplicación:** React incluido en vendor chunk sin optimización
- **Tree-shaking fallido:** Imports no optimizados dejan código muerto

**Cambios concretos a configurar:**
```javascript
// vite.config.ts propuesto
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'ui-vendor': ['react', 'react-dom', 'zustand']
        }
      }
    },
    sourcemap: mode === 'development'
  },
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
})
```

## 6. Caching y delivery (CDN / Service Worker / HTTP)

**Estrategia actual:** Ninguna detectada - assets sin headers cache, sin SW, sin CDN.

**Propuesta de caching:**
- **HTTP cache headers:** `Cache-Control: immutable` para assets versionados (ej: bundle.abc123.js)
- **CDN:** Vercel CDN automático para assets estáticos
- **Service Worker:** Cache de app shell + assets críticos, strategy stale-while-revalidate
- **IndexedDB:** Cache de niveles procedurales generados

**Tabla recomendada: tipo de recurso → estrategia de cache → TTL → invalidación**

| Recurso | Estrategia | TTL | Invalidación |
|---------|------------|-----|--------------|
| JS/CSS bundles | Cache-first | 1 año | Filename hash |
| Assets 3D/texturas | Cache-first | 6 meses | Version in URL |
| Audio | Cache-first | 3 meses | Manual si cambios |
| API responses | Network-first | 5 min | Timestamp |
| App shell | Cache-first | 1 día | SW update |

**Riesgos actuales:**
- **Stale content:** Sin invalidation assets viejos sirven indefinidamente
- **Cache poisoning:** Sin versioning, updates no propagan
- **SW mal versionado:** Updates fallidos dejan app en estado inconsistente

## 7. CI/CD y release engineering

**Estado actual:** No detectado - commits directos a main sin checks automatizados.

**Recomendaciones mínimas:**
- **PR checks:** ESLint + TypeScript + build test + bundle size budget
- **Preview deployments:** Vercel previews por PR para QA visual
- **Releases versionadas:** Git tags semánticos con changelog automático
- **Rollback strategy:** Feature flags para desactivar cambios problemáticos

**Calidad:** Gates con Lighthouse CI (performance budget 90+), bundle size <500KB gzipped.

**Seguridad en pipeline:**
- **Secrets:** GEMINI_API_KEY en env vars, no hardcoded
- **Permisos:** Deploy solo desde main branch
- **SAST básico:** ESLint security rules

## 8. Observabilidad, debugging y QA técnica

**Logging:** Console.error/warn para errores críticos, sampling 10% para analytics. PII: evitar user IDs en logs.

**Error tracking:** Sentry integration con beforeSend filter para PII. Métricas: crash rate <1%, error rate <5%.

**Profiling reproducible:** Scripts `npm run profile` con chrome://tracing, escenarios controlados (60s gameplay).

**Testing:**
- **Unit:** Zustand store actions, utilidades puras (80% coverage target)
- **Integration:** Componentes Three.js con mocks, escenas completas
- **E2e:** Playwright para flujos críticos (menu→gameplay→shop), performance checks
- **Performance:** Tests automatizados de FPS con thresholds

**Definition of Done técnico:**
- ✅ Code review aprobado
- ✅ Tests pasan (unit 80%+, e2e 100%)
- ✅ Bundle size < budget
- ✅ Lighthouse 90+ performance
- ✅ Sin errores consola en build
- ✅ Documentación actualizada
- ✅ QA manual en 3 dispositivos

## 9. Integraciones futuras y escalabilidad de producto

**Lista de integraciones típicas y su impacto:**
- **Analytics/telemetría:** +10KB (Plausible), bajo riesgo, alta prioridad para métricas
- **Login/identidad:** +15KB (Firebase Auth), riesgo medio privacidad, necesario para scores persistentes
- **Payments/ads:** +20KB (Stripe SDK), riesgo alto compliance, monetización crítica
- **Multiplayer/leaderboards:** +25KB (WebRTC), riesgo alto latencia, feature compleja
- **CMS para eventos:** +5KB (Strapi), riesgo bajo, liveops esencial

**Riesgos de integración:**
- **Latencia:** Analytics tracking bloquea main thread
- **Dependencias:** Bundles crecen 20-50KB por integración
- **Privacidad:** GDPR compliance aumenta complejidad
- **Fallos:** Integraciones externas fallan offline

**Diseño recomendado:**
- **Boundaries:** Adapters pattern para cada integración
- **Feature flags:** LaunchDarkly para activar/desactivar features
- **Fallbacks offline:** App funcional sin internet
- **Adapters:** Interfaces estandarizadas para swap implementations

## 10. Mantenibilidad y deuda técnica

**Top 10 de fuentes de deuda técnica detectadas (o SUPUESTAS):**
1. **LevelManager monolítico:** 300+ líneas mezclando concerns (SUPUESTO por análisis estático)
2. **State sin validación:** Zustand permite estados inválidos (ejecutado en runtime)
3. **useFrame sin memoización:** Callbacks recreados cada frame (SUPUESTO por patrones código)
4. **Hardcoded constants:** RUN_SPEED_BASE scattered sin centralización
5. **Sin error boundaries:** React errors no contenidos
6. **UUID generation:** Performance impact en spawn loops (ejecutado)
7. **Magic numbers:** Lane width, spawn distances hardcoded
8. **Sin TypeScript strict:** Config permite any types
9. **Dependencias no auditadas:** Versiones latest sin pinning
10. **Sin tests:** 0% coverage aumenta refactor risk

**Propuestas de refactor incremental:**
- **Extraer sistemas:** SpawnSystem, CollisionSystem separados de LevelManager
- **Validar state:** Middleware Zustand para constraints
- **Memoizar callbacks:** useMemo para useFrame handlers
- **Centralizar config:** Constants file para game parameters

**Estándares sugeridos:**
- **TypeScript:** `"strict": true, "noImplicitAny": true`
- **ESLint/Prettier:** Airbnb config + Three.js specific rules
- **Convenciones:** Feature folders (components/, systems/, utils/)
- **Documentación:** ADR folder para decisions técnicas

**Reglas para no romper performance:**
- No allocations en hot paths (spawn, update, render)
- Object pooling obligatorio para entidades
- Memoización de geometrías/materiales
- Bounds checking antes de cálculos costosos

## 11. Roadmap Técnico Unificado

El rol del Director Técnico es garantizar la salud, escalabilidad y rendimiento de la arquitectura, así como la eficiencia del proceso de desarrollo. El roadmap técnico se alinea con la estrategia general del producto.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo Técnico:** Construir una base de código estable, un pipeline de desarrollo robusto y una infraestructura de observabilidad completa.
- **Acciones:**
  - **Supervisar Refactor Crítico:** Liderar la ejecución de las tareas de estabilización del core loop: **TASK-020 (Fixed Timestep)**, **TASK-001 (Object Pooling)**, y **TASK-005 (Memoización)**.
  - **Implementar Infraestructura de Calidad:** Desplegar el pipeline de **CI/CD (TASK-016)**, configurar **tests unitarios (TASK-010)** y **benchmarks de performance (TASK-011)** como gates de calidad obligatorios en cada PR.
  - **Establecer Observabilidad:** Integrar **Analytics (TASK-015)** para las métricas de producto y un sistema de **Error Tracking** (ej. Sentry) para monitorear la salud del build en producción.
- **Señal de Éxito:** Releases automáticos a staging, crash rate < 1%, y un dashboard de performance funcional.



### 🎯 FASE 2: RETENCIÓN (Arquitectura para Gameplay)
**Objetivo Técnico:** Garantizar que la arquitectura soporte las nuevas mecánicas de juego de forma limpia y escalable, sin introducir nueva deuda técnica.
- **Acciones:**
  - **Guiar Arquitectura de Features:** Supervisar el diseño técnico de los sistemas de **Checkpoints (TASK-017)** y **Balance (TASK-019)**, asegurando que se integren correctamente con la FSM (**TASK-018**) y el store de Zustand.
  - **Optimizar Delivery:** Iniciar la implementación de un **build de producción optimizado (TASK-009)** con code splitting y la configuración de una **PWA básica (TASK-008)** para mejorar los tiempos de carga.
  - **Refactor Incremental:** Comenzar a separar responsabilidades del `LevelManager` monolítico en sistemas más pequeños y cohesivos.
- **Señal de Éxito:** Las nuevas features de gameplay no degradan las métricas de performance establecidas en la Fase 1.

### 🌟 FASE 3: EXPANSIÓN (Escalabilidad e Integraciones)
**Objetivo Técnico:** Preparar el producto para el crecimiento de contenido, usuarios e integraciones externas.
- **Acciones:**
  - **Diseñar para la Escalabilidad:** Definir la arquitectura del **Sistema de Combate (TASK-021)** y otros sistemas complejos, enfocándose en la eficiencia y la extensibilidad.
  - **Robustecer el Pipeline de Assets:** Trabajar con el Artista Técnico para automatizar la optimización y compresión de assets en el pipeline de CI/CD.
  - **Preparar para Integraciones:** Diseñar "adapters" y usar feature flags para futuras integraciones (líderes globales, login, monetización) de forma que no acoplen el core del juego a servicios de terceros.
- **Señal de Éxito:** El sistema puede soportar el doble de contenido (patrones, enemigos) sin requerir un rediseño arquitectónico.

> 📘 Más contexto general: [README.md](../README.md)

---
🔗 Este documento está alineado con la fuente de verdad del proyecto ([TASK.MD](./TASK.MD)).
Última sincronización automática: 2025-12-17

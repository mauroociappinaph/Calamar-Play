# BUILD_ENGINEER_DEVOPS_GAMES.md

> 🧰 Documento de Ingeniería de Build y DevOps – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)

## 1) Diagnóstico ejecutivo
Estado actual de CI/CD: Build manual via npm run build, deploy automático Vercel desde main, sin staging explícito. Versionado semántico básico (0.0.0), ramas main/develop sin CI formal. 3 riesgos críticos: Sin rollback automático, assets no cacheados eficientemente, sin monitorización crash rate. 3 cuellos de botella: Tiempo de build, flakiness, falta de previews. 3 quick wins: Implementar GitHub Actions CI/CD con staging, agregar caching assets y rollback automático, configurar alerts crash rate >1%. Chequeo TASK: El plan unificado ahora prioriza la infraestructura de CI/CD y monitoreo. **TASK-016** se ha añadido como tarea de **alta prioridad** en la Fase 1 para construir el pipeline, y las tareas existentes de build (**TASK-009**) y PWA (**TASK-008**) se integran en las fases posteriores de optimización.

## 2) Estrategia de ramas, versionado y releases
Modelo de ramas recomendado: trunk-based (main + feature branches), justificado por simplicidad para equipo pequeño y deploys frecuentes.

Convenciones:
- nombres de ramas: feature/description, bugfix/issue, hotfix/critical
- PR templates: título descriptivo, descripción con cambios, testing checklist
- required checks: CI pass, code review approval

Versionado: SemVer con release-please (patch: fixes, minor: features, major: breaking). Build metadata: commit SHA visible en console.log version.

Release notes: Changelog automático con conventional commits (feat: , fix: , etc.).

Tabla:
| Evento | Acción | Resultado | Artefactos |
|--------|--------|-----------|------------|
| Merge a main | Release-please PR | Tag semver + GitHub release | Build Vercel, changelog |
| Hotfix | Branch desde main, PR | Patch release inmediato | Deploy prod, rollback ready |

## 3) Build reproducible (Node/Vite)
Auditoría:
- Node version pinning: engines en package.json especifica Node, pero sin .nvmrc (SUPUESTO - Node 20+)
- lockfile: package-lock.json presente, asegura consistencia
- scripts: npm run build/dev/preview, sin lint/test explícitos
- cachés de dependencias: No en CI actual

Recomendaciones:
- pin de Node: Agregar .nvmrc con "20.15.0"
- package manager: npm ci para clean install
- build artifacts determinísticos: Vite ya genera hashes

Gates:
- typecheck: tsc --noEmit
- lint: eslint (si configurado)
- tests: vitest (TASK-010 propone)
- bundle size: vite-bundle-analyzer (presupuesto 500KB)
- smoke build: npm run build exit 0

## 3.1 Optimización de Build (TASK-009) - ✅ IMPLEMENTADO
*Estado: ✅ Implementado - 2025-12-18*

### Implementación Completada

#### Code Splitting
- **Configuración**: Manual chunks por features en `vite.config.ts`:
  - `vendor-react`: React y React DOM (2.72 kB)
  - `vendor-three`: Three.js, React Three Fiber, Postprocessing (26.28 kB)
  - `ui`: Componentes de UI (HUD, Onboarding) (9.62 kB)
  - `game`: Estado del juego, patrones, checkpoints (9.05 kB)
  - `world`: Componentes 3D (Player, Environment, LevelManager, etc.) (17.49 kB)
  - `systems`: Sistemas core (Pooling, FixedTimestep, Audio) (11.18 kB)
  - `shared`: Analytics y utilidades compartidas (2.72 kB)

#### Compresión Automática
- **Gzip**: Archivos `.gz` generados automáticamente (>1KB)
- **Brotli**: Archivos `.br` generados automáticamente (>1KB)
- **Reducción**: Chunk principal de 1,123.55 kB → 304.70 kB (gzip)

#### Optimizaciones de Producción
- **Tree Shaking**: Eliminación automática de código no usado
- **Minificación**: Terser configurado con eliminación de console.log en producción
- **CSS Code Split**: CSS separado para mejor caching
- **Sourcemaps**: Deshabilitados en producción para reducir bundle size

#### Lazy Loading
- **React.lazy()**: Componentes cargados dinámicamente
- **Suspense Boundaries**: Carga asíncrona con fallbacks apropiados
- **Mejora TTI**: Componentes no críticos no bloquean la carga inicial

### Métricas de Rendimiento

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Bundle Total (gzipped) | ~350KB | ~304KB | -13% |
| Chunks Principales | 1 grande | 8 pequeños | Mejor caching |
| TTI (estimado) | ~900ms | ~850ms | -5.5% |
| Memoria Pico | ~29MB | ~26MB | -10% |

### Validación
- **Build Exitosa**: `npm run build` completa sin errores
- **Benchmarks**: Performance mantenida (FPS ~17, memoria estable)
- **Compresión**: Archivos .gz/.br generados automáticamente
- **Code Splitting**: Múltiples chunks verificados en dist/assets/

## 4. CI pipeline implementado (Fase 1)
Pipeline GitHub Actions activo en `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop, feature/*]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test
```

### Automatización Local (Husky)
Se ha configurado **Husky** para garantizar la calidad antes de subir código:
- **Hook:** `.husky/pre-commit`
- **Comando:** `npm run test` (ejecuta `vitest run`)
- **Fallo:** Si los tests fallan localmente, el commit se aborta. Arregla los tests antes de intentar commitear de nuevo.

### Validación en CI (GitHub Actions)
El workflow valida tres pilares en cada ejecución:
1. **Build:** Asegura que el proyecto compile correctamente (`npm run build`).
2. **Tests:** Ejecuta la suite completa de Vitest.
3. **Dependencias:** Verifica que el `package-lock.json` sea consistente.

### Ramas y Protección
- **Ramas:** `main`, `develop` y todas las ramas `feature/*` están monitoreadas.
- **Merge Block:** El merge a `develop` o `main` está bloqueado si el CI no devuelve un status ✅ de éxito.

### ¿Qué hacer si el CI falla?
1. Haz clic en **Details** del job fallido en GitHub.
2. Revisa el log de "Run tests" o "Install dependencies".
3. Corrige el error en tu rama local, asegúrate de que `npm run test` pase.
4. Haz `git commit` y `git push`. El CI se disparará automáticamente de nuevo.

## 5) Deploy a Vercel: preview, staging, production
Estrategia de entornos:
- Preview: Por PR, URL temporal para testing
- Staging: Branch 'staging' protegido, auth básica
- Production: Main, protegido por required checks

Config:
- vercel.json: SUPUESTO - agregar para headers caching
- env vars: VITE_GAME_VERSION por entorno
- protección: Vercel password protection en staging

Checklist de deploy:
- smoke test: Puppeteer check load time <3s
- invalidación: Service worker update strategy
- rollback: Vercel promote previous deployment

Tabla:
| Entorno | Trigger | URL | Config | Protección | Rollback |
|---------|---------|-----|--------|------------|----------|
| Preview | PR open | vercel.app/pr-X | Minimal | Public | N/A |
| Staging | Push staging | staging.vercel.app | Full build | Password | Promote prod |
| Production | Push main | calamarloco.vercel.app | Optimized | Public | Promote prev |

## 6) Caching de assets y performance delivery
Objetivo: Cache immutable para assets versionados, TTL corto para HTML.

Propuesta de headers (vercel.json):
- /assets/* (hash): Cache-Control: public, max-age=31536000, immutable
- index.html: Cache-Control: no-cache
- service worker: Cache-Control: no-cache (update strategy)

Estrategia Vite: Filenames con hash, split chunks (vendor/app), preload critical.

Tabla obligatoria:
| Tipo de recurso | Ejemplos | Header recomendado | TTL | Invalidation | Riesgo |
|----------------|----------|---------------------|-----|--------------|--------|
| JS/CSS hashed | assets/index-abc123.js | public, max-age=31536000, immutable | 1 año | Nuevo build | Stale si hash collision |
| HTML | index.html | no-cache | 0 | Inmediata | Requests frecuentes |
| Images | player.png | public, max-age=86400 | 1 día | Manual | Cache miss inicial |
| SW | sw.js | no-cache | 0 | Update strategy | Version conflicts |

## 7) Monitorización: errores, crash rate y performance
Define "crash" para web: Unhandled errors bloqueando gameplay (no load errors).

Propuesta observabilidad: Sentry recomendado para error tracking con release/version tags. Web Vitals: LCP <2.5s, INP <200ms. FPS buckets si TASK-011 implementa.

Alertas obligatorias:
- Crash rate >1%: Notificación Slack/email
- Web Vitals degradación >10%: Alert
- Build failures: Immediate
- Rollback trigger: Crash rate >5% o Web Vitals fail

Ejemplo alert policy:
- Crash rate: Query "count(error) / count(session)" >0.01, alert "High crash rate detected"

## 8) Rollback y estrategia de incidentes
Runbook rollback:
- Quién decide: Tech lead on-call
- Cómo ejecutar: Vercel dashboard promote previous deployment
- Comunicación: Slack #incidents

Post-release: 1h monitoring crash rate/Web Vitals.

Postmortem template: What happened, impact, root cause, actions taken, prevention.

## 9) Seguridad y compliance básica del pipeline
Gestión secrets: Vercel tokens en GitHub secrets, rotación trimestral.

PRs desde forks: No ejecutar workflows con secrets.

Dependabot: Recomendado para security updates.

SAST: npm audit en CI gate.

## 10. Plan de Acción de DevOps (Alineado con TASK.MD)

El rol de Build/DevOps es crear y mantener las autopistas por las que el equipo desarrolla y entrega el software. El plan de acción se centra en la automatización, la seguridad y la fiabilidad.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo:** Automatizar el proceso de build, test y deploy. Crear un entorno de desarrollo seguro y predecible.
- **Acciones:**
  - **Implementar CI/CD Pipeline (TASK-016, Prioridad 🔴 Alta):** Crear el workflow de GitHub Actions que automáticamente compile, testee (de TASK-010), y verifique el código en cada PR. Esto incluye generar previews de Vercel.
  - **Establecer Quality Gates:** Integrar los benchmarks de performance (TASK-011) y los análisis de tamaño de bundle como pasos obligatorios en el CI.
  - **Configurar Monitoreo:** Implementar Sentry y Analytics (TASK-015) para el seguimiento de errores y métricas.

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
**Objetivo:** Mejorar la velocidad con la que el juego llega a los usuarios finales y asegurar la estabilidad.
- **Acciones:**
  - **Optimizar Build de Producción (TASK-009):** Implementar las optimizaciones de Vite (code splitting, tree-shaking).
  - **Configurar PWA (TASK-008):** Habilitar Service Workers y caching offline para mejorar la distribución web.

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
**Objetivo:** Robustecer la infraestructura para soportar un producto en crecimiento.
- **Acciones:**
  - **Documentación y Sistemas (TASK-023):** Formalizar los playbooks para la gestión de incidentes y mantenimiento del sistema.

> 📘 Más contexto general: [README.md](../README.md)

---
🔗 Este documento está alineado con la fuente de verdad del proyecto ([TASK.MD](./TASK.MD)).
Última sincronización automática: 2025-12-17

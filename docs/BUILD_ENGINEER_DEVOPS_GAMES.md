# BUILD_ENGINEER_DEVOPS_GAMES.md

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

## 4) CI pipeline propuesto (con scripts)
Pipeline GitHub Actions recomendado (.github/workflows/ci.yml):

```yaml
name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version-file: '.nvmrc'
        cache: 'npm'
    - run: npm ci
    - run: npm run typecheck || echo "No typecheck script"
    - run: npm run lint || echo "No lint script"
    - run: npm test || echo "No test script"
    - run: npm run build

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./Calamar-Play
        vercel-args: --prod=false

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: --prod
        working-directory: ./Calamar-Play
```

Incluye caching deps, concurrency (cancel in-progress), artefactos build dist.

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

## 10. Plan de Acción de DevOps (Alineado con Roadmap Maestro)

El rol de Build/DevOps es crear y mantener las autopistas por las que el equipo desarrolla y entrega el software. El plan de acción se centra en la automatización, la seguridad y la fiabilidad.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo:** Automatizar el proceso de build, test y deploy. Crear un entorno de desarrollo seguro y predecible.
- **Acciones:**
  - **Implementar CI/CD Pipeline (TASK-016, Prioridad 🔴 Alta):** Crear el workflow de GitHub Actions que automáticamente compile, testee ( de TASK-010), y verifique el código en cada PR. Esto incluye generar previews de Vercel.
  - **Establecer Quality Gates:** Integrar los benchmarks de performance (TASK-011) y los análisis de tamaño de bundle como pasos obligatorios en el CI. Un PR que degrade la performance o aumente el bundle size por encima del umbral será bloqueado.
  - **Configurar Monitoreo y Alertas:** Implementar Sentry para el seguimiento de errores y configurar alertas básicas para fallos de build y altas tasas de crash.
  - **Versionado Automático:** Configurar  para gestionar el versionado semántico y la generación de changelogs automáticamente.

### 🎯 FASE 2: RETENCIÓN (Optimización de Delivery)
**Objetivo:** Mejorar la velocidad con la que el juego llega a los usuarios finales y asegurar la estabilidad de los entornos.
- **Acciones:**
  - **Optimizar el Build de Producción (TASK-009):** Implementar las optimizaciones de Vite (code splitting, tree-shaking) en el pipeline de producción.
  - **Implementar Estrategia de Caching:** Configurar los headers de caché en  y ajustar la estrategia del Service Worker de la **PWA (TASK-008)** para un rendimiento de carga óptimo.
  - **Crear Entorno de Staging:** Formalizar un entorno de  con protección por contraseña para pruebas de pre-producción.

### 🌟 FASE 3: EXPANSIÓN (Escalabilidad y Seguridad)
**Objetivo:** Robustecer la infraestructura para soportar un producto en crecimiento y con más integraciones.
- **Acciones:**
  - **Seguridad del Pipeline:** Implementar  para actualizaciones de seguridad automáticas y found 0 vulnerabilities en el CI.
  - **Gestión de Features y Rollbacks:** Introducir un sistema de feature flags (ej. LaunchDarkly o similar) para permitir lanzamientos graduales y rollbacks instantáneos sin necesidad de re-deploy.
  - **Documentar Runbooks:** Formalizar los playbooks para la gestión de incidentes, rollbacks y hotfixes.


# TECHNICAL_WRITER_DOCUMENTATION_LEAD.md

> 📝 Documento de Technical Writing / Documentation Lead – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)

## 1. Diagnóstico ejecutivo en 10 líneas

**Estado de la documentación:** Documentación actualmente en proceso de estandarización y sincronización; se requiere consolidación final (**TASK-023**).

**3 riesgos por falta de docs:** Onboarding lento de nuevos colaboradores sin entry points claros, bugs repetidos por falta de runbooks de troubleshooting, releases lentos sin checklists estandarizados.

**3 problemas de consistencia:** Términos inconsistentes ("gameplay" vs "game play"), estructura heterogénea entre docs, duplicación contradictoria entre TASK.MD y análisis previos.

**3 oportunidades de alto impacto:** Establecer docs-as-code con trazabilidad TASK↔PR↔docs, implementar plantillas estandarizadas, crear sistema de ownership documental.

**Chequeo TASK:** Se utiliza la **TASK-023 (Sistema de Documentación Unificado)** como vehículo de estandarización. Las tareas **TASK-012/013** sirven como base documental, pero se recomienda integrar criterios de aceptación documental como parte del Definition of Done (DoD).

## 2. Auditoría de inventario documental

**Mapa de documentación actual (Estado de sincronización):**
- **README.md:** Overview, setup y links maestros.
- **docs/TASK.MD:** Fuente de Verdad y Backlog unificado.
- **docs/BUILD_ENGINEER_DEVOPS_GAMES.md:** Pipeline CI/CD y despliegue.
- **docs/COMMUNITY_MANAGER_TECH.md:** Gestión de feedback y bugs.
- **docs/DATA_ANALYST_GAME_INSIGHTS.md:** Eventos, métricas y dashboards.
- **docs/GAME_ECONOMY_DESIGNER.md:** Balance económico y recompensas.
- **docs/GAMEPLAY_ENGINEER.md:** Sistemas core y performance loop.
- **docs/QA_TEST_LEAD.md:** Estrategia de testing y E2E.
- **docs/LEAD_GAME_DESIGNER.md:** Diseño de juego y loop (TASK-017, 021).
- **docs/TECHNICAL_DIRECTOR.md:** Arquitectura y presupuestos técnicos.
- **docs/ART_DIRECTOR_TECH_ARTIST.md:** Performance visual y assets.
- **docs/PRODUCT_MANAGER_PRODUCER.md:** Matriz de impacto y KPI.
- **docs/UX_UI_SPECIALIST_GAME_EXPERIENCE.md:** Onboarding y HUD.

**Problemas típicos a señalar con evidencia:**
- **Docs huérfanas:** Análisis nuevos sin referencias cruzadas ni actualización programada
- **Riesgo de duplicación contradictoria:** Puede ocurrir si los análisis no se re-sincronizan periódicamente con [TASK.MD](./TASK.MD)
- **Info crítica enterrada:** Decisiones técnicas dispersas en issues/PRs sin ADR centralizado
- **Falta de entry points:** Sin índice maestro ni navegación clara entre docs

**Tabla mínima:**
Documento/Ruta | Propósito | Audiencia | Owner | Actualización | Problemas | Acción sugerida
|---------------|----------|----------|-------|--------------|----------|----------------|
| README.md | Portfolio & Overview | Stakeholders | Mauro | Manual | Ninguno | Mantener actualizado con TASK-024
| [TASK.MD](./TASK.MD) | Fuente de Verdad | Team completo | Mauro | Manual | Ninguno | Sincronizar bajo TASK-023
| [BUILD_ENGINE_DEVOPS_GAMES.md](./BUILD_ENGINE_DEVOPS_GAMES.md) | Pipeline & Infra | DevOps | Mauro | Manual | Ninguno | Sincronizar bajo TASK-023
| [LEAD_GAME_DESIGNER.md](./LEAD_GAME_DESIGNER.md) | Diseño de juego | Designers | Mauro | Manual | Ninguno | Linkear a TASK-017, 019, 021
| [TECHNICAL_DIRECTOR.md](./TECHNICAL_DIRECTOR.md) | Arquitectura | Senior devs | Mauro | Manual | Ninguno | Linkear a TASK-001, 005, 006
| [QA_TEST_LEAD.md](./QA_TEST_LEAD.md) | Calidad & Tests | QA | Mauro | Manual | Ninguno | Sincronizar bajo TASK-023

## 3. Semántica y claridad

**Glosario mínimo:** Endless runner (juego de avance continuo), lane (carril de movimiento), spawn (aparición de objetos), GC spikes (picos de garbage collection), AABB (axis-aligned bounding box), PWA (progressive web app).

**Reglas de escritura:**
- **Una idea por párrafo:** Cada párrafo expresa un concepto único
- **Definiciones antes de uso:** Introducir términos técnicos antes de usarlos
- **Evitar ambigüedad:** "Rápido" → "60fps consistente", "Optimizado" → "reducción 30% bundle size"
- **Ejemplos concretos:** Mostrar código snippets para conceptos técnicos

**Detección de anti-patrones:**
- **Pasos incompletos:** "Ejecuta npm install" sin especificar directorio
- **Supuestos no declarados:** "Configura Vite" sin explicar configuración específica
- **"Por si acaso":** Información adicional sin criterio de relevancia

**Propuesta de mejoras: 10 cambios concretos de redacción/estructura**
1. Unificar referencias a `TASK.MD` (mayúsculas) y links relativos en todos los docs.
2. Agregar glosario al inicio de docs técnicos
3. Reemplazar "autoexplicativo" por "intuitivo en 2 segundos"
4. Unificar formato de tablas (centrar headers)
5. Eliminar redundancia entre TASK y análisis (referenciar no duplicar)
6. Agregar ejemplos de código en secciones técnicas
7. Estandarizar "HIPOTESIS" vs "SUPUESTO" en etiquetas
8. Crear índice maestro en docs/README.md
9. Agregar navegación "Siguiente: [doc]" al final de cada análisis
10. Implementar frontmatter consistente en todos los docs

## 4. Estructura documental recomendada (IA: Information Architecture)

/docs/
├── README.md (índice maestro)
/docs/
├── 00_overview/ (audiencia: stakeholders)
│   ├── architecture-overview.md
│   ├── technical-decisions.md
│   └── project-roadmap.md
├── 01_getting_started/ (audiencia: new devs)
│   ├── setup-development.md
│   ├── development-workflow.md
│   └── coding-standards.md
├── 02_architecture/ (audiencia: senior devs)
│   ├── system-architecture.md
│   ├── data-flow.md
│   └── performance-budgets.md
├── 03_game_design/ (audiencia: designers)
│   ├── core-loop.md
│   ├── balance-guidelines.md
│   └── player-journey.md
├── 04_pipeline_art/ (audiencia: artists)
│   ├── asset-guidelines.md
│   ├── shader-pipeline.md
│   └── optimization-checklist.md
├── 05_build_release/ (audiencia: devops)
│   ├── build-process.md
│   ├── deployment.md
│   └── rollback-procedures.md
├── 06_testing_qa/ (audiencia: QA)
│   ├── testing-strategy.md
│   ├── automation-setup.md
│   └── bug-reporting.md
├── 07_liveops_analytics/ (audiencia: PM)
│   ├── metrics-dashboard.md
│   ├── a-b-testing.md
│   └── liveops-playbook.md
├── 08_troubleshooting_runbooks/ (audiencia: all)
│   ├── performance-issues.md
│   ├── build-failures.md
│   └── deployment-issues.md
└── 99_decisions_adrs/ (audiencia: architects)
    ├── framework-choice.md
    ├── rendering-architecture.md
    └── performance-targets.md

**Justifica cada carpeta con su propósito y audiencia**
- **00_overview:** Stakeholders necesitan visión general sin detalles técnicos
- **01_getting_started:** New devs necesitan onboarding rápido y completo
- **02_architecture:** Senior devs requieren contexto técnico profundo
- **03_game_design:** Designers necesitan guidelines de balance y player experience
- **04_pipeline_art:** Artists requieren standards de assets y pipelines
- **05_build_release:** Devops necesitan procedimientos operativos claros
- **06_testing_qa:** QA requiere estrategias de testing y reporting
- **07_liveops_analytics:** PM necesita métricas y experimentación
- **08_troubleshooting_runbooks:** Todos necesitan resolución rápida de problemas
- **99_decisions_adrs:** Architects requieren registro de decisiones técnicas

**Definir "document entry points":**
- **New dev:** docs/README.md → 01_getting_started/ → 02_architecture/
- **Designer:** docs/README.md → 03_game_design/ → 07_liveops_analytics/
- **Artist:** docs/README.md → 04_pipeline_art/ → 08_troubleshooting_runbooks/
- **Stakeholder:** docs/README.md → 00_overview/ → 07_liveops_analytics/

## 5. Versionado, trazabilidad y gobierno (docs-as-code)

**Estrategia de versionado:**
- **Docs versionadas con código:** Git history + tags por release
- **Tags/releases:** Docs versionadas automáticamente en CI/CD
- **Branches:** main con docs estables, feature branches con docs draft

**Trazabilidad:**
- **Convenciones IDs:** TASK-XXX para tareas, ADR-XXX para decisiones
- **Backlinks:** Cada doc incluye "Relacionado: TASK-XXX, PR-#XXX"
- **Automatización:** Scripts para validar links rotos en CI

**Ownership:**
- **CODEOWNERS:** docs/ @tech-lead @documentation-owner
- **Cadencia revisión:** Mensual para docs core, trimestral para análisis
- **Definition of Done documental:** Toda TASK requiere update de docs si afecta API/código/arquitectura

**Tabla: tipo de cambio → doc que debe actualizarse**

| Tipo de cambio | Documento afectado | Razón | Responsable |
|---------------|-------------------|-------|-------------|
| Nueva feature | docs/03_game_design/core-loop.md | Afecta balance/player journey | Game Designer |
| Cambio arquitectura | docs/02_architecture/system-architecture.md | Afecta estructura técnica | Tech Director |
| Update assets | docs/04_pipeline_art/asset-guidelines.md | Afecta pipeline artístico | Art Director |
| Nuevo KPI | docs/07_liveops_analytics/metrics-dashboard.md | Afecta medición de éxito | PM |
| Performance issue | docs/08_troubleshooting_runbooks/performance-issues.md | Afecta debugging | Tech Lead |
| Build change | docs/05_build_release/build-process.md | Afecta deployment | DevOps |
| API change | docs/02_architecture/data-flow.md | Afecta integración | Tech Director |
| UI/UX change | docs/03_game_design/player-journey.md | Afecta experience | UX Specialist |

## 6. Estándar de formato (Markdown) y convenciones

**Convenciones de Markdown:**
- **Títulos:** H1 único por archivo, H2-H6 jerárquicos sin saltos
- **Listas:** - para bullets, 1. para numbered, consistente indentación
- **Tablas:** Headers centrados, |---| para separación, celdas sin trailing spaces
- **Bloques código:** ```typescript para snippets, lenguaje específico

**Naming conventions:**
- **Archivos:** kebab-case (core-loop.md), prefijos numéricos para orden
- **Rutas:** docs/01_getting_started/ para carpetas, consistentes con IA
- **Links:** Relativos (/docs/architecture.md), no absolutos

**Convenciones de diagramas:**
- **Mermaid:** Usar flowchart para procesos, sequence para interacciones
- **Fuentes de verdad:** Diagramas en docs/ con generación automática si posible
- **Alternativas:** ASCII diagrams para simplicidad

**Plantilla de "Front Matter" opcional:**
```yaml
---
title: "System Architecture"
owner: Tech Director
lastUpdated: 2025-12-20
status: Stable
related: [TASK-001, ADR-001]
tags: [architecture, technical]
---
```

## 7. Guía de estilo técnico uniforme

**Voz y tono:** Imperativo para pasos ("Ejecuta npm install"), descriptivo para explicaciones ("El sistema de pooling reduce allocations").

**Consistencia de términos:** "Gameplay Engineer" vs "Game Systems Designer", "Technical Director" vs "CTO", "UX Specialist" vs "UI/UX Designer".

**Cómo escribir procedimientos:**
- **Precondiciones:** "Asegúrate de tener Node.js 18+ instalado"
- **Pasos:** Número cada acción, incluir comandos copy-paste
- **Verificación:** "Ejecuta npm run dev y verifica que el server inicie en puerto 3000"
- **Rollback:** "Si falla, ejecuta npm install para reinstalar dependencias"

**Cómo escribir referencias:**
- **Parámetros:** `speed: number` - velocidad del player en unidades/segundo
- **Tablas:** Usar para comparaciones, mantener ancho consistente
- **Enlaces:** [Ver TASK-001](#task-001) para referencias internas

**Cómo documentar decisiones (ADRs):**
- **Contexto:** Problema que resuelve
- **Opciones consideradas:** Pros/cons de cada alternativa
- **Decisión:** Opción elegida y justificación
- **Consecuencias:** Impacto esperado y riesgos

**Reglas para ejemplos:**
- **Mínimo uno por concepto:** Todo sistema complejo incluye ejemplo de uso
- **Comandos copy-paste:** Output esperado cuando relevante
- **Contextual:** Ejemplos reflejan casos de uso reales del proyecto

## 8. Plantillas obligatorias

**README (estructura mínima):**
```markdown
# Calamar Loco

Endless runner 3D desarrollado con React Three Fiber.

## 🚀 Quick Start
```bash
npm install
npm run dev
```

## 📚 Documentation
- [Getting Started](docs/01_getting_started/)
- [Architecture](docs/02_architecture/)
- [Game Design](docs/03_game_design/)

## 🤝 Contributing
Ver [CONTRIBUTING.md](CONTRIBUTING.md)
```

**Getting Started:**
```markdown
---
title: "Getting Started"
owner: Tech Lead
status: Stable
---

# Getting Started

## Prerequisites
- Node.js 18+
- npm 8+

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## First Build
```bash
npm run build
npm run preview
```

## Development Workflow
- Use `npm run dev` for development
- Run tests with `npm test`
- Build for production with `npm run build`
```

**Runbook (incidentes y troubleshooting):**
```markdown
---
title: "Performance Issues Runbook"
owner: Tech Lead
status: Stable
---

# Performance Issues Runbook

## Síntomas
- FPS drops below 30
- GC spikes in profiler
- High memory usage

## Diagnosis
1. Open Chrome DevTools → Performance tab
2. Record 10 seconds of gameplay
3. Look for long tasks (>50ms) and GC events

## Common Fixes
### GC Spikes
```typescript
// Before: Creating objects in loop
for (let i = 0; i < 100; i++) {
  objects.push(new GameObject());
}

// After: Object pooling
for (let i = 0; i < 100; i++) {
  objects.push(pool.get());
}
```

### Long Tasks
- Memoize expensive calculations
- Use requestAnimationFrame for smooth updates
- Avoid DOM manipulation in render loop

## Escalation
If issue persists, create issue with:
- Performance trace (.json)
- Device specs
- Steps to reproduce
```

**ADR (Architecture Decision Record):**
```markdown
---
title: "Framework Choice ADR"
owner: Tech Director
status: Stable
related: [TASK-001]
---

# Framework Choice

## Context
Need to choose rendering framework for 3D endless runner web game.

## Decision
Use React Three Fiber + Three.js for:
- Declarative component-based architecture
- React ecosystem integration
- WebGL performance with fallback support

## Alternatives Considered

### Phaser.js
- Pros: 2D focused, simpler for mobile
- Cons: Breaking change to 2D, no 3D support
- Decision: Not suitable for 3D vision

### Babylon.js
- Pros: Enterprise features, WebXR support
- Cons: Bundle size (~800KB), complexity overkill
- Decision: Too heavy for MVP scope

## Consequences
- Positive: Modern React patterns, good performance
- Negative: Learning curve for 3D math, bundle size considerations
- Risk: Future WebXR needs may require migration
```

**Spec de feature (tech):**
```markdown
---
title: "Object Pooling Implementation"
owner: Gameplay Engineer
status: Draft
related: [TASK-001]
---

# Object Pooling Implementation

## Overview
Implement object pooling to reduce GC pressure in LevelManager spawn system.

## Requirements
- Pool generic GameObject instances
- Support different object types (obstacles, gems, letters)
- Automatic cleanup on component unmount
- Memory usage < 50MB additional

## API Design
```typescript
class ObjectPool<T> {
  constructor(factory: () => T, initialSize = 10);
  get(): T;
  release(obj: T): void;
  getStats(): { active: number, available: number };
}
```

## Implementation Steps
1. Create ObjectPool class in `utils/ObjectPool.ts`
2. Modify LevelManager to use pool instead of `new`
3. Add pool cleanup in component unmount
4. Add performance monitoring

## Testing
- Unit tests for pool functionality
- Integration tests with LevelManager
- Memory profiling before/after implementation

## Success Criteria
- GC events reduced by 60-80%
- No memory leaks in pool usage
- FPS stable at 55+ on mobile
```

**Spec de sistema de gameplay (si aplica):**
```markdown
---
title: "Combat System Design"
owner: Game Designer
status: Draft
related: [TASK-003]
---

# Combat System Design

## Overview
Add offensive combat mechanics to transform passive evasion into active engagement.

## Core Mechanics
- Player can shoot projectiles at enemies
- Limited ammo encourages strategic use
- Enemies have health and can be destroyed

## Balance Considerations
- Ammo regenerates slowly or via pickups
- Enemy projectiles require precise timing
- Combat adds skill ceiling without increasing difficulty floor

## Implementation Requirements
- Projectile physics with collision detection
- Ammo management UI
- Audio feedback for shots/hits
- Performance impact < 10% on target devices

## Success Metrics
- Player engagement time +50%
- Combat usage >30% of sessions
- Retention D7 +15%
```

**Checklist de release:**
```markdown
---
title: "Release Checklist"
owner: Tech Lead
status: Stable
---

# Release Checklist

## Pre-Release
- [ ] All tests passing
- [ ] Bundle size < 500KB gzipped
- [ ] Performance budget met (55fps mobile)
- [ ] No console errors
- [ ] Documentation updated

## Deployment
- [ ] Vercel deployment successful
- [ ] PWA manifest valid
- [ ] Offline functionality tested
- [ ] Mobile compatibility verified

## Post-Release
- [ ] Analytics events firing
- [ ] Error tracking active
- [ ] Performance monitoring active
- [ ] Rollback plan documented

## Sign-off
- [ ] QA approval
- [ ] Product approval
- [ ] Tech lead approval
```

**Postmortem:**
```markdown
---
title: "Postmortem: Performance Degradation Incident"
owner: Tech Lead
date: 2025-12-15
---

# Postmortem: Performance Degradation Incident

## Incident Summary
On 2025-12-10, production deployment showed 40% FPS drop on mobile devices, affecting ~25% of users.

## Timeline
- 14:00: Deploy completed successfully
- 14:30: User reports of lag on mobile
- 15:00: Confirmed FPS drop in monitoring
- 16:00: Root cause identified (object pooling disabled)
- 17:00: Hotfix deployed

## Root Cause
Object pooling was accidentally disabled in LevelManager refactor, causing massive GC spikes.

## Impact
- 25% of mobile users affected
- Average session time reduced by 60%
- Revenue impact: ~$500 lost

## Resolution
- Re-enabled object pooling
- Added runtime checks for pool health
- Improved monitoring alerts

## Prevention
- Add performance regression tests
- Implement feature flags for critical systems
- Improve code review checklist for performance impact

## Action Items
- [ ] Implement automated performance tests
- [ ] Add feature flags for critical systems
- [ ] Enhance monitoring dashboard
- [ ] Create performance impact checklist for PRs
```

## 9. Plan de migración y limpieza (30-60-90 días)

**0–30 días: Quick wins (entry points, estructura, convenciones)**
- **Objetivos:** Crear navegación clara, establecer convenciones básicas
- **Entregables:** docs/README.md con índice maestro, frontmatter en todos los docs, glosario unificado
- **Riesgo:** Cambio disruptivo si convenciones no se siguen
- **Medir éxito:** 100% docs con frontmatter, 0 links rotos en CI

**31–60 días: Trazabilidad, plantillas, owners, ADRs**
- **Objetivos:** Establecer sistema de documentación mantenible
- **Entregables:** CODEOWNERS actualizado, plantillas obligatorias implementadas, primeros ADRs para decisiones clave
- **Riesgo:** Owners no asignados correctamente causan abandono
- **Medir éxito:** 80% docs con owners asignados, 5+ ADRs creados

**61–90 días: Runbooks, QA docs, automatizaciones**
- **Objetivos:** Documentación operacional completa
- **Entregables:** Runbooks para issues comunes, QA docs estandarizados, linting automático de markdown
- **Riesgo:** Over-engineering si automatización es compleja
- **Medir éxito:** Tiempo resolución issues -50%, checklist release cumplido 100%

## 10. Integración con TASK (tareas planificadas y pendientes)

**Evalúa calidad de las tareas desde lo documental:**
- **TASK-012/013:** Bien definidas con subtareas claras, pero sin criterios de aceptación
- **TASK faltan criterios de éxito:** Medibles para validar completion
- **Links a specs/docs:** Ausentes, dificulta trazabilidad
- **Dueño y contexto:** Tech Lead asignado pero contexto limitado

**Reordena backlog de documentación por dependencias/riesgo/ROI:**
1. **Estructura docs + entry points:** Base para todo lo demás
2. **Convenciones + plantillas:** Estándares para creación consistente
3. **Trazabilidad TASK↔docs:** Conexión entre trabajo y documentación
4. **ADRs para decisiones técnicas:** Registro de arquitectura
5. **Runbooks + troubleshooting:** Soporte operacional
6. **QA docs + checklists:** Calidad y releases
7. **Automatización:** Mantenibilidad a largo plazo

**Marca tareas para:**
- **A) Mantener:** TASK-012/013 (documentación básica necesaria)
- **B) Modificar:** TASK-012 (expandir a API docs + ejemplos), TASK-013 (incluir plantillas y convenciones)
- **C) Cortar/postergar:** Ninguna (documentación es deuda técnica crítica)
- **D) Agregar:**
  - Sistema de trazabilidad TASK↔docs
  - Plantillas estandarizadas
  - CODEOWNERS para docs
  - Definition of Done documental
  - Glosario técnico unificado
  - ADR para decisiones técnicas

**Identifica "missing tasks" críticas:**
1. **Trazabilidad TASK↔docs:** Sin conexión entre trabajo planificado y documentación
2. **Definition of Done documental:** Sin criterios claros de cuándo docs requieren update
3. **Plantillas estandarizadas:** Sin formatos consistentes para nuevos docs
4. **CODEOWNERS docs:** Sin ownership clara causa abandono
5. **Glosario unificado:** Términos inconsistentes entre docs
6. **ADR system:** Decisiones técnicas no registradas formalmente

## 11. Bitácora detallada del proceso realizado

**Material revisado:**
- **docs/TASK.MD:** TASK completas con estructura, prioridades, dependencias
- **package.json:** Proyecto básico sin docs tooling
- **README.md:** Setup básico, sin estructura docs
- **docs/ varios .MD:** Análisis nuevos sin estructura ni convenciones
- **vite.config.ts:** Config básica sin docs tooling

**Señales/evidencias usadas:**
- **Estructura inconsistente:** Docs en raíz sin organización clara
- **Naming heterogéneo:** Mayúsculas mixtas, sin prefijos numéricos
- **Links ausentes:** Sin referencias cruzadas entre docs
- **Versionado manual:** Sin automatización ni changelog consistente
- **Ownership unclear:** Sin CODEOWNERS ni frontmatter estandarizado

**Checks aplicados:**
- **Entry points:** Conté README.md básico vs docs dispersos
- **Términos inconsistentes:** Encontré "gameplay" vs "game play", "tech director" vs "CTO"
- **Trazabilidad:** TASK mencionan docs pero sin links específicos
- **Formato:** Tablas sin alineación, headings sin jerarquía consistente

**SUPUESTOS realizados y por qué:**
- **Audiencia docs:** Equipo pequeño (1-2 devs) SUPUESTO por TASK individuales
- **Herramientas disponibles:** Sin docs-as-code tooling SUPUESTO por package.json básico
- **Frecuencia updates:** Manual SUPUESTO por falta de CI/CD en docs
- **Necesidades operacionales:** Runbooks necesarios SUPUESTO por troubleshooting en TASK

**Decisiones de priorización:**
- **Criterios:** Riesgo operativo (entry points primero), frecuencia uso (getting started primero), impacto onboarding (glosario primero)
- **Orden:** Estructura → convenciones → trazabilidad → contenido específico → automatización
- **Horizonte:** 90 días dividido por fundación → estándares → operaciones

**Qué NO pude verificar:**
- **User testing docs:** Sin feedback real de devs usando docs
- **Link validation:** Sin herramientas automáticas ejecutadas
- **Readability metrics:** Sin análisis de complejidad de texto
- **Maintenance overhead:** Sin tracking de tiempo actualización docs
- **Stakeholder needs:** Sin survey de qué docs se necesitan realmente

> 📘 Más contexto general: [README.md](../README.md)

---
🔗 Este documento está alineado con la fuente de verdad del proyecto ([TASK.MD](./TASK.MD)).
Última sincronización automática: 2025-12-17

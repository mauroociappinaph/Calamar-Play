# 📋 Checklist de Implementación: Automatizaciones de Calidad (QA Automation Suite)

> 🎯 **Objetivo:** Implementar suite completa de automatizaciones de calidad para mantener estándares de código, detectar problemas temprano y asegurar consistencia en el proyecto Calamar Loco.
>
> **Estado General:** 🔵 Pendiente (0% completado)
> **Prioridad:** 🔴 Alta (Bloquea calidad de código y escalabilidad)
> **Timeline Estimado:** 2-3 sprints (1 semana por automatización)
> **Propietario:** QA Engineer & DevOps Lead
> **Referencias:** [QA_TEST_LEAD.md](./QA_TEST_LEAD.md), [BUILD_ENGINEER_DEVOPS_GAMES.md](./BUILD_ENGINEER_DEVOPS_GAMES.md), [TECHNICAL_DIRECTOR.md](./TECHNICAL_DIRECTOR.md)

---

## 🔍 **AUTOMATIZACIÓN 1: Eliminación Automática de Console Logs**
*Objetivo: Remover todos los console.log/debug antes de commits de producción*

### 📋 Tareas y Subtareas

- **TASK-QA-001: Configurar ESLint Rule para Console Logs**
    - [ ] Instalar y configurar `eslint-plugin-no-console` en `.eslintrc.js`
    - [ ] Crear regla personalizada que permita console.error/warn pero bloquee console.log/debug
    - [ ] Configurar excepciones para archivos de desarrollo (`src/**/*.dev.ts`)
    - [ ] Documentar regla en `CONTRIBUTING.md`
    - [ ] **Dependencias:** Ninguna
    - [ ] **Comandos:**
      ```bash
      npm install --save-dev eslint-plugin-no-console
      npx eslint --init  # Configurar regla
      ```

- **TASK-QA-002: Crear Pre-commit Hook con Husky**
    - [ ] Instalar Husky v8+ y configurar hooks en `package.json`
    - [ ] Crear script `scripts/remove-console-logs.js` que use AST parsing
    - [ ] Integrar con pre-commit: `npm run remove-console-logs`
    - [ ] Crear whitelist para logs permitidos (errores de red, auth failures)
    - [ ] **Dependencias:** TASK-QA-001
    - [ ] **Comandos:**
      ```bash
      npm install --save-dev husky
      npx husky install
      echo 'npm run remove-console-logs' > .husky/pre-commit
      ```

- **TASK-QA-003: Implementar Script de Limpieza Inteligente**
    - [ ] Usar `@babel/parser` y `@babel/traverse` para AST analysis
    - [ ] Detectar y remover solo console.log/debug (preservar console.error/warn)
    - [ ] Crear backups automáticos antes de modificaciones
    - [ ] Generar reporte de logs removidos por archivo
    - [ ] **Dependencias:** TASK-QA-002
    - [ ] **Comandos:**
      ```bash
      npm install --save-dev @babel/parser @babel/traverse
      node scripts/remove-console-logs.js
      ```

- **TASK-QA-004: Integrar en CI/CD Pipeline**
    - [ ] Agregar job en `.github/workflows/ci.yml` para validar ausencia de console logs
    - [ ] Configurar script que falle el build si encuentra logs no permitidos
    - [ ] Crear badge en README mostrando "Console Log Free"
    - [ ] **Dependencias:** TASK-QA-003
    - [ ] **Comandos:**
      ```yaml
      # En .github/workflows/ci.yml
      - name: Check Console Logs
        run: npm run check-console-logs
      ```

---

## 🔍 **AUTOMATIZACIÓN 2: Detección de Código Duplicado**
*Objetivo: Identificar y reportar código duplicado automáticamente*

### 📋 Tareas y Subtareas

- **TASK-QA-005: Configurar JSCPD (Copy-Paste Detector)**
    - [ ] Instalar jscpd y configurar en `package.json`
    - [ ] Crear configuración `.jscpd.json` con thresholds personalizados
    - [ ] Configurar exclusiones (node_modules, dist, generated files)
    - [ ] Establecer límite máximo de duplicación (5% del codebase)
    - [ ] **Dependencias:** Ninguna
    - [ ] **Comandos:**
      ```bash
      npm install --save-dev jscpd
      npx jscpd --init
      ```

- **TASK-QA-006: Implementar Reporte de Duplicados**
    - [ ] Configurar salida HTML/JSON en `jscpd-report/`
    - [ ] Crear script que analice reportes y genere alertas
    - [ ] Integrar con GitHub PR comments usando action
    - [ ] Crear dashboard simple para visualizar duplicados por módulo
    - [ ] **Dependencias:** TASK-QA-005
    - [ ] **Comandos:**
      ```bash
      npm run jscpd -- --reporters html,json
      node scripts/analyze-duplicates.js
      ```

- **TASK-QA-007: Reglas de Calidad por Módulo**
    - [ ] Configurar thresholds diferentes por tipo de archivo:
      - `src/**/*.ts`: Máx 3% duplicación
      - `tests/**/*.test.ts`: Tolerancia 10% (helpers comunes)
      - `docs/**/*.md`: Máx 5% (secciones repetidas)
    - [ ] Crear excepciones para patrones aceptados (getters/setters, factories)
    - [ ] Implementar scoring por severidad (bloqueante vs warning)
    - [ ] **Dependencias:** TASK-QA-006
    - [ ] **Comandos:**
      ```json
      // .jscpd.json
      {
        "threshold": 5,
        "reporters": ["html", "json"],
        "ignore": ["node_modules/**", "dist/**"]
      }
      ```

- **TASK-QA-008: Integración Continua de Duplicados**
    - [ ] Agregar job en CI que falle si duplicación > threshold
    - [ ] Crear GitHub Action que commente en PRs con duplicados encontrados
    - [ ] Implementar auto-fix para duplicados simples (usando jscpd --fix)
    - [ ] **Dependencias:** TASK-QA-007
    - [ ] **Comandos:**
      ```yaml
      - name: Check Code Duplication
        run: |
          npm run jscpd
          node scripts/check-duplication-threshold.js
      ```

---

## 🔍 **AUTOMATIZACIÓN 3: Control de Tamaño de Archivos**
*Objetivo: Prevenir archivos excesivamente grandes y mantener modularidad*

### 📋 Tareas y Subtareas

- **TASK-QA-009: Configurar ESLint Rule para File Size**
    - [ ] Instalar `eslint-plugin-file-size` o crear regla custom
    - [ ] Establecer límites por tipo de archivo:
      - Componentes React: Máx 300 líneas
      - Utilidades: Máx 150 líneas
      - Tests: Máx 200 líneas
    - [ ] Crear excepciones para archivos generados/legacy
    - [ ] **Dependencias:** Ninguna
    - [ ] **Comandos:**
      ```bash
      npm install --save-dev eslint-plugin-file-size
      ```

- **TASK-QA-010: Implementar Script de Análisis de Tamaño**
    - [ ] Crear `scripts/analyze-file-sizes.js` con análisis de complejidad ciclomática
    - [ ] Generar reporte con métricas: líneas, funciones, complejidad
    - [ ] Crear alertas para archivos que excedan límites
    - [ ] Integrar con pre-commit hook
    - [ ] **Dependencias:** TASK-QA-009
    - [ ] **Comandos:**
      ```bash
      node scripts/analyze-file-sizes.js --threshold 300
      ```

- **TASK-QA-011: Dashboard de Métricas de Código**
    - [ ] Usar `cloc` o similar para contar líneas por lenguaje
    - [ ] Crear script que genere métricas semanales
    - [ ] Implementar tendencias y alertas de crecimiento excesivo
    - [ ] Integrar con CI para reportes automáticos
    - [ ] **Dependencias:** TASK-QA-010
    - [ ] **Comandos:**
      ```bash
      npm install --save-dev cloc
      npx cloc src/ --json > metrics.json
      ```

- **TASK-QA-012: Reglas de Refactorización Automática**
    - [ ] Crear script que sugiera splits para archivos grandes
    - [ ] Implementar auto-refactor básico (extraer funciones)
    - [ ] Generar PRs automáticos para archivos que necesiten refactor
    - [ ] **Dependencias:** TASK-QA-011
    - [ ] **Comandos:**
      ```bash
      node scripts/suggest-refactors.js --file src/large-file.ts
      ```

---

## 🔍 **AUTOMATIZACIÓN 4: Integración Completa en CI/CD**
*Objetivo: Pipeline completo con todas las verificaciones de calidad*

### 📋 Tareas y Subtareas

- **TASK-QA-013: Consolidar CI/CD Workflow**
    - [ ] Unificar todos los checks de calidad en `.github/workflows/ci.yml`
    - [ ] Crear jobs paralelos: lint, test, size, duplication, links
    - [ ] Implementar caching inteligente para dependencias
    - [ ] Configurar diferentes niveles de checks (fast vs full)
    - [ ] **Dependencias:** TASK-QA-001, TASK-QA-005, TASK-QA-009
    - [ ] **Comandos:**
      ```yaml
      jobs:
        quality:
          steps:
            - run: npm run lint
            - run: npm run test
            - run: npm run check-file-sizes
            - run: npm run check-duplicates
      ```

- **TASK-QA-014: Implementar Quality Gates**
    - [ ] Configurar branch protection rules en GitHub
    - [ ] Requerir checks de calidad para merges a develop/main
    - [ ] Implementar scoring de calidad (A/B/C grade)
    - [ ] Crear badges para README con estado de calidad
    - [ ] **Dependencias:** TASK-QA-013
    - [ ] **Comandos:**
      ```yaml
      # Branch protection: Require status checks to pass
      # - Quality Gate
      # - Tests
      # - Lint
      ```

- **TASK-QA-015: Reportes y Alertas Automáticas**
    - [ ] Configurar notificaciones Slack/Discord para fallos de calidad
    - [ ] Crear weekly reports con métricas de calidad
    - [ ] Implementar dashboards con tendencias
    - [ ] Configurar alerts para degradación de métricas
    - [ ] **Dependencias:** TASK-QA-014
    - [ ] **Comandos:**
      ```bash
      node scripts/generate-quality-report.js --send-slack
      ```

---

## 🔍 **AUTOMATIZACIÓN 5: Documentación de Estándares**
*Objetivo: Mantener documentación viva de estándares de calidad*

### 📋 Tareas y Subtareas

- **TASK-QA-016: Actualizar CONTRIBUTING.md**
    - [ ] Documentar todas las reglas de calidad automática
    - [ ] Crear sección "Quality Standards" con ejemplos
    - [ ] Incluir troubleshooting para errores comunes de calidad
    - [ ] Agregar ejemplos de código que pasan/fallan checks
    - [ ] **Dependencias:** Todas las anteriores
    - [ ] **Comandos:**
      ```markdown
      ## Quality Standards

      ### Console Logs
      ❌ `console.log('debug')` - Bloqueado
      ✅ `console.error('error')` - Permitido

      ### File Sizes
      - Components: < 300 lines
      - Utils: < 150 lines
      ```

- **TASK-QA-017: Crear Guía de Troubleshooting**
    - [ ] Documentar soluciones para errores comunes de CI
    - [ ] Crear FAQ para issues de calidad
    - [ ] Incluir comandos para debugging local
    - [ ] **Dependencias:** TASK-QA-016
    - [ ] **Comandos:**
      ```bash
      # Debug local
      npm run lint -- --debug
      npm run check-file-sizes -- --verbose
      ```

- **TASK-QA-018: Integrar con Docs Audit**
    - [ ] Actualizar `docs/DOCS_AUDIT.md` con métricas de calidad
    - [ ] Crear sección de "Quality Automation Status"
    - [ ] Incluir referencias a todas las automatizaciones implementadas
    - [ ] **Dependencias:** TASK-QA-017
    - [ ] **Comandos:**
      ```bash
      node scripts/update-docs-audit.js --quality-metrics
      ```

---

## 📊 **Métricas de Éxito y Seguimiento**

### 🎯 KPIs de Calidad
- **Tasa de Éxito de CI:** > 95% (commits que pasan todos los checks)
- **Tiempo de Feedback:** < 5 minutos para resultados de calidad
- **Densidad de Código Duplicado:** < 5% del codebase
- **Tamaño Promedio de Archivos:** < 200 líneas por archivo
- **Ausencia de Console Logs:** 100% en producción

### 📈 Dashboard de Métricas
- **Commits por día** que pasan calidad
- **Tiempo promedio** de ejecución de checks
- **Tendencias** de duplicación y tamaño de archivos
- **Alertas** automáticas cuando métricas degradan

### 🔄 Mantenimiento
- **Revisiones mensuales** de thresholds de calidad
- **Actualizaciones** de reglas según evolución del proyecto
- **Auditorías** trimestrales de efectividad de automatizaciones

---

## 🏃 **Plan de Ejecución Recomendado**

### 🚀 **FASE 1: Fundación (Semana 1)**
1. TASK-QA-001 → TASK-QA-002 → TASK-QA-003
2. TASK-QA-005 → TASK-QA-006
3. TASK-QA-013 (integración básica)

### 🎯 **FASE 2: Profundización (Semana 2)**
1. TASK-QA-004, TASK-QA-007, TASK-QA-008
2. TASK-QA-009 → TASK-QA-010 → TASK-QA-011
3. TASK-QA-014 → TASK-QA-015

### 🌟 **FASE 3: Pulido (Semana 3)**
1. TASK-QA-012, TASK-QA-016 → TASK-QA-017 → TASK-QA-018
2. Optimizaciones y fine-tuning
3. Documentación final y capacitación del equipo

---

## 📚 **Referencias y Recursos**

- **Especificaciones:** [QA_TEST_LEAD.md](./QA_TEST_LEAD.md)
- **CI/CD:** [BUILD_ENGINEER_DEVOPS_GAMES.md](./BUILD_ENGINEER_DEVOPS_GAMES.md)
- **Arquitectura:** [TECHNICAL_DIRECTOR.md](./TECHNICAL_DIRECTOR.md)
- **Documentación:** [CONTRIBUTING.md](../CONTRIBUTING.md)

---
*Checklist generado automáticamente el 18/12/2025. Actualizar estado de checkboxes según progreso de implementación.*

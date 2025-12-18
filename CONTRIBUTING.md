# Guía de Contribución - Calamar Loco

> 🤝 Bienvenido al equipo de desarrollo. Este documento establece los estándares para que nuestra arquitectura siga siendo robusta y escalable.
> Relacionado: TASK-013, TASK-023

## 1. Flujo de Git y Ramas
Seguimos una estrategia **Trunk-Based Development** simplificada:

- **Ramas Principales:**
  - `main`: Código estable y listo para producción (Vercel Prod).
  - `develop`: Integración de features.
- **Ramas de Feature:**
  - Naming: `feature/TASK-ID-breve-descripcion` (ej: `feature/TASK-001-object-pooling`).
  - Naming de Bugfix: `fix/breve-descripcion`.

---

## 2. Convención de Commits
Usamos **Conventional Commits** para generar changelogs automáticos y mantener la historia limpia:

- `feat(scope): mensaje` -> Nuevas funcionalidades.
- `fix(scope): mensaje` -> Corrección de errores.
- `docs(scope): mensaje` -> Cambios en documentación.
- `perf(scope): mensaje` -> Mejoras de rendimiento.
- `refactor(scope): mensaje` -> Cambios de código que no corrigen ni añaden features.

*Scopes comunes: `core`, `ui`, `world`, `audio`, `store`.*

---

## 3. Estándares de Código
- **TypeScript Strict:** No se permiten `any`. Usa interfaces claras para props de componentes R3F.
- **Barrel Files:** No importes archivos internos de un componente; usa el `public.ts` o `index.ts` del directorio (ver [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)).
- **Memoización:** Es obligatorio el uso de `useMemo` para geometrías y materiales pesados.
- **Hoisting:** Mantén los componentes Three.js pequeños y enfocados en una sola responsabilidad.

---

## 4. Automatización de Calidad (CI/CD)
Contamos con una suite automatizada para garantizar que ningún código roto llegue a `develop` o `main`:

### ✅ Validaciones Locales (Husky)
- **Pre-commit Hook:** Antes de cada `git commit`, se ejecutará automáticamente `npm run test`.
- Si los tests fallan, el commit será bloqueado.
- Puedes ejecutar los tests manualmente con `npm run test` antes de commitear.

- **Pre-push Hook:** Antes de cada `git push`, se ejecutará automáticamente `npm test && npm run build`.
- Si los tests o el build fallan, el push será bloqueado.
- Esto asegura que ningún código roto llegue al repositorio remoto.
- **Forzar push (solo emergencias):** `git push --no-verify` (no recomendado, solo para casos críticos).

### 🚀 Integración Continua (GitHub Actions)
- Cada **Push** o **Pull Request** a `main`, `develop` o ramas `feature/*` dispara un workflow de CI.
- El build y los tests se validan en un entorno limpio (`ubuntu-latest`).
- **Bloqueo de Merge:** No se permite el merge de un PR si el CI falla.

---

## 5. Proceso de Pull Request (PR)
1. Asegúrate de que el código compila localmente (`npm run build`).
2. Los tests deben pasar localmente (`npm test`).
3. Todo PR debe referenciar una **TASK-ID** en la descripción.
4. Definición de Hecho (DoD):
   - [ ] CI Status: ✅ Passed.
   - [ ] No hay errores de consola en el build.
   - [ ] La performance en móvil no se ha degradado significativamente.
   - [ ] La documentación relevante ha sido actualizada.

---
🔗 Referencia: [TASK.MD](./docs/TASK.MD) | [README.md](./README.md)
Última actualización: 17/12/2025

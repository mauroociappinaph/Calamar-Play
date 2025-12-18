# Calamar Loco – Endless Runner 3D con IA Ligera 🦑🚀
**Un desafío de velocidad y reflejos optimizado para el futuro de la web.**

## 🔍 Overview
**Calamar Loco** es un *endless runner* 3D diseñado para ser un producto pulido, con alta retención y un rendimiento excepcional. El objetivo no es solo crear un juego divertido, sino demostrar el dominio de un flujo de desarrollo moderno donde la **IA y el Vibe Coding** se integran en una arquitectura robusta basada en **React Three Fiber**.

> 📘 Documento maestro → [Ver TASK.MD](./docs/TASK.MD)

## 🚀 Fases de Desarrollo
El proyecto sigue una estrategia unificada dividida en tres etapas clave:

1.  **Fase 1: Fundación (Estabilización y Medición):** Foco total en lograr ≥ 55 FPS en móviles, optimizando geometrías, materiales y estableciendo una infraestructura de datos y testing sólida.
2.  **Fase 2: Retención (Diversión y Equidad):** Mejora del core loop, balance de economía y dificultad, e implementación de sistemas de checkpoints para una experiencia de usuario (UX) satisfactoria.
3.  **Fase 3: Expansión (Profundidad y Contenido):** Introducción de mecánicas avanzadas como combate, integración de PWA y el despliegue de modelos de IA adaptativa en el cliente.

## 🧠 IA Ligera y Vibe Coding
Este proyecto es desarrollado íntegramente por **una sola persona**, potenciando la productividad mediante **asistentes de IA** (Vibe Coding) para tareas repetitivas y boilerplate.

**Puntos clave del plan de IA:**
- **Adaptive AI Manager:** Reglas locales que ajustan la dificultad en tiempo real según el rendimiento del jugador.
- **Modelos Client-Side:** Uso de **TensorFlow.js** para ejecutar una red neuronal sencilla (3→3→1) directamente en el navegador, sin necesidad de servidores externos.
- **Transparencia:** Visualización del "IA Confidence" en el HUD para mostrar la toma de decisiones del modelo.

## 🧱 Stack Técnico
- **Core:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [Three.js](https://threejs.org/).
- **Tooling:** Vite, TypeScript.
- **Estado:** [Zustand](https://github.com/pmndrs/zustand) (FSM para gestión de estados).
- **Inteligencia:** TensorFlow.js.
- **Analytics:** Plausible Analytics.
- **DevOps:** GitHub Actions (CI/CD), Vercel (Deployment).

## 📋 Backlog y Features Claves
| ID | Feature | Descripción | Prioridad | Fase |
|----|---------|-------------|-----------|------|
| **TASK-001** | Object Pooling | Reutilización de instancias para eliminar picos de Garbage Collection. | 🔴 Alta | 1 |
| **TASK-006** | Level of Detail (LOD) | Reducción de complejidad en objetos lejanos para optimización en móviles. | 🔴 Alta | 1 |
| **TASK-017** | Sistema de Checkpoints | Guardado de progreso en puntos clave para reducir la frustración. | 🔴 Alta | 2 |
| **TASK-020** | Fixed Timestep Loop | Separación de física y render para consistencia independiente del framerate. | 🔴 Alta | 1 |
| **TASK-021** | Sistema de Combate | Mecánica de disparo con munición limitada (MVP). | 🟡 Media | 3 |
| **TASK-024** | Integración de IA | Implementación de IA adaptativa y modelos TF.js en runtime. | 🟡 Media | 3 |

## 📊 Métricas de Control
| Métrica | Target | Método | Asociada |
|---------|--------|--------|----------|
| **FPS (Móvil)** | ≥ 55 | Benchmark automatizado | TASK-011 |
| **Crash-free Sessions** | > 99% | Error tracking | TASK-011 |
| **Retención D1** | > 40% | Telemetría (Plausible) | TASK-015 |
| **Retención D7** | > 15% | Telemetría (Plausible) | TASK-015 |
| **Session Length** | > 8 min | Analytics | TASK-015 |

## 🚧 Próximos Pasos Personales
---
- Iniciar la rama `feature/ai-demo`.
- Documentar avances en `/docs/AI_NOTES.md`.
- Iterar el módulo de IA ligera hasta obtener una demo funcional en Vercel.
---

## 🤝 Construcción Local y Contribución
El proyecto está abierto a feedback técnico. Para ejecutarlo localmente:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/mauroociappinaph/Calamar-Play.git
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Lanzar entorno de desarrollo:**
   ```bash
   npm run dev
   ```

## 📎 Licencia y Autoría
Desarrollado por **Mauro Ciappina** – Full Stack → AI Developer.
Este proyecto está bajo la licencia **MIT**.

---
🔗 Referencia: [TASK.MD](./docs/TASK.MD) | [README.md](./README.md)
Última actualización: 17/12/2025

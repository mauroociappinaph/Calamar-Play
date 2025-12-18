# LEADERBOARD_SPEC.md

> 🏆 Especificación del Sistema de Leaderboard – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)
> Relacionado: TASK-014

## 1. Introducción y Objetivo
El sistema de Leaderboard tiene como objetivo fomentar la rejugabilidad y la competencia mediante el registro de las mejores puntuaciones. En su versión MVP, el sistema será local, evolucionando hacia una solución global en el futuro.

---

## 2. Especificación Técnica

### A) Almacenamiento Local (MVP)
- **Tecnología:** `localStorage`.
- **Estructura de Datos:**
```typescript
interface LeaderboardEntry {
  name: string;      // Apodo del calamar (default: "Calamar Anon")
  score: number;     // Puntuación final
  date: string;      // Timestamp ISO
  letters: number;   // Cuántas letras del nombre recolectó
}
```

### B) Lógica de Clasificación
- Se guardarán únicamente los **10 mejores puntajes**.
- El trigger de guardado ocurre en la pantalla de `GAME_OVER` o `VICTORY`.
- Se implementará un `rate-limit` para evitar escrituras excesivas en el disco.

---

## 3. UI y Feedback (UX)
- **Pantalla de Leaderboard:** Accesible desde el menú principal.
- **Visualización:** Lista numerada con efectos de "medallas" (Oro/Plata/Bronce) para los 3 primeros puestos.
- **Botón "Compartir":** Permite copiar al portapapeles un texto predefinido:
  *"🐙 ¡Soy el rey de la playa! Mi récord en Calamar Loco es de [SCORE] puntos. ¿Puedes superarme? #CalamarLoco"*

---

## 4. Métricas de Éxito
- **Engagement:** El 20% de los jugadores debería consultar el Leaderboard al menos una vez por sesión.
- **Social:** Incremento en el tráfico de redes sociales debido al uso del botón "Compartir".

---
🔗 Referencia: [TASK.MD](./TASK.MD) | [README.md](../README.md)
Última actualización: 17/12/2025

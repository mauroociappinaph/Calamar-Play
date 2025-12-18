# AUDIO_SPEC.md

> 🔊 Especificación Técnica de Audio – alineado con [TASK.MD](./TASK.MD) (fuente de verdad del proyecto)
> Relacionado: TASK-002

## 1. Introducción y Objetivo
El sistema de audio de Calamar Loco tiene como objetivo sumergir al jugador en una atmósfera tropical y absurda, proporcionando feedback sonoro inmediato a todas las acciones de gameplay para mejorar la retención y el "game feel".

**Objetivos principales:**
- Implementar un sistema de música adaptativa con transiciones fluidas.
- Proveer un motor de efectos de sonido (SFX) con espacialización básica.
- Cumplir con las políticas de "Audio Unlock" de los navegadores modernos.
- Mantener un presupuesto de memoria bajo para assets de audio.

---

## 2. Especificación Técnica

### A) Arquitectura del Motor de Audio (`src/systems/audio/`)
El motor se basa en la Web Audio API y es independiente de React para evitar latencias de re-renderizado.

**Interfaces:**
```typescript
interface AudioEngine {
  playSFX(id: string, options?: SFXOptions): void;
  playMusic(id: string, crossfade?: number): void;
  stopMusic(): void;
  setVolume(category: 'master' | 'music' | 'sfx', value: number): void;
  unlock(): Promise<void>; // Maneja User Interaction policy
}
```

### B) Assets y Formatos
- **Música:** Formato `.ogg` (o `.mp3` como fallback) en modo loop. Bitrate recomendado: 128kbps.
- **SFX:** Formato `.wav` o `.webm` para baja latencia.
- **Almacenamiento:** `/public/assets/audio/`.

### C) Capas de Audio (Mixer)
1. **Master (1.0):** Control global.
2. **Music (0.6):** Música de fondo tropical (Steel drums, ukulele).
3. **SFX (0.8):** Efectos de colisión, recolección y saltos.
4. **Ambience (0.4):** Sonidos de olas y gaviotas de fondo.

---

## 3. Feedback Audiovisual

| Evento | SFX Recomendado | Lógica de Reproducción |
| :--- | :--- | :--- |
| **Salto** | "Whoop" ascendente | Pitch aleatorio sutil (±10%) para variedad. |
| **Recoger Letra** | Acorde musical | C-A-L-A-M-A-R... cada letra sube una nota en la escala. |
| **Recoger Gema** | "Plop" metálico | Volumen bajo, alta frecuencia. |
| **Daño** | "Ouch" absurdo | Interrumpe música momentáneamente (low-pass filter). |
| **Level Up** | Fanfarria tropical | Crossfade de música a versión más rítmica. |

---

## 4. Políticas de Desbloqueo (Audio Unlock)
Debido a las políticas de los navegadores (Chrome/Safari), el audio comenzará "suspendido".
1. El usuario debe realizar una interacción (clic en "Play" o toque en pantalla).
2. El `AudioEngine` ejecutará `resume()` sobre el `AudioContext`.
3. El HUD mostrará un icono de "Mute" si el contexto sigue bloqueado.

---

## 5. Métricas de Éxito
- **Latencia:** < 100ms entre acción y sonido.
- **Memoria:** < 15MB totales en heap para buffers de audio.
- **Engagement:** Aumento del 10% en `session_length` tras implementación (vía TASK-015).

---
🔗 Referencia: [TASK.MD](./TASK.MD) | [README.md](../README.md)
Última actualización: 17/12/2025

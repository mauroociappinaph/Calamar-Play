# ART_DIRECTOR_TECH_ARTIST.md

## 1. Diagnóstico ejecutivo en 10 líneas

**Coherencia visual general:** Estilo "tropical marino cartoon" estático pero sin dirección estética clara - colores vivos pero geometrías simples sin jerarquía visual consistente.

**3 problemas principales de lectura/claridad:** Siluetas de obstáculos indistinguibles por geometría plana (camuflaje visual), jerarquía de información pobre (letras críticas vs gemas distractivas), valores de contraste inconsistentes entre elementos interactivos.

**3 riesgos técnicos de performance gráfica:** Overdraw de transparencias sin sorting (partículas + UI overlay), draw calls no optimizados por materiales únicos, LOD ausente causando render de geometrías lejanas innecesarias.

**3 oportunidades de alto impacto:** Sistema LOD para +25% FPS en escenas densas, paleta de materiales "lite" para reducir shader complexity, jerarquía visual clara con motion/color coding para mejor legibilidad.

**Chequeo TASK:** Las tareas de performance existentes (TASK-005, 006, 007) están bien alineadas. El nuevo plan unificado ahora contempla explícitamente los gaps visuales: la **jerarquía visual** y la **paleta de materiales coherente** se abordarán en la Fase 2 como parte de las mejoras de UX y optimización, mientras que el **pipeline de assets y la "lighting bible"** se desarrollarán progresivamente.

## 2. Dirección estética y coherencia

**"North Star" visual:** Un paraíso tropical submarino cartoon donde el calamar loco navega por arrecifes coloridos, recolectando letras mágicas entre corales fluorescentes y tiburones juguetones. El feeling es de aventura submarina ligera, con colores vibrantes (cian, coral, amarillo) pero geometrías simples que transmiten movimiento y alegría en 3 segundos.

**Pilares visuales:**
1. **Forma:** Geometrías redondeadas y orgánicas (corales, peces, calamar) vs obstáculos angulosos pero no agresivos
2. **Color:** Paleta marina: azules profundos (#00ccff), corales vivos (#ff4444, #ff8800), acentos amarillos (#ffcc00)
3. **Materiales:** Superficies húmedas brillantes con subsurface scattering sutil, sin roughness extrema
4. **Iluminación:** Luz direccional azulada con rim lights para definir siluetas
5. **VFX:** Burbujas flotantes, partículas de luz, motion trails suaves
6. **UI-in-world:** Elementos de HUD integrados al espacio 3D con profundidad

**Inconsistencias detectadas:**
- **Escalas:** Player calamar vs obstáculos - proporción no consistente (SUPUESTO por falta de modelos específicos)
- **Roughness:** Materiales metálicos vs orgánicos mezclados sin justificación visual
- **Ruido visual:** Demasiados elementos pequeños sin jerarquía clara de importancia

**Propuestas concretas para coherencia:**

**Reglas de forma:**
- **Siluetas:** Obstáculos redondeados con "puntos de interés" claros (espinas, ojos) para legibilidad a distancia
- **Proporciones:** Calamar player = 1 unidad base, obstáculos = 0.8-1.5x para variación sin caos
- **Detalle por distancia:** Siluetas simples cercanas, detalles orgánicos lejanos

**Reglas de materiales PBR "lite":**
- **Metálicos:** Solo para elementos "tecnológicos" (misiles), roughness 0.1-0.3
- **Orgánicos:** Roughness 0.4-0.7, normal maps suaves para detalle sin complexity
- **Translúcidos:** Agua y burbujas con alpha blend, sorted back-to-front

**Reglas de iluminación:**
- **Key light:** Directional azul (#00ccff) intensidad 1.0 desde arriba-izquierda
- **Fill:** Ambient azul claro 0.3 para evitar sombras planas
- **Rim:** Light cyan para separar siluetas del fondo marino

## 3. Lectura y composición en gameplay

**Legibilidad de amenazas/objetivos/interactuables:**
- **Amenazas:** Tiburones/aliens necesitan siluetas agresivas con motion blur para peligro claro
- **Objetivos:** Letras necesitan glow/outline para destacar sobre fondo coral
- **Interactuables:** Gemas necesitan sparkle particles para atracción visual

**Jerarquía visual por capas:**
- **Fondo:** Agua + corales distantes, blur para profundidad
- **Mid:** Obstáculos estáticos, movimiento lateral predecible
- **Gameplay critical:** Player + amenazas inmediatas, focus nítido

**Problemas típicos:**
- **Camuflaje:** Obstáculos se pierden contra corales del fondo por falta de outline
- **Exceso detalle:** Partículas distractoras compiten con elementos críticos
- **Valores luminancia:** UI oscura sobre fondo marino crea contraste pobre

**Cambios concretos:**
- **Mejorar silhouette read:** Añadir toon outline shader a amenazas (2px black border)
- **Reducir ruido visual:** Limitar partículas a 50 max en pantalla, usar billboards para performance
- **Guiar atención:** Color code por tipo (rojo = peligro, amarillo = premio, azul = neutral)

## 4. Auditoría de geometrías y draw calls

**Geometrías:**
- **Densidad tri:** Player calamar ~2K tris, obstáculos simples ~500 tris, corales background ~1K tris (SUPUESTO basado en complexity visible)
- **Instancing/batching:** Ausente - cada objeto renderiza separado
- **Mallas combinadas:** Environment usa múltiples meshes separadas

**Draw calls:**
- **Causas:** Materiales únicos por objeto (cada obstáculo diferente), submeshes no optimizados, decals dinámicos
- **Plan reducción:** Atlas de texturas para materiales similares, material variants por color, merge static meshes

**Tabla: Asset/Grupo | Uso | Riesgo perf | Sugerencia | Impacto esperado | Esfuerzo**

| Asset/Grupo | Uso | Riesgo perf | Sugerencia | Impacto esperado | Esfuerzo |
|-------------|-----|-------------|------------|------------------|----------|
| Player calamar | Hero principal | Tri count alto | LOD 3 niveles | -20% tris render | Medio |
| Obstáculos marinos | Amenazas | Materiales únicos | Atlas 1024x1024 | -50% draw calls | Bajo |
| Gemas/letras | Coleccionables | Partículas + glow | Billboards + instancing | -30% overdraw | Medio |
| Corales background | Ambiente | Geometrías complejas | Combine en 2-3 meshes grandes | -40% draw calls | Bajo |
| Partículas agua | Atmósfera | 300 simultáneas | Reduce a 100 + LOD | -60% fill-rate | Bajo |

## 5. Materiales y shaders (shaders livianos)

**Auditoría de materiales:**
- **Número únicos:** ~15 estimados (player, obstáculos, collectibles, environment) (SUPUESTO por variedad visible)
- **Parámetros:** Base color + normal maps suaves, roughness 0.3-0.6, metallic 0.0-0.2, emissive en glows
- **Transparencias:** Agua overlays + partículas, alpha blend sin sorting optimizado

**Recomendaciones de shaders "lite":**
- **Eliminar ramas:** No usar normal maps en móviles, specular solo en highlights
- **Limitar luces:** Máximo 2 luces por objeto, baked shadows donde posible
- **Alternativas stylized:** Toon shading simple (3 tones) en lugar de PBR completo

**Lista de "reglas anti-costo":**
- **Evitar transparencia:** Usar alpha clip para foliage, blend solo en VFX críticas
- **Alpha clip vs blend:** Clip para objetos sólidos translúcidos, blend para efectos
- **Controlar overdraw:** Partículas sorted, UI en separate pass, stencil masks para VFX

**Cambios concretos:**
- **Material player:** Cambiar de PBR a toon shader simple - reduce complexity 60%
- **Material agua:** Cambiar de blend a clip + normal scrolling - reduce overdraw 40%
- **Material glow:** Cambiar de emissive a additive particles - reduce shader instructions 50%

## 6. Texturas: tamaño, formatos, compresión y streaming

**Auditoría:**
- **Tamaños:** 512x512 para pequeños, 1024x1024 para grandes, 2048x2048 para backgrounds (SUPUESTO por resolución visible)
- **Canales:** Packed normals/roughness en RGB/A, emissive en separate donde necesario
- **Mipmaps:** Necesarios para LOD, anisotropy baja para performance

**Recomendaciones:**
- **Budgets:** Hero 1024x1024, props 512x512, backgrounds 2048x2048, VFX 256x256
- **Compresión/formatos:** WebP para color, ASTC 4x4 para móviles, fallbacks PNG
- **Atlases:** Combinar texturas similares para reducir materials/draw calls

**Tabla recomendada:**

| Categoría | Resolución objetivo | Mapas permitidos | Compresión | Notas |
|-----------|-------------------|------------------|------------|-------|
| Player/Hero | 1024x1024 | Diffuse + Normal + Roughness | ASTC 6x6 | 2 variants por color |
| Obstáculos/Props | 512x512 | Diffuse + Normal | ASTC 4x4 | Atlas de 2048x2048 |
| Environment | 2048x2048 | Diffuse + Normal + AO | ASTC 8x8 | Tiling seamless |
| UI/Collectibles | 256x256 | Diffuse + Emissive | ASTC 4x4 | Sprite sheets |
| VFX/Particles | 128x128 | Diffuse + Alpha | ASTC 4x4 | Compressed sprites |

## 7. Iluminación, atmósfera y postprocesado

**Diagnóstico de lighting:**
- **Baked vs realtime:** Mixto - environment baked, player realtime (SUPUESTO por sombras dinámicas)
- **Número luces:** 1-2 directional principales, sin point lights dinámicos
- **Sombras:** PCF soft shadows, resolución media para performance

**Atmósfera:**
- **Fog:** Exponencial azul profundo para underwater feel
- **Volumétricos:** Ausentes - oportunidad para god rays baratos
- **Color grading:** LUT simple para warmth en corales

**Postprocesado:**
- **Bloom:** High threshold para glows, radius controlado
- **Vignette:** Subtle para focus
- **DOF:** Ausente - oportunidad para shallow depth
- **SSAO:** Alto costo, considerar HBAO lite o disabled en móviles

**Propuesta "lighting bible":**
- **Temperaturas:** Cool blue 6500K key, warm coral 3000K fill
- **Ratio contraste:** 1:3 (key:fill) para profundidad sin harshness
- **Sombras:** Softness 0.5, bias ajustado para swimming feel
- **Presets:** "Shallow coral" vs "Deep ocean" por zona

## 8. LOD, culling y rendimiento gráfico en web/móvil

**Estrategia LOD:**
- **LOD0:** Full detail < 50m
- **LOD1:** Reduced polys + simplified materials 50-150m
- **LOD2:** Billboard sprites > 150m

**Culling:**
- **Frustum/occlusion:** Básico frustum, no occlusion culling avanzado
- **Distance culling:** Objetos > 200m desaparecen
- **Impostors:** Ausentes - sprites para performance máxima

**Móvil:**
- **Quality tiers:** Low (LOD agresivo, particulas 50), Med (LOD normal, particulas 100), High (full detail)
- **Dynamic resolution:** Target 720p en móviles, upscale si GPU permite

**Runtime budgets visuales:**
- **Tri count visible:** < 50K tris móviles, < 100K desktop
- **Materiales únicos:** < 10 en pantalla simultánea
- **Transparencias/partículas:** < 100 elementos, sorted por distancia
- **Resolución interna:** 1080p desktop, 720p móviles

## 9. Pipeline 3D y consistencia de producción

**Export pipeline:**
- **Naming:** AssetName_LOD0.fbx, MaterialName_Material.mat
- **Scale/orientation:** Y-up, 1 unit = 1 meter, pivots en base
- **Baking:** Normals + AO baked 2048, roughness/metal packed

**Propuesta estructura carpetas:**
```
Assets/
├── Characters/
│   ├── Player/
│   │   ├── Player_LOD0.fbx
│   │   ├── Player_LOD1.fbx
│   │   └── Materials/
├── Props/
│   ├── Obstacles/
│   └── Collectibles/
├── Environment/
│   ├── Coral_01.fbx
│   └── Ocean_Material.mat
└── Textures/
    ├── Atlases/
    └── Variants/
```

**Checklist por asset:**
- ✅ Tri budget < target
- ✅ Tex budget < 2048x2048
- ✅ Materials PBR valid
- ✅ UVs no overlap, 0-1 space
- ✅ LODs decreasing complexity
- ✅ Collision mesh simple
- ✅ Pivot en logical center

**Tooling recomendado:**
- **Scripts validación:** Python scripts para tri count, texture size, material params
- **Presets export:** Maya/Blender templates con settings optimizados
- **Guías:** "How to make a coral prop" con templates y limits

## 10. Roadmap Visual y Técnico (Alineado)

El plan de acción de arte y tech-art se integra en la estrategia de producto general, enfocándose primero en la estabilidad y luego en el pulido y la expansión.

### 🚀 FASE 1: FUNDACIÓN (Estabilización y Medición)
**Objetivo:** Contribuir a la meta de alcanzar un rendimiento estable de 55+ FPS en móviles.
- **Acciones:**
  - **Crear Assets para LODs (TASK-006):** Producir versiones low-poly de los obstáculos y el personaje principal para que ingeniería pueda implementar el sistema de Level of Detail.
  - **Optimizar Partículas (TASK-007):** Colaborar con ingeniería para reducir el número de partículas y optimizar sus shaders, asegurando que el impacto visual sea mínimo.
  - **Establecer Presupuestos de Performance:** Definir y documentar los budgets de polígonos, texturas y draw calls para todos los assets futuros.

### 🎯 FASE 2: RETENCIÓN (Diversión y Equidad)
**Objetivo:** Mejorar la claridad visual y la experiencia de usuario para que el juego sea más legible y atractivo.
- **Acciones:**
  - **Implementar Jerarquía Visual (Apoyo a TASK-022):**
    - Aplicar el **color coding** propuesto (rojo para peligros, amarillo para progreso).
    - Diseñar e implementar **outlines o shaders de silueta** para amenazas, mejorando su legibilidad contra el fondo.
    - Crear los **VFX (glows, sparkles)** para que los objetivos y coleccionables destaquen.
  - **Crear Atlas de Texturas:** Unificar texturas de props similares en atlases para reducir drásticamente los draw calls.
  - **Producir Assets para Nuevas Mecánicas:** Crear los modelos y texturas para el sistema de **Checkpoints (TASK-017)** y cualquier otro elemento de feedback visual requerido por diseño.

### 🌟 FASE 3: EXPANSIÓN (Profundidad y Contenido)
**Objetivo:** Pulir la estética del juego y crear el contenido visual para las nuevas features.
- **Acciones:**
  - **Implementar la "Lighting Bible":** Aplicar la guía de iluminación definida (key, fill, rim lights) para dar una identidad visual consistente y profesional a todos los niveles.
  - **Desarrollar Shaders Avanzados:** Implementar el **toon shader** para el personaje y otros shaders "lite" para optimizar y estilizar el juego.
  - **Crear Assets para el Sistema de Combate (TASK-021):** Diseñar y modelar proyectiles, impactos y nuevos enemigos.
  - **Diseñar Nuevos Biomas:** Expandir el universo visual con nuevos entornos que sigan la dirección de arte establecida pero ofrezcan variedad.

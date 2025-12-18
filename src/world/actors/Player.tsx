/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/features/game/state/store';
import { LANE_WIDTH, GameStatus } from '@/shared/types/types';
import { audio, audioEvents } from '@/systems/audio/AudioEngine';

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const tentaclesRef = useRef<THREE.Group>(null);

  const { status, laneCount, takeDamage, hasDoubleJump, activateImmortality, isImmortalityActive } = useStore();

  const [lane, setLane] = React.useState(0);
  const targetX = useRef(0);

  // Física
  const isJumping = useRef(false);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0);
  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  // --- GEOMETRÍAS PROCEDURALES (Estilo Toy Art) ---
  const geometries = useMemo(() => {
    return {
      body: new THREE.SphereGeometry(0.7, 32, 32),
      beanieDome: new THREE.SphereGeometry(0.71, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      beanieRim: new THREE.TorusGeometry(0.65, 0.12, 12, 32),
      glassFrame: new THREE.CapsuleGeometry(0.18, 0.3, 4, 16),
      glassBridge: new THREE.CapsuleGeometry(0.05, 0.1, 4, 8),
      tentacle: new THREE.CapsuleGeometry(0.15, 0.6, 4, 12),
      shadow: new THREE.CircleGeometry(0.6, 32),
      anchorRing: new THREE.TorusGeometry(0.08, 0.02, 8, 16),
      anchorBar: new THREE.CapsuleGeometry(0.02, 0.15, 4, 8)
    };
  }, []);

  // --- MATERIALES (Paleta del Logo) ---
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: '#8ab4f8', // Azul claro plástico
        roughness: 0.1,
        metalness: 0.2,
      }),
      beanie: new THREE.MeshStandardMaterial({
        color: '#bfdbfe', // Azul muy claro
        roughness: 0.5,
      }),
      glasses: new THREE.MeshStandardMaterial({
        color: '#1e3a8a', // Azul oscuro
        roughness: 0.1,
        metalness: 0.5,
      }),
      ink: new THREE.MeshBasicMaterial({
        color: '#1e3a8a',
        transparent: true,
        opacity: 0.6
      }),
      invincible: new THREE.MeshStandardMaterial({
        color: '#ffd700',
        emissive: '#ffaa00',
        roughness: 0.1,
      }),
      shadow: new THREE.MeshBasicMaterial({
        color: '#000000',
        opacity: 0.3,
        transparent: true
      })
    };
  }, []);

  // Lógica de Salto
  const triggerJump = () => {
    const maxJumps = hasDoubleJump ? 2 : 1;
    if (!isJumping.current) {
        audioEvents.playJump();
        isJumping.current = true;
        jumpsPerformed.current = 1;
        velocityY.current = 14;
    } else if (jumpsPerformed.current < maxJumps) {
        audioEvents.playJump();
        jumpsPerformed.current = 1;
        velocityY.current = 14;
    }
  };

  // Controles (Teclado + Táctil)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      const maxLane = Math.floor(laneCount / 2);
      if (e.key === 'ArrowLeft') setLane(l => Math.max(l - 1, -maxLane));
      else if (e.key === 'ArrowRight') setLane(l => Math.min(l + 1, maxLane));
      else if (e.key === 'ArrowUp' || e.key === 'w') triggerJump();
      else if (e.key === ' ' || e.key === 'Enter') activateImmortality();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, laneCount, hasDoubleJump, activateImmortality]);

  // Controles Táctiles para Móvil
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const SWIPE_THRESHOLD = 30; // píxeles mínimos para swipe
    const TAP_THRESHOLD = 200; // ms máximo para tap

    const handleTouchStart = (e: TouchEvent) => {
      if (status !== GameStatus.PLAYING) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (status !== GameStatus.PLAYING) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const elapsed = Date.now() - touchStartTime;

      const maxLane = Math.floor(laneCount / 2);

      // Detectar swipe hacia arriba para saltar
      if (deltaY < -SWIPE_THRESHOLD && Math.abs(deltaX) < Math.abs(deltaY)) {
        triggerJump();
        return;
      }

      // Detectar swipe horizontal para cambiar carril
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          setLane(l => Math.max(l - 1, -maxLane));
        } else {
          setLane(l => Math.min(l + 1, maxLane));
        }
        return;
      }

      // Tap rápido: lado izquierdo/derecho de pantalla para mover
      if (elapsed < TAP_THRESHOLD && Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
        const screenWidth = window.innerWidth;
        const tapX = touch.clientX;

        // División en 3 zonas: izquierda, centro, derecha
        if (tapX < screenWidth * 0.33) {
          // Tap izquierdo - mover a la izquierda
          setLane(l => Math.max(l - 1, -maxLane));
        } else if (tapX > screenWidth * 0.66) {
          // Tap derecho - mover a la derecha
          setLane(l => Math.min(l + 1, maxLane));
        } else {
          // Tap centro - saltar
          triggerJump();
        }
      }
    };

    // Doble tap para habilidad especial
    let lastTapTime = 0;
    const handleDoubleTap = (e: TouchEvent) => {
      if (status !== GameStatus.PLAYING) return;
      const now = Date.now();
      if (now - lastTapTime < 300) {
        activateImmortality();
      }
      lastTapTime = now;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchend', handleDoubleTap, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchend', handleDoubleTap);
    };
  }, [status, laneCount, hasDoubleJump, activateImmortality]);

  // Bucle de Animación
  useFrame((state, delta) => {
    if (!groupRef.current || !bodyGroupRef.current) return;
    if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP) return;

    // 1. Movimiento Lateral
    targetX.current = lane * LANE_WIDTH;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX.current, delta * 15);

    // 2. Física de Salto
    if (isJumping.current) {
      groupRef.current.position.y += velocityY.current * delta;
      velocityY.current -= 35 * delta;
      if (groupRef.current.position.y <= 0) {
        groupRef.current.position.y = 0;
        isJumping.current = false;
        window.dispatchEvent(new Event('player-land'));
      }
    }

    // 3. Animaciones de "Calamar"
    const time = state.clock.elapsedTime;

    // Squash & Stretch
    const wobble = Math.sin(time * 10) * 0.05;
    bodyGroupRef.current.scale.set(1 + wobble, 1 - wobble, 1 + wobble);
    bodyGroupRef.current.position.y = 0.8 + Math.sin(time * 5) * 0.05;

    // Tentáculos
    if (tentaclesRef.current) {
      tentaclesRef.current.children.forEach((t, i) => {
        t.rotation.x = Math.sin(time * 8 + i) * 0.4;
        t.rotation.z = Math.cos(time * 5 + i) * 0.3;
      });
    }

    // Sombra
    if (shadowRef.current) {
      const h = groupRef.current.position.y;
      const s = Math.max(0.3, 1 - h * 0.4);
      shadowRef.current.scale.setScalar(s);
    }

    // Feedback de Daño
    if (isInvincible.current) {
      groupRef.current.visible = Math.floor(Date.now() / 50) % 2 === 0;
      if (Date.now() - lastDamageTime.current > 1500) isInvincible.current = false;
    } else {
      groupRef.current.visible = true;
    }
  });

  useEffect(() => {
    const onHit = () => {
      if (isInvincible.current || isImmortalityActive) return;
      takeDamage();
      isInvincible.current = true;
      lastDamageTime.current = Date.now();
      audioEvents.playDamage();
    };
    window.addEventListener('player-hit', onHit);
    return () => window.removeEventListener('player-hit', onHit);
  }, [takeDamage, isImmortalityActive]);

  // Cleanup geometries and materials on unmount
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach(geo => geo.dispose());
      Object.values(materials).forEach(mat => mat.dispose());
    };
  }, [geometries, materials]);

  const activeSkin = isImmortalityActive ? materials.invincible : materials.skin;

  return (
    <group ref={groupRef}>
      <group ref={bodyGroupRef} position={[0, 0.8, 0]}>

        {/* CUERPO */}
        <mesh geometry={geometries.body} material={activeSkin} castShadow />

        {/* GORRO (BEANIE) */}
        <group position={[0, 0.35, 0]} rotation={[-0.1, 0, 0]}>
          <mesh geometry={geometries.beanieDome} material={materials.beanie} />
          <mesh geometry={geometries.beanieRim} material={materials.beanie} rotation={[Math.PI/2, 0, 0]} position={[0, 0.05, 0]} />
        </group>

        {/* GAFAS */}
        <group position={[0, 0.15, 0.55]}>
          <mesh position={[0.25, 0, 0]} geometry={geometries.glassFrame} material={materials.glasses} />
          <mesh position={[-0.25, 0, 0]} geometry={geometries.glassFrame} material={materials.glasses} />
          <mesh rotation={[0, 0, Math.PI/2]} geometry={geometries.glassBridge} material={materials.glasses} />
        </group>

        {/* TATUAJE ANCLA */}
        <group position={[0.5, -0.2, 0.3]} rotation={[0, 0.8, 0]} scale={[0.8, 0.8, 0.8]}>
          <mesh geometry={geometries.anchorRing} material={materials.ink} />
          <mesh position={[0, -0.1, 0]} geometry={geometries.anchorBar} material={materials.ink} />
        </group>

        {/* TENTÁCULOS */}
        <group ref={tentaclesRef} position={[0, -0.4, 0]}>
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                geometry={geometries.tentacle}
                material={activeSkin}
                position={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}
                rotation={[0.5, angle, 0]}
              />
            );
          })}
        </group>

      </group>

      {/* SOMBRA */}
      <mesh ref={shadowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometries.shadow} material={materials.shadow} />
    </group>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';
import { audio } from '../System/Audio';

// --- GEOMETRÍAS PROCEDURALES (Estilo Toy Art) ---
const BODY_GEO = new THREE.SphereGeometry(0.7, 32, 32);
const BEANIE_DOME_GEO = new THREE.SphereGeometry(0.71, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
const BEANIE_RIM_GEO = new THREE.TorusGeometry(0.65, 0.12, 12, 32);

const GLASS_FRAME_GEO = new THREE.CapsuleGeometry(0.18, 0.3, 4, 16);
const GLASS_BRIDGE_GEO = new THREE.CapsuleGeometry(0.05, 0.1, 4, 8);

const TENTACLE_GEO = new THREE.CapsuleGeometry(0.15, 0.6, 4, 12);
const SHADOW_GEO = new THREE.CircleGeometry(0.6, 32);

// Detalles del Tatuaje (Ancla)
const ANCHOR_RING_GEO = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
const ANCHOR_BAR_GEO = new THREE.CapsuleGeometry(0.02, 0.15, 4, 8);

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
        audio.playJump(false);
        isJumping.current = true;
        jumpsPerformed.current = 1;
        velocityY.current = 14;
    } else if (jumpsPerformed.current < maxJumps) {
        audio.playJump(true);
        jumpsPerformed.current += 1;
        velocityY.current = 14; 
    }
  };

  // Controles
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
      audio.playDamage();
    };
    window.addEventListener('player-hit', onHit);
    return () => window.removeEventListener('player-hit', onHit);
  }, [takeDamage, isImmortalityActive]);

  const activeSkin = isImmortalityActive ? materials.invincible : materials.skin;

  return (
    <group ref={groupRef}>
      <group ref={bodyGroupRef} position={[0, 0.8, 0]}>
        
        {/* CUERPO */}
        <mesh geometry={BODY_GEO} material={activeSkin} castShadow />

        {/* GORRO (BEANIE) */}
        <group position={[0, 0.35, 0]} rotation={[-0.1, 0, 0]}>
          <mesh geometry={BEANIE_DOME_GEO} material={materials.beanie} />
          <mesh geometry={BEANIE_RIM_GEO} material={materials.beanie} rotation={[Math.PI/2, 0, 0]} position={[0, 0.05, 0]} />
        </group>

        {/* GAFAS */}
        <group position={[0, 0.15, 0.55]}>
          <mesh position={[0.25, 0, 0]} geometry={GLASS_FRAME_GEO} material={materials.glasses} />
          <mesh position={[-0.25, 0, 0]} geometry={GLASS_FRAME_GEO} material={materials.glasses} />
          <mesh rotation={[0, 0, Math.PI/2]} geometry={GLASS_BRIDGE_GEO} material={materials.glasses} />
        </group>

        {/* TATUAJE ANCLA */}
        <group position={[0.5, -0.2, 0.3]} rotation={[0, 0.8, 0]} scale={[0.8, 0.8, 0.8]}>
          <mesh geometry={ANCHOR_RING_GEO} material={materials.ink} />
          <mesh position={[0, -0.1, 0]} geometry={ANCHOR_BAR_GEO} material={materials.ink} />
        </group>

        {/* TENTÁCULOS */}
        <group ref={tentaclesRef} position={[0, -0.4, 0]}>
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh 
                key={i} 
                geometry={TENTACLE_GEO} 
                material={activeSkin} 
                position={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}
                rotation={[0.5, angle, 0]}
              />
            );
          })}
        </group>

      </group>

      {/* SOMBRA */}
      <mesh ref={shadowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHADOW_GEO} material={materials.shadow} />
    </group>
  );
};


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH } from '../../types';

// --- ELEMENTOS DECORATIVOS: PALMERAS MEJORADAS ---
const PalmTree: React.FC<{ position: [number, number, number], scale: number, rotationY: number }> = ({ position, scale, rotationY }) => {
    const trunkRef = useRef<THREE.Group>(null);
    const leavesRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (trunkRef.current) {
            trunkRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
        }
        if (leavesRef.current) {
            leavesRef.current.rotation.y += 0.001;
        }
    });

    // Creamos las hojas una sola vez
    const leaves = useMemo(() => {
        const leafItems = [];
        const leafCount = 8;
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            leafItems.push({
                rotation: [0.4, angle, 0], // Inclinación hacia abajo + rotación circular
                position: [Math.sin(angle) * 1.5, -0.2, Math.cos(angle) * 1.5],
                scale: [0.8 + Math.random() * 0.4, 1, 1]
            });
        }
        return leafItems;
    }, []);

    return (
        <group position={position} scale={[scale, scale, scale]} rotation={[0, rotationY, 0]} ref={trunkRef}>
            {/* Tronco con textura de anillos */}
            <mesh position={[0, 2.5, 0]}>
                <cylinderGeometry args={[0.25, 0.4, 5, 10]} />
                <meshStandardMaterial color="#5d3a1a" roughness={1} />
            </mesh>
            
            {/* Corona de Hojas (Frondosa) */}
            <group position={[0, 5, 0]} ref={leavesRef}>
                {leaves.map((leaf, i) => (
                    <mesh 
                        key={i} 
                        rotation={leaf.rotation as any} 
                        position={leaf.position as any}
                        scale={leaf.scale as any}
                    >
                        <boxGeometry args={[0.7, 0.05, 3]} />
                        <meshStandardMaterial color="#1b4d1a" roughness={0.8} />
                    </mesh>
                ))}
                {/* Centro de la palmera */}
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.4, 8, 8]} />
                    <meshStandardMaterial color="#2d5a27" />
                </mesh>
            </group>
        </group>
    );
};

// --- GAVIOTAS ---
const Seagulls: React.FC = () => {
    const count = 5;
    const groupRef = useRef<THREE.Group>(null);
    const speed = useStore(state => state.speed);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const activeSpeed = speed > 0 ? speed : 10;
        groupRef.current.children.forEach((bird, i) => {
            bird.position.z += (activeSpeed * 0.2 + i) * delta;
            if (bird.position.z > 20) bird.position.z = -180 - Math.random() * 50;
            
            const wingL = bird.children[1] as THREE.Mesh;
            const wingR = bird.children[2] as THREE.Mesh;
            const flap = Math.sin(state.clock.elapsedTime * 10 + i) * 0.5;
            wingL.rotation.z = flap;
            wingR.rotation.z = -flap;
        });
    });

    return (
        <group ref={groupRef}>
            {[...Array(count)].map((_, i) => (
                <group key={i} position={[(Math.random() - 0.5) * 50, 15 + Math.random() * 5, -50 - i * 40]}>
                    <mesh><boxGeometry args={[0.5, 0.1, 0.1]} /><meshBasicMaterial color="white" /></mesh>
                    <mesh position={[-0.3, 0, 0]}><boxGeometry args={[0.6, 0.02, 0.2]} /><meshBasicMaterial color="white" /></mesh>
                    <mesh position={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.02, 0.2]} /><meshBasicMaterial color="white" /></mesh>
                </group>
            ))}
        </group>
    );
};

// --- ISLAS DISTANTES ---
const DistantIslands: React.FC = () => {
    return (
        <group position={[0, -8, -350]}>
            {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[(i - 2) * 120, 0, 0]} rotation={[0, Math.random(), 0]}>
                    <coneGeometry args={[60, 25, 4]} />
                    <meshStandardMaterial color="#0e3d0e" />
                </mesh>
            ))}
        </group>
    );
};

const Clouds: React.FC = () => {
  const speed = useStore(state => state.speed);
  const count = 10; 
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
      return new Array(count).fill(0).map(() => ({
          x: (Math.random() - 0.5) * 500,
          y: 35 + Math.random() * 20,
          z: -100 - Math.random() * 500,
          scale: 30 + Math.random() * 40,
          speed: 0.05 + Math.random() * 0.1
      }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const activeSpeed = speed > 0 ? speed : 5;
    particles.forEach((p, i) => {
        p.z += (activeSpeed * 0.04 + p.speed) * delta;
        if (p.z > 150) p.z = -600;
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
    </instancedMesh>
  );
};

const SandTracks: React.FC = () => {
    const { laneCount, speed } = useStore();
    const palmTrees = useMemo(() => {
        return new Array(14).fill(0).map((_, i) => ({
            z: -i * 40,
            side: i % 2 === 0 ? 1 : -1,
            scale: 1.2 + Math.random() * 0.4,
            rot: Math.random() * Math.PI
        }));
    }, []);

    const [trees, setTrees] = useState(palmTrees);

    useFrame((state, delta) => {
        const activeSpeed = speed > 0 ? speed : 10;
        setTrees(prev => prev.map(t => {
            let newZ = t.z + activeSpeed * delta;
            if (newZ > 50) newZ = -500;
            return { ...t, z: newZ };
        }));
    });
    
    return (
        <group>
            {/* Arena Principal: Pista de nado elevada */}
            <mesh position={[0, 0, -250]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[laneCount * LANE_WIDTH + 20, 700]} />
                <meshStandardMaterial color="#f3d9b1" roughness={1} />
            </mesh>

            {/* Palmeras laterales: Más alejadas del centro para no interferir */}
            {trees.map((t, i) => (
                <PalmTree 
                    key={i} 
                    position={[t.side * (laneCount * LANE_WIDTH / 2 + 12), -0.2, t.z]} 
                    scale={t.scale}
                    rotationY={t.rot}
                />
            ))}
        </group>
    );
};

const Ocean: React.FC = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#0284c7') }, 
        uFoamColor: { value: new THREE.Color('#e0f2fe') }
    }), []);

    return (
        // Océano bajado a -3.0 para asegurar que no cubra la arena
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.0, -200]}>
            <planeGeometry args={[3000, 3000, 40, 40]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={`
                    varying vec2 vUv;
                    uniform float uTime;
                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        // Olas suaves con amplitud máxima de 1.0
                        float wave = sin(pos.x * 0.01 + uTime * 0.7) * 0.5 + cos(pos.y * 0.01 + uTime * 0.5) * 0.5;
                        pos.z += wave;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `}
                fragmentShader={`
                    varying vec2 vUv;
                    uniform float uTime;
                    uniform vec3 uColor;
                    uniform vec3 uFoamColor;
                    void main() {
                        float noise = sin(vUv.x * 120.0 + uTime) * cos(vUv.y * 120.0 + uTime);
                        vec3 color = mix(uColor, uFoamColor, smoothstep(0.9, 1.0, noise));
                        float dist = length(vUv - 0.5);
                        color = mix(color, vec3(0.0, 0.1, 0.3), dist * 0.8);
                        gl_FragColor = vec4(color, 1.0);
                    }
                `}
            />
        </mesh>
    );
};

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#bae6fd']} />
      <fog attach="fog" args={['#bae6fd', 80, 300]} />
      
      <ambientLight intensity={1.0} />
      <directionalLight 
        position={[100, 150, 100]} 
        intensity={1.5} 
        color="#fffceb" 
        castShadow 
      />

      {/* Domo de cielo inmenso */}
      <mesh position={[0, 0, -400]}>
        <sphereGeometry args={[600, 32, 16]} />
        <meshBasicMaterial color="#7dd3fc" side={THREE.BackSide} />
      </mesh>

      {/* Sol Tropical */}
      <group position={[0, 70, -350]}>
        <mesh>
            <sphereGeometry args={[40, 32, 32]} />
            <meshBasicMaterial color="#fffbe6" />
        </mesh>
        <pointLight intensity={3} distance={800} color="#fff1a1" />
      </group>

      <Ocean />
      <SandTracks />
      <DistantIslands />
      <Clouds />
      <Seagulls />
    </>
  );
};

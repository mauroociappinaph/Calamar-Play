/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text3D, Center, Float } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/features/game/state/store';
import { checkpointManager } from '@/features/game/state/checkpoints';
import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus, GEMINI_COLORS } from '@/shared/types/types';
import { audio } from '@/systems/audio/AudioEngine';
import { ObjectPool } from '@/systems/pooling/ObjectPool';
import { FixedTimestepLoop, InputState } from '@/systems/core/FixedTimestepLoop';
import { Tronco, ForcedTronco } from '@/world/obstacles/Tronco';

// Geometry Constants
const OBSTACLE_HEIGHT = 1.6;
const OBSTACLE_GEOMETRY = new THREE.CylinderGeometry(0.5, 0.5, OBSTACLE_HEIGHT, 8); // Driftwood style
const OBSTACLE_TOP_GEO = new THREE.ConeGeometry(0.5, 0.5, 8); // Top of stump

const GEM_GEOMETRY = new THREE.IcosahedronGeometry(0.3, 0);

// Shark/Enemy Geometries
const ALIEN_BODY_GEO = new THREE.ConeGeometry(0.4, 1.2, 8); // Shark fin-ish shape
const ALIEN_EYE_GEO = new THREE.SphereGeometry(0.1);

const MISSILE_CORE_GEO = new THREE.SphereGeometry(0.3, 8, 8); // Bubble missile

// Shadow Geometries
const SHADOW_LETTER_GEO = new THREE.PlaneGeometry(2, 0.6);
const SHADOW_GEM_GEO = new THREE.CircleGeometry(0.6, 32);
const SHADOW_ALIEN_GEO = new THREE.CircleGeometry(0.8, 32);
const SHADOW_DEFAULT_GEO = new THREE.CircleGeometry(0.8, 6);

// Shop Geometries (Tiki Hut style)
const SHOP_FRAME_GEO = new THREE.BoxGeometry(1, 7, 1);
const SHOP_BACK_GEO = new THREE.BoxGeometry(1, 5, 1.2);
const SHOP_ROOF_GEO = new THREE.ConeGeometry(3.5, 2, 4); // Roof

const PARTICLE_COUNT = 300;
const BASE_LETTER_INTERVAL = 150;

const getLetterInterval = (level: number) => {
    return BASE_LETTER_INTERVAL * Math.pow(1.2, Math.max(0, level - 1)); // Slightly less scaling due to longer word
};

const MISSILE_SPEED = 30;

// Font for 3D Text
const FONT_URL = "https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json";

// --- Particle System (Bubbles) ---
const ParticleSystem: React.FC = () => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => new Array(PARTICLE_COUNT).fill(0).map(() => ({
        life: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        scale: 1
    })), []);

    useEffect(() => {
        const handleExplosion = (e: CustomEvent) => {
            const { position } = e.detail;
            let spawned = 0;
            const burstAmount = 30;

            for(let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                if (p.life <= 0) {
                    p.life = 1.0 + Math.random();
                    p.pos.set(position[0], position[1], position[2]);

                    p.vel.set(
                        (Math.random() - 0.5) * 5,
                        (Math.random() * 5),
                        (Math.random() - 0.5) * 5
                    );
                    p.scale = Math.random() * 0.5 + 0.2;
                    spawned++;
                    if (spawned >= burstAmount) break;
                }
            }
        };

        window.addEventListener('particle-burst', handleExplosion as any);
        return () => window.removeEventListener('particle-burst', handleExplosion as any);
    }, [particles]);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        const safeDelta = Math.min(delta, 0.1);

        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= safeDelta;
                p.pos.addScaledVector(p.vel, safeDelta);
                p.vel.y += safeDelta * 2; // Bubbles float up
                p.vel.multiplyScalar(0.95);

                dummy.position.copy(p.pos);
                const s = p.life * p.scale;
                dummy.scale.set(s, s, s);
                dummy.updateMatrix();

                mesh.current!.setMatrixAt(i, dummy.matrix);
            } else {
                dummy.scale.set(0,0,0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#aaddff" transparent opacity={0.6} />
        </instancedMesh>
    );
};


const getRandomLane = (laneCount: number) => {
    const max = Math.floor(laneCount / 2);
    return Math.floor(Math.random() * (max * 2 + 1)) - max;
};

// --- Object Pooling for Level Objects ---
const gameObjectPool = new ObjectPool<GameObject>(
    () => ({
        id: uuidv4(),
        type: ObjectType.OBSTACLE,
        position: [0, 0, 0],
        active: false
    }),
    (obj) => {
        // Reset state for reuse
        obj.active = false;
        obj.value = undefined;
        obj.targetIndex = undefined;
        obj.points = undefined;
        obj.hasFired = undefined;
        // reuse the same ID to avoid generating new UUIDs
    },
    50, // Initial size
    500 // Max size
);

export const LevelManager: React.FC = () => {
  const {
    status,
    speed,
    collectGem,
    collectLetter,
    collectedLetters,
    laneCount,
    setDistance,
    openShop,
    level,
    createCheckpoint
  } = useStore();

  const objectsRef = useRef<GameObject[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  const prevLevel = useRef(level);

  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const distanceTraveled = useRef(0);
  const nextLetterDistance = useRef(BASE_LETTER_INTERVAL);

  // Fixed timestep loop instance
  const fixedLoopRef = useRef<FixedTimestepLoop>(new FixedTimestepLoop(1/60, 0.25));

  // Fixed update callback - contains all game logic that needs to run at fixed timestep
  const fixedUpdateCallback = useCallback((deltaTime: number) => {
    if (status !== GameStatus.PLAYING) return;

    const dist = speed * deltaTime;
    distanceTraveled.current += dist;

    // Try to create checkpoint at regular intervals
    createCheckpoint({
      objects: objectsRef.current,
      distanceTraveled: distanceTraveled.current,
      nextLetterDistance: nextLetterDistance.current
    });

    let hasChanges = false;
    let playerPos = new THREE.Vector3(0, 0, 0);

    if (playerObjRef.current) {
        playerObjRef.current.getWorldPosition(playerPos);
    }

    const currentObjects = objectsRef.current;
    const keptObjects: GameObject[] = [];
    const newSpawns: GameObject[] = [];

    for (const obj of currentObjects) {
        let moveAmount = dist;

        if (obj.type === ObjectType.MISSILE) {
            moveAmount += MISSILE_SPEED * deltaTime;
        }

        const prevZ = obj.position[2];
        obj.position[2] += moveAmount;

        if (obj.type === ObjectType.ALIEN && obj.active && !obj.hasFired) {
             if (obj.position[2] > -90) {
                 obj.hasFired = true;

                 const missile = gameObjectPool.acquire();
                 missile.type = ObjectType.MISSILE;
                 missile.position[0] = obj.position[0];
                 missile.position[1] = 1.0;
                 missile.position[2] = obj.position[2] + 2;
                 missile.active = true;
                 missile.color = '#ffffff';

                 newSpawns.push(missile);
                 hasChanges = true;
             }
        }

        let keep = true;
        if (obj.active) {
            const zThreshold = 2.0;
            const inZZone = (prevZ < playerPos.z + zThreshold) && (obj.position[2] > playerPos.z - zThreshold);

            if (obj.type === ObjectType.SHOP_PORTAL) {
                const dz = Math.abs(obj.position[2] - playerPos.z);
                if (dz < 2) {
                     openShop();
                     obj.active = false;
                     hasChanges = true;
                     keep = false;
                }
            } else if (inZZone) {
                const dx = Math.abs(obj.position[0] - playerPos.x);
                if (dx < 0.9) {
                     const isDamageSource = obj.type === ObjectType.OBSTACLE || obj.type === ObjectType.ALIEN || obj.type === ObjectType.MISSILE;

                     if (isDamageSource) {
                         const playerBottom = playerPos.y;
                         const playerTop = playerPos.y + 1.2;

                         let objBottom = obj.position[1] - 0.5;
                         let objTop = obj.position[1] + 0.5;

                         if (obj.type === ObjectType.OBSTACLE) {
                             objBottom = 0;
                             objTop = OBSTACLE_HEIGHT;
                         } else if (obj.type === ObjectType.MISSILE) {
                             objBottom = 0.5;
                             objTop = 1.5;
                         }

                         const isHit = (playerBottom < objTop) && (playerTop > objBottom);

                         if (isHit) {
                             window.dispatchEvent(new Event('player-hit'));
                             obj.active = false;
                             hasChanges = true;

                             if (obj.type === ObjectType.MISSILE) {
                                window.dispatchEvent(new CustomEvent('particle-burst', {
                                    detail: { position: obj.position, color: '#ffffff' }
                                }));
                             }
                         }
                     } else {
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         if (dy < 2.5) {
                            if (obj.type === ObjectType.GEM) {
                                collectGem(obj.points || 50);
                                audio.playGemCollect();
                            }
                            if (obj.type === ObjectType.LETTER && obj.targetIndex !== undefined) {
                                collectLetter(obj.targetIndex);
                                audio.playLetterCollect();
                            }

                            window.dispatchEvent(new CustomEvent('particle-burst', {
                                detail: {
                                    position: obj.position,
                                    color: obj.color || '#ffffff'
                                }
                            }));

                            obj.active = false;
                            hasChanges = true;
                         }
                     }
                }
            }
        }

        if (obj.position[2] > REMOVE_DISTANCE) {
            keep = false;
            hasChanges = true;
        }

        if (keep) {
            keptObjects.push(obj);
        } else {
            console.log('POOL RELEASE:', gameObjectPool.getStats(), 'obj id:', obj.id, 'type:', obj.type, 'active:', obj.active, 'position:', obj.position, 'frame:', performance.now());
            gameObjectPool.release(obj);
            console.log('POOL AFTER RELEASE:', gameObjectPool.getStats());
        }
    }

    if (newSpawns.length > 0) {
        keptObjects.push(...newSpawns);
    }

    let furthestZ = 0;
    const staticObjects = keptObjects.filter(o => o.type !== ObjectType.MISSILE);

    if (staticObjects.length > 0) {
        furthestZ = Math.min(...staticObjects.map(o => o.position[2]));
    } else {
        furthestZ = -100; // Initialize to trigger initial spawn
    }

    if (furthestZ > -SPAWN_DISTANCE) {
         const minGap = 12 + (speed * 0.4);
         const spawnZ = Math.min(furthestZ - minGap, -SPAWN_DISTANCE);

         console.log('DEBUG SPAWN: Spawning logic triggered, furthestZ:', furthestZ, 'spawnZ:', spawnZ);

         const isLetterDue = distanceTraveled.current >= nextLetterDistance.current;

         console.log('DEBUG SPAWN: isLetterDue:', isLetterDue, 'distanceTraveled:', distanceTraveled.current, 'nextLetterDistance:', nextLetterDistance.current);

         if (isLetterDue) {
             const lane = getRandomLane(laneCount);
             // CALAMARLOCO
             const target = ['C', 'A', 'L', 'A', 'M', 'A', 'R', 'L', 'O', 'C', 'O'];

             // Simple sequential logic for multi-repeating letters
             const availableIndices = target.map((_, i) => i).filter(i => !collectedLetters.includes(i));

             if (availableIndices.length > 0) {
                 // Prioritize earliest uncollected letter to help spelling "C-A-L..." naturally,
                 // though random pickup is also fine. Let's do random.
                 const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                 const val = target[chosenIndex];
                 const color = GEMINI_COLORS[chosenIndex];

                 keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.LETTER,
                    position: [lane * LANE_WIDTH, 1.0, spawnZ],
                    active: true,
                    color: color,
                    value: val,
                    targetIndex: chosenIndex
                 });

                 nextLetterDistance.current += getLetterInterval(level);
                 hasChanges = true;
             } else {
                keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.GEM,
                    position: [lane * LANE_WIDTH, 1.2, spawnZ],
                    active: true,
                    color: '#ffffff',
                    points: 50
                });
                hasChanges = true;
             }

         } else if (Math.random() > 0.1) {
            const spawnRandom = Math.random();
            console.log('DEBUG SPAWN: Attempting spawn, spawnRandom:', spawnRandom, 'threshold: 0.1, will spawn:', spawnRandom > 0.1);

            const randomValue = Math.random();
            const isObstacle = randomValue > 0.5; // TEMP: Increased from 0.20 to 0.5 for testing
            console.log('DEBUG SPAWN: Spawning branch entered, randomValue:', randomValue, 'isObstacle:', isObstacle);

            if (isObstacle) {
                const spawnAlien = level >= 2 && Math.random() < 0.2;

                if (spawnAlien) {
                    const availableLanes = [];
                    const maxLane = Math.floor(laneCount / 2);
                    for (let i = -maxLane; i <= maxLane; i++) availableLanes.push(i);
                    availableLanes.sort(() => Math.random() - 0.5);

                    let alienCount = 1;
                    if (Math.random() > 0.7) alienCount = Math.min(2, availableLanes.length);

                    for (let k = 0; k < alienCount; k++) {
                        const lane = availableLanes[k];
                        const alienObj = gameObjectPool.acquire();
                        console.log('POOL ACQUIRE ALIEN:', gameObjectPool.getStats(), 'frame:', performance.now());
                        alienObj.type = ObjectType.ALIEN;
                        alienObj.position[0] = lane * LANE_WIDTH;
                        alienObj.position[1] = 1.5;
                        alienObj.position[2] = spawnZ;
                        alienObj.active = true;
                        alienObj.color = '#00ff00';
                        alienObj.hasFired = false;

                        keptObjects.push(alienObj);
                        console.log('SPAWN ALIEN', alienObj.id, alienObj.position, alienObj.active);
                        console.log('POOL AFTER ACQUIRE ALIEN:', gameObjectPool.getStats());
                    }
                } else {
                    const availableLanes = [];
                    const maxLane = Math.floor(laneCount / 2);
                    for (let i = -maxLane; i <= maxLane; i++) availableLanes.push(i);
                    availableLanes.sort(() => Math.random() - 0.5);

                    let countToSpawn = 1;
                    const p = Math.random();

                    if (p > 0.80) {
                        countToSpawn = Math.min(3, availableLanes.length);
                    } else if (p > 0.50) {
                        countToSpawn = Math.min(2, availableLanes.length);
                    }

                    for (let i = 0; i < countToSpawn; i++) {
                        const lane = availableLanes[i];
                        const laneX = lane * LANE_WIDTH;

                        const obstacleObj = gameObjectPool.acquire();
                        console.log('POOL ACQUIRE OBSTACLE:', gameObjectPool.getStats(), 'frame:', performance.now());
                        obstacleObj.type = ObjectType.OBSTACLE;
                        obstacleObj.position[0] = laneX;
                        obstacleObj.position[1] = OBSTACLE_HEIGHT / 2;
                        obstacleObj.position[2] = spawnZ;
                        obstacleObj.active = true;
                        obstacleObj.color = '#8b4513';

                        console.log('SPAWN TRONCO', obstacleObj.id, obstacleObj.position, obstacleObj.active);
                        console.log('DEBUG SPAWN: Created obstacle at lane', lane, 'position', laneX, spawnZ);
                        keptObjects.push(obstacleObj);
                        console.log('POOL AFTER ACQUIRE OBSTACLE:', gameObjectPool.getStats());

                        if (Math.random() < 0.3) {
                             const extraGem = gameObjectPool.acquire();
                             extraGem.type = ObjectType.GEM;
                             extraGem.position[0] = laneX;
                             extraGem.position[1] = OBSTACLE_HEIGHT + 1.0;
                             extraGem.position[2] = spawnZ;
                             extraGem.active = true;
                             extraGem.color = '#ffffff';
                             extraGem.points = 100;

                             keptObjects.push(extraGem);
                        }
                    }
                }

            } else {
                const lane = getRandomLane(laneCount);
                keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.GEM,
                    position: [lane * LANE_WIDTH, 1.2, spawnZ],
                    active: true,
                    color: '#ffffff',
                    points: 50
                });
            }
            hasChanges = true;
         }
    }

    if (hasChanges) {
        objectsRef.current = keptObjects;
        setRenderTrigger(t => t + 1);
    }
  }, [status, speed, collectGem, collectLetter, collectedLetters, laneCount, openShop, level]);

  // Render callback - only handles visual interpolation
  const renderCallback = useCallback((interpolationAlpha: number) => {
    // Visual interpolation can be added here if needed
    // For now, objects are updated directly in fixed update
    setRenderTrigger(t => t + 1);
  }, []);

  // Set up fixed timestep callbacks
  useEffect(() => {
    fixedLoopRef.current.setFixedUpdateCallback(fixedUpdateCallback);
    fixedLoopRef.current.setRenderCallback(renderCallback);
  }, [fixedUpdateCallback, renderCallback]);

  // Handle status changes to start/stop loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      fixedLoopRef.current.start();
    } else {
      fixedLoopRef.current.pause();
    }
  }, [status]);

  // Handle resets and transitions
  useEffect(() => {
    const isRestart = status === GameStatus.PLAYING && prevStatus.current === GameStatus.GAME_OVER;
    const isMenuReset = status === GameStatus.MENU;
    const isLevelUp = level !== prevLevel.current && status === GameStatus.PLAYING;
    const isVictoryReset = status === GameStatus.PLAYING && prevStatus.current === GameStatus.VICTORY;

    if (isMenuReset || isRestart || isVictoryReset) {
        // Clear objects for fresh start - spawn will provide initial objects
        objectsRef.current = [];
        setRenderTrigger(t => t + 1);

        distanceTraveled.current = 0;
        nextLetterDistance.current = getLetterInterval(1);

        // Clear checkpoints on new game
        checkpointManager.clearCheckpoint();

    } else if (isLevelUp && level > 1) {
        objectsRef.current = objectsRef.current.filter(obj => obj.position[2] > -80);

        objectsRef.current.push({
            id: uuidv4(),
            type: ObjectType.SHOP_PORTAL,
            position: [0, 0, -100],
            active: true,
        });

        nextLetterDistance.current = distanceTraveled.current - SPAWN_DISTANCE + getLetterInterval(level);
        setRenderTrigger(t => t + 1);

    } else if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
        setDistance(Math.floor(distanceTraveled.current));
    }

    prevStatus.current = status;
    prevLevel.current = level;
  }, [status, level, setDistance]);

  // Handle checkpoint restoration
  useEffect(() => {
    const handleRestoreCheckpoint = (e: CustomEvent) => {
      const { objects, distanceTraveled: restoredDistance, nextLetterDistance: restoredNextLetter } = e.detail;

      // Restore objects from checkpoint
      objectsRef.current = objects.map((obj: GameObject) => ({ ...obj })); // Deep copy
      distanceTraveled.current = restoredDistance;
      nextLetterDistance.current = restoredNextLetter;

      setRenderTrigger(t => t + 1);

      console.log('[LevelManager] Restored checkpoint with', objects.length, 'objects');
    };

    window.addEventListener('restore-checkpoint', handleRestoreCheckpoint as any);
    return () => window.removeEventListener('restore-checkpoint', handleRestoreCheckpoint as any);
  }, []);

  useFrame((state) => {
      if (!playerObjRef.current) {
          const group = state.scene.getObjectByName('PlayerGroup');
          if (group && group.children.length > 0) {
              playerObjRef.current = group.children[0];
          }
      }
  });

  useFrame((state, delta) => {
    // Update the fixed timestep loop with current frame time
    fixedLoopRef.current.update(state.clock.elapsedTime);
  });

  console.log('DEBUG RENDER: LevelManager rendering', objectsRef.current.length, 'objects');
  console.log('DEBUG RENDER: Active objects:', objectsRef.current.filter(obj => obj.active));

  return (
    <group>
      <ForcedTronco />
      <ParticleSystem />
      {objectsRef.current.map(obj => {
        if (!obj.active) {
          console.log('DEBUG RENDER: Skipping inactive object', obj.id, obj.type);
          return null;
        }
        console.log('DEBUG RENDER: Rendering active object', obj.id, obj.type, obj.position);
        return <GameEntity key={obj.id} data={obj} />;
      })}
    </group>
  );
};

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const visualRef = useRef<THREE.Group>(null);
    const shadowRef = useRef<THREE.Mesh>(null);
    const { laneCount } = useStore();

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.set(data.position[0], 0, data.position[2]);
        }

        if (visualRef.current) {
            const baseHeight = data.position[1];

            if (data.type === ObjectType.SHOP_PORTAL) {
                 visualRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.02);
            } else if (data.type === ObjectType.MISSILE) {
                 visualRef.current.position.y = baseHeight + Math.sin(state.clock.elapsedTime * 10) * 0.1;
            } else if (data.type === ObjectType.ALIEN) {
                 visualRef.current.position.y = baseHeight + Math.sin(state.clock.elapsedTime * 3) * 0.2;
                 visualRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2; // Shark wiggle
            } else if (data.type !== ObjectType.OBSTACLE) {
                visualRef.current.rotation.y += delta * 3;
                const bobOffset = Math.sin(state.clock.elapsedTime * 4 + data.position[0]) * 0.1;
                visualRef.current.position.y = baseHeight + bobOffset;

                if (shadowRef.current) {
                    const shadowScale = 1 - bobOffset;
                    shadowRef.current.scale.setScalar(shadowScale);
                }
            } else {
                visualRef.current.position.y = baseHeight;
            }
        }
    });

    const shadowGeo = useMemo(() => {
        if (data.type === ObjectType.LETTER) return SHADOW_LETTER_GEO;
        if (data.type === ObjectType.GEM) return SHADOW_GEM_GEO;
        if (data.type === ObjectType.SHOP_PORTAL) return null;
        if (data.type === ObjectType.ALIEN) return SHADOW_ALIEN_GEO;
        return SHADOW_DEFAULT_GEO;
    }, [data.type]);

    return (
        <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
            {data.type !== ObjectType.SHOP_PORTAL && shadowGeo && (
                <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} geometry={shadowGeo}>
                    <meshBasicMaterial color="#000000" opacity={0.3} transparent />
                </mesh>
            )}

            <group ref={visualRef} position={[0, data.position[1], 0]}>
                {/* --- SHOP PORTAL (TIKI HUT) --- */}
                {data.type === ObjectType.SHOP_PORTAL && (
                    <group>
                         <mesh position={[0, 3, 0]} geometry={SHOP_FRAME_GEO} scale={[laneCount * LANE_WIDTH + 2, 1, 1]}>
                             <meshStandardMaterial color="#8b4513" />
                         </mesh>
                         <mesh position={[0, 2, 0]} geometry={SHOP_BACK_GEO} scale={[laneCount * LANE_WIDTH, 1, 1]}>
                              <meshBasicMaterial color="#000000" />
                         </mesh>
                         <mesh position={[0, 5, 0]} geometry={SHOP_ROOF_GEO} scale={[laneCount * LANE_WIDTH / 2, 1, 1]}>
                             <meshStandardMaterial color="#a0522d" />
                         </mesh>
                         <Center position={[0, 4, 0.6]}>
                             <Text3D font={FONT_URL} size={1.2} height={0.2}>
                                 TIENDA
                                 <meshBasicMaterial color="#ffff00" />
                             </Text3D>
                         </Center>
                    </group>
                )}

                {/* --- OBSTACLE (Tronco) --- */}
                {data.type === ObjectType.OBSTACLE && <Tronco data={data} />}

                {/* --- ALIEN (Shark Fin) --- */}
                {data.type === ObjectType.ALIEN && (
                    <group rotation={[0, Math.PI, 0]}>
                        <mesh geometry={ALIEN_BODY_GEO}>
                            <meshStandardMaterial color="#808080" roughness={0.2} metalness={0.5} />
                        </mesh>
                    </group>
                )}

                {/* --- MISSILE (Bubble) --- */}
                {data.type === ObjectType.MISSILE && (
                    <group>
                        <mesh geometry={MISSILE_CORE_GEO}>
                            <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0} thickness={0.5} />
                        </mesh>
                    </group>
                )}

                {/* --- GEM (Pearl) --- */}
                {data.type === ObjectType.GEM && (
                    <mesh castShadow geometry={GEMINI_TARGET_INDEX_GEO || GEM_GEOMETRY}>
                        <meshStandardMaterial
                            color="#ffffff"
                            roughness={0.2}
                            metalness={0.8}
                        />
                    </mesh>
                )}

                {/* --- LETTER --- */}
                {data.type === ObjectType.LETTER && (
                    <group scale={[1.5, 1.5, 1.5]}>
                         <Center>
                             <Text3D
                                font={FONT_URL}
                                size={0.8}
                                height={0.2}
                                bevelEnabled
                                bevelThickness={0.02}
                                bevelSize={0.02}
                                bevelSegments={5}
                             >
                                {data.value}
                                <meshStandardMaterial color={data.color} />
                             </Text3D>
                         </Center>
                    </group>
                )}
            </group>
        </group>
    );
});
// Temp fix for gem geo usage
const GEMINI_TARGET_INDEX_GEO = new THREE.IcosahedronGeometry(0.3, 1);

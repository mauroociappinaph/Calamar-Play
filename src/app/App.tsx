/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from '@/world/stage/Environment';
import { Player } from '@/world/actors/Player';
import { LevelManager } from '@/world/stage/LevelManager';
import { Effects } from '@/world/fx/Effects';
import { HUD } from '@/features/ui/HUD';
import { Onboarding } from '@/features/ui/onboarding';
import { useStore } from '@/features/game/state/store';
import { initAnalytics, cleanupAnalytics, trackGameEvent } from '@/shared/analytics';

// Dynamic Camera Controller with Shake
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();

  const shakeIntensity = useRef(0);

  useEffect(() => {
      const onLand = () => {
          shakeIntensity.current = 0.3; // Set initial shake intensity
      };
      window.addEventListener('player-land', onLand);
      return () => window.removeEventListener('player-land', onLand);
  }, []);

  useFrame((state, delta) => {
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2; // Threshold for "mobile-like" narrowness or square-ish displays

    // Calculate expansion factors
    // Mobile requires backing up significantly more because vertical FOV is fixed in Three.js,
    // meaning horizontal view shrinks as aspect ratio drops.
    // We use more aggressive multipliers for mobile to keep outer lanes in frame.
    const heightFactor = isMobile ? 2.0 : 0.5;
    const distFactor = isMobile ? 4.5 : 1.0;

    // Base (3 lanes): y=5.5, z=8
    // Calculate target based on how many extra lanes we have relative to the start
    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = 5.5 + (extraLanes * heightFactor);
    const targetZ = 8.0 + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);

    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);

    // Apply Shake
    if (shakeIntensity.current > 0.001) {
        const rx = (Math.random() - 0.5) * shakeIntensity.current;
        const ry = (Math.random() - 0.5) * shakeIntensity.current;
        camera.position.x += rx;
        camera.position.y += ry;

        // Decay shake
        shakeIntensity.current = THREE.MathUtils.lerp(shakeIntensity.current, 0, delta * 8.0);
    }

    // Look further down the track to see the end of lanes
    // Adjust look target slightly based on height to maintain angle
    camera.lookAt(0, 0, -30);
  });

  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

function App() {
    console.log('App component rendering');

    // Initialize analytics on app load
    useEffect(() => {
        initAnalytics({
            enabled: true,
            trackLocalhost: true // Enable for development
        });

        // Cleanup on unmount
        return () => {
            cleanupAnalytics();
        };
    }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD />
      <Onboarding />
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
        // Initial camera, matches the controller base
        camera={{ position: [0, 5.5, 8], fov: 60 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;

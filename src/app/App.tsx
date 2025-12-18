/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense, useEffect, useRef, useState } from 'react';
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
import { audio, audioEvents } from '@/systems/audio/AudioEngine';

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

    const [audioDebug, setAudioDebug] = useState<any>(null);
    const [showDebug, setShowDebug] = useState(false);

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

    // Update audio debug info periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setAudioDebug(audio.getDebugInfo());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Load test audio on mount (development only)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // Create test audio buffers programmatically for testing
            const loadTestAudio = async () => {
                try {
                    // Create jump sound
                    const jumpBuffer = audio['audioContext']?.createBuffer(1, audio['audioContext'].sampleRate * 0.15, audio['audioContext'].sampleRate);
                    if (jumpBuffer) {
                        const channelData = jumpBuffer.getChannelData(0);
                        // Generate a jump-like sound (ascending pitch)
                        for (let i = 0; i < jumpBuffer.length; i++) {
                            const progress = i / jumpBuffer.length;
                            const frequency = 300 + (progress * 200); // 300Hz to 500Hz
                            channelData[i] = Math.sin(2 * Math.PI * frequency * i / audio['audioContext'].sampleRate) * (1 - progress) * 0.3;
                        }
                        audio['audioBuffers'].set('jump', jumpBuffer);
                        console.log('✅ Test jump audio loaded');
                    }

                    // Create damage sound
                    const damageBuffer = audio['audioContext']?.createBuffer(1, audio['audioContext'].sampleRate * 0.2, audio['audioContext'].sampleRate);
                    if (damageBuffer) {
                        const channelData = damageBuffer.getChannelData(0);
                        // Generate a damage-like sound (descending pitch)
                        for (let i = 0; i < damageBuffer.length; i++) {
                            const progress = i / damageBuffer.length;
                            const frequency = 400 - (progress * 150); // 400Hz to 250Hz
                            channelData[i] = Math.sin(2 * Math.PI * frequency * i / audio['audioContext'].sampleRate) * (1 - progress) * 0.4;
                        }
                        audio['audioBuffers'].set('damage', damageBuffer);
                        console.log('✅ Test damage audio loaded');
                    }

                    console.log('Test audio buffers created for debugging');
                } catch (e) {
                    console.log('Could not create test audio buffers:', e);
                }
            };

            loadTestAudio();
        }
    }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD />
      <Onboarding />

      {/* Audio Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-mono"
          >
            🎵 Audio Debug
          </button>

          {showDebug && audioDebug && (
            <div className="mt-2 bg-black/80 text-green-400 p-4 rounded text-xs font-mono max-w-xs">
              <div>Unlocked: {audioDebug.isUnlocked ? '✅' : '❌'}</div>
              <div>Context: {audioDebug.contextState}</div>
              <div>Buffers: {audioDebug.loadedBuffers}</div>
              <div>Sources: {audioDebug.activeSources}</div>
              <div className="mt-2 space-y-1">
                <div>Master: {(audioDebug.volumes?.master * 100) || 0}%</div>
                <div>Music: {(audioDebug.volumes?.music * 100) || 0}%</div>
                <div>SFX: {(audioDebug.volumes?.sfx * 100) || 0}%</div>
                <div>Ambience: {(audioDebug.volumes?.ambience * 100) || 0}%</div>
              </div>
              <div className="mt-2 space-x-1">
                <button
                  onClick={() => audio.unlock()}
                  className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                >
                  Unlock
                </button>
                <button
                  onClick={() => audioEvents.playJump()}
                  className="bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                >
                  Jump
                </button>
                <button
                  onClick={() => audioEvents.playDamage()}
                  className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Damage
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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

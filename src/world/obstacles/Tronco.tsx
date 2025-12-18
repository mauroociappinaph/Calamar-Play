/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as THREE from 'three';
import { GameObject } from '@/shared/types/types';

export const Tronco: React.FC<{ data: GameObject }> = ({ data }) => {
  // Add render log
  console.log('RENDER TRONCO', data.id, data.position, data.active);

  return (
    <group>
      {/* Main tronco body */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.6, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      {/* Top part */}
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.5, 0.5, 0.5, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Forced render of a fixed tronco in center for debugging
export const ForcedTronco: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};

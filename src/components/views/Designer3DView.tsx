/**
 * SENSORY JAPAN — 3D Architectural Designer View (Part 2 Three.js Engine)
 * 
 * Embeds:
 * - Real-time ThreeHouseCanvas WebGL renderer
 * - Interactive 3D object inspector and property modifier
 * - Seamless 2D <-> 3D bidirectional state synchronization
 */

import React from 'react';
import { ThreeHouseCanvas } from '../canvas3d/ThreeHouseCanvas';
import { RightInspector } from '../layout/RightInspector';

export const Designer3DView: React.FC = () => {
  return (
    <div className="flex-1 flex h-full w-full overflow-hidden relative">
      {/* 3D WEBGL STAGE */}
      <div className="flex-1 h-full relative overflow-hidden bg-sumi">
        <ThreeHouseCanvas />
      </div>

      {/* RIGHT PROPERTY INSPECTOR */}
      <RightInspector />
    </div>
  );
};

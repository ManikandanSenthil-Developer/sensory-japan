/**
 * SENSORY JAPAN — 2D Architectural CAD Grid Overlay
 * 
 * Renders the authentic Japanese architectural grid:
 * - Major grid lines: 1-ken = 1820 mm (or 2-module)
 * - Module grid lines: 1-module = 910 mm (Shakkan-ho) or 1000 mm (Meter module)
 * - Sub-grid lines: 0.5-module = 455 mm (Quarter-ken)
 * - World coordinate axes and origin marker
 */

import React from 'react';

interface GridOverlayProps {
  zoom: number;
  panX: number;
  panY: number;
  moduleMm: number; // 910 or 1000
  width: number;
  height: number;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  zoom,
  panX,
  panY,
  moduleMm,
  width,
  height,
}) => {
  // Convert module to screen pixels
  const subGridStepPx = (moduleMm / 2) * zoom;
  const majorGridStepPx = moduleMm * 2 * zoom; // 1-ken x 2 = 1820 or 2000 mm

  // Minimum pixel threshold to avoid dense visual clutter when zoomed far out
  if (subGridStepPx < 6) {
    return null;
  }

  const offsetX = panX % majorGridStepPx;
  const offsetY = panY % majorGridStepPx;

  return (
    <g className="pointer-events-none select-none">
      <defs>
        {/* Sub-grid pattern (455mm) */}
        <pattern
          id="cad-sub-grid"
          width={subGridStepPx}
          height={subGridStepPx}
          patternUnits="userSpaceOnUse"
          x={panX % subGridStepPx}
          y={panY % subGridStepPx}
        >
          <path
            d={`M ${subGridStepPx} 0 L 0 0 0 ${subGridStepPx}`}
            fill="none"
            stroke="#E7E1D4"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        </pattern>

        {/* Major module grid pattern (1-ken = 1820mm) */}
        <pattern
          id="cad-major-grid"
          width={majorGridStepPx}
          height={majorGridStepPx}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${majorGridStepPx} 0 L 0 0 0 ${majorGridStepPx}`}
            fill="none"
            stroke="#D6CEBE"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* Background Grid Rects */}
      <rect width={width} height={height} fill="url(#cad-sub-grid)" />
      <rect width={width} height={height} fill="url(#cad-major-grid)" />

      {/* World Origin Axes (0, 0 in mm) */}
      <line
        x1={panX}
        y1={0}
        x2={panX}
        y2={height}
        stroke="#C9935B"
        strokeWidth="1.2"
        strokeDasharray="4,3"
        opacity="0.6"
      />
      <line
        x1={0}
        y1={panY}
        x2={width}
        y2={panY}
        stroke="#C9935B"
        strokeWidth="1.2"
        strokeDasharray="4,3"
        opacity="0.6"
      />

      {/* Origin Label */}
      <circle cx={panX} cy={panY} r={3} fill="#C9935B" />
      <text
        x={panX + 6}
        y={panY - 6}
        fill="#A6723C"
        fontSize="10"
        fontFamily="JetBrains Mono, monospace"
      >
        (0,0) 原点
      </text>
    </g>
  );
};


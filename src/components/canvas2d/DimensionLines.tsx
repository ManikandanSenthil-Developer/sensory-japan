/**
 * SENSORY JAPAN — 2D Architectural Dimension Callouts & Plot Setbacks
 * 
 * Renders:
 * - Architectural dimension extension lines, tick marks, and mm labels
 * - Plot boundary lines and legal setback offsets (セットバック)
 * - North orientation indicator (方角・北向マーク)
 */

import React from 'react';
import { PlotConfiguration } from '../../types/architectural';

interface DimensionLinesProps {
  plot: PlotConfiguration;
  zoom: number;
  panX: number;
  panY: number;
}

export const DimensionLines: React.FC<DimensionLinesProps> = ({
  plot,
  zoom,
  panX,
  panY,
}) => {
  const plotW = plot.width * zoom;
  const plotD = plot.depth * zoom;

  // Plot position centered relative to origin
  const px = panX;
  const py = panY;

  return (
    <g className="pointer-events-none select-none">
      {/* PLOT BOUNDARY (敷地境界線) */}
      <rect
        x={px}
        y={py}
        width={plotW}
        height={plotD}
        fill="none"
        stroke="#8C857B"
        strokeWidth="1.5"
        strokeDasharray="6,4"
      />

      {/* Plot Boundary Label */}
      <text
        x={px + 10}
        y={py + 18}
        fill="#7A7368"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
      >
        敷地境界: 間口 {(plot.width / 1000).toFixed(1)}m × 奥行 {(plot.depth / 1000).toFixed(1)}m ({plot.areaSqMeters}㎡ / {(plot.areaSqMeters * 0.3025).toFixed(1)}坪)
      </text>

      {/* FRONT ROAD INDICATION (前面道路) */}
      {plot.roadDirection === 'south' ? (
        <g>
          {/* Road banner at South */}
          <rect
            x={px - 20}
            y={py + plotD}
            width={plotW + 40}
            height={Math.max(24, plot.roadWidth * zoom)}
            fill="#EBE6DC"
            stroke="#C5BBAA"
            strokeWidth="1"
          />
          <text
            x={px + plotW / 2}
            y={py + plotD + Math.max(16, (plot.roadWidth * zoom) / 2 + 4)}
            textAnchor="middle"
            fill="#5A615C"
            fontSize="11"
            fontWeight="500"
          >
            前面道路 幅員 {(plot.roadWidth / 1000).toFixed(1)}m（南面道路・公道）
          </text>
        </g>
      ) : (
        <g>
          {/* Road banner at North */}
          <rect
            x={px - 20}
            y={py - Math.max(24, plot.roadWidth * zoom)}
            width={plotW + 40}
            height={Math.max(24, plot.roadWidth * zoom)}
            fill="#EBE6DC"
            stroke="#C5BBAA"
            strokeWidth="1"
          />
          <text
            x={px + plotW / 2}
            y={py - Math.max(10, (plot.roadWidth * zoom) / 2)}
            textAnchor="middle"
            fill="#5A615C"
            fontSize="11"
            fontWeight="500"
          >
            前面道路 幅員 {(plot.roadWidth / 1000).toFixed(1)}m（北面道路）
          </text>
        </g>
      )}

      {/* NORTH ARROW COMPASS (方位記号) */}
      <g transform={`translate(${px + plotW - 40}, ${py + 40}) rotate(${plot.northOrientation})`}>
        <circle cx="0" cy="0" r="18" fill="#FDFBF7" stroke="#323734" strokeWidth="1.2" />
        {/* North Arrow Pointer */}
        <polygon points="0,-14 5,4 0,1 -5,4" fill="#A64B3B" />
        <polygon points="0,14 5,-4 0,-1 -5,-4" fill="#6A706C" opacity="0.4" />
        <text
          x="0"
          y="-18"
          textAnchor="middle"
          fill="#A64B3B"
          fontSize="10"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          N
        </text>
      </g>
    </g>
  );
};


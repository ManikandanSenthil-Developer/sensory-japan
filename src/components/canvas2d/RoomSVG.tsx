/**
 * SENSORY JAPAN — 2D Room SVG Component
 * 
 * Renders:
 * - Room walls and floor surface material
 * - High-fidelity Japanese Tatami mats with traditional cloth borders (Heri 縁)
 * - Dimension annotations (mm, m², 坪, 畳)
 * - Selection state and interactive drag & resize handles
 */

import React from 'react';
import { Room } from '../../types/architectural';
import { sqMetersToTsubo, sqMetersToAdvertisingTatami } from '../../engine/tatami';

interface RoomSVGProps {
  room: Room;
  zoom: number;
  isSelected: boolean;
  showTatamiDetails: boolean;
  showDimensions: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onMouseDownMove: (e: React.MouseEvent, room: Room) => void;
  onMouseDownResize: (e: React.MouseEvent, room: Room, handle: string) => void;
}

export const RoomSVG: React.FC<RoomSVGProps> = ({
  room,
  zoom,
  isSelected,
  showTatamiDetails,
  showDimensions,
  onSelect,
  onMouseDownMove,
  onMouseDownResize,
}) => {
  const x = room.position.x * zoom;
  const y = room.position.y * zoom;
  const w = room.width * zoom;
  const h = room.height * zoom;

  const areaSqm = (room.width * room.height) / 1_000_000;
  const areaTsubo = sqMetersToTsubo(areaSqm).toFixed(1);
  const joCount = room.tatamiConfig
    ? room.tatamiConfig.matCount === 'custom'
      ? room.tatamiConfig.mats.length
      : room.tatamiConfig.matCount
    : sqMetersToAdvertisingTatami(areaSqm).toFixed(1);

  // Material fill styling
  const isWashitsu = room.type === 'washitsu';
  const isDoma = room.floorMaterial === 'concrete_doma';
  const isBath = room.type === 'bathroom' || room.type === 'washroom';
  const isBalcony = room.type === 'balcony' || room.type === 'engawa';

  let fillStyle = '#F6F3EC';
  if (isWashitsu) fillStyle = '#EBF1E4'; // Gentle tatami pale green
  else if (isDoma) fillStyle = '#DDD9D1'; // Concrete doma
  else if (isBath) fillStyle = '#E5ECEF'; // Sanitary light steel
  else if (isBalcony) fillStyle = '#E6E1D8'; // Timber deck

  const handleSize = Math.max(6, Math.min(10, 8));

  return (
    <g
      id={`room-svg-${room.id}`}
      className="cursor-move group"
      onClick={onSelect}
      onMouseDown={(e) => onMouseDownMove(e, room)}
    >
      {/* Elevation Drop Shadow for Raised Koagari Tatami Platform */}
      {room.elevationOffset ? (
        <rect
          x={x + 3}
          y={y + 3}
          width={w}
          height={h}
          fill="rgba(30, 34, 33, 0.08)"
          rx={2}
        />
      ) : null}

      {/* Main Room Floor Rect */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={fillStyle}
        stroke={isSelected ? '#C9935B' : '#4A504B'}
        strokeWidth={isSelected ? 2.5 : 1.5}
        rx={1}
      />

      {/* PHYSICAL TATAMI MATS RENDERING */}
      {isWashitsu && showTatamiDetails && room.tatamiConfig && (
        <g className="pointer-events-none">
          {room.tatamiConfig.mats.map((mat) => {
            const mx = (room.position.x + mat.x) * zoom;
            const my = (room.position.y + mat.y) * zoom;
            const mw = mat.width * zoom;
            const mh = mat.height * zoom;

            // Authentic Tatami Cloth Border (Heri 縁)
            // Typically 25-30 mm wide along the long edges
            const heriThickness = Math.max(1.5, Math.min(4, 28 * zoom));

            return (
              <g key={mat.id}>
                {/* Tatami Mat Body (Woven Igusa Rush) */}
                <rect
                  x={mx}
                  y={my}
                  width={mw}
                  height={mh}
                  fill="#D8E3CC"
                  stroke="#8B9D76"
                  strokeWidth="0.8"
                />

                {/* Cloth Borders (Heri 縁) along the two long sides */}
                {mat.orientation === 'vertical' ? (
                  <>
                    {/* Left Heri */}
                    <rect
                      x={mx}
                      y={my}
                      width={heriThickness}
                      height={mh}
                      fill="#37472E"
                    />
                    {/* Right Heri */}
                    <rect
                      x={mx + mw - heriThickness}
                      y={my}
                      width={heriThickness}
                      height={mh}
                      fill="#37472E"
                    />
                  </>
                ) : (
                  <>
                    {/* Top Heri */}
                    <rect
                      x={mx}
                      y={my}
                      width={mw}
                      height={heriThickness}
                      fill="#37472E"
                    />
                    {/* Bottom Heri */}
                    <rect
                      x={mx}
                      y={my + mh - heriThickness}
                      width={mw}
                      height={heriThickness}
                      fill="#37472E"
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* ROOM TEXT LABELS */}
      <g className="pointer-events-none select-none text-center">
        {/* Japanese Name */}
        <text
          x={x + w / 2}
          y={y + h / 2 - (showDimensions ? 10 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#1E2221"
          fontSize={Math.max(10, Math.min(15, w / 12))}
          fontWeight="600"
          fontFamily="'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif"
        >
          {room.japaneseName || room.name}
        </text>

        {/* Dimension & Tatami Annotations */}
        {showDimensions && (
          <text
            x={x + w / 2}
            y={y + h / 2 + 12}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#5A615C"
            fontSize={Math.max(9, Math.min(12, w / 16))}
            fontFamily="JetBrains Mono, monospace"
          >
            {isWashitsu
              ? `${joCount}畳 (${areaSqm.toFixed(1)}㎡ / ${areaTsubo}坪)`
              : `${areaSqm.toFixed(1)}㎡ / ${areaTsubo}坪 (${joCount}畳)`}
          </text>
        )}
      </g>

      {/* SELECTION BOUNDING BOX & 8-POINT RESIZE HANDLES */}
      {isSelected && (
        <g className="select-none">
          {/* Highlight outline */}
          <rect
            x={x - 2}
            y={y - 2}
            width={w + 4}
            height={h + 4}
            fill="none"
            stroke="#C9935B"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />

          {/* Top-Left */}
          <rect
            x={x - handleSize / 2}
            y={y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#FFFFFF"
            stroke="#C9935B"
            strokeWidth="2"
            className="cursor-nwse-resize"
            onMouseDown={(e) => onMouseDownResize(e, room, 'tl')}
          />
          {/* Top-Right */}
          <rect
            x={x + w - handleSize / 2}
            y={y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#FFFFFF"
            stroke="#C9935B"
            strokeWidth="2"
            className="cursor-nesw-resize"
            onMouseDown={(e) => onMouseDownResize(e, room, 'tr')}
          />
          {/* Bottom-Left */}
          <rect
            x={x - handleSize / 2}
            y={y + h - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#FFFFFF"
            stroke="#C9935B"
            strokeWidth="2"
            className="cursor-nesw-resize"
            onMouseDown={(e) => onMouseDownResize(e, room, 'bl')}
          />
          {/* Bottom-Right */}
          <rect
            x={x + w - handleSize / 2}
            y={y + h - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#FFFFFF"
            stroke="#C9935B"
            strokeWidth="2"
            className="cursor-nwse-resize"
            onMouseDown={(e) => onMouseDownResize(e, room, 'br')}
          />
          {/* Middle-Right */}
          <rect
            x={x + w - handleSize / 2}
            y={y + h / 2 - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#FFFFFF"
            stroke="#C9935B"
            strokeWidth="2"
            className="cursor-ew-resize"
            onMouseDown={(e) => onMouseDownResize(e, room, 'r')}
          />
          {/* Middle-Bottom */}
          <rect
            x={x + w / 2 - handleSize / 2}
            y={y + h - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#FFFFFF"
            stroke="#C9935B"
            strokeWidth="2"
            className="cursor-ns-resize"
            onMouseDown={(e) => onMouseDownResize(e, room, 'b')}
          />
        </g>
      )}
    </g>
  );
};


/**
 * SENSORY JAPAN — Interactive 2D Floor Plan SVG CAD Canvas
 * 
 * Features:
 * - Fluid pan and zoom (mouse wheel centered at cursor, space+drag, middle-drag)
 * - Module grid snapping (910mm Shakkan-ho / 1000mm meter module)
 * - Drag-to-move and drag-to-resize with 8-point handles
 * - Structural ghosting (onion skin) of lower floors
 * - Full architectural keyboard shortcuts
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { Room } from '../../types/architectural';
import { GridOverlay } from './GridOverlay';
import { RoomSVG } from './RoomSVG';
import { DimensionLines } from './DimensionLines';
import { snapToModule } from '../../engine/geometry';

export const FloorPlanCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Store bindings
  const project = useProjectStore((s) => s.project);
  const selectedId = useProjectStore((s) => s.selectedId);
  const selectObject = useProjectStore((s) => s.selectObject);
  const clearSelection = useProjectStore((s) => s.clearSelection);
  const moveRoom = useProjectStore((s) => s.moveRoom);
  const resizeRoom = useProjectStore((s) => s.resizeRoom);
  const rotateRoom = useProjectStore((s) => s.rotateRoom);
  const deleteRoom = useProjectStore((s) => s.deleteRoom);
  const duplicateRoom = useProjectStore((s) => s.duplicateRoom);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);

  const zoom = useUIStore((s) => s.zoom);
  const panX = useUIStore((s) => s.panX);
  const panY = useUIStore((s) => s.panY);
  const setZoom = useUIStore((s) => s.setZoom);
  const setPan = useUIStore((s) => s.setPan);
  const panBy = useUIStore((s) => s.panBy);
  const activeTool = useUIStore((s) => s.activeTool);
  const gridSnapEnabled = useUIStore((s) => s.gridSnapEnabled);
  const gridModuleMm = useUIStore((s) => s.gridModuleMm);
  const showDimensions = useUIStore((s) => s.showDimensions);
  const showTatamiDetails = useUIStore((s) => s.showTatamiDetails);
  const showLowerFloorGhost = useUIStore((s) => s.showLowerFloorGhost);

  // Interaction State
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Dragging Room State
  const [draggingRoom, setDraggingRoom] = useState<{
    room: Room;
    initialMouseX: number;
    initialMouseY: number;
    initialRoomX: number;
    initialRoomY: number;
  } | null>(null);

  // Resizing Room State
  const [resizingRoom, setResizingRoom] = useState<{
    room: Room;
    handle: string;
    initialMouseX: number;
    initialMouseY: number;
    initialW: number;
    initialH: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Measure container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Active Floor & Lower Floor Ghost
  const activeFloor = project.floors.find((f) => f.id === project.activeFloorId) || project.floors[0];
  const activeFloorIndex = project.floors.findIndex((f) => f.id === activeFloor.id);
  const lowerFloor = activeFloorIndex > 0 ? project.floors[activeFloorIndex - 1] : null;

  // Wheel Zoom (centered on cursor)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.min(0.3, Math.max(0.015, zoom * zoomFactor));

      // Adjust pan to zoom into mouse cursor
      const newPanX = mouseX - (mouseX - panX) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - panY) * (newZoom / zoom);

      setZoom(newZoom);
      setPan(newPanX, newPanY);
    },
    [zoom, panX, panY, setZoom, setPan]
  );

  // Mouse Down on Background
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpacePressed || activeTool === 'pan') {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      clearSelection();
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Pan
    if (isPanning && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      panBy(dx, dy);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // 2. Drag Move Room
    if (draggingRoom) {
      const dxMm = (e.clientX - draggingRoom.initialMouseX) / zoom;
      const dyMm = (e.clientY - draggingRoom.initialMouseY) / zoom;

      let targetX = draggingRoom.initialRoomX + dxMm;
      let targetY = draggingRoom.initialRoomY + dyMm;

      if (gridSnapEnabled) {
        targetX = snapToModule(targetX, gridModuleMm / 2); // Snap to half-ken (455mm)
        targetY = snapToModule(targetY, gridModuleMm / 2);
      }

      moveRoom(draggingRoom.room.id, { x: targetX, y: targetY });
      return;
    }

    // 3. Resize Room
    if (resizingRoom) {
      const dxMm = (e.clientX - resizingRoom.initialMouseX) / zoom;
      const dyMm = (e.clientY - resizingRoom.initialMouseY) / zoom;

      let newW = resizingRoom.initialW;
      let newH = resizingRoom.initialH;

      if (resizingRoom.handle.includes('r')) newW += dxMm;
      if (resizingRoom.handle.includes('b')) newH += dyMm;

      if (gridSnapEnabled) {
        newW = snapToModule(newW, gridModuleMm);
        newH = snapToModule(newH, gridModuleMm);
      }

      resizeRoom(resizingRoom.room.id, newW, newH);
      return;
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setDragStart(null);
    setDraggingRoom(null);
    setResizingRoom(null);
  };

  // Start Room Drag Move
  const handleStartMoveRoom = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    if (isSpacePressed || activeTool === 'pan') return;

    selectObject(room.id, 'room');
    setDraggingRoom({
      room,
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialRoomX: room.position.x,
      initialRoomY: room.position.y,
    });
  };

  // Start Room Resize
  const handleStartResizeRoom = (e: React.MouseEvent, room: Room, handle: string) => {
    e.stopPropagation();
    setResizingRoom({
      room,
      handle,
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialW: room.width,
      initialH: room.height,
      initialX: room.position.x,
      initialY: room.position.y,
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo();
        e.preventDefault();
      }

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteRoom(selectedId);
        e.preventDefault();
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        duplicateRoom(selectedId);
        e.preventDefault();
      }

      // Rotate Room (R key)
      if (e.key.toLowerCase() === 'r' && selectedId) {
        rotateRoom(selectedId);
        e.preventDefault();
      }

      // Arrow Nudge
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedId) {
        const step = e.shiftKey ? gridModuleMm / 2 : gridModuleMm; // 455mm vs 910mm
        const activeRoom = activeFloor.rooms.find((r) => r.id === selectedId);
        if (activeRoom) {
          let nx = activeRoom.position.x;
          let ny = activeRoom.position.y;
          if (e.key === 'ArrowUp') ny -= step;
          if (e.key === 'ArrowDown') ny += step;
          if (e.key === 'ArrowLeft') nx -= step;
          if (e.key === 'ArrowRight') nx += step;
          moveRoom(selectedId, { x: nx, y: ny });
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, activeFloor, gridModuleMm, undo, redo, deleteRoom, duplicateRoom, rotateRoom, moveRoom]);

  let cursorClass = 'cursor-default';
  if (isSpacePressed || activeTool === 'pan') {
    cursorClass = isPanning ? 'cursor-panning' : 'cursor-pan';
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-washi-100 overflow-hidden select-none ${cursorClass}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDownCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full block"
      >
        {/* Background Japanese Module Grid */}
        <GridOverlay
          zoom={zoom}
          panX={panX}
          panY={panY}
          moduleMm={gridModuleMm}
          width={dimensions.width}
          height={dimensions.height}
        />

        {/* Plot Boundaries, Setbacks & Road Orientation */}
        <DimensionLines
          plot={project.plot}
          zoom={zoom}
          panX={panX}
          panY={panY}
        />

        {/* GHOST / ONION-SKIN LOWER FLOOR (Structural Wall Alignment) */}
        {showLowerFloorGhost && lowerFloor && (
          <g opacity="0.35" className="pointer-events-none">
            {lowerFloor.rooms.map((room) => {
              const rx = (room.position.x) * zoom + panX;
              const ry = (room.position.y) * zoom + panY;
              const rw = room.width * zoom;
              const rh = room.height * zoom;
              return (
                <rect
                  key={`ghost-${room.id}`}
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  fill="#D4CEC4"
                  stroke="#8C857B"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              );
            })}
          </g>
        )}

        {/* ACTIVE FLOOR ROOMS */}
        <g transform={`translate(${panX}, ${panY})`}>
          {activeFloor.rooms.map((room) => (
            <RoomSVG
              key={room.id}
              room={room}
              zoom={zoom}
              isSelected={selectedId === room.id}
              showTatamiDetails={showTatamiDetails}
              showDimensions={showDimensions}
              onSelect={(e) => {
                e.stopPropagation();
                selectObject(room.id, 'room');
              }}
              onMouseDownMove={handleStartMoveRoom}
              onMouseDownResize={handleStartResizeRoom}
            />
          ))}
        </g>
      </svg>

      {/* Floating Canvas Quick HUD Controls */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-washi-50/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-washi-400/40 shadow-subtle text-xs text-sumi-200">
        <span className="font-mono font-semibold">
          1間: {(gridModuleMm * 2) / 1000}m
        </span>
        <span className="text-sumi-50">|</span>
        <span className="font-mono">
          縮尺: {(zoom * 1000).toFixed(1)} px/m
        </span>
        <span className="text-sumi-50">|</span>
        <span className="text-sumi-100">
          階: <strong className="text-hinoki-dark font-mono">{activeFloor.name}</strong>
        </span>
      </div>
    </div>
  );
};


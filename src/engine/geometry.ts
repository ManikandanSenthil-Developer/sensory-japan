/**
 * SENSORY JAPAN — 2D Architectural Geometry, Coordinate Transformation & Snapping Engine
 * 
 * Internal coordinate system:
 * - World origin (0, 0) in millimetres (mm)
 * - X-axis positive to the right (East)
 * - Y-axis positive downwards (South)
 * - Supports Japanese Shakkan-ho (尺貫法) 910mm module and 455mm sub-grid
 */

import { Room } from '../types/architectural';

export interface ViewportTransform {
  panX: number;     // Screen pixels
  panY: number;     // Screen pixels
  zoom: number;     // Scale factor (pixels per millimetre)
}

export interface PointMm {
  x: number;
  y: number;
}

export interface RectMm {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Snaps a millimetre value to the nearest architectural module grid.
 * Default grid step: 910 mm (half-ken) or 455 mm (quarter-ken).
 */
export function snapToModule(valueMm: number, stepMm: number = 910): number {
  return Math.round(valueMm / stepMm) * stepMm;
}

/**
 * Snaps a 2D point in millimetres to the architectural grid.
 */
export function snapPointToGrid(pointMm: PointMm, stepMm: number = 455): PointMm {
  return {
    x: snapToModule(pointMm.x, stepMm),
    y: snapToModule(pointMm.y, stepMm),
  };
}

/**
 * Converts world millimetres to screen SVG pixel coordinates.
 */
export function worldToScreen(pointMm: PointMm, transform: ViewportTransform): { x: number; y: number } {
  return {
    x: pointMm.x * transform.zoom + transform.panX,
    y: pointMm.y * transform.zoom + transform.panY,
  };
}

/**
 * Converts screen SVG pixel coordinates back to world millimetres.
 */
export function screenToWorld(screenX: number, screenY: number, transform: ViewportTransform): PointMm {
  return {
    x: Math.round((screenX - transform.panX) / transform.zoom),
    y: Math.round((screenY - transform.panY) / transform.zoom),
  };
}

/**
 * Checks if two axis-aligned rectangular rooms in mm overlap.
 */
export function checkRoomsOverlap(a: RectMm, b: RectMm): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Computes bounding box enclosing all rooms on a floor.
 */
export function computeFloorBoundingBox(rooms: Room[]): RectMm {
  if (!rooms.length) {
    return { x: 0, y: 0, width: 10000, height: 10000 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const r of rooms) {
    if (r.position.x < minX) minX = r.position.x;
    if (r.position.y < minY) minY = r.position.y;
    if (r.position.x + r.width > maxX) maxX = r.position.x + r.width;
    if (r.position.y + r.height > maxY) maxY = r.position.y + r.height;
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1000, maxX - minX),
    height: Math.max(1000, maxY - minY),
  };
}


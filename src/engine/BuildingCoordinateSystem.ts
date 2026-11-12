/**
 * SENSORY JAPAN — Centralized Building Coordinate System
 * 
 * Defines a single, unified architectural world-coordinate system:
 * - Origin (0, 0, 0) at the Building / Plot Ground Datum
 * - +X axis: Building Width (East) in millimetres
 * - +Y axis: Vertical Elevation (Up) in millimetres
 * - +Z axis: Building Depth (South) in millimetres (corresponds to +Y in 2D floor plans)
 * 
 * All Three.js world units are strictly derived:
 *   1 Three.js world unit = 1.0 metre = 1,000 millimetres
 * 
 * Never position floors or components with arbitrary independent offsets.
 */

import * as THREE from 'three';
import { Project, Room } from '../types/architectural';

export interface WorldPointMm {
  x: number; // mm
  y: number; // mm (Elevation above ground datum)
  z: number; // mm (Depth from north boundary)
}

export interface BuildingCentroid {
  xMm: number;
  zMm: number;
}

export class BuildingCoordinateSystem {
  /**
   * Computes the global building centroid across all floors to provide a stable,
   * un-shifting center point for 3D orbit controls and scene centering.
   * Ground floor footprint serves as the primary anchor.
   */
  public static computeBuildingCentroid(project: Project): BuildingCentroid {
    const groundFloor = project.floors.find((f) => f.level === '1F') || project.floors[0];
    const targetRooms = (groundFloor && groundFloor.rooms.length > 0)
      ? groundFloor.rooms
      : project.floors.flatMap((f) => f.rooms);

    if (!targetRooms || targetRooms.length === 0) {
      return {
        xMm: project.plot.width / 2,
        zMm: project.plot.depth / 2,
      };
    }

    let minX = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxZ = -Infinity;

    for (const r of targetRooms) {
      if (r.position.x < minX) minX = r.position.x;
      if (r.position.y < minZ) minZ = r.position.y;
      if (r.position.x + r.width > maxX) maxX = r.position.x + r.width;
      if (r.position.y + r.height > maxZ) maxZ = r.position.y + r.height;
    }

    return {
      xMm: (minX + maxX) / 2,
      zMm: (minZ + maxZ) / 2,
    };
  }

  /**
   * Converts a 2D floor plan point (x in mm, y in mm) plus vertical elevation (in mm)
   * into a Three.js Vector3 in metres, centered on the global building centroid.
   */
  public static mmToThreeM(
    xMm: number,
    elevationMm: number,
    yFloorPlanMm: number,
    centroid: BuildingCentroid
  ): THREE.Vector3 {
    const xM = (xMm - centroid.xMm) / 1000;
    const yM = elevationMm / 1000;
    const zM = (yFloorPlanMm - centroid.zMm) / 1000;
    return new THREE.Vector3(xM, yM, zM);
  }

  /**
   * Converts a Three.js Vector3 back to building coordinates in millimetres.
   */
  public static threeMToMm(
    vec: THREE.Vector3,
    centroid: BuildingCentroid
  ): WorldPointMm {
    return {
      x: Math.round(vec.x * 1000 + centroid.xMm),
      y: Math.round(vec.y * 1000),
      z: Math.round(vec.z * 1000 + centroid.zMm),
    };
  }

  /**
   * Converts a scalar millimetre value to Three.js metres.
   */
  public static toMetres(mm: number): number {
    return mm / 1000;
  }

  /**
   * Converts a scalar Three.js metre value to integer millimetres.
   */
  public static toMillimetres(m: number): number {
    return Math.round(m * 1000);
  }
}


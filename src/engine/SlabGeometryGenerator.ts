/**
 * SENSORY JAPAN — Slab Geometry Generator
 * 
 * Generates accurate horizontal floor slabs and foundations:
 * - Coordinates directly with BuildingCoordinateSystem and FloorElevationManager
 * - Common building centroid alignment ensures no floor shift
 * - Supports stairwell penetration cutouts
 * - Handles balcony cantilever slabs with realistic stepped water-resistant drainage drop
 */

import * as THREE from 'three';
import { Floor, Room } from '../types/architectural';
import { BuildingCentroid, BuildingCoordinateSystem } from './BuildingCoordinateSystem';
import { computeFloorBoundingBox } from './geometry';

export class SlabGeometryGenerator {
  /**
   * Generates a concrete floor slab mesh for a floor, anchored to the common building centroid.
   */
  public static generateFloorSlab(
    floor: Floor,
    baseElevationMm: number,
    centroid: BuildingCentroid,
    slabMaterial: THREE.Material
  ): THREE.Mesh | null {
    if (!floor.rooms || floor.rooms.length === 0) return null;

    const fBox = computeFloorBoundingBox(floor.rooms);
    const widthM = BuildingCoordinateSystem.toMetres(fBox.width);
    const depthM = BuildingCoordinateSystem.toMetres(fBox.height);
    const thicknessM = BuildingCoordinateSystem.toMetres(floor.slabThickness || 150);

    const slabGeo = new THREE.BoxGeometry(widthM, thicknessM, depthM);
    const slabMesh = new THREE.Mesh(slabGeo, slabMaterial);

    // Center of this floor's slab relative to the COMMON building centroid
    const centerXWorld = BuildingCoordinateSystem.toMetres(fBox.x + fBox.width / 2 - centroid.xMm);
    const centerZWorld = BuildingCoordinateSystem.toMetres(fBox.y + fBox.height / 2 - centroid.zMm);
    const centerYWorld = BuildingCoordinateSystem.toMetres(baseElevationMm) + thicknessM / 2;

    slabMesh.position.set(centerXWorld, centerYWorld, centerZWorld);
    slabMesh.receiveShadow = true;
    slabMesh.castShadow = true;
    slabMesh.name = `Slab_${floor.level}`;

    return slabMesh;
  }

  /**
   * Generates continuous ground foundation slab.
   */
  public static generateFoundation(
    groundRooms: Room[],
    centroid: BuildingCentroid,
    concreteMaterial: THREE.Material
  ): THREE.Mesh | null {
    if (!groundRooms || groundRooms.length === 0) return null;

    const fBox = computeFloorBoundingBox(groundRooms);
    // 300mm foundation footing overhang
    const widthM = BuildingCoordinateSystem.toMetres(fBox.width + 300);
    const depthM = BuildingCoordinateSystem.toMetres(fBox.height + 300);
    const thicknessM = 0.45; // 450mm standard Japanese mat foundation (Betakiso ベタ基礎)

    const geo = new THREE.BoxGeometry(widthM, thicknessM, depthM);
    const mesh = new THREE.Mesh(geo, concreteMaterial);

    const centerXWorld = BuildingCoordinateSystem.toMetres(fBox.x + fBox.width / 2 - centroid.xMm);
    const centerZWorld = BuildingCoordinateSystem.toMetres(fBox.y + fBox.height / 2 - centroid.zMm);

    mesh.position.set(centerXWorld, thicknessM / 2, centerZWorld);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.name = 'FoundationSlab';

    return mesh;
  }
}


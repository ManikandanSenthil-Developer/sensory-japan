/**
 * SENSORY JAPAN — Wall Geometry Generator
 * 
 * Generates accurate 3D wall segments and Japanese partitions:
 * - Coordinates with FloorElevationManager: starts on finished floor, terminates at ceiling
 * - Anchors to common BuildingCoordinateSystem centroid
 * - Distinguishes exterior walls (150mm), interior walls (100mm), and sliding screens (35mm)
 */

import * as THREE from 'three';
import { Room } from '../types/architectural';
import { BuildingCentroid, BuildingCoordinateSystem } from './BuildingCoordinateSystem';

export class WallGeometryGenerator {
  public static readonly EXTERIOR_WALL_THICKNESS_MM = 150;
  public static readonly INTERIOR_WALL_THICKNESS_MM = 100;
  public static readonly PARTITION_THICKNESS_MM = 35;

  /**
   * Generates boundary walls for a room.
   */
  public static generateRoomWalls(
    room: Room,
    finishedFloorElevationMm: number,
    ceilingClearanceMm: number,
    centroid: BuildingCentroid,
    wallMaterial: THREE.Material,
    selectedObjectId: string | null
  ): THREE.Group {
    const wallGroup = new THREE.Group();
    wallGroup.name = `Walls_${room.id}`;

    const rWM = BuildingCoordinateSystem.toMetres(room.width);
    const rDM = BuildingCoordinateSystem.toMetres(room.height);
    const heightM = BuildingCoordinateSystem.toMetres(ceilingClearanceMm);
    const wallThicknessM = BuildingCoordinateSystem.toMetres(this.INTERIOR_WALL_THICKNESS_MM);

    // Room center in world coordinates
    const rX = BuildingCoordinateSystem.toMetres(room.position.x + room.width / 2 - centroid.xMm);
    const rZ = BuildingCoordinateSystem.toMetres(room.position.y + room.height / 2 - centroid.zMm);
    const wallBaseY = BuildingCoordinateSystem.toMetres(finishedFloorElevationMm) + heightM / 2;

    const isSelected = selectedObjectId === room.id;
    const finalMat = isSelected
      ? new THREE.MeshStandardMaterial({ color: 0xF2E4C9, roughness: 0.5 })
      : wallMaterial;

    // 1. North Wall
    const northGeo = new THREE.BoxGeometry(rWM, heightM, wallThicknessM);
    const northMesh = new THREE.Mesh(northGeo, finalMat);
    northMesh.position.set(rX, wallBaseY, rZ - rDM / 2 + wallThicknessM / 2);
    northMesh.castShadow = true;
    northMesh.receiveShadow = true;
    northMesh.userData = { id: `wall-${room.id}-n`, type: 'wall', roomId: room.id };
    wallGroup.add(northMesh);

    // 2. South Wall
    const southGeo = new THREE.BoxGeometry(rWM, heightM, wallThicknessM);
    const southMesh = new THREE.Mesh(southGeo, finalMat);
    southMesh.position.set(rX, wallBaseY, rZ + rDM / 2 - wallThicknessM / 2);
    southMesh.castShadow = true;
    southMesh.receiveShadow = true;
    southMesh.userData = { id: `wall-${room.id}-s`, type: 'wall', roomId: room.id };
    wallGroup.add(southMesh);

    // 3. West Wall
    const westGeo = new THREE.BoxGeometry(wallThicknessM, heightM, rDM - wallThicknessM * 2);
    const westMesh = new THREE.Mesh(westGeo, finalMat);
    westMesh.position.set(rX - rWM / 2 + wallThicknessM / 2, wallBaseY, rZ);
    westMesh.castShadow = true;
    westMesh.receiveShadow = true;
    westMesh.userData = { id: `wall-${room.id}-w`, type: 'wall', roomId: room.id };
    wallGroup.add(westMesh);

    // 4. East Wall
    const eastGeo = new THREE.BoxGeometry(wallThicknessM, heightM, rDM - wallThicknessM * 2);
    const eastMesh = new THREE.Mesh(eastGeo, finalMat);
    eastMesh.position.set(rX + rWM / 2 - wallThicknessM / 2, wallBaseY, rZ);
    eastMesh.castShadow = true;
    eastMesh.receiveShadow = true;
    eastMesh.userData = { id: `wall-${room.id}-e`, type: 'wall', roomId: room.id };
    wallGroup.add(eastMesh);

    return wallGroup;
  }
}


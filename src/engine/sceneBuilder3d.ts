/**
 * SENSORY JAPAN — Three.js Dynamic Architectural Scene Builder
 * 
 * Generates true 3D architectural geometry from the single source of truth in projectStore:
 * - Centralized BuildingCoordinateSystem with common building centroid anchoring
 * - Dynamic FloorElevationManager vertical datums: slab thickness, finished floor, ceiling
 * - SlabGeometryGenerator & WallGeometryGenerator
 * - StaircaseGeometryGenerator for connecting multi-story vertical flights
 * - 3D Tatami Mats with authentic woven rush & cloth borders (Heri 縁)
 * - Structural Wooden Post-and-Beam Columns (105x105mm Zairai 軸組構法)
 * - Translucent Shoji Screens & Opaque Fusuma Sliding Partitions
 * - Authentic Japanese Roofs (Kirizuma 切妻, Yosemune 寄棟, Katanagare 片流れ, Flat 陸屋根)
 * - Purely visual Exploded Floor Isometric & Cutaway View transformations
 * - Bidirectional object picking (clicking 3D meshes selects architectural object IDs)
 */

import * as THREE from 'three';
import { Project, Floor, Room } from '../types/architectural';
import { JapaneseMaterialsLibrary } from './materials3d';
import { BuildingCoordinateSystem, BuildingCentroid } from './BuildingCoordinateSystem';
import { FloorElevationManager, CalculatedFloorElevation } from './FloorElevationManager';
import { SlabGeometryGenerator } from './SlabGeometryGenerator';
import { WallGeometryGenerator } from './WallGeometryGenerator';
import { StaircaseGeometryGenerator } from './StaircaseGeometryGenerator';
import { computeFloorBoundingBox } from './geometry';

export interface Scene3DOptions {
  viewMode: 'full' | 'floor_isolated' | 'exploded' | 'cutaway' | 'wireframe';
  activeFloorId?: string;
  showRoof: boolean;
  showTatami: boolean;
  showStructuralFraming: boolean;
  selectedObjectId: string | null;
}

export function buildArchitectural3DScene(
  project: Project,
  options: Scene3DOptions
): THREE.Group {
  const materials = JapaneseMaterialsLibrary.getInstance();
  const rootGroup = new THREE.Group();
  rootGroup.name = 'SensoryBuildingRoot';

  // 1. CALCULATE COMMON BUILDING CENTROID
  // All floors, slabs, walls and stairs are anchored to this single centroid.
  const centroid: BuildingCentroid = BuildingCoordinateSystem.computeBuildingCentroid(project);

  // 2. CENTRALIZED VERTICAL ELEVATIONS
  const floorDatums: CalculatedFloorElevation[] = FloorElevationManager.calculateFloorElevations(project);

  const toM = (mm: number) => mm / 1000;
  const toWorldX = (xMm: number) => (xMm - centroid.xMm) / 1000;
  const toWorldZ = (yMm: number) => (yMm - centroid.zMm) / 1000;

  // 3. SITE PLOT & ROAD PLANE
  const plotGroup = new THREE.Group();
  plotGroup.name = 'SitePlot';

  const plotWM = toM(project.plot.width);
  const plotDM = toM(project.plot.depth);
  const plotCenterX = toWorldX(project.plot.width / 2);
  const plotCenterZ = toWorldZ(project.plot.depth / 2);

  // Ground Plane
  const groundGeo = new THREE.PlaneGeometry(plotWM + 8, plotDM + 8);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xE8E3D8, roughness: 0.95 });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(plotCenterX, -0.05, plotCenterZ);
  groundMesh.receiveShadow = true;
  plotGroup.add(groundMesh);

  // Plot Boundary Line
  const boundaryGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(plotCenterX - plotWM / 2, 0.01, plotCenterZ - plotDM / 2),
    new THREE.Vector3(plotCenterX + plotWM / 2, 0.01, plotCenterZ - plotDM / 2),
    new THREE.Vector3(plotCenterX + plotWM / 2, 0.01, plotCenterZ + plotDM / 2),
    new THREE.Vector3(plotCenterX - plotWM / 2, 0.01, plotCenterZ + plotDM / 2),
    new THREE.Vector3(plotCenterX - plotWM / 2, 0.01, plotCenterZ - plotDM / 2),
  ]);
  const boundaryLine = new THREE.Line(
    boundaryGeo,
    new THREE.LineDashedMaterial({ color: 0x8C7E6D, dashSize: 0.5, gapSize: 0.25 })
  );
  boundaryLine.computeLineDistances();
  plotGroup.add(boundaryLine);

  // Front Road
  const roadWidthM = toM(project.plot.roadWidth || 4000);
  const roadGeo = new THREE.PlaneGeometry(plotWM + 12, roadWidthM);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x484E52, roughness: 0.8 });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  if (project.plot.roadDirection === 'south') {
    roadMesh.position.set(plotCenterX, -0.04, plotCenterZ + plotDM / 2 + roadWidthM / 2);
  } else {
    roadMesh.position.set(plotCenterX, -0.04, plotCenterZ - plotDM / 2 - roadWidthM / 2);
  }
  roadMesh.receiveShadow = true;
  plotGroup.add(roadMesh);

  rootGroup.add(plotGroup);

  // 4. CONCRETE FOUNDATION SLAB
  const groundFloor = project.floors.find((f) => f.level === '1F') || project.floors[0];
  if (groundFloor && groundFloor.rooms.length > 0) {
    const foundationMesh = SlabGeometryGenerator.generateFoundation(
      groundFloor.rooms,
      centroid,
      materials.foundationConcrete
    );
    if (foundationMesh) {
      rootGroup.add(foundationMesh);
    }
  }

  // 5. MULTI-FLOOR GENERATION
  const floorsToRender =
    options.viewMode === 'floor_isolated' && options.activeFloorId
      ? project.floors.filter((f) => f.id === options.activeFloorId)
      : project.floors;

  floorsToRender.forEach((floor, idx) => {
    const datum = floorDatums.find((d) => d.floorId === floor.id) || {
      floorId: floor.id,
      level: floor.level,
      floorIndex: idx,
      baseElevationMm: floor.elevation || 0,
      floorToFloorHeightMm: floor.floorHeight || 2900,
      slabThicknessMm: floor.slabThickness || 150,
      finishedFloorElevationMm: (floor.elevation || 0) + (floor.slabThickness || 150),
      ceilingElevationMm: (floor.elevation || 0) + (floor.slabThickness || 150) + 2400,
      ceilingClearanceMm: 2400,
      structuralReferenceElevationMm: (floor.elevation || 0) + 2900,
    };

    const floorGroup = new THREE.Group();
    floorGroup.name = `Floor_${floor.level}`;

    // Visual exploded view offset (purely presentation transform)
    const explodedOffsetY = options.viewMode === 'exploded' ? idx * 3.8 : 0;
    floorGroup.position.y = explodedOffsetY;

    const baseElevationMm = datum.baseElevationMm;
    const slabThicknessM = toM(datum.slabThicknessMm);
    const ceilingClearanceM =
      options.viewMode === 'cutaway' ? 1.2 : toM(datum.ceilingClearanceMm);

    // Floor Slab Mesh
    const slabMesh = SlabGeometryGenerator.generateFloorSlab(
      floor,
      baseElevationMm,
      centroid,
      materials.foundationConcrete
    );
    if (slabMesh) {
      floorGroup.add(slabMesh);
    }

    // ROOMS, WALLS, TATAMI MATS & COLUMNS
    floor.rooms.forEach((room) => {
      const roomGroup = new THREE.Group();
      roomGroup.name = `Room_${room.id}`;
      roomGroup.userData = { id: room.id, type: 'room', name: room.name, floorId: floor.id };

      const rX = toWorldX(room.position.x + room.width / 2);
      const rZ = toWorldZ(room.position.y + room.height / 2);
      const rWM = toM(room.width);
      const rDM = toM(room.height);

      // Select Floor Surface Material
      let floorMat = materials.hinokiWood;
      if (room.floorMaterial === 'tatami_igusa') floorMat = materials.tatamiMat;
      else if (room.floorMaterial === 'concrete_doma') floorMat = materials.concreteDoma;
      else if (room.floorMaterial === 'hardwood_sugi') floorMat = materials.sugiCedar;
      else if (room.type === 'balcony' || room.type === 'engawa') floorMat = materials.balconyDeck;

      // Finished Floor Plane
      const floorPlaneGeo = new THREE.PlaneGeometry(rWM, rDM);
      const floorPlane = new THREE.Mesh(floorPlaneGeo, floorMat);
      floorPlane.rotation.x = -Math.PI / 2;
      const roomFloorY = toM(datum.finishedFloorElevationMm) + 0.005;
      floorPlane.position.set(rX, roomFloorY, rZ);
      floorPlane.receiveShadow = true;
      floorPlane.userData = { id: room.id, type: 'room', name: room.name };
      roomGroup.add(floorPlane);

      // 3D TATAMI MATS (For Washitsu)
      if (room.type === 'washitsu' && options.showTatami && room.tatamiConfig) {
        const koagariOffsetM = room.elevationOffset ? toM(room.elevationOffset) : 0;
        if (koagariOffsetM > 0) {
          const koagariGeo = new THREE.BoxGeometry(rWM, koagariOffsetM, rDM);
          const koagariMesh = new THREE.Mesh(koagariGeo, materials.hinokiWood);
          koagariMesh.position.set(rX, roomFloorY + koagariOffsetM / 2, rZ);
          koagariMesh.receiveShadow = true;
          koagariMesh.castShadow = true;
          roomGroup.add(koagariMesh);
        }

        const tatamiY = roomFloorY + koagariOffsetM + 0.025; // 50mm tatami height
        room.tatamiConfig.mats.forEach((mat) => {
          const matWM = toM(mat.width);
          const matDM = toM(mat.height);
          const matXM = toWorldX(room.position.x + mat.x + mat.width / 2);
          const matZM = toWorldZ(room.position.y + mat.y + mat.height / 2);

          const matGeo = new THREE.BoxGeometry(matWM - 0.004, 0.045, matDM - 0.004);
          const matMesh = new THREE.Mesh(matGeo, materials.tatamiMat);
          matMesh.position.set(matXM, tatamiY, matZM);
          matMesh.receiveShadow = true;
          matMesh.castShadow = true;
          roomGroup.add(matMesh);

          // Cloth borders (Heri 縁)
          const heriThicknessM = 0.028;
          if (mat.orientation === 'vertical') {
            const heriGeo = new THREE.BoxGeometry(heriThicknessM, 0.046, matDM);
            const heriLeft = new THREE.Mesh(heriGeo, materials.tatamiHeri);
            heriLeft.position.set(matXM - matWM / 2 + heriThicknessM / 2, tatamiY, matZM);
            const heriRight = new THREE.Mesh(heriGeo, materials.tatamiHeri);
            heriRight.position.set(matXM + matWM / 2 - heriThicknessM / 2, tatamiY, matZM);
            roomGroup.add(heriLeft, heriRight);
          } else {
            const heriGeo = new THREE.BoxGeometry(matWM, 0.046, heriThicknessM);
            const heriTop = new THREE.Mesh(heriGeo, materials.tatamiHeri);
            heriTop.position.set(matXM, tatamiY, matZM - matDM / 2 + heriThicknessM / 2);
            const heriBottom = new THREE.Mesh(heriGeo, materials.tatamiHeri);
            heriBottom.position.set(matXM, tatamiY, matZM + matDM / 2 - heriThicknessM / 2);
            roomGroup.add(heriTop, heriBottom);
          }
        });
      }

      // ROOM WALLS GENERATION
      const wallMat =
        options.viewMode === 'wireframe'
          ? new THREE.MeshBasicMaterial({ wireframe: true, color: 0x4A6585 })
          : materials.shikkuiPlaster;

      const wallsGroup = WallGeometryGenerator.generateRoomWalls(
        room,
        datum.finishedFloorElevationMm,
        datum.ceilingClearanceMm,
        centroid,
        wallMat,
        options.selectedObjectId
      );
      roomGroup.add(wallsGroup);

      // STRUCTURAL WOODEN POST-AND-BEAM COLUMNS (105x105mm Zairai 柱)
      if (options.showStructuralFraming) {
        const colSizeM = 0.105;
        const colGeo = new THREE.BoxGeometry(colSizeM, ceilingClearanceM, colSizeM);
        const colMat = materials.timberBeam;

        const corners = [
          [-rWM / 2 + colSizeM / 2, -rDM / 2 + colSizeM / 2],
          [rWM / 2 - colSizeM / 2, -rDM / 2 + colSizeM / 2],
          [rWM / 2 - colSizeM / 2, rDM / 2 - colSizeM / 2],
          [-rWM / 2 + colSizeM / 2, rDM / 2 - colSizeM / 2],
        ];

        const wallY = toM(datum.finishedFloorElevationMm) + ceilingClearanceM / 2;
        corners.forEach(([cx, cz]) => {
          const colMesh = new THREE.Mesh(colGeo, colMat);
          colMesh.position.set(rX + cx, wallY, rZ + cz);
          colMesh.castShadow = true;
          roomGroup.add(colMesh);
        });
      }

      // BALCONY RAILINGS
      if ((room.type === 'balcony' || room.type === 'engawa') && options.viewMode !== 'cutaway') {
        const railHeightM = 1.1; // 1,100mm standard railing height
        const railGeo = new THREE.BoxGeometry(rWM, railHeightM, 0.04);
        const railMesh = new THREE.Mesh(railGeo, materials.railingMetal);
        railMesh.position.set(rX, toM(datum.finishedFloorElevationMm) + railHeightM / 2, rZ + rDM / 2);
        railMesh.castShadow = true;
        roomGroup.add(railMesh);
      }

      floorGroup.add(roomGroup);
    });

    // PARAMETRIC STAIRCASES (Connect to upper floor)
    const stairElements = (floor.elements || []).filter(e => e.type === 'staircase');
    stairElements.forEach(stairEl => {
      const calc = StaircaseGeometryGenerator.calculateStairs(
        datum.floorToFloorHeightMm,
        stairEl.dimensions.width || 910,
        225
      );
      const stairGroup = StaircaseGeometryGenerator.generateStairMesh(
        calc,
        materials.hinokiWood,
        materials.timberBeam
      );
      const sX = toWorldX(stairEl.position.x + (stairEl.dimensions.width || 910) / 2);
      const sZ = toWorldZ(stairEl.position.y);
      const sY = toM(datum.finishedFloorElevationMm);
      stairGroup.position.set(sX, sY, sZ);
      floorGroup.add(stairGroup);
    });

    rootGroup.add(floorGroup);
  });

  // 6. JAPANESE ROOF GENERATION (Yane 屋根)
  if (options.showRoof && options.viewMode !== 'cutaway' && options.viewMode !== 'exploded') {
    const roofGroup = new THREE.Group();
    roofGroup.name = 'JapaneseRoof';

    const topDatum = floorDatums[floorDatums.length - 1];
    const roofBaseY = toM(topDatum.structuralReferenceElevationMm);

    const topFloor = project.floors[project.floors.length - 1];
    const allFloorRooms = topFloor.rooms.length > 0 ? topFloor.rooms : project.floors.flatMap(f => f.rooms);
    const rBox = computeFloorBoundingBox(allFloorRooms);

    // Eaves overhang (Noki 軒 800mm)
    const eaveM = 0.8;
    const roofWM = toM(rBox.width) + eaveM * 2;
    const roofDM = toM(rBox.height) + eaveM * 2;
    const roofCenterX = toWorldX(rBox.x + rBox.width / 2);
    const roofCenterZ = toWorldZ(rBox.y + rBox.height / 2);

    const roofType = project.buildingConfiguration.roofType || 'kirizuma';

    if (roofType === 'kirizuma') {
      // 切妻屋根 (Gable Roof)
      const roofPitchHeightM = 1.8;
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-roofWM / 2, 0);
      roofShape.lineTo(0, roofPitchHeightM);
      roofShape.lineTo(roofWM / 2, 0);
      roofShape.closePath();

      const extrudeSettings = { depth: roofDM, bevelEnabled: false };
      const gableGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      const gableMesh = new THREE.Mesh(gableGeo, materials.kawaraRoof);
      gableMesh.position.set(roofCenterX, roofBaseY, roofCenterZ - roofDM / 2);
      gableMesh.castShadow = true;
      gableMesh.receiveShadow = true;
      roofGroup.add(gableMesh);

      // Ridge Cap (棟瓦 Munegawara)
      const ridgeGeo = new THREE.BoxGeometry(0.25, 0.15, roofDM + 0.1);
      const ridgeMesh = new THREE.Mesh(ridgeGeo, materials.timberBeam);
      ridgeMesh.position.set(roofCenterX, roofBaseY + roofPitchHeightM + 0.08, roofCenterZ);
      roofGroup.add(ridgeMesh);
    } else if (roofType === 'yosemune') {
      // 寄棟屋根 (4-Pitch Hip Roof)
      const roofPitchHeightM = 1.6;
      const hipGeo = new THREE.ConeGeometry(Math.max(roofWM, roofDM) * 0.7, roofPitchHeightM, 4);
      const hipMesh = new THREE.Mesh(hipGeo, materials.kawaraRoof);
      hipMesh.rotation.y = Math.PI / 4;
      hipMesh.position.set(roofCenterX, roofBaseY + roofPitchHeightM / 2, roofCenterZ);
      hipMesh.castShadow = true;
      roofGroup.add(hipMesh);
    } else {
      // 陸屋根 (Flat Roof with Parapet)
      const parapetGeo = new THREE.BoxGeometry(roofWM, 0.45, roofDM);
      const parapetMesh = new THREE.Mesh(parapetGeo, materials.shikkuiPlaster);
      parapetMesh.position.set(roofCenterX, roofBaseY + 0.225, roofCenterZ);
      parapetMesh.castShadow = true;
      roofGroup.add(parapetMesh);
    }

    rootGroup.add(roofGroup);
  }

  return rootGroup;
}

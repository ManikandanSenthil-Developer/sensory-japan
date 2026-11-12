/**
 * SENSORY JAPAN — Critical Architectural Engineering Verification Suite
 * 
 * Verifies all 10 core architectural requirements:
 * 1. Multi-Floor Centralized Coordinate Alignment
 * 2. Floor Height Change & Elevation Cascade
 * 3. Negative / Zero Dimension Rejection
 * 4. Plot Boundary & Setback Envelope Enforcement
 * 5. Structural Column Alignment & Transfer Girder Diagnostics
 * 6. Staircase Statutory Height & Riser Calculation (BSL Art. 23)
 * 7. Wall and Slab Geometric Vertical Termination
 * 8. Transactional Undo / Redo Resilience
 * 9. Persistence & Elevation Recalculation
 * 10. 2D / 3D Coordinate Synchronization & Centroid Stability
 */

import { createTwoStoreyFamilyHouse } from '../../data/templates';
import { BuildingCoordinateSystem } from '../BuildingCoordinateSystem';
import { FloorElevationManager } from '../FloorElevationManager';
import { ArchitecturalConstraintEngine } from '../ArchitecturalConstraintEngine';
import { GeometryValidationService } from '../GeometryValidationService';
import { StructuralAlignmentChecker } from '../StructuralAlignmentChecker';
import { StaircaseGeometryGenerator } from '../StaircaseGeometryGenerator';
import { SlabGeometryGenerator } from '../SlabGeometryGenerator';
import { WallGeometryGenerator } from '../WallGeometryGenerator';
import { useProjectStore } from '../../store/projectStore';
import * as THREE from 'three';

// Mock localStorage for Node environment if needed
if (typeof localStorage === 'undefined') {
  const storeMap = new Map<string, string>();
  (global as any).localStorage = {
    getItem: (key: string) => storeMap.get(key) || null,
    setItem: (key: string, val: string) => storeMap.set(key, val),
    removeItem: (key: string) => storeMap.delete(key),
    clear: () => storeMap.clear(),
  };
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passedCount++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

console.log('================================================================');
console.log('SENSORY JAPAN — 10 CRITICAL ARCHITECTURAL VERIFICATION TESTS');
console.log('================================================================\n');

// Reset store
const initialProj = createTwoStoreyFamilyHouse();
useProjectStore.getState().loadProject(initialProj);

// TEST 1: Multi-Floor Centralized Coordinate Alignment
console.log('TEST 1: Multi-Floor Alignment System & Common Centroid');
{
  const project = useProjectStore.getState().project;
  const centroid = BuildingCoordinateSystem.computeBuildingCentroid(project);
  assert(centroid.xMm > 0 && centroid.zMm > 0, 'Building centroid computed from footprint', `Centroid: (${centroid.xMm}, ${centroid.zMm})`);

  const f1Room = project.floors[0].rooms[0];
  const f2Room = project.floors[1].rooms[0];

  const v1 = BuildingCoordinateSystem.mmToThreeM(f1Room.position.x, 0, f1Room.position.y, centroid);
  const v2 = BuildingCoordinateSystem.mmToThreeM(f2Room.position.x, 2900, f2Room.position.y, centroid);

  assert(v1.y === 0, '1F Base elevation in Three.js equals 0.0m');
  assert(v2.y === 2.9, '2F Base elevation in Three.js equals 2.9m');

  const back1 = BuildingCoordinateSystem.threeMToMm(v1, centroid);
  assert(back1.x === f1Room.position.x && back1.z === f1Room.position.y, 'Round-trip Three.js to mm conversion retains exact integers');
}

// TEST 2: Centralized Floor Elevation Calculation & Cascade
console.log('\nTEST 2: Centralized Floor Elevation Calculation & Cascade');
{
  const store = useProjectStore.getState();
  const floor1 = store.project.floors.find(f => f.level === '1F')!;
  const floor2 = store.project.floors.find(f => f.level === '2F')!;

  assert(floor1.elevation === 0, 'Initial 1F elevation is 0 mm');
  assert(floor2.elevation === 2900, 'Initial 2F elevation is 2900 mm');

  // Change 1F height from 2900 to 3200mm
  const success = store.updateFloorHeight(floor1.id, 3200);
  assert(success, 'Floor height update transaction accepted');

  const updatedState = useProjectStore.getState();
  const updatedFloor2 = updatedState.project.floors.find(f => f.level === '2F')!;
  assert(updatedFloor2.elevation === 3200, '2F base elevation automatically cascaded to 3200 mm');

  const datums = FloorElevationManager.calculateFloorElevations(updatedState.project);
  const d2 = datums.find(d => d.level === '2F')!;
  assert(d2.baseElevationMm === 3200, 'FloorElevationManager returns baseElevationMm = 3200 mm');
  assert(d2.finishedFloorElevationMm === 3200 + updatedFloor2.slabThickness, 'Finished floor elevation matches base + slab');

  // Revert back to 2900mm for subsequent tests
  store.updateFloorHeight(floor1.id, 2900);
}

// TEST 3: Negative / Zero Dimension Rejection
console.log('\nTEST 3: Architectural Constraint Engine & Negative/Zero Rejection');
{
  const store = useProjectStore.getState();
  const room = store.project.floors[0].rooms[0];
  const origW = room.width;
  const origH = room.height;

  // Negative width
  const negResult = store.resizeRoom(room.id, -400, 3000);
  assert(!negResult, 'Negative width (-400mm) strictly blocked by constraint engine');
  assert(useProjectStore.getState().lastValidationError?.includes('Invalid room dimensions') === true, 'Validation error recorded for negative width');

  // Zero height
  const zeroResult = store.resizeRoom(room.id, 2000, 0);
  assert(!zeroResult, 'Zero height (0mm) strictly blocked by constraint engine');

  // Below modular minimum (< 910mm)
  const tinyResult = store.resizeRoom(room.id, 500, 500);
  assert(!tinyResult, 'Dimension below 910mm minimum modular bay blocked');

  // State verified intact
  const currentRoom = useProjectStore.getState().project.floors[0].rooms[0];
  assert(currentRoom.width === origW && currentRoom.height === origH, 'Room dimensions preserved intact without corruption');
}

// TEST 4: Plot Boundary & Legal Setback Envelope
console.log('\nTEST 4: Plot Boundary & Legal Setback Envelope Enforcement');
{
  const store = useProjectStore.getState();
  const room = store.project.floors[0].rooms[0];
  const origPos = { ...room.position };

  // Attempt to move past left setback (plot.setbacks.left is 910mm, move to 100mm)
  const breachLeft = store.moveRoom(room.id, { x: 100, y: 3000 });
  assert(!breachLeft, 'Room breach past left plot setback rejected');
  assert(useProjectStore.getState().lastValidationError?.includes('Left breach') === true, 'Exact millimeter setback breach reported in error diagnostic');

  // Attempt to move beyond plot width
  const breachRight = store.moveRoom(room.id, { x: 25000, y: 3000 });
  assert(!breachRight, 'Room placement beyond plot width rejected');

  // State verified intact
  const currentRoom = useProjectStore.getState().project.floors[0].rooms[0];
  assert(currentRoom.position.x === origPos.x && currentRoom.position.y === origPos.y, 'Room position preserved intact without movement');
}

// TEST 5: Structural Column Alignment & Transfer Diagnostics
console.log('\nTEST 5: Structural Column Alignment & Transfer Diagnostics');
{
  const project = JSON.parse(JSON.stringify(useProjectStore.getState().project));
  project.floors[0].elements = [
    {
      id: 'col_1F',
      floorId: project.floors[0].id,
      type: 'column',
      position: { x: 3640, y: 3640 },
      dimensions: { width: 105, height: 105 },
      rotation: 0,
    },
  ];
  project.floors[1].elements = [
    {
      id: 'col_2F_aligned',
      floorId: project.floors[1].id,
      type: 'column',
      position: { x: 3640, y: 3640 },
      dimensions: { width: 105, height: 105 },
      rotation: 0,
    },
    {
      id: 'col_2F_unaligned',
      floorId: project.floors[1].id,
      type: 'column',
      position: { x: 7280, y: 7280 },
      dimensions: { width: 105, height: 105 },
      rotation: 0,
    },
  ];

  const report = StructuralAlignmentChecker.auditStructuralAlignment(project);
  assert(report.totalColumnsAudited === 2, 'Audited 2 upper floor columns');
  assert(report.alignedColumnsCount === 1, 'Correctly detected 1 vertically continuous column');
  assert(report.unalignedColumnsCount === 1, 'Correctly detected 1 floating column');
  assert(report.issues[0].issueType === 'floating_column', 'Generated transfer girder warning for unaligned column');
}

// TEST 6: Staircase Statutory Height & Riser Calculation (BSL Art. 23)
console.log('\nTEST 6: Staircase Statutory Height & Riser Calculation (BSL Art. 23)');
{
  const calc = StaircaseGeometryGenerator.calculateStairs(2900, 910, 225);
  assert(calc.floorToFloorHeightMm === 2900, 'Calculated for story height 2900 mm');
  assert(calc.riserCount === 15, 'Derived exact riser count N = 15 (round(2900/200))');
  assert(calc.riserHeightMm <= 230, `Riser height (${calc.riserHeightMm}mm) complies with BSL Art. 23 (<= 230mm)`);
  assert(calc.stairWidthMm >= 750, `Stair width (${calc.stairWidthMm}mm) complies with BSL Art. 23 (>= 750mm)`);
  assert(calc.treadDepthMm >= 150, `Tread depth (${calc.treadDepthMm}mm) complies with BSL Art. 23 (>= 150mm)`);
  assert(calc.slabVoidBoundsMm.width > calc.stairWidthMm, 'Upper floor slab cutout void width includes clearance');
  assert(calc.slabVoidBoundsMm.depth > calc.totalRunMm, 'Upper floor slab cutout void depth accommodates stairwell headroom');
}

// TEST 7: Wall and Slab Geometric Vertical Termination
console.log('\nTEST 7: Wall and Slab Geometric Vertical Termination');
{
  const project = useProjectStore.getState().project;
  const centroid = BuildingCoordinateSystem.computeBuildingCentroid(project);
  const datums = FloorElevationManager.calculateFloorElevations(project);
  const f1Datum = datums[0];

  const dummyMat = new THREE.MeshBasicMaterial();
  const slab = SlabGeometryGenerator.generateFloorSlab(project.floors[0], f1Datum.baseElevationMm, centroid, dummyMat);
  assert(slab !== null, 'Floor slab successfully generated');
  assert(slab!.position.y === f1Datum.slabThicknessMm / 2000, '1F Slab top terminates at finished floor datum');

  const room = project.floors[0].rooms[0];
  const walls = WallGeometryGenerator.generateRoomWalls(
    room,
    f1Datum.finishedFloorElevationMm,
    f1Datum.ceilingClearanceMm,
    centroid,
    dummyMat,
    null
  );
  assert(walls.children.length === 4, 'Generated 4 boundary wall segments');
  const expectedCenterY = (f1Datum.finishedFloorElevationMm + f1Datum.ceilingClearanceMm / 2) / 1000;
  assert(Math.abs(walls.children[0].position.y - expectedCenterY) < 0.001, 'Walls coordinate perfectly with finished floor and ceiling clearance');
}

// TEST 8: Transactional Undo / Redo Resilience
console.log('\nTEST 8: Transactional Undo / Redo Resilience');
{
  const store = useProjectStore.getState();
  const room = store.project.floors[0].rooms[0];
  const initW = room.width;

  // Perform valid mutation
  const vMut = store.resizeRoom(room.id, 3640, 3640);
  assert(vMut === true, 'Valid mutation executed');
  assert(useProjectStore.getState().project.floors[0].rooms[0].width === 3640, 'Width updated to 3640mm');

  const pastLenBefore = useProjectStore.getState().past.length;

  // Perform invalid mutation
  const invMut = store.resizeRoom(room.id, -200, 3640);
  assert(invMut === false, 'Invalid mutation rejected');
  assert(useProjectStore.getState().past.length === pastLenBefore, 'Undo past stack NOT modified by failed mutation');

  // Undo reverts to initial state
  store.undo();
  assert(useProjectStore.getState().project.floors[0].rooms[0].width === initW, 'Undo smoothly reverted to original 2730mm');

  // Redo re-applies valid mutation
  store.redo();
  assert(useProjectStore.getState().project.floors[0].rooms[0].width === 3640, 'Redo smoothly recovered valid 3640mm state');
}

// TEST 9: Persistence & Elevation Recalculation
console.log('\nTEST 9: Persistence & Elevation Recalculation');
{
  const store = useProjectStore.getState();
  store.saveProjectToStorage();

  const loaded = store.loadProjectFromStorage();
  assert(loaded === true, 'Project successfully reloaded from localStorage');

  const loadedProj = useProjectStore.getState().project;
  assert(loadedProj.floors.length === 2, 'Both floors preserved');
  assert(loadedProj.floors[0].elevation === 0, '1F base elevation is 0mm');
  assert(loadedProj.floors[1].elevation === 2900, '2F base elevation is 2900mm');
}

// TEST 10: 2D / 3D Coordinate Synchronization & Centroid Stability
console.log('\nTEST 10: 2D / 3D Coordinate Synchronization & Centroid Stability');
{
  const project = useProjectStore.getState().project;
  const centroid = BuildingCoordinateSystem.computeBuildingCentroid(project);
  const room = project.floors[0].rooms[0];

  const threeVec = BuildingCoordinateSystem.mmToThreeM(
    room.position.x + room.width / 2,
    0,
    room.position.y + room.height / 2,
    centroid
  );

  const backPt = BuildingCoordinateSystem.threeMToMm(threeVec, centroid);
  assert(backPt.x === room.position.x + room.width / 2, '2D Center X equals 3D World X * 1000');
  assert(backPt.z === room.position.y + room.height / 2, '2D Center Y equals 3D World Z * 1000');

  // Full validation audit check
  const fullAudit = GeometryValidationService.validateFullProject(project);
  assert(fullAudit.overallStatus !== 'RED', 'Full project passes architectural integrity validation');
}

console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('================================================================');

if (failedCount > 0) {
  process.exit(1);
}

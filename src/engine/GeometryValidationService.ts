/**
 * SENSORY JAPAN — Geometry Validation Service
 * 
 * Provides transactional validation guards before mutating architectural models:
 * - Pre-validates room resizing, room moving, and story height alterations
 * - Categorizes results into hard errors (block transaction) and soft warnings (advisory)
 * - Returns precise millimetric diagnostics for UI alerts and test verifications
 */

import { Project, Floor, Room } from '../types/architectural';
import {
  ArchitecturalConstraintEngine,
  ConstraintViolation,
  DEFAULT_CONSTRAINT_CONFIG,
} from './ArchitecturalConstraintEngine';
import { FloorElevationManager } from './FloorElevationManager';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  violations: ConstraintViolation[];
}

export interface ComprehensiveValidationReport {
  overallStatus: 'GREEN' | 'AMBER' | 'RED';
  geometryValid: boolean;
  floorAlignmentValid: boolean;
  structuralValid: boolean;
  boundaryValid: boolean;
  errors: string[];
  warnings: string[];
  violations: ConstraintViolation[];
}

export class GeometryValidationService {
  private static engine = new ArchitecturalConstraintEngine();

  /**
   * Pre-validates a proposed room resize operation.
   */
  public static validateRoomResize(
    room: Room,
    newWidthMm: number,
    newHeightMm: number,
    floor: Floor,
    project: Project
  ): ValidationReport {
    const violations: ConstraintViolation[] = [];

    // 1. Dimension constraints
    const dimViolations = this.engine.evaluateRoomDimensionConstraints(room.id, newWidthMm, newHeightMm);
    violations.push(...dimViolations);

    // 2. Plot boundary check with new dimensions
    const proposedRoomBounds = {
      id: room.id,
      position: room.position,
      width: newWidthMm,
      height: newHeightMm,
    };
    const boundaryViolations = this.engine.evaluatePlotBoundaryConstraints(project.plot, proposedRoomBounds);
    violations.push(...boundaryViolations);

    const errors = violations.filter(v => v.severity === 'error').map(v => v.message);
    const warnings = violations.filter(v => v.severity === 'warning').map(v => v.message);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      violations,
    };
  }

  /**
   * Pre-validates a proposed room position move.
   */
  public static validateRoomMove(
    room: Room,
    newPosMm: { x: number; y: number },
    floor: Floor,
    project: Project
  ): ValidationReport {
    const violations: ConstraintViolation[] = [];

    const proposedRoomBounds = {
      id: room.id,
      position: newPosMm,
      width: room.width,
      height: room.height,
    };

    const boundaryViolations = this.engine.evaluatePlotBoundaryConstraints(project.plot, proposedRoomBounds);
    violations.push(...boundaryViolations);

    const errors = violations.filter(v => v.severity === 'error').map(v => v.message);
    const warnings = violations.filter(v => v.severity === 'warning').map(v => v.message);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      violations,
    };
  }

  /**
   * Pre-validates changing a floor-to-floor height.
   */
  public static validateFloorHeightChange(
    floor: Floor,
    proposedHeightMm: number,
    project: Project
  ): ValidationReport {
    const violations: ConstraintViolation[] = [];

    if (proposedHeightMm <= 0) {
      violations.push({
        id: `floor_height_non_pos_${floor.id}`,
        code: 'ERR_NON_POSITIVE_FLOOR_HEIGHT',
        category: 'elevation',
        severity: 'error',
        message: `Story height must be greater than 0 mm (attempted ${proposedHeightMm} mm).`,
        targetId: floor.id,
      });
    }

    const minRequired = (floor.ceilingHeight || 2100) + (floor.slabThickness || 150);
    if (proposedHeightMm < minRequired) {
      violations.push({
        id: `floor_height_insufficient_${floor.id}`,
        code: 'ERR_FLOOR_HEIGHT_LESS_THAN_CEILING_PLUS_SLAB',
        category: 'elevation',
        severity: 'error',
        message: `Proposed story height (${proposedHeightMm} mm) cannot accommodate ceiling clearance (${floor.ceilingHeight} mm) and slab thickness (${floor.slabThickness} mm). Minimum required is ${minRequired} mm.`,
        targetId: floor.id,
      });
    }

    // Maximum height warning
    if (proposedHeightMm > FloorElevationManager.MAX_RECOMMENDED_STORY_HEIGHT_MM) {
      violations.push({
        id: `floor_height_high_${floor.id}`,
        code: 'WARN_HIGH_STORY_HEIGHT',
        category: 'elevation',
        severity: 'warning',
        message: `Story height (${proposedHeightMm} mm) exceeds standard residential practice (> 4,500 mm).`,
        targetId: floor.id,
      });
    }

    const errors = violations.filter(v => v.severity === 'error').map(v => v.message);
    const warnings = violations.filter(v => v.severity === 'warning').map(v => v.message);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      violations,
    };
  }

  /**
   * Performs an audit across the entire building project.
   */
  public static validateFullProject(project: Project): ComprehensiveValidationReport {
    const violations: ConstraintViolation[] = [];

    // 1. Elevation checks
    const elevResult = FloorElevationManager.validateElevations(project);
    for (const err of elevResult.errors) {
      violations.push({
        id: `elev_err_${Math.random()}`,
        code: 'ERR_ELEVATION',
        category: 'elevation',
        severity: 'error',
        message: err,
      });
    }
    for (const warn of elevResult.warnings) {
      violations.push({
        id: `elev_warn_${Math.random()}`,
        code: 'WARN_ELEVATION',
        category: 'elevation',
        severity: 'warning',
        message: warn,
      });
    }

    // 2. Room checks across all floors
    for (const floor of project.floors) {
      for (const room of floor.rooms) {
        // Dimension checks
        violations.push(...this.engine.evaluateRoomDimensionConstraints(room.id, room.width, room.height));
        // Boundary checks
        violations.push(...this.engine.evaluatePlotBoundaryConstraints(project.plot, room));
        // Tatami checks
        violations.push(...this.engine.evaluateTatamiConstraints(room));
      }
    }

    const errors = violations.filter(v => v.severity === 'error').map(v => v.message);
    const warnings = violations.filter(v => v.severity === 'warning').map(v => v.message);

    let overallStatus: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
    if (errors.length > 0) overallStatus = 'RED';
    else if (warnings.length > 0) overallStatus = 'AMBER';

    return {
      overallStatus,
      geometryValid: errors.filter(e => e.includes('dimension') || e.includes('Invalid room')).length === 0,
      floorAlignmentValid: elevResult.errors.length === 0,
      structuralValid: true,
      boundaryValid: errors.filter(e => e.includes('envelope') || e.includes('breach')).length === 0,
      errors,
      warnings,
      violations,
    };
  }
}


/**
 * SENSORY JAPAN — Floor Elevation Manager
 * 
 * Centralized vertical building coordinate and elevation service:
 * - Single source of truth for vertical building datums
 * - Ground floor base elevation: 0 mm
 * - Upper floor elevations derived strictly via cascading summation of floor-to-floor heights
 * - Calculates finished floor elevation, ceiling elevation, and structural top elevation
 * - Validates Japanese Building Standards Act (BSL Art. 21) minimum ceiling heights (>= 2100mm)
 */

import { Project, Floor, FloorLevel } from '../types/architectural';

export interface CalculatedFloorElevation {
  floorId: string;
  level: FloorLevel;
  floorIndex: number;
  baseElevationMm: number;               // Structural base elevation (mm)
  floorToFloorHeightMm: number;          // Story height (mm)
  slabThicknessMm: number;               // Concrete/timber slab thickness (mm)
  finishedFloorElevationMm: number;      // Top of finished floor (mm)
  ceilingElevationMm: number;            // Underside of ceiling finish (mm)
  ceilingClearanceMm: number;            // Usable ceiling height (mm)
  structuralReferenceElevationMm: number;// Top of structural frame before next story (mm)
}

export interface ElevationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class FloorElevationManager {
  public static readonly DEFAULT_FLOOR_HEIGHT_MM = 2900;
  public static readonly DEFAULT_CEILING_HEIGHT_MM = 2400;
  public static readonly DEFAULT_SLAB_THICKNESS_MM = 150;
  public static readonly MIN_LEGAL_CEILING_HEIGHT_MM = 2100; // Japanese BSL Art. 21
  public static readonly MAX_RECOMMENDED_STORY_HEIGHT_MM = 4500;

  /**
   * Sorts floors strictly in vertical order: B1 -> 1F -> 2F -> 3F ...
   */
  public static getFloorSortOrder(level: FloorLevel): number {
    switch (level) {
      case 'B1': return -1;
      case '1F': return 0;
      case '2F': return 1;
      case '3F': return 2;
      default: return 99;
    }
  }

  /**
   * Calculates comprehensive vertical datums for every floor in a project.
   */
  public static calculateFloorElevations(project: Project): CalculatedFloorElevation[] {
    const sortedFloors = [...project.floors].sort(
      (a, b) => this.getFloorSortOrder(a.level) - this.getFloorSortOrder(b.level)
    );

    const results: CalculatedFloorElevation[] = [];
    let currentBaseElevation = 0;

    // Handle B1 if present
    const basementFloor = sortedFloors.find(f => f.level === 'B1');
    if (basementFloor) {
      const bHeight = basementFloor.floorHeight || this.DEFAULT_FLOOR_HEIGHT_MM;
      const bSlab = basementFloor.slabThickness || this.DEFAULT_SLAB_THICKNESS_MM;
      const bCeiling = basementFloor.ceilingHeight || this.DEFAULT_CEILING_HEIGHT_MM;
      results.push({
        floorId: basementFloor.id,
        level: 'B1',
        floorIndex: -1,
        baseElevationMm: -bHeight,
        floorToFloorHeightMm: bHeight,
        slabThicknessMm: bSlab,
        finishedFloorElevationMm: -bHeight + bSlab,
        ceilingElevationMm: -bHeight + bSlab + bCeiling,
        ceilingClearanceMm: bCeiling,
        structuralReferenceElevationMm: 0,
      });
    }

    // Above-ground floors (1F, 2F, 3F, etc.)
    const aboveGroundFloors = sortedFloors.filter(f => f.level !== 'B1');
    for (let i = 0; i < aboveGroundFloors.length; i++) {
      const floor = aboveGroundFloors[i];
      const floorHeight = floor.floorHeight || this.DEFAULT_FLOOR_HEIGHT_MM;
      const slabThickness = floor.slabThickness || this.DEFAULT_SLAB_THICKNESS_MM;
      const ceilingHeight = floor.ceilingHeight || this.DEFAULT_CEILING_HEIGHT_MM;

      const baseElevation = currentBaseElevation;
      const finishedFloorElevation = baseElevation + slabThickness;
      const ceilingElevation = finishedFloorElevation + ceilingHeight;
      const structuralRefElevation = baseElevation + floorHeight;

      results.push({
        floorId: floor.id,
        level: floor.level,
        floorIndex: i,
        baseElevationMm: baseElevation,
        floorToFloorHeightMm: floorHeight,
        slabThicknessMm: slabThickness,
        finishedFloorElevationMm: finishedFloorElevation,
        ceilingElevationMm: ceilingElevation,
        ceilingClearanceMm: ceilingHeight,
        structuralReferenceElevationMm: structuralRefElevation,
      });

      // Cascade to next floor
      currentBaseElevation += floorHeight;
    }

    return results;
  }

  /**
   * Cascades elevation calculations into the project's floor data models.
   * Modifies each floor.elevation in place on the clone so all consumers have
   * mathematically coordinated vertical datums.
   */
  public static recalculateProjectElevations(project: Project): Project {
    const calculated = this.calculateFloorElevations(project);
    const updatedFloors = project.floors.map(floor => {
      const datum = calculated.find(c => c.floorId === floor.id);
      if (!datum) return floor;

      return {
        ...floor,
        elevation: datum.baseElevationMm,
        floorHeight: datum.floorToFloorHeightMm,
        slabThickness: datum.slabThicknessMm,
        ceilingHeight: datum.ceilingClearanceMm,
      };
    });

    return {
      ...project,
      floors: updatedFloors,
    };
  }

  /**
   * Validates floor elevations against statutory standards and architectural limits.
   */
  public static validateElevations(project: Project): ElevationValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const calculated = this.calculateFloorElevations(project);

    for (const item of calculated) {
      if (item.floorToFloorHeightMm <= 0) {
        errors.push(`Floor ${item.level}: Floor-to-floor height must be greater than 0 mm (found ${item.floorToFloorHeightMm} mm).`);
      }

      if (item.ceilingClearanceMm < this.MIN_LEGAL_CEILING_HEIGHT_MM) {
        errors.push(
          `Floor ${item.level}: Ceiling height (${item.ceilingClearanceMm} mm) violates Japanese BSL Article 21 (minimum 2,100 mm).`
        );
      }

      if (item.ceilingClearanceMm + item.slabThicknessMm > item.floorToFloorHeightMm) {
        errors.push(
          `Floor ${item.level}: Ceiling height (${item.ceilingClearanceMm} mm) + slab (${item.slabThicknessMm} mm) exceeds floor-to-floor height (${item.floorToFloorHeightMm} mm).`
        );
      }

      if (item.floorToFloorHeightMm > this.MAX_RECOMMENDED_STORY_HEIGHT_MM) {
        warnings.push(
          `Floor ${item.level}: Story height exceeds standard residential practice (${item.floorToFloorHeightMm} mm > 4,500 mm).`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}


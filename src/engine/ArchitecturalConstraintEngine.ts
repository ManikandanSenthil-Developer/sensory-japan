/**
 * SENSORY JAPAN — Architectural Constraint Engine
 * 
 * Enforces geometric and statutory integrity across the building model:
 * - Hard Constraints: Strictly block operations, protect model integrity, prevent negative/zero dimensions,
 *   prevent plot boundary breaches, enforce minimum statutory stair/ceiling standards.
 * - Soft Constraints: Non-blocking architectural guidance, flagging atypical proportions,
 *   structural misalignment, or non-optimal tatami sizing.
 */

import { PlotConfiguration, Room } from '../types/architectural';

export type ConstraintSeverity = 'error' | 'warning' | 'info';

export interface ConstraintViolation {
  id: string;
  code: string;
  category: 'dimension' | 'boundary' | 'elevation' | 'structure' | 'tatami' | 'staircase';
  severity: ConstraintSeverity;
  message: string;
  details?: string;
  targetId?: string;
}

export interface ConstraintEngineConfig {
  minRoomDimensionMm: number;
  maxRoomDimensionMm: number;
  minWallThicknessMm: number;
  maxWallThicknessMm: number;
  minStairWidthMm: number;
  maxStairRiserMm: number;
  minCeilingHeightMm: number;
  maxAspectSlendernessRatio: number;
}

export const DEFAULT_CONSTRAINT_CONFIG: ConstraintEngineConfig = {
  minRoomDimensionMm: 910,       // 0.5 ken / standard minimum modular bay
  maxRoomDimensionMm: 20000,     // 20 metres
  minWallThicknessMm: 35,        // fusuma/shoji partition minimum
  maxWallThicknessMm: 400,       // maximum exterior RC wall
  minStairWidthMm: 750,          // Japanese BSL Art. 23 minimum stair width
  maxStairRiserMm: 230,          // Japanese BSL Art. 23 maximum riser height
  minCeilingHeightMm: 2100,      // Japanese BSL Art. 21 minimum ceiling height
  maxAspectSlendernessRatio: 4.5,// Alert if room aspect ratio exceeds 4.5:1
};

export class ArchitecturalConstraintEngine {
  private config: ConstraintEngineConfig;

  constructor(config: Partial<ConstraintEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONSTRAINT_CONFIG, ...config };
  }

  /**
   * Evaluates HARD constraints on room dimensions.
   * Throws or returns violations that MUST reject transactional edits.
   */
  public evaluateRoomDimensionConstraints(
    roomId: string,
    widthMm: number,
    heightMm: number
  ): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];

    // 1. Non-positive or zero check (Hard Error)
    if (widthMm <= 0 || heightMm <= 0) {
      violations.push({
        id: `dim_non_positive_${roomId}`,
        code: 'ERR_NON_POSITIVE_DIMENSION',
        category: 'dimension',
        severity: 'error',
        message: `Invalid room dimensions (${widthMm} x ${heightMm} mm). Dimensions must be strictly positive integers.`,
        targetId: roomId,
      });
      return violations;
    }

    // 2. Minimum modular dimension check (Hard Error)
    if (widthMm < this.config.minRoomDimensionMm || heightMm < this.config.minRoomDimensionMm) {
      violations.push({
        id: `dim_below_min_${roomId}`,
        code: 'ERR_DIMENSION_BELOW_MIN',
        category: 'dimension',
        severity: 'error',
        message: `Room dimension (${widthMm} x ${heightMm} mm) is smaller than allowable minimum of ${this.config.minRoomDimensionMm} mm.`,
        targetId: roomId,
      });
    }

    // 3. Maximum building dimension check (Hard Error)
    if (widthMm > this.config.maxRoomDimensionMm || heightMm > this.config.maxRoomDimensionMm) {
      violations.push({
        id: `dim_above_max_${roomId}`,
        code: 'ERR_DIMENSION_ABOVE_MAX',
        category: 'dimension',
        severity: 'error',
        message: `Room dimension (${widthMm} x ${heightMm} mm) exceeds allowable maximum of ${this.config.maxRoomDimensionMm} mm.`,
        targetId: roomId,
      });
    }

    // 4. Aspect Ratio Check (Soft Warning)
    const ratio = Math.max(widthMm / heightMm, heightMm / widthMm);
    if (ratio > this.config.maxAspectSlendernessRatio) {
      violations.push({
        id: `dim_aspect_ratio_${roomId}`,
        code: 'WARN_EXTREME_ASPECT_RATIO',
        category: 'dimension',
        severity: 'warning',
        message: `Unusual room slenderness ratio (${ratio.toFixed(1)}:1). Consider partitioning or adjusting dimensions.`,
        targetId: roomId,
      });
    }

    return violations;
  }

  /**
   * Evaluates plot boundary & setback envelope constraints (Hard Error if breached).
   */
  public evaluatePlotBoundaryConstraints(
    plot: PlotConfiguration,
    room: { position: { x: number; y: number }; width: number; height: number; id?: string }
  ): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];

    const minX = plot.setbacks.left;
    const maxX = plot.width - plot.setbacks.right;
    const isRoadSouth = plot.roadDirection === 'south';
    const minY = isRoadSouth ? plot.setbacks.rear : plot.setbacks.front;
    const maxY = isRoadSouth ? (plot.depth - plot.setbacks.front) : (plot.depth - plot.setbacks.rear);

    const roomLeft = room.position.x;
    const roomRight = room.position.x + room.width;
    const roomTop = room.position.y;
    const roomBottom = room.position.y + room.height;

    const overflows: string[] = [];
    if (roomLeft < minX) overflows.push(`Left breach: ${minX - roomLeft}mm past setback`);
    if (roomRight > maxX) overflows.push(`Right breach: ${roomRight - maxX}mm past setback`);
    if (roomTop < minY) overflows.push(`${isRoadSouth ? 'Rear' : 'Front'} breach: ${minY - roomTop}mm past setback`);
    if (roomBottom > maxY) overflows.push(`${isRoadSouth ? 'Front' : 'Rear'} breach: ${roomBottom - maxY}mm past setback`);

    if (overflows.length > 0) {
      violations.push({
        id: `boundary_breach_${room.id || 'room'}`,
        code: 'ERR_PLOT_BOUNDARY_BREACH',
        category: 'boundary',
        severity: 'error',
        message: `Buildable envelope violated: ${overflows.join(', ')}.`,
        details: `Buildable bounds: X [${minX}mm .. ${maxX}mm], Y [${minY}mm .. ${maxY}mm].`,
        targetId: room.id,
      });
    }

    return violations;
  }

  /**
   * Evaluates Tatami room proportions and modular compatibility.
   */
  public evaluateTatamiConstraints(room: Room): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    if (room.type !== 'washitsu') return violations;

    // Standard modular bay in Shakkan-ho is 910mm
    const modX = room.width % 910;
    const modY = room.height % 910;

    if (modX !== 0 || modY !== 0) {
      violations.push({
        id: `tatami_non_modular_${room.id}`,
        code: 'WARN_NON_MODULAR_TATAMI',
        category: 'tatami',
        severity: 'warning',
        message: `Washitsu room (${room.width} x ${room.height} mm) is not an exact multiple of 910 mm module. Wooden border (Itama 板間) will be inserted.`,
        targetId: room.id,
      });
    }

    return violations;
  }
}

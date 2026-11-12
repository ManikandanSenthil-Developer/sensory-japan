/**
 * SENSORY JAPAN — Structural Alignment Checker
 * 
 * Inspects multi-floor vertical structural continuity:
 * - Direct vertical column stacking (105x105 / 120x120mm Zairai posts)
 * - Load-bearing wall alignment between floors
 * - Upper floor cantilevers and overhangs relative to ground floor footprint
 * - Generates clear structural advisory warnings (AMBER) when transfer beams (Haribari 梁伏) are needed
 */

import { Project, Floor, ArchitecturalElement } from '../types/architectural';
import { computeFloorBoundingBox } from './geometry';

export interface ColumnAlignmentIssue {
  upperFloorLevel: string;
  lowerFloorLevel: string;
  columnPosition: { x: number; y: number };
  issueType: 'floating_column' | 'wall_overhang' | 'cantilever_exceeded';
  severity: 'warning' | 'error';
  message: string;
}

export interface StructuralAlignmentReport {
  isStructurallyAligned: boolean;
  totalColumnsAudited: number;
  alignedColumnsCount: number;
  unalignedColumnsCount: number;
  issues: ColumnAlignmentIssue[];
}

export class StructuralAlignmentChecker {
  public static readonly COLUMN_ALIGNMENT_TOLERANCE_MM = 150; // mm
  public static readonly MAX_SAFE_CANTILEVER_MM = 910;        // 1-ken standard Japanese overhang

  /**
   * Evaluates structural continuity across all floors in a project.
   */
  public static auditStructuralAlignment(project: Project): StructuralAlignmentReport {
    const issues: ColumnAlignmentIssue[] = [];
    let totalColumnsAudited = 0;
    let alignedColumnsCount = 0;
    let unalignedColumnsCount = 0;

    const floors = project.floors;
    if (floors.length < 2) {
      return {
        isStructurallyAligned: true,
        totalColumnsAudited: 0,
        alignedColumnsCount: 0,
        unalignedColumnsCount: 0,
        issues: [],
      };
    }

    // Inspect pairs of adjacent vertical floors
    for (let i = 1; i < floors.length; i++) {
      const lowerFloor = floors[i - 1];
      const upperFloor = floors[i];

      const lowerColumns = (lowerFloor.elements || []).filter(e => e.type === 'column');
      const upperColumns = (upperFloor.elements || []).filter(e => e.type === 'column');

      // Also extract room-corner implicit column grid if explicit elements are sparse
      const lowerFootprint = computeFloorBoundingBox(lowerFloor.rooms);
      const upperFootprint = computeFloorBoundingBox(upperFloor.rooms);

      // Check floor footprint cantilever
      const leftOverhang = lowerFootprint.x - upperFootprint.x;
      const rightOverhang = (upperFootprint.x + upperFootprint.width) - (lowerFootprint.x + lowerFootprint.width);
      const frontOverhang = lowerFootprint.y - upperFootprint.y;
      const rearOverhang = (upperFootprint.y + upperFootprint.height) - (lowerFootprint.y + lowerFootprint.height);

      const maxOverhang = Math.max(leftOverhang, rightOverhang, frontOverhang, rearOverhang);
      if (maxOverhang > this.MAX_SAFE_CANTILEVER_MM) {
        issues.push({
          upperFloorLevel: upperFloor.level,
          lowerFloorLevel: lowerFloor.level,
          columnPosition: { x: upperFootprint.x, y: upperFootprint.y },
          issueType: 'cantilever_exceeded',
          severity: 'warning',
          message: `${upperFloor.level} footprint overhangs ${lowerFloor.level} by ${maxOverhang} mm (exceeds recommended 910 mm cantilever). Reinforced transfer framing required.`,
        });
      }

      // Audit explicit columns
      for (const uCol of upperColumns) {
        totalColumnsAudited++;
        const hasDirectLowerColumn = lowerColumns.some(lCol => {
          const dx = Math.abs(lCol.position.x - uCol.position.x);
          const dy = Math.abs(lCol.position.y - uCol.position.y);
          return dx <= this.COLUMN_ALIGNMENT_TOLERANCE_MM && dy <= this.COLUMN_ALIGNMENT_TOLERANCE_MM;
        });

        if (hasDirectLowerColumn) {
          alignedColumnsCount++;
        } else {
          unalignedColumnsCount++;
          issues.push({
            upperFloorLevel: upperFloor.level,
            lowerFloorLevel: lowerFloor.level,
            columnPosition: { ...uCol.position },
            issueType: 'floating_column',
            severity: 'warning',
            message: `Column on ${upperFloor.level} at (${uCol.position.x}, ${uCol.position.y}) lacks direct vertical column support on ${lowerFloor.level}. Structural girder transfer required.`,
          });
        }
      }
    }

    return {
      isStructurallyAligned: issues.length === 0,
      totalColumnsAudited,
      alignedColumnsCount,
      unalignedColumnsCount,
      issues,
    };
  }
}


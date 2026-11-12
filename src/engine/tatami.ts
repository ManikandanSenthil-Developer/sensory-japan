/**
 * SENSORY JAPAN — Tatami Measurement & Layout Engine
 * 
 * Implements rigorous Japanese architectural standards:
 * - 4 Regional Systems: Kyoma (京間), Chukyoma (中京間), Edoma (江戸間), Danchima (団地間)
 * - Traditional Auspicious Layouts (Shukugi-jiki 祝儀敷き) preventing 4-mat cross intersections
 * - Tea-room spiral layout for 4.5-mat rooms (四畳半・卍敷き)
 * - Separation between physical mat dimensions and the 1畳 = 1.62 m² real-estate advertising standard
 * - Tsubo (坪), m², and mm precision coordinate calculations
 */

import { TatamiSystem, TatamiMat, TatamiMatCount, TatamiConfiguration } from '../types/architectural';

export interface SystemDimensions {
  system: TatamiSystem;
  japaneseName: string;
  kanji: string;
  region: string;
  lengthMm: number;
  widthMm: number;
  halfMatLengthMm: number;
  halfMatWidthMm: number;
  areaSqMeters: number;     // Physical area per full mat
  areaTsubo: number;
}

export const TATAMI_SYSTEMS: Record<TatamiSystem, SystemDimensions> = {
  kyoma: {
    system: 'kyoma',
    japaneseName: 'Kyoma',
    kanji: '京間（本間）',
    region: 'Kansai / Kyoto / Western Japan',
    lengthMm: 1910,
    widthMm: 955,
    halfMatLengthMm: 955,
    halfMatWidthMm: 955,
    areaSqMeters: (1910 * 955) / 1_000_000, // 1.82395 m²
    areaTsubo: ((1910 * 955) / 1_000_000) * 0.3025,
  },
  chukyoma: {
    system: 'chukyoma',
    japaneseName: 'Chukyoma',
    kanji: '中京間（三六間）',
    region: 'Nagoya / Aichi / Central Japan (1-ken = 1820mm)',
    lengthMm: 1820,
    widthMm: 910,
    halfMatLengthMm: 910,
    halfMatWidthMm: 910,
    areaSqMeters: (1820 * 910) / 1_000_000, // 1.6562 m² (exactly 0.5 Tsubo)
    areaTsubo: 0.5,
  },
  edoma: {
    system: 'edoma',
    japaneseName: 'Edoma',
    kanji: '江戸間（関東間）',
    region: 'Tokyo / Kanto / Eastern Japan',
    lengthMm: 1760,
    widthMm: 880,
    halfMatLengthMm: 880,
    halfMatWidthMm: 880,
    areaSqMeters: (1760 * 880) / 1_000_000, // 1.5488 m²
    areaTsubo: ((1760 * 880) / 1_000_000) * 0.3025,
  },
  danchima: {
    system: 'danchima',
    japaneseName: 'Danchima',
    kanji: '団地間（五六間）',
    region: 'Modern apartments / Public housing',
    lengthMm: 1700,
    widthMm: 850,
    halfMatLengthMm: 850,
    halfMatWidthMm: 850,
    areaSqMeters: (1700 * 850) / 1_000_000, // 1.445 m²
    areaTsubo: ((1700 * 850) / 1_000_000) * 0.3025,
  },
};

/**
 * Japanese Real Estate Fair Trade Commission advertising standard (不動産の表示に関する公正競争規約)
 * 1 畳 = exactly 1.62 m² of nominal floor area.
 * NOTE: This is strictly an advertising metric and never a universal physical mat size!
 */
export const ADVERTISING_TATAMI_SQM = 1.62;

/**
 * 1 Tsubo = 400 / 121 m² ≈ 3.305785 m²
 */
export const TSUBO_TO_SQM = 400 / 121;
export const SQM_TO_TSUBO = 121 / 400; // 0.3025

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

export function mmToMeters(mm: number): number {
  return mm / 1000;
}

export function metersToMm(meters: number): number {
  return Math.round(meters * 1000);
}

export function sqMetersToTsubo(sqm: number): number {
  return sqm * SQM_TO_TSUBO;
}

export function tsuboToSqMeters(tsubo: number): number {
  return tsubo * TSUBO_TO_SQM;
}

/**
 * Calculates physical floor area of tatami mats according to a chosen nominal system
 */
export function tatamiToPhysicalSqMeters(joCount: number, system: TatamiSystem): number {
  const sys = TATAMI_SYSTEMS[system];
  return joCount * sys.areaSqMeters;
}

/**
 * Calculates advertising standard tatami count (1.62 m² per jo)
 */
export function sqMetersToAdvertisingTatami(sqm: number): number {
  return sqm / ADVERTISING_TATAMI_SQM;
}

export function advertisingTatamiToSqMeters(joCount: number): number {
  return joCount * ADVERTISING_TATAMI_SQM;
}

/**
 * Converts area in m² to physical tatami count in a specific system
 */
export function sqMetersToPhysicalTatami(sqm: number, system: TatamiSystem): number {
  const sys = TATAMI_SYSTEMS[system];
  return sqm / sys.areaSqMeters;
}

// ============================================================================
// TRADITIONAL TATAMI PLACEMENT ENGINE
// ============================================================================

export interface RoomNominalDimensions {
  widthMm: number;
  heightMm: number;
}

/**
 * Returns nominal room dimensions (width & height in mm) for traditional jo counts.
 */
export function getStandardTatamiRoomDimensions(
  joCount: TatamiMatCount,
  system: TatamiSystem
): RoomNominalDimensions {
  const sys = TATAMI_SYSTEMS[system];
  const L = sys.lengthMm;
  const W = sys.widthMm;

  switch (joCount) {
    case 1:
      return { widthMm: W, heightMm: L };
    case 2:
      return { widthMm: W * 2, heightMm: L }; // 2 parallel mats (e.g. 1820 x 1820 in Chukyoma is 2xW by L)
    case 3:
      return { widthMm: W * 3, heightMm: L }; // 3 parallel mats
    case 4.5:
      // Square room: 3 x W wide by 3 x W high (= 1.5 ken x 1.5 ken)
      return { widthMm: W * 3, heightMm: W * 3 };
    case 6:
      // Standard 6-jo: 3 x W by 2 x L (= 2730 x 3640 mm in Chukyoma, or 1.5 ken x 2 ken)
      return { widthMm: W * 3, heightMm: L * 2 };
    case 8:
      // Standard 8-jo: 2 x L by 2 x L (= 3640 x 3640 mm in Chukyoma, or 2 ken x 2 ken)
      return { widthMm: L * 2, heightMm: L * 2 };
    case 10:
      // Standard 10-jo: 2 x L by 5 x W (= 3640 x 4550 mm in Chukyoma, or 2 ken x 2.5 ken)
      return { widthMm: L * 2, heightMm: W * 5 };
    default:
      return { widthMm: W * 3, heightMm: L * 2 };
  }
}

/**
 * Generates coordinate layouts for physical tatami mats within a room.
 * Implements traditional auspicious (祝儀敷き Shukugi-jiki) layouts.
 */
export function generateTatamiLayout(
  joCount: TatamiMatCount,
  system: TatamiSystem,
  customRoomWidthMm?: number,
  customRoomHeightMm?: number
): TatamiConfiguration {
  const sys = TATAMI_SYSTEMS[system];
  const L = sys.lengthMm; // e.g. 1820 mm
  const W = sys.widthMm;  // e.g. 910 mm
  const halfL = sys.halfMatLengthMm; // e.g. 910 mm
  const halfW = sys.halfMatWidthMm;  // e.g. 910 mm

  const mats: TatamiMat[] = [];

  if (joCount === 1) {
    mats.push({
      id: 'mat-1',
      x: 0,
      y: 0,
      width: W,
      height: L,
      isHalfMat: false,
      orientation: 'vertical',
    });
    return {
      system,
      matCount: 1,
      arrangementStyle: 'shukugi',
      mats,
    };
  }

  if (joCount === 2) {
    // 2 parallel vertical mats side-by-side
    mats.push(
      { id: 'mat-1', x: 0, y: 0, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      { id: 'mat-2', x: W, y: 0, width: W, height: L, isHalfMat: false, orientation: 'vertical' }
    );
    return {
      system,
      matCount: 2,
      arrangementStyle: 'shukugi',
      mats,
    };
  }

  if (joCount === 3) {
    // 3 parallel mats
    mats.push(
      { id: 'mat-1', x: 0, y: 0, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      { id: 'mat-2', x: W, y: 0, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      { id: 'mat-3', x: W * 2, y: 0, width: W, height: L, isHalfMat: false, orientation: 'vertical' }
    );
    return {
      system,
      matCount: 3,
      arrangementStyle: 'shukugi',
      mats,
    };
  }

  if (joCount === 4.5) {
    // 四畳半 (Yonjohan) Traditional Spiral / Pinwheel Layout
    // Room is (3 * W) by (3 * W). (e.g. 2730 x 2730 mm in Chukyoma)
    // 4 full mats rotate clockwise around 1 central half-mat (halfL x halfW = W x W).
    // Central half mat:
    mats.push({
      id: 'mat-center-half',
      x: W,
      y: W,
      width: halfW,
      height: halfL,
      isHalfMat: true,
      orientation: 'horizontal',
    });
    // Top mat (horizontal): across x: 0 to 2W, at y: 0
    mats.push({
      id: 'mat-top',
      x: 0,
      y: 0,
      width: L, // 2*W
      height: W,
      isHalfMat: false,
      orientation: 'horizontal',
    });
    // Right mat (vertical): at x: 2W, y: 0 to 2W
    mats.push({
      id: 'mat-right',
      x: W * 2,
      y: 0,
      width: W,
      height: L,
      isHalfMat: false,
      orientation: 'vertical',
    });
    // Bottom mat (horizontal): at x: W to 3W, y: 2W
    mats.push({
      id: 'mat-bottom',
      x: W,
      y: W * 2,
      width: L,
      height: W,
      isHalfMat: false,
      orientation: 'horizontal',
    });
    // Left mat (vertical): at x: 0, y: W to 3W
    mats.push({
      id: 'mat-left',
      x: 0,
      y: W,
      width: W,
      height: L,
      isHalfMat: false,
      orientation: 'vertical',
    });

    return {
      system,
      matCount: 4.5,
      arrangementStyle: 'spiral',
      mats,
    };
  }

  if (joCount === 6) {
    // 六畳 (Rokujo) Traditional Auspicious Shukugi-jiki (祝儀敷き)
    // Room size: (3 * W) wide by (2 * L = 4 * W) high
    // (e.g. 2730 mm width x 3640 mm height in Chukyoma)
    // Layout:
    // Left side: 2 vertical mats stacked: (0, 0) and (0, L)
    // Middle & Right:
    //   Top: 1 horizontal mat: x: W, y: 0, width: L (2W), height: W
    //   Middle: 2 vertical mats: (W, W) and (2W, W)
    //   Bottom: 1 horizontal mat: x: W, y: W + L, width: L (2W), height: W
    // Notice: NO 4 corners touch anywhere! All junctions are strict T-intersections.

    mats.push(
      // Left vertical 1
      { id: 'mat-1', x: 0, y: 0, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      // Left vertical 2
      { id: 'mat-2', x: 0, y: L, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      // Top horizontal
      { id: 'mat-3', x: W, y: 0, width: L, height: W, isHalfMat: false, orientation: 'horizontal' },
      // Middle vertical 1
      { id: 'mat-4', x: W, y: W, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      // Middle vertical 2
      { id: 'mat-5', x: W * 2, y: W, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      // Bottom horizontal
      { id: 'mat-6', x: W, y: W + L, width: L, height: W, isHalfMat: false, orientation: 'horizontal' }
    );

    return {
      system,
      matCount: 6,
      arrangementStyle: 'shukugi',
      mats,
    };
  }

  if (joCount === 8) {
    // 八畳 (Hachijo) Traditional Auspicious Shukugi-jiki
    // Room size: (2 * L = 4 * W) wide by (2 * L = 4 * W) high (e.g. 3640 x 3640 mm in Chukyoma)
    // 2 central parallel vertical mats, surrounded by 6 perimeter mats (2 top, 2 bottom, 1 left, 1 right).
    // Central mats:
    mats.push(
      { id: 'mat-c1', x: W, y: W, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      { id: 'mat-c2', x: W * 2, y: W, width: W, height: L, isHalfMat: false, orientation: 'vertical' }
    );
    // Top 2 horizontal mats:
    mats.push(
      { id: 'mat-t1', x: 0, y: 0, width: L, height: W, isHalfMat: false, orientation: 'horizontal' },
      { id: 'mat-t2', x: L, y: 0, width: L, height: W, isHalfMat: false, orientation: 'horizontal' }
    );
    // Right vertical mat:
    mats.push(
      { id: 'mat-r', x: W * 3, y: W, width: W, height: L, isHalfMat: false, orientation: 'vertical' }
    );
    // Bottom 2 horizontal mats:
    mats.push(
      { id: 'mat-b1', x: 0, y: W + L, width: L, height: W, isHalfMat: false, orientation: 'horizontal' },
      { id: 'mat-b2', x: L, y: W + L, width: L, height: W, isHalfMat: false, orientation: 'horizontal' }
    );
    // Left vertical mat:
    mats.push(
      { id: 'mat-l', x: 0, y: W, width: W, height: L, isHalfMat: false, orientation: 'vertical' }
    );

    return {
      system,
      matCount: 8,
      arrangementStyle: 'shukugi',
      mats,
    };
  }

  if (joCount === 10) {
    // 十畳 (Jujo) Traditional Auspicious Layout
    // Room size: (4 * W) wide by (5 * W) high (e.g. 3640 x 4550 mm in Chukyoma)
    // 2 central parallel mats surrounded by 8 perimeter mats.
    // Central mats:
    mats.push(
      { id: 'mat-c1', x: W, y: W * 1.5, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      { id: 'mat-c2', x: W * 2, y: W * 1.5, width: W, height: L, isHalfMat: false, orientation: 'vertical' }
    );
    // Top 2 horizontal mats:
    mats.push(
      { id: 'mat-t1', x: 0, y: 0, width: L, height: W, isHalfMat: false, orientation: 'horizontal' },
      { id: 'mat-t2', x: L, y: 0, width: L, height: W, isHalfMat: false, orientation: 'horizontal' }
    );
    // Left 2 vertical mats:
    mats.push(
      { id: 'mat-l1', x: 0, y: W, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      { id: 'mat-l2', x: 0, y: W + L, width: W, height: L, isHalfMat: false, orientation: 'vertical' }
    );
    // Right 2 vertical mats:
    mats.push(
      { id: 'mat-r1', x: W * 3, y: W, width: W, height: L, isHalfMat: false, orientation: 'vertical' },
      { id: 'mat-r2', x: W * 3, y: W + L, width: W, height: L, isHalfMat: false, orientation: 'vertical' }
    );
    // Bottom 2 horizontal mats:
    mats.push(
      { id: 'mat-b1', x: 0, y: W + L * 2, width: L, height: W, isHalfMat: false, orientation: 'horizontal' },
      { id: 'mat-b2', x: L, y: W + L * 2, width: L, height: W, isHalfMat: false, orientation: 'horizontal' }
    );

    return {
      system,
      matCount: 10,
      arrangementStyle: 'shukugi',
      mats,
    };
  }

  // CUSTOM / NON-STANDARD ROOM DIMENSIONS
  // Automatically fit whole and half mats into custom room dimensions
  const roomW = customRoomWidthMm || W * 3;
  const roomH = customRoomHeightMm || L * 2;

  const cols = Math.floor(roomW / W);
  const rows = Math.floor(roomH / L);

  let index = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      mats.push({
        id: `mat-custom-${index++}`,
        x: c * W,
        y: r * L,
        width: W,
        height: L,
        isHalfMat: false,
        orientation: 'vertical',
      });
    }
  }

  // Calculate residual wooden border margin (Itama 板間)
  const remainingW = roomW - cols * W;
  const remainingH = roomH - rows * L;
  const woodenBorderMm = Math.max(0, Math.min(remainingW, remainingH));

  return {
    system,
    matCount: 'custom',
    arrangementStyle: 'custom',
    mats,
    woodenBorderMm,
  };
}


/**
 * SENSORY JAPAN — Architectural Core Data Models
 * Single Source of Truth: All coordinates, lengths, widths and elevations are strictly in millimetres (mm).
 * Floating-point pixels are NEVER used as source-of-truth building dimensions.
 */

export type TatamiSystem = 'kyoma' | 'chukyoma' | 'edoma' | 'danchima';

export type TatamiMatCount = 1 | 2 | 3 | 4.5 | 6 | 8 | 10 | 'custom';

export type TatamiArrangementStyle = 'shukugi' | 'fushukugi' | 'spiral' | 'custom';

export interface TatamiMat {
  id: string;
  x: number;          // Relative X within room (mm)
  y: number;          // Relative Y within room (mm)
  width: number;      // mm
  height: number;     // mm
  isHalfMat: boolean; // 0.5 jo mat (e.g. 910x910 mm in Chukyoma)
  orientation: 'horizontal' | 'vertical';
}

export interface TatamiConfiguration {
  system: TatamiSystem;
  matCount: TatamiMatCount;
  arrangementStyle: TatamiArrangementStyle;
  mats: TatamiMat[];
  woodenBorderMm?: number; // Border margin (Itama 板間) when room exceeds exact mat sizes
}

export type RoomType =
  | 'living'
  | 'dining'
  | 'kitchen'
  | 'washitsu'       // 和室 (Tatami Room)
  | 'bedroom'        // 洋室・寝室
  | 'bathroom'       // 浴室・お風呂 (UB)
  | 'toilet'         // トイレ
  | 'washroom'       // 洗面脱衣室
  | 'genkan'         // 玄関 (Entrance with agari-kamachi)
  | 'hallway'        // 廊下
  | 'oshiire'        // 押入れ・クローゼット (Storage)
  | 'balcony'        // バルコニー・ベランダ
  | 'utility'        // 家事室・ユーティリティ
  | 'staircase'      // 階段
  | 'engawa'         // 縁側 (Traditional veranda)
  | 'custom';

export type FloorMaterial =
  | 'tatami_igusa'       // 伝統的い草畳 (Natural rush mat)
  | 'tatami_washi'       // 和紙畳・琉球畳 (Washi / Ryukyu mat with no cloth edge)
  | 'hardwood_hinoki'    // 檜 (Japanese Cypress)
  | 'hardwood_sugi'      // 杉 (Japanese Cedar)
  | 'hardwood_oak'       // ナラ・オーク
  | 'tile_ceramic'       // 磁器質タイル
  | 'concrete_doma'      // 土間コンクリート (Genkan entryway)
  | 'deck_wood';         // ウッドデッキ (Balcony/Engawa)

export interface Room {
  id: string;
  floorId: string;
  name: string;               // e.g., "和室 6畳", "LDK", "主寝室"
  japaneseName: string;       // Kanji label
  type: RoomType;
  position: { x: number; y: number }; // mm from floor origin
  width: number;              // mm
  height: number;             // mm
  rotation: number;           // 0, 90, 180, 270 degrees
  floorMaterial: FloorMaterial;
  tatamiConfig?: TatamiConfiguration;
  color?: string;
  elevationOffset?: number;   // mm (e.g. +150mm for raised Washitsu / Koagari 小上がり)
}

export type WallType = 'exterior' | 'interior' | 'partition_fusuma' | 'partition_shoji';

export interface Wall {
  id: string;
  floorId: string;
  type: WallType;
  start: { x: number; y: number }; // mm
  end: { x: number; y: number };   // mm
  thickness: number;               // mm (Exterior: 150mm, Interior: 100mm, Partition: 35mm)
  height: number;                  // mm
  material: string;
}

export type OpeningType =
  | 'door'                        // 開き戸 (Standard hinged door)
  | 'sliding_door_hikido'         // 引戸 (Japanese sliding door)
  | 'shoji'                       // 障子 (Translucent paper screen)
  | 'fusuma'                      // 襖 (Opaque sliding partition)
  | 'window'                      // 腰窓 (Standard window)
  | 'sweeping_window_hakidashi';  // 掃き出し窓 (Floor-to-ceiling sliding window)

export interface Opening {
  id: string;
  wallId?: string;
  floorId: string;
  type: OpeningType;
  position: { x: number; y: number }; // mm
  width: number;                      // mm (e.g. 1-ken = 1820mm, 0.5-ken = 910mm)
  height: number;                     // mm (Standard 2000mm)
  orientation: 'horizontal' | 'vertical';
}

export type ArchitecturalElementType =
  | 'column'                   // 柱 (Structural column, e.g. 105x105mm or 120x120mm)
  | 'staircase'                // 階段
  | 'balcony'                  // バルコニー
  | 'engawa'                   // 縁側
  | 'tokonoma'                 // 床の間 (Alcove)
  | 'agari_kamachi'            // 上がり框 (Entrance threshold step)
  | 'kitchen_island'           // アイランドキッチン
  | 'bathtub'                  // 浴槽 (Unit bath 1616 / 1620)
  | 'washbasin'                // 洗面化粧台
  | 'toilet_bowl';             // 便器

export interface ArchitecturalElement {
  id: string;
  floorId: string;
  type: ArchitecturalElementType;
  position: { x: number; y: number }; // mm
  dimensions: { width: number; height: number; depth?: number }; // mm
  rotation: number;
  label?: string;
}

export type FloorLevel = 'B1' | '1F' | '2F' | '3F';

export interface Floor {
  id: string;
  projectId: string;
  level: FloorLevel;
  name: string;               // "1階 (1F)", "2階 (2F)"
  elevation: number;          // mm (1F = 0mm, 2F = 2900mm, 3F = 5800mm)
  floorHeight: number;        // mm (Floor-to-floor height, typically 2800-3000 mm)
  ceilingHeight: number;      // mm (Internal ceiling clearance, typically 2400 mm)
  slabThickness: number;      // mm (typically 150-180 mm)
  rooms: Room[];
  walls: Wall[];
  openings: Opening[];
  elements: ArchitecturalElement[];
}

export type RoadDirection =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest';

export interface PlotConfiguration {
  width: number;            // mm
  depth: number;            // mm
  areaSqMeters: number;     // m²
  roadFrontage: number;     // mm (Width of road access)
  roadWidth: number;        // mm (Legal road width - Article 42 BSL requires 4000mm min)
  roadDirection: RoadDirection;
  northOrientation: number; // Degrees clockwise from 12 o'clock (0 = North, 90 = East, 180 = South, 270 = West)
  setbacks: {
    front: number;          // mm (Road setback)
    rear: number;           // mm
    left: number;           // mm
    right: number;          // mm
  };
  zoning: string;           // e.g. "第一種低層住居専用地域" (Category 1 Low-Rise Residential)
  legalMaxBCR: number;      // Kenpeiritsu 建ぺい率 % (e.g. 50% or 60%)
  legalMaxFAR: number;      // Yosekiritsu 容積率 % (e.g. 100% or 150%)
  boundaryVertices?: Array<{ x: number; y: number }>; // mm
}

export type StructureType =
  | 'wooden_conventional'   // 木造軸組構法 (在来工法 - Traditional post & beam)
  | 'wooden_2x4'            // 2×4工法 (ツーバイフォー / 木造枠組壁工法)
  | 'light_gauge_steel'     // 軽量鉄骨造 (S造)
  | 'reinforced_concrete';  // 鉄筋コンクリート造 (RC造)

export interface BuildingConfiguration {
  structureType: StructureType;
  numberOfFloors: number;
  totalRoofArea?: number;   // m²
  roofType: 'kirizuma' | 'yosemune' | 'katanagare' | 'flat'; // 切妻, 寄棟, 片流れ, 陸屋根
}

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  location: string;
  tatamiSystem: TatamiSystem;
  moduleSystem: 'shakkan_910' | 'meter_1000'; // 910mm 京間/尺モジュール vs 1000mm メーターモジュール
  plot: PlotConfiguration;
  buildingConfiguration: BuildingConfiguration;
  floors: Floor[];
  activeFloorId: string;
  selectedObjectId: string | null;
  selectedObjectType: 'room' | 'wall' | 'opening' | 'element' | null;
  createdAt: string;
  updatedAt: string;
}


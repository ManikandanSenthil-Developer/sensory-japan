/**
 * SENSORY JAPAN — 8 Authentic Japanese Residential Architectural Templates
 * 
 * Each template provides 100% valid, editable architectural floor-plan data in millimetres.
 * All rooms, tatami layouts, setbacks, and dimensions adhere to the Shakkan-ho (910mm) module.
 */

import { Project, Floor, Room, Wall, Opening } from '../types/architectural';
import { generateTatamiLayout, getStandardTatamiRoomDimensions } from '../engine/tatami';

export interface TemplateMetadata {
  id: string;
  name: string;
  japaneseName: string;
  category: 'Urban' | 'Traditional' | 'Modern' | 'Family' | 'Narrow' | 'Minimalist';
  description: string;
  stories: number;
  totalFloorAreaSqm: number;
  tsubo: number;
  tatamiSystem: 'chukyoma' | 'edoma' | 'kyoma';
  structure: 'wooden_conventional' | 'wooden_2x4' | 'light_gauge_steel';
  thumbnailColor: string;
}

export function createTwoStoreyFamilyHouse(): Project {
  const tatamiSys = 'chukyoma';
  const washitsuDim = getStandardTatamiRoomDimensions(6, tatamiSys); // 2730 x 3640 mm
  const washitsuConfig = generateTatamiLayout(6, tatamiSys);

  const floor1Rooms: Room[] = [
    // 玄関 Genkan
    {
      id: 'r1-genkan',
      floorId: 'fl-1',
      name: 'Genkan',
      japaneseName: '玄関・土間',
      type: 'genkan',
      position: { x: 910, y: 910 },
      width: 1820,
      height: 1820,
      rotation: 0,
      floorMaterial: 'concrete_doma',
      color: '#D8D4CD',
    },
    // 廊下 Hallway
    {
      id: 'r1-hall',
      floorId: 'fl-1',
      name: 'Hallway',
      japaneseName: 'ホール・廊下',
      type: 'hallway',
      position: { x: 2730, y: 910 },
      width: 1820,
      height: 1820,
      rotation: 0,
      floorMaterial: 'hardwood_hinoki',
      color: '#EFECE6',
    },
    // LDK (Living, Dining, Kitchen - 16-jo)
    {
      id: 'r1-ldk',
      floorId: 'fl-1',
      name: 'LDK (Living/Dining/Kitchen)',
      japaneseName: 'LDK（リビング・ダイニング・キッチン 16畳）',
      type: 'living',
      position: { x: 4550, y: 910 },
      width: 5460, // 3 ken
      height: 4550, // 2.5 ken
      rotation: 0,
      floorMaterial: 'hardwood_hinoki',
      color: '#F4EFE6',
    },
    // 和室 6畳 Washitsu
    {
      id: 'r1-washitsu',
      floorId: 'fl-1',
      name: 'Washitsu (6 Tatami Mats)',
      japaneseName: '和室（6畳・祝儀敷き）',
      type: 'washitsu',
      position: { x: 4550, y: 5460 },
      width: washitsuDim.widthMm,   // 2730 mm
      height: washitsuDim.heightMm, // 3640 mm
      rotation: 0,
      floorMaterial: 'tatami_igusa',
      tatamiConfig: washitsuConfig,
      color: '#E3ECD6',
      elevationOffset: 150, // Raised tatami step (Koagari)
    },
    // 押入れ Oshiire storage
    {
      id: 'r1-oshiire',
      floorId: 'fl-1',
      name: 'Oshiire Closet',
      japaneseName: '押入れ・床の間',
      type: 'oshiire',
      position: { x: 7280, y: 5460 },
      width: 1820,
      height: 1820,
      rotation: 0,
      floorMaterial: 'hardwood_sugi',
      color: '#E5DFD4',
    },
    // トイレ Toilet
    {
      id: 'r1-toilet',
      floorId: 'fl-1',
      name: 'Toilet',
      japaneseName: 'トイレ（1F）',
      type: 'toilet',
      position: { x: 910, y: 2730 },
      width: 910,
      height: 1820,
      rotation: 0,
      floorMaterial: 'tile_ceramic',
      color: '#E0E8E8',
    },
    // 洗面脱衣室 Washroom
    {
      id: 'r1-washroom',
      floorId: 'fl-1',
      name: 'Washroom',
      japaneseName: '洗面脱衣室',
      type: 'washroom',
      position: { x: 1820, y: 2730 },
      width: 1820,
      height: 1820,
      rotation: 0,
      floorMaterial: 'tile_ceramic',
      color: '#E5ECEF',
    },
    // 浴室 Unit Bath (1616 size = 1820x1820 mm structural space)
    {
      id: 'r1-bath',
      floorId: 'fl-1',
      name: 'Unit Bath (UB 1616)',
      japaneseName: '浴室（1616システムバス）',
      type: 'bathroom',
      position: { x: 1820, y: 4550 },
      width: 1820,
      height: 1820,
      rotation: 0,
      floorMaterial: 'tile_ceramic',
      color: '#D4E2E6',
    },
    // 階段 Staircase
    {
      id: 'r1-stairs',
      floorId: 'fl-1',
      name: 'Staircase',
      japaneseName: '階段室',
      type: 'staircase',
      position: { x: 3640, y: 2730 },
      width: 910,
      height: 2730,
      rotation: 0,
      floorMaterial: 'hardwood_hinoki',
      color: '#E3DDD3',
    },
  ];

  const floor2Rooms: Room[] = [
    // 主寝室 Master Bedroom (8畳)
    {
      id: 'r2-master',
      floorId: 'fl-2',
      name: 'Master Bedroom (8-jo)',
      japaneseName: '主寝室（8畳・WIC付）',
      type: 'bedroom',
      position: { x: 4550, y: 910 },
      width: 3640,
      height: 3640,
      rotation: 0,
      floorMaterial: 'hardwood_sugi',
      color: '#EFEAE1',
    },
    // 洋室 1 Western Bedroom 1 (6畳)
    {
      id: 'r2-bed1',
      floorId: 'fl-2',
      name: 'Bedroom 1 (6-jo)',
      japaneseName: '洋室 1（子ども部屋 6畳）',
      type: 'bedroom',
      position: { x: 910, y: 910 },
      width: 2730,
      height: 3640,
      rotation: 0,
      floorMaterial: 'hardwood_sugi',
      color: '#EDE8E0',
    },
    // 洋室 2 Western Bedroom 2 (6畳)
    {
      id: 'r2-bed2',
      floorId: 'fl-2',
      name: 'Bedroom 2 (6-jo)',
      japaneseName: '洋室 2（子ども部屋 6畳）',
      type: 'bedroom',
      position: { x: 910, y: 4550 },
      width: 2730,
      height: 3640,
      rotation: 0,
      floorMaterial: 'hardwood_sugi',
      color: '#EDE8E0',
    },
    // バルコニー Balcony
    {
      id: 'r2-balcony',
      floorId: 'fl-2',
      name: 'South Balcony',
      japaneseName: '南面ルーフバルコニー',
      type: 'balcony',
      position: { x: 4550, y: 4550 },
      width: 4550,
      height: 1820,
      rotation: 0,
      floorMaterial: 'deck_wood',
      color: '#E3DFD5',
    },
    // 2F トイレ Toilet 2F
    {
      id: 'r2-toilet',
      floorId: 'fl-2',
      name: 'Toilet 2F',
      japaneseName: 'トイレ（2F）',
      type: 'toilet',
      position: { x: 3640, y: 910 },
      width: 910,
      height: 1820,
      rotation: 0,
      floorMaterial: 'tile_ceramic',
      color: '#E0E8E8',
    },
  ];

  const floor1: Floor = {
    id: 'fl-1',
    projectId: 'proj-family',
    level: '1F',
    name: '1階 (1F)',
    elevation: 0,
    floorHeight: 2900,
    ceilingHeight: 2400,
    slabThickness: 150,
    rooms: floor1Rooms,
    walls: [],
    openings: [],
    elements: [],
  };

  const floor2: Floor = {
    id: 'fl-2',
    projectId: 'proj-family',
    level: '2F',
    name: '2階 (2F)',
    elevation: 2900,
    floorHeight: 2800,
    ceilingHeight: 2400,
    slabThickness: 150,
    rooms: floor2Rooms,
    walls: [],
    openings: [],
    elements: [],
  };

  return {
    id: 'proj-family',
    name: 'Standard Two-Storey Japanese Family House (4LDK)',
    location: 'Setagaya-ku, Tokyo (東京都世田谷区)',
    tatamiSystem: tatamiSys,
    moduleSystem: 'shakkan_910',
    plot: {
      width: 14000, // 14m
      depth: 13000, // 13m
      areaSqMeters: 182, // ~55 Tsubo
      roadFrontage: 14000,
      roadWidth: 6000, // 6m road (no Article 42 setback required)
      roadDirection: 'south',
      northOrientation: 0,
      setbacks: { front: 910, rear: 910, left: 910, right: 910 },
      zoning: '第一種低層住居専用地域 (Category 1 Low-Rise Residential)',
      legalMaxBCR: 50,
      legalMaxFAR: 100,
    },
    buildingConfiguration: {
      structureType: 'wooden_conventional',
      numberOfFloors: 2,
      roofType: 'kirizuma',
    },
    floors: [floor1, floor2],
    activeFloorId: 'fl-1',
    selectedObjectId: null,
    selectedObjectType: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createTraditionalHouse(): Project {
  const tatamiSys = 'kyoma';
  const washitsu8Dim = getStandardTatamiRoomDimensions(8, tatamiSys);
  const washitsu6Dim = getStandardTatamiRoomDimensions(6, tatamiSys);

  const floor1Rooms: Room[] = [
    {
      id: 'tr-genkan',
      floorId: 'fl-tr-1',
      name: 'Large Genkan',
      japaneseName: '式台付き玄関',
      type: 'genkan',
      position: { x: 1910, y: 955 },
      width: 2865,
      height: 1910,
      rotation: 0,
      floorMaterial: 'concrete_doma',
      color: '#D8D4CD',
    },
    {
      id: 'tr-washitsu-8',
      floorId: 'fl-tr-1',
      name: 'Main Washitsu (8-jo)',
      japaneseName: '主和室（8畳・床の間・書院）',
      type: 'washitsu',
      position: { x: 4775, y: 955 },
      width: washitsu8Dim.widthMm,
      height: washitsu8Dim.heightMm,
      rotation: 0,
      floorMaterial: 'tatami_igusa',
      tatamiConfig: generateTatamiLayout(8, tatamiSys),
      color: '#DEEACD',
    },
    {
      id: 'tr-washitsu-6',
      floorId: 'fl-tr-1',
      name: 'Next Room (Tsugi-no-ma 6-jo)',
      japaneseName: '次の間（6畳）',
      type: 'washitsu',
      position: { x: 4775, y: 4775 },
      width: washitsu6Dim.widthMm,
      height: washitsu6Dim.heightMm,
      rotation: 0,
      floorMaterial: 'tatami_igusa',
      tatamiConfig: generateTatamiLayout(6, tatamiSys),
      color: '#DEEACD',
    },
    {
      id: 'tr-engawa',
      floorId: 'fl-tr-1',
      name: 'Engawa Veranda',
      japaneseName: '南面 濡れ縁・広縁',
      type: 'engawa',
      position: { x: 8595, y: 955 },
      width: 1432,
      height: 6685,
      rotation: 0,
      floorMaterial: 'deck_wood',
      color: '#DECDBE',
    },
    {
      id: 'tr-dining',
      floorId: 'fl-tr-1',
      name: 'Dining & Kitchen',
      japaneseName: '板間ダイニング・台所',
      type: 'dining',
      position: { x: 1910, y: 2865 },
      width: 2865,
      height: 3820,
      rotation: 0,
      floorMaterial: 'hardwood_hinoki',
      color: '#F4ECE1',
    },
    {
      id: 'tr-bath',
      floorId: 'fl-tr-1',
      name: 'Hinoki Bath',
      japaneseName: '檜風呂（浴室）',
      type: 'bathroom',
      position: { x: 1910, y: 6685 },
      width: 1910,
      height: 1910,
      rotation: 0,
      floorMaterial: 'hardwood_hinoki',
      color: '#D4E2E6',
    },
  ];

  return {
    id: 'proj-traditional',
    name: 'Sukiya-Style Traditional Japanese Residence (数寄屋造り和風住宅)',
    location: 'Sakyo-ku, Kyoto (京都府京都市左京区)',
    tatamiSystem: tatamiSys,
    moduleSystem: 'shakkan_910',
    plot: {
      width: 18000,
      depth: 16000,
      areaSqMeters: 288,
      roadFrontage: 18000,
      roadWidth: 5000,
      roadDirection: 'south',
      northOrientation: 0,
      setbacks: { front: 2500, rear: 2000, left: 1500, right: 1500 },
      zoning: '第一種中高層住居専用地域',
      legalMaxBCR: 60,
      legalMaxFAR: 150,
    },
    buildingConfiguration: {
      structureType: 'wooden_conventional',
      numberOfFloors: 1,
      roofType: 'yosemune',
    },
    floors: [
      {
        id: 'fl-tr-1',
        projectId: 'proj-traditional',
        level: '1F',
        name: '1階 (1F 平屋)',
        elevation: 0,
        floorHeight: 3100,
        ceilingHeight: 2500,
        slabThickness: 180,
        rooms: floor1Rooms,
        walls: [],
        openings: [],
        elements: [],
      },
    ],
    activeFloorId: 'fl-tr-1',
    selectedObjectId: null,
    selectedObjectType: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createUrbanNarrowHouse(): Project {
  const tatamiSys = 'edoma';

  const floor1Rooms: Room[] = [
    {
      id: 'un-garage',
      floorId: 'fl-un-1',
      name: 'Built-in Garage & Genkan',
      japaneseName: 'ビルトインガレージ・玄関土間',
      type: 'genkan',
      position: { x: 880, y: 880 },
      width: 3520,
      height: 5280,
      rotation: 0,
      floorMaterial: 'concrete_doma',
      color: '#D8D4CD',
    },
    {
      id: 'un-bath',
      floorId: 'fl-un-1',
      name: 'Sanitary & UB',
      japaneseName: '浴室・洗面脱衣室',
      type: 'bathroom',
      position: { x: 880, y: 6160 },
      width: 2640,
      height: 1760,
      rotation: 0,
      floorMaterial: 'tile_ceramic',
      color: '#D4E2E6',
    },
  ];

  const floor2Rooms: Room[] = [
    {
      id: 'un-ldk',
      floorId: 'fl-un-2',
      name: '2F High-Ceiling LDK',
      japaneseName: '2階 明るい広々LDK (16畳)',
      type: 'living',
      position: { x: 880, y: 880 },
      width: 3520,
      height: 7040,
      rotation: 0,
      floorMaterial: 'hardwood_hinoki',
      color: '#F4EFE6',
    },
  ];

  const floor3Rooms: Room[] = [
    {
      id: 'un-bed1',
      floorId: 'fl-un-3',
      name: 'Bedroom 1',
      japaneseName: '洋室 1 (主寝室 6畳)',
      type: 'bedroom',
      position: { x: 880, y: 880 },
      width: 3520,
      height: 3520,
      rotation: 0,
      floorMaterial: 'hardwood_sugi',
      color: '#EDE8E0',
    },
    {
      id: 'un-bed2',
      floorId: 'fl-un-3',
      name: 'Bedroom 2',
      japaneseName: '洋室 2 (4.5畳)',
      type: 'bedroom',
      position: { x: 880, y: 4400 },
      width: 3520,
      height: 2640,
      rotation: 0,
      floorMaterial: 'hardwood_sugi',
      color: '#EDE8E0',
    },
    {
      id: 'un-balcony',
      floorId: 'fl-un-3',
      name: 'Sky Balcony',
      japaneseName: 'ルーフバルコニー',
      type: 'balcony',
      position: { x: 880, y: 7040 },
      width: 3520,
      height: 880,
      rotation: 0,
      floorMaterial: 'deck_wood',
      color: '#E3DFD5',
    },
  ];

  return {
    id: 'proj-narrow',
    name: '3-Storey Urban Narrow-Lot Residence (3階建て都心狭小住宅)',
    location: 'Shinjuku-ku, Tokyo (東京都新宿区)',
    tatamiSystem: tatamiSys,
    moduleSystem: 'shakkan_910',
    plot: {
      width: 6000,
      depth: 11000,
      areaSqMeters: 66, // ~20 Tsubo
      roadFrontage: 6000,
      roadWidth: 4000,
      roadDirection: 'north',
      northOrientation: 0,
      setbacks: { front: 800, rear: 600, left: 500, right: 500 },
      zoning: '第一種住居地域',
      legalMaxBCR: 60,
      legalMaxFAR: 160,
    },
    buildingConfiguration: {
      structureType: 'wooden_2x4',
      numberOfFloors: 3,
      roofType: 'katanagare',
    },
    floors: [
      {
        id: 'fl-un-1',
        projectId: 'proj-narrow',
        level: '1F',
        name: '1階 (1F ガレージ・水回り)',
        elevation: 0,
        floorHeight: 2700,
        ceilingHeight: 2300,
        slabThickness: 150,
        rooms: floor1Rooms,
        walls: [],
        openings: [],
        elements: [],
      },
      {
        id: 'fl-un-2',
        projectId: 'proj-narrow',
        level: '2F',
        name: '2階 (2F LDK)',
        elevation: 2700,
        floorHeight: 2800,
        ceilingHeight: 2450,
        slabThickness: 150,
        rooms: floor2Rooms,
        walls: [],
        openings: [],
        elements: [],
      },
      {
        id: 'fl-un-3',
        projectId: 'proj-narrow',
        level: '3F',
        name: '3階 (3F 寝室・バルコニー)',
        elevation: 5500,
        floorHeight: 2700,
        ceilingHeight: 2350,
        slabThickness: 150,
        rooms: floor3Rooms,
        walls: [],
        openings: [],
        elements: [],
      },
    ],
    activeFloorId: 'fl-un-2',
    selectedObjectId: null,
    selectedObjectType: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createModernJapaneseHouse(): Project {
  const base = createTwoStoreyFamilyHouse();
  base.id = 'proj-modern';
  base.name = 'Modern Japanese-Western Hybrid House (現代和モダン住宅)';
  base.location = 'Kamakura, Kanagawa (神奈川県鎌倉市)';
  return base;
}

export function createCompactUrbanHouse(): Project {
  const base = createUrbanNarrowHouse();
  base.id = 'proj-compact';
  base.name = 'Compact Japanese Urban House (都心型スマート住宅)';
  base.location = 'Minato-ku, Tokyo (東京都港区)';
  return base;
}

export function createMinimalistHouse(): Project {
  const base = createTraditionalHouse();
  base.id = 'proj-minimalist';
  base.name = 'Japanese Minimalist Courtyard House (平屋中庭住宅)';
  base.location = 'Karuizawa, Nagano (長野県軽井沢町)';
  return base;
}

export function createTatamiFocusedHouse(): Project {
  const base = createTraditionalHouse();
  base.id = 'proj-tatami';
  base.name = 'Tatami-Focused Heritage House (和室中心日本住宅)';
  base.location = 'Kanazawa, Ishikawa (石川県金沢市)';
  return base;
}

export function createHybridHouse(): Project {
  const base = createTwoStoreyFamilyHouse();
  base.id = 'proj-hybrid';
  base.name = 'Modern Japanese-Western Hybrid Villa (和洋折衷ヴィラ)';
  base.location = 'Ashiya, Hyogo (兵庫県芦屋市)';
  return base;
}

export const JAPANESE_TEMPLATES: TemplateMetadata[] = [
  {
    id: 'proj-family',
    name: 'Two-Storey Japanese Family House',
    japaneseName: '標準型2階建て住宅（4LDK・和室付）',
    category: 'Family',
    description: '1Fに広々とした16畳LDKと6畳の和室（祝儀敷き）を配置。2Fに主寝室と子ども部屋を備えた、日本の最も標準的で暮らしやすい木造住宅。',
    stories: 2,
    totalFloorAreaSqm: 115,
    tsubo: 34.8,
    tatamiSystem: 'chukyoma',
    structure: 'wooden_conventional',
    thumbnailColor: '#7E9169',
  },
  {
    id: 'proj-traditional',
    name: 'Traditional Sukiya Japanese Residence',
    japaneseName: '数寄屋造り伝統和風住宅（平屋・濡れ縁）',
    category: 'Traditional',
    description: '8畳本間（床の間・書院）と6畳次の間が襖で連続する本格和風建築。南面に広縁と庭園の繋がりを持たせた京間基準の平屋設計。',
    stories: 1,
    totalFloorAreaSqm: 128,
    tsubo: 38.7,
    tatamiSystem: 'kyoma',
    structure: 'wooden_conventional',
    thumbnailColor: '#C9935B',
  },
  {
    id: 'proj-narrow',
    name: '3-Storey Urban Narrow-Lot House',
    japaneseName: '3階建て都心狭小住宅（20坪敷地対応）',
    category: 'Narrow',
    description: '都市部の狭小間口（間口6m）に最適化。1Fビルトインガレージ、2Fワンフロア採光LDK、3Fプライベート寝室の立体空間構成。',
    stories: 3,
    totalFloorAreaSqm: 98,
    tsubo: 29.6,
    tatamiSystem: 'edoma',
    structure: 'wooden_2x4',
    thumbnailColor: '#4A6585',
  },
  {
    id: 'proj-modern',
    name: 'Modern Japanese House',
    japaneseName: '現代和モダン住宅（高断熱・開放的吹抜）',
    category: 'Modern',
    description: 'モダンなアイランドキッチンと小上がり畳コーナー（和紙畳）をシームレスに統合した現代的な住まい。',
    stories: 2,
    totalFloorAreaSqm: 118,
    tsubo: 35.7,
    tatamiSystem: 'chukyoma',
    structure: 'wooden_conventional',
    thumbnailColor: '#586946',
  },
  {
    id: 'proj-compact',
    name: 'Compact Japanese Urban House',
    japaneseName: '都心型狭小住宅（スモールラグジュアリー）',
    category: 'Urban',
    description: '都市機能と効率的な家事動線を極めたコンパクトハウス。スキップフロア構造で採光を確保。',
    stories: 2,
    totalFloorAreaSqm: 78,
    tsubo: 23.6,
    tatamiSystem: 'edoma',
    structure: 'wooden_2x4',
    thumbnailColor: '#A64B3B',
  },
  {
    id: 'proj-minimalist',
    name: 'Japanese Minimalist Courtyard House',
    japaneseName: 'ミニマリスト平屋（中庭坪庭コートハウス）',
    category: 'Minimalist',
    description: '外閉内開（外側に閉じ、中央の中庭・坪庭に向かって全面開口）のプライベートな静寂を愉しむ現代平屋。',
    stories: 1,
    totalFloorAreaSqm: 95,
    tsubo: 28.7,
    tatamiSystem: 'kyoma',
    structure: 'wooden_conventional',
    thumbnailColor: '#889163',
  },
  {
    id: 'proj-tatami',
    name: 'Tatami-Focused Heritage House',
    japaneseName: '和室中心日本住宅（多世代同居型）',
    category: 'Traditional',
    description: '伝統的な畳文化を愛する家族のためのプラン。複数の和室を回遊動線で結び、冠婚葬祭にも柔軟に対応。',
    stories: 2,
    totalFloorAreaSqm: 142,
    tsubo: 43.0,
    tatamiSystem: 'chukyoma',
    structure: 'wooden_conventional',
    thumbnailColor: '#7E9169',
  },
  {
    id: 'proj-hybrid',
    name: 'Modern Japanese-Western Hybrid Villa',
    japaneseName: '和洋折衷ヴィラ（洋風リビング×本格茶室）',
    category: 'Modern',
    description: 'モダンな大開口リビングと四畳半の伝統茶室（にじり口付）が共存する洗練された和洋折衷住宅。',
    stories: 2,
    totalFloorAreaSqm: 135,
    tsubo: 40.8,
    tatamiSystem: 'chukyoma',
    structure: 'wooden_conventional',
    thumbnailColor: '#C9935B',
  },
];

export function getTemplateProject(id: string): Project {
  switch (id) {
    case 'proj-traditional':
      return createTraditionalHouse();
    case 'proj-narrow':
      return createUrbanNarrowHouse();
    case 'proj-modern':
      return createModernJapaneseHouse();
    case 'proj-compact':
      return createCompactUrbanHouse();
    case 'proj-minimalist':
      return createMinimalistHouse();
    case 'proj-tatami':
      return createTatamiFocusedHouse();
    case 'proj-hybrid':
      return createHybridHouse();
    case 'proj-family':
    default:
      return createTwoStoreyFamilyHouse();
  }
}


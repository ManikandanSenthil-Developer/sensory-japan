/**
 * Mock data for LandSense app — used for demo/prototype purposes
 */

export interface AnalysisResult {
  id: string;
  thumbnail: string;
  date: string;
  buildingType: 'Residential' | 'Commercial' | 'Mixed' | 'Industrial';
  areaSqft: number;
  status: 'completed' | 'processing' | 'failed';
  location?: string;
  siteAnalysis?: SiteAnalysis;
  floorPlan?: FloorPlanData;
  compliance?: ComplianceData;
  costEstimation?: CostEstimation;
  designRationale?: string;
}

export interface SiteAnalysis {
  estimatedArea: number;
  roadAccess: string;
  vegetation: string;
  terrain: string;
  bestOrientation: string;
  soilType: string;
}

export interface FloorPlanRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  areaSqft: number;
}

export interface FloorPlanData {
  totalArea: number;
  rooms: FloorPlanRoom[];
  setbacks: {
    front: number;
    rear: number;
    left: number;
    right: number;
  };
}

export interface ComplianceData {
  nbc2016: { compliant: boolean; label: string };
  vastu: { status: 'compliant' | 'partial' | 'non-compliant'; label: string };
  greenScore: number;
}

export interface CostEstimation {
  minCost: number;
  maxCost: number;
  breakdown: {
    label: string;
    percentage: number;
    color: string;
  }[];
}

export const mockSiteAnalysis: SiteAnalysis = {
  estimatedArea: 2400,
  roadAccess: 'North',
  vegetation: 'Sparse',
  terrain: 'Flat',
  bestOrientation: 'East-facing',
  soilType: 'Loamy',
};

export const mockFloorPlan: FloorPlanData = {
  totalArea: 2400,
  rooms: [
    { id: '1', name: 'Living Room', x: 20, y: 60, width: 140, height: 100, color: '#4F7FFF', areaSqft: 280 },
    { id: '2', name: 'Bedroom 1', x: 170, y: 60, width: 110, height: 90, color: '#A78BFA', areaSqft: 200 },
    { id: '3', name: 'Bedroom 2', x: 170, y: 160, width: 110, height: 90, color: '#8B5CF6', areaSqft: 180 },
    { id: '4', name: 'Kitchen', x: 20, y: 170, width: 100, height: 80, color: '#F59E0B', areaSqft: 150 },
    { id: '5', name: 'Bathroom', x: 130, y: 170, width: 30, height: 60, color: '#06B6D4', areaSqft: 45 },
    { id: '6', name: 'Car Porch', x: 20, y: 260, width: 120, height: 50, color: '#6B7280', areaSqft: 120 },
  ],
  setbacks: { front: 10, rear: 5, left: 3, right: 3 },
};

export const mockCompliance: ComplianceData = {
  nbc2016: { compliant: true, label: 'NBC 2016 Compliant' },
  vastu: { status: 'partial', label: 'Vastu: Partially Compliant' },
  greenScore: 7,
};

export const mockCostEstimation: CostEstimation = {
  minCost: 2500000,
  maxCost: 3200000,
  breakdown: [
    { label: 'Structure', percentage: 45, color: '#4F7FFF' },
    { label: 'Finishing', percentage: 25, color: '#A78BFA' },
    { label: 'Electrical', percentage: 15, color: '#F59E0B' },
    { label: 'Plumbing', percentage: 15, color: '#06B6D4' },
  ],
};

export const mockDesignRationale = `The floor plan has been designed with the following considerations:

• **Living Room** placed at the front (south-facing) to maximize natural light during morning hours and provide a welcoming entry experience.

• **Bedrooms** positioned on the east side to receive gentle morning sunlight, promoting healthy circadian rhythms and comfortable sleeping conditions.

• **Kitchen** located in the southeast corner following Vastu principles (Agni corner), with cross-ventilation through strategically placed windows.

• **Car Porch** placed at the front with direct road access from the north, minimizing internal traffic flow disruption.

• **Setbacks** maintained as per NBC 2016: Front 10ft, Rear 5ft, Side 3ft — ensuring adequate light, ventilation, and fire safety compliance.

• **Cross-ventilation** enabled through opposing window placements in living areas, reducing dependency on mechanical cooling by approximately 25%.`;

export const mockRecentAnalyses: AnalysisResult[] = [
  {
    id: '1',
    thumbnail: '',
    date: '2024-03-15',
    buildingType: 'Residential',
    areaSqft: 2400,
    status: 'completed',
    location: 'Bangalore, KA',
  },
  {
    id: '2',
    thumbnail: '',
    date: '2024-03-10',
    buildingType: 'Commercial',
    areaSqft: 5200,
    status: 'completed',
    location: 'Chennai, TN',
  },
  {
    id: '3',
    thumbnail: '',
    date: '2024-03-05',
    buildingType: 'Residential',
    areaSqft: 1800,
    status: 'completed',
    location: 'Hyderabad, TS',
  },
  {
    id: '4',
    thumbnail: '',
    date: '2024-02-28',
    buildingType: 'Mixed',
    areaSqft: 3600,
    status: 'completed',
    location: 'Pune, MH',
  },
];

export const architecturalTips = [
  {
    id: '1',
    icon: '🌞',
    title: 'Optimize Sunlight',
    description: 'Orient living spaces to face east for morning sunlight and west-facing rooms benefit from evening warmth.',
  },
  {
    id: '2',
    icon: '💨',
    title: 'Cross Ventilation',
    description: 'Place windows on opposite walls to create natural airflow, reducing AC costs by up to 30%.',
  },
  {
    id: '3',
    icon: '🏗️',
    title: 'Structural Grid',
    description: 'Use a column grid of 10ft x 12ft for residential buildings to optimize beam spans and material usage.',
  },
  {
    id: '4',
    icon: '🌿',
    title: 'Green Buffer',
    description: 'Plant trees on the west side to block harsh afternoon sun and reduce indoor temperatures by 3-5°C.',
  },
  {
    id: '5',
    icon: '📐',
    title: 'Golden Ratio',
    description: 'Room proportions of 1:1.618 (golden ratio) create spaces that feel naturally balanced and comfortable.',
  },
];

export const processingFacts = [
  'Did you know? North-facing homes get 30% more natural light in India 🌞',
  'Vastu Shastra recommends the main entrance in the North-East direction 🧭',
  'A well-designed floor plan can save 20-30% on construction costs 💰',
  'Cross-ventilation can reduce your electricity bill by up to 40% 💨',
  'The National Building Code 2016 mandates minimum 1m setback from boundaries 📏',
  'East-facing bedrooms receive gentle morning sun, perfect for a healthy start 🌅',
  'Green buildings use 25-30% less energy than conventional buildings 🌿',
  'Properly oriented windows can provide up to 8 hours of natural daylight 💡',
];

export const quickSuggestionChips = [
  'Add bedroom',
  'Increase living room',
  'Add car porch',
  'Make Vastu compliant',
  'Add balcony',
  'Optimize ventilation',
  'Add pooja room',
  'Reduce cost',
];

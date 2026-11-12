/**
 * SENSORY JAPAN — Residential Construction Cost Estimation Engine
 * 
 * Based on authentic Japanese housing market pricing:
 * - Tsubo-tanka (坪単価 - Cost per Tsubo) benchmarked by structure type:
 *   - Wooden Conventional (在来木造): ¥650,000 - ¥900,000 / tsubo
 *   - 2x4 Wooden (ツーバイフォー): ¥700,000 - ¥950,000 / tsubo
 *   - Steel Frame (軽量鉄骨造): ¥800,000 - ¥1,100,000 / tsubo
 *   - Reinforced Concrete (RC造): ¥1,000,000 - ¥1,450,000 / tsubo
 * - Formatted in Japanese Yen (JPY: 万円・億円)
 */

import { Project, StructureType } from '../types/architectural';
import { calculateTotalFloorAreaSqm } from './compliance';
import { sqMetersToTsubo } from './tatami';

export interface CostBreakdownItem {
  category: string;
  japaneseLabel: string;
  amountJpy: number;
  percentage: number;
  color: string;
}

export interface ProjectCostEstimate {
  totalFloorAreaSqm: number;
  totalFloorAreaTsubo: number;
  baseTsuboTankaJpy: number;
  estimatedTotalMinJpy: number;
  estimatedTotalMaxJpy: number;
  estimatedAverageJpy: number;
  breakdown: CostBreakdownItem[];
  formattedRange: string;
  formattedAverage: string;
}

const STRUCTURE_RATES: Record<StructureType, { minTsubo: number; maxTsubo: number; avgTsubo: number }> = {
  wooden_conventional: { minTsubo: 680_000, maxTsubo: 880_000, avgTsubo: 780_000 },
  wooden_2x4: { minTsubo: 720_000, maxTsubo: 940_000, avgTsubo: 820_000 },
  light_gauge_steel: { minTsubo: 850_000, maxTsubo: 1_150_000, avgTsubo: 980_000 },
  reinforced_concrete: { minTsubo: 1_050_000, maxTsubo: 1_500_000, avgTsubo: 1_250_000 },
};

export function formatJpy(amount: number): string {
  if (amount >= 100_000_000) {
    const oku = (amount / 100_000_000).toFixed(2);
    return `¥${oku} 億円`;
  }
  const man = Math.round(amount / 10_000);
  return `¥${man.toLocaleString()} 万円`;
}

export function estimateProjectCost(project: Project): ProjectCostEstimate {
  const totalFloorAreaSqm = calculateTotalFloorAreaSqm(project.floors);
  const totalFloorAreaTsubo = sqMetersToTsubo(totalFloorAreaSqm);

  const rates = STRUCTURE_RATES[project.buildingConfiguration.structureType] || STRUCTURE_RATES.wooden_conventional;

  // Add premium for Washitsu tatami rooms and specialized wooden finishes
  const washitsuCount = project.floors.flatMap((f) => f.rooms.filter((r) => r.type === 'washitsu')).length;
  const washitsuPremiumJpy = washitsuCount * 350_000; // Special tatami, fusuma, shoji craft allowance

  const minTotal = Math.round(totalFloorAreaTsubo * rates.minTsubo + washitsuPremiumJpy);
  const maxTotal = Math.round(totalFloorAreaTsubo * rates.maxTsubo + washitsuPremiumJpy * 1.3);
  const avgTotal = Math.round((minTotal + maxTotal) / 2);

  const breakdown: CostBreakdownItem[] = [
    {
      category: 'Structure',
      japaneseLabel: '本体構造・躯体工事費',
      amountJpy: Math.round(avgTotal * 0.48),
      percentage: 48,
      color: '#C9935B', // Hinoki wood
    },
    {
      category: 'Interior & Tatami',
      japaneseLabel: '内装・造作・和室畳工事費',
      amountJpy: Math.round(avgTotal * 0.24),
      percentage: 24,
      color: '#7E9169', // Tatami green
    },
    {
      category: 'Plumbing & Equipment',
      japaneseLabel: '給排水・キッチン・UB設備工事費',
      amountJpy: Math.round(avgTotal * 0.16),
      percentage: 16,
      color: '#4A6585', // Aizome indigo
    },
    {
      category: 'Exterior & Permits',
      japaneseLabel: '外構・玄関アプローチ・確認申請諸経費',
      amountJpy: Math.round(avgTotal * 0.12),
      percentage: 12,
      color: '#A64B3B', // Bengala
    },
  ];

  return {
    totalFloorAreaSqm,
    totalFloorAreaTsubo,
    baseTsuboTankaJpy: rates.avgTsubo,
    estimatedTotalMinJpy: minTotal,
    estimatedTotalMaxJpy: maxTotal,
    estimatedAverageJpy: avgTotal,
    breakdown,
    formattedRange: `${formatJpy(minTotal)} 〜 ${formatJpy(maxTotal)}`,
    formattedAverage: formatJpy(avgTotal),
  };
}


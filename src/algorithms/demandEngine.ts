import { InventoryItem, DemandTier } from '../types/warehouse';

export interface DemandAnalysisResult {
  demandScore: number; // 0.0 to 1.0
  demandTier: DemandTier;
}

export function calculateDemandScores(items: InventoryItem[]): Map<string, DemandAnalysisResult> {
  const map = new Map<string, DemandAnalysisResult>();

  if (items.length === 0) return map;

  const maxDemand = Math.max(...items.map(i => i.demandFrequency), 1);
  const minDemand = Math.min(...items.map(i => i.demandFrequency), 0);
  const range = Math.max(maxDemand - minDemand, 1);

  // Sort items by demand frequency to calculate percentile tiers
  const sorted = [...items].sort((a, b) => b.demandFrequency - a.demandFrequency);
  const count = sorted.length;

  sorted.forEach((item, index) => {
    const percentile = 1 - (index / count);
    const score = Number(((item.demandFrequency - minDemand) / range).toFixed(3));

    let tier: DemandTier = 'Low';
    if (percentile >= 0.70 || score >= 0.65) {
      tier = 'High';
    } else if (percentile >= 0.30 || score >= 0.25) {
      tier = 'Medium';
    }

    map.set(item.id, {
      demandScore: Math.max(0.01, score),
      demandTier: tier
    });
  });

  return map;
}

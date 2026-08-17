import { PlacedItem, LayoutMetrics, WarehouseConfig } from '../types/warehouse';

export function calculateOptimizationScore(
  metrics: LayoutMetrics,
  placedItems: PlacedItem[],
  config: WarehouseConfig
): number {
  const { alpha, beta, gamma } = config.weights;

  // Space waste score (0 to 100): Unused capacity % + penalty for unplaced items
  const unusedRatio = (metrics.unusedCapacityVolume / Math.max(metrics.totalCapacityVolume, 1));
  const unplacedPenalty = (metrics.unplacedItemsCount / Math.max(metrics.totalItemsCount, 1)) * 50;
  const spaceWasteScore = (unusedRatio * 50) + unplacedPenalty;

  // Retrieval distance score (average distance in grid meters)
  const retrievalDistanceScore = metrics.averageRetrievalDistance;

  // Handling cost score: based on item weight & fragility placement effort
  let totalHandling = 0;
  placedItems.forEach(item => {
    const weightFactor = item.weight > 10 ? 1.5 : 1.0;
    const fragilityFactor = item.fragility === 'High' ? 1.4 : item.fragility === 'Medium' ? 1.2 : 1.0;
    totalHandling += weightFactor * fragilityFactor;
  });
  const avgHandlingScore = placedItems.length > 0 ? (totalHandling / placedItems.length) * 10 : 0;

  // Objective function: Total Cost = α * Space Waste + β * Retrieval Distance + γ * Handling Cost
  const rawScore = (alpha * spaceWasteScore) + (beta * retrievalDistanceScore) + (gamma * avgHandlingScore);

  return Number(rawScore.toFixed(2));
}

export function calculateDemandProximityScore(
  placedItems: PlacedItem[]
): number {
  if (placedItems.length === 0) return 0;

  const highDemandItems = placedItems.filter(i => i.demandTier === 'High');
  if (highDemandItems.length === 0) return 100;

  // Sort all items by distance to dispatch ascending
  const sortedByDist = [...placedItems].sort((a, b) => a.distanceToDispatch - b.distanceToDispatch);
  const topCutoffDist = sortedByDist[Math.floor(sortedByDist.length * 0.35)]?.distanceToDispatch ?? 10;

  const highInTopSlots = highDemandItems.filter(i => i.distanceToDispatch <= topCutoffDist).length;
  const ratio = (highInTopSlots / highDemandItems.length) * 100;

  return Math.round(ratio);
}

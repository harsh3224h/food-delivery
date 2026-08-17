import { InventoryItem, PlacedItem, WarehouseBin, DemandTier } from '../types/warehouse';
import { calculateDemandScores } from './demandEngine';

export interface BinPackingResult {
  placedItems: PlacedItem[];
  unplacedItems: InventoryItem[];
  bins: WarehouseBin[];
  volumeUtilizationPercent: number;
}

export function runFirstFitDecreasing(
  items: InventoryItem[],
  availableBins: WarehouseBin[]
): BinPackingResult {
  const demandMap = calculateDemandScores(items);

  // Compute unit volume in L or m3 for each item
  const itemInstances: { item: InventoryItem; instanceIndex: number; unitVol: number; demandScore: number; demandTier: DemandTier }[] = [];

  items.forEach(item => {
    // Vol in Liters: (length * width * height) / 1000 cm3 -> L
    const vol = (item.length * item.width * item.height) / 1000;
    const demandInfo = demandMap.get(item.id) || { demandScore: 0.1, demandTier: 'Low' };

    for (let q = 0; q < item.quantity; q++) {
      itemInstances.push({
        item: { ...item, unitVolume: vol },
        instanceIndex: q + 1,
        unitVol: vol,
        demandScore: demandInfo.demandScore,
        demandTier: demandInfo.demandTier
      });
    }
  });

  // FFD Step 1: Sort items by volume descending, then by demand score descending
  itemInstances.sort((a, b) => {
    if (b.unitVol !== a.unitVol) {
      return b.unitVol - a.unitVol;
    }
    return b.demandScore - a.demandScore;
  });

  // Deep clone bins for packing state
  const binsState: WarehouseBin[] = availableBins.map(b => ({
    ...b,
    usedVolume: 0,
    placedItems: []
  }));

  const placedItems: PlacedItem[] = [];
  const unplacedMap = new Map<string, { item: InventoryItem; count: number }>();

  // FFD Step 2: Pack into first available bin with space
  for (const inst of itemInstances) {
    let placed = false;

    for (const bin of binsState) {
      const remainingVol = bin.capacityVolume - bin.usedVolume;
      if (remainingVol >= inst.unitVol) {
        // Check temperature compatibility if applicable
        if (inst.item.temperatureRequirement) {
          if (inst.item.temperatureRequirement === 'Frozen' && !bin.zone.includes('Frozen') && !bin.name.includes('Frz')) {
            continue;
          }
          if (inst.item.temperatureRequirement === 'Chilled' && bin.zone.includes('Ambient')) {
            continue;
          }
        }

        const placedItemObj: PlacedItem = {
          ...inst.item,
          id: `${inst.item.id}-${inst.instanceIndex}`,
          name: inst.instanceIndex > 1 ? `${inst.item.name} (#${inst.instanceIndex})` : inst.item.name,
          gridX: bin.gridX,
          gridY: bin.gridY,
          binId: bin.id,
          distanceToDispatch: 0,
          demandTier: inst.demandTier,
          demandScore: inst.demandScore
        };

        bin.placedItems.push(placedItemObj);
        bin.usedVolume += inst.unitVol;
        placedItems.push(placedItemObj);
        placed = true;
        break;
      }
    }

    if (!placed) {
      const existing = unplacedMap.get(inst.item.id);
      if (existing) {
        existing.count++;
      } else {
        unplacedMap.set(inst.item.id, { item: inst.item, count: 1 });
      }
    }
  }

  const unplacedItems: InventoryItem[] = Array.from(unplacedMap.values()).map(val => ({
    ...val.item,
    quantity: val.count
  }));

  const totalCap = binsState.reduce((sum, b) => sum + b.capacityVolume, 0);
  const totalUsed = binsState.reduce((sum, b) => sum + b.usedVolume, 0);
  const utilization = totalCap > 0 ? (totalUsed / totalCap) * 100 : 0;

  return {
    placedItems,
    unplacedItems,
    bins: binsState,
    volumeUtilizationPercent: Number(utilization.toFixed(1))
  };
}

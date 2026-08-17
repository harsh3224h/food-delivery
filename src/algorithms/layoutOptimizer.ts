import {
  InventoryItem,
  WarehouseConfig,
  GridCell,
  WarehouseBin,
  OptimizationResult,
  LayoutMetrics,
  PlacedItem,
  Point
} from '../types/warehouse';
import { runFirstFitDecreasing } from './binPacking';
import { findPathAStar } from './pathfinding';
import { calculateOptimizationScore, calculateDemandProximityScore } from './scoring';
import { calculateDemandScores } from './demandEngine';

export function generateWarehouseGrid(config: WarehouseConfig): {
  grid: GridCell[][];
  bins: WarehouseBin[];
} {
  const width = Math.max(10, config.width);
  const height = Math.max(10, config.length);

  const grid: GridCell[][] = [];
  const bins: WarehouseBin[] = [];

  // 1. Initialize grid with walkable cells
  for (let y = 0; y < height; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, type: 'walkable' });
    }
    grid.push(row);
  }

  // 2. Set Dispatch Location
  const dispatchX = Math.min(width - 1, Math.max(0, config.dispatchLocation.x));
  const dispatchY = Math.min(height - 1, Math.max(0, config.dispatchLocation.y));
  grid[dispatchY][dispatchX] = {
    x: dispatchX,
    y: dispatchY,
    type: 'dispatch'
  };

  // 3. Set Obstacles
  config.obstacles.forEach(obs => {
    for (let oy = 0; oy < obs.height; oy++) {
      for (let ox = 0; ox < obs.width; ox++) {
        const gx = obs.gridX + ox;
        const gy = obs.gridY + oy;
        if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
          if (gx !== dispatchX || gy !== dispatchY) {
            grid[gy][gx] = {
              x: gx,
              y: gy,
              type: 'obstacle',
              obstacleId: obs.id
            };
          }
        }
      }
    }
  });

  // 4. Generate Storage Rack Layout
  // Standard warehouse pattern: Double rack rows separated by 2-cell wide aisles
  // Reserve border margin (1 cell) for perimeter walking aisle
  let binCounter = 1;
  const aisleWidth = Math.max(2, config.aisleWidth || 2);

  for (let y = 2; y < height - 2; y += (2 + aisleWidth)) {
    // Two adjacent rack rows
    const rackRows = [y, y + 1];
    for (const ry of rackRows) {
      if (ry >= height - 2) continue;

      for (let x = 2; x < width - 2; x++) {
        // Leave cross-aisles every 8 cells
        if (x % 9 === 0) continue;

        // Skip if dispatch or obstacle
        if (grid[ry][x].type === 'dispatch' || grid[ry][x].type === 'obstacle') {
          continue;
        }

        const binId = `BIN-${binCounter++}`;
        let zone = 'Ambient Storage';
        if (ry < height * 0.3) zone = 'Chilled & Dairy Zone';
        if (ry > height * 0.7) zone = 'Frozen Storage Zone';

        grid[ry][x] = {
          x,
          y: ry,
          type: 'rack',
          binId
        };

        bins.push({
          id: binId,
          name: `Rack ${binId} (${x},${ry})`,
          gridX: x,
          gridY: ry,
          width: 1.0,
          depth: 1.0,
          maxWeight: 500,
          capacityVolume: 450, // 450 Liters per rack bin cell
          usedVolume: 0,
          placedItems: [],
          zone,
          isAccessible: true
        });
      }
    }
  }

  return { grid, bins };
}

export function runFullLayoutOptimization(
  items: InventoryItem[],
  config: WarehouseConfig
): OptimizationResult {
  const { grid, bins } = generateWarehouseGrid(config);
  const dispatchPoint: Point = config.dispatchLocation;

  // Compute A* distances from Dispatch to all bins
  const binDistances = bins.map(bin => {
    const pathRes = findPathAStar(grid, dispatchPoint, { x: bin.gridX, y: bin.gridY });
    return {
      bin,
      distance: pathRes.distance,
      manhattan: pathRes.manhattanDistance
    };
  });

  // ==========================================
  // 1. OPTIMIZED LAYOUT GENERATION
  // ==========================================
  // Sort bins by walkable distance to Dispatch ascending (Demand-based placement strategy)
  const sortedBinsForOptimized = [...binDistances]
    .sort((a, b) => a.distance - b.distance)
    .map(bd => bd.bin);

  const optPackingRes = runFirstFitDecreasing(items, sortedBinsForOptimized);

  // Construct Optimized Grid & update placed item metrics
  const optGrid: GridCell[][] = grid.map(row => row.map(cell => ({ ...cell })));
  const optPlacedItems: PlacedItem[] = [];

  optPackingRes.placedItems.forEach(pItem => {
    const cell = optGrid[pItem.gridY][pItem.gridX];
    if (cell) {
      cell.placedItem = pItem;
    }
    const pathRes = findPathAStar(optGrid, dispatchPoint, { x: pItem.gridX, y: pItem.gridY });
    const updatedPItem = {
      ...pItem,
      distanceToDispatch: pathRes.distance
    };
    optPlacedItems.push(updatedPItem);
  });

  const optMetrics = computeMetrics(optGrid, optPackingRes.bins, optPlacedItems, items, config, dispatchPoint);

  // ==========================================
  // 2. BASELINE (UNOPTIMIZED) LAYOUT GENERATION
  // ==========================================
  // Shuffle/Reverse bins for baseline layout so high-demand items get placed far away or randomly
  const demandMap = calculateDemandScores(items);
  const sortedItemsReverse = [...items].sort((a, b) => (a.demandFrequency - b.demandFrequency)); // Low demand first
  const sortedBinsForBaseline = [...binDistances]
    .sort((a, b) => b.distance - a.distance) // Far bins first
    .map(bd => bd.bin);

  const basePackingRes = runFirstFitDecreasing(sortedItemsReverse, sortedBinsForBaseline);

  const baseGrid: GridCell[][] = grid.map(row => row.map(cell => ({ ...cell })));
  const basePlacedItems: PlacedItem[] = [];

  basePackingRes.placedItems.forEach(pItem => {
    const cell = baseGrid[pItem.gridY][pItem.gridX];
    if (cell) {
      cell.placedItem = pItem;
    }
    const pathRes = findPathAStar(baseGrid, dispatchPoint, { x: pItem.gridX, y: pItem.gridY });
    const updatedPItem = {
      ...pItem,
      distanceToDispatch: pathRes.distance
    };
    basePlacedItems.push(updatedPItem);
  });

  const baseMetrics = computeMetrics(baseGrid, basePackingRes.bins, basePlacedItems, items, config, dispatchPoint);

  // ==========================================
  // 3. IMPROVEMENT DELTA CALCULATION
  // ==========================================
  const utilDelta = Number((optMetrics.utilizationPercentage - baseMetrics.utilizationPercentage).toFixed(1));
  const distRed = baseMetrics.averageRetrievalDistance > 0
    ? Number((((baseMetrics.averageRetrievalDistance - optMetrics.averageRetrievalDistance) / baseMetrics.averageRetrievalDistance) * 100).toFixed(1))
    : 0;
  const timeRed = baseMetrics.averageRetrievalTime > 0
    ? Number((((baseMetrics.averageRetrievalTime - optMetrics.averageRetrievalTime) / baseMetrics.averageRetrievalTime) * 100).toFixed(1))
    : 0;
  const scoreImp = baseMetrics.optimizationScore > 0
    ? Number((((baseMetrics.optimizationScore - optMetrics.optimizationScore) / baseMetrics.optimizationScore) * 100).toFixed(1))
    : 0;

  return {
    baselineLayout: {
      grid: baseGrid,
      placedItems: basePlacedItems,
      metrics: baseMetrics
    },
    optimizedLayout: {
      grid: optGrid,
      placedItems: optPlacedItems,
      metrics: optMetrics
    },
    improvement: {
      utilizationDelta: Math.max(0, utilDelta),
      distanceReductionPercent: Math.max(0, distRed),
      timeReductionPercent: Math.max(0, timeRed),
      scoreImprovementPercent: Math.max(0, scoreImp)
    },
    unplacedItems: optPackingRes.unplacedItems,
    bins: optPackingRes.bins
  };
}

function computeMetrics(
  grid: GridCell[][],
  bins: WarehouseBin[],
  placedItems: PlacedItem[],
  originalItems: InventoryItem[],
  config: WarehouseConfig,
  dispatchPoint: Point
): LayoutMetrics {
  const totalCap = bins.reduce((sum, b) => sum + b.capacityVolume, 0);
  const usedCap = bins.reduce((sum, b) => sum + b.usedVolume, 0);
  const unusedCap = Math.max(0, totalCap - usedCap);
  const utilPct = totalCap > 0 ? Number(((usedCap / totalCap) * 100).toFixed(1)) : 0;

  const totalItemsCount = originalItems.reduce((sum, i) => sum + i.quantity, 0);
  const placedCount = placedItems.length;
  const unplacedCount = Math.max(0, totalItemsCount - placedCount);

  // Compute retrieval distances weighted by item demand frequency
  let totalDistSum = 0;
  let totalTimeSum = 0;
  let totalWeightSum = 0;

  placedItems.forEach(item => {
    const weight = Math.max(1, item.demandFrequency);
    const pathRes = findPathAStar(grid, dispatchPoint, { x: item.gridX, y: item.gridY });
    totalDistSum += pathRes.distance * weight;
    totalTimeSum += (pathRes.estimatedTimeSeconds / 60) * weight;
    totalWeightSum += weight;
  });

  const avgDist = totalWeightSum > 0 ? Number((totalDistSum / totalWeightSum).toFixed(1)) : 0;
  const avgTime = totalWeightSum > 0 ? Number((totalTimeSum / totalWeightSum).toFixed(2)) : 0;

  const metricsObj: LayoutMetrics = {
    totalCapacityVolume: totalCap,
    usedCapacityVolume: Number(usedCap.toFixed(1)),
    unusedCapacityVolume: Number(unusedCap.toFixed(1)),
    utilizationPercentage: utilPct,
    totalItemsCount,
    placedItemsCount: placedCount,
    unplacedItemsCount: unplacedCount,
    unplacedItemsList: [],
    averageRetrievalDistance: avgDist,
    averageRetrievalTime: avgTime,
    optimizationScore: 0,
    demandProximityScore: calculateDemandProximityScore(placedItems)
  };

  metricsObj.optimizationScore = calculateOptimizationScore(metricsObj, placedItems, config);

  return metricsObj;
}

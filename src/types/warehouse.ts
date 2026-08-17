export type StorageCategory = 
  | 'Fresh Produce'
  | 'Frozen & Ice Cream'
  | 'Dairy & Refrigerated'
  | 'Meat & Seafood'
  | 'Bakery & Snacks'
  | 'Beverages'
  | 'Prepared Meals'
  | 'Packaging & Consumables';

export type DemandTier = 'High' | 'Medium' | 'Low';

export interface InventoryItem {
  id: string;
  name: string;
  category: StorageCategory;
  quantity: number;
  length: number; // in cm
  width: number;  // in cm
  height: number; // in cm
  weight: number; // in kg
  demandFrequency: number; // number of orders per month/week
  priority: number; // 1 (Highest) to 5 (Lowest)
  expiryDate?: string;
  temperatureRequirement?: 'Ambient' | 'Chilled' | 'Frozen';
  fragility?: 'Low' | 'Medium' | 'High';
  unitVolume: number; // calculated: (length * width * height) / 1000 in Liters or m3
}

export interface PlacedItem extends InventoryItem {
  gridX: number;
  gridY: number;
  binId: string;
  distanceToDispatch: number; // Manhattan or grid path distance
  demandTier: DemandTier;
  demandScore: number; // 0 to 1
}

export interface WarehouseBin {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  width: number;  // meters or grid units
  depth: number;  // meters or grid units
  maxWeight: number; // kg
  capacityVolume: number; // m3 or L
  usedVolume: number;
  placedItems: PlacedItem[];
  zone: string;
  isAccessible: boolean;
}

export interface Obstacle {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  width: number;
  height: number;
  type: 'Pillar' | 'Office' | 'Cold Room Wall' | 'Equipment';
}

export interface Point {
  x: number;
  y: number;
}

export interface WarehouseConfig {
  name: string;
  length: number; // grid units or meters
  width: number;  // grid units or meters
  gridResolution: number; // e.g. 1m per grid cell
  dispatchLocation: Point;
  racksPerAisle: number;
  aisleWidth: number;
  obstacles: Obstacle[];
  weights: {
    alpha: number; // Space Waste weight
    beta: number;  // Retrieval Distance weight
    gamma: number; // Handling Cost weight
  };
}

export type CellType = 'walkable' | 'rack' | 'dispatch' | 'obstacle';

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  binId?: string;
  placedItem?: PlacedItem;
  obstacleId?: string;
}

export interface PathResult {
  path: Point[];
  distance: number; // total steps/meters
  manhattanDistance: number;
  estimatedTimeSeconds: number;
}

export interface LayoutMetrics {
  totalCapacityVolume: number;
  usedCapacityVolume: number;
  unusedCapacityVolume: number;
  utilizationPercentage: number;
  totalItemsCount: number;
  placedItemsCount: number;
  unplacedItemsCount: number;
  unplacedItemsList: InventoryItem[];
  averageRetrievalDistance: number;
  averageRetrievalTime: number; // in minutes
  optimizationScore: number; // total cost score (lower is better or inverted index)
  demandProximityScore: number; // % of high demand items in top 30% closest slots
}

export interface OptimizationResult {
  baselineLayout: {
    grid: GridCell[][];
    placedItems: PlacedItem[];
    metrics: LayoutMetrics;
  };
  optimizedLayout: {
    grid: GridCell[][];
    placedItems: PlacedItem[];
    metrics: LayoutMetrics;
  };
  improvement: {
    utilizationDelta: number; // percentage points e.g. +26%
    distanceReductionPercent: number; // e.g. -44%
    timeReductionPercent: number; // e.g. -43%
    scoreImprovementPercent: number;
  };
  unplacedItems: InventoryItem[];
  bins: WarehouseBin[];
}

export interface OrderRecord {
  orderId: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  quantity: number;
  restaurantName: string;
}

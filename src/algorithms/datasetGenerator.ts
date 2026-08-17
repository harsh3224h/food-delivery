import { InventoryItem, WarehouseConfig } from '../types/warehouse';
import Papa from 'papaparse';

export const SAMPLE_DARK_STORE_ITEMS: InventoryItem[] = [
  {
    id: 'ITEM-101',
    name: 'Fresh Organic Milk (1L Bottle)',
    category: 'Dairy & Refrigerated',
    quantity: 40,
    length: 12,
    width: 12,
    height: 25,
    weight: 1.0,
    demandFrequency: 450,
    priority: 1,
    temperatureRequirement: 'Chilled',
    fragility: 'Low',
    unitVolume: 3.6
  },
  {
    id: 'ITEM-102',
    name: 'Artisanal Sliced White Bread (500g)',
    category: 'Bakery & Snacks',
    quantity: 35,
    length: 28,
    width: 14,
    height: 14,
    weight: 0.5,
    demandFrequency: 380,
    priority: 1,
    temperatureRequirement: 'Ambient',
    fragility: 'High',
    unitVolume: 5.488
  },
  {
    id: 'ITEM-103',
    name: 'Pre-Cooked Pepperoni Pizza (Frozen)',
    category: 'Frozen & Ice Cream',
    quantity: 30,
    length: 32,
    width: 32,
    height: 5,
    weight: 0.8,
    demandFrequency: 320,
    priority: 2,
    temperatureRequirement: 'Frozen',
    fragility: 'Medium',
    unitVolume: 5.12
  },
  {
    id: 'ITEM-104',
    name: 'Sparkling Mineral Water (Pack of 6x500ml)',
    category: 'Beverages',
    quantity: 25,
    length: 22,
    width: 15,
    height: 22,
    weight: 3.2,
    demandFrequency: 290,
    priority: 2,
    temperatureRequirement: 'Ambient',
    fragility: 'Low',
    unitVolume: 7.26
  },
  {
    id: 'ITEM-105',
    name: 'Fresh Avocado Bag (4 Count)',
    category: 'Fresh Produce',
    quantity: 20,
    length: 20,
    width: 15,
    height: 10,
    weight: 0.7,
    demandFrequency: 270,
    priority: 1,
    temperatureRequirement: 'Ambient',
    fragility: 'Medium',
    unitVolume: 3.0
  },
  {
    id: 'ITEM-106',
    name: 'Gourmet Chicken Breast Pack (1kg)',
    category: 'Meat & Seafood',
    quantity: 22,
    length: 24,
    width: 18,
    height: 8,
    weight: 1.0,
    demandFrequency: 240,
    priority: 2,
    temperatureRequirement: 'Chilled',
    fragility: 'Low',
    unitVolume: 3.456
  },
  {
    id: 'ITEM-107',
    name: 'Vanilla Bean Ice Cream Tub (1L)',
    category: 'Frozen & Ice Cream',
    quantity: 18,
    length: 15,
    width: 15,
    height: 16,
    weight: 0.9,
    demandFrequency: 210,
    priority: 2,
    temperatureRequirement: 'Frozen',
    fragility: 'Low',
    unitVolume: 3.6
  },
  {
    id: 'ITEM-108',
    name: 'Ready-to-Eat Caesar Salad Box',
    category: 'Prepared Meals',
    quantity: 15,
    length: 18,
    width: 18,
    height: 10,
    weight: 0.35,
    demandFrequency: 195,
    priority: 1,
    temperatureRequirement: 'Chilled',
    fragility: 'High',
    unitVolume: 3.24
  },
  {
    id: 'ITEM-109',
    name: 'Energy Soda Cans (12-Pack Tray)',
    category: 'Beverages',
    quantity: 16,
    length: 32,
    width: 21,
    height: 13,
    weight: 4.2,
    demandFrequency: 180,
    priority: 3,
    temperatureRequirement: 'Ambient',
    fragility: 'Low',
    unitVolume: 8.736
  },
  {
    id: 'ITEM-110',
    name: 'Organic Free-Range Eggs (12-Pack)',
    category: 'Dairy & Refrigerated',
    quantity: 28,
    length: 30,
    width: 11,
    height: 8,
    weight: 0.75,
    demandFrequency: 160,
    priority: 1,
    temperatureRequirement: 'Chilled',
    fragility: 'High',
    unitVolume: 2.64
  },
  {
    id: 'ITEM-111',
    name: 'Potato Crisps Party Tub (300g)',
    category: 'Bakery & Snacks',
    quantity: 14,
    length: 22,
    width: 22,
    height: 25,
    weight: 0.3,
    demandFrequency: 120,
    priority: 4,
    temperatureRequirement: 'Ambient',
    fragility: 'High',
    unitVolume: 12.1
  },
  {
    id: 'ITEM-112',
    name: 'Eco-Friendly Takeout Containers (50 Pack)',
    category: 'Packaging & Consumables',
    quantity: 10,
    length: 40,
    width: 30,
    height: 25,
    weight: 2.5,
    demandFrequency: 90,
    priority: 4,
    temperatureRequirement: 'Ambient',
    fragility: 'Low',
    unitVolume: 30.0
  },
  {
    id: 'ITEM-113',
    name: 'Wild Atlantic Salmon Fillet (500g)',
    category: 'Meat & Seafood',
    quantity: 12,
    length: 22,
    width: 14,
    height: 6,
    weight: 0.5,
    demandFrequency: 85,
    priority: 3,
    temperatureRequirement: 'Chilled',
    fragility: 'Medium',
    unitVolume: 1.848
  },
  {
    id: 'ITEM-114',
    name: 'Bulk Olive Oil Tin (5L)',
    category: 'Bakery & Snacks',
    quantity: 8,
    length: 18,
    width: 15,
    height: 30,
    weight: 4.8,
    demandFrequency: 45,
    priority: 5,
    temperatureRequirement: 'Ambient',
    fragility: 'Low',
    unitVolume: 8.1
  },
  {
    id: 'ITEM-115',
    name: 'Frozen Berry Mix Pouch (1kg)',
    category: 'Frozen & Ice Cream',
    quantity: 15,
    length: 25,
    width: 20,
    height: 8,
    weight: 1.0,
    demandFrequency: 40,
    priority: 4,
    temperatureRequirement: 'Frozen',
    fragility: 'Low',
    unitVolume: 4.0
  }
];

export const DEFAULT_WAREHOUSE_CONFIG: WarehouseConfig = {
  name: 'Metro Dark-Store Hub #04',
  length: 22, // 22 grid rows
  width: 28,  // 28 grid columns
  gridResolution: 1, // 1m x 1m grid
  dispatchLocation: { x: 2, y: 2 },
  racksPerAisle: 2,
  aisleWidth: 2,
  obstacles: [
    {
      id: 'OBS-1',
      name: 'Manager Desk & Kiosk',
      gridX: 8,
      gridY: 1,
      width: 4,
      height: 2,
      type: 'Office'
    },
    {
      id: 'OBS-2',
      name: 'Structural Support Pillar A',
      gridX: 14,
      gridY: 10,
      width: 2,
      height: 2,
      type: 'Pillar'
    },
    {
      id: 'OBS-3',
      name: 'Cold Storage Compressor Unit',
      gridX: 22,
      gridY: 16,
      width: 3,
      height: 3,
      type: 'Equipment'
    }
  ],
  weights: {
    alpha: 0.4, // Space waste
    beta: 0.4,  // Retrieval distance
    gamma: 0.2  // Handling cost
  }
};

export function parseInventoryCSV(csvText: string): {
  items: InventoryItem[];
  errors: string[];
} {
  const errors: string[] = [];
  const items: InventoryItem[] = [];

  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(err => {
      errors.push(`Row ${err.row}: ${err.message}`);
    });
  }

  const rows = result.data as Record<string, unknown>[];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const itemId = String(row.item_id || row.itemId || `CSV-ITEM-${idx + 1}`).trim();
    const itemName = String(row.item_name || row.itemName || row.name || `Item ${idx + 1}`).trim();
    const category = (row.category as string) || 'Prepared Meals';
    const quantity = Math.max(1, Number(row.quantity || 1));
    const length = Math.max(1, Number(row.length || 20));
    const width = Math.max(1, Number(row.width || 20));
    const height = Math.max(1, Number(row.height || 20));
    const weight = Math.max(0.1, Number(row.weight || 1.0));
    const demandFrequency = Math.max(1, Number(row.demand_frequency || row.demandFrequency || row.demand || 50));
    const priority = Math.min(5, Math.max(1, Number(row.priority || 3)));

    if (!row.item_name && !row.itemName && !row.name) {
      errors.push(`Row ${rowNum}: Missing 'item_name' field.`);
    }

    const vol = (length * width * height) / 1000;

    items.push({
      id: itemId,
      name: itemName,
      category: category as InventoryItem['category'],
      quantity,
      length,
      width,
      height,
      weight,
      demandFrequency,
      priority,
      temperatureRequirement: (row.temperatureRequirement as InventoryItem['temperatureRequirement']) || 'Ambient',
      fragility: (row.fragility as InventoryItem['fragility']) || 'Low',
      unitVolume: vol
    });
  });

  return { items, errors };
}

export function generateCSVTemplate(): string {
  const headers = [
    'item_id',
    'item_name',
    'category',
    'quantity',
    'length',
    'width',
    'height',
    'weight',
    'demand_frequency',
    'priority',
    'temperatureRequirement',
    'fragility'
  ];

  const sampleRows = SAMPLE_DARK_STORE_ITEMS.slice(0, 5).map(item => [
    item.id,
    `"${item.name}"`,
    `"${item.category}"`,
    item.quantity,
    item.length,
    item.width,
    item.height,
    item.weight,
    item.demandFrequency,
    item.priority,
    item.temperatureRequirement || 'Ambient',
    item.fragility || 'Low'
  ]);

  return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
}

'use client';

import React, { useState } from 'react';
import { InventoryItem, StorageCategory } from '../types/warehouse';
import { calculateDemandScores } from '../algorithms/demandEngine';
import {
  Package,
  Search,
  Plus,
  Trash2,
  Upload,
  Download,
  Filter,
  Layers
} from 'lucide-react';

interface InventoryManagerProps {
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenCSVModal: () => void;
  onDownloadSampleCSV: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onOpenCSVModal,
  onDownloadSampleCSV
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<StorageCategory>('Prepared Meals');
  const [newItemQty, setNewItemQty] = useState(20);
  const [newItemLen, setNewItemLen] = useState(20);
  const [newItemWid, setNewItemWid] = useState(15);
  const [newItemHei, setNewItemHei] = useState(10);
  const [newItemWt, setNewItemWt] = useState(1.0);
  const [newItemDemand, setNewItemDemand] = useState(150);
  const [newItemPriority, setNewItemPriority] = useState(2);
  const [newItemTemp, setNewItemTemp] = useState<'Ambient' | 'Chilled' | 'Frozen'>('Ambient');

  const demandMap = calculateDemandScores(items);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const vol = (newItemLen * newItemWid * newItemHei) / 1000;
    const newItem: InventoryItem = {
      id: `ITEM-${Date.now().toString().slice(-4)}`,
      name: newItemName,
      category: newItemCat,
      quantity: newItemQty,
      length: newItemLen,
      width: newItemWid,
      height: newItemHei,
      weight: newItemWt,
      demandFrequency: newItemDemand,
      priority: newItemPriority,
      temperatureRequirement: newItemTemp,
      fragility: 'Low',
      unitVolume: vol
    };

    onAddItem(newItem);
    setNewItemName('');
    setShowAddModal(false);
  };

  return (
    <div className="panel-2015 flex flex-col h-full">
      {/* Header */}
      <div className="panel-header-2015">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-sky-700" />
          <span>Food Inventory Master Database</span>
          <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded border border-sky-300 font-mono font-bold">
            {items.length} SKUs ({items.reduce((s, i) => s + i.quantity, 0)} Total Units)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-2015 btn-primary-2015"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New SKU
          </button>
          <button
            onClick={onOpenCSVModal}
            className="btn-2015 btn-silver-2015"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button
            onClick={onDownloadSampleCSV}
            className="btn-2015 btn-silver-2015"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Template
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="p-3 bg-slate-100 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU ID or Item Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-sky-500 shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-700">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Categories ({items.length})</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
            <option value="Frozen & Ice Cream">Frozen & Ice Cream</option>
            <option value="Meat & Seafood">Meat & Seafood</option>
            <option value="Bakery & Snacks">Bakery & Snacks</option>
            <option value="Beverages">Beverages</option>
            <option value="Prepared Meals">Prepared Meals</option>
            <option value="Packaging & Consumables">Packaging & Consumables</option>
          </select>
        </div>
      </div>

      {/* Table Data View */}
      <div className="flex-1 overflow-auto p-3">
        <table className="table-2015">
          <thead>
            <tr>
              <th>SKU ID</th>
              <th>ITEM NAME</th>
              <th>CATEGORY</th>
              <th>QTY</th>
              <th>DIMENSIONS (LxWxH cm)</th>
              <th>VOL / UNIT</th>
              <th>WEIGHT</th>
              <th>DEMAND FREQ</th>
              <th>DEMAND TIER</th>
              <th>TEMP REQ</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-6 text-slate-500 italic">
                  No inventory items match current filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const demandInfo = demandMap.get(item.id) || { demandScore: 0.1, demandTier: 'Low' };
                return (
                  <tr key={item.id}>
                    <td className="font-mono font-bold text-sky-800">{item.id}</td>
                    <td className="font-semibold text-slate-900">{item.name}</td>
                    <td>
                      <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-center">{item.quantity}</td>
                    <td className="font-mono text-slate-600">
                      {item.length}×{item.width}×{item.height}
                    </td>
                    <td className="font-mono text-slate-700">
                      {((item.length * item.width * item.height) / 1000).toFixed(1)} L
                    </td>
                    <td className="font-mono text-slate-700">{item.weight} kg</td>
                    <td className="font-mono font-bold text-slate-800">{item.demandFrequency}/mo</td>
                    <td>
                      <span className={`badge-2015 ${
                        demandInfo.demandTier === 'High' ? 'badge-high' :
                        demandInfo.demandTier === 'Medium' ? 'badge-medium' : 'badge-low'
                      }`}>
                        {demandInfo.demandTier}
                      </span>
                    </td>
                    <td>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {item.temperatureRequirement || 'Ambient'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Delete SKU"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding Item */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="panel-2015 w-full max-w-md bg-white shadow-2xl">
            <div className="panel-header-2015">
              <span className="flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-700" />
                Add New Food Inventory SKU
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Almond Milk (1L)"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCat}
                    onChange={e => setNewItemCat(e.target.value as StorageCategory)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded focus:border-sky-500 focus:outline-none bg-white"
                  >
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                    <option value="Frozen & Ice Cream">Frozen & Ice Cream</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Bakery & Snacks">Bakery & Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Prepared Meals">Prepared Meals</option>
                    <option value="Packaging & Consumables">Packaging & Consumables</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={e => setNewItemQty(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Length (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemLen}
                    onChange={e => setNewItemLen(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Width (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemWid}
                    onChange={e => setNewItemWid(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemHei}
                    onChange={e => setNewItemHei(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newItemWt}
                    onChange={e => setNewItemWt(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Demand Freq</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemDemand}
                    onChange={e => setNewItemDemand(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Temp Req</label>
                  <select
                    value={newItemTemp}
                    onChange={e => setNewItemTemp(e.target.value as 'Ambient' | 'Chilled' | 'Frozen')}
                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                  >
                    <option value="Ambient">Ambient</option>
                    <option value="Chilled">Chilled</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-2015 btn-silver-2015"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-2015 btn-success-2015"
                >
                  Add SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

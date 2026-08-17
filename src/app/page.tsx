'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem, WarehouseConfig, PlacedItem } from '../types/warehouse';
import { DEFAULT_WAREHOUSE_CONFIG, generateCSVTemplate } from '../algorithms/datasetGenerator';
import { runFullLayoutOptimization } from '../algorithms/layoutOptimizer';

// UI Components
import { Header2015 } from '../components/Header2015';
import { WarehouseVisualizer } from '../components/WarehouseVisualizer';
import { BeforeAfterView } from '../components/BeforeAfterView';
import { InventoryManager } from '../components/InventoryManager';
import { PathfinderSimulator } from '../components/PathfinderSimulator';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { CSVImporterModal } from '../components/CSVImporterModal';
import { WarehouseConfigurator } from '../components/WarehouseConfigurator';
import { AlgorithmExplainModal } from '../components/AlgorithmExplainModal';

// Icons
import {
  Layers,
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle
} from 'lucide-react';

const STORAGE_KEY = 'wms_uploaded_inventory_items';

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [config, setConfig] = useState<WarehouseConfig>(DEFAULT_WAREHOUSE_CONFIG);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'before-after' | 'simulator' | 'inventory' | 'analytics'>('visualizer');
  const [selectedItem, setSelectedItem] = useState<PlacedItem | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Modals
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Load persisted items from localStorage on mount (if previously uploaded by user)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save to localStorage whenever items state changes
  const updateItems = (newItems: InventoryItem[]) => {
    setItems(newItems);
    try {
      if (newItems.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  // Compute Optimization Result
  const optimizationResult = useMemo(() => {
    return runFullLayoutOptimization(items, config);
  }, [items, config]);

  const handleRunOptimization = () => {
    if (items.length === 0) {
      setShowCSVModal(true);
      return;
    }
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setActiveTab('before-after');
    }, 600);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'food_inventory_structure.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSVItems = (importedItems: InventoryItem[]) => {
    updateItems(importedItems);
  };

  const handleAddItem = (newItem: InventoryItem) => {
    updateItems([newItem, ...items]);
  };

  const handleDeleteItem = (id: string) => {
    updateItems(items.filter(i => i.id !== id));
  };

  const handleClearAllItems = () => {
    updateItems([]);
  };

  const hasData = items.length > 0;

  return (
    <div className="min-h-screen bg-[#eef2f5] text-slate-900 flex flex-col font-sans select-none">
      {/* Enterprise Header */}
      <Header2015
        warehouseName={config.name}
        onRunOptimization={handleRunOptimization}
        onOpenCSVModal={() => setShowCSVModal(true)}
        onDownloadSampleCSV={handleDownloadSampleCSV}
        onOpenConfig={() => setShowConfigModal(true)}
        onOpenHelpModal={() => setShowHelpModal(true)}
        isOptimizing={isOptimizing}
      />

      {/* Primary Tab Navigation */}
      <div className="bg-toolbar-gradient px-4 pt-2 border-b border-slate-300 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`tab-2015 ${activeTab === 'visualizer' ? 'tab-2015-active' : ''}`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1 text-sky-700" />
            2D Layout Visualizer
          </button>

          <button
            onClick={() => setActiveTab('before-after')}
            className={`tab-2015 ${activeTab === 'before-after' ? 'tab-2015-active' : ''}`}
          >
            <TrendingUp className="w-3.5 h-3.5 inline mr-1 text-emerald-700" />
            Before vs After Results
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`tab-2015 ${activeTab === 'simulator' ? 'tab-2015-active' : ''}`}
          >
            <ShoppingCart className="w-3.5 h-3.5 inline mr-1 text-amber-700" />
            A* Pick Route Simulator
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`tab-2015 ${activeTab === 'inventory' ? 'tab-2015-active' : ''}`}
          >
            <Package className="w-3.5 h-3.5 inline mr-1 text-purple-700" />
            Inventory SKUs ({items.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`tab-2015 ${activeTab === 'analytics' ? 'tab-2015-active' : ''}`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1 text-rose-700" />
            Analytics & KPIs
          </button>
        </div>

        {/* Quick Performance Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs pb-1 font-mono">
          <span className="text-slate-600">
            Utilization: <strong className="text-sky-800">{hasData ? `${optimizationResult.optimizedLayout.metrics.utilizationPercentage}%` : '--'}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">
            Avg Pick Dist: <strong className="text-emerald-800">{hasData ? `${optimizationResult.optimizedLayout.metrics.averageRetrievalDistance}m` : '--'}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">
            Dist Reduction: <strong className="text-emerald-700">{hasData ? `-${optimizationResult.improvement.distanceReductionPercent}%` : '--'}</strong>
          </span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto flex flex-col justify-center">
        {!hasData ? (
          /* Empty State View when no CSV has been uploaded */
          <div className="panel-2015 my-6 p-8 bg-white text-center max-w-2xl mx-auto shadow-lg rounded border border-slate-300">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-300 text-sky-700 shadow-inner">
              <UploadCloud className="w-9 h-9" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2 font-sans">
              No Inventory Data Uploaded
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
              The warehouse system is currently empty. Please upload your food inventory CSV file to calculate spatial layout optimization, run First Fit Decreasing bin-packing, compute A* retrieval routes, and view analytics.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowCSVModal(true)}
                className="btn-2015 btn-success-2015 text-sm py-2 px-4 shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Upload Inventory CSV File
              </button>

              <button
                onClick={handleDownloadSampleCSV}
                className="btn-2015 btn-silver-2015 text-sm py-2 px-4"
              >
                <Download className="w-4 h-4" />
                Download Sample CSV Format
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Expected columns: item_id, item_name, category, quantity, length, width, height, weight, demand_frequency</span>
            </div>
          </div>
        ) : (
          /* Active Workspace Tabs when CSV Data is Loaded */
          <>
            {activeTab === 'visualizer' && (
              <div className="h-[620px]">
                <WarehouseVisualizer
                  grid={optimizationResult.optimizedLayout.grid}
                  dispatchLocation={config.dispatchLocation}
                  placedItems={optimizationResult.optimizedLayout.placedItems}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                  title={`${config.name} - 2D Interactive Warehouse Grid`}
                  subtitle="Optimized Item Placement (First Fit Decreasing + High Demand Exit Proximity)"
                />
              </div>
            )}

            {activeTab === 'before-after' && (
              <BeforeAfterView
                result={optimizationResult}
                dispatchLocation={config.dispatchLocation}
              />
            )}

            {activeTab === 'simulator' && (
              <PathfinderSimulator
                grid={optimizationResult.optimizedLayout.grid}
                dispatchLocation={config.dispatchLocation}
                placedItems={optimizationResult.optimizedLayout.placedItems}
              />
            )}

            {activeTab === 'inventory' && (
              <div className="h-[620px]">
                <div className="mb-2 flex justify-end">
                  <button
                    onClick={handleClearAllItems}
                    className="btn-2015 btn-warning-2015 text-xs"
                    title="Clear current dataset"
                  >
                    Clear Inventory Data
                  </button>
                </div>
                <InventoryManager
                  items={items}
                  onAddItem={handleAddItem}
                  onDeleteItem={handleDeleteItem}
                  onOpenCSVModal={() => setShowCSVModal(true)}
                  onDownloadSampleCSV={handleDownloadSampleCSV}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard result={optimizationResult} />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showCSVModal && (
        <CSVImporterModal
          onClose={() => setShowCSVModal(false)}
          onImportItems={handleImportCSVItems}
        />
      )}

      {showConfigModal && (
        <WarehouseConfigurator
          config={config}
          onSaveConfig={setConfig}
          onResetDefault={() => setConfig(DEFAULT_WAREHOUSE_CONFIG)}
          onClose={() => setShowConfigModal(false)}
        />
      )}

      {showHelpModal && (
        <AlgorithmExplainModal
          onClose={() => setShowHelpModal(false)}
        />
      )}

      {/* Footer Bar */}
      <footer className="bg-slate-800 text-slate-400 text-xs py-2 px-4 border-t border-slate-700 flex flex-wrap justify-between items-center font-mono">
        <div>
          Food Delivery Warehouse Space Optimizer • <span className="text-slate-300">Enterprise WMS v2.4</span>
        </div>
        <div>
          Algorithmic Stack: <span className="text-sky-400">FFD Bin Packing</span> | <span className="text-emerald-400">A* Pathfinding</span> | <span className="text-amber-400">Demand Geometric Placement</span>
        </div>
      </footer>
    </div>
  );
}

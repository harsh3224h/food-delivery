'use client';

import React, { useState } from 'react';
import { GridCell, Point, PlacedItem, PathResult } from '../types/warehouse';
import { findMultiItemPickRoute } from '../algorithms/pathfinding';
import { WarehouseVisualizer } from './WarehouseVisualizer';
import {
  Navigation,
  ShoppingCart,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  ListOrdered
} from 'lucide-react';

interface PathfinderSimulatorProps {
  grid: GridCell[][];
  dispatchLocation: Point;
  placedItems: PlacedItem[];
}

export const PathfinderSimulator: React.FC<PathfinderSimulatorProps> = ({
  grid,
  dispatchLocation,
  placedItems
}) => {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [routeResult, setRouteResult] = useState<PathResult | null>(null);

  const toggleSelectItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(i => i !== id));
    } else {
      if (selectedItemIds.length >= 6) return; // Limit to 6 items per batch pick
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleCalculateRoute = () => {
    if (selectedItemIds.length === 0) return;

    const targets: Point[] = selectedItemIds
      .map(id => placedItems.find(p => p.id === id))
      .filter((item): item is PlacedItem => item !== undefined)
      .map(item => ({ x: item.gridX, y: item.gridY }));

    const result = findMultiItemPickRoute(grid, dispatchLocation, targets);
    setRouteResult(result);
  };

  const handleReset = () => {
    setSelectedItemIds([]);
    setRouteResult(null);
  };

  const selectedItemsList = selectedItemIds
    .map(id => placedItems.find(p => p.id === id))
    .filter((i): i is PlacedItem => i !== undefined);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Column: Order Item Selector & Route Itinerary */}
      <div className="panel-2015 flex flex-col h-[600px]">
        <div className="panel-header-2015">
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-amber-600" />
            Order Picker Batch Route Calculator
          </span>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
          Select up to 6 food items to simulate an order picker route. The system will optimize the A* multi-stop picking tour from Dispatch and back.
        </div>

        {/* Item Selection List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-xs">
          <div className="font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>Available Inventory Items ({placedItems.length}):</span>
            <span className="text-amber-700 font-mono">Selected: {selectedItemIds.length}/6</span>
          </div>

          {placedItems.map(item => {
            const isSelected = selectedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelectItem(item.id)}
                className={`p-2 rounded border cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-amber-100 border-amber-400 font-bold text-amber-950 shadow-xs'
                    : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="accent-amber-600"
                  />
                  <div className="truncate">
                    <div className="truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal truncate">
                      {item.category} • Dist: {item.distanceToDispatch}m
                    </div>
                  </div>
                </div>

                <span className={`badge-2015 ${
                  item.demandTier === 'High' ? 'badge-high' :
                  item.demandTier === 'Medium' ? 'badge-medium' : 'badge-low'
                }`}>
                  {item.demandTier}
                </span>
              </div>
            );
          })}
        </div>

        {/* Calculate & Clear Buttons */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between gap-2">
          <button
            onClick={handleReset}
            className="btn-2015 btn-silver-2015 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={handleCalculateRoute}
            disabled={selectedItemIds.length === 0}
            className="btn-2015 btn-success-2015 text-xs"
          >
            <Play className="w-3.5 h-3.5" />
            Compute A* Multi-Stop Tour
          </button>
        </div>
      </div>

      {/* Center & Right Column: Interactive Visualizer & Pick Sequence */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="h-[440px]">
          <WarehouseVisualizer
            grid={grid}
            dispatchLocation={dispatchLocation}
            placedItems={placedItems}
            selectedItem={null}
            onSelectItem={() => {}}
            title="A* Multi-Stop Order Picking Route Visualization"
            subtitle={routeResult ? `Calculated Tour: ${routeResult.distance}m total walkable distance` : 'Select items and click Compute'}
          />
        </div>

        {/* Route Details Panel */}
        {routeResult && (
          <div className="panel-2015 p-3 bg-gradient-to-r from-emerald-900 to-teal-900 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-700/60 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Optimal Order Picking Route Summary</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-200">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  Total Path: <strong className="text-white text-sm">{routeResult.distance} meters</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Est Pick & Travel Time: <strong className="text-white text-sm">{(routeResult.estimatedTimeSeconds / 60).toFixed(1)} mins</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-mono">
              <span className="bg-amber-500 text-amber-950 font-bold px-2 py-1 rounded flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3" /> DISPATCH EXIT (Start)
              </span>

              {selectedItemsList.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <span className="text-emerald-400 font-bold">➔</span>
                  <span className="bg-emerald-800/90 border border-emerald-600 px-2 py-1 rounded text-emerald-100 flex items-center gap-1 shrink-0">
                    <span className="bg-emerald-600 text-white font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    {item.name}
                  </span>
                </React.Fragment>
              ))}

              <span className="text-emerald-400 font-bold">➔</span>
              <span className="bg-amber-500 text-amber-950 font-bold px-2 py-1 rounded flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3" /> DISPATCH EXIT (Return)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

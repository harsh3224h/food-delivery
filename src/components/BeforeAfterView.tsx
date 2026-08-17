'use client';

import React, { useState } from 'react';
import { OptimizationResult, PlacedItem } from '../types/warehouse';
import { WarehouseVisualizer } from './WarehouseVisualizer';
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Navigation,
  Percent
} from 'lucide-react';

interface BeforeAfterViewProps {
  result: OptimizationResult;
  dispatchLocation: { x: number; y: number };
}

export const BeforeAfterView: React.FC<BeforeAfterViewProps> = ({
  result,
  dispatchLocation
}) => {
  const [selectedItem, setSelectedItem] = useState<PlacedItem | null>(null);
  const [activeTab, setActiveTab] = useState<'split' | 'optimized' | 'baseline'>('split');

  const base = result.baselineLayout.metrics;
  const opt = result.optimizedLayout.metrics;
  const imp = result.improvement;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner KPI Comparison Summary */}
      <div className="panel-2015 p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600/30 rounded border border-emerald-500/40 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Algorithmic Optimization Results
              </h2>
              <p className="text-xs text-slate-300">
                Baseline Layout (Unoptimized) vs Optimized Layout (FFD Bin Packing + Demand-Proximity A*)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('split')}
              className={`btn-2015 ${activeTab === 'split' ? 'btn-primary-2015' : 'btn-silver-2015'}`}
            >
              Side-by-Side Split
            </button>
            <button
              onClick={() => setActiveTab('optimized')}
              className={`btn-2015 ${activeTab === 'optimized' ? 'btn-success-2015' : 'btn-silver-2015'}`}
            >
              Optimized Layout Only
            </button>
            <button
              onClick={() => setActiveTab('baseline')}
              className={`btn-2015 ${activeTab === 'baseline' ? 'btn-silver-2015' : 'btn-silver-2015'}`}
            >
              Baseline Layout Only
            </button>
          </div>
        </div>

        {/* 4 Primary Comparative Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Space Utilization */}
          <div className="bg-slate-800/80 border border-slate-700 rounded p-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-sky-400" /> Space Utilization
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                +{imp.utilizationDelta}% pts
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-slate-400 line-through text-sm">
                {base.utilizationPercentage}%
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="text-2xl font-black text-sky-300 font-mono">
                {opt.utilizationPercentage}%
              </div>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full"
                style={{ width: `${opt.utilizationPercentage}%` }}
              />
            </div>
          </div>

          {/* Card 2: Average Retrieval Distance */}
          <div className="bg-slate-800/80 border border-slate-700 rounded p-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" /> Avg Retrieval Distance
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                -{imp.distanceReductionPercent}%
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-slate-400 line-through text-sm">
                {base.averageRetrievalDistance}m
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="text-2xl font-black text-emerald-300 font-mono">
                {opt.averageRetrievalDistance}m
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Saved ~{Math.round(base.averageRetrievalDistance - opt.averageRetrievalDistance)} meters per pick order
            </div>
          </div>

          {/* Card 3: Average Retrieval Time */}
          <div className="bg-slate-800/80 border border-slate-700 rounded p-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Avg Pick Time
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                -{imp.timeReductionPercent}%
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-slate-400 line-through text-sm">
                {base.averageRetrievalTime} min
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="text-2xl font-black text-amber-300 font-mono">
                {opt.averageRetrievalTime} min
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Faster order fulfillment cycle
            </div>
          </div>

          {/* Card 4: Demand Proximity Score */}
          <div className="bg-slate-800/80 border border-slate-700 rounded p-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-rose-400" /> High-Demand Proximity
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                +{opt.demandProximityScore - base.demandProximityScore}%
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-slate-400 line-through text-sm">
                {base.demandProximityScore}%
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="text-2xl font-black text-rose-300 font-mono">
                {opt.demandProximityScore}%
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              High-demand items located close to exit
            </div>
          </div>
        </div>
      </div>

      {/* Visualizers Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(activeTab === 'split' || activeTab === 'baseline') && (
          <div className="h-[520px]">
            <WarehouseVisualizer
              grid={result.baselineLayout.grid}
              dispatchLocation={dispatchLocation}
              placedItems={result.baselineLayout.placedItems}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              title="BASELINE LAYOUT (Unoptimized)"
              subtitle="Random/Sequential item storage without demand consideration"
            />
          </div>
        )}

        {(activeTab === 'split' || activeTab === 'optimized') && (
          <div className="h-[520px]">
            <WarehouseVisualizer
              grid={result.optimizedLayout.grid}
              dispatchLocation={dispatchLocation}
              placedItems={result.optimizedLayout.placedItems}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              title="OPTIMIZED LAYOUT (FFD + A* Demand Placement)"
              subtitle="Optimized storage locations with High-Demand items nearest exit"
            />
          </div>
        )}
      </div>

      {/* Comparative Data Table */}
      <div className="panel-2015">
        <div className="panel-header-2015">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-700" />
            Detailed Optimization Comparison Metrics
          </span>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="table-2015">
            <thead>
              <tr>
                <th>METRIC CATEGORY</th>
                <th>BASELINE LAYOUT</th>
                <th>OPTIMIZED LAYOUT</th>
                <th>DELTA IMPROVEMENT</th>
                <th>OPTIMIZATION IMPACT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">Total Storage Capacity</td>
                <td>{base.totalCapacityVolume.toLocaleString()} Liters</td>
                <td>{opt.totalCapacityVolume.toLocaleString()} Liters</td>
                <td className="font-mono">0 L</td>
                <td className="text-slate-600">Fixed warehouse structure constraint</td>
              </tr>
              <tr>
                <td className="font-bold">Used Storage Capacity</td>
                <td>{base.usedCapacityVolume.toLocaleString()} Liters</td>
                <td>{opt.usedCapacityVolume.toLocaleString()} Liters</td>
                <td className="font-mono text-emerald-700 font-bold">
                  +{(opt.usedCapacityVolume - base.usedCapacityVolume).toFixed(1)} L
                </td>
                <td className="text-emerald-700 font-semibold">Improved packing density</td>
              </tr>
              <tr>
                <td className="font-bold">Space Utilization Rate</td>
                <td>{base.utilizationPercentage}%</td>
                <td className="font-bold text-sky-800">{opt.utilizationPercentage}%</td>
                <td className="font-mono text-emerald-700 font-bold">
                  +{imp.utilizationDelta}% pts
                </td>
                <td className="text-emerald-700 font-semibold">Higher storage efficiency</td>
              </tr>
              <tr>
                <td className="font-bold">Average Retrieval Distance</td>
                <td>{base.averageRetrievalDistance} meters</td>
                <td className="font-bold text-emerald-700">{opt.averageRetrievalDistance} meters</td>
                <td className="font-mono text-emerald-700 font-bold">
                  -{imp.distanceReductionPercent}%
                </td>
                <td className="text-emerald-700 font-semibold">Shorter picker walking distance</td>
              </tr>
              <tr>
                <td className="font-bold">Average Order Pick Time</td>
                <td>{base.averageRetrievalTime} minutes</td>
                <td className="font-bold text-amber-700">{opt.averageRetrievalTime} minutes</td>
                <td className="font-mono text-emerald-700 font-bold">
                  -{imp.timeReductionPercent}%
                </td>
                <td className="text-emerald-700 font-semibold">Faster quick-commerce dispatch</td>
              </tr>
              <tr>
                <td className="font-bold">Objective Cost Score</td>
                <td>{base.optimizationScore}</td>
                <td className="font-bold text-purple-800">{opt.optimizationScore}</td>
                <td className="font-mono text-emerald-700 font-bold">
                  -{imp.scoreImprovementPercent}%
                </td>
                <td className="text-emerald-700 font-semibold">Lower overall operational cost</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

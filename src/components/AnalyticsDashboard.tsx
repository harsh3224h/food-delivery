'use client';

import React from 'react';
import { OptimizationResult } from '../types/warehouse';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Boxes,
  Navigation,
  Clock
} from 'lucide-react';

interface AnalyticsDashboardProps {
  result: OptimizationResult;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ result }) => {
  const base = result.baselineLayout.metrics;
  const opt = result.optimizedLayout.metrics;

  // Chart Data 1: Space Utilization Comparison
  const utilData = [
    { name: 'Baseline Layout', used: base.usedCapacityVolume, unused: base.unusedCapacityVolume },
    { name: 'Optimized Layout', used: opt.usedCapacityVolume, unused: opt.unusedCapacityVolume }
  ];

  // Chart Data 2: Demand Tier Distribution
  const demandTiers = [
    { name: 'High Demand', count: result.optimizedLayout.placedItems.filter(i => i.demandTier === 'High').length, color: '#dc2626' },
    { name: 'Medium Demand', count: result.optimizedLayout.placedItems.filter(i => i.demandTier === 'Medium').length, color: '#d97706' },
    { name: 'Low Demand', count: result.optimizedLayout.placedItems.filter(i => i.demandTier === 'Low').length, color: '#2563eb' }
  ];

  // Chart Data 3: Category Volume Occupancy
  const categoryMap = new Map<string, number>();
  result.optimizedLayout.placedItems.forEach(item => {
    const current = categoryMap.get(item.category) || 0;
    const vol = (item.length * item.width * item.height) / 1000;
    categoryMap.set(item.category, Number((current + vol).toFixed(1)));
  });

  const categoryData = Array.from(categoryMap.entries()).map(([cat, vol]) => ({
    category: cat,
    volume: vol
  })).sort((a, b) => b.volume - a.volume);

  // Chart Data 4: Distance vs Demand Scatter
  const scatterData = result.optimizedLayout.placedItems.map(item => ({
    name: item.name,
    demand: item.demandFrequency,
    distance: item.distanceToDispatch,
    tier: item.demandTier
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="metric-card-2015">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>TOTAL WAREHOUSE CAPACITY</span>
            <Boxes className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {opt.totalCapacityVolume.toLocaleString()} Liters
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {opt.placedItemsCount} items stored in racks
          </div>
        </div>

        <div className="metric-card-2015">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>SPACE UTILIZATION %</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            {opt.utilizationPercentage}%
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            +{result.improvement.utilizationDelta}% pts higher than baseline
          </div>
        </div>

        <div className="metric-card-2015">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>AVG RETRIEVAL DISTANCE</span>
            <Navigation className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono">
            {opt.averageRetrievalDistance} meters
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            -{result.improvement.distanceReductionPercent}% distance saved
          </div>
        </div>

        <div className="metric-card-2015">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>AVG ORDER PICK TIME</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 font-mono">
            {opt.averageRetrievalTime} minutes
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            -{result.improvement.timeReductionPercent}% picking time reduction
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Utilization Comparison */}
        <div className="panel-2015 p-3 flex flex-col h-[320px]">
          <div className="panel-header-2015 mb-2">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-sky-700" />
              Space Capacity Utilization (Baseline vs Optimized)
            </span>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} unit="L" />
                <Tooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()} Liters`, '']} />
                <Legend />
                <Bar dataKey="used" name="Used Storage (L)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unused" name="Unused Capacity (L)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Demand Tier Distribution */}
        <div className="panel-2015 p-3 flex flex-col h-[320px]">
          <div className="panel-header-2015 mb-2">
            <span className="flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-rose-700" />
              Inventory Demand Tier Breakdown
            </span>
          </div>
          <div className="flex-1 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demandTiers}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, value }: any) => `${name}: ${value}`}
                >
                  {demandTiers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Category Storage Volume */}
        <div className="panel-2015 p-3 flex flex-col h-[320px]">
          <div className="panel-header-2015 mb-2">
            <span className="flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-purple-700" />
              Storage Volume Occupancy by Food Category (Liters)
            </span>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#475569" fontSize={11} unit="L" />
                <YAxis dataKey="category" type="category" stroke="#475569" fontSize={10} width={90} />
                <Tooltip formatter={(val: any) => [`${val || 0} Liters`, 'Volume']} />
                <Bar dataKey="volume" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Demand vs Distance Correlation Scatter */}
        <div className="panel-2015 p-3 flex flex-col h-[320px]">
          <div className="panel-header-2015 mb-2">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-700" />
              Item Demand Frequency vs Dispatch Retrieval Distance
            </span>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="demand" name="Demand Freq (orders/mo)" stroke="#475569" fontSize={11} />
                <YAxis dataKey="distance" name="Distance (m)" stroke="#475569" fontSize={11} unit="m" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Placed Items" data={scatterData} fill="#059669" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

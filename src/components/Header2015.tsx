'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Play,
  Upload,
  Download,
  Settings,
  HelpCircle,
  Clock,
  Server,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface Header2015Props {
  warehouseName: string;
  onRunOptimization: () => void;
  onOpenCSVModal: () => void;
  onDownloadSampleCSV: () => void;
  onOpenConfig: () => void;
  onOpenHelpModal: () => void;
  isOptimizing: boolean;
}

export const Header2015: React.FC<Header2015Props> = ({
  warehouseName,
  onRunOptimization,
  onOpenCSVModal,
  onDownloadSampleCSV,
  onOpenConfig,
  onOpenHelpModal,
  isOptimizing
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-enterprise-header text-white select-none">
      {/* Top Utility Bar */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs border-b border-slate-700/60 bg-slate-900/40">
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="blink-dot" />
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-white">SYSTEM READY:</strong> darkstore-cluster-01
          </span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            Latency: <span className="text-sky-300 font-mono">11ms</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Engine: <span className="text-emerald-300 font-mono">FFD + A* Pathfinding v2.4</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span className="font-mono text-slate-400">User: <strong className="text-slate-200">admin_wh04</strong></span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1 font-mono text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            {timeStr || '12:00:00'} UTC
          </span>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gradient-to-b from-sky-500 to-blue-700 p-2 shadow-inner border border-sky-300/40 flex items-center justify-center">
            <Boxes className="w-6 h-6 text-white drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm font-sans">
                FoodLogix WMS
              </h1>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>Warehouse: <strong className="text-white">{warehouseName}</strong></span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Food Delivery Space & Path Optimizer</span>
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onRunOptimization}
            disabled={isOptimizing}
            className="btn-2015 btn-success-2015 text-sm py-1.5 px-3"
            title="Execute FFD Bin Packing & Demand-Based A* Layout Optimization"
          >
            <Play className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            {isOptimizing ? 'Optimizing Layout...' : 'RUN OPTIMIZATION ENGINE'}
          </button>

          <button
            onClick={onOpenCSVModal}
            className="btn-2015 btn-primary-2015"
            title="Upload inventory dataset in CSV format"
          >
            <Upload className="w-3.5 h-3.5" />
            CSV Import
          </button>

          <button
            onClick={onDownloadSampleCSV}
            className="btn-2015 btn-silver-2015"
            title="Download example inventory template CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Sample CSV
          </button>

          <button
            onClick={onOpenConfig}
            className="btn-2015 btn-silver-2015"
            title="Configure warehouse size, obstacles, and optimization weights"
          >
            <Settings className="w-3.5 h-3.5" />
            Warehouse Config
          </button>

          <button
            onClick={onOpenHelpModal}
            className="btn-2015 btn-silver-2015"
            title="View technical documentation & algorithm explanations"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
            Algorithm Specs
          </button>
        </div>
      </div>
    </header>
  );
};

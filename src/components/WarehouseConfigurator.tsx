'use client';

import React, { useState } from 'react';
import { WarehouseConfig, Obstacle } from '../types/warehouse';
import {
  Settings,
  Sliders,
  MapPin,
  Maximize2,
  ShieldAlert,
  Save,
  RotateCcw
} from 'lucide-react';

interface WarehouseConfiguratorProps {
  config: WarehouseConfig;
  onSaveConfig: (updated: WarehouseConfig) => void;
  onResetDefault: () => void;
  onClose: () => void;
}

export const WarehouseConfigurator: React.FC<WarehouseConfiguratorProps> = ({
  config,
  onSaveConfig,
  onResetDefault,
  onClose
}) => {
  const [name, setName] = useState(config.name);
  const [length, setLength] = useState(config.length);
  const [width, setWidth] = useState(config.width);
  const [dispatchX, setDispatchX] = useState(config.dispatchLocation.x);
  const [dispatchY, setDispatchY] = useState(config.dispatchLocation.y);
  const [alpha, setAlpha] = useState(config.weights.alpha);
  const [beta, setBeta] = useState(config.weights.beta);
  const [gamma, setGamma] = useState(config.weights.gamma);
  const [obstacles, setObstacles] = useState<Obstacle[]>(config.obstacles);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      name,
      length: Math.max(10, length),
      width: Math.max(10, width),
      dispatchLocation: {
        x: Math.min(width - 1, Math.max(0, dispatchX)),
        y: Math.min(length - 1, Math.max(0, dispatchY))
      },
      obstacles,
      weights: { alpha, beta, gamma }
    });
    onClose();
  };

  const handleAddObstacle = () => {
    const newObs: Obstacle = {
      id: `OBS-${Date.now().toString().slice(-3)}`,
      name: 'Storage Pillar',
      gridX: Math.floor(width / 2),
      gridY: Math.floor(length / 2),
      width: 2,
      height: 2,
      type: 'Pillar'
    };
    setObstacles([...obstacles, newObs]);
  };

  const handleRemoveObstacle = (id: string) => {
    setObstacles(obstacles.filter(o => o.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="panel-2015 w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="panel-header-2015">
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-700" />
            Warehouse & Optimization Parameter Configuration
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Dimensions & Dispatch */}
          <div className="border border-slate-300 rounded p-3 bg-slate-50 space-y-3">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-300 pb-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-sky-700" />
              Warehouse Footprint & Dispatch Exit Location
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Grid Rows (Length m)</label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={length}
                  onChange={e => setLength(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Grid Cols (Width m)</label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> Dispatch X (Col)
                </label>
                <input
                  type="number"
                  min="0"
                  max={width - 1}
                  value={dispatchX}
                  onChange={e => setDispatchX(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> Dispatch Y (Row)
                </label>
                <input
                  type="number"
                  min="0"
                  max={length - 1}
                  value={dispatchY}
                  onChange={e => setDispatchY(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Objective Function Weights */}
          <div className="border border-slate-300 rounded p-3 bg-slate-50 space-y-3">
            <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-300 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-700" />
                Optimization Cost Weights (Objective Function)
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-normal">
                Cost = α·SpaceWaste + β·AvgDistance + γ·Handling
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  α (Space Waste Weight): <span className="font-mono text-purple-700">{alpha}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={alpha}
                  onChange={e => setAlpha(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  β (Retrieval Dist Weight): <span className="font-mono text-purple-700">{beta}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={beta}
                  onChange={e => setBeta(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  γ (Handling Cost Weight): <span className="font-mono text-purple-700">{gamma}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={gamma}
                  onChange={e => setGamma(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Structural Obstacles */}
          <div className="border border-slate-300 rounded p-3 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                Structural Obstacles & Restricted Zones ({obstacles.length})
              </span>
              <button
                type="button"
                onClick={handleAddObstacle}
                className="btn-2015 btn-silver-2015 text-[11px] py-0.5 px-2"
              >
                + Add Obstacle
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {obstacles.map(obs => (
                <div key={obs.id} className="flex items-center gap-2 bg-white p-1.5 rounded border border-slate-300">
                  <input
                    type="text"
                    value={obs.name}
                    onChange={e => {
                      const updated = obstacles.map(o => o.id === obs.id ? { ...o, name: e.target.value } : o);
                      setObstacles(updated);
                    }}
                    className="flex-1 px-1.5 py-0.5 border border-slate-200 rounded font-semibold"
                  />
                  <span className="text-slate-500 font-mono text-[11px]">At ({obs.gridX},{obs.gridY})</span>
                  <span className="text-slate-500 font-mono text-[11px]">{obs.width}x{obs.height}m</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObstacle(obs.id)}
                    className="text-red-600 hover:text-red-800 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-300">
            <button
              type="button"
              onClick={onResetDefault}
              className="btn-2015 btn-silver-2015"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-2015 btn-silver-2015"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-2015 btn-success-2015"
              >
                <Save className="w-3.5 h-3.5" />
                Apply & Save Config
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Cpu,
  Layers,
  Navigation,
  Calculator,
  X
} from 'lucide-react';

interface AlgorithmExplainModalProps {
  onClose: () => void;
}

export const AlgorithmExplainModal: React.FC<AlgorithmExplainModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'ffd' | 'geometric' | 'astar' | 'cost'>('ffd');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="panel-2015 w-full max-w-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="panel-header-2015">
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-700" />
            FoodLogix WMS - Algorithm Specifications & Theoretical Background
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-300 bg-slate-100 px-4 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('ffd')}
            className={`tab-2015 ${activeTab === 'ffd' ? 'tab-2015-active' : ''}`}
          >
            <Cpu className="w-3.5 h-3.5 inline mr-1" />
            1. First Fit Decreasing (FFD)
          </button>
          <button
            onClick={() => setActiveTab('geometric')}
            className={`tab-2015 ${activeTab === 'geometric' ? 'tab-2015-active' : ''}`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1" />
            2. Demand Geometric Placement
          </button>
          <button
            onClick={() => setActiveTab('astar')}
            className={`tab-2015 ${activeTab === 'astar' ? 'tab-2015-active' : ''}`}
          >
            <Navigation className="w-3.5 h-3.5 inline mr-1" />
            3. A* Shortest Pathfinding
          </button>
          <button
            onClick={() => setActiveTab('cost')}
            className={`tab-2015 ${activeTab === 'cost' ? 'tab-2015-active' : ''}`}
          >
            <Calculator className="w-3.5 h-3.5 inline mr-1" />
            4. Objective Cost Function
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs leading-relaxed space-y-3">
          {activeTab === 'ffd' && (
            <div className="space-y-3 text-slate-800">
              <h3 className="text-sm font-bold text-sky-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-700" />
                First Fit Decreasing (FFD) Bin-Packing Algorithm
              </h3>
              <p>
                The Bin Packing Problem is a classic NP-hard computational geometry and optimization problem. In warehouse management, inventory items of varying dimensions and volumes must be assigned to discrete storage bins/racks while maximizing volume utilization and minimizing unused storage space.
              </p>

              <div className="bg-slate-50 border border-slate-300 rounded p-3 font-mono text-[11px] space-y-1">
                <div className="font-bold text-slate-900">ALGORITHM PROCESS:</div>
                <div>1. Compute unit volume V_i = (Length × Width × Height) for each item i.</div>
                <div>2. Sort all items in DESCENDING order of volume and demand score.</div>
                <div>3. For each sorted item, iterate through available storage bins B_1, B_2, ...</div>
                <div>4. Assign item to the FIRST bin B_j where RemainingCapacity(B_j) ≥ V_i.</div>
                <div>5. Update bin's used volume and record item coordinate positions.</div>
              </div>

              <p className="text-slate-600">
                <strong>Theoretical Performance:</strong> FFD guarantees a tight upper bound of using no more than <code>(11/9) OPT + 6/9</code> bins, dramatically outperforming basic greedy or random item placement algorithms.
              </p>
            </div>
          )}

          {activeTab === 'geometric' && (
            <div className="space-y-3 text-slate-800">
              <h3 className="text-sm font-bold text-sky-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-700" />
                Demand-Aware Geometric Layout Optimization
              </h3>
              <p>
                Physical proximity to the Dispatch/Exit bay is the single most critical factor in food delivery order fulfillment speed. High-demand items (e.g. fresh milk, fast-food snacks, eggs) generate frequent picking trips.
              </p>

              <div className="bg-slate-50 border border-slate-300 rounded p-3 font-mono text-[11px] space-y-1">
                <div className="font-bold text-slate-900">PLACEMENT STRATEGY:</div>
                <div>1. Calculate Demand Score: S_i = (Orders for Item i) / (Total Orders).</div>
                <div>2. Classify items into High (Top 25%), Medium, and Low demand tiers.</div>
                <div>3. Order warehouse storage rack cells by A* shortest path distance to Dispatch.</div>
                <div>4. Prioritize allocating High Demand items to rack slots closest to Dispatch.</div>
                <div>5. Place Low Demand items in distant racks to maximize picking throughput.</div>
              </div>
            </div>
          )}

          {activeTab === 'astar' && (
            <div className="space-y-3 text-slate-800">
              <h3 className="text-sm font-bold text-sky-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-sky-700" />
                A* (A-Star) Shortest Pathfinding Algorithm
              </h3>
              <p>
                A* is an informed search algorithm used to calculate the shortest walkable path for pickers navigating warehouse aisles while avoiding structural pillars, offices, and restricted zones.
              </p>

              <div className="bg-slate-50 border border-slate-300 rounded p-3 font-mono text-[11px] space-y-1">
                <div className="font-bold text-slate-900">EVALUATION FUNCTION:</div>
                <div className="text-emerald-800 font-bold">f(n) = g(n) + h(n)</div>
                <div>• g(n): Exact cost (grid steps) from Dispatch start node to current node n.</div>
                <div>• h(n): Manhattan Distance heuristic: |x_target - x_n| + |y_target - y_n|.</div>
              </div>

              <p className="text-slate-600">
                Unlike Dijkstra's algorithm, A* uses the heuristic function <code>h(n)</code> to direct its search toward the target item, drastically speeding up computation times for real-time 2D warehouse visualizers.
              </p>
            </div>
          )}

          {activeTab === 'cost' && (
            <div className="space-y-3 text-slate-800">
              <h3 className="text-sm font-bold text-sky-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-sky-700" />
                Multi-Objective Optimization Cost Function
              </h3>
              <p>
                The total performance score of a warehouse configuration is evaluated using a weighted objective function that balances space waste against picker travel effort.
              </p>

              <div className="bg-purple-50 border border-purple-200 rounded p-3 font-mono text-[11px] text-purple-950 space-y-1">
                <div className="font-bold text-purple-900">OBJECTIVE FUNCTION FORMULA:</div>
                <div className="text-sm font-bold text-purple-800">
                  Total Cost = α · SpaceWaste + β · AvgRetrievalDistance + γ · HandlingCost
                </div>
                <div className="pt-1 text-[11px]">
                  Where:
                  <br />• α = Space Waste Weight (default 0.4)
                  <br />• β = Retrieval Distance Weight (default 0.4)
                  <br />• γ = Handling Effort Weight (default 0.2)
                </div>
              </div>

              <p className="text-slate-600">
                The layout optimizer minimizes <code>Total Cost</code>, seeking the optimal Pareto frontier between spatial storage density and order retrieval speed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-300 p-3 flex items-center justify-end">
          <button onClick={onClose} className="btn-2015 btn-silver-2015">
            Close Technical Specs
          </button>
        </div>
      </div>
    </div>
  );
};

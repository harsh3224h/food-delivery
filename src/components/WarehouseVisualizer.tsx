'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GridCell,
  Point,
  PlacedItem,
  PathResult
} from '../types/warehouse';
import { findPathAStar } from '../algorithms/pathfinding';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Flame,
  Layers,
  Info
} from 'lucide-react';

interface WarehouseVisualizerProps {
  grid: GridCell[][];
  dispatchLocation: Point;
  placedItems: PlacedItem[];
  selectedItem: PlacedItem | null;
  onSelectItem: (item: PlacedItem | null) => void;
  title?: string;
  subtitle?: string;
}

export const WarehouseVisualizer: React.FC<WarehouseVisualizerProps> = ({
  grid,
  dispatchLocation,
  placedItems,
  selectedItem,
  onSelectItem,
  title = 'Warehouse Layout Visualizer',
  subtitle = 'Interactive 2D Grid with A* Retrieval Pathfinding'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'default' | 'heatmap' | 'category'>('default');
  const [activePath, setActivePath] = useState<PathResult | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ cell: GridCell; item?: PlacedItem } | null>(null);

  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;
  const cellSize = Math.max(18, Math.min(32, Math.floor(650 / Math.max(width, height)))) * zoom;

  // Calculate path when selected item changes
  useEffect(() => {
    if (selectedItem) {
      const pathRes = findPathAStar(grid, dispatchLocation, {
        x: selectedItem.gridX,
        y: selectedItem.gridY
      });
      setActivePath(pathRes);
    } else {
      setActivePath(null);
    }
  }, [selectedItem, grid, dispatchLocation]);

  // Main Canvas Render Function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = width * cellSize;
    const canvasHeight = height * cellSize;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Grid Cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        const px = x * cellSize;
        const py = y * cellSize;

        // Base cell background
        if (cell.type === 'walkable') {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#f8fafc' : '#f1f5f9';
          ctx.fillRect(px, py, cellSize, cellSize);
        } else if (cell.type === 'obstacle') {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(px, py, cellSize, cellSize);
          // Diagonal stripes pattern for obstacle
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + cellSize, py + cellSize);
          ctx.stroke();
        } else if (cell.type === 'dispatch') {
          // Dispatch Exit Zone (Vibrant Amber/Gold)
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(9, Math.floor(cellSize * 0.4))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('EXIT', px + cellSize / 2, py + cellSize / 2);
        } else if (cell.type === 'rack') {
          // Storage Rack cell
          const item = cell.placedItem;

          if (!item) {
            // Empty rack
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = '#cbd5e1';
            ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
          } else {
            // Occupied Rack Cell with item
            if (viewMode === 'heatmap') {
              // Color by demand score gradient
              const score = item.demandScore || 0.1;
              if (score >= 0.65) ctx.fillStyle = '#ef4444';      // High demand (Red)
              else if (score >= 0.25) ctx.fillStyle = '#f59e0b'; // Med demand (Orange)
              else ctx.fillStyle = '#3b82f6';                     // Low demand (Blue)
            } else if (viewMode === 'category') {
              // Color by category
              ctx.fillStyle = getCategoryColor(item.category);
            } else {
              // Default View by Demand Tier
              if (item.demandTier === 'High') ctx.fillStyle = '#dc2626';
              else if (item.demandTier === 'Medium') ctx.fillStyle = '#d97706';
              else ctx.fillStyle = '#2563eb';
            }

            ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

            // Highlight border if selected
            if (selectedItem && selectedItem.id === item.id) {
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 3;
              ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            } else {
              ctx.strokeStyle = 'rgba(0,0,0,0.2)';
              ctx.lineWidth = 1;
              ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            }

            // Draw item short code or initials
            if (cellSize >= 20) {
              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${Math.max(8, Math.floor(cellSize * 0.35))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const initial = item.name.charAt(0).toUpperCase();
              ctx.fillText(initial, px + cellSize / 2, py + cellSize / 2);
            }
          }
        }

        // Draw grid lines
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, cellSize, cellSize);
      }
    }

    // 2. Render Active A* Path (if selected)
    if (activePath && activePath.path.length > 1) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = Math.max(3, Math.floor(cellSize * 0.25));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      activePath.path.forEach((p, idx) => {
        const cx = p.x * cellSize + cellSize / 2;
        const cy = p.y * cellSize + cellSize / 2;
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();

      // Draw path direction dots
      activePath.path.forEach((p, idx) => {
        if (idx > 0 && idx < activePath.path.length - 1) {
          const cx = p.x * cellSize + cellSize / 2;
          const cy = p.y * cellSize + cellSize / 2;
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(2, cellSize * 0.12), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 3. Highlight Dispatch Location
    const dpx = dispatchLocation.x * cellSize;
    const dpy = dispatchLocation.y * cellSize;
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(dpx, dpy, cellSize, cellSize);

  }, [grid, height, width, cellSize, dispatchLocation, selectedItem, activePath, viewMode]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Canvas Click Handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gx = Math.floor(clickX / cellSize);
    const gy = Math.floor(clickY / cellSize);

    if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
      const cell = grid[gy][gx];
      if (cell && cell.placedItem) {
        onSelectItem(cell.placedItem);
      } else {
        onSelectItem(null);
      }
    }
  };

  // Canvas Mouse Move Handler for Hover Tooltip
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gx = Math.floor(clickX / cellSize);
    const gy = Math.floor(clickY / cellSize);

    if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
      const cell = grid[gy][gx];
      setHoveredCell({ cell, item: cell.placedItem });
    } else {
      setHoveredCell(null);
    }
  };

  return (
    <div className="panel-2015 flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="panel-header-2015">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-700" />
          <div>
            <span>{title}</span>
            <span className="text-[11px] font-normal text-slate-600 block leading-tight">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Mode Toggles */}
          <div className="flex items-center bg-slate-200 p-0.5 rounded border border-slate-300 mr-2">
            <button
              onClick={() => setViewMode('default')}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded ${viewMode === 'default' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Demand Tier Color View"
            >
              Default
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded flex items-center gap-1 ${viewMode === 'heatmap' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Demand Density Heatmap View"
            >
              <Flame className="w-3 h-3 text-rose-500" />
              Heatmap
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded ${viewMode === 'category' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Category Color View"
            >
              Category
            </button>
          </div>

          {/* Zoom buttons */}
          <button
            onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
            className="btn-2015 btn-silver-2015 p-1 text-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
            className="btn-2015 btn-silver-2015 p-1 text-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="btn-2015 btn-silver-2015 p-1 text-xs"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 bg-slate-100 p-4 overflow-auto relative flex justify-center items-center">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          className="border border-slate-300 shadow-md rounded bg-white cursor-pointer"
        />

        {/* Hover Tooltip Overlay */}
        {hoveredCell && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-xs p-2.5 rounded shadow-lg border border-slate-700 pointer-events-none max-w-xs z-10">
            <div className="font-bold text-amber-300 flex items-center justify-between gap-2 border-b border-slate-700 pb-1 mb-1">
              <span>Grid ({hoveredCell.cell.x}, {hoveredCell.cell.y})</span>
              <span className="uppercase text-[10px] text-slate-400 font-mono">{hoveredCell.cell.type}</span>
            </div>
            {hoveredCell.item ? (
              <div className="space-y-1">
                <div className="font-semibold text-white">{hoveredCell.item.name}</div>
                <div className="text-slate-300 text-[11px]">Category: {hoveredCell.item.category}</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                  <span>Demand: <strong className="text-rose-400">{hoveredCell.item.demandTier}</strong></span>
                  <span>Dist: <strong className="text-emerald-400">{hoveredCell.item.distanceToDispatch}m</strong></span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic">
                {hoveredCell.cell.type === 'walkable' && 'Walkable Corridor Aisle'}
                {hoveredCell.cell.type === 'dispatch' && 'Dispatch / Order Pickup Exit'}
                {hoveredCell.cell.type === 'obstacle' && 'Structural Obstacle'}
                {hoveredCell.cell.type === 'rack' && 'Empty Rack Slot'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Item Info & Legend Footer */}
      <div className="bg-slate-50 border-t border-slate-300 p-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
        {/* Legend */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-600 inline-block rounded-xs border border-red-700"></span>
            <span>High Demand</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-600 inline-block rounded-xs border border-amber-700"></span>
            <span>Med Demand</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-600 inline-block rounded-xs border border-blue-700"></span>
            <span>Low Demand</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-500 inline-block rounded-xs border border-amber-600"></span>
            <span>Dispatch Exit</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-emerald-500 inline-block rounded-xs border border-emerald-600"></span>
            <span>A* Route</span>
          </span>
        </div>

        {/* Selected Route Info */}
        {selectedItem && activePath ? (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded text-emerald-900 font-mono font-semibold">
            <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Target: {selectedItem.name}</span>
            <span>•</span>
            <span>A* Distance: <strong>{activePath.distance}m</strong></span>
            <span>•</span>
            <span>Est. Pick Time: <strong>{activePath.estimatedTimeSeconds}s</strong></span>
          </div>
        ) : (
          <div className="text-slate-500 flex items-center gap-1 italic">
            <Info className="w-3.5 h-3.5" />
            Click any rack item to view item specs & calculate A* retrieval path
          </div>
        )}
      </div>
    </div>
  );
};

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Fresh Produce': return '#16a34a';
    case 'Frozen & Ice Cream': return '#0284c7';
    case 'Dairy & Refrigerated': return '#0284c7';
    case 'Meat & Seafood': return '#dc2626';
    case 'Bakery & Snacks': return '#d97706';
    case 'Beverages': return '#7c3aed';
    case 'Prepared Meals': return '#ea580c';
    case 'Packaging & Consumables': return '#4b5563';
    default: return '#6b7280';
  }
}

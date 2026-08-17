'use client';

import React, { useState } from 'react';
import { InventoryItem } from '../types/warehouse';
import { parseInventoryCSV } from '../algorithms/datasetGenerator';
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface CSVImporterModalProps {
  onClose: () => void;
  onImportItems: (items: InventoryItem[]) => void;
}

export const CSVImporterModal: React.FC<CSVImporterModalProps> = ({
  onClose,
  onImportItems
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<InventoryItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const csvContent = evt.target?.result as string;
      if (csvContent) {
        setIsProcessing(true);
        const { items, errors: errs } = parseInventoryCSV(csvContent);
        setParsedItems(items);
        setErrors(errs);
        setIsProcessing(false);
      }
    };
    reader.readAsText(selected);
  };

  const handleConfirmImport = () => {
    if (parsedItems.length > 0) {
      onImportItems(parsedItems);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="panel-2015 w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="panel-header-2015">
          <span className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            CSV Inventory Data Importer
          </span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 text-center hover:bg-slate-100/80 transition-colors">
            <Upload className="w-8 h-8 text-sky-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800">
              Select or Drag & Drop Inventory `.csv` file
            </p>
            <p className="text-slate-500 text-[11px] mt-1">
              Supports columns: item_id, item_name, category, quantity, length, width, height, weight, demand_frequency, priority
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="btn-2015 btn-primary-2015 mt-3 inline-flex"
            >
              Browse CSV File
            </label>
            {file && (
              <p className="mt-2 text-xs font-mono text-emerald-700 font-bold">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Validation Warnings / Errors */}
          {errors.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded p-3 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                CSV Parsing Errors / Warnings ({errors.length})
              </div>
              <ul className="list-disc pl-5 font-mono text-[11px] max-h-24 overflow-y-auto">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Parsed Items */}
          {parsedItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between font-bold text-slate-800 mb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully Parsed {parsedItems.length} SKUs
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Total Units: {parsedItems.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>

              <div className="max-h-48 overflow-auto border border-slate-300 rounded">
                <table className="table-2015">
                  <thead>
                    <tr>
                      <th>SKU ID</th>
                      <th>ITEM NAME</th>
                      <th>CATEGORY</th>
                      <th>QTY</th>
                      <th>DIMENSIONS</th>
                      <th>DEMAND FREQ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.slice(0, 10).map((item, idx) => (
                      <tr key={idx}>
                        <td className="font-mono font-bold text-sky-800">{item.id}</td>
                        <td className="font-semibold">{item.name}</td>
                        <td>{item.category}</td>
                        <td className="font-mono text-center">{item.quantity}</td>
                        <td className="font-mono text-slate-600">
                          {item.length}×{item.width}×{item.height} cm
                        </td>
                        <td className="font-mono text-center font-bold">{item.demandFrequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedItems.length > 10 && (
                <p className="text-[11px] text-slate-500 mt-1 italic text-right">
                  + {parsedItems.length - 10} more SKUs ready for import
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 border-t border-slate-300 p-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="btn-2015 btn-silver-2015"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedItems.length === 0 || isProcessing}
            className="btn-2015 btn-success-2015"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Import {parsedItems.length} SKUs to Warehouse
          </button>
        </div>
      </div>
    </div>
  );
};

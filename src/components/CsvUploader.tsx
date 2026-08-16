import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, AlertCircle, Download, CheckCircle2 } from "lucide-react";
import { Order } from "../types/dashboard";

interface CsvUploaderProps {
  onDataParsed: (data: Order[]) => void;
  onReset: () => void;
  hasData: boolean;
}

export default function CsvUploader({ onDataParsed, onReset, hasData }: CsvUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndParse = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file (.csv)");
      setFileName(null);
      setSuccessMsg(null);
      return;
    }

    setError(null);
    setFileName(file.name);
    setSuccessMsg(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        if (rows.length === 0) {
          setError("The CSV file is empty.");
          return;
        }

        // Standardize headers
        const headers = Object.keys(rows[0]).map((h) => h.trim().toLowerCase());
        const requiredFields = [
          "order_id",
          "order_timestamp",
          "restaurant_name",
          "order_value",
          "delivery_time_mins",
          "distance_km",
          "is_on_time",
        ];

        const missingFields = requiredFields.filter((f) => !headers.includes(f));

        if (missingFields.length > 0) {
          setError(`Invalid CSV format. Missing column(s): ${missingFields.join(", ")}`);
          return;
        }

        try {
          const parsedOrders: Order[] = rows.map((row, index) => {
            const getValue = (keyName: string) => {
              const matchedKey = Object.keys(row).find(
                (k) => k.trim().toLowerCase() === keyName.toLowerCase()
              );
              return matchedKey ? row[matchedKey] : "";
            };

            const order_id = getValue("order_id").trim();
            const order_timestamp = getValue("order_timestamp").trim();
            const restaurant_name = getValue("restaurant_name").trim();
            const order_value = parseFloat(getValue("order_value"));
            const delivery_time_mins = parseFloat(getValue("delivery_time_mins"));
            const distance_km = parseFloat(getValue("distance_km"));
            const is_on_time = parseInt(getValue("is_on_time"), 10);

            if (!order_id || !order_timestamp || !restaurant_name) {
              throw new Error(`Row ${index + 1}: Order ID, timestamp, and restaurant name are required.`);
            }

            if (isNaN(order_value) || isNaN(delivery_time_mins) || isNaN(distance_km)) {
              throw new Error(`Row ${index + 1}: Numerical columns contain invalid numbers.`);
            }

            return {
              order_id,
              order_timestamp,
              restaurant_name,
              order_value,
              delivery_time_mins,
              distance_km,
              is_on_time: isNaN(is_on_time) ? (delivery_time_mins <= 30 ? 1 : 0) : is_on_time,
            };
          });

          setSuccessMsg(`Successfully parsed ${parsedOrders.length} orders!`);
          onDataParsed(parsedOrders);
        } catch (err: any) {
          setError(err.message || "Failed to parse CSV rows. Please verify formatting.");
        }
      },
      error: (err) => {
        setError(`CSV Parsing Error: ${err.message}`);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndParse(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndParse(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleResetClick = () => {
    setFileName(null);
    setSuccessMsg(null);
    setError(null);
    onReset();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-1">
      <div
        className={`w-full max-w-2xl border-2 border-dashed rounded-none p-8 flex flex-col items-center justify-center text-center transition-all duration-100 ${
          isDragActive
            ? "border-[#3c8dbc] bg-[#f4f4f4]"
            : "border-[#d2d6de] bg-white hover:border-[#adadad]"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
        />

        <div className="bg-[#f4f4f4] text-[#777] p-3 rounded-none mb-3 border border-[#ddd]">
          <Upload className="h-6 w-6" />
        </div>

        <h4 className="text-sm font-bold text-[#333] uppercase tracking-wide">
          Select or Drag CSV File
        </h4>
        <p className="mt-2 text-xs text-[#555] max-w-md leading-relaxed">
          Please upload a structured delivery analytics dataset (.csv) to build the dashboard.
          You can{" "}
          <button
            type="button"
            onClick={triggerFileInput}
            className="text-[#3c8dbc] hover:underline font-bold"
          >
            browse your files
          </button>{" "}
          or drag the file directly.
        </p>

        {/* Action controls */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/sample.csv"
            download="sample_food_delivery.csv"
            className="btn-2015 btn-default-2015 text-xs inline-flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download Sample CSV
          </a>

          {hasData && (
            <button
              type="button"
              onClick={handleResetClick}
              className="btn-2015 btn-danger-2015 text-xs"
            >
              Clear Current Data
            </button>
          )}
        </div>
      </div>

      {/* Upload Feedback Status */}
      {error && (
        <div className="mt-3 w-full max-w-2xl flex items-start gap-2 bg-[#f2dede] border border-[#ebccd1] rounded-none p-3 text-xs text-[#a94442]">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {successMsg && fileName && (
        <div className="mt-3 w-full max-w-2xl flex items-center gap-2 bg-[#dff0d8] border border-[#d6e9c6] rounded-none p-3 text-xs text-[#3c763d]">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <div>
            <strong>Success:</strong> {fileName} ({successMsg})
          </div>
        </div>
      )}
    </div>
  );
}

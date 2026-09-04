import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { Upload, ArrowRight, ArrowLeft, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

export const InventoryImportWizard: React.FC = () => {
  const { organization, branches } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Column mapping state
  const targetFields = [
    { key: "item_code", label: "Item Code *", required: true },
    { key: "item_name", label: "Item Name *", required: true },
    { key: "item_class", label: "Item Class", required: false },
    { key: "description", label: "Description", required: false },
    { key: "primary_uom", label: "Unit of Measure *", required: true },
    { key: "secondary_uom", label: "Secondary UOM", required: false },
    { key: "secondary_uom_conversion", label: "Secondary UOM Conversion", required: false },
    { key: "part_number", label: "Part Number", required: false },
    { key: "locator", label: "Locator / Shelf", required: false },
    { key: "primary_quantity", label: "On Hand Qty *", required: true },
    { key: "secondary_quantity", label: "Secondary Qty", required: false },
    { key: "unit_price", label: "Item Unit Price *", required: true },
    { key: "inventory_value", label: "Value", required: false },
    { key: "lot_number", label: "Lot Number *", required: true },
    { key: "expiry_date", label: "Expiry Date *", required: true },
    { key: "alternative_available", label: "Alternative Available", required: false },
  ];
  
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Validation state
  const [stats, setStats] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedBranchId) {
      setUploadError("Please select both a branch and a file.");
      return;
    }
    setUploadError(null);
    setUploadLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(
        `/organizations/${organization?.id}/inventory/imports/upload?branch_id=${selectedBranchId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-tdata" },
        }
      );
      setImportId(response.data.import_id);
      setHeaders(response.data.headers);
      
      // Auto mapping matches headers by text similarity
      const initialMap: Record<string, string> = {};
      targetFields.forEach((tf) => {
        const match = response.data.headers.find(
          (h: string) => h.toLowerCase() === tf.label.replace(" *", "").toLowerCase() || h.toLowerCase() === tf.key.toLowerCase()
        );
        if (match) initialMap[tf.key] = match;
      });
      setMappings(initialMap);

      setStep(2);
    } catch (err: any) {
      setUploadError(err.response?.data?.error?.message || "Failed to upload file.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleMappingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMapError(null);
    setMapLoading(true);

    // Validate that all required mappings are present
    const missing = targetFields.filter((tf) => tf.required && !mappings[tf.key]);
    if (missing.length > 0) {
      setMapError(`Please map all required fields: ${missing.map((m) => m.label).join(", ")}`);
      setMapLoading(false);
      return;
    }

    try {
      const response = await api.post(
        `/organizations/${organization?.id}/inventory/imports/${importId}/map`,
        { mapping: mappings }
      );
      setStats(response.data);
      setStep(3);
    } catch (err: any) {
      setMapError(err.response?.data?.error?.message || "Failed to map columns.");
    } finally {
      setMapLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    setConfirmError(null);
    setConfirmLoading(true);
    try {
      await api.post(`/organizations/${organization?.id}/inventory/imports/${importId}/confirm`, {
        mapping: mappings,
      });
      setStep(4);
      pollImportStatus();
    } catch (err: any) {
      setConfirmError(err.response?.data?.error?.message || "Failed to confirm import.");
      setConfirmLoading(false);
    }
  };

  const pollImportStatus = () => {
    const timer = setInterval(async () => {
      try {
        const response = await api.get(`/organizations/${organization?.id}/inventory/imports/${importId}`);
        if (response.data.status === "COMPLETED") {
          clearInterval(timer);
          navigate("/inventory");
        } else if (response.data.status === "FAILED") {
          clearInterval(timer);
          setConfirmError("Import task background job execution failed.");
          setConfirmLoading(false);
        }
      } catch (err) {
        clearInterval(timer);
        setConfirmLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Excel Inventory Import</h1>
        <p className="text-sm text-text-secondary mt-1">Upload and map your spreadsheet catalogs to Invflix master tables.</p>
      </div>

      {/* Stepper indicators */}
      <div className="flex justify-between items-center bg-white border border-border p-4 rounded-xl shadow-sm">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s ? "bg-primary text-white" : "bg-bg-default text-text-secondary"
              }`}
            >
              {s}
            </div>
            <span className={`text-xs font-semibold ${step >= s ? "text-text-primary" : "text-text-muted"}`}>
              {s === 1 ? "Upload file" : s === 2 ? "Map Columns" : s === 3 ? "Validate" : "Confirm Import"}
            </span>
            {s < 4 && <div className="w-12 h-[1px] bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <form onSubmit={handleUpload} className="premium-card p-8 space-y-6">
          {uploadError && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
              {uploadError}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-secondary uppercase">Select Target Branch *</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm focus:outline-none"
              required
            >
              <option value="">-- Choose Branch --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-8 text-center bg-bg-default/30">
            <Upload className="w-10 h-10 text-primary/40 mx-auto mb-4" />
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              id="file-upload"
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer text-sm font-semibold text-primary hover:underline">
              {file ? file.name : "Select an Excel spreadsheet file (.xlsx, .xls)"}
            </label>
            <p className="text-xs text-text-muted mt-1">Maximum file size: 50MB</p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            disabled={uploadLoading}
          >
            {uploadLoading ? "Uploading & parsing..." : "Upload & Preview"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Step 2: Mapping */}
      {step === 2 && (
        <form onSubmit={handleMappingSubmit} className="premium-card p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-1">Map Excel Headers</h3>
            <p className="text-xs text-text-secondary">Map database target fields to the headers parsed from your spreadsheet.</p>
          </div>

          {mapError && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
              {mapError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {targetFields.map((tf) => (
              <div key={tf.key} className="space-y-1">
                <label className="block text-xs font-semibold text-text-secondary">{tf.label}</label>
                <select
                  value={mappings[tf.key] || ""}
                  onChange={(e) => setMappings({ ...mappings, [tf.key]: e.target.value })}
                  className="w-full px-3 py-1.5 border border-border rounded-lg text-xs bg-bg-default"
                >
                  <option value="">-- Do Not Map --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 py-2.5 border border-border text-text-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              disabled={mapLoading}
            >
              {mapLoading ? "Validating data..." : "Map & Validate"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Validate */}
      {step === 3 && (
        <div className="premium-card p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-1">Data Validation Results</h3>
            <p className="text-xs text-text-secondary">Review spreadsheet issues before confirming database imports.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-mint-soft/30 border border-mint-soft rounded-lg">
              <p className="text-xs text-primary font-bold uppercase">Valid Rows</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.valid_rows}</p>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-xs text-warning font-bold uppercase">Warning Rows</p>
              <p className="text-2xl font-bold text-warning mt-1">{stats?.warning_rows}</p>
            </div>
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-xs text-danger font-bold uppercase">Error Rows</p>
              <p className="text-2xl font-bold text-danger mt-1">{stats?.error_rows}</p>
            </div>
          </div>

          {stats?.errors && stats.errors.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto border border-border p-4 rounded-lg bg-bg-default/30">
              <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" /> Errors Log
              </p>
              {stats.errors.map((err: any, idx: number) => (
                <div key={idx} className="text-xs text-text-secondary p-1 border-b border-border">
                  <span className="font-bold text-danger">Row {err.row}:</span> {err.errors.join(", ")}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-mint-soft/20 text-center rounded-lg border border-mint-soft">
              <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-xs font-bold text-primary">All rows successfully validated with no errors.</p>
            </div>
          )}

          {confirmError && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
              {confirmError}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 py-2.5 border border-border text-text-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Remap
            </button>
            <button
              onClick={handleConfirmImport}
              className="flex-1 py-2.5 bg-emerald-accent hover:bg-emerald-accent/90 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              disabled={confirmLoading || stats?.valid_rows === 0}
            >
              {confirmLoading ? "Processing Import..." : "Confirm & Import Catalog"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Loading progress */}
      {step === 4 && (
        <div className="premium-card p-12 text-center space-y-6">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-text-primary">Running import background job...</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Invflix's Celery task is currently upserting items, batches, and branch inventories into PostgreSQL.
          </p>
        </div>
      )}
    </div>
  );
};

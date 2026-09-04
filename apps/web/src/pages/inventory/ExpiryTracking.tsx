import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { AlertOctagon, AlertTriangle, Calendar, Heart } from "lucide-react";

export const ExpiryTracking: React.FC = () => {
  const { organization, selectedBranchId } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchExpiryData = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const params: any = {};
      if (selectedBranchId !== "all") {
        params.branch_id = selectedBranchId;
      }
      
      const summaryRes = await api.get(`/organizations/${organization.id}/inventory/expiry-summary`, { params });
      setSummary(summaryRes.data);

      if (statusFilter) {
        params.expiry_status = statusFilter;
      }
      const listRes = await api.get(`/organizations/${organization.id}/inventory`, { params });
      // Filter list to only show items that are not HEALTHY
      const riskItems = listRes.data.filter((item: any) => item.expiry_status !== "HEALTHY");
      // Sort by urgency: EXPIRED -> EXPIRING_30 -> EXPIRING_60 -> EXPIRING_90
      const statusOrder: Record<string, number> = {
        "EXPIRED": 1,
        "EXPIRING_30_DAYS": 2,
        "EXPIRING_60_DAYS": 3,
        "EXPIRING_90_DAYS": 4,
      };
      riskItems.sort((a: any, b: any) => (statusOrder[a.expiry_status] || 99) - (statusOrder[b.expiry_status] || 99));
      setList(riskItems);
    } catch (err) {
      console.error("Failed to load expiry tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, [organization, selectedBranchId, statusFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Expiry & Risk Tracking</h1>
        <p className="text-sm text-text-secondary mt-1">Monitor shelf-life risks, expired stock values, and batch safety timelines.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          onClick={() => setStatusFilter("EXPIRED")}
          className={`premium-card p-6 cursor-pointer border-l-4 ${
            statusFilter === "EXPIRED" ? "border-l-danger bg-danger/5" : "border-l-transparent"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Expired</p>
              <h3 className="text-2xl font-bold text-danger">{summary?.expired_count || 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("EXPIRING_30_DAYS")}
          className={`premium-card p-6 cursor-pointer border-l-4 ${
            statusFilter === "EXPIRING_30_DAYS" ? "border-l-warning bg-warning/5" : "border-l-transparent"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Expiring &lt; 30 Days</p>
              <h3 className="text-2xl font-bold text-warning">{summary?.expiring_30_count || 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("EXPIRING_60_DAYS")}
          className={`premium-card p-6 cursor-pointer border-l-4 ${
            statusFilter === "EXPIRING_60_DAYS" ? "border-l-warning/70 bg-warning/5" : "border-l-transparent"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Expiring &lt; 60 Days</p>
              <h3 className="text-2xl font-bold text-warning/80">{summary?.expiring_60_count || 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning/5 flex items-center justify-center text-warning/80">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("EXPIRING_90_DAYS")}
          className={`premium-card p-6 cursor-pointer border-l-4 ${
            statusFilter === "EXPIRING_90_DAYS" ? "border-l-info bg-info/5" : "border-l-transparent"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Expiring &lt; 90 Days</p>
              <h3 className="text-2xl font-bold text-info">{summary?.expiring_90_count || 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {statusFilter && (
        <div className="flex justify-between items-center bg-mint-soft/30 p-3 rounded-lg border border-mint-soft">
          <span className="text-xs font-bold text-primary">Active filter: {statusFilter.replace("_", " ")}</span>
          <button
            onClick={() => setStatusFilter("")}
            className="text-xs text-text-secondary hover:text-text-primary font-bold"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Expiry Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="premium-card p-12 text-center max-w-lg mx-auto">
          <Heart className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary font-sans">No immediate expiry risk</h3>
          <p className="text-xs text-text-secondary mt-1">
            All active batches in this branch context have healthy expiration timelines.
          </p>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-default/50 text-text-secondary font-semibold">
                  <th className="p-3.5">Medicine Name</th>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Lot Number</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">Shelf Locator</th>
                  <th className="p-3.5">Stock Quantity</th>
                  <th className="p-3.5">Value at Risk</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.inventory_id} className="border-b border-border hover:bg-bg-default/20 transition-all font-medium">
                    <td className="p-3.5 text-text-primary font-bold">{item.item_name}</td>
                    <td className="p-3.5 text-text-secondary">{item.item_code}</td>
                    <td className="p-3.5 text-text-primary font-mono">{item.lot_number}</td>
                    <td className="p-3.5 text-text-secondary">{item.branch_name}</td>
                    <td className="p-3.5 text-text-secondary">{item.locator || "DEFAULT"}</td>
                    <td className="p-3.5 text-text-primary font-bold">{item.primary_quantity}</td>
                    <td className="p-3.5 text-danger font-semibold">₹{item.inventory_value.toLocaleString()}</td>
                    <td className="p-3.5 text-text-secondary">{item.expiry_date}</td>
                    <td className="p-3.5">
                      {item.expiry_status === "EXPIRED" ? (
                        <span className="px-2 py-0.5 bg-danger/10 text-danger font-bold rounded-full text-[10px]">Expired</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-warning/10 text-warning font-bold rounded-full text-[10px]">
                          {item.expiry_status.replace("_", " ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { Plus, Coins, X } from "lucide-react";

export const Sales: React.FC = () => {
  const { organization, selectedBranchId, branches } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [saleNumber, setSaleNumber] = useState("");
  
  // Item line
  const [selectedInvItem, setSelectedInvItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const params: any = {};
      if (selectedBranchId !== "all") {
        params.branch_id = selectedBranchId;
      }
      const response = await api.get(`/organizations/${organization.id}/sales`, { params });
      setSales(response.data);
    } catch (err) {
      console.error("Failed to load sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryForBranch = async (bId: string) => {
    if (!organization || !bId) return;
    try {
      const response = await api.get(`/organizations/${organization.id}/inventory`, {
        params: { branch_id: bId },
      });
      setInventoryItems(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [organization, selectedBranchId]);

  useEffect(() => {
    if (branchId) {
      loadInventoryForBranch(branchId);
    }
  }, [branchId]);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!branchId || !selectedInvItem || !saleNumber) {
      setError("Please fill out all fields.");
      return;
    }
    
    setSaveLoading(true);
    try {
      await api.post(`/organizations/${organization?.id}/sales`, {
        branch_id: branchId,
        sale_number: saleNumber,
        items: [
          {
            item_id: selectedInvItem.item_id,
            batch_id: selectedInvItem.batch_id,
            quantity: Number(quantity),
            unit_cost: Number(selectedInvItem.unit_price),
            selling_price: Number(sellingPrice),
          },
        ],
      });
      
      setShowModal(false);
      setSaleNumber("");
      setSelectedInvItem(null);
      setQuantity(1);
      setSellingPrice(0);
      fetchSales();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to record sale.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Sales Registers</h1>
          <p className="text-sm text-text-secondary mt-1">Track pharmacy transactions and profit margins.</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setBranchId(branches[0]?.id || "");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Record New Sale
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-white border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="premium-card p-12 text-center max-w-lg mx-auto">
          <Coins className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary">No transactions recorded</h3>
          <p className="text-xs text-text-secondary mt-1">
            Click 'Record New Sale' to add manual transactions for your branches.
          </p>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-default/50 text-text-secondary font-semibold">
                  <th className="p-3.5">Sale Number</th>
                  <th className="p-3.5">Branch Context</th>
                  <th className="p-3.5">Sold Date</th>
                  <th className="p-3.5">Total Cost</th>
                  <th className="p-3.5">Revenue Generated</th>
                  <th className="p-3.5">Gross Profit</th>
                  <th className="p-3.5">Net Margin</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const margin = s.total_revenue > 0 ? ((s.gross_profit / s.total_revenue) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={s.id} className="border-b border-border hover:bg-bg-default/20 transition-all font-medium">
                      <td className="p-3.5 text-text-primary font-bold">{s.sale_number}</td>
                      <td className="p-3.5 text-text-secondary">
                        {branches.find((b) => b.id === s.branch_id)?.name || "Pharmacy Branch"}
                      </td>
                      <td className="p-3.5 text-text-secondary">{new Date(s.sale_date).toLocaleString()}</td>
                      <td className="p-3.5 text-text-secondary">₹{s.total_cost.toLocaleString()}</td>
                      <td className="p-3.5 text-text-primary font-bold">₹{s.total_revenue.toLocaleString()}</td>
                      <td className="p-3.5 text-primary font-extrabold">₹{s.gross_profit.toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-mint-soft text-primary font-bold rounded-full text-[10px]">
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white border border-border rounded-xl shadow-2xl p-8 animate-scale-in text-left">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
              <h3 className="text-lg font-bold text-text-primary">Record Pharmacy Transaction</h3>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Select Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Transaction Invoice No.</label>
                <input
                  type="text"
                  placeholder="e.g. INVOICE-8871"
                  value={saleNumber}
                  onChange={(e) => setSaleNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                  required
                />
              </div>

              {branchId && (
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Select Medicine from Stock</label>
                  <select
                    value={selectedInvItem ? JSON.stringify(selectedInvItem) : ""}
                    onChange={(e) => {
                      const parsed = JSON.parse(e.target.value);
                      setSelectedInvItem(parsed);
                      setSellingPrice(parsed.unit_price * 1.3); // suggest 30% margin
                    }}
                    className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                    required
                  >
                    <option value="">-- Choose Stock Lot --</option>
                    {inventoryItems.map((item) => (
                      <option key={item.inventory_id} value={JSON.stringify(item)}>
                        {item.item_name} (Lot: {item.lot_number} - Avail: {item.primary_quantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedInvItem && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Sale Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedInvItem.primary_quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                disabled={saveLoading || !selectedInvItem}
              >
                {saveLoading ? "Saving transaction..." : "Save Invoice"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

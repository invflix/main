import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { Search, Plus, Filter, Info, X, FileSpreadsheet, Boxes } from "lucide-react";

export const InventoryList: React.FC = () => {
  const { organization, selectedBranchId, role } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const fetchInventory = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const params: any = {};
      if (selectedBranchId !== "all") {
        params.branch_id = selectedBranchId;
      }
      if (search) {
        params.search = search;
      }
      const response = await api.get(`/organizations/${organization.id}/inventory`, { params });
      setInventory(response.data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [organization, selectedBranchId, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EXPIRED":
        return <span className="px-2 py-0.5 bg-danger/10 text-danger font-bold rounded-full text-[10px]">Expired</span>;
      case "EXPIRING_30_DAYS":
        return <span className="px-2 py-0.5 bg-warning/10 text-warning font-bold rounded-full text-[10px]">Expiring &lt; 30 Days</span>;
      case "EXPIRING_60_DAYS":
        return <span className="px-2 py-0.5 bg-warning/10 text-warning/80 font-bold rounded-full text-[10px]">Expiring &lt; 60 Days</span>;
      case "EXPIRING_90_DAYS":
        return <span className="px-2 py-0.5 bg-info/10 text-info font-bold rounded-full text-[10px]">Expiring &lt; 90 Days</span>;
      default:
        return <span className="px-2 py-0.5 bg-mint-soft text-primary font-bold rounded-full text-[10px]">Healthy</span>;
    }
  };

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Pharmacy Inventory</h1>
          <p className="text-sm text-text-secondary mt-1">Manage medicine catalog and lot-level batch tracking.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/inventory/import"
            className="flex items-center gap-2 px-4 py-2 border border-border bg-white text-text-primary hover:bg-bg-default rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-text-secondary" /> Import Excel
          </Link>
          {role === "OWNER" && (
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Add Manual Item
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4 bg-white border border-border rounded-xl p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by medicine name, code, or lot number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border bg-bg-default rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-semibold rounded-lg hover:bg-bg-default">
          <Filter className="w-3.5 h-3.5" /> More Filters
        </button>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-white border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="premium-card p-12 text-center max-w-lg mx-auto mt-12 space-y-4">
          <Boxes className="w-12 h-12 text-primary/30 mx-auto" />
          <h3 className="text-lg font-bold text-text-primary">Your inventory is empty</h3>
          <p className="text-sm text-text-secondary">
            Upload your pharmacy spreadsheets using the Excel import wizard or add items manually to start tracking stock.
          </p>
          <Link
            to="/inventory/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Inventory
          </Link>
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
                  <th className="p-3.5">Locator</th>
                  <th className="p-3.5">Qty on Hand</th>
                  <th className="p-3.5">UOM</th>
                  <th className="p-3.5">Unit Price</th>
                  <th className="p-3.5">Inventory Value</th>
                  <th className="p-3.5">Expiry</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item: any) => (
                  <tr
                    key={item.inventory_id}
                    className="border-b border-border hover:bg-bg-default/20 transition-all font-medium cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="p-3.5 text-text-primary font-bold">{item.item_name}</td>
                    <td className="p-3.5 text-text-secondary">{item.item_code}</td>
                    <td className="p-3.5 text-text-primary font-mono">{item.lot_number}</td>
                    <td className="p-3.5 text-text-secondary">{item.branch_name}</td>
                    <td className="p-3.5 text-text-secondary">{item.locator || "N/A"}</td>
                    <td className="p-3.5 text-text-primary font-bold">{item.primary_quantity}</td>
                    <td className="p-3.5 text-text-secondary">{item.primary_uom}</td>
                    <td className="p-3.5">₹{item.unit_price}</td>
                    <td className="p-3.5 text-primary font-semibold">₹{item.inventory_value.toLocaleString()}</td>
                    <td className="p-3.5 text-text-secondary">{item.expiry_date}</td>
                    <td className="p-3.5">{getStatusBadge(item.expiry_status)}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="text-primary hover:bg-mint-soft p-1 rounded-md transition-all"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Right Side Drawer Quick View */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-8 border-l border-border animate-slide-in">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-6 border-b border-border mb-6">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{selectedItem.item_name}</h3>
                  <span className="text-xs text-text-secondary font-mono">Code: {selectedItem.item_code}</span>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-lg hover:bg-bg-default text-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details List */}
              <div className="space-y-4 text-xs font-semibold text-text-secondary">
                {selectedItem.description && (
                  <div className="p-3 bg-bg-default rounded-lg mb-4 text-left">
                    <p className="text-[10px] text-text-muted uppercase mb-1 font-bold">Description</p>
                    <p className="text-text-primary">{selectedItem.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Item Class</p>
                    <p className="text-text-primary mt-0.5">{selectedItem.item_class || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Part Number</p>
                    <p className="text-text-primary mt-0.5 font-mono">{selectedItem.part_number || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left border-t border-border pt-4">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Primary UOM</p>
                    <p className="text-text-primary mt-0.5">{selectedItem.primary_uom}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Secondary UOM / Conv.</p>
                    <p className="text-text-primary mt-0.5">
                      {selectedItem.secondary_uom ? `${selectedItem.secondary_uom} (1:${selectedItem.secondary_uom_conversion})` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left border-t border-border pt-4">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Stock Quantity</p>
                    <p className="text-2xl font-bold text-text-primary mt-0.5">{selectedItem.primary_quantity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Locator / Shelf</p>
                    <p className="text-text-primary mt-1">{selectedItem.locator || "DEFAULT"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left border-t border-border pt-4">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Lot Number</p>
                    <p className="text-text-primary mt-0.5 font-mono font-bold text-sm">{selectedItem.lot_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Expiration Date</p>
                    <p className="text-text-primary mt-0.5">{selectedItem.expiry_date || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left border-t border-border pt-4">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Branch</p>
                    <p className="text-text-primary mt-0.5">{selectedItem.branch_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Inventory Value</p>
                    <p className="text-text-primary mt-0.5 font-bold text-primary">₹{selectedItem.inventory_value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex gap-3 text-sm">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2 border border-border rounded-lg text-text-primary font-semibold hover:bg-bg-default"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

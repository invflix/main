import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { GitBranch, MapPin, Plus, X } from "lucide-react";

export const Branches: React.FC = () => {
  const { organization, role, reloadMe, branches: contextBranches } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const response = await api.get(`/organizations/${organization.id}/branches`);
      setBranches(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [organization, contextBranches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveLoading(true);
    try {
      await api.post(`/organizations/${organization?.id}/branches`, {
        name,
        branch_code: code,
        address,
        city,
        state,
        phone,
        is_active: true,
      });
      setShowModal(false);
      setName("");
      setCode("");
      setAddress("");
      setCity("");
      setState("");
      setPhone("");
      await reloadMe();
      fetchBranches();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to create branch.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Pharmacy Branches</h1>
          <p className="text-sm text-text-secondary mt-1">Manage locations, branch codes, and staff access boundaries.</p>
        </div>
        {role === "OWNER" && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Branch
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-white border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="premium-card p-12 text-center max-w-lg mx-auto">
          <GitBranch className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary">No branches registered</h3>
          <p className="text-xs text-text-secondary mt-1">
            Click 'Add Branch' to set up pharmacy locations for your organization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div key={b.id} className="premium-card p-6 flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-text-primary text-base">{b.name}</h3>
                  <span className="px-2 py-0.5 bg-mint-soft text-primary font-bold rounded-md text-[9px] uppercase tracking-wider">
                    {b.branch_code}
                  </span>
                </div>
                
                <p className="text-xs text-text-secondary flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-secondary mt-0.5 shrink-0" />
                  <span>
                    {b.address ? `${b.address}, ` : ""}
                    {b.city}
                    {b.state ? `, ${b.state}` : ""}
                  </span>
                </p>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center text-xs">
                <span className="text-text-secondary font-medium">Status:</span>
                <span className={`font-bold ${b.is_active ? "text-primary" : "text-text-muted"}`}>
                  {b.is_active ? "Operational" : "Deactivated"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white border border-border rounded-xl shadow-2xl p-8 animate-scale-in text-left">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
              <h3 className="text-lg font-bold text-text-primary">Add Pharmacy Branch</h3>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Noida - Sector 18"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Branch Code</label>
                  <input
                    type="text"
                    placeholder="NOI01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 120 987..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="P-Block, Sector 18"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Noida"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Uttar Pradesh"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                disabled={saveLoading}
              >
                {saveLoading ? "Creating..." : "Save Location"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

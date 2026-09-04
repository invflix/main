import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { ArrowLeft, Clock, Save } from "lucide-react";

export const ClaimDetails: React.FC = () => {
  const { organization } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newStatus, setNewStatus] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchClaimDetails = async () => {
    if (!organization || !id) return;
    try {
      setLoading(true);
      const claimRes = await api.get(`/organizations/${organization.id}/claims/${id}`);
      setClaim(claimRes.data);
      setNewStatus(claimRes.data.status);

      const histRes = await api.get(`/organizations/${organization.id}/claims/${id}/history`);
      setHistory(histRes.data);
    } catch (err) {
      console.error("Failed to load claim details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimDetails();
  }, [organization, id]);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !id) return;
    setSaveLoading(true);
    try {
      const response = await api.put(`/organizations/${organization.id}/claims/${id}`, {
        status: newStatus,
      });
      setClaim(response.data);
      // Reload history
      const histRes = await api.get(`/organizations/${organization.id}/claims/${id}/history`);
      setHistory(histRes.data);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-border animate-pulse rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-80 bg-white border border-border rounded-xl animate-pulse" />
          <div className="h-80 bg-white border border-border rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center p-12">
        <p className="text-sm font-semibold text-text-secondary">Claim details not found.</p>
        <Link to="/claims" className="text-primary hover:underline text-xs mt-2 block">
          Back to claims list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/claims" className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Claims
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Claim: {claim.claim_number}</h1>
          <p className="text-xs text-text-secondary mt-1">Patient: {claim.patient_name} • Payout Provider: {claim.insurance_provider}</p>
        </div>
        <div className="px-3 py-1 bg-mint-soft text-primary font-bold rounded-lg text-xs">
          Current: {claim.status.replace("_", " ")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border pb-3">Claim Information</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-text-secondary">
              <div>
                <p className="text-[10px] text-text-muted uppercase">Patient Name</p>
                <p className="text-text-primary text-sm mt-0.5">{claim.patient_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase">Insurance Provider</p>
                <p className="text-text-primary text-sm mt-0.5">{claim.insurance_provider}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-text-muted uppercase">Claim Payout Amount</p>
                <p className="text-text-primary text-sm mt-0.5 font-bold text-primary">₹{claim.claim_amount.toLocaleString()}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-text-muted uppercase">Submitted Date</p>
                <p className="text-text-primary text-sm mt-0.5">
                  {claim.submitted_at ? new Date(claim.submitted_at).toLocaleString() : "Not Submitted Yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Update Status form */}
          <form onSubmit={handleStatusChange} className="premium-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border pb-3">Update Pipeline Status</h3>
            <div className="flex gap-4 items-center">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-xs bg-bg-default"
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PAID">Paid</option>
              </select>
              <button
                type="submit"
                className="py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                disabled={saveLoading}
              >
                <Save className="w-3.5 h-3.5" /> {saveLoading ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        </div>

        {/* Timeline History */}
        <div className="premium-card p-6">
          <h3 className="text-sm font-bold text-text-primary border-b border-border pb-3 mb-6">Status Change History</h3>
          <div className="relative border-l-2 border-border pl-6 space-y-6">
            {history.map((h) => (
              <div key={h.id} className="relative">
                {/* indicator dot */}
                <div className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                <div className="text-xs font-medium text-text-secondary">
                  <p className="text-[10px] text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(h.created_at).toLocaleString()}
                  </p>
                  <p className="text-text-primary mt-1">
                    Status changed from <span className="font-semibold">{h.old_status}</span> to{" "}
                    <span className="font-semibold text-primary">{h.new_status}</span>
                  </p>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-xs text-text-secondary font-medium">No history transitions recorded.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

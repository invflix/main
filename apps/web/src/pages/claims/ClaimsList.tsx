import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { Plus, ShieldCheck, ChevronRight } from "lucide-react";

export const ClaimsList: React.FC = () => {
  const { organization, selectedBranchId } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  const tabs = [
    { key: "ALL", label: "All Claims" },
    { key: "DRAFT", label: "Draft" },
    { key: "SUBMITTED", label: "Submitted" },
    { key: "UNDER_REVIEW", label: "Under Review" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
    { key: "PAID", label: "Paid" },
  ];

  const fetchClaims = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const params: any = {};
      if (selectedBranchId !== "all") {
        params.branch_id = selectedBranchId;
      }
      if (activeTab !== "ALL") {
        params.status = activeTab;
      }
      const response = await api.get(`/organizations/${organization.id}/claims`, { params });
      setClaims(response.data);
    } catch (err) {
      console.error("Failed to load claims list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [organization, selectedBranchId, activeTab]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "PAID":
        return "bg-mint-soft text-primary";
      case "REJECTED":
        return "bg-danger/10 text-danger";
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "bg-info/10 text-info";
      default:
        return "bg-bg-default text-text-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Insurance Claims</h1>
          <p className="text-sm text-text-secondary mt-1">Track pharmacy insurance payouts, claim status, and approvals.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Create Claim
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === t.key
                ? "border-primary text-primary font-bold"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Claims List Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="premium-card p-12 text-center max-w-lg mx-auto">
          <ShieldCheck className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary">No claims found</h3>
          <p className="text-xs text-text-secondary mt-1">
            There are no insurance claims recorded matching this status filter.
          </p>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-default/50 text-text-secondary font-semibold">
                  <th className="p-3.5">Claim Number</th>
                  <th className="p-3.5">Patient Name</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Claim Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created At</th>
                  <th className="p-3.5 text-center">View</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-bg-default/20 transition-all font-medium">
                    <td className="p-3.5 text-text-primary font-bold">{c.claim_number}</td>
                    <td className="p-3.5 text-text-primary">{c.patient_name}</td>
                    <td className="p-3.5 text-text-secondary">{c.insurance_provider}</td>
                    <td className="p-3.5 text-primary font-bold">₹{c.claim_amount.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(c.status)}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3.5 text-text-secondary">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-3.5 text-center">
                      <Link
                        to={`/claims/${c.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { Check, ArrowRight, UserPlus } from "lucide-react";

export const OnboardingWizard: React.FC = () => {
  const { organization, reloadMe } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 2: First Branch
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [city, setCity] = useState("");
  const [branchError, setBranchError] = useState<string | null>(null);
  const [createdBranch, setCreatedBranch] = useState<any>(null);

  // Step 3: Invite Team
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("PHARMACIST");
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchError(null);
    try {
      const response = await api.post(`/organizations/${organization?.id}/branches`, {
        name: branchName,
        branch_code: branchCode,
        city: city,
        is_active: true,
      });
      setCreatedBranch(response.data);
      await reloadMe(); // refresh context
      setStep(3);
    } catch (err: any) {
      setBranchError(err.response?.data?.error?.message || "Failed to create branch.");
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    if (!createdBranch) {
      setInviteError("Please create a branch first.");
      return;
    }
    try {
      await api.post(`/organizations/${organization?.id}/team/invite`, {
        email,
        role,
        branch_ids: [createdBranch.id],
      });
      setInvites([...invites, { email, role }]);
      setEmail("");
    } catch (err: any) {
      setInviteError(err.response?.data?.error?.message || "Failed to send invitation.");
    }
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-bg-default flex flex-col justify-between py-12 px-6">
      <div className="max-w-xl w-full mx-auto bg-white border border-border rounded-2xl shadow-sm p-8">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? "bg-primary text-white" : "bg-mint-soft text-primary"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs font-semibold ${step >= s ? "text-text-primary" : "text-text-muted"}`}>
                {s === 1 ? "Organization" : s === 2 ? "First Branch" : "Invite Team"}
              </span>
              {s < 3 && <div className="w-8 h-[1px] bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Org Details */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-2 font-display">Welcome to Invflix!</h3>
            <p className="text-sm text-text-secondary mb-6">
              Your organization **{organization?.name}** is registered. Let's configure your operations workspace.</p>
            
            <div className="p-4 bg-mint-soft/30 border border-mint-soft rounded-lg mb-6">
              <p className="text-xs text-primary font-bold uppercase mb-1">Company Account</p>
              <p className="text-sm font-semibold text-text-primary">{organization?.name}</p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            >
              Continue to First Branch <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: First Branch */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Setup your first branch</h3>
            <p className="text-sm text-text-secondary mb-6">
              Add your main pharmacy location to start tracking stock.
            </p>

            {branchError && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
                {branchError}
              </div>
            )}

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Delhi – Connaught Place"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. DEL01"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              >
                Create Branch <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Invite Team */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Build your pharmacy team</h3>
            <p className="text-sm text-text-secondary mb-6">
              Invite your staff, pharmacists, and managers to coordinate operations.
            </p>

            {inviteError && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@medicare.com"
                  className="col-span-2 px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="STAFF">Staff</option>
                  <option value="CASHIER">Cashier</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5" /> Send Invitation
              </button>
            </form>

            {invites.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-text-secondary uppercase mb-2">Pending Invites</p>
                <div className="space-y-2">
                  {invites.map((inv, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-bg-default border border-border rounded-lg text-xs font-medium">
                      <span>{inv.email}</span>
                      <span className="text-primary font-semibold">{inv.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleFinish}
              className="w-full py-2.5 bg-emerald-accent hover:bg-emerald-accent/90 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

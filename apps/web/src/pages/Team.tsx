import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { Plus, Users, X, Send } from "lucide-react";

export const Team: React.FC = () => {
  const { organization, role, branches } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [memberRole, setMemberRole] = useState("PHARMACIST");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const response = await api.get(`/organizations/${organization.id}/team`);
      setTeam(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [organization]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInviteLoading(true);
    try {
      await api.post(`/organizations/${organization?.id}/team/invite`, {
        email,
        role: memberRole,
        branch_ids: selectedBranchIds,
      });
      setShowModal(false);
      setEmail("");
      setMemberRole("PHARMACIST");
      setSelectedBranchIds([]);
      fetchTeam();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to send invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleBranchCheckboxChange = (bId: string) => {
    if (selectedBranchIds.includes(bId)) {
      setSelectedBranchIds(selectedBranchIds.filter((id) => id !== bId));
    } else {
      setSelectedBranchIds([...selectedBranchIds, bId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Pharmacy Team</h1>
          <p className="text-sm text-text-secondary mt-1">Manage team members, roles, and branch accessibility permissions.</p>
        </div>
        {role === "OWNER" && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Invite Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-white border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : team.length === 0 ? (
        <div className="premium-card p-12 text-center max-w-lg mx-auto">
          <Users className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary">Build your pharmacy team</h3>
          <p className="text-xs text-text-secondary mt-1">
            Click 'Invite Member' to add staff, pharmacists, or cashiers to your pharmacy workspace.
          </p>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-default/50 text-text-secondary font-semibold">
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Branch Access</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.user_id} className="border-b border-border hover:bg-bg-default/20 transition-all font-medium">
                    <td className="p-3.5 text-text-primary font-bold">{member.full_name}</td>
                    <td className="p-3.5 text-text-secondary">{member.email}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-mint-soft text-primary font-bold rounded-md text-[10px]">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-text-secondary">
                      {member.role === "OWNER" ? (
                        <span className="italic text-text-muted">All Branches</span>
                      ) : (
                        member.branch_ids
                          .map((bid: string) => branches.find((b) => b.id === bid)?.name || "Branch")
                          .join(", ") || <span className="italic text-danger">No access assigned</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.status === "ACTIVE" ? "bg-mint-soft text-primary" : "bg-text-muted/10 text-text-secondary"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white border border-border rounded-xl shadow-2xl p-8 animate-scale-in text-left">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
              <h3 className="text-lg font-bold text-text-primary">Invite Team Member</h3>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="pharmacist@medicare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Assigned Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-bg-default rounded-lg text-sm"
                  required
                >
                  <option value="MANAGER">Manager</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="STAFF">Staff</option>
                  <option value="CASHIER">Cashier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">Branch Permissions</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-border p-3 rounded-lg bg-bg-default">
                  {branches.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 text-xs text-text-secondary font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBranchIds.includes(b.id)}
                        onChange={() => handleBranchCheckboxChange(b.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                disabled={inviteLoading}
              >
                <Send className="w-4 h-4" /> {inviteLoading ? "Sending..." : "Send Secure Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

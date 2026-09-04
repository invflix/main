import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";

export const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        setError("Missing invitation token link.");
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(`/invitations/${token}`);
        setInviteDetails(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || "Invitation is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchInviteDetails();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitLoading(true);

    try {
      // 1. Accept
      await api.post(`/invitations/${token}/accept`, {
        password,
        full_name: fullName,
      });

      // 2. Perform automatic login to fetch session tokens
      const loginRes = await api.post("/auth/login", {
        email: inviteDetails.email,
        password,
      });
      await login(loginRes.data);

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to accept invitation.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-default flex items-center justify-center">
        <p className="text-sm font-semibold text-text-secondary">Verifying invitation token...</p>
      </div>
    );
  }

  if (error && !inviteDetails) {
    return (
      <div className="min-h-screen bg-bg-default flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-border rounded-xl p-8 text-center">
          <h3 className="text-lg font-bold text-danger">Invitation Error</h3>
          <p className="text-xs text-text-secondary mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-default flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
          M
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Accept Invitation</h2>
        <p className="text-sm text-text-secondary mb-6">
          Join **{inviteDetails.organization_name}** as a **{inviteDetails.role}**
        </p>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Email Address</label>
            <input
              type="email"
              value={inviteDetails.email}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default text-text-muted"
              disabled
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Priya Nair"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Create Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
            disabled={submitLoading}
          >
            {submitLoading ? "Accepting..." : "Accept & Join Group"}
          </button>
        </form>
      </div>
    </div>
  );
};

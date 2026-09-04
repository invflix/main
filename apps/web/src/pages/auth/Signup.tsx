import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";

export const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/signup", {
        email,
        password,
        full_name: fullName,
        organization_name: orgName,
      });
      await login(response.data);
      // Go to onboarding page
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-default flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
          M
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Create your pharmacy group</h2>
        <p className="text-sm text-text-secondary mb-6">Start tracking your multi-tenant operations</p>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Pharmacy Group Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Medicare Pharmacy Group"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amit Sharma"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. owner@medicare.com"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-default focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Password</label>
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
            disabled={loading}
          >
            {loading ? "Creating Group..." : "Get Started"}
          </button>
        </form>

        <p className="mt-6 text-xs text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

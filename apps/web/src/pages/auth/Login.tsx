import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";

const demoUsers = ["hashim@invflix.com", "shahrukh@invflix.com", "abhyudaya@chaibytes.in"];

const InvflixLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F7] p-2 shadow-sm ring-1 ring-slate-200">
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
        <rect x="3" y="13" width="2.5" height="7" rx="1.25" fill="#1E3949" />
        <rect x="7" y="9" width="2.5" height="11" rx="1.25" fill="#29495C" />
        <rect x="11" y="4" width="2.5" height="16" rx="1.25" fill="#69A6AD" />
        <path d="M15 6.5 L21 12 L15 17.5 Z" fill="#9CC7CB" />
      </svg>
    </div>
    <span className="font-display text-3xl font-bold tracking-tight text-slate-950">Invflix</span>
  </div>
);

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      await login(response.data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] font-sans text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#FAF8F7] px-12 py-10 lg:flex lg:flex-col lg:justify-between">
          <InvflixLogo />

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-primary">Pharmacy operations</p>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-slate-950">
              Inventory, claims, and sales in one calm workspace.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Track pharmacy stock across branches, monitor expiry risk, and keep the team moving from a single dashboard.
            </p>
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-3">
            {[
              ["60+", "Demo stock lines"],
              ["3", "Branch locations"],
              ["24/7", "Operational view"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white/70 p-4 shadow-sm">
                <p className="font-display text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <main className="flex items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <InvflixLogo className="mb-8 justify-center lg:hidden" />

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">Welcome back</h2>
                <p className="mt-1 text-sm text-slate-500">Sign in to your Invflix account</p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-danger/20 bg-danger/10 p-3 text-left text-xs font-semibold text-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pl-9 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pl-9 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-bold uppercase text-slate-500">Demo users</p>
                <div className="space-y-2">
                  {demoUsers.map((demoEmail) => (
                    <button
                      key={demoEmail}
                      type="button"
                      onClick={() => {
                        setEmail(demoEmail);
                        setPassword("password123");
                      }}
                      className="block w-full truncate rounded-md bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:text-primary hover:ring-primary/30"
                    >
                      {demoEmail}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-slate-500">
                Don't have an account?{" "}
                <Link to="/signup" className="font-bold text-primary hover:underline">
                  Register your pharmacy
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { ShieldCheck, ArrowLeft, Eye, Server, Users, GitBranch } from "lucide-react";

export const SuperAdminDashboard: React.FC = () => {
  const { setImpersonatedOrg } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ORGS");

  const fetchSuperData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get("/super-admin/stats");
      setStats(statsRes.data);

      const orgsRes = await api.get("/super-admin/organizations");
      setOrganizations(orgsRes.data);

      const logsRes = await api.get("/super-admin/audit-logs");
      setAuditLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperData();
  }, []);

  const handleImpersonate = (org: any) => {
    setImpersonatedOrg({ id: org.id, name: org.name });
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-border animate-pulse rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-warning" /> Platform Super Admin
          </h1>
          <p className="text-sm text-text-secondary mt-1">Global system metrics, tenancy context access, and audit trails.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-semibold rounded-lg hover:bg-bg-default bg-white"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Super Admin Dashboard
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-text-secondary uppercase">Total Organizations</p>
            <h3 className="text-3xl font-bold text-text-primary">{stats?.total_organizations}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-text-secondary uppercase">Total Branches</p>
            <h3 className="text-3xl font-bold text-text-primary">{stats?.total_branches}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
            <GitBranch className="w-5 h-5" />
          </div>
        </div>

        <div className="premium-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-text-secondary uppercase">Active Users</p>
            <h3 className="text-3xl font-bold text-text-primary">{stats?.total_users}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-mint-soft flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab("ORGS")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "ORGS" ? "border-primary text-primary font-bold" : "border-transparent text-text-secondary"
          }`}
        >
          Organizations List
        </button>
        <button
          onClick={() => setActiveTab("LOGS")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "LOGS" ? "border-primary text-primary font-bold" : "border-transparent text-text-secondary"
          }`}
        >
          Platform Audit Logs
        </button>
        <button
          onClick={() => setActiveTab("FAILURES")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "FAILURES" ? "border-primary text-primary font-bold" : "border-transparent text-text-secondary"
          }`}
        >
          Import Failures ({stats?.import_failures?.length || 0})
        </button>
      </div>

      {/* Tab: ORGS */}
      {activeTab === "ORGS" && (
        <div className="premium-card overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-default/50 text-text-secondary font-semibold">
                <th className="p-3.5">Organization Name</th>
                <th className="p-3.5">Business Email</th>
                <th className="p-3.5">Branches Count</th>
                <th className="p-3.5">Users Count</th>
                <th className="p-3.5">Registered Date</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="border-b border-border hover:bg-bg-default/20 transition-all font-medium">
                  <td className="p-3.5 text-text-primary font-bold">{org.name}</td>
                  <td className="p-3.5 text-text-secondary">{org.business_email || "N/A"}</td>
                  <td className="p-3.5 text-text-secondary font-bold">{org.branch_count}</td>
                  <td className="p-3.5 text-text-secondary font-bold">{org.user_count}</td>
                  <td className="p-3.5 text-text-secondary">{new Date(org.created_at).toLocaleDateString()}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleImpersonate(org)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-warning text-white rounded-md text-[10px] font-bold hover:bg-warning/90 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Organization
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: AUDIT LOGS */}
      {activeTab === "LOGS" && (
        <div className="premium-card overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-default/50 text-text-secondary font-semibold">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Entity Type</th>
                <th className="p-3.5">Metadata Log</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-bg-default/20 transition-all font-medium">
                  <td className="p-3.5 text-text-secondary">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-3.5 text-text-primary font-bold">{log.actor_email}</td>
                  <td className="p-3.5 text-primary font-semibold">{log.action}</td>
                  <td className="p-3.5 text-text-secondary">{log.entity_type}</td>
                  <td className="p-3.5 text-text-secondary font-mono text-[10px] truncate max-w-xs" title={JSON.stringify(log.metadata)}>
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: FAILURES */}
      {activeTab === "FAILURES" && (
        <div className="premium-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary">Recent Excel Import Failures</h3>
          {stats?.import_failures?.length === 0 ? (
            <p className="text-xs text-text-secondary font-medium text-center py-6">No spreadsheet import failures recorded.</p>
          ) : (
            <div className="space-y-3">
              {stats?.import_failures.map((f: any) => (
                <div key={f.id} className="p-4 border border-danger/20 bg-danger/5 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-danger">Organization: {f.organization_name}</p>
                    <p className="text-text-secondary mt-1">File Name: {f.file_name}</p>
                  </div>
                  <span className="text-text-secondary">{new Date(f.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

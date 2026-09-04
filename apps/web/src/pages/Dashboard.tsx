import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { DollarSign, FileText, AlertTriangle, ArrowUpRight, Boxes, Activity, Building2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

interface KPICardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  footline: React.ReactNode;
  variant?: "default" | "urgent";
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  footline,
  variant = "default",
}) => {
  const isUrgent = variant === "urgent";
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${
      isUrgent 
        ? "border-amber-200 bg-gradient-to-b from-amber-50/50 to-background" 
        : ""
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground mt-1">{value}</h3>
            <div className="text-xs mt-3">{footline}</div>
          </div>
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { organization, selectedBranchId } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!organization) return;
      try {
        setLoading(true);
        const params: any = {};
        if (selectedBranchId !== "all") {
          params.branch_id = selectedBranchId;
        }
        const response = await api.get(`/organizations/${organization.id}/analytics/dashboard`, { params });
        setAnalytics(response.data);
      } catch (err) {
        console.error("Failed to load dashboard analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [organization, selectedBranchId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card border rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-80 bg-card border rounded-lg animate-pulse" />
          <div className="h-80 bg-card border rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const { revenue, inventory, claims, expiry, branch_performance } = analytics || {
    revenue: { total_revenue: 0, total_profit: 0, sales_count: 0 },
    inventory: { total_value: 0, items_count: 0 },
    claims: { total_amount: 0 },
    expiry: { expired_count: 0, expiring_30_count: 0 },
    branch_performance: [],
  };

  // Mock revenue trends for chart
  const trendData = [
    { name: "Mon", revenue: revenue.total_revenue * 0.1, profit: revenue.total_profit * 0.1 },
    { name: "Tue", revenue: revenue.total_revenue * 0.15, profit: revenue.total_profit * 0.15 },
    { name: "Wed", revenue: revenue.total_revenue * 0.22, profit: revenue.total_profit * 0.2 },
    { name: "Thu", revenue: revenue.total_revenue * 0.18, profit: revenue.total_profit * 0.18 },
    { name: "Fri", revenue: revenue.total_revenue * 0.25, profit: revenue.total_profit * 0.24 },
    { name: "Sat", revenue: revenue.total_revenue * 0.08, profit: revenue.total_profit * 0.08 },
    { name: "Sun", revenue: revenue.total_revenue * 0.02, profit: revenue.total_profit * 0.05 },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-muted-foreground">Live operations — updated 4 min ago</span>
          </div>
          <h1 className="mt-3 text-4xl font-extrabold font-display tracking-tight text-foreground">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time inventory, revenue, expiry risk, and claim exposure for {organization?.name}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-lg shadow-sm">
            <Activity className="h-4 w-4 mr-1.5 text-muted-foreground" />
            Health report
          </Button>
          <Button size="sm" className="rounded-lg bg-teal-900 hover:bg-teal-950 shadow-sm text-white">
            View analytics
            <ArrowUpRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          label="Total revenue"
          value={`₹${revenue.total_revenue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="#e6f2f0"
          iconColor="#083F3A"
          footline={<span className="text-muted-foreground">No sales logged yet this week</span>}
        />

        <KPICard
          label="Inventory value"
          value={`₹${inventory.total_value.toLocaleString()}`}
          icon={<Boxes className="w-5 h-5" />}
          iconBg="#e6f2f0"
          iconColor="#083F3A"
          footline={
            <div className="flex items-center gap-1">
              <span className="text-emerald-600 font-bold flex items-center font-mono">↑ 12.5%</span>
              <span className="text-muted-foreground">this week · {inventory.items_count} active items</span>
            </div>
          }
        />

        <KPICard
          label="Claims value"
          value={`₹${claims.total_amount.toLocaleString()}`}
          icon={<FileText className="w-5 h-5" />}
          iconBg="#e6f2f0"
          iconColor="#083F3A"
          footline={<span className="text-muted-foreground">Pending insurance approval</span>}
        />

        <KPICard
          label="Expiring / expired"
          value={`${expiry.expired_count + expiry.expiring_30_count} batches`}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="#fbeae8"
          iconColor="#c0392b"
          variant="urgent"
          footline={
            <div className="flex items-center gap-1">
              <span className="text-red-600 font-bold font-mono">₹{(expiry.expired_value + expiry.expiring_30_value).toLocaleString()} at risk</span>
              <span className="text-muted-foreground">— review in Expiry Tracking</span>
            </div>
          }
        />
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex-row items-start justify-between pb-6">
            <div>
              <CardTitle className="text-base font-display font-bold">Revenue & profit trend</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Weekly transaction pacing across active branches</p>
            </div>
            {/* Smooth Sliding Pill Range Switcher */}
            <div className="relative flex bg-muted rounded-lg p-1 text-xs font-semibold text-muted-foreground select-none">
              <div
                className="absolute top-1 bottom-1 bg-background rounded-md shadow-sm transition-all duration-300 ease-out"
                style={{
                  left: range === "7d" ? "4px" : range === "30d" ? "44px" : "88px",
                  width: "36px",
                }}
              />
              {["7d", "30d", "90d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`relative z-10 w-9 text-center py-1 transition-colors duration-200 ${
                    range === r ? "text-foreground font-bold" : "hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {revenue.total_revenue === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-xl bg-muted/10 gap-3 text-center p-6 transition-all duration-300">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground opacity-60"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                <p className="text-sm font-bold text-foreground font-display">No transactions yet this week</p>
                <p className="text-xs text-muted-foreground">Sales will start plotting here once logged in the Sales tab</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} className="font-mono" />
                    <YAxis stroke="#94a3b8" fontSize={11} className="font-mono" />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#0b6e63" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-display font-bold">Inventory expiry analysis</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Batch health split by expiry urgency</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Expired", value: expiry.expired_count, fill: "#c0392b" },
                    { name: "< 30 days", value: expiry.expiring_30_count, fill: "#e0961f" },
                    { name: "Healthy", value: Math.max(0, inventory.items_count - expiry.expired_count), fill: "#0b6e63" },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} className="font-mono" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {[
                      { fill: "#c0392b" },
                      { fill: "#e0961f" },
                      { fill: "#0b6e63" }
                    ].map((entry, index) => (
                      <rect key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex items-center gap-6 pt-4 border-t text-xs font-semibold text-muted-foreground justify-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-[#c0392b]" /> Act now
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-[#e0961f]" /> Plan clearance
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-[#0b6e63]" /> No action needed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Table */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-display font-bold">Branch Operational Performance</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue and margin by location</p>
          </div>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Branch Name</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Gross Profit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branch_performance.map((b: any) => (
                <TableRow key={b.branch_id} className="hover:bg-muted/20 transition-all">
                  <TableCell className="font-semibold text-foreground font-display">{b.branch_name}</TableCell>
                  <TableCell className="font-mono font-medium">₹{b.revenue.toLocaleString()}</TableCell>
                  <TableCell className="font-mono font-bold text-teal-800">₹{b.profit.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-teal-50 hover:bg-teal-50 text-teal-800 border-teal-200">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {branch_performance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-medium">
                    No branch data recorded yet. Please add sales or import inventory.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

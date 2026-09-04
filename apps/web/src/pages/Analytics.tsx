import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, CircleDollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export const Analytics: React.FC = () => {
  const { organization, selectedBranchId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [organization, selectedBranchId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-border animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-lg border bg-card animate-pulse" />
          <div className="h-80 rounded-lg border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  const { revenue, claims, expiry, branch_performance } = data || {
    revenue: { total_revenue: 0, total_profit: 0 },
    inventory: { total_value: 0 },
    claims: { status_distribution: {} },
    expiry: { expired_value: 0, expiring_30_value: 0 },
    branch_performance: [],
  };

  const claimsDistribution = Object.entries(claims.status_distribution).map(([status, details]: [string, any]) => ({
    name: status.replace("_", " "),
    value: details.amount,
  }));

  const COLORS = ["#087B78", "#10C981", "#3B82F6", "#F59E0B", "#EF4444", "#94A3B8"];

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">Multi-branch operational summaries, claim assets, and gross yields.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardDescription>Gross profit yield</CardDescription>
              <CardTitle className="mt-2 text-3xl font-bold text-primary">₹{revenue.total_profit.toLocaleString()}</CardTitle>
            </div>
            <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
            <span>Net margin</span>
            <span className="font-bold text-primary">
              {revenue.total_revenue > 0 ? ((revenue.total_profit / revenue.total_revenue) * 100).toFixed(1) : "0.0"}%
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardDescription>Outstanding claim assets</CardDescription>
              <CardTitle className="mt-2 text-3xl font-bold">₹{claims.total_amount.toLocaleString()}</CardTitle>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
            <span>Approved claims</span>
            <span className="font-bold text-foreground">
              {claims.status_distribution["APPROVED"]?.count || 0} approved
            </span>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardDescription>Estimated shelf loss risk</CardDescription>
              <CardTitle className="mt-2 text-3xl font-bold text-danger">
                ₹{(expiry.expired_value + expiry.expiring_30_value).toLocaleString()}
              </CardTitle>
            </div>
            <AlertTriangle className="h-5 w-5 text-danger" />
          </CardHeader>
          <CardContent className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
            <span>Total expired batches</span>
            <span className="font-bold text-danger">{expiry.expired_count} lots</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Branch revenue and profit yields</CardTitle>
            <CardDescription>Revenue compared with gross profit across active branches.</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branch_performance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="branch_name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#087B78" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10C981" name="Gross Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insurance claims asset volume</CardTitle>
            <CardDescription>Open claim value grouped by current status.</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="h-80 flex flex-col justify-between items-center">
            {claimsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={claimsDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {claimsDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="my-auto text-xs text-muted-foreground">No claims data found to display charts.</p>
            )}
          </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

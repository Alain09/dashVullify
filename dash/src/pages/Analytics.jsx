
import React, { useState, useEffect } from "react";
import { Customer } from "@/api/entities";
import { Scan } from "@/api/entities";
import { CustomerUser } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Activity,
  Target,
  Calendar,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  DollarSign, // Added DollarSign
  UserCheck // Added UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { differenceInHours, differenceInDays, subDays, format } from "date-fns";

export default function Analytics() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [scans, setScans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersData, scansData, usersData] = await Promise.all([
        Customer.list(),
        Scan.list(),
        CustomerUser.list()
      ]);
      setCustomers(customersData);
      setScans(scansData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
    setLoading(false);
  };

  // Calculate metrics
  const now = new Date();
  const last24Hours = subDays(now, 1);
  const last7Days = subDays(now, 7);
  const last30Days = subDays(now, 30);

  // Growth metrics
  const newCustomersLast30Days = customers.filter(c =>
    c.created_date && new Date(c.created_date) >= last30Days
  ).length;

  const newUsersLast24Hours = users.filter(u =>
    u.created_date && new Date(u.created_date) >= last24Hours
  ).length;

  const newUsersLast7Days = users.filter(u =>
    u.created_date && new Date(u.created_date) >= last7Days
  ).length;

  // Scan metrics
  const scansLast24Hours = scans.filter(s =>
    s.started_at && new Date(s.started_at) >= last24Hours
  ).length;

  const scansLast7Days = scans.filter(s =>
    s.started_at && new Date(s.started_at) >= last7Days
  ).length;

  const runningScans = scans.filter(s => s.status === "running").length;
  const scheduledScans = scans.filter(s => s.status === "queued").length;
  const completedScans = scans.filter(s => s.status === "completed").length;
  const failedScans = scans.filter(s => s.status === "failed").length;

  // Target metrics
  const totalTargets = scans.reduce((sum, s) => sum + (s.targets_count || 0), 0);
  const avgTargetsPerScan = scans.length > 0 ? Math.round(totalTargets / scans.length) : 0;

  // Vulnerability metrics
  const totalVulnerabilities = customers.reduce((sum, c) => sum + (c.vulnerabilities_count || 0), 0);
  const criticalVulnerabilities = customers.reduce((sum, c) => sum + (c.critical_vulnerabilities || 0), 0);
  const resolvedVulnerabilities = customers.reduce((sum, c) => sum + (c.resolved_vulnerabilities || 0), 0);

  // Revenue metrics
  const totalRevenue = customers.reduce((sum, c) => sum + (c.contract_value || 0), 0);
  const monthlyRecurringRevenue = Math.round(totalRevenue / 12);

  // Customer breakdown by plan
  const planDistribution = {
    Essential: customers.filter(c => c.plan === "Essential").length,
    Professional: customers.filter(c => c.plan === "Professional" || c.plan === "Pro").length,
    Enterprise: customers.filter(c => c.plan === "Enterprise").length
  };

  // Recent activity (last 7 days by day)
  const activityByDay = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = new Date(day.setHours(0, 0, 0, 0));
    const dayEnd = new Date(day.setHours(23, 59, 59, 999));

    const scansOnDay = scans.filter(s => {
      if (!s.started_at) return false;
      const scanDate = new Date(s.started_at);
      return scanDate >= dayStart && scanDate <= dayEnd;
    }).length;

    activityByDay.push({
      date: format(dayStart, "MMM d"),
      scans: scansOnDay
    });
  }

  const mainStats = [
    {
      label: "Total Customers",
      value: customers.length,
      change: `+${newCustomersLast30Days} this month`,
      icon: Users,
      color: "#F4B942"
    },
    {
      label: "Active Users",
      value: users.length,
      change: `+${newUsersLast7Days} this week`,
      icon: UserCheck, // Changed from UserCog to UserCheck
      color: "#1E8A9C"
    },
    {
      label: "Scans (24h)",
      value: scansLast24Hours,
      change: `${scansLast7Days} this week`,
      icon: Activity,
      color: "#4CAF50"
    },
    {
      label: "Total Targets",
      value: totalTargets.toLocaleString(),
      change: `${avgTargetsPerScan} avg/scan`,
      icon: Target,
      color: "#F49342"
    }
  ];

  const scanStats = [
    {
      label: "Running",
      value: runningScans,
      icon: Activity,
      color: "#1E8A9C"
    },
    {
      label: "Scheduled",
      value: scheduledScans,
      icon: Calendar,
      color: "#F4B942"
    },
    {
      label: "Completed",
      value: completedScans,
      icon: CheckCircle2,
      color: "#4CAF50"
    },
    {
      label: "Failed",
      value: failedScans,
      icon: AlertTriangle,
      color: "#F49342"
    }
  ];

  const vulnerabilityStats = [
    {
      label: "Total Vulnerabilities",
      value: totalVulnerabilities,
      color: "#F49342"
    },
    {
      label: "Critical",
      value: criticalVulnerabilities,
      color: "#DC2626"
    },
    {
      label: "Resolved",
      value: resolvedVulnerabilities,
      color: "#4CAF50"
    },
    {
      label: "Resolution Rate",
      value: totalVulnerabilities > 0
        ? `${Math.round((resolvedVulnerabilities / totalVulnerabilities) * 100)}%`
        : "0%",
      color: "#1E8A9C"
    }
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Tools"))}
              className="border-[#176B7A]"
              style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
                Platform Analytics
              </h1>
              <p style={{ color: '#7FB8BF' }}>
                Real-time metrics and growth insights
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#F4B942' }} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mainStats.map((stat, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg"
                  style={{ backgroundColor: '#176B7A' }}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm mb-1" style={{ color: '#A3CED1' }}>
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold" style={{ color: '#E8F4F5' }}>
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                      >
                        <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" style={{ color: '#4CAF50' }} />
                      <span className="text-sm" style={{ color: '#7FB8BF' }}>
                        {stat.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Scan Status Overview */}
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
              <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
                <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                  <BarChart3 className="w-5 h-5" />
                  Scan Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {scanStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
                      </div>
                      <p className="text-3xl font-bold mb-1" style={{ color: '#E8F4F5' }}>
                        {stat.value}
                      </p>
                      <p className="text-sm" style={{ color: '#A3CED1' }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Vulnerability Metrics */}
              <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
                <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                    <AlertTriangle className="w-5 h-5" />
                    Vulnerability Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {vulnerabilityStats.map((stat, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm" style={{ color: '#A3CED1' }}>
                            {stat.label}
                          </span>
                          <span className="text-2xl font-bold" style={{ color: stat.color }}>
                            {stat.value}
                          </span>
                        </div>
                        {index < vulnerabilityStats.length - 1 && (
                          <div className="h-px mt-4" style={{ backgroundColor: '#1E8A9C' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Metrics */}
              <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
                <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                    <DollarSign className="w-5 h-5" />
                    Revenue Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>
                        Annual Recurring Revenue
                      </p>
                      <p className="text-4xl font-bold" style={{ color: '#4CAF50' }}>
                        ${totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>
                        Monthly Recurring Revenue
                      </p>
                      <p className="text-3xl font-bold" style={{ color: '#F4B942' }}>
                        ${monthlyRecurringRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-px" style={{ backgroundColor: '#1E8A9C' }} />
                    <div>
                      <p className="text-sm mb-3" style={{ color: '#A3CED1' }}>
                        Customers by Plan
                      </p>
                      <div className="space-y-2">
                        {Object.entries(planDistribution).map(([plan, count]) => (
                          <div key={plan} className="flex justify-between items-center">
                            <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
                              {plan}
                            </Badge>
                            <span className="font-semibold" style={{ color: '#E8F4F5' }}>
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Timeline */}
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
              <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
                <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                  <Clock className="w-5 h-5" />
                  Scan Activity (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {activityByDay.map((day, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#A3CED1' }}>
                          {day.date}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: '#E8F4F5' }}>
                          {day.scans} scans
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#0D3339' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${day.scans > 0 ? Math.min((day.scans / Math.max(...activityByDay.map(d => d.scans))) * 100, 100) : 0}%`,
                            backgroundColor: '#F4B942'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
              <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
                <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                  <Users className="w-5 h-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>
                      New Users (24h)
                    </p>
                    <p className="text-4xl font-bold" style={{ color: '#F4B942' }}>
                      {newUsersLast24Hours}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>
                      New Users (7d)
                    </p>
                    <p className="text-4xl font-bold" style={{ color: '#1E8A9C' }}>
                      {newUsersLast7Days}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>
                      Total Users
                    </p>
                    <p className="text-4xl font-bold" style={{ color: '#4CAF50' }}>
                      {users.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

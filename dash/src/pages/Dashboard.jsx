import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Server,
  Shield,
  Activity,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    { 
      title: "Total Customers", 
      value: "247", 
      icon: Users, 
      trend: "+12%",
      color: "#F4B942"
    },
    { 
      title: "Active Vulnerabilities", 
      value: "1,234", 
      icon: AlertTriangle, 
      trend: "-8%",
      color: "#F49342"
    },
    { 
      title: "Resolved This Month", 
      value: "892", 
      icon: CheckCircle2, 
      trend: "+24%",
      color: "#4CAF50"
    },
    { 
      title: "Scan Coverage", 
      value: "94%", 
      icon: Activity, 
      trend: "+3%",
      color: "#1E8A9C"
    },
  ];

  const recentActivity = [
    { customer: "Acme Corp", action: "Critical vulnerability detected", time: "5 min ago", severity: "critical" },
    { customer: "TechStart Inc", action: "Scan completed successfully", time: "12 min ago", severity: "info" },
    { customer: "Global Systems", action: "Medium vulnerability resolved", time: "1 hour ago", severity: "medium" },
    { customer: "DataFlow Ltd", action: "New infrastructure added", time: "2 hours ago", severity: "info" },
    { customer: "SecureNet", action: "High vulnerability detected", time: "3 hours ago", severity: "high" },
  ];

  const infrastructureStatus = [
    { name: "API Gateway", status: "operational", uptime: "99.9%" },
    { name: "Scan Engine", status: "operational", uptime: "99.7%" },
    { name: "Database Cluster", status: "operational", uptime: "99.8%" },
    { name: "Analytics Service", status: "degraded", uptime: "97.2%" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#7FB8BF' }}>
            Monitor your vulnerability management platform in real-time
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-lg"
              style={{ backgroundColor: '#176B7A' }}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#A3CED1' }}>
                      {stat.title}
                    </p>
                    <CardTitle className="text-3xl font-bold mt-2" style={{ color: '#E8F4F5' }}>
                      {stat.value}
                    </CardTitle>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: '#4CAF50' }} />
                  <span className="text-sm font-medium" style={{ color: '#4CAF50' }}>
                    {stat.trend}
                  </span>
                  <span className="text-sm" style={{ color: '#7FB8BF' }}>vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
              <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
                <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-4 hover:bg-[#1E8A9C] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                              {activity.customer}
                            </p>
                            <Badge 
                              variant="outline"
                              className={`border-0 ${
                                activity.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                                activity.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                activity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {activity.severity}
                            </Badge>
                          </div>
                          <p className="text-sm" style={{ color: '#A3CED1' }}>
                            {activity.action}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm" style={{ color: '#7FB8BF' }}>
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Infrastructure Status */}
          <div>
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
              <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
                <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                  <Server className="w-5 h-5" />
                  Infrastructure Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {infrastructureStatus.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium" style={{ color: '#E8F4F5' }}>
                          {item.name}
                        </span>
                        <Badge 
                          variant="outline"
                          className={`border-0 ${
                            item.status === 'operational' 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: '#7FB8BF' }}>Uptime</span>
                        <span className="font-semibold" style={{ color: '#A3CED1' }}>
                          {item.uptime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
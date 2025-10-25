import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Plus, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Infrastructures() {
  const infrastructure = [
    { 
      name: "API Gateway Cluster", 
      type: "Load Balancer", 
      status: "operational", 
      uptime: "99.9%",
      requests: "2.4M/day",
      latency: "45ms"
    },
    { 
      name: "Scan Engine Primary", 
      type: "Scanner", 
      status: "operational", 
      uptime: "99.7%",
      requests: "180K/day",
      latency: "320ms"
    },
    { 
      name: "Database Cluster", 
      type: "PostgreSQL", 
      status: "operational", 
      uptime: "99.8%",
      requests: "5.1M/day",
      latency: "12ms"
    },
    { 
      name: "Analytics Service", 
      type: "Processing", 
      status: "degraded", 
      uptime: "97.2%",
      requests: "890K/day",
      latency: "580ms"
    },
    { 
      name: "Redis Cache", 
      type: "Cache", 
      status: "operational", 
      uptime: "99.9%",
      requests: "8.7M/day",
      latency: "3ms"
    },
    { 
      name: "Message Queue", 
      type: "RabbitMQ", 
      status: "operational", 
      uptime: "99.6%",
      requests: "1.2M/day",
      latency: "25ms"
    },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
              Infrastructure Monitoring
            </h1>
            <p style={{ color: '#7FB8BF' }}>
              Monitor system health and performance
            </p>
          </div>
          <Button 
            className="font-semibold"
            style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Services Running", value: "24", icon: Server, color: "#4CAF50" },
            { label: "Operational", value: "22", icon: CheckCircle2, color: "#4CAF50" },
            { label: "Degraded", value: "2", icon: AlertTriangle, color: "#F49342" },
            { label: "Avg Uptime", value: "99.5%", icon: Activity, color: "#1E8A9C" },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm" style={{ color: '#A3CED1' }}>{stat.label}</p>
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#E8F4F5' }}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {infrastructure.map((service, index) => (
            <Card 
              key={index}
              className="border-0 shadow-lg"
              style={{ backgroundColor: '#176B7A' }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                    >
                      <Server className="w-6 h-6" style={{ color: '#F4B942' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
                        {service.name}
                      </h3>
                      <p className="text-sm" style={{ color: '#7FB8BF' }}>{service.type}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`border-0 ${
                      service.status === 'operational' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {service.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Uptime</p>
                    <p className="font-bold" style={{ color: '#E8F4F5' }}>{service.uptime}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Requests</p>
                    <p className="font-bold" style={{ color: '#E8F4F5' }}>{service.requests}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Latency</p>
                    <p className="font-bold" style={{ color: '#E8F4F5' }}>{service.latency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
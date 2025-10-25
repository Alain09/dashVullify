
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Wrench, 
  Terminal, 
  Database, 
  Shield, 
  FileSearch,
  ExternalLink,
  Stethoscope,
  FileText
} from "lucide-react";

export default function Tools() {
  const navigate = useNavigate();

  const tools = [
    { 
      name: "Scan Engine", 
      description: "Configure and manage vulnerability scanning", 
      icon: FileSearch,
      status: "active",
      usage: "1.2K scans/day",
      onClick: () => navigate(createPageUrl("ScanEngine"))
    },
    { 
      name: "Scan Console", 
      description: "Launch and monitor scans with debug info", 
      icon: Terminal,
      status: "active",
      usage: "450 scans launched",
      onClick: () => navigate(createPageUrl("ScanConsole"))
    },
    { 
      name: "Analytics", 
      description: "Platform metrics and growth insights", 
      icon: Database,
      status: "active",
      usage: "Real-time data",
      onClick: () => navigate(createPageUrl("Analytics"))
    },
    { 
      name: "Remediations and Descriptions", 
      description: "Manage vulnerability remediation guidance", 
      icon: Shield,
      status: "active",
      usage: "156 vulnerabilities",
      onClick: () => navigate(createPageUrl("RemediationsDescriptions"))
    },
    { 
      name: "Audit Logs", 
      description: "Security events and access logs", 
      icon: FileText,
      status: "active",
      usage: "Real-time monitoring",
      onClick: () => navigate(createPageUrl("AuditLogs"))
    },
    { 
      name: "Diagnostic", 
      description: "Monitor running scans and system health", 
      icon: Stethoscope,
      status: "active",
      usage: "Real-time monitoring",
      onClick: () => navigate(createPageUrl("Diagnostic"))
    },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
            Platform Tools
          </h1>
          <p style={{ color: '#7FB8BF' }}>
            Access administrative and development tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Card 
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              style={{ backgroundColor: '#176B7A' }}
              onClick={tool.onClick}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                  >
                    <tool.icon className="w-6 h-6" style={{ color: '#F4B942' }} />
                  </div>
                  <Badge 
                    variant="outline"
                    className={`border-0 ${
                      tool.status === 'active' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {tool.status}
                  </Badge>
                </div>
                <CardTitle style={{ color: '#E8F4F5' }}>
                  {tool.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" style={{ color: '#A3CED1' }}>
                  {tool.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#7FB8BF' }}>
                    {tool.usage}
                  </span>
                  {tool.onClick && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      style={{ color: '#F4B942' }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

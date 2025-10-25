import React, { useState, useEffect } from "react";
import { AuditLog } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  Filter,
  X,
  Globe,
  Clock,
  User,
  Activity,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await AuditLog.list("-created_date");
      setLogs(data);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    }
    setLoading(false);
  };

  const handleAddSampleData = async () => {
    try {
      await AuditLog.bulkCreate([
        {
          event_type: "failed_login",
          severity: "high",
          user_email: "[email protected]",
          ip_address: "185.220.101.45",
          location: "Russia",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          description: "Failed login attempt with incorrect password",
          action: "login",
          status: "failed",
          metadata: { attempts: 5, reason: "invalid_credentials" }
        },
        {
          event_type: "suspicious_request",
          severity: "critical",
          user_email: "unknown",
          ip_address: "45.142.120.89",
          location: "China",
          user_agent: "python-requests/2.28.0",
          description: "SQL injection attempt detected in API endpoint",
          resource: "/api/customers",
          action: "query",
          status: "blocked",
          metadata: { attack_pattern: "' OR '1'='1", endpoint: "/api/customers?id=1' OR '1'='1--" }
        },
        {
          event_type: "failed_login",
          severity: "medium",
          user_email: "[email protected]",
          ip_address: "192.168.1.100",
          location: "United States",
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
          description: "Failed login attempt - expired session token",
          action: "login",
          status: "failed",
          metadata: { reason: "expired_token" }
        },
        {
          event_type: "unauthorized_access",
          severity: "high",
          user_email: "[email protected]",
          ip_address: "203.0.113.42",
          location: "Brazil",
          user_agent: "Mozilla/5.0 (X11; Linux x86_64)",
          description: "Attempted to access admin panel without proper permissions",
          resource: "/admin/users",
          action: "access",
          status: "blocked",
          metadata: { required_role: "admin", user_role: "user" }
        },
        {
          event_type: "suspicious_request",
          severity: "high",
          user_email: "unknown",
          ip_address: "91.194.226.11",
          location: "Ukraine",
          user_agent: "curl/7.68.0",
          description: "Multiple rapid requests from same IP - potential DDoS",
          resource: "/api/scans",
          action: "list",
          status: "blocked",
          metadata: { requests_per_second: 150, threshold: 50 }
        },
        {
          event_type: "failed_login",
          severity: "critical",
          user_email: "[email protected]",
          ip_address: "198.51.100.23",
          location: "Romania",
          user_agent: "Mozilla/5.0 (Windows NT 6.1; WOW64)",
          description: "Brute force attack detected - 25 failed login attempts",
          action: "login",
          status: "blocked",
          metadata: { attempts: 25, time_window: "5 minutes", account_locked: true }
        },
        {
          event_type: "data_export",
          severity: "medium",
          user_email: "[email protected]",
          ip_address: "10.0.1.50",
          location: "United States",
          user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          description: "Customer data exported to CSV",
          resource: "/api/customers/export",
          action: "export",
          status: "success",
          metadata: { records_exported: 150, format: "csv" }
        },
        {
          event_type: "configuration_change",
          severity: "medium",
          user_email: "[email protected]",
          ip_address: "10.0.1.25",
          location: "United States",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          description: "Scan schedule configuration updated",
          resource: "/settings/scans",
          action: "update",
          status: "success",
          metadata: { changed_fields: ["frequency", "time"], old_frequency: "daily", new_frequency: "weekly" }
        },
        {
          event_type: "successful_login",
          severity: "info",
          user_email: "[email protected]",
          ip_address: "10.0.1.100",
          location: "United States",
          user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          description: "Successful login",
          action: "login",
          status: "success",
          metadata: { session_id: "sess_abc123xyz" }
        },
        {
          event_type: "suspicious_request",
          severity: "high",
          user_email: "unknown",
          ip_address: "103.253.145.22",
          location: "India",
          user_agent: "Scrapy/2.7.0",
          description: "Web scraping bot detected",
          resource: "/customers",
          action: "scrape",
          status: "blocked",
          metadata: { bot_type: "scraper", pages_attempted: 50 }
        },
        {
          event_type: "unauthorized_access",
          severity: "critical",
          user_email: "[email protected]",
          ip_address: "89.248.165.32",
          location: "Netherlands",
          user_agent: "Mozilla/5.0",
          description: "Attempted to access other customer's data",
          resource: "/api/customers/abc123",
          action: "read",
          status: "blocked",
          metadata: { attempted_customer_id: "abc123", actual_customer_id: "xyz789" }
        },
        {
          event_type: "password_reset",
          severity: "medium",
          user_email: "[email protected]",
          ip_address: "72.14.201.45",
          location: "United States",
          user_agent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)",
          description: "Password reset requested",
          action: "password_reset",
          status: "success",
          metadata: { reset_method: "email", token_sent: true }
        }
      ]);
      await loadLogs();
    } catch (error) {
      console.error("Error adding sample data:", error);
      alert("Error adding sample data. Please try again.");
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    const matchesEventType = eventTypeFilter === "all" || log.event_type === eventTypeFilter;
    
    return matchesSearch && matchesSeverity && matchesEventType;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300';
      case 'high': return 'bg-orange-500/20 text-orange-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'low': return 'bg-blue-500/20 text-blue-300';
      case 'info': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      case 'info': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      case 'blocked': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const stats = [
    {
      label: "Total Events",
      value: logs.length,
      icon: Activity,
      color: "#F4B942"
    },
    {
      label: "Critical Events",
      value: logs.filter(l => l.severity === "critical").length,
      icon: AlertTriangle,
      color: "#F49342"
    },
    {
      label: "Failed Logins",
      value: logs.filter(l => l.event_type === "failed_login").length,
      icon: XCircle,
      color: "#EF4444"
    },
    {
      label: "Blocked Requests",
      value: logs.filter(l => l.status === "blocked").length,
      icon: Shield,
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
                Audit Logs
              </h1>
              <p style={{ color: '#7FB8BF' }}>
                Security events, access logs, and suspicious activity
              </p>
            </div>
          </div>

          {logs.length === 0 && (
            <Button
              onClick={handleAddSampleData}
              className="bg-[#F4B942] hover:bg-[#F49342] text-[#0A4A52]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sample Data
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="border-0 shadow-lg"
              style={{ backgroundColor: '#176B7A' }}
            >
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
                <p className="text-4xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#7FB8BF' }} />
                <Input
                  placeholder="Search by email, IP, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0"
                  style={{ 
                    backgroundColor: '#1E8A9C',
                    color: '#E8F4F5'
                  }}
                />
              </div>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger 
                  className="border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                >
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger 
                  className="border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                >
                  <SelectValue placeholder="Filter by event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Event Types</SelectItem>
                  <SelectItem value="failed_login">Failed Login</SelectItem>
                  <SelectItem value="suspicious_request">Suspicious Request</SelectItem>
                  <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                  <SelectItem value="successful_login">Successful Login</SelectItem>
                  <SelectItem value="data_export">Data Export</SelectItem>
                  <SelectItem value="configuration_change">Configuration Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(severityFilter !== "all" || eventTypeFilter !== "all") && (
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSeverityFilter("all");
                    setEventTypeFilter("all");
                  }}
                  style={{ color: '#F49342' }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle style={{ color: '#E8F4F5' }}>
              Security Events ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
                <p style={{ color: '#E8F4F5' }}>Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
                <p className="text-xl mb-2" style={{ color: '#E8F4F5' }}>
                  No audit logs found
                </p>
                <p style={{ color: '#7FB8BF' }}>
                  {searchQuery || severityFilter !== "all" || eventTypeFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Security events will appear here"}
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
                {filteredLogs.map((log, index) => (
                  <div 
                    key={index}
                    className="p-6 hover:bg-[#1E8A9C] transition-colors"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <Badge 
                              variant="outline"
                              className={`border-0 ${getSeverityColor(log.severity)}`}
                            >
                              <div className="flex items-center gap-1">
                                {getSeverityIcon(log.severity)}
                                {log.severity}
                              </div>
                            </Badge>
                            <Badge variant="outline" className="border-0 bg-purple-500/20 text-purple-300">
                              {log.event_type.replace(/_/g, ' ')}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className={`border-0 ${getStatusColor(log.status)}`}
                            >
                              {log.status}
                            </Badge>
                          </div>
                          
                          <p className="font-semibold text-lg mb-2" style={{ color: '#E8F4F5' }}>
                            {log.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#A3CED1' }}>
                            {log.user_email && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {log.user_email}
                              </div>
                            )}
                            {log.ip_address && (
                              <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {log.ip_address}
                                {log.location && ` (${log.location})`}
                              </div>
                            )}
                            {log.resource && (
                              <div className="flex items-center gap-1">
                                <Activity className="w-4 h-4" />
                                {log.resource}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 text-sm" style={{ color: '#7FB8BF' }}>
                          {log.created_date && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{format(new Date(log.created_date), "MMM d, yyyy HH:mm:ss")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: '#0D3339' }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: '#7FB8BF' }}>
                            Additional Details:
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs" style={{ color: '#A3CED1' }}>
                            {Object.entries(log.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span style={{ color: '#7FB8BF' }}>{key.replace(/_/g, ' ')}: </span>
                                <span className="font-mono">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { ScanResult } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Terminal,
  Server,
  Activity,
  Clock,
  Building2,
  Code,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  ExternalLink
} from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ScanDebugDialog({ open, onOpenChange, scan, customer }) {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    if (scan && open) {
      loadResults();
    }
  }, [scan, open]);

  const loadResults = async () => {
    if (!scan) return;
    
    setLoadingResults(true);
    try {
      const data = await ScanResult.filter({ scan_id: scan.id });
      setResults(data);
    } catch (error) {
      console.error("Error loading scan results:", error);
    }
    setLoadingResults(false);
  };

  if (!scan) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      case 'queued': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

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

  const handleResultClick = (result) => {
    onOpenChange(false);
    navigate(createPageUrl("ScanResultDetail") + `?id=${result.id}&scan_id=${scan.id}`);
  };

  const debugLogs = [
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "INFO", message: `Scan initialized: ${scan.scan_name}` },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "INFO", message: `Node selected: ${scan.node_name}` },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "INFO", message: `Customer: ${customer?.company_name}` },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "INFO", message: `Scan type: ${scan.scan_type}` },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "INFO", message: `Targets to scan: ${scan.targets_count}` },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "SUCCESS", message: "Connection established with scan node" },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "INFO", message: "Loading scan modules..." },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "SUCCESS", message: "Scan modules loaded successfully" },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: "INFO", message: "Starting target enumeration..." },
    { time: format(new Date(scan.started_at || new Date()), "HH:mm:ss"), level: scan.status === 'running' ? "INFO" : scan.status === 'failed' ? "ERROR" : "SUCCESS", message: scan.status === 'running' ? `Scan in progress... (${scan.progress}% complete)` : scan.status === 'failed' ? "Scan terminated with errors" : "Scan completed successfully" }
  ];

  const getDuration = () => {
    if (!scan.started_at) return "N/A";
    const hours = differenceInHours(new Date(), new Date(scan.started_at));
    return `${hours}h`;
  };

  const criticalCount = results.filter(r => r.severity === 'critical').length;
  const highCount = results.filter(r => r.severity === 'high').length;
  const mediumCount = results.filter(r => r.severity === 'medium').length;
  const lowCount = results.filter(r => r.severity === 'low').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#176B7A' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3" style={{ color: '#E8F4F5' }}>
            <Terminal className="w-6 h-6" style={{ color: '#F4B942' }} />
            Scan Console
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scan Overview */}
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-xl" style={{ color: '#E8F4F5' }}>
                  {scan.scan_name}
                </h3>
                <div className="flex gap-2">
                  <Badge 
                    variant="outline"
                    className={`border-0 ${getStatusColor(scan.status)}`}
                  >
                    {scan.status}
                  </Badge>
                  <Badge variant="outline" className="border-0 bg-purple-500/20 text-purple-300">
                    {scan.scan_type}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Customer</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {customer?.company_name || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Duration</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {getDuration()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Progress</p>
                  <div className="space-y-2">
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {scan.progress || 0}%
                    </p>
                    <Progress value={scan.progress || 0} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Node Information */}
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
            <CardHeader className="border-b pb-3" style={{ borderColor: '#176B7A' }}>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#E8F4F5' }}>
                <Server className="w-5 h-5" style={{ color: '#F4B942' }} />
                Node Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Node Name</p>
                  <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                    {scan.node_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Location</p>
                  <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                    {scan.node_location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>IP Address</p>
                  <p className="font-semibold font-mono" style={{ color: '#E8F4F5' }}>
                    {scan.node_ip || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Debug and Results */}
          <Tabs defaultValue="debug" className="w-full">
            <TabsList 
              className="mb-4 p-1"
              style={{ backgroundColor: '#1E8A9C' }}
            >
              <TabsTrigger 
                value="debug"
                className="data-[state=active]:bg-[#F4B942] data-[state=active]:text-[#0A4A52]"
                style={{ color: '#E8F4F5' }}
              >
                <Code className="w-4 h-4 mr-2" />
                Debug Logs
              </TabsTrigger>
              <TabsTrigger 
                value="results"
                className="data-[state=active]:bg-[#F4B942] data-[state=active]:text-[#0A4A52]"
                style={{ color: '#E8F4F5' }}
              >
                <Shield className="w-4 h-4 mr-2" />
                Results ({results.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="debug">
              <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
                <CardContent className="p-0">
                  <div 
                    className="p-4 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto"
                    style={{ backgroundColor: '#0D3339' }}
                  >
                    {debugLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 py-1">
                        <span style={{ color: '#7FB8BF' }}>[{log.time}]</span>
                        <span className={`font-semibold ${
                          log.level === 'ERROR' ? 'text-red-400' :
                          log.level === 'SUCCESS' ? 'text-green-400' :
                          log.level === 'WARNING' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {log.level === 'ERROR' && <XCircle className="w-4 h-4 inline mr-1" />}
                          {log.level === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                          {log.level === 'WARNING' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                          {log.level === 'INFO' && <Activity className="w-4 h-4 inline mr-1" />}
                          {log.level}
                        </span>
                        <span style={{ color: '#E8F4F5' }}>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              {loadingResults ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
                  <p style={{ color: '#E8F4F5' }}>Loading results...</p>
                </div>
              ) : (
                <>
                  {/* Results Summary */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Critical</p>
                        <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>High</p>
                        <p className="text-3xl font-bold text-orange-400">{highCount}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Medium</p>
                        <p className="text-3xl font-bold text-yellow-400">{mediumCount}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Low</p>
                        <p className="text-3xl font-bold text-blue-400">{lowCount}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Results List */}
                  <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
                    <CardContent className="p-0">
                      {results.length === 0 ? (
                        <div className="p-12 text-center">
                          <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
                          <p className="text-xl mb-2" style={{ color: '#E8F4F5' }}>
                            No vulnerabilities found
                          </p>
                          <p style={{ color: '#7FB8BF' }}>
                            {scan.status === 'running' ? 'Scan is still in progress' : 'This scan completed without findings'}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y" style={{ borderColor: '#176B7A' }}>
                          {results.map((result, index) => (
                            <div
                              key={index}
                              className="p-4 hover:bg-[#176B7A] transition-colors cursor-pointer"
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold" style={{ color: '#E8F4F5' }}>
                                      {result.vulnerability_name}
                                    </h4>
                                    <Badge 
                                      variant="outline"
                                      className={`border-0 ${getSeverityColor(result.severity)}`}
                                    >
                                      {result.severity}
                                    </Badge>
                                    {result.vulnerability_code && (
                                      <Badge variant="outline" className="border-0 bg-purple-500/20 text-purple-300 font-mono text-xs">
                                        {result.vulnerability_code}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>
                                    Target: {result.target}
                                    {result.port && ` : ${result.port}`}
                                  </p>
                                  <p className="text-sm line-clamp-2" style={{ color: '#7FB8BF' }}>
                                    {result.description}
                                  </p>
                                </div>
                                <ExternalLink className="w-5 h-5 flex-shrink-0" style={{ color: '#F4B942' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
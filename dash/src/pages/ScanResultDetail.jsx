import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ScanResult } from "@/api/entities";
import { Scan } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Server,
  FileText,
  Code,
  Building2,
  Calendar,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function ScanResultDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const resultId = urlParams.get("id");
  const scanId = urlParams.get("scan_id");

  const [result, setResult] = useState(null);
  const [scan, setScan] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId && scanId) {
      loadData();
    }
  }, [resultId, scanId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const resultData = await ScanResult.get(resultId);
      setResult(resultData);

      const scanData = await Scan.get(scanId);
      setScan(scanData);

      const customerData = await Customer.get(scanData.customer_id);
      setCustomer(customerData);
    } catch (error) {
      console.error("Error loading result data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A4A52' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
          <p style={{ color: '#E8F4F5' }}>Loading result details...</p>
        </div>
      </div>
    );
  }

  if (!result || !scan) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A4A52' }}>
        <div className="text-center">
          <p style={{ color: '#E8F4F5' }}>Result not found</p>
          <Button
            onClick={() => navigate(createPageUrl("ScanConsole"))}
            className="mt-4"
            style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
          >
            Back to Scan Console
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("ScanConsole"))}
            className="border-[#176B7A]"
            style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
              Vulnerability Details
            </h1>
            <p style={{ color: '#7FB8BF' }}>
              Found in {scan.scan_name}
            </p>
          </div>
        </div>

        {/* Scan Context */}
        <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Customer</p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" style={{ color: '#F4B942' }} />
                  <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                    {customer?.company_name || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Scan Name</p>
                <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                  {scan.scan_name}
                </p>
              </div>
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Scan Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#F4B942' }} />
                  <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                    {format(new Date(scan.started_at || new Date()), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vulnerability Header */}
        <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(244, 73, 66, 0.15)' }}
                >
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
                    {result.vulnerability_name}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline"
                      className={`border-0 text-base ${getSeverityColor(result.severity)}`}
                    >
                      {result.severity}
                    </Badge>
                    {result.vulnerability_code && (
                      <Badge variant="outline" className="border-0 bg-purple-500/20 text-purple-300 font-mono">
                        {result.vulnerability_code}
                      </Badge>
                    )}
                    {result.cvss_score && (
                      <Badge variant="outline" className="border-0 bg-orange-500/20 text-orange-300">
                        CVSS: {result.cvss_score}
                      </Badge>
                    )}
                    <Badge 
                      variant="outline"
                      className={`border-0 ${
                        result.status === 'remediated' ? 'bg-green-500/20 text-green-300' :
                        result.status === 'false_positive' ? 'bg-gray-500/20 text-gray-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Target</p>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: '#F4B942' }} />
                  <p className="font-semibold font-mono" style={{ color: '#E8F4F5' }}>
                    {result.target}
                  </p>
                </div>
              </div>
              {result.port && (
                <div>
                  <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Port</p>
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold font-mono" style={{ color: '#E8F4F5' }}>
                      {result.port}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
              <FileText className="w-5 h-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p style={{ color: '#E8F4F5', lineHeight: '1.8' }}>
              {result.description}
            </p>
          </CardContent>
        </Card>

        {/* Evidence */}
        {result.evidence && (
          <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
            <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
              <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                <Code className="w-5 h-5" />
                Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div 
                className="p-4 rounded-lg font-mono text-sm overflow-x-auto"
                style={{ backgroundColor: '#0D3339' }}
              >
                <pre style={{ color: '#E8F4F5', margin: 0 }}>{result.evidence}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendation */}
        {result.recommendation && (
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
            <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
              <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                <Shield className="w-5 h-5" />
                Remediation Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p style={{ color: '#E8F4F5', lineHeight: '1.8' }}>
                {result.recommendation}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
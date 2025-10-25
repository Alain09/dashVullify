import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tag, Clock, Shield, Target, Code, FileText } from "lucide-react";

export default function TemplateDetailDialog({ open, onOpenChange, template }) {
  if (!template) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#176B7A' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#E8F4F5' }}>
            {template.template_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline"
              className={`border-0 ${getSeverityColor(template.severity)}`}
            >
              {template.severity}
            </Badge>
            <Badge variant="outline" className="border-0 bg-purple-500/20 text-purple-300">
              {template.vulnerability_type}
            </Badge>
            <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
              {template.detection_method?.replace(/_/g, ' ')}
            </Badge>
            {template.enabled === false && (
              <Badge variant="outline" className="border-0 bg-gray-500/20 text-gray-300">
                Disabled
              </Badge>
            )}
          </div>

          {/* Description */}
          <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
            <CardContent className="p-4">
              <p style={{ color: '#E8F4F5' }}>{template.description}</p>
            </CardContent>
          </Card>

          {/* Configuration Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" style={{ color: '#F4B942' }} />
                  <p className="font-semibold" style={{ color: '#E8F4F5' }}>Scan Targets</p>
                </div>
                <p className="text-sm" style={{ color: '#A3CED1' }}>
                  {template.scan_targets?.join(", ") || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" style={{ color: '#F4B942' }} />
                  <p className="font-semibold" style={{ color: '#E8F4F5' }}>Scan Time</p>
                </div>
                <p className="text-sm" style={{ color: '#A3CED1' }}>
                  {template.scan_time_estimate || "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detection Pattern */}
          {template.detection_pattern && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4" style={{ color: '#F4B942' }} />
                <p className="font-semibold" style={{ color: '#E8F4F5' }}>Detection Pattern</p>
              </div>
              <Card className="border-0" style={{ backgroundColor: '#0D3339' }}>
                <CardContent className="p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: '#E8F4F5' }}>
                    {template.detection_pattern}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Test Payload */}
          {template.test_payload && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4" style={{ color: '#F4B942' }} />
                <p className="font-semibold" style={{ color: '#E8F4F5' }}>Test Payload</p>
              </div>
              <Card className="border-0" style={{ backgroundColor: '#0D3339' }}>
                <CardContent className="p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: '#E8F4F5' }}>
                    {template.test_payload}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Remediation */}
          {template.remediation_guidance && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" style={{ color: '#F4B942' }} />
                <p className="font-semibold" style={{ color: '#E8F4F5' }}>Remediation Guidance</p>
              </div>
              <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
                <CardContent className="p-4">
                  <p className="text-sm" style={{ color: '#E8F4F5' }}>
                    {template.remediation_guidance}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CVE References */}
          {template.cve_references && template.cve_references.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" style={{ color: '#F4B942' }} />
                <p className="font-semibold" style={{ color: '#E8F4F5' }}>CVE References</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {template.cve_references.map((cve, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline" 
                    className="border-0 bg-orange-500/20 text-orange-300 font-mono"
                  >
                    {cve}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" style={{ color: '#F4B942' }} />
                <p className="font-semibold" style={{ color: '#E8F4F5' }}>Tags</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {template.tags.map((tag, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline" 
                    className="border-0 bg-purple-500/20 text-purple-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm" style={{ color: '#7FB8BF' }}>
            <div>
              <span className="font-semibold">False Positive Rate: </span>
              {template.false_positive_rate?.replace(/_/g, ' ')}
            </div>
            <div>
              <span className="font-semibold">Requires Auth: </span>
              {template.requires_authentication ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
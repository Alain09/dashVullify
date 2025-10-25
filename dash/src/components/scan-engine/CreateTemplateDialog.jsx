import React, { useState } from "react";
import { VulnerabilityTemplate } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateTemplateDialog({ open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    template_name: "",
    vulnerability_type: "SQL Injection",
    severity: "medium",
    detection_method: "pattern_match",
    scan_targets: [],
    description: "",
    detection_pattern: "",
    test_payload: "",
    false_positive_rate: "low",
    remediation_guidance: "",
    cve_references: [],
    enabled: true,
    scan_time_estimate: "",
    requires_authentication: false,
    tags: []
  });
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newCve, setNewCve] = useState("");

  const vulnerabilityTypes = [
    "SQL Injection", "XSS", "CSRF", "Authentication Bypass", "Information Disclosure",
    "File Upload", "Path Traversal", "Command Injection", "XXE", "SSRF",
    "Insecure Deserialization", "Broken Access Control", "Security Misconfiguration",
    "Sensitive Data Exposure", "Missing Security Headers", "Weak Cryptography", "Other"
  ];

  const scanTargetOptions = [
    "web_application", "api", "network", "cloud", "mobile", "infrastructure"
  ];

  const handleTargetToggle = (target) => {
    setFormData(prev => ({
      ...prev,
      scan_targets: prev.scan_targets.includes(target)
        ? prev.scan_targets.filter(t => t !== target)
        : [...prev.scan_targets, target]
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCve = () => {
    if (newCve.trim() && !formData.cve_references.includes(newCve.trim())) {
      setFormData(prev => ({
        ...prev,
        cve_references: [...prev.cve_references, newCve.trim()]
      }));
      setNewCve("");
    }
  };

  const handleRemoveCve = (cveToRemove) => {
    setFormData(prev => ({
      ...prev,
      cve_references: prev.cve_references.filter(cve => cve !== cveToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await VulnerabilityTemplate.create(formData);
      
      // Reset form
      setFormData({
        template_name: "",
        vulnerability_type: "SQL Injection",
        severity: "medium",
        detection_method: "pattern_match",
        scan_targets: [],
        description: "",
        detection_pattern: "",
        test_payload: "",
        false_positive_rate: "low",
        remediation_guidance: "",
        cve_references: [],
        enabled: true,
        scan_time_estimate: "",
        requires_authentication: false,
        tags: []
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Error creating template. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#176B7A' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#E8F4F5' }}>Create Vulnerability Template</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Basic Information
            </h3>
            
            <div>
              <Label style={{ color: '#A3CED1' }}>Template Name *</Label>
              <Input
                required
                value={formData.template_name}
                onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                placeholder="SQL Injection Detection - Login Form"
                className="mt-2 border-0"
                style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#A3CED1' }}>Vulnerability Type *</Label>
                <Select
                  value={formData.vulnerability_type}
                  onValueChange={(value) => setFormData({...formData, vulnerability_type: value})}
                >
                  <SelectTrigger 
                    className="mt-2 border-0"
                    style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vulnerabilityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label style={{ color: '#A3CED1' }}>Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({...formData, severity: value})}
                >
                  <SelectTrigger 
                    className="mt-2 border-0"
                    style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label style={{ color: '#A3CED1' }}>Description *</Label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this template detects..."
                rows={3}
                className="mt-2 border-0"
                style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
              />
            </div>
          </div>

          {/* Detection Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Detection Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#A3CED1' }}>Detection Method</Label>
                <Select
                  value={formData.detection_method}
                  onValueChange={(value) => setFormData({...formData, detection_method: value})}
                >
                  <SelectTrigger 
                    className="mt-2 border-0"
                    style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pattern_match">Pattern Match</SelectItem>
                    <SelectItem value="response_analysis">Response Analysis</SelectItem>
                    <SelectItem value="behavior_analysis">Behavior Analysis</SelectItem>
                    <SelectItem value="static_analysis">Static Analysis</SelectItem>
                    <SelectItem value="dynamic_analysis">Dynamic Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label style={{ color: '#A3CED1' }}>False Positive Rate</Label>
                <Select
                  value={formData.false_positive_rate}
                  onValueChange={(value) => setFormData({...formData, false_positive_rate: value})}
                >
                  <SelectTrigger 
                    className="mt-2 border-0"
                    style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_low">Very Low</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label style={{ color: '#A3CED1' }}>Scan Targets</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {scanTargetOptions.map((target) => (
                  <div key={target} className="flex items-center space-x-2">
                    <Checkbox
                      id={target}
                      checked={formData.scan_targets.includes(target)}
                      onCheckedChange={() => handleTargetToggle(target)}
                    />
                    <label
                      htmlFor={target}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      style={{ color: '#E8F4F5' }}
                    >
                      {target.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label style={{ color: '#A3CED1' }}>Detection Pattern</Label>
              <Textarea
                value={formData.detection_pattern}
                onChange={(e) => setFormData({...formData, detection_pattern: e.target.value})}
                placeholder="' OR '1'='1' -- , admin'-- , '; DROP TABLE users--"
                rows={2}
                className="mt-2 border-0 font-mono text-sm"
                style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
              />
            </div>

            <div>
              <Label style={{ color: '#A3CED1' }}>Test Payload</Label>
              <Textarea
                value={formData.test_payload}
                onChange={(e) => setFormData({...formData, test_payload: e.target.value})}
                placeholder="username=admin' OR '1'='1'-- &password=anything"
                rows={2}
                className="mt-2 border-0 font-mono text-sm"
                style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#A3CED1' }}>Scan Time Estimate</Label>
                <Input
                  value={formData.scan_time_estimate}
                  onChange={(e) => setFormData({...formData, scan_time_estimate: e.target.value})}
                  placeholder="5 seconds"
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_auth"
                    checked={formData.requires_authentication}
                    onCheckedChange={(checked) => setFormData({...formData, requires_authentication: checked})}
                  />
                  <label
                    htmlFor="requires_auth"
                    className="text-sm font-medium leading-none"
                    style={{ color: '#E8F4F5' }}
                  >
                    Requires Authentication
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Remediation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Remediation
            </h3>

            <div>
              <Label style={{ color: '#A3CED1' }}>Remediation Guidance</Label>
              <Textarea
                value={formData.remediation_guidance}
                onChange={(e) => setFormData({...formData, remediation_guidance: e.target.value})}
                placeholder="How to fix vulnerabilities detected by this template..."
                rows={4}
                className="mt-2 border-0"
                style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
              />
            </div>
          </div>

          {/* Tags and CVEs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Additional Information
            </h3>

            <div>
              <Label style={{ color: '#A3CED1' }}>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag..."
                  className="border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {formData.tags.map((tag, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline" 
                      className="border-0 bg-purple-500/20 text-purple-300"
                    >
                      {tag}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label style={{ color: '#A3CED1' }}>CVE References</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newCve}
                  onChange={(e) => setNewCve(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCve())}
                  placeholder="CVE-2024-12345"
                  className="border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
                <Button
                  type="button"
                  onClick={handleAddCve}
                  style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.cve_references.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {formData.cve_references.map((cve, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline" 
                      className="border-0 bg-orange-500/20 text-orange-300 font-mono"
                    >
                      {cve}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => handleRemoveCve(cve)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#1E8A9C]"
              style={{ color: '#E8F4F5' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
            >
              {saving ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
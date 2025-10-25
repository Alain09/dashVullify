import React, { useState } from "react";
import { Customer } from "@/api/entities";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Tag } from "lucide-react";

export default function AddCustomerDialog({ open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    company_name: "",
    status: "active",
    plan: "Professional",
    tags: [],
    contract_value: "",
    renewal_date: "",
    main_contact_name: "",
    main_contact_email: "",
    main_contact_job_title: "",
    registration_goal: "",
    scan_scope: [],
    vulnerabilities_count: 0,
    critical_vulnerabilities: 0,
    resolved_vulnerabilities: 0
  });
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");

  const registrationGoals = [
    "Show a third-party that I'm secure",
    "Solve compliance requirements",
    "Monitor my attack surface",
    "Improve cyber security posture",
    "Just a one-off vulnerability scan"
  ];

  const scanScopes = [
    "Internet-exposed attack surface",
    "Cloud systems and accounts",
    "Web applications and APIs",
    "Whole organisation inside and out",
    "Internal laptops and endpoints"
  ];

  const handleScopeToggle = (scope) => {
    setFormData(prev => ({
      ...prev,
      scan_scope: prev.scan_scope.includes(scope)
        ? prev.scan_scope.filter(s => s !== scope)
        : [...prev.scan_scope, scope]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        contract_value: formData.contract_value ? parseFloat(formData.contract_value) : undefined,
      };
      
      // Remove empty strings
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === "") {
          delete dataToSave[key];
        }
      });

      await Customer.create(dataToSave);
      
      // Reset form
      setFormData({
        company_name: "",
        status: "active",
        plan: "Professional",
        tags: [],
        contract_value: "",
        renewal_date: "",
        main_contact_name: "",
        main_contact_email: "",
        main_contact_job_title: "",
        registration_goal: "",
        scan_scope: [],
        vulnerabilities_count: 0,
        critical_vulnerabilities: 0,
        resolved_vulnerabilities: 0
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Error creating customer. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#176B7A' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#E8F4F5' }}>Add New Customer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Company Information
            </h3>
            
            <div>
              <Label style={{ color: '#A3CED1' }}>Company Name *</Label>
              <Input
                required
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                placeholder="Acme Corporation"
                className="mt-2 border-0"
                style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#A3CED1' }}>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger 
                    className="mt-2 border-0" 
                    style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label style={{ color: '#A3CED1' }}>Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => setFormData({...formData, plan: value})}
                >
                  <SelectTrigger 
                    className="mt-2 border-0" 
                    style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#A3CED1' }}>Annual Contract Value ($)</Label>
                <Input
                  type="number"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({...formData, contract_value: e.target.value})}
                  placeholder="12000"
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>

              <div>
                <Label style={{ color: '#A3CED1' }}>Renewal Date</Label>
                <Input
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({...formData, renewal_date: e.target.value})}
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Tags
            </h3>
            
            <div>
              <Label style={{ color: '#A3CED1' }}>Add Tags (e.g., High Priority, VIP, Tech Sector)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Type tag name and press Enter"
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
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-0 bg-purple-500/20 text-purple-300 pr-1"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:bg-purple-500/30 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Main Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Main Contact
            </h3>
            
            <div>
              <Label style={{ color: '#A3CED1' }}>Full Name</Label>
              <Input
                value={formData.main_contact_name}
                onChange={(e) => setFormData({...formData, main_contact_name: e.target.value})}
                placeholder="John Smith"
                className="mt-2 border-0"
                style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#A3CED1' }}>Email</Label>
                <Input
                  type="email"
                  value={formData.main_contact_email}
                  onChange={(e) => setFormData({...formData, main_contact_email: e.target.value})}
                  placeholder="john@company.com"
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>

              <div>
                <Label style={{ color: '#A3CED1' }}>Job Title</Label>
                <Input
                  value={formData.main_contact_job_title}
                  onChange={(e) => setFormData({...formData, main_contact_job_title: e.target.value})}
                  placeholder="CTO"
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>
            </div>
          </div>

          {/* Registration Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Registration Preferences
            </h3>
            
            <div>
              <Label style={{ color: '#A3CED1' }}>What is your goal?</Label>
              <Select
                value={formData.registration_goal}
                onValueChange={(value) => setFormData({...formData, registration_goal: value})}
              >
                <SelectTrigger 
                  className="mt-2 border-0" 
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                >
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {registrationGoals.map((goal) => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label style={{ color: '#A3CED1' }}>What are you hoping to include?</Label>
              <div className="mt-2 space-y-2">
                {scanScopes.map((scope) => (
                  <div
                    key={scope}
                    onClick={() => handleScopeToggle(scope)}
                    className="p-3 rounded-lg border cursor-pointer transition-all hover:bg-[#1E8A9C]"
                    style={{
                      backgroundColor: formData.scan_scope.includes(scope) ? '#1E8A9C' : 'transparent',
                      borderColor: formData.scan_scope.includes(scope) ? '#F4B942' : '#1E8A9C',
                      color: '#E8F4F5'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{scope}</span>
                      {formData.scan_scope.includes(scope) && (
                        <Badge className="bg-[#F4B942] text-[#0A4A52]">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
              disabled={saving || !formData.company_name}
              style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
            >
              {saving ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
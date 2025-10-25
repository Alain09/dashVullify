import React, { useState, useEffect } from "react";
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

export default function EditCustomerDialog({ open, onOpenChange, customer, onSuccess }) {
  const [formData, setFormData] = useState({
    company_name: "",
    status: "active",
    plan: "Professional",
    tags: [],
    contract_value: "",
    amount_spent_to_date: "",
    renewal_date: ""
  });
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (customer) {
      setFormData({
        company_name: customer.company_name || "",
        status: customer.status || "active",
        plan: customer.plan || "Professional",
        tags: customer.tags || [],
        contract_value: customer.contract_value || "",
        amount_spent_to_date: customer.amount_spent_to_date || "",
        renewal_date: customer.renewal_date || ""
      });
    }
  }, [customer]);

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
        amount_spent_to_date: formData.amount_spent_to_date ? parseFloat(formData.amount_spent_to_date) : undefined,
      };
      
      // Remove empty strings
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === "") {
          delete dataToSave[key];
        }
      });

      await Customer.update(customer.id, dataToSave);
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Error updating customer. Please try again.");
    }
    setSaving(false);
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#176B7A' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#E8F4F5' }}>Edit Customer</DialogTitle>
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
                    <SelectItem value="Essential">Essential</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
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
                <Label style={{ color: '#A3CED1' }}>Amount Spent to Date ($)</Label>
                <Input
                  type="number"
                  value={formData.amount_spent_to_date}
                  onChange={(e) => setFormData({...formData, amount_spent_to_date: e.target.value})}
                  placeholder="3000"
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>
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

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
              Tags
            </h3>
            
            <div>
              <Label style={{ color: '#A3CED1' }}>Add Tags</Label>
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
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
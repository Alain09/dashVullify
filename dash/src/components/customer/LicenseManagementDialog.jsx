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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Globe, Cloud } from "lucide-react";

export default function LicenseManagementDialog({ open, onOpenChange, customer, onSuccess }) {
  const [licenses, setLicenses] = useState({
    internal_infrastructure_scan: customer?.licenses?.internal_infrastructure_scan || 0,
    internal_monitoring_assets: customer?.licenses?.internal_monitoring_assets || 0,
    external_infrastructure_scan: customer?.licenses?.external_infrastructure_scan || 0,
    web_app_scan: customer?.licenses?.web_app_scan || 0,
    cloud_assets: customer?.licenses?.cloud_assets || 0
  });
  const [saving, setSaving] = useState(false);

  const licenseTypes = {
    infrastructure: [
      {
        key: "internal_infrastructure_scan",
        name: "Internal Infrastructure Scan",
        basePrice: 175,
        icon: Server
      },
      {
        key: "internal_monitoring_assets",
        name: "Internal Monitoring assets",
        basePrice: 20,
        icon: Server
      },
      {
        key: "external_infrastructure_scan",
        name: "External Infrastructure Scan",
        basePrice: 175,
        icon: Server
      }
    ],
    applicative: [
      {
        key: "web_app_scan",
        name: "Web app scan",
        basePrice: 0,
        icon: Globe
      }
    ],
    cloud: [
      {
        key: "cloud_assets",
        name: "Cloud assets",
        basePrice: 30,
        icon: Cloud
      }
    ]
  };

  const calculateTotal = (basePrice, count) => {
    return basePrice * count;
  };

  const calculateMonthlyTotal = () => {
    let total = 0;
    Object.keys(licenseTypes).forEach(category => {
      licenseTypes[category].forEach(license => {
        total += calculateTotal(license.basePrice, licenses[license.key]);
      });
    });
    return total;
  };

  const handleLicenseChange = (key, value) => {
    const numValue = parseInt(value) || 0;
    setLicenses({
      ...licenses,
      [key]: numValue >= 0 ? numValue : 0
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Customer.update(customer.id, {
        licenses: licenses
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating licenses:", error);
      alert("Error updating licenses. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#176B7A' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#E8F4F5' }}>Manage Licenses</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Infrastructure */}
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
            <CardHeader className="border-b" style={{ borderColor: '#176B7A' }}>
              <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                >
                  <Server className="w-5 h-5" style={{ color: '#F4B942' }} />
                </div>
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {licenseTypes.infrastructure.map((license) => (
                <div key={license.key}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                        {license.name}
                      </p>
                      <p className="text-sm" style={{ color: '#7FB8BF' }}>
                        ${license.basePrice}/month
                      </p>
                    </div>
                    <p className="font-bold text-lg" style={{ color: '#F4B942' }}>
                      ${calculateTotal(license.basePrice, licenses[license.key])}/month
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>Number of licenses</p>
                    <Input
                      type="number"
                      min="0"
                      value={licenses[license.key]}
                      onChange={(e) => handleLicenseChange(license.key, e.target.value)}
                      className="border-0"
                      style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
                    />
                    <p className="text-xs mt-2" style={{ color: '#7FB8BF' }}>
                      Base price (${license.basePrice} × {licenses[license.key]} licenses)
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Applicative & Cloud */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
              <CardHeader className="border-b" style={{ borderColor: '#176B7A' }}>
                <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                  >
                    <Globe className="w-5 h-5" style={{ color: '#F4B942' }} />
                  </div>
                  Applicative
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {licenseTypes.applicative.map((license) => (
                  <div key={license.key}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                          {license.name}
                        </p>
                        <p className="text-sm" style={{ color: '#7FB8BF' }}>
                          ${license.basePrice}/month
                        </p>
                      </div>
                      <p className="font-bold text-lg" style={{ color: '#F4B942' }}>
                        ${calculateTotal(license.basePrice, licenses[license.key])}/month
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>Number of licenses</p>
                      <Input
                        type="number"
                        min="0"
                        value={licenses[license.key]}
                        onChange={(e) => handleLicenseChange(license.key, e.target.value)}
                        className="border-0"
                        style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
                      />
                      <p className="text-xs mt-2" style={{ color: '#7FB8BF' }}>
                        Base price ({licenses[license.key]} licenses)
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
              <CardHeader className="border-b" style={{ borderColor: '#176B7A' }}>
                <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                  >
                    <Cloud className="w-5 h-5" style={{ color: '#F4B942' }} />
                  </div>
                  Cloud
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {licenseTypes.cloud.map((license) => (
                  <div key={license.key}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                          {license.name}
                        </p>
                        <p className="text-sm" style={{ color: '#7FB8BF' }}>
                          ${license.basePrice}/month
                        </p>
                      </div>
                      <p className="font-bold text-lg" style={{ color: '#F4B942' }}>
                        ${calculateTotal(license.basePrice, licenses[license.key])}/month
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>Number of licenses</p>
                      <Input
                        type="number"
                        min="0"
                        value={licenses[license.key]}
                        onChange={(e) => handleLicenseChange(license.key, e.target.value)}
                        className="border-0"
                        style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
                      />
                      <p className="text-xs mt-2" style={{ color: '#7FB8BF' }}>
                        Base price (${license.basePrice} × {licenses[license.key]} licenses)
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Total */}
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold" style={{ color: '#E8F4F5' }}>
                Total Monthly Cost
              </p>
              <p className="text-3xl font-bold" style={{ color: '#4CAF50' }}>
                ${calculateMonthlyTotal()}/month
              </p>
            </div>
          </CardContent>
        </Card>

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
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
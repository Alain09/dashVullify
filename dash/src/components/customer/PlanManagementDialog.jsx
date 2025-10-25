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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, Plus, Minus, Crown, Zap, Rocket } from "lucide-react";
import { differenceInDays, addDays, format } from "date-fns";

export default function PlanManagementDialog({ open, onOpenChange, customer, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState(customer?.plan || "Pro");
  const [isTrial, setIsTrial] = useState(customer?.is_trial || false);
  const [trialEndDate, setTrialEndDate] = useState(
    customer?.trial_end_date || format(addDays(new Date(), 14), "yyyy-MM-dd")
  );
  const [saving, setSaving] = useState(false);

  const plans = [
    { 
      name: "Essential", 
      icon: Zap, 
      color: "#4CAF50",
      features: ["Basic scanning", "Email alerts", "Monthly reports"]
    },
    { 
      name: "Pro", 
      icon: Crown, 
      color: "#F4B942",
      features: ["Advanced scanning", "Real-time alerts", "Weekly reports", "API access"]
    },
    { 
      name: "Enterprise", 
      icon: Rocket, 
      color: "#F49342",
      features: ["Full platform access", "24/7 support", "Custom integrations", "Dedicated manager"]
    }
  ];

  const daysLeft = customer?.trial_end_date 
    ? differenceInDays(new Date(customer.trial_end_date), new Date())
    : 0;

  const handleAddDays = (days) => {
    const currentDate = new Date(trialEndDate);
    const newDate = addDays(currentDate, days);
    setTrialEndDate(format(newDate, "yyyy-MM-dd"));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Customer.update(customer.id, {
        plan: selectedPlan,
        is_trial: selectedPlan === "Pro" ? isTrial : false,
        trial_end_date: (selectedPlan === "Pro" && isTrial) ? trialEndDate : undefined
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("Error updating plan. Please try again.");
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
          <DialogTitle style={{ color: '#E8F4F5' }}>Manage Plan & Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: '#E8F4F5' }}>Select Plan</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedPlan === plan.name ? 'shadow-lg' : ''
                  }`}
                  style={{
                    backgroundColor: selectedPlan === plan.name ? '#1E8A9C' : 'transparent',
                    borderColor: selectedPlan === plan.name ? plan.color : '#1E8A9C'
                  }}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${plan.color}20` }}
                    >
                      <plan.icon className="w-6 h-6" style={{ color: plan.color }} />
                    </div>
                    <h4 className="font-bold text-lg mb-2" style={{ color: '#E8F4F5' }}>
                      {plan.name}
                    </h4>
                    <ul className="space-y-2 text-sm" style={{ color: '#A3CED1' }}>
                      {plan.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trial Settings (only for Pro) */}
          {selectedPlan === "Pro" && (
            <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold" style={{ color: '#E8F4F5' }}>
                      Trial Mode
                    </h3>
                    <p className="text-sm" style={{ color: '#A3CED1' }}>
                      Enable trial period for this Pro plan
                    </p>
                  </div>
                  <Switch
                    checked={isTrial}
                    onCheckedChange={setIsTrial}
                  />
                </div>

                {isTrial && (
                  <div className="space-y-4 pt-4 border-t" style={{ borderColor: '#176B7A' }}>
                    {customer?.is_trial && customer?.trial_end_date && (
                      <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#176B7A' }}>
                        <Calendar className="w-5 h-5" style={{ color: '#F4B942' }} />
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                            Trial ends in {daysLeft > 0 ? daysLeft : 0} days
                          </p>
                          <p className="text-sm" style={{ color: '#A3CED1' }}>
                            {format(new Date(customer.trial_end_date), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label style={{ color: '#A3CED1' }}>Trial End Date</Label>
                      <Input
                        type="date"
                        value={trialEndDate}
                        onChange={(e) => setTrialEndDate(e.target.value)}
                        className="mt-2 border-0"
                        style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
                      />
                    </div>

                    <div>
                      <Label style={{ color: '#A3CED1' }}>Quick Add Days</Label>
                      <div className="flex gap-2 mt-2">
                        {[7, 14, 30].map((days) => (
                          <Button
                            key={days}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddDays(days)}
                            className="border-[#F4B942]"
                            style={{ color: '#F4B942' }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {days} days
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
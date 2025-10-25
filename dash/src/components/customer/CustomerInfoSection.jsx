import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Briefcase,
  Target,
  Layers,
  Calendar,
  DollarSign,
  Edit,
  Settings,
  Clock
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

import PlanManagementDialog from "./PlanManagementDialog";
import LicenseManagementDialog from "./LicenseManagementDialog";

export default function CustomerInfoSection({ customer, mainContact, onRefresh }) {
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);

  const daysLeft = customer?.is_trial && customer?.trial_end_date
    ? differenceInDays(new Date(customer.trial_end_date), new Date())
    : 0;

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
              <Building2 className="w-5 h-5" />
              Registration Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Company Name</p>
              <p className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
                {customer.company_name}
              </p>
            </div>

            {mainContact && (
              <>
                <div>
                  <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Main Contact</p>
                  <div className="space-y-1">
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {mainContact.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#A3CED1' }}>
                      <Mail className="w-4 h-4" />
                      {mainContact.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#A3CED1' }}>
                      <Briefcase className="w-4 h-4" />
                      {mainContact.job_title || 'N/A'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {customer.registration_goal && (
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Registration Goal</p>
                <Badge 
                  variant="outline"
                  className="border-0 bg-blue-500/20 text-blue-300 text-sm"
                >
                  <Target className="w-3 h-3 mr-1" />
                  {customer.registration_goal}
                </Badge>
              </div>
            )}

            {customer.scan_scope && customer.scan_scope.length > 0 && (
              <div>
                <p className="text-sm mb-3" style={{ color: '#7FB8BF' }}>Scan Scope</p>
                <div className="flex flex-wrap gap-2">
                  {customer.scan_scope.map((scope, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="border-0 bg-purple-500/20 text-purple-300 text-xs"
                    >
                      <Layers className="w-3 h-3 mr-1" />
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle className="flex items-center justify-between" style={{ color: '#E8F4F5' }}>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Plan & Billing
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlanDialog(true)}
                  className="border-[#F4B942]"
                  style={{ color: '#F4B942' }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit Plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLicenseDialog(true)}
                  className="border-[#1E8A9C]"
                  style={{ color: '#1E8A9C' }}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Licenses
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Plan Type</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300 text-base">
                    {customer.plan}
                  </Badge>
                  {customer.is_trial && (
                    <Badge variant="outline" className="border-0 bg-yellow-500/20 text-yellow-300">
                      Trial
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Status</p>
                <Badge 
                  variant="outline"
                  className={`border-0 text-base ${
                    customer.status === 'active' 
                      ? 'bg-green-500/20 text-green-300' 
                      : customer.status === 'trial'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {customer.status}
                </Badge>
              </div>
            </div>

            {customer.is_trial && customer.trial_end_date && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#1E8A9C' }}>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: daysLeft > 7 ? '#F4B942' : '#F49342' }} />
                  <div>
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      Trial ends in {daysLeft > 0 ? daysLeft : 0} days
                    </p>
                    <p className="text-sm" style={{ color: '#A3CED1' }}>
                      {format(new Date(customer.trial_end_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Annual Contract Value</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" style={{ color: '#4CAF50' }} />
                  <p className="font-bold text-2xl" style={{ color: '#4CAF50' }}>
                    ${(customer.contract_value || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Amount Spent to Date</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" style={{ color: '#F4B942' }} />
                  <p className="font-bold text-2xl" style={{ color: '#F4B942' }}>
                    ${(customer.amount_spent_to_date || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {customer.renewal_date && (
              <div>
                <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Renewal Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#F4B942' }} />
                  <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                    {format(new Date(customer.renewal_date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm mb-2" style={{ color: '#7FB8BF' }}>Customer Since</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#A3CED1' }} />
                <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                  {format(new Date(customer.created_date), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PlanManagementDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        customer={customer}
        onSuccess={onRefresh}
      />

      <LicenseManagementDialog
        open={showLicenseDialog}
        onOpenChange={setShowLicenseDialog}
        customer={customer}
        onSuccess={onRefresh}
      />
    </>
  );
}
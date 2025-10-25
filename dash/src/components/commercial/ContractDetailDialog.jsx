import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  DollarSign,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText,
  Mail,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";

export default function ContractDetailDialog({ open, onOpenChange, contract }) {
  if (!contract) return null;

  const paymentProgress = contract.contract_value > 0
    ? Math.round((contract.amount_spent_to_date / contract.contract_value) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#176B7A' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3" style={{ color: '#E8F4F5' }}>
            <Building2 className="w-6 h-6" style={{ color: '#F4B942' }} />
            {contract.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
              {contract.plan}
            </Badge>
            <Badge 
              variant="outline"
              className={`border-0 ${
                contract.status === 'active' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-gray-500/20 text-gray-300'
              }`}
            >
              {contract.status}
            </Badge>
            {contract.missed_payment && (
              <Badge variant="outline" className="border-0 bg-red-500/20 text-red-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Missed Payment
              </Badge>
            )}
          </div>

          <Separator style={{ backgroundColor: '#1E8A9C' }} />

          {/* Financial Overview */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#E8F4F5' }}>
              <DollarSign className="w-5 h-5" />
              Financial Overview
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
                <CardContent className="p-4">
                  <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>Annual Contract Value</p>
                  <p className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                    ${(contract.contract_value || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
                <CardContent className="p-4">
                  <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>Spent to Date</p>
                  <p className="text-2xl font-bold" style={{ color: '#F4B942' }}>
                    ${(contract.amount_spent_to_date || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0" style={{ backgroundColor: '#1E8A9C' }}>
                <CardContent className="p-4">
                  <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>Remaining</p>
                  <p className="text-2xl font-bold" style={{ color: '#1E8A9C' }}>
                    ${((contract.contract_value || 0) - (contract.amount_spent_to_date || 0)).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: '#A3CED1' }}>Payment Progress</span>
                <span className="text-sm font-semibold" style={{ color: '#E8F4F5' }}>
                  {paymentProgress}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#0D3339' }}>
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${paymentProgress}%`,
                    backgroundColor: paymentProgress >= 100 ? '#4CAF50' : '#F4B942'
                  }}
                />
              </div>
            </div>
          </div>

          <Separator style={{ backgroundColor: '#1E8A9C' }} />

          {/* Contract Details */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#E8F4F5' }}>
              <FileText className="w-5 h-5" />
              Contract Details
            </h3>
            <div className="space-y-3">
              {contract.renewal_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" style={{ color: '#7FB8BF' }} />
                  <div>
                    <p className="text-sm" style={{ color: '#7FB8BF' }}>Renewal Date</p>
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {format(new Date(contract.renewal_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {contract.main_contact_name && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5" style={{ color: '#7FB8BF' }} />
                  <div>
                    <p className="text-sm" style={{ color: '#7FB8BF' }}>Main Contact</p>
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {contract.main_contact_name}
                      {contract.main_contact_job_title && ` - ${contract.main_contact_job_title}`}
                    </p>
                    {contract.main_contact_email && (
                      <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#A3CED1' }}>
                        <Mail className="w-3 h-3" />
                        {contract.main_contact_email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Missed Payment Details */}
          {contract.missed_payment && (
            <>
              <Separator style={{ backgroundColor: '#1E8A9C' }} />
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  Missed Payment Details
                </h3>
                <Card className="border-0" style={{ backgroundColor: '#7f1d1d20' }}>
                  <CardContent className="p-4 space-y-3">
                    {contract.missed_payment_amount && (
                      <div>
                        <p className="text-sm" style={{ color: '#fca5a5' }}>Outstanding Amount</p>
                        <p className="text-2xl font-bold text-red-300">
                          ${contract.missed_payment_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {contract.missed_payment_date && (
                      <div>
                        <p className="text-sm" style={{ color: '#fca5a5' }}>Payment Due Date</p>
                        <p className="font-semibold text-red-300">
                          {format(new Date(contract.missed_payment_date), "MMMM d, yyyy")}
                        </p>
                      </div>
                    )}
                    {contract.payment_notes && (
                      <div>
                        <p className="text-sm mb-2" style={{ color: '#fca5a5' }}>Notes</p>
                        <p className="text-sm" style={{ color: '#fecaca' }}>
                          {contract.payment_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
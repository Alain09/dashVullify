import React, { useState, useEffect } from "react";
import { Customer } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, FileText, Users, AlertCircle, Filter, X } from "lucide-react";
import { format } from "date-fns";

import ContractDetailDialog from "../components/commercial/ContractDetailDialog";

export default function Commercial() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMissedPayments, setShowMissedPayments] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await Customer.list("-created_date");
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
    setLoading(false);
  };

  const handleAddSampleData = async () => {
    try {
      await Customer.bulkCreate([
        {
          company_name: "Acme Corp",
          plan: "Enterprise",
          status: "active",
          contract_value: 48000,
          amount_spent_to_date: 36000,
          renewal_date: "2025-06-15",
          missed_payment: false
        },
        {
          company_name: "TechStart Inc",
          plan: "Professional",
          status: "active",
          contract_value: 12000,
          amount_spent_to_date: 9000,
          renewal_date: "2025-03-20",
          missed_payment: false
        },
        {
          company_name: "Global Systems",
          plan: "Enterprise",
          status: "active",
          contract_value: 96000,
          amount_spent_to_date: 72000,
          renewal_date: "2025-08-10",
          missed_payment: false
        },
        {
          company_name: "DataFlow Ltd",
          plan: "Professional",
          status: "active",
          contract_value: 12000,
          amount_spent_to_date: 4000,
          renewal_date: "2025-02-01",
          missed_payment: true,
          missed_payment_amount: 4000,
          missed_payment_date: "2024-12-15",
          payment_notes: "December payment overdue. Multiple reminder emails sent. Customer cited budget approval delays."
        },
        {
          company_name: "SecureNet",
          plan: "Enterprise",
          status: "active",
          contract_value: 72000,
          amount_spent_to_date: 54000,
          renewal_date: "2025-12-05",
          missed_payment: false
        },
        {
          company_name: "CloudTech Solutions",
          plan: "Essential",
          status: "active",
          contract_value: 8400,
          amount_spent_to_date: 2800,
          renewal_date: "2025-04-22",
          missed_payment: true,
          missed_payment_amount: 2100,
          missed_payment_date: "2024-11-30",
          payment_notes: "November and December payments outstanding. Payment plan being negotiated. Contact: CFO mentioned cash flow issues."
        }
      ]);
      await loadCustomers();
    } catch (error) {
      console.error("Error adding sample data:", error);
      alert("Error adding sample data. Please try again.");
    }
  };

  const filteredCustomers = showMissedPayments
    ? customers.filter(c => c.missed_payment)
    : customers;

  const stats = [
    {
      label: "Monthly Revenue",
      value: `$${Math.round(customers.reduce((sum, c) => sum + (c.contract_value || 0), 0) / 12 / 1000)}K`,
      icon: DollarSign,
      color: "#4CAF50"
    },
    {
      label: "Active Contracts",
      value: customers.filter(c => c.status === "active").length,
      icon: FileText,
      color: "#F4B942"
    },
    {
      label: "Missed Payments",
      value: customers.filter(c => c.missed_payment).length,
      icon: AlertCircle,
      color: customers.filter(c => c.missed_payment).length > 0 ? "#F49342" : "#4CAF50"
    },
    {
      label: "Total ARR",
      value: `$${Math.round(customers.reduce((sum, c) => sum + (c.contract_value || 0), 0) / 1000)}K`,
      icon: TrendingUp,
      color: "#1E8A9C"
    }
  ];

  const handleContractClick = (customer) => {
    setSelectedContract(customer);
    setShowDetailDialog(true);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
              Commercial Overview
            </h1>
            <p style={{ color: '#7FB8BF' }}>
              Track revenue, contracts, and business metrics
            </p>
          </div>

          {customers.length === 0 && (
            <Button
              onClick={handleAddSampleData}
              style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
            >
              Add Sample Data
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm" style={{ color: '#A3CED1' }}>{stat.label}</p>
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(244, 185, 66, 0.15)' }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#E8F4F5' }}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Section */}
        {customers.filter(c => c.missed_payment).length > 0 && (
          <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" style={{ color: '#7FB8BF' }} />
                  <span className="text-sm font-medium" style={{ color: '#A3CED1' }}>Filters:</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMissedPayments(!showMissedPayments)}
                  className={`border-0 ${
                    showMissedPayments
                      ? 'bg-[#F49342] text-[#0A4A52]'
                      : 'bg-orange-500/20 text-orange-300'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Missed Payments Only
                </Button>
                {showMissedPayments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMissedPayments(false)}
                    style={{ color: '#7FB8BF' }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle style={{ color: '#E8F4F5' }}>
              Active Contracts ({filteredCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
                <p style={{ color: '#E8F4F5' }}>Loading contracts...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
                <p style={{ color: '#E8F4F5' }}>
                  {showMissedPayments ? "No missed payments" : "No contracts yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
                {filteredCustomers.map((customer, index) => (
                  <div 
                    key={index} 
                    className="p-6 hover:bg-[#1E8A9C] transition-colors cursor-pointer"
                    onClick={() => handleContractClick(customer)}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2" style={{ color: '#E8F4F5' }}>
                          {customer.company_name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
                            {customer.plan}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className="border-0 bg-green-500/20 text-green-300"
                          >
                            {customer.status}
                          </Badge>
                          {customer.missed_payment && (
                            <Badge 
                              variant="outline"
                              className="border-0 bg-red-500/20 text-red-300"
                            >
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Missed Payment
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-8 items-center">
                        <div>
                          <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Annual Value</p>
                          <p className="text-2xl font-bold" style={{ color: '#4CAF50' }}>
                            ${(customer.contract_value || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Spent to Date</p>
                          <p className="text-xl font-bold" style={{ color: '#F4B942' }}>
                            ${(customer.amount_spent_to_date || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Renewal Date</p>
                          <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                            {customer.renewal_date ? format(new Date(customer.renewal_date), "MMM d, yyyy") : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ContractDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        contract={selectedContract}
      />
    </div>
  );
}
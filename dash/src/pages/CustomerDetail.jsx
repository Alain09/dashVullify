
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Customer } from "@/api/entities";
import { CustomerUser } from "@/api/entities";
import { EmailCommunication } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Users,
  Target,
  Shield,
  ArrowLeft,
  UserCog,
  Send,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CustomerInfoSection from "../components/customer/CustomerInfoSection";
import UsersSection from "../components/customer/UsersSection";
import EmailCommunicationsSection from "../components/customer/EmailCommunicationsSection";

export default function CustomerDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const customerId = urlParams.get("id");

  const [customer, setCustomer] = useState(null);
  const [users, setUsers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const customerData = await Customer.get(customerId);
      setCustomer(customerData);

      const usersData = await CustomerUser.filter({ customer_id: customerId });
      setUsers(usersData);

      const emailsData = await EmailCommunication.filter({ customer_id: customerId }, "-sent_date");
      setEmails(emailsData);
    } catch (error) {
      console.error("Error loading customer data:", error);
    }
    setLoading(false);
  };

  const handleAddSampleData = async () => {
    try {
      // Add sample users
      await CustomerUser.bulkCreate([
        {
          customer_id: customerId,
          name: customer.main_contact_name || "John Smith",
          email: customer.main_contact_email || "john.smith@example.com",
          job_title: customer.main_contact_job_title || "Chief Technology Officer",
          role: "admin",
          is_main_contact: true,
          email_verified: true,
          last_login: new Date().toISOString(),
          phone: "+1 (555) 123-4567",
          department: "Technology"
        },
        {
          customer_id: customerId,
          name: "Emily Rodriguez",
          email: "emily.rodriguez@" + (customer.main_contact_email?.split('@')[1] || "example.com"),
          job_title: "Security Engineer",
          role: "user",
          is_main_contact: false,
          email_verified: true,
          last_login: new Date(Date.now() - 86400000).toISOString(),
          phone: "+1 (555) 123-4568",
          department: "Security Operations"
        },
        {
          customer_id: customerId,
          name: "David Park",
          email: "david.park@" + (customer.main_contact_email?.split('@')[1] || "example.com"),
          job_title: "DevOps Lead",
          role: "user",
          is_main_contact: false,
          email_verified: false,
          last_login: new Date(Date.now() - 432000000).toISOString(),
          department: "Infrastructure"
        }
      ]);

      // Add sample emails
      await EmailCommunication.bulkCreate([
        {
          customer_id: customerId,
          recipient_email: customer.main_contact_email || "contact@example.com",
          subject: "Critical Vulnerability Detected - Immediate Action Required",
          body: "We have detected critical vulnerabilities in your infrastructure that require immediate attention. Please review the attached scan report and take necessary actions.",
          sent_date: new Date().toISOString(),
          status: "opened",
          email_type: "vulnerability_alert"
        },
        {
          customer_id: customerId,
          recipient_email: customer.main_contact_email || "contact@example.com",
          subject: "Weekly Vulnerability Scan Report",
          body: "Your weekly vulnerability scan has been completed. View the full report in your dashboard.",
          sent_date: new Date(Date.now() - 172800000).toISOString(),
          status: "delivered",
          email_type: "scan_report"
        },
        {
          customer_id: customerId,
          recipient_email: customer.main_contact_email || "contact@example.com",
          subject: "Welcome to Vulify Security Platform",
          body: "Thank you for choosing Vulify! Here's everything you need to get started with your vulnerability management journey.",
          sent_date: new Date(Date.now() - 432000000).toISOString(),
          status: "opened",
          email_type: "onboarding"
        }
      ]);

      await loadCustomerData();
    } catch (error) {
      console.error("Error adding sample data:", error);
      alert("Error adding sample data. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A4A52' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
          <p style={{ color: '#E8F4F5' }}>Loading customer data...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A4A52' }}>
        <div className="text-center">
          <p style={{ color: '#E8F4F5' }}>Customer not found</p>
          <Button
            onClick={() => navigate(createPageUrl("Customers"))}
            className="mt-4"
            style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
          >
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const mainContact = users.find(u => u.is_main_contact) || users[0];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Customers"))}
            className="border-[#176B7A]"
            style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
              {customer.company_name}
            </h1>
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline"
                className={`border-0 ${
                  customer.status === 'active' 
                    ? 'bg-green-500/20 text-green-300' 
                    : customer.status === 'trial'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}
              >
                {customer.status}
              </Badge>
              <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
                {customer.plan}
              </Badge>
            </div>
          </div>
          
          {users.length === 0 && (
            <Button
              onClick={handleAddSampleData}
              style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sample Data
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm" style={{ color: '#A3CED1' }}>Critical Issues</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#E8F4F5' }}>
                {customer.critical_vulnerabilities || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-orange-400" />
                <span className="text-sm" style={{ color: '#A3CED1' }}>Total Vulnerabilities</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#E8F4F5' }}>
                {customer.vulnerabilities_count || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm" style={{ color: '#A3CED1' }}>Resolved</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#E8F4F5' }}>
                {customer.resolved_vulnerabilities || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList 
            className="mb-6 p-1"
            style={{ backgroundColor: '#176B7A' }}
          >
            <TabsTrigger 
              value="info"
              className="data-[state=active]:bg-[#F4B942] data-[state=active]:text-[#0A4A52]"
              style={{ color: '#E8F4F5' }}
            >
              Customer Info
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-[#F4B942] data-[state=active]:text-[#0A4A52]"
              style={{ color: '#E8F4F5' }}
            >
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger 
              value="emails"
              className="data-[state=active]:bg-[#F4B942] data-[state=active]:text-[#0A4A52]"
              style={{ color: '#E8F4F5' }}
            >
              Communications ({emails.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <CustomerInfoSection customer={customer} mainContact={mainContact} onRefresh={loadCustomerData} />
          </TabsContent>

          <TabsContent value="users">
            <UsersSection users={users} customerId={customerId} onRefresh={loadCustomerData} />
          </TabsContent>

          <TabsContent value="emails">
            <EmailCommunicationsSection emails={emails} customerId={customerId} onRefresh={loadCustomerData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

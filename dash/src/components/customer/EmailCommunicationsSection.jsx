import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailCommunication } from "@/api/entities";
import {
  Mail,
  Send,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus
} from "lucide-react";
import { format } from "date-fns";

export default function EmailCommunicationsSection({ emails, customerId, onRefresh }) {
  const [showNewEmail, setShowNewEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [newEmail, setNewEmail] = useState({
    recipient_email: "",
    subject: "",
    body: "",
    email_type: "general"
  });

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await EmailCommunication.create({
        ...newEmail,
        customer_id: customerId,
        sent_date: new Date().toISOString(),
        status: "sent"
      });
      setShowNewEmail(false);
      setNewEmail({
        recipient_email: "",
        subject: "",
        body: "",
        email_type: "general"
      });
      onRefresh();
    } catch (error) {
      console.error("Error sending email:", error);
    }
    setSending(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-300';
      case 'opened': return 'bg-blue-500/20 text-blue-300';
      case 'bounced': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'vulnerability_alert': return 'bg-red-500/20 text-red-300';
      case 'scan_report': return 'bg-blue-500/20 text-blue-300';
      case 'onboarding': return 'bg-green-500/20 text-green-300';
      case 'support': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
        <CardHeader className="flex flex-row items-center justify-between border-b" style={{ borderColor: '#1E8A9C' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
            <Mail className="w-5 h-5" />
            Email History
          </CardTitle>
          <Button
            onClick={() => setShowNewEmail(!showNewEmail)}
            style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </CardHeader>

        {showNewEmail && (
          <CardContent className="p-6 border-b" style={{ borderColor: '#1E8A9C' }}>
            <div className="space-y-4">
              <div>
                <Label style={{ color: '#A3CED1' }}>Recipient Email</Label>
                <Input
                  type="email"
                  value={newEmail.recipient_email}
                  onChange={(e) => setNewEmail({...newEmail, recipient_email: e.target.value})}
                  placeholder="customer@example.com"
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>

              <div>
                <Label style={{ color: '#A3CED1' }}>Email Type</Label>
                <Select
                  value={newEmail.email_type}
                  onValueChange={(value) => setNewEmail({...newEmail, email_type: value})}
                >
                  <SelectTrigger className="mt-2 border-0" style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="vulnerability_alert">Vulnerability Alert</SelectItem>
                    <SelectItem value="scan_report">Scan Report</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label style={{ color: '#A3CED1' }}>Subject</Label>
                <Input
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                  placeholder="Email subject"
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>

              <div>
                <Label style={{ color: '#A3CED1' }}>Message</Label>
                <Textarea
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({...newEmail, body: e.target.value})}
                  placeholder="Email message..."
                  rows={6}
                  className="mt-2 border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSendEmail}
                  disabled={sending || !newEmail.recipient_email || !newEmail.subject}
                  style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Send Email"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewEmail(false)}
                  className="border-[#1E8A9C]"
                  style={{ color: '#E8F4F5' }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className="p-0">
          {emails.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
              <p style={{ color: '#A3CED1' }}>No email communications yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
              {emails.map((email, index) => (
                <div key={index} className="p-6 hover:bg-[#1E8A9C] transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="outline"
                          className={`border-0 ${getTypeColor(email.email_type)}`}
                        >
                          {email.email_type.replace(/_/g, ' ')}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`border-0 ${getStatusColor(email.status)}`}
                        >
                          {email.status === 'delivered' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {email.status === 'opened' && <Eye className="w-3 h-3 mr-1" />}
                          {email.status === 'bounced' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {email.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1" style={{ color: '#E8F4F5' }}>
                        {email.subject}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>
                        To: {email.recipient_email}
                      </p>
                      <p className="text-sm line-clamp-2" style={{ color: '#7FB8BF' }}>
                        {email.body}
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-sm" style={{ color: '#7FB8BF' }}>
                      <Calendar className="w-4 h-4 mt-0.5" />
                      <span>
                        {format(new Date(email.sent_date || email.created_date), "MMM d, yyyy 'at' HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
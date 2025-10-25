import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, MessageSquare, AlertCircle } from "lucide-react";

export default function Support() {
  const tickets = [
    { id: "#T-1234", customer: "Acme Corp", subject: "Critical vulnerability not updating", priority: "high", status: "open", time: "5 min ago" },
    { id: "#T-1233", customer: "TechStart Inc", subject: "Scan schedule configuration", priority: "medium", status: "in_progress", time: "2 hours ago" },
    { id: "#T-1232", customer: "Global Systems", subject: "Dashboard access issue", priority: "low", status: "open", time: "4 hours ago" },
    { id: "#T-1231", customer: "DataFlow Ltd", subject: "API integration support", priority: "medium", status: "waiting", time: "1 day ago" },
    { id: "#T-1230", customer: "SecureNet", subject: "False positive report", priority: "high", status: "in_progress", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
              Support Tickets
            </h1>
            <p style={{ color: '#7FB8BF' }}>
              Manage customer support requests
            </p>
          </div>
          <Button 
            className="font-semibold"
            style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Open", count: 12, color: "#F49342" },
            { label: "In Progress", count: 8, color: "#F4B942" },
            { label: "Waiting", count: 5, color: "#7FB8BF" },
            { label: "Resolved Today", count: 23, color: "#4CAF50" },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
              <CardContent className="p-6 text-center">
                <p className="text-sm mb-2" style={{ color: '#A3CED1' }}>{stat.label}</p>
                <p className="text-4xl font-bold" style={{ color: stat.color }}>
                  {stat.count}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle style={{ color: '#E8F4F5' }}>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
              {tickets.map((ticket, index) => (
                <div key={index} className="p-6 hover:bg-[#1E8A9C] transition-colors cursor-pointer">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-semibold" style={{ color: '#F4B942' }}>
                          {ticket.id}
                        </span>
                        <Badge 
                          variant="outline"
                          className={`border-0 ${
                            ticket.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {ticket.priority}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`border-0 ${
                            ticket.status === 'open' ? 'bg-orange-500/20 text-orange-300' :
                            ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1" style={{ color: '#E8F4F5' }}>
                        {ticket.subject}
                      </h3>
                      <p className="text-sm" style={{ color: '#A3CED1' }}>
                        {ticket.customer}
                      </p>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: '#7FB8BF' }}>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{ticket.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Mail,
  Server,
  MapPin,
  Globe,
  Clock,
  Target,
  AlertTriangle,
  Activity,
  Calendar,
  ExternalLink
} from "lucide-react";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ScanDetailDialog({ open, onOpenChange, scan, customer }) {
  const navigate = useNavigate();

  if (!scan) return null;

  const getDuration = (startedAt) => {
    if (!startedAt) return "N/A";
    const hours = differenceInHours(new Date(), new Date(startedAt));
    const days = differenceInDays(new Date(), new Date(startedAt));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  const isLongRunning = scan.started_at && 
    differenceInHours(new Date(), new Date(scan.started_at)) >= 24;

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      case 'queued': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleViewCustomer = () => {
    onOpenChange(false);
    navigate(createPageUrl("CustomerDetail") + `?id=${customer.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#176B7A' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3" style={{ color: '#E8F4F5' }}>
            <Activity className="w-6 h-6" style={{ color: '#F4B942' }} />
            Scan Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scan Information */}
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-xl" style={{ color: '#E8F4F5' }}>
                      {scan.scan_name}
                    </h3>
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline"
                        className={`border-0 ${getStatusColor(scan.status)}`}
                      >
                        {scan.status}
                      </Badge>
                      <Badge variant="outline" className="border-0 bg-purple-500/20 text-purple-300">
                        {scan.scan_type}
                      </Badge>
                      {isLongRunning && (
                        <Badge variant="outline" className="border-0 bg-orange-500/20 text-orange-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Long Running
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Duration</p>
                    <p className="text-2xl font-bold" style={{ 
                      color: isLongRunning ? '#F49342' : '#F4B942' 
                    }}>
                      {getDuration(scan.started_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Progress</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold" style={{ color: '#E8F4F5' }}>
                          {scan.progress || 0}%
                        </span>
                      </div>
                      <Progress value={scan.progress || 0} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: '#176B7A' }}>
                  {scan.started_at && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#A3CED1' }}>
                      <Calendar className="w-4 h-4" />
                      <div>
                        <p style={{ color: '#7FB8BF' }}>Started</p>
                        <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                          {format(new Date(scan.started_at), "MMM d, yyyy 'at' HH:mm")}
                        </p>
                      </div>
                    </div>
                  )}

                  {scan.targets_count > 0 && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#A3CED1' }}>
                      <Target className="w-4 h-4" />
                      <div>
                        <p style={{ color: '#7FB8BF' }}>Targets</p>
                        <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                          {scan.targets_count} targets
                        </p>
                      </div>
                    </div>
                  )}

                  {scan.vulnerabilities_found > 0 && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#A3CED1' }}>
                      <AlertTriangle className="w-4 h-4" />
                      <div>
                        <p style={{ color: '#7FB8BF' }}>Vulnerabilities Found</p>
                        <p className="font-semibold text-orange-300">
                          {scan.vulnerabilities_found} issues
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {customer && (
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                    <Building2 className="w-5 h-5" style={{ color: '#F4B942' }} />
                    Customer Information
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewCustomer}
                    className="border-[#F4B942]"
                    style={{ color: '#F4B942' }}
                  >
                    View Customer
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Company Name</p>
                    <p className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
                      {customer.company_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
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

                  {customer.main_contact_email && (
                    <div className="flex items-center gap-2 text-sm pt-2" style={{ color: '#A3CED1' }}>
                      <Mail className="w-4 h-4" />
                      <span>{customer.main_contact_email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Node Information */}
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#1E8A9C' }}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4" style={{ color: '#E8F4F5' }}>
                <Server className="w-5 h-5" style={{ color: '#F4B942' }} />
                Node Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Node Name</p>
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {scan.node_name || "scan-node-01"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {scan.node_location || "US-East (Virginia)"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Node IP Address</p>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold font-mono" style={{ color: '#E8F4F5' }}>
                      {scan.node_ip || "54.123.45.67"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Status</p>
                  <Badge variant="outline" className="border-0 bg-green-500/20 text-green-300">
                    <Activity className="w-3 h-3 mr-1" />
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
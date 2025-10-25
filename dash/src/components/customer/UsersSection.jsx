import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Briefcase,
  Shield,
  Clock,
  Phone,
  Building2,
  Crown,
  UserCog,
  CheckCircle2,
  XCircle,
  Key,
  Send,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { SendEmail } from "@/api/integrations";

export default function UsersSection({ users, customerId, onRefresh }) {
  const [impersonatingUser, setImpersonatingUser] = useState(null);
  const [sendingResetEmail, setSendingResetEmail] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  const handleImpersonate = (user) => {
    setImpersonatingUser(user.email);
    // In a real app, this would trigger actual impersonation logic
    setTimeout(() => {
      setImpersonatingUser(null);
      alert(`Now impersonating ${user.name} (${user.email})\n\nYou can now view the platform as this user would see it.`);
    }, 1500);
  };

  const handleResetPassword = (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to reset the password for ${user.name}?\n\nThis will immediately invalidate their current password.`
    );
    if (confirmed) {
      alert(`Password has been reset for ${user.name}\n\nA temporary password has been generated. You can send them the reset email to set a new password.`);
    }
  };

  const handleSendResetEmail = async (user) => {
    setSendingResetEmail(user.email);
    try {
      await SendEmail({
        from_name: "Vulify Security Platform",
        to: user.email,
        subject: "Password Reset Request",
        body: `Hi ${user.name},\n\nYou have requested to reset your password for your Vulify account.\n\nPlease click the link below to reset your password:\n[Reset Password Link]\n\nThis link will expire in 24 hours.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nVulify Security Team`
      });
      setResetSuccess(user.email);
      setTimeout(() => setResetSuccess(null), 3000);
    } catch (error) {
      alert("Failed to send password reset email. Please try again.");
    }
    setSendingResetEmail(null);
  };

  const mainUser = users.find(u => u.is_main_contact);
  const otherUsers = users.filter(u => !u.is_main_contact);

  return (
    <div className="space-y-6">
      {mainUser && (
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
              <Crown className="w-5 h-5 text-yellow-400" />
              Main Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Name</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {mainUser.name}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {mainUser.email}
                    </p>
                    {mainUser.email_verified ? (
                      <Badge variant="outline" className="border-0 bg-green-500/20 text-green-300 ml-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-0 bg-red-500/20 text-red-300 ml-2">
                        <XCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Job Title</p>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" style={{ color: '#F4B942' }} />
                    <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                      {mainUser.job_title || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {mainUser.department && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Department</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" style={{ color: '#F4B942' }} />
                      <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                        {mainUser.department}
                      </p>
                    </div>
                  </div>
                )}

                {mainUser.phone && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: '#F4B942' }} />
                      <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                        {mainUser.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Role</p>
                  <Badge 
                    variant="outline"
                    className="border-0 bg-purple-500/20 text-purple-300"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {mainUser.role}
                  </Badge>
                </div>

                {mainUser.last_login && (
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Last Login</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: '#A3CED1' }} />
                      <p style={{ color: '#E8F4F5' }}>
                        {format(new Date(mainUser.last_login), "MMM d, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {resetSuccess === mainUser.email && (
              <Alert className="mt-6 border-0 bg-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-300" />
                <AlertDescription style={{ color: '#E8F4F5' }}>
                  Password reset email sent successfully to {mainUser.email}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 pt-6 border-t flex flex-wrap gap-3" style={{ borderColor: '#1E8A9C' }}>
              <Button
                onClick={() => handleImpersonate(mainUser)}
                disabled={impersonatingUser === mainUser.email}
                style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
              >
                <UserCog className="w-4 h-4 mr-2" />
                {impersonatingUser === mainUser.email ? "Impersonating..." : "Impersonate User"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleResetPassword(mainUser)}
                className="border-[#F49342]"
                style={{ color: '#F49342' }}
              >
                <Key className="w-4 h-4 mr-2" />
                Reset Password
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSendResetEmail(mainUser)}
                disabled={sendingResetEmail === mainUser.email}
                className="border-[#1E8A9C]"
                style={{ color: '#1E8A9C' }}
              >
                <Send className="w-4 h-4 mr-2" />
                {sendingResetEmail === mainUser.email ? "Sending..." : "Send Reset Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {otherUsers.length > 0 && (
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
              <User className="w-5 h-5" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
              {users.map((user, index) => (
                <div key={index} className="p-6 hover:bg-[#1E8A9C] transition-colors">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
                            {user.name}
                          </h3>
                          {user.is_main_contact && (
                            <Badge variant="outline" className="border-0 bg-yellow-500/20 text-yellow-300">
                              <Crown className="w-3 h-3 mr-1" />
                              Main Contact
                            </Badge>
                          )}
                          <Badge 
                            variant="outline"
                            className="border-0 bg-purple-500/20 text-purple-300"
                          >
                            {user.role}
                          </Badge>
                          {user.email_verified ? (
                            <Badge variant="outline" className="border-0 bg-green-500/20 text-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-0 bg-red-500/20 text-red-300">
                              <XCircle className="w-3 h-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm" style={{ color: '#A3CED1' }}>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          {user.job_title && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-3 h-3" />
                              {user.job_title}
                            </div>
                          )}
                          {user.department && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3 h-3" />
                              {user.department}
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                          {user.last_login && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Last login: {format(new Date(user.last_login), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {resetSuccess === user.email && (
                      <Alert className="border-0 bg-green-500/20">
                        <CheckCircle2 className="h-4 w-4 text-green-300" />
                        <AlertDescription style={{ color: '#E8F4F5' }}>
                          Password reset email sent successfully!
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImpersonate(user)}
                        disabled={impersonatingUser === user.email}
                        className="border-[#F4B942]"
                        style={{ color: '#F4B942' }}
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        {impersonatingUser === user.email ? "Impersonating..." : "Impersonate"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(user)}
                        className="border-[#F49342]"
                        style={{ color: '#F49342' }}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Reset Password
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendResetEmail(user)}
                        disabled={sendingResetEmail === user.email}
                        className="border-[#1E8A9C]"
                        style={{ color: '#1E8A9C' }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendingResetEmail === user.email ? "Sending..." : "Send Reset Email"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Bell,
  Moon,
  Sun,
  Globe,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email_notifications: true,
    dark_mode: false,
    language: "en",
    timezone: "UTC"
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || "",
        email_notifications: currentUser.email_notifications ?? true,
        dark_mode: currentUser.dark_mode ?? false,
        language: currentUser.language || "en",
        timezone: currentUser.timezone || "UTC"
      });
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await User.updateMyUserData(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadUser();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    }
    setSaving(false);
  };

  const handleChangePassword = () => {
    alert("Password change functionality would redirect to authentication provider");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A4A52' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
          <p style={{ color: '#E8F4F5' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="border-[#176B7A]"
            style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
              Account Settings
            </h1>
            <p style={{ color: '#7FB8BF' }}>
              Manage your account preferences and security
            </p>
          </div>
        </div>

        {saveSuccess && (
          <Alert className="mb-6 border-0 bg-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-300" />
            <AlertDescription style={{ color: '#E8F4F5' }}>
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
            <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
              <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                <UserIcon className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label style={{ color: '#A3CED1' }}>Full Name</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="mt-2 border-0"
                      style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                    />
                  </div>

                  <div>
                    <Label style={{ color: '#A3CED1' }}>Email</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="border-0"
                        style={{ backgroundColor: '#0D3339', color: '#7FB8BF' }}
                      />
                      <Badge variant="outline" className="border-0 bg-green-500/20 text-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label style={{ color: '#A3CED1' }}>Role</Label>
                    <Input
                      value={user?.role || ""}
                      disabled
                      className="mt-2 border-0"
                      style={{ backgroundColor: '#0D3339', color: '#7FB8BF' }}
                    />
                  </div>

                  <div>
                    <Label style={{ color: '#A3CED1' }}>Member Since</Label>
                    <Input
                      value={user?.created_date ? new Date(user.created_date).toLocaleDateString() : ""}
                      disabled
                      className="mt-2 border-0"
                      style={{ backgroundColor: '#0D3339', color: '#7FB8BF' }}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
            <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
              <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#E8F4F5' }}>
                      Password
                    </h3>
                    <p className="text-sm" style={{ color: '#A3CED1' }}>
                      Change your password to keep your account secure
                    </p>
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    variant="outline"
                    className="border-[#F4B942]"
                    style={{ color: '#F4B942' }}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: '#1E8A9C' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: '#E8F4F5' }}>
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm" style={{ color: '#A3CED1' }}>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="outline" className="border-0 bg-gray-500/20 text-gray-300">
                      Not Enabled
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
            <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
              <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
                <Bell className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#E8F4F5' }}>
                      Email Notifications
                    </h3>
                    <p className="text-sm" style={{ color: '#A3CED1' }}>
                      Receive email updates about your scans and vulnerabilities
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({...formData, email_notifications: !formData.email_notifications})}
                    className={`border-0 ${
                      formData.email_notifications
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {formData.email_notifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: '#1E8A9C' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: '#E8F4F5' }}>
                        Dark Mode
                      </h3>
                      <p className="text-sm" style={{ color: '#A3CED1' }}>
                        Use dark theme across the platform
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({...formData, dark_mode: !formData.dark_mode})}
                      className="border-[#1E8A9C]"
                      style={{ color: '#E8F4F5' }}
                    >
                      {formData.dark_mode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                      {formData.dark_mode ? 'Dark' : 'Light'}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    style={{ backgroundColor: '#F4B942', color: '#0A4A52' }}
                  >
                    {saving ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
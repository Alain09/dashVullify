import React, { useState, useEffect } from "react";
import { VulnerabilityRemediation } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Users,
  Clock,
  Calendar,
  AlertTriangle,
  Shield,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

import VulnerabilityDetailDialog from "../components/remediation/VulnerabilityDetailDialog";

export default function RemediationsDescriptions() {
  const navigate = useNavigate();
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    loadVulnerabilities();
  }, []);

  const loadVulnerabilities = async () => {
    setLoading(true);
    try {
      const data = await VulnerabilityRemediation.list("-last_modified");
      setVulnerabilities(data);
    } catch (error) {
      console.error("Error loading vulnerabilities:", error);
    }
    setLoading(false);
  };

  const handleAddSampleData = async () => {
    try {
      await VulnerabilityRemediation.bulkCreate([
        {
          vulnerability_name: "Open Redirect Vulnerability",
          vulnerability_code: "ASP-Nuke-001",
          description: "ASP-Nuke suffers from an open redirect vulnerability, which occurs when the application allows user-controlled input to dictate the destination of a redirect without proper validation. This can be exploited by attackers to redirect users to malicious websites, potentially leading to phishing attacks where users are tricked into revealing sensitive information, or facilitating further exploits like data modification or unauthorized operations through social engineering or combined with other vulnerabilities.",
          remediation_steps: [
            {
              step_number: 1,
              title: "Identify Affected Code",
              description: "Review the ASP-Nuke source code to locate all instances where redirects are performed, such as Response.Redirect() or similar functions, and identify parameters that accept user input for redirect URLs."
            },
            {
              step_number: 2,
              title: "Implement URL Validation",
              description: "Add validation logic to ensure that the redirect URL is from a trusted domain or whitelist; for example, check if the URL starts with an approved base URL and reject any that do not match."
            },
            {
              step_number: 3,
              title: "Use Safe Redirect Methods",
              description: "Replace direct redirects with safer alternatives, such as using a mapping or indexing system where user input selects from a predefined list of safe URLs instead of providing arbitrary URLs."
            },
            {
              step_number: 4,
              title: "Apply Input Sanitization",
              description: "Sanitize all user-supplied input for redirect parameters by removing or encoding special characters that could manipulate the URL, and use libraries like System.Uri for parsing and validation."
            },
            {
              step_number: 5,
              title: "Test for Vulnerabilities",
              description: "Conduct thorough testing, including manual checks and automated scans with tools like OWASP ZAP, to verify that open redirects are no longer possible after changes."
            },
            {
              step_number: 6,
              title: "Deploy and Monitor",
              description: "Update the application with the fixes, deploy to production, and monitor logs for any attempted exploits to ensure the remediation is effective."
            }
          ],
          thumbs_up: 142,
          thumbs_down: 8,
          source: "ai_generated",
          first_appearance: new Date(Date.now() - 86400000 * 90).toISOString(),
          last_modified: new Date(Date.now() - 86400000 * 7).toISOString(),
          severity: "high",
          category: "Web Application"
        },
        {
          vulnerability_name: "SQL Injection in Login Form",
          vulnerability_code: "SQLi-2024-001",
          description: "A SQL injection vulnerability exists in the login authentication mechanism, allowing attackers to bypass authentication by manipulating SQL queries through specially crafted input. This can lead to unauthorized access, data exfiltration, and potential database compromise.",
          remediation_steps: [
            {
              step_number: 1,
              title: "Use Parameterized Queries",
              description: "Replace all dynamic SQL queries with parameterized queries or prepared statements to prevent SQL injection attacks."
            },
            {
              step_number: 2,
              title: "Implement Input Validation",
              description: "Validate and sanitize all user inputs on both client and server side, rejecting any suspicious patterns."
            },
            {
              step_number: 3,
              title: "Apply Least Privilege",
              description: "Ensure database accounts used by the application have minimal necessary permissions."
            },
            {
              step_number: 4,
              title: "Enable Web Application Firewall",
              description: "Deploy a WAF with SQL injection protection rules to add an additional layer of defense."
            }
          ],
          thumbs_up: 287,
          thumbs_down: 12,
          source: "team_edited",
          first_appearance: new Date(Date.now() - 86400000 * 120).toISOString(),
          last_modified: new Date(Date.now() - 86400000 * 2).toISOString(),
          severity: "critical",
          category: "Web Application"
        },
        {
          vulnerability_name: "Misconfigured S3 Bucket Permissions",
          vulnerability_code: "AWS-S3-2024-003",
          description: "AWS S3 buckets are configured with overly permissive access controls, allowing public read or write access to sensitive data. This misconfiguration can lead to data breaches, unauthorized data modification, or serve as a vector for malware distribution.",
          remediation_steps: [
            {
              step_number: 1,
              title: "Review Bucket Policies",
              description: "Audit all S3 bucket policies and ACLs to identify publicly accessible buckets."
            },
            {
              step_number: 2,
              title: "Enable Block Public Access",
              description: "Enable S3 Block Public Access settings at both bucket and account levels."
            },
            {
              step_number: 3,
              title: "Implement Least Privilege Access",
              description: "Configure IAM policies to grant minimum necessary permissions using principle of least privilege."
            },
            {
              step_number: 4,
              title: "Enable Logging and Monitoring",
              description: "Activate S3 server access logging and CloudTrail to monitor access patterns and detect anomalies."
            },
            {
              step_number: 5,
              title: "Use Encryption",
              description: "Enable server-side encryption (SSE) for all S3 buckets containing sensitive data."
            }
          ],
          thumbs_up: 195,
          thumbs_down: 5,
          source: "team_edited",
          first_appearance: new Date(Date.now() - 86400000 * 60).toISOString(),
          last_modified: new Date(Date.now() - 86400000 * 1).toISOString(),
          severity: "high",
          category: "Cloud"
        }
      ]);
      await loadVulnerabilities();
    } catch (error) {
      console.error("Error adding sample data:", error);
      alert("Error adding sample data. Please try again.");
    }
  };

  const handleVulnerabilityClick = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setShowDetailDialog(true);
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vuln.vulnerability_name.toLowerCase().includes(searchLower) ||
      vuln.vulnerability_code?.toLowerCase().includes(searchLower) ||
      vuln.category?.toLowerCase().includes(searchLower)
    );
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300';
      case 'high': return 'bg-orange-500/20 text-orange-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'low': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const stats = [
    {
      label: "Total Vulnerabilities",
      value: vulnerabilities.length,
      icon: Shield,
      color: "#F4B942"
    },
    {
      label: "AI Generated",
      value: vulnerabilities.filter(v => v.source === "ai_generated").length,
      icon: Sparkles,
      color: "#1E8A9C"
    },
    {
      label: "Team Edited",
      value: vulnerabilities.filter(v => v.source === "team_edited").length,
      icon: Users,
      color: "#4CAF50"
    },
    {
      label: "Critical Severity",
      value: vulnerabilities.filter(v => v.severity === "critical").length,
      icon: AlertTriangle,
      color: "#F49342"
    }
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0A4A52' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Tools"))}
              className="border-[#176B7A]"
              style={{ backgroundColor: '#176B7A', color: '#E8F4F5' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F5' }}>
                Remediations and Descriptions
              </h1>
              <p style={{ color: '#7FB8BF' }}>
                Manage vulnerability remediation guidance and descriptions
              </p>
            </div>
          </div>

          {vulnerabilities.length === 0 && (
            <Button
              onClick={handleAddSampleData}
              className="bg-[#F4B942] hover:bg-[#F49342] text-[#0A4A52]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sample Data
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="border-0 shadow-lg"
              style={{ backgroundColor: '#176B7A' }}
            >
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
                <p className="text-4xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#7FB8BF' }} />
              <Input
                placeholder="Search by vulnerability name, code, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0"
                style={{ 
                  backgroundColor: '#1E8A9C',
                  color: '#E8F4F5'
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vulnerabilities List */}
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle style={{ color: '#E8F4F5' }}>
              Vulnerability Database ({filteredVulnerabilities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
                <p style={{ color: '#E8F4F5' }}>Loading vulnerabilities...</p>
              </div>
            ) : filteredVulnerabilities.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
                <p className="text-xl mb-2" style={{ color: '#E8F4F5' }}>
                  No vulnerabilities found
                </p>
                <p style={{ color: '#7FB8BF' }}>
                  {searchQuery ? "Try adjusting your search" : "Add your first vulnerability entry"}
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
                {filteredVulnerabilities.map((vuln, index) => (
                  <div 
                    key={index}
                    className="p-6 hover:bg-[#1E8A9C] transition-colors cursor-pointer"
                    onClick={() => handleVulnerabilityClick(vuln)}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
                              {vuln.vulnerability_name}
                            </h3>
                            {vuln.vulnerability_code && (
                              <Badge variant="outline" className="border-0 bg-purple-500/20 text-purple-300 font-mono">
                                {vuln.vulnerability_code}
                              </Badge>
                            )}
                            <Badge 
                              variant="outline"
                              className={`border-0 ${getSeverityColor(vuln.severity)}`}
                            >
                              {vuln.severity}
                            </Badge>
                            {vuln.source === "ai_generated" ? (
                              <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Generated
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-0 bg-green-500/20 text-green-300">
                                <Users className="w-3 h-3 mr-1" />
                                Team Edited
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm line-clamp-2 mb-3" style={{ color: '#A3CED1' }}>
                            {vuln.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm" style={{ color: '#7FB8BF' }}>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{vuln.thumbs_up || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="w-4 h-4" />
                              <span>{vuln.thumbs_down || 0}</span>
                            </div>
                            {vuln.remediation_steps && (
                              <span>{vuln.remediation_steps.length} steps</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 text-sm" style={{ color: '#7FB8BF' }}>
                          {vuln.first_appearance && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>First: {format(new Date(vuln.first_appearance), "MMM d, yyyy")}</span>
                            </div>
                          )}
                          {vuln.last_modified && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Updated: {format(new Date(vuln.last_modified), "MMM d, yyyy")}</span>
                            </div>
                          )}
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

      <VulnerabilityDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        vulnerability={selectedVulnerability}
        onSave={loadVulnerabilities}
      />
    </div>
  );
}
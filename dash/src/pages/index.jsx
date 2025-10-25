import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Customers from "./Customers";

import Support from "./Support";

import Commercial from "./Commercial";

import Infrastructures from "./Infrastructures";

import Tools from "./Tools";

import Wiki from "./Wiki";

import CustomerDetail from "./CustomerDetail";

import Diagnostic from "./Diagnostic";

import RemediationsDescriptions from "./RemediationsDescriptions";

import ScanConsole from "./ScanConsole";

import ScanResultDetail from "./ScanResultDetail";

import Analytics from "./Analytics";

import AuditLogs from "./AuditLogs";

import ScanEngine from "./ScanEngine";

import AccountSettings from "./AccountSettings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Customers: Customers,
    
    Support: Support,
    
    Commercial: Commercial,
    
    Infrastructures: Infrastructures,
    
    Tools: Tools,
    
    Wiki: Wiki,
    
    CustomerDetail: CustomerDetail,
    
    Diagnostic: Diagnostic,
    
    RemediationsDescriptions: RemediationsDescriptions,
    
    ScanConsole: ScanConsole,
    
    ScanResultDetail: ScanResultDetail,
    
    Analytics: Analytics,
    
    AuditLogs: AuditLogs,
    
    ScanEngine: ScanEngine,
    
    AccountSettings: AccountSettings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Customers" element={<Customers />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/Commercial" element={<Commercial />} />
                
                <Route path="/Infrastructures" element={<Infrastructures />} />
                
                <Route path="/Tools" element={<Tools />} />
                
                <Route path="/Wiki" element={<Wiki />} />
                
                <Route path="/CustomerDetail" element={<CustomerDetail />} />
                
                <Route path="/Diagnostic" element={<Diagnostic />} />
                
                <Route path="/RemediationsDescriptions" element={<RemediationsDescriptions />} />
                
                <Route path="/ScanConsole" element={<ScanConsole />} />
                
                <Route path="/ScanResultDetail" element={<ScanResultDetail />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/AuditLogs" element={<AuditLogs />} />
                
                <Route path="/ScanEngine" element={<ScanEngine />} />
                
                <Route path="/AccountSettings" element={<AccountSettings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
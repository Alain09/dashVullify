
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  LayoutDashboard, 
  Users, 
  Headphones, 
  Briefcase, 
  Server, 
  Wrench, 
  BookOpen,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Customers", url: createPageUrl("Customers"), icon: Users },
  { title: "Support", url: createPageUrl("Support"), icon: Headphones },
  { title: "Commercial", url: createPageUrl("Commercial"), icon: Briefcase },
  { title: "Infrastructures", url: createPageUrl("Infrastructures"), icon: Server },
  { title: "Tools", url: createPageUrl("Tools"), icon: Wrench },
  { title: "Wiki", url: createPageUrl("Wiki"), icon: BookOpen },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary-dark: #0A4A52;
          --primary-medium: #176B7A;
          --primary-light: #1E8A9C;
          --accent-yellow: #F4B942;
          --accent-orange: #F49342;
          --text-light: #E8F4F5;
          --sidebar-bg: #0D3339;
        }
      `}</style>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--primary-dark)' }}>
        <Sidebar className="border-r border-[#176B7A]" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
          <SidebarHeader className="border-b border-[#176B7A] p-6">
            <div className="flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e5b2e44dd725117508a875/8b228b9d6_Vullify-adm-blue.png"
                alt="Vullify ADM"
                className="h-16 w-auto"
              />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-200 rounded-lg mb-1 ${
                            isActive 
                              ? 'text-[#0A4A52] font-semibold' 
                              : 'text-[#7FB8BF] hover:text-[#E8F4F5]'
                          }`}
                          style={isActive ? { backgroundColor: 'var(--accent-yellow)' } : {}}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-[#176B7A] p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-[#176B7A] transition-colors"
                  style={{ color: '#E8F4F5' }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-yellow)' }}
                  >
                    <UserCircle className="w-6 h-6 text-[#0A4A52]" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{user?.full_name || 'Admin User'}</p>
                    <p className="text-xs" style={{ color: '#7FB8BF' }}>{user?.email || 'Loading...'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4" style={{ color: '#7FB8BF' }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56"
                style={{ backgroundColor: '#176B7A', borderColor: '#1E8A9C' }}
              >
                <DropdownMenuItem 
                  className="cursor-pointer"
                  style={{ color: '#E8F4F5' }}
                  onClick={() => window.location.href = createPageUrl("AccountSettings")}
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  style={{ color: '#E8F4F5' }}
                  onClick={() => window.location.href = createPageUrl("AccountSettings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator style={{ backgroundColor: '#1E8A9C' }} />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer"
                  style={{ color: '#F49342' }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-[#176B7A] px-6 py-4 md:hidden" style={{ backgroundColor: 'var(--primary-medium)' }}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-[#E8F4F5] hover:bg-[#1E8A9C] p-2 rounded-lg transition-colors duration-200" />
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e5b2e44dd725117508a875/8b228b9d6_Vullify-adm-blue.png"
                alt="Vullify ADM"
                className="h-8 w-auto"
              />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

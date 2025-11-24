import React from "react";
import {
  Home,
  Eye,
  TrendingUp,
  Bell,
  Settings as SettingsIcon,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ModeToggle } from "../mode-toggle";

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function MainLayout({
  children,
  currentPage,
  onNavigate,
  onLogout,
}: MainLayoutProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: Home },
    { id: "trends", label: "Risk & Trends", icon: TrendingUp },
    { id: "monitoring", label: "Child Monitoring", icon: Eye },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* --- SIDEBAR (MÀU TỐI) --- */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 text-white border-r border-slate-800">
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Reddit Monitor</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile in Sidebar (Optional placement) */}
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
              <Avatar className="h-8 w-8 border border-slate-600">
                <AvatarFallback className="bg-slate-700 text-slate-200 text-xs">P</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium truncate">Parent Account</p>
                 <p className="text-xs text-slate-400 truncate">Pro Plan</p>
              </div>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header (Light & Clean) */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
           <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 capitalize">
              {menuItems.find(i => i.id === currentPage)?.label}
           </h2>
           
           <div className="flex items-center gap-4">
              <ModeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
           </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
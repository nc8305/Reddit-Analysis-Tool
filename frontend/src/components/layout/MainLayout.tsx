import React from "react";
import { useState } from "react";
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
import { ModeToggle } from "../mode-toggle"; // Đảm bảo đã import nút này

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
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Chưa dùng thì có thể bỏ

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: Home },
    { id: "trends", label: "Risk & Trends", icon: TrendingUp },
    { id: "monitoring", label: "Child Monitoring", icon: Eye },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/30 to-blue-50/30 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full border-b sticky top-0 z-50 shadow-sm">
        <div className="w-full justify-between px-4">
          <div className="flex w-full items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl tracking-tight font-bold text-foreground">Reddit Monitor</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Children's Social Media Monitor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ModeToggle />
              <Avatar className="h-9 w-9 bg-secondary">
                <AvatarFallback className="text-primary">P</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="hidden sm:flex text-foreground hover:text-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-background border-r">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                    ? "bg-red-600 hover:bg-red-500 text-white" 
                    : "hover:bg-accent text-foreground"
                  }`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 bg-muted/20 dark:bg-background">
          <div className="w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
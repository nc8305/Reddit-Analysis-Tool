import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity, Users, Database, ShieldCheck, Zap } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion"; // Import Animation

interface DashboardStats {
  total_children: number;
  total_activity: number;
  details: {
    id: number;
    name: string;
    username: string;
    scanned_count: number;
    avatar_url?: string;
  }[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/children/dashboard/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="md:col-span-2 h-[180px] rounded-2xl" />
            <Skeleton className="md:col-span-1 h-[180px] rounded-2xl" />
            <Skeleton className="md:col-span-1 h-[180px] rounded-2xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  // --- BENTO GRID LAYOUT & GLASSMORPHISM ---
  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights & safety overview.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          System Live
        </Badge>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Ô 1 (Lớn): Tổng quan User - Hiệu ứng Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
          className="md:col-span-2 row-span-1"
        >
          <Card className="h-full border-none shadow-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-white/20 dark:border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Monitored Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-5xl font-bold text-foreground">{stats?.total_children || 0}</span>
                  <p className="text-sm text-muted-foreground mt-1">Active profiles tracking</p>
                </div>
                <div className="flex -space-x-3">
                  {stats?.details.slice(0, 4).map((child, i) => (
                    <Avatar key={i} className="border-2 border-background w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs">
                        {child.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ô 2 (Nhỏ): Tổng Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-1"
        >
          <Card className="h-full border-none shadow-lg bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all cursor-pointer group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                Total Scanned <Activity className="h-4 w-4 text-green-500 group-hover:animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_activity || 0}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <Zap className="h-3 w-3 mr-1" /> +24% this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ô 3 (Nhỏ): Trạng thái DB */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
          className="md:col-span-1"
        >
          <Card className="h-full border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                Database Health <Database className="h-4 w-4 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">98%</div>
              <p className="text-xs text-purple-600 mt-1">Optimal Performance</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ô 4 (Dài): Chi tiết - Hover Glow Effect */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-4"
        >
          <Card className="border-none shadow-md bg-card/40 backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500" /> 
                Detailed Monitoring Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.details.length === 0 ? (
                 <p className="text-muted-foreground text-center py-8">No accounts added yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stats?.details.map((child, idx) => (
                        <div 
                          key={child.id} 
                          className="relative group p-4 rounded-xl border bg-background/50 hover:bg-background transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                        >
                            {/* Glowing Border Effect */}
                            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/20 transition-colors pointer-events-none" />
                            
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                            <AvatarFallback className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold">
                                                {child.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">{child.name}</h4>
                                        <p className="text-xs text-muted-foreground">u/{child.username}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-foreground tracking-tight">{child.scanned_count}</span>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase">Items</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
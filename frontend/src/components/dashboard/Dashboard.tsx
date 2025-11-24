import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity, Users, AlertTriangle } from "lucide-react";

export function Dashboard() {
  const stats = [
    {
      title: "Monitored Accounts",
      value: "2",
      description: "Active children accounts",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Risk Alerts",
      value: "4",
      description: "2 high severity detected",
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Activity Scanned",
      value: "1.2k",
      description: "Posts & comments this week",
      icon: Activity,
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your children's Reddit activity and safety status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- SỬA LỖI Ở ĐÂY --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-red-100 dark:border-red-900 bg-gradient-to-br from-white to-red-50 dark:from-slate-900 dark:to-red-950/30">
          <CardHeader>
            <CardTitle className="text-foreground">Safety Status: Attention Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We detected some high-risk interactions on Emma's account regarding mental health topics in the last 24 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
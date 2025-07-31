import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, Clock, User, Calendar } from "lucide-react";
import { carScheduleService } from "@/services/carScheduleService";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CarSchedule {
  id: string;
  start_time: string;
  end_time: string;
  purpose: string;
  notes: string | null;
  user_name: string;
  created_at: string;
  updated_at: string;
}

interface UsageStatsPageProps {
  accessLevel: 'team' | 'admin';
}

interface UsageStats {
  totalBookings: number;
  thisMonthBookings: number;
  thisWeekBookings: number;
  totalHours: number;
  averageBookingDuration: number;
  topUsers: { name: string; count: number }[];
  recentActivity: CarSchedule[];
}

export function UsageStatsPage({ accessLevel }: UsageStatsPageProps) {
  const [schedules, setSchedules] = useState<CarSchedule[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await carScheduleService.list();
      setSchedules(data);
      calculateStats(data);
    } catch (error) {
      console.error("Failed to load usage data:", error);
      toast({
        title: "Error",
        description: "Failed to load usage statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (schedules: CarSchedule[]) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const thisMonthBookings = schedules.filter(s => {
      const date = parseISO(s.start_time);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    const thisWeekBookings = schedules.filter(s => {
      const date = parseISO(s.start_time);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });

    // Calculate total hours
    const totalHours = schedules.reduce((acc, schedule) => {
      const start = parseISO(schedule.start_time);
      const end = parseISO(schedule.end_time);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return acc + duration;
    }, 0);

    // Calculate average booking duration
    const averageBookingDuration = schedules.length > 0 ? totalHours / schedules.length : 0;

    // Top users
    const userCounts = schedules.reduce((acc, schedule) => {
      acc[schedule.user_name] = (acc[schedule.user_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity (last 5 bookings)
    const recentActivity = [...schedules]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setStats({
      totalBookings: schedules.length,
      thisMonthBookings: thisMonthBookings.length,
      thisWeekBookings: thisWeekBookings.length,
      totalHours: Math.round(totalHours * 10) / 10,
      averageBookingDuration: Math.round(averageBookingDuration * 10) / 10,
      topUsers,
      recentActivity,
    });
  };

  const exportToCSV = () => {
    if (schedules.length === 0) {
      toast({
        title: "No Data",
        description: "No bookings to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Start Time", "End Time", "Name", "Purpose", "Notes"];
    const csvContent = [
      headers.join(","),
      ...schedules.map(schedule => [
        format(parseISO(schedule.start_time), "yyyy-MM-dd"),
        format(parseISO(schedule.start_time), "HH:mm"),
        format(parseISO(schedule.end_time), "HH:mm"),
        `"${schedule.user_name}"`,
        `"${schedule.purpose}"`,
        `"${schedule.notes || ""}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `car_usage_stats_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Usage data exported to CSV",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">Failed to load usage statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Usage Statistics</h2>
        {accessLevel === 'admin' && (
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats.thisMonthBookings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{stats.averageBookingDuration}h</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Users */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Top Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No usage data available</p>
            ) : (
              <div className="space-y-3">
                {stats.topUsers.map((user, index) => (
                  <div key={user.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(200_50%_65%)] rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.count} bookings</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{activity.purpose}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(activity.created_at), "MMM dd, HH:mm")}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.user_name} • {format(parseISO(activity.start_time), "MMM dd, HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
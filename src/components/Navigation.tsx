import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Car, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  accessLevel: 'team' | 'admin';
  onLogout: () => void;
}

export function Navigation({ activeTab, onTabChange, accessLevel, onLogout }: NavigationProps) {
  const navItems = [
    { id: 'booking', label: 'Book Car', icon: Calendar, description: 'Schedule car usage' },
    { id: 'key-location', label: 'Key Location', icon: MapPin, description: 'Find car keys', adminOnly: false },
    { id: 'car-details', label: 'Car Details', icon: Car, description: 'Vehicle information', adminOnly: false },
    { id: 'usage-stats', label: 'Usage Stats', icon: BarChart3, description: 'Usage analytics', adminOnly: false },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || accessLevel === 'admin');

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(200_50%_65%)] rounded-lg">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Car Scheduler</h1>
              <p className="text-sm text-muted-foreground">
                {accessLevel === 'admin' ? 'Admin Access' : 'Team Access'}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            התנתק
          </Button>
        </div>
        
        <nav className="mt-6">
          <div className="flex flex-wrap gap-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "nav-link flex items-center gap-2 h-auto flex-col p-4 min-w-[120px]",
                    isActive && "active"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BookingPage } from "@/components/pages/BookingPage";
import { KeyLocationPage } from "@/components/pages/KeyLocationPage";
import { CarDetailsPage } from "@/components/pages/CarDetailsPage";
import { UsageStatsPage } from "@/components/pages/UsageStatsPage";
import { AdminSettings } from "@/components/AdminSettings";
import { appSettingsService } from "@/services/appSettingsService";

interface IndexProps {
  accessLevel: 'team' | 'admin';
  onLogout: () => void;
}

const Index: React.FC<IndexProps> = ({ accessLevel, onLogout }) => {
  const [activeTab, setActiveTab] = useState('booking');
  const [keyLocation, setKeyLocation] = useState<string>("");

  useEffect(() => {
    loadKeyLocation();
  }, []);

  const loadKeyLocation = async () => {
    try {
      const location = await appSettingsService.get("key_location");
      setKeyLocation(location || "Front desk reception");
    } catch (error) {
      console.error("Failed to load key location:", error);
    }
  };

  const handleLocationUpdate = (location: string) => {
    setKeyLocation(location);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'booking':
        return <BookingPage accessLevel={accessLevel} keyLocation={keyLocation} />;
      case 'key-location':
        return <KeyLocationPage accessLevel={accessLevel} onLocationUpdate={handleLocationUpdate} />;
      case 'car-details':
        return <CarDetailsPage accessLevel={accessLevel} />;
      case 'usage-stats':
        return <UsageStatsPage accessLevel={accessLevel} />;
      default:
        return <BookingPage accessLevel={accessLevel} keyLocation={keyLocation} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accessLevel={accessLevel}
        onLogout={onLogout}
      />
      
      <main className="container mx-auto px-6 py-8">
        {renderActiveTab()}
        
        {/* Admin Settings Section - Show only on booking tab for admins */}
        {accessLevel === 'admin' && activeTab === 'booking' && (
          <div className="mt-8">
            <AdminSettings />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

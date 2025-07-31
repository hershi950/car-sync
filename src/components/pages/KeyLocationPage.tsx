import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Edit3, Save, X } from "lucide-react";
import { appSettingsService } from "@/services/appSettingsService";
import { useToast } from "@/hooks/use-toast";

interface KeyLocationPageProps {
  accessLevel: 'team' | 'admin';
  onLocationUpdate?: (location: string) => void;
}

export function KeyLocationPage({ accessLevel, onLocationUpdate }: KeyLocationPageProps) {
  const [keyLocation, setKeyLocation] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadKeyLocation();
  }, []);

  const loadKeyLocation = async () => {
    try {
      const location = await appSettingsService.get("key_location");
      const locationValue = location || "Front desk reception";
      setKeyLocation(locationValue);
      setEditValue(locationValue);
    } catch (error) {
      console.error("Failed to load key location:", error);
      toast({
        title: "Error",
        description: "Failed to load key location setting",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!editValue.trim()) return;

    setLoading(true);
    try {
      await appSettingsService.set("key_location", editValue.trim());
      setKeyLocation(editValue.trim());
      setIsEditing(false);
      onLocationUpdate?.(editValue.trim());
      toast({
        title: "Success",
        description: "Key location updated successfully",
      });
    } catch (error) {
      console.error("Failed to save key location:", error);
      toast({
        title: "Error",
        description: "Failed to save key location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(keyLocation);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditValue(keyLocation);
    setIsEditing(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Car Key Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-8 bg-gradient-to-br from-[hsl(var(--soft-blue))] to-[hsl(var(--soft-purple))] rounded-lg">
            <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Current Key Location</h3>
            
            {isEditing ? (
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <Label htmlFor="keyLocation" className="sr-only">Key Location</Label>
                  <Input
                    id="keyLocation"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter key location"
                    className="text-center"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSave();
                      } else if (e.key === "Escape") {
                        handleCancel();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleSave}
                    disabled={loading || !editValue.trim()}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xl font-medium text-foreground bg-background/50 rounded-lg px-4 py-2 inline-block">
                  {keyLocation}
                </p>
                {accessLevel === 'admin' && (
                  <div>
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      size="sm"
                      className="bg-background/50 hover:bg-background/70"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit Location
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Please return the key to this location after use</li>
              <li>• Make sure the car is locked and secure</li>
              <li>• Report any issues immediately</li>
              {accessLevel === 'admin' && (
                <li>• Only admins can edit the key location</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
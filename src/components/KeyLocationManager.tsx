import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { appSettingsService } from "@/services/appSettingsService";
import { useToast } from "@/hooks/use-toast";

interface KeyLocationManagerProps {
  onLocationUpdate?: (location: string) => void;
}

export function KeyLocationManager({ onLocationUpdate }: KeyLocationManagerProps) {
  const [keyLocation, setKeyLocation] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
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
      setShowDialog(false);
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
    setShowDialog(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Key Location:</span>
      <span className="text-sm text-muted-foreground">{keyLocation}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="h-8"
      >
        <Settings className="h-3 w-3 mr-1" />
        Edit
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Key Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyLocation">Key Location</Label>
              <Input
                id="keyLocation"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter key location"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !editValue.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
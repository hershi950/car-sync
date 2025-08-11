import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, AlertCircle } from "lucide-react";
import { MapComponent } from "@/components/MapComponent";

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  locationData: LocationData | null;
  isLoading?: boolean;
}

export function LocationConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  locationData,
  isLoading = false 
}: LocationConfirmationDialogProps) {
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if (locationData && isOpen) {
      // Try to get address from reverse geocoding
      fetchAddress(locationData.latitude, locationData.longitude);
    }
  }, [locationData, isOpen]);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      // Using Google's reverse geocoding API through their maps API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=`
      );
      
      // Since we're not using API key, we'll show coordinates instead
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (error) {
      console.error("Failed to fetch address:", error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  if (!locationData) return null;

  const mapLocation = {
    id: "temp",
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    created_at: new Date().toISOString(),
    saved_by: "Current"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Confirm Location Sharing
          </DialogTitle>
          <DialogDescription>
            Review the location details before sharing
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Location Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Current Location:</h4>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="font-mono">{address}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Lat: {locationData.latitude.toFixed(6)}, Lng: {locationData.longitude.toFixed(6)}
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Map Preview:</h4>
            <div className="h-32 rounded-lg overflow-hidden border">
              <MapComponent location={mapLocation} />
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              Only this location information will be shared with authorized users who have access to the app. Do you confirm sharing your current location?
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Saving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
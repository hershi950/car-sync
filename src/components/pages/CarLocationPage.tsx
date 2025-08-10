import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Clock, User, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MapComponent } from "@/components/MapComponent";

interface CarLocation {
  id: string;
  latitude: number;
  longitude: number;
  description?: string;
  saved_by: string;
  created_at: string;
}

export function CarLocationPage() {
  const [lastLocation, setLastLocation] = useState<CarLocation | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLastLocation();
  }, []);

  const loadLastLocation = async () => {
    try {
      const { data, error } = await supabase
        .from("car_locations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading last location:", error);
        return;
      }

      setLastLocation(data);
    } catch (error) {
      console.error("Error loading last location:", error);
    }
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const saveCurrentLocation = async () => {
    setIsLoadingLocation(true);
    
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;

      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("car_locations")
        .insert({
          latitude: latitude,
          longitude: longitude,
          description: description.trim() || null,
          saved_by: 'User'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setLastLocation(data);
      setDescription("");
      
      toast({
        title: "Location Saved",
        description: "Car location has been saved successfully!",
      });
    } catch (error: any) {
      console.error("Error saving location:", error);
      
      if (error.code === 1) {
        toast({
          title: "Location Access Denied",
          description: "Please enable location services and try again.",
          variant: "destructive",
        });
      } else if (error.code === 3) {
        toast({
          title: "Location Timeout",
          description: "Unable to get location. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save location. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingLocation(false);
    }
  };

  const openInMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const openInWaze = (latitude: number, longitude: number) => {
    const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Car Location</h1>
        <p className="text-muted-foreground">Save and find the car's parking location</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
        {/* Save New Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Save Current Location
            </CardTitle>
            <CardDescription>
              Record where you parked the car for the next user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="description" className="text-sm font-medium text-foreground mb-2 block">
                Optional Description
              </label>
              <Input
                id="description"
                placeholder="e.g., Near the left gate, 5 spots from the end"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add details to help others find the car easily
              </p>
            </div>
            
            <Button 
              onClick={saveCurrentLocation} 
              disabled={isLoading || isLoadingLocation}
              className="w-full"
              size="lg"
            >
              {isLoadingLocation ? (
                <>Getting Location...</>
              ) : isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Save Current Location
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <Card className="lg:row-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Interactive Map
            </CardTitle>
            <CardDescription>
              View car location on map
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] lg:h-[500px]">
              <MapComponent location={lastLocation} />
            </div>
          </CardContent>
        </Card>

        {/* Last Known Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Last Known Location
            </CardTitle>
            <CardDescription>
              Most recent car parking location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastLocation ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(lastLocation.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>

                {lastLocation.description && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">{lastLocation.description}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => openInMaps(lastLocation.latitude, lastLocation.longitude)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Google Maps
                  </Button>
                  <Button
                    onClick={() => openInWaze(lastLocation.latitude, lastLocation.longitude)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Waze
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Location: {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No location saved yet</p>
                <p className="text-sm text-muted-foreground">Save the car's location to help other users find it</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
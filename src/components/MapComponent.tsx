import React from 'react';
import { MapPin } from "lucide-react";

interface CarLocation {
  latitude: number;
  longitude: number;
  description?: string;
  created_at: string;
}

interface MapComponentProps {
  location: CarLocation | null;
}

export function MapComponent({ location }: MapComponentProps) {
  if (!location) {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No location to display</p>
            <p className="text-sm text-muted-foreground">Save a location to see it on the map</p>
          </div>
        </div>
      </div>
    );
  }

  // Create Google Maps Embed URL with the car location
  const embedUrl = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative h-full">
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full rounded-lg border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title="Car Location Map"
      />
    </div>
  );
}
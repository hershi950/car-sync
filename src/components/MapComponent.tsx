import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Key } from "lucide-react";

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  // Check if we have a token stored
  useEffect(() => {
    const stored = localStorage.getItem('mapbox_token');
    if (stored) {
      setMapboxToken(stored);
      setShowTokenInput(false);
    }
  }, []);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setShowTokenInput(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('mapbox_token');
    setMapboxToken('');
    setShowTokenInput(true);
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };

  useEffect(() => {
    if (!mapContainer.current || showTokenInput || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: location ? [location.longitude, location.latitude] : [34.7818, 32.0853], // Default to Tel Aviv
        zoom: location ? 16 : 10,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add location marker if we have a location
      if (location) {
        // Create marker
        marker.current = new mapboxgl.Marker({
          color: '#ef4444', // Red color
          scale: 1.2
        })
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current);

        // Create popup
        const popupContent = `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">Car Location</h3>
            ${location.description ? `<p style="margin: 0 0 8px 0; font-size: 12px;">${location.description}</p>` : ''}
            <p style="margin: 0; font-size: 11px; color: #666;">
              Saved: ${new Date(location.created_at).toLocaleDateString()} ${new Date(location.created_at).toLocaleTimeString()}
            </p>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false
        }).setHTML(popupContent);

        marker.current.setPopup(popup);
      }

      // Cleanup function
      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [location, mapboxToken, showTokenInput]);

  // Update marker when location changes
  useEffect(() => {
    if (!map.current || !location) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({
      color: '#ef4444',
      scale: 1.2
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);

    // Create popup
    const popupContent = `
      <div style="padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">Car Location</h3>
        ${location.description ? `<p style="margin: 0 0 8px 0; font-size: 12px;">${location.description}</p>` : ''}
        <p style="margin: 0; font-size: 11px; color: #666;">
          Saved: ${new Date(location.created_at).toLocaleDateString()} ${new Date(location.created_at).toLocaleTimeString()}
        </p>
      </div>
    `;

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false
    }).setHTML(popupContent);

    marker.current.setPopup(popup);

    // Center map on new location
    map.current.easeTo({
      center: [location.longitude, location.latitude],
      zoom: 16,
      duration: 1000
    });
  }, [location]);

  if (showTokenInput) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Mapbox Setup
          </CardTitle>
          <CardDescription>
            Enter your Mapbox public token to view the interactive map
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="pk.ey..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Get your token from{' '}
              <a 
                href="https://account.mapbox.com/access-tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mapbox Account → Access Tokens
              </a>
            </p>
          </div>
          <Button 
            onClick={handleTokenSubmit}
            disabled={!mapboxToken.trim()}
            className="w-full"
          >
            Load Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      {!location && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No location to display</p>
            <p className="text-sm text-muted-foreground">Save a location to see it on the map</p>
          </div>
        </div>
      )}
      <Button
        onClick={clearToken}
        variant="ghost"
        size="sm"
        className="absolute top-2 left-2 bg-background/80 hover:bg-background"
      >
        Change Token
      </Button>
    </div>
  );
}
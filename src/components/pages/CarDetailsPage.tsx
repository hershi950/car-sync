import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Edit3, Save, X, Fuel, Hash, Calendar } from "lucide-react";
import { appSettingsService } from "@/services/appSettingsService";
import { useToast } from "@/hooks/use-toast";

interface CarDetailsPageProps {
  accessLevel: 'team' | 'admin';
}

interface CarDetails {
  licensePlate: string;
  model: string;
  year: string;
  fuelType: string;
  color: string;
}

export function CarDetailsPage({ accessLevel }: CarDetailsPageProps) {
  const [carDetails, setCarDetails] = useState<CarDetails>({
    licensePlate: "",
    model: "",
    year: "",
    fuelType: "",
    color: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<CarDetails>(carDetails);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCarDetails();
  }, []);

  const loadCarDetails = async () => {
    try {
      const details = await Promise.all([
        appSettingsService.get("car_license_plate"),
        appSettingsService.get("car_model"),
        appSettingsService.get("car_year"),
        appSettingsService.get("car_fuel_type"),
        appSettingsService.get("car_color"),
      ]);

      const carData = {
        licensePlate: details[0] || "ABC-123",
        model: details[1] || "Toyota Camry",
        year: details[2] || "2022",
        fuelType: details[3] || "Petrol",
        color: details[4] || "Silver",
      };

      setCarDetails(carData);
      setEditValues(carData);
    } catch (error) {
      console.error("Failed to load car details:", error);
      toast({
        title: "Error",
        description: "Failed to load car details",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        appSettingsService.set("car_license_plate", editValues.licensePlate),
        appSettingsService.set("car_model", editValues.model),
        appSettingsService.set("car_year", editValues.year),
        appSettingsService.set("car_fuel_type", editValues.fuelType),
        appSettingsService.set("car_color", editValues.color),
      ]);

      setCarDetails(editValues);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Car details updated successfully",
      });
    } catch (error) {
      console.error("Failed to save car details:", error);
      toast({
        title: "Error",
        description: "Failed to save car details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValues(carDetails);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditValues(carDetails);
    setIsEditing(true);
  };

  const updateEditValue = (field: keyof CarDetails, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Car Details
            </CardTitle>
            {!isEditing && accessLevel === 'admin' && (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-1" />
                Edit Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {/* License Plate */}
            <div className="space-y-2">
              <Label htmlFor="licensePlate" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                License Plate
              </Label>
              {isEditing ? (
                <Input
                  id="licensePlate"
                  value={editValues.licensePlate}
                  onChange={(e) => updateEditValue('licensePlate', e.target.value)}
                  placeholder="Enter license plate"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-lg font-semibold">
                  {carDetails.licensePlate}
                </div>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Model
              </Label>
              {isEditing ? (
                <Input
                  id="model"
                  value={editValues.model}
                  onChange={(e) => updateEditValue('model', e.target.value)}
                  placeholder="Enter car model"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg">
                  {carDetails.model}
                </div>
              )}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Year
              </Label>
              {isEditing ? (
                <Input
                  id="year"
                  value={editValues.year}
                  onChange={(e) => updateEditValue('year', e.target.value)}
                  placeholder="Enter year"
                  type="number"
                  min="1900"
                  max="2030"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg">
                  {carDetails.year}
                </div>
              )}
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <Label htmlFor="fuelType" className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Fuel Type
              </Label>
              {isEditing ? (
                <Select value={editValues.fuelType} onValueChange={(value) => updateEditValue('fuelType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="LPG">LPG</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg">
                  {carDetails.fuelType}
                </div>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              {isEditing ? (
                <Input
                  id="color"
                  value={editValues.color}
                  onChange={(e) => updateEditValue('color', e.target.value)}
                  placeholder="Enter car color"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg">
                  {carDetails.color}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
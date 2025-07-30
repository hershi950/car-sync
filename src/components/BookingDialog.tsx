import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NameSelector } from "./NameSelector";
import { format } from "date-fns";

interface BookingData {
  user_name: string;
  start_time: string;
  end_time: string;
  purpose: string;
  notes: string;
}

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookingData) => Promise<void>;
  selectedDate: Date | null;
  loading?: boolean;
}

export function BookingDialog({ open, onClose, onSubmit, selectedDate, loading = false }: BookingDialogProps) {
  const [formData, setFormData] = useState<BookingData>({
    user_name: "",
    start_time: "",
    end_time: "",
    purpose: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<BookingData>>({});
  const [isNameValid, setIsNameValid] = useState(false);

  React.useEffect(() => {
    if (open && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      setFormData({
        user_name: "",
        start_time: `${dateStr}T09:00`,
        end_time: `${dateStr}T17:00`,
        purpose: "",
        notes: "",
      });
      setErrors({});
    }
  }, [open, selectedDate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingData> = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = "Name is required";
    } else if (!isNameValid) {
      newErrors.user_name = "Please select a name from the list";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }
    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = "Purpose is required";
    }

    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      
      if (endTime <= startTime) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        user_name: "",
        start_time: "",
        end_time: "",
        purpose: "",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to submit booking:", error);
    }
  };

  const handleFieldChange = (field: keyof BookingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    setFormData({
      user_name: "",
      start_time: "",
      end_time: "",
      purpose: "",
      notes: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Car</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="user_name">Name *</Label>
            <NameSelector
              value={formData.user_name}
              onChange={(value) => handleFieldChange("user_name", value)}
              onValidationChange={setIsNameValid}
              placeholder="Select or type your name"
            />
            {errors.user_name && (
              <p className="text-sm text-destructive mt-1">{errors.user_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="start_time">Start Time *</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => handleFieldChange("start_time", e.target.value)}
            />
            {errors.start_time && (
              <p className="text-sm text-destructive mt-1">{errors.start_time}</p>
            )}
          </div>

          <div>
            <Label htmlFor="end_time">End Time *</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => handleFieldChange("end_time", e.target.value)}
            />
            {errors.end_time && (
              <p className="text-sm text-destructive mt-1">{errors.end_time}</p>
            )}
          </div>

          <div>
            <Label htmlFor="purpose">Purpose *</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleFieldChange("purpose", e.target.value)}
              placeholder="Enter purpose of trip"
            />
            {errors.purpose && (
              <p className="text-sm text-destructive mt-1">{errors.purpose}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Book Car"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface BookingConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  keyLocation: string;
}

export function BookingConfirmationDialog({ open, onClose, keyLocation }: BookingConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Booking Confirmed
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">
            Your car booking has been successfully created!
          </p>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium mb-1">Key Location:</p>
            <p className="text-sm text-muted-foreground">{keyLocation}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format, isSameDay, parseISO } from "date-fns";
import { CalendarIcon, Trash2, Car, Clock } from "lucide-react";
import { carScheduleService } from "@/services/carScheduleService";
import { BookingDialog } from "@/components/BookingDialog";
import { BookingConfirmationDialog } from "@/components/BookingConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CarSchedule {
  id: string;
  start_time: string;
  end_time: string;
  purpose: string;
  notes: string | null;
  user_name: string;
  created_at: string;
  updated_at: string;
}

interface BookingPageProps {
  accessLevel: 'team' | 'admin';
  keyLocation: string;
}

export function BookingPage({ accessLevel, keyLocation }: BookingPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<CarSchedule[]>([]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; scheduleId: string | null }>({
    open: false,
    scheduleId: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await carScheduleService.list();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to load schedules:", error);
      setError("Failed to load car schedules");
    }
  };

  const isDayBooked = (date: Date): boolean => {
    return schedules.some(schedule => {
      // Extract just the date part without timezone conversion
      const dateOnly = schedule.start_time.split('T')[0];
      const scheduleDate = new Date(dateOnly + 'T00:00:00');
      return isSameDay(date, scheduleDate);
    });
  };

  const getSchedulesForDate = (date: Date | undefined): CarSchedule[] => {
    if (!date) return [];
    return schedules.filter(schedule => {
      // Extract just the date part without timezone conversion
      const dateOnly = schedule.start_time.split('T')[0];
      const scheduleDate = new Date(dateOnly + 'T00:00:00');
      return isSameDay(date, scheduleDate);
    });
  };

  const handleBooking = async (bookingData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await carScheduleService.create({
        user_name: bookingData.user_name,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        purpose: bookingData.purpose,
        notes: bookingData.notes || null,
      });

      await loadSchedules();
      setShowBookingDialog(false);
      setShowConfirmationDialog(true);
      
      toast({
        title: "Success",
        description: "Car booking created successfully",
      });
    } catch (error) {
      console.error("Failed to create booking:", error);
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await carScheduleService.delete(scheduleId);
      await loadSchedules();
      setDeleteConfirmDialog({ open: false, scheduleId: null });
      
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  const formatTimeRange = (startTime: string, endTime: string): string => {
    // Extract time portion without timezone conversion
    const extractTime = (timestamp: string) => {
      const timePart = timestamp.split('T')[1];
      if (timePart) {
        const timeOnly = timePart.split('+')[0].split('Z')[0];
        return timeOnly.substring(0, 5); // HH:mm format
      }
      return timestamp;
    };
    
    return `${extractTime(startTime)} - ${extractTime(endTime)}`;
  };

  const todaysSchedules = getSchedulesForDate(selectedDate);

  return (
    <div className="space-y-6 fade-in">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("rounded-md border border-border shadow-sm", "p-3")}
                modifiers={{
                  booked: (date) => isDayBooked(date),
                }}
                modifiersClassNames={{
                  booked: "relative after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-[hsl(var(--soft-green))] after:rounded-full",
                }}
              />
            </div>
            
            <Button
              onClick={() => setShowBookingDialog(true)}
              disabled={!selectedDate}
              className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(200_50%_65%)] hover:opacity-90 transition-opacity"
              size="lg"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Book Car for {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Selected Date"}
            </Button>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Bookings for {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Selected Date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No bookings for this date</p>
                <p className="text-sm text-muted-foreground mt-1">Select a date and create your first booking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysSchedules.map((schedule, index) => (
                  <Card key={schedule.id} className={cn("bg-gradient-to-r from-[hsl(var(--soft-blue))] to-[hsl(var(--soft-purple))] border-0 scale-in")} style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{schedule.purpose}</h4>
                          <p className="text-sm text-muted-foreground font-medium">
                            {formatTimeRange(schedule.start_time, schedule.end_time)}
                          </p>
                          <p className="text-sm font-semibold text-foreground">{schedule.user_name}</p>
                          {schedule.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              "{schedule.notes}"
                            </p>
                          )}
                        </div>
                        {accessLevel === 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmDialog({ open: true, scheduleId: schedule.id })}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        open={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        onSubmit={handleBooking}
        selectedDate={selectedDate || null}
        loading={loading}
      />

      {/* Confirmation Dialog */}
      <BookingConfirmationDialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        keyLocation={keyLocation}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmDialog.open}
        onOpenChange={(open) => !open && setDeleteConfirmDialog({ open: false, scheduleId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmDialog.scheduleId && handleDeleteSchedule(deleteConfirmDialog.scheduleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
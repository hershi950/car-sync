import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format, isSameDay, parseISO } from "date-fns";
import { CalendarIcon, Download, Trash2, Car } from "lucide-react";
import { carScheduleService } from "@/services/carScheduleService";
import { appSettingsService } from "@/services/appSettingsService";
import { BookingDialog } from "@/components/BookingDialog";
import { BookingConfirmationDialog } from "@/components/BookingConfirmationDialog";
import { KeyLocationManager } from "@/components/KeyLocationManager";
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

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<CarSchedule[]>([]);
  const [keyLocation, setKeyLocation] = useState<string>("");
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
    loadKeyLocation();
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

  const loadKeyLocation = async () => {
    try {
      const location = await appSettingsService.get("key_location");
      setKeyLocation(location || "Front desk reception");
    } catch (error) {
      console.error("Failed to load key location:", error);
    }
  };

  const isDayBooked = (date: Date): boolean => {
    return schedules.some(schedule => {
      const scheduleDate = parseISO(schedule.start_time);
      return isSameDay(date, scheduleDate);
    });
  };

  const getSchedulesForDate = (date: Date | undefined): CarSchedule[] => {
    if (!date) return [];
    return schedules.filter(schedule => {
      const scheduleDate = parseISO(schedule.start_time);
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
      await loadKeyLocation();
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

  const exportToCSV = () => {
    if (schedules.length === 0) {
      toast({
        title: "No Data",
        description: "No bookings to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Start Time", "End Time", "Name", "Purpose", "Notes"];
    const csvContent = [
      headers.join(","),
      ...schedules.map(schedule => [
        format(parseISO(schedule.start_time), "yyyy-MM-dd"),
        format(parseISO(schedule.start_time), "HH:mm"),
        format(parseISO(schedule.end_time), "HH:mm"),
        `"${schedule.user_name}"`,
        `"${schedule.purpose}"`,
        `"${schedule.notes || ""}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `car_schedules_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Bookings exported to CSV",
    });
  };

  const formatTimeRange = (startTime: string, endTime: string): string => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  };

  const todaysSchedules = getSchedulesForDate(selectedDate);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Calendar */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Car Scheduling System
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                      disabled={schedules.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
                <KeyLocationManager onLocationUpdate={setKeyLocation} />
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className={cn("rounded-md border pointer-events-auto", "p-3")}
                      modifiers={{
                        booked: (date) => isDayBooked(date),
                      }}
                      modifiersClassNames={{
                        booked: "relative after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-green-500 after:rounded-full",
                      }}
                    />
                  </div>
                  
                  <Button
                    onClick={() => setShowBookingDialog(true)}
                    disabled={!selectedDate}
                    className="w-full max-w-sm"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Book Car for {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Selected Date"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Bookings List */}
          <div className="flex-1 lg:max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>
                  Bookings for {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Selected Date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysSchedules.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No bookings for this date
                  </p>
                ) : (
                  <div className="space-y-4">
                    {todaysSchedules.map((schedule) => (
                      <Card key={schedule.id} className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{schedule.purpose}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatTimeRange(schedule.start_time, schedule.end_time)}
                              </p>
                              <p className="text-sm font-medium">{schedule.user_name}</p>
                              {schedule.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {schedule.notes}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmDialog({ open: true, scheduleId: schedule.id })}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
    </div>
  );
};

export default Index;

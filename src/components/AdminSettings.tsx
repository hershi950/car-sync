import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { appSettingsService } from '@/services/appSettingsService';
import { Settings } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [teamPasscode, setTeamPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTeamPasscode();
    }
  }, [isOpen]);

  const loadTeamPasscode = async () => {
    try {
      const code = await appSettingsService.get('team_passcode');
      const currentCode = code || 'RAFAEL2025';
      setTeamPasscode(currentCode);
      setNewPasscode(currentCode);
    } catch (error) {
      console.error('Error loading team passcode:', error);
    }
  };

  const handleSave = async () => {
    if (!newPasscode.trim()) {
      toast({
        title: "Error",
        description: "Team passcode cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await appSettingsService.set('team_passcode', newPasscode.trim());
      setTeamPasscode(newPasscode.trim());
      setIsOpen(false);
      toast({
        title: "Team passcode updated",
        description: "The new team passcode has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving team passcode:', error);
      toast({
        title: "Error",
        description: "Failed to update team passcode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewPasscode(teamPasscode);
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Admin Settings
        </CardTitle>
        <CardDescription>
          Manage system settings and access codes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Team Passcode</p>
            <p className="text-sm text-muted-foreground">
              Code used by team members to access the system
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team Passcode</DialogTitle>
                <DialogDescription>
                  Update the passcode that team members use to access the booking system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="current-code" className="text-sm font-medium">
                    Current Team Passcode
                  </label>
                  <Input
                    id="current-code"
                    value={teamPasscode}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-code" className="text-sm font-medium">
                    New Team Passcode
                  </label>
                  <Input
                    id="new-code"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new team passcode"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading || !newPasscode.trim()}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
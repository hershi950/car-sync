import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { appSettingsService } from '@/services/appSettingsService';

interface PasscodeScreenProps {
  onAccessGranted: (accessLevel: 'team' | 'admin') => void;
}

const ADMIN_PASSCODE = 'RAFAELADMIN2025';

export const PasscodeScreen: React.FC<PasscodeScreenProps> = ({ onAccessGranted }) => {
  const [passcode, setPasscode] = useState('');
  const [teamPasscode, setTeamPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamPasscode();
  }, []);

  const loadTeamPasscode = async () => {
    try {
      const code = await appSettingsService.get('team_passcode');
      setTeamPasscode(code || 'RAFAEL2025'); // Default team passcode
    } catch (error) {
      console.error('Error loading team passcode:', error);
      setTeamPasscode('RAFAEL2025'); // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);

    try {
      if (passcode === ADMIN_PASSCODE) {
        localStorage.setItem('access_level', 'admin');
        onAccessGranted('admin');
        toast({
          title: "Admin access granted",
          description: "Welcome back, administrator!",
        });
      } else if (passcode === teamPasscode) {
        localStorage.setItem('access_level', 'team');
        onAccessGranted('team');
        toast({
          title: "Team access granted",
          description: "Welcome to the car booking system!",
        });
      } else {
        toast({
          title: "Invalid passcode",
          description: "Please check your code and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Car Booking Access</CardTitle>
          <CardDescription>
            Enter your access code to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="passcode" className="text-sm font-medium">
                Enter Rafael team code to access
              </label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="text-center text-lg tracking-wider"
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!passcode.trim() || loading}
            >
              {loading ? 'Verifying...' : 'Access System'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
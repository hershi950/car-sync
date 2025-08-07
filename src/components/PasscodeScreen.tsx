import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { appSettingsService } from '@/services/appSettingsService';

interface PasscodeScreenProps {
  onAccessGranted: (accessLevel: 'team' | 'admin', userName: string) => void;
}

const ADMIN_PASSCODE = 'RAFAELADMIN2025';

export const PasscodeScreen: React.FC<PasscodeScreenProps> = ({ onAccessGranted }) => {
  const [passcode, setPasscode] = useState('');
  const [userName, setUserName] = useState('');
  const [teamPasscode, setTeamPasscode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamPasscode();
    checkStoredPasscode();
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

  const checkStoredPasscode = async () => {
    const storedPasscode = localStorage.getItem('stored_passcode');
    const storedUserName = localStorage.getItem('user_name');
    if (storedPasscode && storedUserName) {
      // Load team passcode to verify
      const teamCode = await appSettingsService.get('team_passcode').catch(() => 'RAFAEL2025');
      
      if (storedPasscode === ADMIN_PASSCODE) {
        localStorage.setItem('access_level', 'admin');
        onAccessGranted('admin', storedUserName);
      } else if (storedPasscode === teamCode) {
        localStorage.setItem('access_level', 'team');
        onAccessGranted('team', storedUserName);
      } else {
        // Invalid stored passcode, clear it
        localStorage.removeItem('stored_passcode');
        localStorage.removeItem('access_level');
        localStorage.removeItem('user_name');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || !userName.trim()) return;

    setLoading(true);

    try {
      if (passcode === ADMIN_PASSCODE) {
        localStorage.setItem('access_level', 'admin');
        localStorage.setItem('user_name', userName.trim());
        if (rememberMe) {
          localStorage.setItem('stored_passcode', passcode);
        }
        onAccessGranted('admin', userName.trim());
        toast({
          title: "Admin access granted",
          description: "Welcome back, administrator!",
        });
      } else if (passcode === teamPasscode) {
        localStorage.setItem('access_level', 'team');
        localStorage.setItem('user_name', userName.trim());
        if (rememberMe) {
          localStorage.setItem('stored_passcode', passcode);
        }
        onAccessGranted('team', userName.trim());
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
              <label htmlFor="userName" className="text-sm font-medium">
                Your Name
              </label>
              <Input
                id="userName"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
            </div>
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
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label 
                htmlFor="remember-me" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me on this device
              </label>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!passcode.trim() || !userName.trim() || loading}
            >
              {loading ? 'Verifying...' : 'Access System'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
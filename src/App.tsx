import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PasscodeScreen } from "./components/PasscodeScreen";

const queryClient = new QueryClient();

const App = () => {
  const [accessLevel, setAccessLevel] = useState<'team' | 'admin' | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Check if user already has access
    const storedAccess = localStorage.getItem('access_level');
    const storedUserName = localStorage.getItem('user_name');
    if ((storedAccess === 'team' || storedAccess === 'admin') && storedUserName) {
      setAccessLevel(storedAccess);
      setUserName(storedUserName);
    }
  }, []);

  const handleAccessGranted = (level: 'team' | 'admin', name: string) => {
    setAccessLevel(level);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_level');
    localStorage.removeItem('stored_passcode');
    localStorage.removeItem('user_name');
    setAccessLevel(null);
    setUserName('');
  };

  if (!accessLevel) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PasscodeScreen onAccessGranted={handleAccessGranted} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index accessLevel={accessLevel} onLogout={handleLogout} userName={userName} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

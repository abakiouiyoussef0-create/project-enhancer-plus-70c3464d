import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import AccessDenied from "./pages/AccessDenied";
import Dashboard from "./pages/Dashboard";
import CreationBeats from "./pages/CreationBeats";
import CreationLoops from "./pages/CreationLoops";
import ScoreBeats from "./pages/ScoreBeats";
import ScoreLoops from "./pages/ScoreLoops";

import WeeklyPlanning from "./pages/WeeklyPlanning";
import AnalyticsHub from "./pages/AnalyticsHub";
import VoiceCloner from "./pages/VoiceCloner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/beats"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreationBeats />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/loops"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreationLoops />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/score-beats"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ScoreBeats />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/score-loops"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ScoreLoops />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/planning"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WeeklyPlanning />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/voice-cloner"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VoiceCloner />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsHub />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

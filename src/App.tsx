import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CreationBeats from "./pages/CreationBeats";
import CreationLoops from "./pages/CreationLoops";
import ScoreBeats from "./pages/ScoreBeats";
import ScoreLoops from "./pages/ScoreLoops";
import WeeklyPlanning from "./pages/WeeklyPlanning";
import AnalyticsHub from "./pages/AnalyticsHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/beats" element={<CreationBeats />} />
            <Route path="/loops" element={<CreationLoops />} />
            <Route path="/score-beats" element={<ScoreBeats />} />
            <Route path="/score-loops" element={<ScoreLoops />} />
            <Route path="/planning" element={<WeeklyPlanning />} />
            <Route path="/analytics" element={<AnalyticsHub />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

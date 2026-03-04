import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Index from "./pages/Index";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import Projects from "./pages/Projects";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Factories from "./pages/Factories";
import FactoryDetail from "./pages/FactoryDetail";

import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Production from "./pages/Production";
import ProductionSample from "./pages/ProductionSample";
import ProductionBulk from "./pages/ProductionBulk";
import Auth from "./pages/Auth";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><AdminRoute><Clients /></AdminRoute></ProtectedRoute>} />
              <Route path="/clients/:clientName" element={<ProtectedRoute><AdminRoute><ClientDetail /></AdminRoute></ProtectedRoute>} />
              <Route path="/factories" element={<ProtectedRoute><AdminRoute><Factories /></AdminRoute></ProtectedRoute>} />
              <Route path="/factories/:factoryName" element={<ProtectedRoute><AdminRoute><FactoryDetail /></AdminRoute></ProtectedRoute>} />
              
              <Route path="/production-sample" element={<ProtectedRoute><ProductionSample /></ProtectedRoute>} />
              <Route path="/production-bulk" element={<ProtectedRoute><ProductionBulk /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AdminRoute><Analytics /></AdminRoute></ProtectedRoute>} />
              <Route path="/production" element={<ProtectedRoute><AdminRoute><Production /></AdminRoute></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Citas from "./pages/Citas";
import Doctor from "./pages/Doctor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/citas" replace />} />
            <Route path="/dashboard/citas" element={<ProtectedRoute><Citas /></ProtectedRoute>} />
            <Route path="/dashboard/doctor" element={<ProtectedRoute><Doctor /></ProtectedRoute>} />
            {/* Rutas deshabilitadas - redirigen a citas */}
            <Route path="/dashboard/resultados" element={<Navigate to="/dashboard/citas" replace />} />
            <Route path="/dashboard/alertas" element={<Navigate to="/dashboard/citas" replace />} />
            <Route path="/dashboard/configuracion" element={<Navigate to="/dashboard/citas" replace />} />
            <Route path="*" element={<Navigate to="/dashboard/citas" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

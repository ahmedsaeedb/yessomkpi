import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { BrandProvider } from '@/context/BrandContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ViewerLayout } from '@/components/layout/ViewerLayout';
import { TooltipProvider } from '@/components/ui/tooltip';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Categories from '@/pages/Categories';
import Kpis from '@/pages/Kpis';
import QuarterData from '@/pages/QuarterData';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Users from '@/pages/Users';
import DisplaySettings from '@/pages/DisplaySettings';
import Results from '@/pages/Results';
import CostCenters from '@/pages/CostCenters';
import GeneralPlan from '@/pages/GeneralPlan';
import CorrectiveActions from '@/pages/CorrectiveActions';
import GeneralPlanView from '@/pages/GeneralPlanView';
import CorrectiveActionsView from '@/pages/CorrectiveActionsView';

export default function App() {
  return (
    <ThemeProvider>
      <BrandProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<ViewerLayout />}>
                    <Route path="/results" element={<Results />} />
                    <Route path="/general-plan" element={<GeneralPlanView />} />
                    <Route path="/corrective-actions" element={<CorrectiveActionsView />} />
                  </Route>

                  <Route element={<AdminRoute />}>
                    <Route element={<DashboardLayout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/kpis" element={<Kpis />} />
                      <Route path="/quarter-data" element={<QuarterData />} />
                      <Route path="/cost-centers" element={<CostCenters />} />
                      <Route path="/general-plan-settings" element={<GeneralPlan />} />
                      <Route path="/corrective-actions-settings" element={<CorrectiveActions />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/display-settings" element={<DisplaySettings />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <Toaster position="top-center" richColors closeButton dir="rtl" />
          </TooltipProvider>
        </AuthProvider>
      </BrandProvider>
    </ThemeProvider>
  );
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";

// Public App Pages
import Index from "./pages/Index";
import OrderPage from "./pages/OrderPage";
import TrackPage from "./pages/TrackPage";
import CustomerAccount from "./pages/CustomerAccount";

// WashStation App
import WashStation from "./pages/WashStation";
import StaffLogin from "./pages/StaffLogin";

// Admin App Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminBranches from "./pages/admin/AdminBranches";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import EnrollmentPage from "./pages/admin/EnrollmentPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrderProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* PUBLIC APP - washlab.com */}
            <Route path="/" element={<Index />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/account" element={<CustomerAccount />} />

            {/* WASHSTATION APP - app.washlab.com */}
            <Route path="/washstation" element={<WashStation />} />
            <Route path="/staff" element={<StaffLogin />} />

            {/* ADMIN APP - admin.washlab.com */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="branches" element={<AdminBranches />} />
              <Route path="attendance" element={<AdminOverview />} />
              <Route path="vouchers" element={<AdminOverview />} />
              <Route path="loyalty" element={<AdminOverview />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="whatsapp" element={<AdminOverview />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Enrollment - Deep link support */}
            <Route path="/admin/enroll/:token" element={<EnrollmentPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

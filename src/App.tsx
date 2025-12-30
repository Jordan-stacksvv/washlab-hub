import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";

// Public App Pages
import Home from "@/public-app/pages/Home";
import Order from "@/public-app/pages/Order";
import Track from "@/public-app/pages/Track";
import Pricing from "@/public-app/pages/Pricing";
import Account from "@/public-app/pages/Account";

// WashStation App Pages
import BranchEntry from "@/washstation-app/pages/BranchEntry";
import FaceScan from "@/washstation-app/pages/FaceScan";
import WashStationDashboard from "@/washstation-app/pages/Dashboard";

// Admin App Pages
import AdminLayout from "@/admin-app/AdminLayout";
import AdminDashboard from "@/admin-app/pages/Dashboard";
import Staff from "@/admin-app/pages/Staff";
import Branches from "@/admin-app/pages/Branches";
import Reports from "@/admin-app/pages/Reports";
import Settings from "@/admin-app/pages/Settings";
import Attendance from "@/admin-app/pages/Attendance";
import Vouchers from "@/admin-app/pages/Vouchers";
import Loyalty from "@/admin-app/pages/Loyalty";
import WhatsApp from "@/admin-app/pages/WhatsApp";
import Enroll from "@/admin-app/pages/Enroll";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * SINGLE ROUTER TREE
 * 
 * All routes are defined in one flat structure for proper SPA routing.
 * This ensures Vercel rewrites work correctly for deep links.
 * 
 * When splitting into 3 repos, each app gets its own subset of routes.
 * See SPLIT_GUIDE.md for instructions.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrderProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* PUBLIC APP - washlab.com */}
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/track" element={<Track />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/account" element={<Account />} />
            
            {/* WASHSTATION APP - app.washlab.com (tablet only) */}
            <Route path="/washstation" element={<BranchEntry />} />
            <Route path="/washstation/scan" element={<FaceScan />} />
            <Route path="/washstation/dashboard" element={<WashStationDashboard />} />
            
            {/* ADMIN APP - admin.washlab.com */}
            {/* Enrollment page - standalone, no layout */}
            <Route path="/admin/enroll/:token" element={<Enroll />} />
            
            {/* Main admin with layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="staff" element={<Staff />} />
              <Route path="branches" element={<Branches />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="vouchers" element={<Vouchers />} />
              <Route path="loyalty" element={<Loyalty />} />
              <Route path="reports" element={<Reports />} />
              <Route path="whatsapp" element={<WhatsApp />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

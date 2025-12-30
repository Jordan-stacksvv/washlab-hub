import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff';
import Branches from './pages/Branches';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Attendance from './pages/Attendance';
import Vouchers from './pages/Vouchers';
import Loyalty from './pages/Loyalty';
import WhatsApp from './pages/WhatsApp';
import Enroll from './pages/Enroll';

/**
 * Admin App Router
 * 
 * This router handles all admin routes:
 * - / (Dashboard)
 * - /staff (Staff management)
 * - /branches (Branch management)
 * - /reports (Reports & analytics)
 * - /settings (App settings)
 * - /enroll/:token (Staff enrollment - CRITICAL)
 * 
 * When splitting: This becomes the main router for admin.washlab.com
 * Note: Enrollment must work as a deep link from WhatsApp
 */
const AdminRouter = () => {
  return (
    <Routes>
      {/* Enrollment page - standalone, no layout */}
      <Route path="/enroll/:token" element={<Enroll />} />
      
      {/* Main admin with layout */}
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="staff" element={<Staff />} />
        <Route path="branches" element={<Branches />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="vouchers" element={<Vouchers />} />
        <Route path="loyalty" element={<Loyalty />} />
        <Route path="reports" element={<Reports />} />
        <Route path="whatsapp" element={<WhatsApp />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;

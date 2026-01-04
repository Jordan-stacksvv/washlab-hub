import { Routes, Route } from 'react-router-dom';
import BranchEntry from './pages/BranchEntry';
import FaceScan from './pages/FaceScan';
import ConfirmClockIn from './pages/ConfirmClockIn';
import ShiftManagement from './pages/ShiftManagement';
import POSDashboard from './pages/POSDashboard';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';

// Keep legacy dashboard for backward compatibility
import LegacyDashboard from './pages/Dashboard';

/**
 * WashStation App Router
 * 
 * This router handles all tablet POS routes:
 * - / (Branch entry / attendance - Employee ID + PIN login)
 * - /scan (Face scan for attendance - legacy)
 * - /confirm-clock-in (Confirm attendance before dashboard)
 * - /shift/:shiftId (Shift management / clock out)
 * - /dashboard (Main POS dashboard with sidebar)
 * - /new-order (Create new walk-in order)
 * - /orders (View active orders)
 * - /customers (Find and manage customers)
 * - /inventory (Inventory alerts and management)
 * - /settings (Branch and system settings)
 * 
 * When splitting: This becomes the main router for app.washlab.com
 * Note: In production, this will be mounted at / not /washstation
 */
const WashStationRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<BranchEntry />} />
      <Route path="/scan" element={<FaceScan />} />
      <Route path="/confirm-clock-in" element={<ConfirmClockIn />} />
      <Route path="/shift/:shiftId" element={<ShiftManagement />} />
      <Route path="/shift" element={<ShiftManagement />} />
      <Route path="/dashboard" element={<POSDashboard />} />
      <Route path="/new-order" element={<NewOrder />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:orderId" element={<Orders />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/settings" element={<Settings />} />
      {/* Legacy route for backward compatibility */}
      <Route path="/pos" element={<LegacyDashboard />} />
    </Routes>
  );
};

export default WashStationRouter;

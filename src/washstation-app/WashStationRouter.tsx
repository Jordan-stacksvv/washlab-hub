import { Routes, Route } from 'react-router-dom';
import BranchEntry from './pages/BranchEntry';
import FaceScan from './pages/FaceScan';
import Dashboard from './pages/Dashboard';

/**
 * WashStation App Router
 * 
 * This router handles all tablet POS routes:
 * - / (Branch entry / attendance)
 * - /scan (Face scan for attendance)
 * - /dashboard (Main POS dashboard)
 * 
 * When splitting: This becomes the main router for app.washlab.com
 * Note: In production, this will be mounted at / not /washstation
 */
const WashStationRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<BranchEntry />} />
      <Route path="/scan" element={<FaceScan />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default WashStationRouter;

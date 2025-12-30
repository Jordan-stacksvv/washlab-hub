import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Order from './pages/Order';
import Track from './pages/Track';
import Pricing from './pages/Pricing';
import Account from './pages/Account';

/**
 * Public App Router
 * 
 * This router handles all public-facing routes:
 * - / (Home/Landing)
 * - /order (Place order)
 * - /track (Track order)
 * - /pricing (Pricing info)
 * - /account (Customer account)
 * 
 * When splitting: This becomes the main router for washlab.com
 */
const PublicAppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/order" element={<Order />} />
      <Route path="/track" element={<Track />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/account" element={<Account />} />
    </Routes>
  );
};

export default PublicAppRouter;

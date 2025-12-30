import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/context/OrderContext";

// App Routers - each will become its own Vercel project
import PublicAppRouter from "@/public-app/PublicAppRouter";
import WashStationRouter from "@/washstation-app/WashStationRouter";
import AdminRouter from "@/admin-app/AdminRouter";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * TEMPORARY COMPOSITION
 * 
 * This App.tsx mounts all 3 apps under one SPA for development.
 * When splitting into 3 repos, each app gets its own App.tsx.
 * 
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
            <Route path="/*" element={<PublicAppRouter />} />
            
            {/* WASHSTATION APP - app.washlab.com */}
            <Route path="/washstation/*" element={<WashStationRouter />} />
            
            {/* ADMIN APP - admin.washlab.com */}
            <Route path="/admin/*" element={<AdminRouter />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

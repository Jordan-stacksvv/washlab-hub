import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { useOrders } from '@/context/OrderContext';
import { 
  Plus,
  ShoppingBag,
  Users,
  Smartphone,
  Package,
  CheckCircle,
  User,
  ArrowRight,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

const POSDashboard = () => {
  const navigate = useNavigate();
  const { orders, getPendingOrders } = useOrders();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const prevOrderCountRef = useRef(orders.length);

  useEffect(() => {
    const staffData = sessionStorage.getItem('washlab_active_staff');
    const branchData = sessionStorage.getItem('washlab_branch');
    
    // Do NOT redirect to login if session exists - stay on dashboard
    if (!staffData || !branchData) {
      navigate('/washstation');
      return;
    }
    
    const parsed = JSON.parse(staffData);
    const staff = Array.isArray(parsed) ? parsed[0] : parsed;
    setActiveStaff({ name: staff.name || 'Staff', role: staff.role || 'Attendant' });
    
    const branch = JSON.parse(branchData);
    setBranchName(branch.name || 'Central Branch');
  }, [navigate]);

  // Notification for new orders
  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) {
      const newOrder = orders[0];
      toast.success(`New Order! ${newOrder.code}`, {
        description: `${newOrder.customerName} - ${newOrder.orderType === 'online' ? 'Online Order' : 'Walk-in'}`,
        duration: 5000,
      });
    }
    prevOrderCountRef.current = orders.length;
  }, [orders]);

  const handleLogout = () => {
    // Navigate to shift management for proper clock-out flow
    navigate('/washstation/shift');
  };

  const pendingOrders = getPendingOrders();

  // Today's orders for stats
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === new Date().toDateString();
  });
  const walkInToday = todayOrders.filter(o => o.orderType === 'walkin').length;
  const onlineToday = todayOrders.filter(o => o.orderType === 'online').length;
  const completedToday = todayOrders.filter(o => o.status === 'completed').length;
  const deliveredToday = todayOrders.filter(o => o.status === 'completed').length;

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr ago`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending_dropoff: { label: 'New Order', className: 'bg-primary/10 text-primary' },
      checked_in: { label: 'Processing', className: 'bg-warning/10 text-warning' },
      washing: { label: 'Processing', className: 'bg-warning/10 text-warning' },
      drying: { label: 'Processing', className: 'bg-warning/10 text-warning' },
      folding: { label: 'Processing', className: 'bg-warning/10 text-warning' },
      ready: { label: 'Ready for Pickup', className: 'bg-success/10 text-success' },
      completed: { label: 'Delivered', className: 'bg-muted text-muted-foreground' }
    };
    return statusConfig[status] || statusConfig.pending_dropoff;
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <WashStationSidebar 
        activeStaff={activeStaff} 
        branchName={branchName}
      />
      
      <main className="flex-1 ml-64">
        <WashStationHeader 
          title={branchName}
          branchName={branchName}
          activeStaff={activeStaff}
          pendingCount={pendingOrders.length}
        />
        
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{todayOrders.length}</p>
              <p className="text-xs text-success mt-1">↗ +12%</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Walk-in</span>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">{walkInToday}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Online Orders</span>
                <Smartphone className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">{onlineToday}</p>
              <p className="text-xs text-primary mt-1">● {pendingOrders.length} New</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Completed</span>
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">{completedToday}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Delivered</span>
                <Package className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">{deliveredToday}</p>
            </div>
          </div>

          {/* Action Cards - "Start New Walk-in Order" ONLY exists here */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Start New Walk-in Order */}
            <button 
              onClick={() => navigate('/washstation/new-order')}
              className="bg-primary text-primary-foreground rounded-2xl p-8 text-left hover:bg-primary/90 transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-1">Start New Walk-in Order</h3>
              <p className="text-primary-foreground/80 text-sm">Select Service & Customer</p>
            </button>

            {/* Find Customer */}
            <button 
              onClick={() => navigate('/washstation/customers')}
              className="bg-card border border-border rounded-2xl p-8 text-left hover:bg-muted/50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Find Customer</h3>
              <p className="text-muted-foreground text-sm">Search by phone, name, or ID</p>
            </button>

            {/* Online Orders */}
            <button 
              onClick={() => navigate('/washstation/online-orders')}
              className="bg-card border border-border rounded-2xl p-8 text-left hover:bg-muted/50 transition-colors group relative"
            >
              {pendingOrders.length > 0 && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
                  {pendingOrders.length} Pending
                </span>
              )}
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Online Orders</h3>
              <p className="text-muted-foreground text-sm">Review and accept incoming requests</p>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <Link to="/washstation/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Activity Table */}
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Service Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.slice(0, 4).map((order) => {
                  const status = getStatusBadge(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-5 py-4 font-medium text-foreground">{order.code}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {order.customerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'CU'}
                          </div>
                          <span className="text-foreground">{order.customerName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {order.items?.[0]?.category?.replace('_', ' & ') || 'Wash & Fold'} ({order.weight || 5}kg)
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          ● {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-sm">
                        {getTimeAgo(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default POSDashboard;

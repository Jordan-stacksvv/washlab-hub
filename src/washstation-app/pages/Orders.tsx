import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { useOrders } from '@/context/OrderContext';
import { 
  Search,
  Filter,
  ChevronRight,
  Clock,
  Package,
  CheckCircle,
  Truck,
  Eye
} from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [filter, setFilter] = useState<'all' | 'processing' | 'ready' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const staffData = sessionStorage.getItem('washlab_active_staff');
    const branchData = sessionStorage.getItem('washlab_branch');
    
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

  const handleLogout = () => {
    sessionStorage.removeItem('washlab_active_staff');
    navigate('/washstation');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending_dropoff: { label: 'New Order', className: 'bg-primary/10 text-primary', icon: Clock },
      checked_in: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Package },
      washing: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Package },
      drying: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Package },
      folding: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Package },
      ready: { label: 'Ready for Pickup', className: 'bg-success/10 text-success', icon: CheckCircle },
      completed: { label: 'Delivered', className: 'bg-muted text-muted-foreground', icon: Truck }
    };
    return statusConfig[status] || statusConfig.pending_dropoff;
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all') {
      if (filter === 'processing') {
        if (!['checked_in', 'washing', 'drying', 'folding'].includes(order.status)) return false;
      } else if (filter === 'ready') {
        if (order.status !== 'ready') return false;
      } else if (filter === 'completed') {
        if (order.status !== 'completed') return false;
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.code?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerPhone?.includes(query)
      );
    }
    return true;
  });

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar 
        activeStaff={activeStaff} 
        branchName={branchName}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64">
        <WashStationHeader 
          title="Active Orders"
          branchName={branchName}
          activeStaff={activeStaff}
        />
        
        <div className="p-6">
          {/* Search & Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-muted rounded-xl p-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'processing', label: 'Processing' },
                  { id: 'ready', label: 'Ready' },
                  { id: 'completed', label: 'Completed' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === tab.id 
                        ? 'bg-card text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service Type</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const status = getStatusBadge(order.status);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-foreground">{order.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              {order.customerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'CU'}
                            </div>
                            <span className="font-medium text-foreground">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {order.items?.[0]?.category?.replace('_', ' & ') || 'Wash & Fold'} ({order.weight || 5}kg)
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.className}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
                          {getTimeAgo(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-primary hover:text-primary/80"
                            onClick={() => navigate(`/washstation/orders/${order.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No orders found
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

export default Orders;

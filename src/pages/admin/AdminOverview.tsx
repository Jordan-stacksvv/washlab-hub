import { useOrders } from '@/context/OrderContext';
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  Clock,
  CheckCircle
} from 'lucide-react';

const AdminOverview = () => {
  const { orders } = useOrders();

  // Calculate stats
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === new Date().toDateString();
  });
  
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status !== 'completed').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  const stats = [
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Revenue', value: `₵${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
    { label: "Today's Orders", value: todayOrders.length.toString(), icon: TrendingUp, color: 'bg-purple-500' },
    { label: "Today's Revenue", value: `₵${todayRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-orange-500' },
    { label: 'Pending Orders', value: pendingOrders.toString(), icon: Clock, color: 'bg-yellow-500' },
    { label: 'Completed Orders', value: completedOrders.toString(), icon: CheckCircle, color: 'bg-emerald-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome to WashLab Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold text-foreground">{order.code}</p>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">₵{(order.totalPrice || 0).toFixed(2)}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

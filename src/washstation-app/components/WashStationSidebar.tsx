import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Package, 
  Settings,
  Clock,
  CreditCard,
  Activity
} from 'lucide-react';
import washLabLogo from '@/assets/washlab-logo.png';

interface SidebarProps {
  activeStaff?: { name: string; role: string } | null;
  branchName?: string;
}

/**
 * WashStation Sidebar
 * 
 * Navigation:
 * - Dashboard
 * - Orders (Active Orders)
 * - Attendance
 * - Transactions
 * - Activity Log
 * - Customers
 * - Settings
 * 
 * "Start New Order" button is ONLY on Dashboard main content.
 * Profile bubble opens profile menu, not redirect to login.
 */
const WashStationSidebar = ({ activeStaff, branchName = 'Central Branch' }: SidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/washstation/dashboard' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/washstation/orders' },
    { id: 'attendance', label: 'Attendance', icon: Clock, path: '/washstation/attendance' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, path: '/washstation/transactions' },
    { id: 'activity', label: 'Activity Log', icon: Activity, path: '/washstation/activity' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/washstation/customers' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/washstation/inventory' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo - Always navigates to Dashboard */}
      <div className="p-4 border-b border-border">
        <Link to="/washstation/dashboard" className="flex items-center gap-2">
          <img src={washLabLogo} alt="WashLab" className="h-10 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active 
                  ? 'bg-primary text-primary-foreground font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings - Bottom */}
      <div className="p-3 border-t border-border">
        <Link
          to="/washstation/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/washstation/settings')
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Staff Info - Click to go to shift management */}
      {activeStaff && (
        <div className="p-4 border-t border-border">
          <Link 
            to="/washstation/shift"
            className="flex items-center gap-3 hover:bg-muted/50 p-2 -m-2 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-primary">
              {activeStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{activeStaff.name}</p>
              <p className="text-xs text-muted-foreground">{activeStaff.role}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default WashStationSidebar;

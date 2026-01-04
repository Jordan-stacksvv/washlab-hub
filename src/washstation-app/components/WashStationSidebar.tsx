import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  ClipboardList, 
  Users, 
  Package, 
  Settings,
  LogOut
} from 'lucide-react';
import washLabLogo from '@/assets/washlab-logo.png';

interface SidebarProps {
  activeStaff?: { name: string; role: string } | null;
  branchName?: string;
  onLogout?: () => void;
}

const WashStationSidebar = ({ activeStaff, branchName = 'Central Branch', onLogout }: SidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/washstation/dashboard' },
    { id: 'new-order', label: 'New Order', icon: Plus, path: '/washstation/new-order' },
    { id: 'orders', label: 'Active Orders', icon: ClipboardList, path: '/washstation/orders' },
    { id: 'online-orders', label: 'Online Orders', icon: ClipboardList, path: '/washstation/online-orders' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/washstation/customers' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/washstation/inventory' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/washstation/dashboard" className="flex items-center gap-3">
          <img src={washLabLogo} alt="WashLab" className="h-10 w-auto" />
          <div>
            <p className="font-semibold text-foreground text-sm">WashLab POS</p>
            <p className="text-xs text-muted-foreground">Station 04 • {branchName}</p>
          </div>
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

      {/* Staff Info */}
      {activeStaff && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {activeStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{activeStaff.name}</p>
              <p className="text-xs text-muted-foreground">{activeStaff.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="End Shift"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default WashStationSidebar;

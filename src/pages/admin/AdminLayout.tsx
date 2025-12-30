import { Link, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  Ticket,
  Award,
  FileText,
  MessageSquare,
  Settings,
  UserPlus,
  ChevronRight
} from 'lucide-react';

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { id: 'branches', label: 'Branches', icon: Building2, path: '/admin/branches' },
  { id: 'staff', label: 'Staff', icon: Users, path: '/admin/staff' },
  { id: 'attendance', label: 'Attendance', icon: Clock, path: '/admin/attendance' },
  { id: 'vouchers', label: 'Vouchers', icon: Ticket, path: '/admin/vouchers' },
  { id: 'loyalty', label: 'Loyalty', icon: Award, path: '/admin/loyalty' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, path: '/admin/whatsapp' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayout = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary flex flex-col fixed h-screen">
        <div className="p-6 border-b border-white/10">
          <Link to="/admin">
            <Logo size="sm" />
          </Link>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  active 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/admin/enroll/new"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm">Create Enrollment Link</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

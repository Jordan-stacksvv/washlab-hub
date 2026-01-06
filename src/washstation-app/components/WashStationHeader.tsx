import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import ProfileMenu from './ProfileMenu';

interface HeaderProps {
  title: string;
  branchName?: string;
  terminalId?: string;
  activeStaff?: { name: string; role: string; id?: string; clockInTime?: string } | null;
  pendingCount?: number;
  onNotificationClick?: () => void;
}

const WashStationHeader = ({ 
  title, 
  branchName = 'Central Branch',
  terminalId = '#042',
  activeStaff,
  pendingCount = 0,
  onNotificationClick 
}: HeaderProps) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [staffWithClockIn, setStaffWithClockIn] = useState<any>(null);

  useEffect(() => {
    // Get clock-in time from session storage
    const staffData = sessionStorage.getItem('washlab_active_staff');
    if (!staffData) return;

    const parsed = JSON.parse(staffData);
    const staff = Array.isArray(parsed) ? parsed[0] : parsed;
    const clockInTime = staff?.clockInTime ? new Date(staff.clockInTime) : new Date();

    // Store staff with clock-in time for profile menu
    setStaffWithClockIn({
      ...activeStaff,
      clockInTime: staff?.clockInTime,
      id: staff?.id
    });

    const updateTimer = () => {
      const now = new Date();
      const diff = now.getTime() - clockInTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeStaff]);

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <span className="text-sm text-muted-foreground">Terminal ID: {terminalId}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Branch Status Timer - shows elapsed time since clock-in */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-primary">{elapsedTime}</span>
        </div>

        {/* Notifications */}
        <button 
          onClick={onNotificationClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors relative"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Staff Avatar - Opens Profile Menu on click */}
        {activeStaff && (
          <div className="relative flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right">
              <p className="font-medium text-foreground text-sm">{activeStaff.name}</p>
              <p className="text-xs text-muted-foreground">{activeStaff.role}</p>
            </div>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <User className="w-5 h-5 text-primary" />
            </button>

            {/* Profile Menu */}
            <ProfileMenu 
              isOpen={showProfileMenu}
              onClose={() => setShowProfileMenu(false)}
              staff={staffWithClockIn}
              branchName={branchName}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default WashStationHeader;

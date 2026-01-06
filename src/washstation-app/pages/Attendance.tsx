import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { Button } from '@/components/ui/button';
import { 
  Clock,
  User,
  CheckCircle,
  LogIn,
  LogOut,
  Calendar,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceEntry {
  staffId: string;
  staffName: string;
  branchId?: string;
  branchName?: string;
  action: 'clock_in' | 'clock_out';
  timestamp: string;
  shiftId?: string;
}

interface ActiveStaffMember {
  id: string;
  name: string;
  role: string;
  clockInTime: string;
  shiftId: string;
}

const WashStationAttendance = () => {
  const navigate = useNavigate();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [attendanceLog, setAttendanceLog] = useState<AttendanceEntry[]>([]);
  const [activeStaffList, setActiveStaffList] = useState<ActiveStaffMember[]>([]);

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
    
    // Set active staff list
    const staffList = Array.isArray(parsed) ? parsed : [parsed];
    setActiveStaffList(staffList);
    
    const branch = JSON.parse(branchData);
    setBranchName(branch.name || 'Central Branch');

    // Load attendance log
    const log = JSON.parse(localStorage.getItem('washlab_attendance_log') || '[]');
    setAttendanceLog(log.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, [navigate]);

  const getElapsedTime = (clockInTime: string) => {
    const now = new Date();
    const clockIn = new Date(clockInTime);
    const diff = now.getTime() - clockIn.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const todayLogs = attendanceLog.filter(entry => 
    new Date(entry.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar activeStaff={activeStaff} branchName={branchName} />
      
      <main className="flex-1 ml-64">
        <WashStationHeader title="Attendance" branchName={branchName} activeStaff={activeStaff} />
        
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">CURRENTLY ACTIVE</span>
                <Users className="w-4 h-4 text-success" />
              </div>
              <p className="text-3xl font-bold text-success">{activeStaffList.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">CLOCK-INS TODAY</span>
                <LogIn className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {todayLogs.filter(l => l.action === 'clock_in').length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">CLOCK-OUTS TODAY</span>
                <LogOut className="w-4 h-4 text-warning" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {todayLogs.filter(l => l.action === 'clock_out').length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">DATE</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold text-foreground">{format(new Date(), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Active Staff */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Currently Clocked In
              </h3>
              
              {activeStaffList.length > 0 ? (
                <div className="space-y-3">
                  {activeStaffList.map((staff, idx) => (
                    <div 
                      key={idx}
                      onClick={() => navigate('/washstation/shift')}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-success">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-success">
                          {staff.clockInTime ? getElapsedTime(staff.clockInTime) : '--:--'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Since {staff.clockInTime ? format(new Date(staff.clockInTime), 'hh:mm a') : '--'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No staff currently clocked in</p>
                </div>
              )}
            </div>

            {/* Today's Log */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Today's Activity</h3>
              
              {todayLogs.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {todayLogs.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        entry.action === 'clock_in' ? 'bg-success/10' : 'bg-warning/10'
                      }`}>
                        {entry.action === 'clock_in' ? (
                          <LogIn className="w-4 h-4 text-success" />
                        ) : (
                          <LogOut className="w-4 h-4 text-warning" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{entry.staffName}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.action === 'clock_in' ? 'Clocked In' : 'Clocked Out'}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.timestamp), 'hh:mm a')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No attendance recorded today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WashStationAttendance;

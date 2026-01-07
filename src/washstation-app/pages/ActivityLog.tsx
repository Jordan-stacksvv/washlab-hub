import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Filter,
  Clock,
  User,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  CreditCard,
  Package,
  Fingerprint,
  Calendar,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface ActivityEntry {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  actionType: 'clock_in' | 'clock_out' | 'payment' | 'order_update' | 'verification' | 'other';
  orderId?: string;
  branchName?: string;
  verified: boolean;
  timestamp: string;
  details?: string;
}

const ActivityLog = () => {
  const navigate = useNavigate();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // DATE FILTER
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');

  // Get unique staff names for filter
  const uniqueStaff = [...new Set(activities.map(a => a.staffName).filter(Boolean))];

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

    loadActivities();
  }, [navigate]);

  const loadActivities = () => {
    // Aggregate activities from multiple logs
    const allActivities: ActivityEntry[] = [];

    // Attendance logs
    const attendanceLog = JSON.parse(localStorage.getItem('washlab_attendance_log') || '[]');
    attendanceLog.forEach((entry: any, idx: number) => {
      allActivities.push({
        id: `att-${idx}`,
        staffId: entry.staffId,
        staffName: entry.staffName,
        action: entry.action === 'clock_in' ? 'Clocked In' : 'Clocked Out',
        actionType: entry.action,
        branchName: entry.branchName,
        verified: true,
        timestamp: entry.timestamp,
        details: `Branch: ${entry.branchName}`
      });
    });

    // Activity log (order updates, etc.)
    const activityLog = JSON.parse(localStorage.getItem('washlab_activity_log') || '[]');
    activityLog.forEach((entry: any, idx: number) => {
      allActivities.push({
        id: `act-${idx}`,
        staffId: entry.staffId || '',
        staffName: entry.staffName,
        action: entry.action,
        actionType: 'order_update',
        orderId: entry.orderId,
        verified: true,
        timestamp: entry.timestamp,
        details: entry.orderId ? `Order: ${entry.orderId}` : undefined
      });
    });

    // Verification logs
    const verificationLog = JSON.parse(localStorage.getItem('washlab_verification_log') || '[]');
    verificationLog.forEach((entry: any, idx: number) => {
      allActivities.push({
        id: `ver-${idx}`,
        staffId: entry.staffId,
        staffName: entry.staffName,
        action: entry.action || 'Verification',
        actionType: 'verification',
        orderId: entry.orderId,
        verified: entry.verified,
        timestamp: entry.timestamp,
        details: entry.orderId ? `Order: ${entry.orderId}` : undefined
      });
    });

    // Transaction logs (payments)
    const transactions = JSON.parse(localStorage.getItem('washlab_transactions') || '[]');
    transactions.forEach((txn: any, idx: number) => {
      allActivities.push({
        id: `txn-${idx}`,
        staffId: txn.staffId,
        staffName: txn.staffName,
        action: `Payment Processed (${txn.paymentMethod})`,
        actionType: 'payment',
        orderId: txn.orderCode,
        verified: true,
        timestamp: txn.createdAt,
        details: `GH₵ ${txn.amount?.toFixed(2) || '0.00'} - ${txn.customerName}`
      });
    });

    // Sort by timestamp (newest first)
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(allActivities);
  };

  const getActionIcon = (actionType: string) => {
    switch(actionType) {
      case 'clock_in': return <LogIn className="w-4 h-4 text-success" />;
      case 'clock_out': return <LogOut className="w-4 h-4 text-warning" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-primary" />;
      case 'order_update': return <Package className="w-4 h-4 text-muted-foreground" />;
      case 'verification': return <Fingerprint className="w-4 h-4 text-primary" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Apply all filters
  const filteredActivities = activities.filter(activity => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        activity.staffName?.toLowerCase().includes(query) ||
        activity.action?.toLowerCase().includes(query) ||
        activity.orderId?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }
    
    // Date from filter
    if (dateFrom) {
      const activityDate = new Date(activity.timestamp);
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (activityDate < fromDate) return false;
    }
    
    // Date to filter
    if (dateTo) {
      const activityDate = new Date(activity.timestamp);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (activityDate > toDate) return false;
    }
    
    // Action type filter
    if (actionTypeFilter !== 'all' && activity.actionType !== actionTypeFilter) {
      return false;
    }
    
    // Staff filter
    if (staffFilter !== 'all' && activity.staffName !== staffFilter) {
      return false;
    }
    
    return true;
  });

  const handleExport = () => {
    const csv = [
      ['Date', 'Time', 'Staff', 'Action', 'Details', 'Verified'].join(','),
      ...filteredActivities.map(a => [
        format(new Date(a.timestamp), 'yyyy-MM-dd'),
        format(new Date(a.timestamp), 'HH:mm:ss'),
        a.staffName,
        a.action,
        a.details || '',
        a.verified ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar activeStaff={activeStaff} branchName={branchName} />
      
      <main className="flex-1 ml-64">
        <WashStationHeader title="Activity Log" branchName={branchName} activeStaff={activeStaff} />
        
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">TOTAL ACTIVITIES</p>
              <p className="text-2xl font-bold text-foreground">{activities.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">CLOCK INS</p>
              <p className="text-2xl font-bold text-success">
                {activities.filter(a => a.actionType === 'clock_in').length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">PAYMENTS</p>
              <p className="text-2xl font-bold text-primary">
                {activities.filter(a => a.actionType === 'payment').length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">VERIFICATIONS</p>
              <p className="text-2xl font-bold text-foreground">
                {activities.filter(a => a.actionType === 'verification').length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Filters</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Date From */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">From</span>
                </div>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              {/* Date To */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">To</span>
                </div>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              
              {/* Action Type */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Action Type</div>
                <select
                  value={actionTypeFilter}
                  onChange={(e) => setActionTypeFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-muted border-0 rounded-md text-foreground"
                >
                  <option value="all">All Actions</option>
                  <option value="clock_in">Clock In</option>
                  <option value="clock_out">Clock Out</option>
                  <option value="payment">Payment</option>
                  <option value="order_update">Order Update</option>
                  <option value="verification">Verification</option>
                </select>
              </div>
              
              {/* Staff */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Staff</div>
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-muted border-0 rounded-md text-foreground"
                >
                  <option value="all">All Staff</option>
                  {uniqueStaff.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setDateFrom('');
                  setDateTo('');
                  setActionTypeFilter('all');
                  setStaffFilter('all');
                }}
              >
                Clear Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-sm text-muted-foreground">
                Showing {filteredActivities.length} of {activities.length} activities
              </span>
            </div>
            <div className="divide-y divide-border">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {getActionIcon(activity.actionType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{activity.staffName}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-foreground">{activity.action}</span>
                          {activity.verified ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        {activity.details && (
                          <p className="text-sm text-muted-foreground mt-0.5">{activity.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.timestamp), 'MMM dd, yyyy • hh:mm:ss a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  No activity recorded yet
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLog;
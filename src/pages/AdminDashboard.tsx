import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useOrders } from '@/context/OrderContext';
import { 
  Building2, 
  Users, 
  Tag, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Download,
  Home,
  Gift,
  Clock,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  Package,
  ArrowRight,
  ArrowLeft,
  Shield,
  MessageCircle,
  Send,
  Link as LinkIcon,
  Fingerprint,
  Eye,
  Copy,
  Check,
  AlertCircle,
  Smartphone,
  Wallet,
  Banknote,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Branch {
  id: string;
  name: string;
  location: string;
  pricePerLoad: number;
  deliveryFee: number;
  isActive: boolean;
}

interface Staff {
  id: string;
  name: string;
  branchId: string;
  role: 'receptionist' | 'admin';
  isActive: boolean;
  phone: string;
  enrollmentLink?: string;
  isEnrolled: boolean;
}

interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_wash';
  discountValue: number;
  usedCount: number;
  usageLimit: number;
  validTo: string;
  branchId: string | null;
  phone?: string;
  isActive: boolean;
}

// Mock data
const mockBranches: Branch[] = [
  { id: '1', name: 'Main Campus', location: 'Legon', pricePerLoad: 25, deliveryFee: 5, isActive: true },
  { id: '2', name: 'Hostel A', location: 'Akuafo Hall', pricePerLoad: 25, deliveryFee: 5, isActive: true },
  { id: '3', name: 'Hostel B', location: 'Volta Hall', pricePerLoad: 25, deliveryFee: 7, isActive: false },
];

const mockStaff: Staff[] = [
  { id: '1', name: 'Portia Mensah', branchId: '1', role: 'receptionist', isActive: true, phone: '0551111111', isEnrolled: true },
  { id: '2', name: 'J.J Nortey', branchId: '1', role: 'receptionist', isActive: true, phone: '0552222222', isEnrolled: false },
  { id: '3', name: 'Admin User', branchId: '1', role: 'admin', isActive: true, phone: '0553333333', isEnrolled: true },
];

const mockVouchers: Voucher[] = [
  { id: '1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, usedCount: 45, usageLimit: 100, validTo: '2025-02-28', branchId: null, isActive: true },
  { id: '2', code: 'FREEWASH', discountType: 'free_wash', discountValue: 1, usedCount: 12, usageLimit: 50, validTo: '2025-03-15', branchId: '1', isActive: true },
  { id: '3', code: 'XMAS25', discountType: 'percentage', discountValue: 25, usedCount: 30, usageLimit: 30, validTo: '2024-12-31', branchId: null, isActive: false },
];

const mockCustomers = [
  { phone: '0551234567', name: 'Kwame Asante', loyaltyPoints: 8, totalOrders: 12, totalSpent: 450 },
  { phone: '0201234567', name: 'Ama Serwaa', loyaltyPoints: 3, totalOrders: 5, totalSpent: 175 },
  { phone: '0551112222', name: 'Kofi Mensah', loyaltyPoints: 10, totalOrders: 15, totalSpent: 525 },
];

type Tab = 'overview' | 'branches' | 'staff' | 'attendance' | 'vouchers' | 'loyalty' | 'reports' | 'whatsapp';

const sidebarItems: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'branches', label: 'Branches', icon: Building2 },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'vouchers', label: 'Vouchers', icon: Tag },
  { id: 'loyalty', label: 'Loyalty', icon: Gift },
  { id: 'reports', label: 'Reports', icon: Download },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

const AdminDashboard = () => {
  const { orders, getTotalRevenue, getCashRevenue, getOnlineRevenue, getRevenueByDate, getOrdersByDateRange } = useOrders();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState('Main Campus');
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchers);
  
  // Dialog states
  const [newBranch, setNewBranch] = useState({ name: '', location: '', pricePerLoad: 25, deliveryFee: 5 });
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', branchId: '1', role: 'receptionist' as 'receptionist' | 'admin' });
  const [newVoucher, setNewVoucher] = useState({ code: '', discountType: 'percentage' as const, discountValue: 10, usageLimit: 100, validTo: '', phone: '' });
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappRecipient, setWhatsappRecipient] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Calculate stats from live data
  const todayRevenue = getRevenueByDate(new Date());
  const totalRevenue = getTotalRevenue();
  const cashRevenue = getCashRevenue();
  const onlineRevenue = getOnlineRevenue();
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === new Date().toDateString();
  });

  const handleLogin = () => {
    if (loginPassword === 'admin123') {
      setIsLoggedIn(true);
      toast.success('Welcome, Admin!');
    } else {
      toast.error('Invalid password');
    }
  };

  // Branch functions
  const addBranch = () => {
    if (!newBranch.name || !newBranch.location) {
      toast.error('Please fill in all fields');
      return;
    }
    const branch: Branch = {
      id: `branch-${Date.now()}`,
      ...newBranch,
      isActive: true
    };
    setBranches([...branches, branch]);
    setNewBranch({ name: '', location: '', pricePerLoad: 25, deliveryFee: 5 });
    toast.success('Branch added successfully');
  };

  // Staff functions
  const addStaffMember = () => {
    if (!newStaff.name || !newStaff.phone) {
      toast.error('Please fill in all fields');
      return;
    }
    const staffMember: Staff = {
      id: `staff-${Date.now()}`,
      ...newStaff,
      isActive: true,
      isEnrolled: false,
      enrollmentLink: `${window.location.origin}/washstation?enroll=${Date.now()}`
    };
    setStaff([...staff, staffMember]);
    setNewStaff({ name: '', phone: '', branchId: '1', role: 'receptionist' });
    toast.success('Staff member added. Send them the enrollment link!');
  };

  const generateEnrollmentLink = (staffId: string) => {
    const link = `${window.location.origin}/washstation?enroll=${staffId}&t=${Date.now()}`;
    const staffMember = staff.find(s => s.id === staffId);
    if (staffMember) {
      setStaff(staff.map(s => s.id === staffId ? { ...s, enrollmentLink: link } : s));
    }
    return link;
  };

  const sendEnrollmentLinkViaWhatsApp = (staffMember: Staff) => {
    const link = staffMember.enrollmentLink || generateEnrollmentLink(staffMember.id);
    const message = encodeURIComponent(
      `🧺 *WashLab Staff Enrollment*\n\nHi ${staffMember.name}!\n\nPlease click the link below to enroll your biometrics for attendance:\n\n${link}\n\nThis will allow you to sign in/out using Face ID or fingerprint.`
    );
    const phone = staffMember.phone.startsWith('0') ? `233${staffMember.phone.slice(1)}` : staffMember.phone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened with enrollment link');
  };

  // Voucher functions
  const addVoucher = () => {
    if (!newVoucher.code || !newVoucher.validTo) {
      toast.error('Please fill in all fields');
      return;
    }
    const voucher: Voucher = {
      id: `voucher-${Date.now()}`,
      ...newVoucher,
      usedCount: 0,
      branchId: null,
      isActive: true
    };
    setVouchers([...vouchers, voucher]);
    setNewVoucher({ code: '', discountType: 'percentage', discountValue: 10, usageLimit: 100, validTo: '', phone: '' });
    toast.success('Voucher created successfully');
  };

  const sendVoucherViaWhatsApp = (voucher: Voucher) => {
    if (!voucher.phone) {
      toast.error('No phone number associated with this voucher');
      return;
    }
    const message = encodeURIComponent(
      `🎁 *WashLab Voucher*\n\nYou've received a special voucher!\n\nCode: *${voucher.code}*\nDiscount: ${voucher.discountType === 'percentage' ? `${voucher.discountValue}% off` : voucher.discountType === 'free_wash' ? `${voucher.discountValue} free wash` : `₵${voucher.discountValue} off`}\nValid until: ${voucher.validTo}\n\nUse it on your next order!`
    );
    const phone = voucher.phone.startsWith('0') ? `233${voucher.phone.slice(1)}` : voucher.phone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened with voucher');
  };

  // WhatsApp broadcast
  const sendWhatsAppBroadcast = () => {
    if (!whatsappRecipient || !whatsappMessage) {
      toast.error('Please enter recipient and message');
      return;
    }
    const message = encodeURIComponent(whatsappMessage);
    const phone = whatsappRecipient.startsWith('0') ? `233${whatsappRecipient.slice(1)}` : whatsappRecipient;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened');
  };

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    toast.success('Link copied!');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Report generation
  const generatePDFReport = () => {
    const reportData = {
      date: selectedDate,
      branch: selectedBranch,
      orders: getOrdersByDateRange(new Date(selectedDate), new Date(selectedDate)),
      revenue: getRevenueByDate(new Date(selectedDate))
    };
    
    // Create printable report
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>WashLab Report - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f3f4f6; }
            .total { font-size: 24px; font-weight: bold; color: #1e40af; }
          </style>
        </head>
        <body>
          <h1>🧺 WashLab Daily Report</h1>
          <p><strong>Date:</strong> ${selectedDate}</p>
          <p><strong>Branch:</strong> ${selectedBranch}</p>
          <h2>Revenue Summary</h2>
          <table>
            <tr><th>Payment Method</th><th>Amount</th></tr>
            <tr><td>Cash</td><td>₵${reportData.revenue.cash}</td></tr>
            <tr><td>Online (Hubtel/MoMo)</td><td>₵${reportData.revenue.online}</td></tr>
            <tr><td><strong>Total</strong></td><td class="total">₵${reportData.revenue.total}</td></tr>
          </table>
          <h2>Orders (${reportData.orders.length})</h2>
          <table>
            <tr><th>Code</th><th>Customer</th><th>Status</th><th>Amount</th><th>Payment</th></tr>
            ${reportData.orders.map(o => `
              <tr>
                <td>${o.code}</td>
                <td>${o.customerName}</td>
                <td>${o.status}</td>
                <td>₵${o.paidAmount || o.totalPrice || 0}</td>
                <td>${o.paymentMethod || 'pending'}</td>
              </tr>
            `).join('')}
          </table>
          <p style="margin-top: 40px; color: #666;">Generated on ${new Date().toLocaleString()}</p>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('PDF report generated');
  };

  const generateExcelReport = () => {
    const reportData = getOrdersByDateRange(new Date(selectedDate), new Date(selectedDate));
    const revenue = getRevenueByDate(new Date(selectedDate));
    
    // Create CSV content
    let csv = 'WashLab Report\n';
    csv += `Date,${selectedDate}\n`;
    csv += `Branch,${selectedBranch}\n\n`;
    csv += 'Revenue Summary\n';
    csv += `Cash,${revenue.cash}\n`;
    csv += `Online,${revenue.online}\n`;
    csv += `Total,${revenue.total}\n\n`;
    csv += 'Orders\n';
    csv += 'Code,Customer,Phone,Status,Amount,Payment Method,Created\n';
    reportData.forEach(o => {
      csv += `${o.code},${o.customerName},${o.customerPhone},${o.status},${o.paidAmount || o.totalPrice || 0},${o.paymentMethod || 'pending'},${new Date(o.createdAt).toLocaleString()}\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `washlab-report-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Excel (CSV) report downloaded');
  };

  // Get attendance logs from orders (staff who processed them)
  const getAttendanceLogs = () => {
    const logs: { staffName: string; action: string; timestamp: string; branch: string }[] = [];
    orders.forEach(o => {
      if (o.checkedInBy) {
        logs.push({
          staffName: o.checkedInBy,
          action: 'Checked in order',
          timestamp: new Date(o.createdAt).toLocaleString(),
          branch: 'Main Campus'
        });
      }
      if (o.processedBy && o.paidAt) {
        logs.push({
          staffName: o.processedBy,
          action: 'Processed payment',
          timestamp: new Date(o.paidAt).toLocaleString(),
          branch: 'Main Campus'
        });
      }
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
        <header className="p-4 md:p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Admin Dashboard</h1>
              <p className="text-white/60 text-lg">Enter your password to continue</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-primary/30">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="password" className="text-foreground text-sm font-medium mb-2 block">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter password"
                    className="h-14 rounded-xl border-2 border-border focus:border-primary"
                  />
                </div>
                <Button 
                  onClick={handleLogin} 
                  className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 font-semibold"
                >
                  Access Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-6 text-center">
                Demo password: <span className="font-mono font-semibold text-primary">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary flex flex-col fixed h-screen">
        <div className="p-6 border-b border-white/10">
          <Link to="/">
            <Logo size="sm" />
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === item.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/washstation">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            >
              <Package className="w-5 h-5 mr-3" />
              WashStation
            </Button>
          </Link>
          <Link to="/">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            >
              <Home className="w-5 h-5 mr-3" />
              Back to Home
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/20"
            onClick={() => setIsLoggedIn(false)}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto bg-muted/30">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-foreground capitalize">{activeTab}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Today
                    </span>
                  </div>
                  <p className="text-3xl font-display font-bold text-foreground mb-1">₵{todayRevenue.total}</p>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-display font-bold text-foreground mb-1">{todayOrders.length}</p>
                  <p className="text-sm text-muted-foreground">Orders Today</p>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-display font-bold text-foreground mb-1">₵{totalRevenue}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue (All Time)</p>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-display font-bold text-foreground mb-1">{branches.filter(b => b.isActive).length}</p>
                  <p className="text-sm text-muted-foreground">Active Branches</p>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-4">Today's Revenue Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Banknote className="w-6 h-6 text-emerald-600" />
                        <span className="font-medium">Cash</span>
                      </div>
                      <span className="text-xl font-bold text-emerald-600">₵{todayRevenue.cash}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-purple-600" />
                        <span className="font-medium">Online (Hubtel/MoMo)</span>
                      </div>
                      <span className="text-xl font-bold text-purple-600">₵{todayRevenue.online}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-4">All-Time Revenue</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Banknote className="w-6 h-6 text-muted-foreground" />
                        <span className="font-medium">Cash Total</span>
                      </div>
                      <span className="text-xl font-bold">₵{cashRevenue}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-muted-foreground" />
                        <span className="font-medium">Online Total</span>
                      </div>
                      <span className="text-xl font-bold">₵{onlineRevenue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Add Branch', icon: Building2, onClick: () => setActiveTab('branches') },
                    { label: 'Add Staff', icon: Users, onClick: () => setActiveTab('staff') },
                    { label: 'Create Voucher', icon: Tag, onClick: () => setActiveTab('vouchers') },
                    { label: 'Export Report', icon: Download, onClick: () => setActiveTab('reports') },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <action.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm text-foreground font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-semibold text-foreground">Recent Orders</h3>
                  <Link to="/washstation">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-medium">{order.code}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              order.status === 'ready' ? 'bg-violet-100 text-violet-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell>₵{order.paidAmount || order.totalPrice || '—'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                            }`}>
                              {order.paymentStatus === 'paid' ? order.paymentMethod?.toUpperCase() : 'Pending'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No orders yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Branches Tab */}
          {activeTab === 'branches' && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg text-foreground">Manage Branches</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Branch
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Branch</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Branch Name</Label>
                        <Input 
                          value={newBranch.name}
                          onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                          placeholder="e.g. Main Campus" 
                          className="mt-1" 
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input 
                          value={newBranch.location}
                          onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                          placeholder="e.g. Legon" 
                          className="mt-1" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price per Load (₵)</Label>
                          <Input 
                            type="number" 
                            value={newBranch.pricePerLoad}
                            onChange={(e) => setNewBranch({ ...newBranch, pricePerLoad: parseInt(e.target.value) || 25 })}
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label>Delivery Fee (₵)</Label>
                          <Input 
                            type="number" 
                            value={newBranch.deliveryFee}
                            onChange={(e) => setNewBranch({ ...newBranch, deliveryFee: parseInt(e.target.value) || 5 })}
                            className="mt-1" 
                          />
                        </div>
                      </div>
                      <Button onClick={addBranch} className="w-full rounded-xl bg-primary hover:bg-primary/90">
                        Add Branch
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price/Load</TableHead>
                      <TableHead>Delivery Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.location}</TableCell>
                        <TableCell>₵{branch.pricePerLoad}</TableCell>
                        <TableCell>₵{branch.deliveryFee}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            branch.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                          }`}>
                            {branch.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg text-foreground">Manage Staff</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Staff</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Full Name</Label>
                          <Input 
                            value={newStaff.name}
                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                            placeholder="e.g. John Doe" 
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          <Input 
                            value={newStaff.phone}
                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                            placeholder="0XX XXX XXXX" 
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label>Branch</Label>
                          <select 
                            value={newStaff.branchId}
                            onChange={(e) => setNewStaff({ ...newStaff, branchId: e.target.value })}
                            className="w-full mt-1 h-10 rounded-xl border border-input bg-background px-3"
                          >
                            {branches.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Role</Label>
                          <select 
                            value={newStaff.role}
                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'receptionist' | 'admin' })}
                            className="w-full mt-1 h-10 rounded-xl border border-input bg-background px-3"
                          >
                            <option value="receptionist">Receptionist</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <Button onClick={addStaffMember} className="w-full rounded-xl bg-primary hover:bg-primary/90">
                          Add Staff Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Biometrics</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.phone}</TableCell>
                          <TableCell>{branches.find(b => b.id === s.branchId)?.name}</TableCell>
                          <TableCell className="capitalize">{s.role}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                              s.isEnrolled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              <Fingerprint className="w-3 h-3" />
                              {s.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {!s.isEnrolled && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => sendEnrollmentLinkViaWhatsApp(s)}
                                className="text-emerald-600"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Send Link
                              </Button>
                            )}
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Enrollment Links */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">Quick Enrollment Links</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Share these links with staff to enroll their biometrics for attendance.
                </p>
                <div className="space-y-3">
                  {staff.filter(s => !s.isEnrolled).map(s => {
                    const link = s.enrollmentLink || generateEnrollmentLink(s.id);
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">{link}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyLink(link, s.id)}
                        >
                          {copiedLink === s.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => sendEnrollmentLinkViaWhatsApp(s)}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    );
                  })}
                  {staff.filter(s => !s.isEnrolled).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">All staff are enrolled!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex gap-4 flex-wrap">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="mt-1 w-48" 
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Branch</Label>
                  <select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="mt-1 h-10 rounded-xl border border-input bg-background px-3 w-48"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-4">Staff Activity Log</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Branch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getAttendanceLogs().map((log, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{log.staffName}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.timestamp}</TableCell>
                          <TableCell>{log.branch}</TableCell>
                        </TableRow>
                      ))}
                      {getAttendanceLogs().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No activity logs yet. Process some orders to see staff activity.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Vouchers Tab */}
          {activeTab === 'vouchers' && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg text-foreground">Manage Vouchers</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Voucher
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Voucher</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Voucher Code</Label>
                        <Input 
                          value={newVoucher.code}
                          onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. SAVE20" 
                          className="mt-1" 
                        />
                      </div>
                      <div>
                        <Label>Discount Type</Label>
                        <select 
                          value={newVoucher.discountType}
                          onChange={(e) => setNewVoucher({ ...newVoucher, discountType: e.target.value as any })}
                          className="w-full mt-1 h-10 rounded-xl border border-input bg-background px-3"
                        >
                          <option value="percentage">Percentage Off</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="free_wash">Free Wash</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Value</Label>
                          <Input 
                            type="number" 
                            value={newVoucher.discountValue}
                            onChange={(e) => setNewVoucher({ ...newVoucher, discountValue: parseInt(e.target.value) || 0 })}
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label>Usage Limit</Label>
                          <Input 
                            type="number" 
                            value={newVoucher.usageLimit}
                            onChange={(e) => setNewVoucher({ ...newVoucher, usageLimit: parseInt(e.target.value) || 100 })}
                            className="mt-1" 
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Valid Until</Label>
                        <Input 
                          type="date" 
                          value={newVoucher.validTo}
                          onChange={(e) => setNewVoucher({ ...newVoucher, validTo: e.target.value })}
                          className="mt-1" 
                        />
                      </div>
                      <div>
                        <Label>Recipient Phone (Optional - for gifting)</Label>
                        <Input 
                          value={newVoucher.phone}
                          onChange={(e) => setNewVoucher({ ...newVoucher, phone: e.target.value })}
                          placeholder="0XX XXX XXXX" 
                          className="mt-1" 
                        />
                      </div>
                      <Button onClick={addVoucher} className="w-full rounded-xl bg-primary hover:bg-primary/90">
                        Create Voucher
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Used/Limit</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-mono font-medium">{voucher.code}</TableCell>
                        <TableCell className="capitalize">{voucher.discountType.replace('_', ' ')}</TableCell>
                        <TableCell>
                          {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : 
                           voucher.discountType === 'free_wash' ? `${voucher.discountValue} wash` : 
                           `₵${voucher.discountValue}`}
                        </TableCell>
                        <TableCell>{voucher.usedCount}/{voucher.usageLimit}</TableCell>
                        <TableCell>{voucher.validTo}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            voucher.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                          }`}>
                            {voucher.isActive ? 'Active' : 'Expired'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {voucher.phone && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => sendVoucherViaWhatsApp(voucher)}
                              className="text-emerald-600"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Loyalty Tab */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Loyalty Program</h3>
                <p className="text-muted-foreground mb-4">
                  Customers earn 1 point per completed wash. 10 points = 1 free wash voucher.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-3xl font-display font-bold text-primary">{mockCustomers.length}</p>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-3xl font-display font-bold text-primary">
                      {mockCustomers.filter(c => c.loyaltyPoints >= 10).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Eligible for Free Wash</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-3xl font-display font-bold text-primary">
                      {mockCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Points Earned</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-4">Customer Loyalty</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCustomers.map((customer) => (
                        <TableRow key={customer.phone}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              customer.loyaltyPoints >= 10 ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                            }`}>
                              {customer.loyaltyPoints} pts
                            </span>
                          </TableCell>
                          <TableCell>{customer.totalOrders}</TableCell>
                          <TableCell>₵{customer.totalSpent}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex gap-4 flex-wrap items-end">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="mt-1 w-48" 
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Branch</Label>
                  <select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="mt-1 h-10 rounded-xl border border-input bg-background px-3 w-48"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={generatePDFReport} variant="outline" className="rounded-xl">
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button onClick={generateExcelReport} variant="outline" className="rounded-xl">
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-6">Daily Report Preview</h2>
                
                {(() => {
                  const dayOrders = getOrdersByDateRange(new Date(selectedDate), new Date(selectedDate));
                  const dayRevenue = getRevenueByDate(new Date(selectedDate));
                  
                  return (
                    <>
                      <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-semibold">{selectedDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Branch</p>
                            <p className="font-semibold">{selectedBranch}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Orders</p>
                            <p className="font-semibold">{dayOrders.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <Banknote className="w-4 h-4" /> Cash
                              </span>
                              <span className="font-medium">₵{dayRevenue.cash}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <Smartphone className="w-4 h-4" /> Online (Hubtel/MoMo)
                              </span>
                              <span className="font-medium">₵{dayRevenue.online}</span>
                            </div>
                            <div className="flex justify-between py-3 bg-primary/5 rounded-xl px-4 mt-4">
                              <span className="font-semibold">Total Revenue</span>
                              <span className="font-bold text-xl text-primary">₵{dayRevenue.total}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-4">Order Summary</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">Total Orders</span>
                              <span className="font-medium">{dayOrders.length}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">Completed</span>
                              <span className="font-medium">{dayOrders.filter(o => o.status === 'completed').length}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">Paid</span>
                              <span className="font-medium">{dayOrders.filter(o => o.paymentStatus === 'paid').length}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                              <span className="text-muted-foreground">Pending Payment</span>
                              <span className="font-medium">{dayOrders.filter(o => o.paymentStatus === 'pending').length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-4">Send WhatsApp Message</h2>
                <p className="text-muted-foreground mb-6">
                  Send custom messages, order links, or promotional content via WhatsApp.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label>Recipient Phone Number</Label>
                    <Input
                      value={whatsappRecipient}
                      onChange={(e) => setWhatsappRecipient(e.target.value)}
                      placeholder="0XX XXX XXXX"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      placeholder="Enter your message..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  <Button onClick={sendWhatsAppBroadcast} className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
                    <Send className="w-4 h-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">Quick Share Links</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Order Page', url: `${window.location.origin}/order`, desc: 'Share with customers to place orders' },
                    { label: 'Track Order', url: `${window.location.origin}/track`, desc: 'Share for order tracking' },
                    { label: 'Customer Account', url: `${window.location.origin}/account`, desc: 'Share for loyalty & vouchers' },
                  ].map((link) => (
                    <div key={link.label} className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.desc}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyLink(link.url, link.label)}
                      >
                        {copiedLink === link.label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          const msg = encodeURIComponent(`🧺 WashLab\n\n${link.desc}\n\n${link.url}`);
                          window.open(`https://wa.me/?text=${msg}`, '_blank');
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Templates */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">Message Templates</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { 
                      label: 'Welcome Message', 
                      template: `🧺 Welcome to WashLab!\n\nWe're your campus laundry solution.\n\nPlace an order: ${window.location.origin}/order\nTrack your order: ${window.location.origin}/track\n\n✨ First wash? Use code WELCOME10 for 10% off!` 
                    },
                    { 
                      label: 'Promo Announcement', 
                      template: `🎉 WashLab Special Offer!\n\nGet 20% off your next wash!\nUse code: SAVE20\n\nValid until [DATE]\n\nOrder now: ${window.location.origin}/order` 
                    },
                    { 
                      label: 'Loyalty Milestone', 
                      template: `🎊 Congratulations!\n\nYou've earned 10 loyalty points at WashLab!\n\nYou're now eligible for a FREE WASH!\n\nClaim your reward: ${window.location.origin}/account` 
                    },
                    { 
                      label: 'New Branch Opening', 
                      template: `📢 WashLab is now open at [LOCATION]!\n\n🎁 Grand opening special: 25% off all orders this week!\n\nVisit us today or order online: ${window.location.origin}/order` 
                    },
                  ].map((t) => (
                    <div key={t.label} className="p-4 bg-muted/50 rounded-xl">
                      <p className="font-medium mb-2">{t.label}</p>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{t.template}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setWhatsappMessage(t.template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

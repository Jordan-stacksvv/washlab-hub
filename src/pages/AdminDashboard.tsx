import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  LayoutDashboard,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const mockBranches = [
  { id: '1', name: 'Main Campus', location: 'Legon', pricePerLoad: 25, deliveryFee: 5, isActive: true },
  { id: '2', name: 'Hostel A', location: 'Akuafo Hall', pricePerLoad: 25, deliveryFee: 5, isActive: true },
  { id: '3', name: 'Hostel B', location: 'Volta Hall', pricePerLoad: 25, deliveryFee: 7, isActive: false },
];

const mockStaff = [
  { id: '1', name: 'Portia Mensah', branchId: '1', role: 'receptionist', isActive: true, phone: '0551111111' },
  { id: '2', name: 'J.J Nortey', branchId: '1', role: 'receptionist', isActive: true, phone: '0552222222' },
  { id: '3', name: 'Admin User', branchId: '1', role: 'admin', isActive: true, phone: '0553333333' },
];

const mockVouchers = [
  { id: '1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, usedCount: 45, usageLimit: 100, validTo: '2025-02-28', branchId: null, isActive: true },
  { id: '2', code: 'FREEWASH', discountType: 'free_wash', discountValue: 1, usedCount: 12, usageLimit: 50, validTo: '2025-03-15', branchId: '1', isActive: true },
  { id: '3', code: 'XMAS25', discountType: 'percentage', discountValue: 25, usedCount: 30, usageLimit: 30, validTo: '2024-12-31', branchId: null, isActive: false },
];

const mockCustomers = [
  { phone: '0551234567', name: 'Kwame Asante', loyaltyPoints: 8, totalOrders: 12, totalSpent: 450 },
  { phone: '0201234567', name: 'Ama Serwaa', loyaltyPoints: 3, totalOrders: 5, totalSpent: 175 },
  { phone: '0551112222', name: 'Kofi Mensah', loyaltyPoints: 10, totalOrders: 15, totalSpent: 525 },
];

const mockAttendance = [
  { id: '1', staffName: 'Portia Mensah', action: 'sign_in', timestamp: '2025-01-15 08:00', branch: 'Main Campus' },
  { id: '2', staffName: 'J.J Nortey', action: 'sign_in', timestamp: '2025-01-15 08:05', branch: 'Main Campus' },
  { id: '3', staffName: 'Portia Mensah', action: 'sign_out', timestamp: '2025-01-15 16:00', branch: 'Main Campus' },
];

const mockDailyReport = {
  date: '2025-01-15',
  branch: 'Main Campus',
  staff: ['Portia Mensah', 'J.J Nortey'],
  wash: 14,
  dryer: 14,
  detergent: 7,
  extraDetergent: 1,
  technicalFault: 0,
  tokens: 28,
  hubtelAmount: 350,
  cashAmount: 0,
  totalAmount: 350,
};

type Tab = 'overview' | 'branches' | 'staff' | 'attendance' | 'vouchers' | 'loyalty' | 'reports';

const sidebarItems: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'branches', label: 'Branches', icon: Building2 },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'vouchers', label: 'Vouchers', icon: Tag },
  { id: 'loyalty', label: 'Loyalty', icon: Gift },
  { id: 'reports', label: 'Reports', icon: Download },
];

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedDate, setSelectedDate] = useState('2025-01-15');
  const [selectedBranch, setSelectedBranch] = useState('Main Campus');

  const handleLogin = () => {
    if (loginPassword === 'admin123') {
      setIsLoggedIn(true);
      toast.success('Welcome, Admin!');
    } else {
      toast.error('Invalid password');
    }
  };

  const generatePDFReport = () => {
    toast.success('PDF report generated and downloaded');
  };

  const generateExcelReport = () => {
    toast.success('Excel report generated and downloaded');
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
        {/* Header with Logo */}
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
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => window.location.href = '/'}
          >
            <Home className="w-5 h-5 mr-3" />
            Back to Home
          </Button>
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
          <h1 className="text-2xl font-display font-bold text-foreground capitalize">{activeTab}</h1>
        </header>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: '₵12,450', change: '+12%', icon: DollarSign, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                  { label: 'Orders Today', value: '47', change: '+8%', icon: Package, bgColor: 'bg-primary/10', iconColor: 'text-primary' },
                  { label: 'Active Staff', value: '6', change: '0%', icon: Users, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
                  { label: 'Branches', value: '3', change: '+1', icon: Building2, bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Add Branch', icon: Building2, onClick: () => setActiveTab('branches') },
                    { label: 'Add Staff', icon: Users, onClick: () => setActiveTab('staff') },
                    { label: 'Create Voucher', icon: Tag, onClick: () => setActiveTab('vouchers') },
                    { label: 'Export Report', icon: Download, onClick: generatePDFReport },
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
                        <Input placeholder="e.g. Main Campus" className="mt-1" />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input placeholder="e.g. Legon" className="mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price per Load (₵)</Label>
                          <Input type="number" defaultValue="25" className="mt-1" />
                        </div>
                        <div>
                          <Label>Delivery Fee (₵)</Label>
                          <Input type="number" defaultValue="5" className="mt-1" />
                        </div>
                      </div>
                      <Button className="w-full rounded-xl bg-primary hover:bg-primary/90" onClick={() => toast.success('Branch added')}>
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
                    {mockBranches.map((branch) => (
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
                        <Input placeholder="e.g. John Doe" className="mt-1" />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input placeholder="0XX XXX XXXX" className="mt-1" />
                      </div>
                      <div>
                        <Label>Branch</Label>
                        <select className="w-full mt-1 h-10 rounded-xl border border-input bg-background px-3">
                          {mockBranches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <select className="w-full mt-1 h-10 rounded-xl border border-input bg-background px-3">
                          <option value="receptionist">Receptionist</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <Button className="w-full rounded-xl bg-primary hover:bg-primary/90" onClick={() => toast.success('Staff member added')}>
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.phone}</TableCell>
                        <TableCell>{mockBranches.find(b => b.id === staff.branchId)?.name}</TableCell>
                        <TableCell className="capitalize">{staff.role}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            staff.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                          }`}>
                            {staff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
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

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex gap-4 flex-wrap">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 w-48" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Branch</Label>
                  <select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="mt-1 h-10 rounded-xl border border-input bg-background px-3 w-48"
                  >
                    {mockBranches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-4">Attendance Log</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Branch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAttendance.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.staffName}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              log.action === 'sign_in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {log.action === 'sign_in' ? 'Sign In' : 'Sign Out'}
                            </span>
                          </TableCell>
                          <TableCell>{log.timestamp}</TableCell>
                          <TableCell>{log.branch}</TableCell>
                        </TableRow>
                      ))}
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
                        <Input placeholder="e.g. SAVE20" className="mt-1" />
                      </div>
                      <div>
                        <Label>Discount Type</Label>
                        <select className="w-full mt-1 h-10 rounded-xl border border-input bg-background px-3">
                          <option value="percentage">Percentage Off</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="free_wash">Free Wash</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Value</Label>
                          <Input type="number" placeholder="e.g. 20" className="mt-1" />
                        </div>
                        <div>
                          <Label>Usage Limit</Label>
                          <Input type="number" placeholder="e.g. 100" className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Valid Until</Label>
                        <Input type="date" className="mt-1" />
                      </div>
                      <Button className="w-full rounded-xl bg-primary hover:bg-primary/90" onClick={() => toast.success('Voucher created')}>
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
                    {mockVouchers.map((voucher) => (
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
                    <p className="text-3xl font-display font-bold text-primary">156</p>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-3xl font-display font-bold text-primary">23</p>
                    <p className="text-sm text-muted-foreground">Free Washes Redeemed</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-3xl font-display font-bold text-primary">842</p>
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
              <div className="flex gap-4 flex-wrap">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 w-48" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Branch</Label>
                  <select 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="mt-1 h-10 rounded-xl border border-input bg-background px-3 w-48"
                  >
                    {mockBranches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={generatePDFReport} variant="outline" className="rounded-xl">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button onClick={generateExcelReport} variant="outline" className="rounded-xl">
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-6">Daily Reconciliation Report</h2>
                
                <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{mockDailyReport.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="font-semibold">{mockDailyReport.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Staff</p>
                      <p className="font-semibold">{mockDailyReport.staff.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Operations</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Wash Loads', value: mockDailyReport.wash },
                        { label: 'Dryer Loads', value: mockDailyReport.dryer },
                        { label: 'Detergent Used', value: mockDailyReport.detergent },
                        { label: 'Extra Detergent', value: mockDailyReport.extraDetergent },
                        { label: 'Technical Faults', value: mockDailyReport.technicalFault },
                        { label: 'Tokens Used', value: mockDailyReport.tokens },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Revenue</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Hubtel/Paystack', value: `₵${mockDailyReport.hubtelAmount}` },
                        { label: 'Cash', value: `₵${mockDailyReport.cashAmount}` },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-3 bg-primary/5 rounded-xl px-4 mt-4">
                        <span className="font-semibold">Total Revenue</span>
                        <span className="font-bold text-xl text-primary">₵{mockDailyReport.totalAmount}</span>
                      </div>
                    </div>
                  </div>
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

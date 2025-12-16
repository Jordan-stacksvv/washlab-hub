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
  LayoutDashboard
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
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/90 flex flex-col">
        {/* Header */}
        <header className="p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link to="/">
                <Logo size="lg" />
              </Link>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-white/70">Enter your password to continue</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="password" className="text-foreground text-sm font-medium">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter password"
                    className="mt-2 h-14 rounded-xl"
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
                Demo password: <span className="font-mono font-medium">admin123</span>
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
      <aside className="w-64 bg-primary flex flex-col">
        <div className="p-6 border-b border-white/10">
          <a href="/">
            <Logo size="sm" className="text-white" />
          </a>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
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
      <main className="flex-1 overflow-auto bg-muted/30">
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
                      <p className="text-xs text-muted-foreground">
                        Staff will register their face during their first sign-in via Face ID
                      </p>
                      <Button className="w-full rounded-xl bg-primary hover:bg-primary/90" onClick={() => toast.success('Staff added')}>
                        Add Staff
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
                      <TableHead>Role</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.phone}</TableCell>
                        <TableCell className="capitalize">{staff.role}</TableCell>
                        <TableCell>{mockBranches.find(b => b.id === staff.branchId)?.name}</TableCell>
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
                          <Button variant="ghost" size="icon" className="text-destructive">
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
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg text-white">Attendance Logs</h2>
                <div className="flex gap-3">
                  <Input type="date" defaultValue="2025-01-15" className="w-auto bg-slate-900 border-slate-600 text-white rounded-xl" />
                  <select className="h-10 rounded-xl border border-slate-600 bg-slate-900 text-white px-3">
                    <option>All Branches</option>
                    {mockBranches.map(b => (
                      <option key={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Staff Name</TableHead>
                      <TableHead className="text-slate-400">Action</TableHead>
                      <TableHead className="text-slate-400">Timestamp</TableHead>
                      <TableHead className="text-slate-400">Branch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAttendance.map((log) => (
                      <TableRow key={log.id} className="border-slate-700/50">
                        <TableCell className="font-medium text-white">{log.staffName}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.action === 'sign_in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {log.action === 'sign_in' ? 'Sign In' : 'Sign Out'}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-300">{log.timestamp}</TableCell>
                        <TableCell className="text-slate-300">{log.branch}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Vouchers Tab */}
          {activeTab === 'vouchers' && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg text-white">Manage Vouchers</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl bg-gradient-to-r from-primary to-wash-orange">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Voucher
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Voucher</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label className="text-slate-300">Voucher Code</Label>
                        <Input placeholder="e.g. SUMMER20" className="mt-1 bg-slate-900 border-slate-600 text-white uppercase" />
                      </div>
                      <div>
                        <Label className="text-slate-300">Discount Type</Label>
                        <select className="w-full mt-1 h-10 rounded-xl border border-slate-600 bg-slate-900 text-white px-3">
                          <option value="percentage">Percentage Off</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="free_wash">Free Wash</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300">Value</Label>
                          <Input type="number" placeholder="10" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                        </div>
                        <div>
                          <Label className="text-slate-300">Usage Limit</Label>
                          <Input type="number" placeholder="100" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300">Valid Until</Label>
                        <Input type="date" className="mt-1 bg-slate-900 border-slate-600 text-white" />
                      </div>
                      <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-wash-orange" onClick={() => toast.success('Voucher created')}>
                        Create Voucher
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Code</TableHead>
                      <TableHead className="text-slate-400">Discount</TableHead>
                      <TableHead className="text-slate-400">Usage</TableHead>
                      <TableHead className="text-slate-400">Valid Until</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockVouchers.map((voucher) => (
                      <TableRow key={voucher.id} className="border-slate-700/50">
                        <TableCell className="font-mono font-medium text-white">{voucher.code}</TableCell>
                        <TableCell className="text-slate-300">
                          {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : 
                           voucher.discountType === 'free_wash' ? 'Free Wash' : `₵${voucher.discountValue}`}
                        </TableCell>
                        <TableCell className="text-slate-300">{voucher.usedCount}/{voucher.usageLimit}</TableCell>
                        <TableCell className="text-slate-300">{voucher.validTo}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            voucher.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/50 text-slate-400'
                          }`}>
                            {voucher.isActive ? 'Active' : 'Expired'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
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
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg text-white">Customer Loyalty</h2>
                <Input placeholder="Search by phone or name" className="w-64 bg-slate-900 border-slate-600 text-white rounded-xl" />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Customer</TableHead>
                      <TableHead className="text-slate-400">Phone</TableHead>
                      <TableHead className="text-slate-400">Points</TableHead>
                      <TableHead className="text-slate-400">Orders</TableHead>
                      <TableHead className="text-slate-400">Total Spent</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCustomers.map((customer) => (
                      <TableRow key={customer.phone} className="border-slate-700/50">
                        <TableCell className="font-medium text-white">{customer.name}</TableCell>
                        <TableCell className="text-slate-300">{customer.phone}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                            {customer.loyaltyPoints} pts
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-300">{customer.totalOrders}</TableCell>
                        <TableCell className="text-slate-300">₵{customer.totalSpent}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            View History
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <h2 className="font-display font-semibold text-lg text-white mb-4">Generate Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-slate-300">Date</Label>
                    <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 bg-slate-900 border-slate-600 text-white rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Branch</Label>
                    <select 
                      className="w-full mt-1 h-10 rounded-xl border border-slate-600 bg-slate-900 text-white px-3"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      {mockBranches.map(b => (
                        <option key={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={generatePDFReport} className="flex-1 rounded-xl">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button onClick={generateExcelReport} variant="outline" className="flex-1 rounded-xl border-slate-600 text-slate-300">
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Report Preview */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="font-display font-semibold text-white mb-4">
                  Daily Report: {mockDailyReport.date} - {mockDailyReport.branch}
                </h3>
                <div className="bg-slate-900/50 rounded-xl p-6 font-mono text-sm">
                  <p className="text-slate-400 mb-4">Staff: {mockDailyReport.staff.join(', ')}</p>
                  <div className="grid grid-cols-2 gap-4 text-slate-300">
                    <div>Wash: <span className="text-white">{mockDailyReport.wash}</span></div>
                    <div>Dryer: <span className="text-white">{mockDailyReport.dryer}</span></div>
                    <div>Detergent: <span className="text-white">{mockDailyReport.detergent}</span></div>
                    <div>Extra Detergent: <span className="text-white">{mockDailyReport.extraDetergent}</span></div>
                    <div>Technical Fault: <span className="text-white">{mockDailyReport.technicalFault}</span></div>
                    <div>Tokens Used: <span className="text-white">{mockDailyReport.tokens}</span></div>
                  </div>
                  <hr className="border-slate-700 my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Hubtel Amount:</span>
                      <span className="text-white">₵{mockDailyReport.hubtelAmount}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Cash Amount:</span>
                      <span className="text-white">₵{mockDailyReport.cashAmount}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>TOTAL:</span>
                      <span className="text-emerald-400">₵{mockDailyReport.totalAmount}</span>
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

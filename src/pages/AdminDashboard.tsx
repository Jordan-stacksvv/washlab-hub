import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  DollarSign,
  Gift,
  Calendar,
  FileText,
  Clock,
  UserCheck,
  Settings
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

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Enter your password to continue</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter password"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Demo password: admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
              <Home className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsLoggedIn(false)}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <h1 className="text-2xl font-display font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="branches" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto p-1">
            <TabsTrigger value="branches" className="gap-2">
              <Building2 className="w-4 h-4" />
              Branches
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <Users className="w-4 h-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Clock className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="gap-2">
              <Tag className="w-4 h-4" />
              Vouchers
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="gap-2">
              <Gift className="w-4 h-4" />
              Loyalty
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Branches Tab */}
          <TabsContent value="branches">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Manage Branches</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
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
                      <Button className="w-full" onClick={() => toast.success('Branch added')}>
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
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            branch.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
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
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Manage Staff</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
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
                        <select className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3">
                          {mockBranches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <select className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3">
                          <option value="receptionist">Receptionist</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Staff will register their face during their first sign-in via Face ID
                      </p>
                      <Button className="w-full" onClick={() => toast.success('Staff added')}>
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
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            staff.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
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
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Attendance Logs</h2>
                <div className="flex gap-2">
                  <Input type="date" defaultValue="2025-01-15" className="w-auto" />
                  <select className="h-10 rounded-md border border-input bg-background px-3">
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
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Branch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAttendance.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.staffName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.action === 'sign_in' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
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
          </TabsContent>

          {/* Vouchers Tab */}
          <TabsContent value="vouchers">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Manage Vouchers</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
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
                        <Input placeholder="e.g. SUMMER20" className="mt-1" />
                      </div>
                      <div>
                        <Label>Discount Type</Label>
                        <select className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3">
                          <option value="percentage">Percentage Off</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="free_wash">Free Wash</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Value</Label>
                          <Input type="number" placeholder="10" className="mt-1" />
                        </div>
                        <div>
                          <Label>Usage Limit</Label>
                          <Input type="number" placeholder="100" className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Valid Until</Label>
                        <Input type="date" className="mt-1" />
                      </div>
                      <div>
                        <Label>Branch (optional)</Label>
                        <select className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3">
                          <option value="">All Branches</option>
                          {mockBranches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <Button className="w-full" onClick={() => toast.success('Voucher created')}>
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
                      <TableHead>Usage</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-medium font-mono">{voucher.code}</TableCell>
                        <TableCell className="capitalize">{voucher.discountType.replace('_', ' ')}</TableCell>
                        <TableCell>
                          {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` :
                           voucher.discountType === 'free_wash' ? `${voucher.discountValue} wash` :
                           `₵${voucher.discountValue}`}
                        </TableCell>
                        <TableCell>{voucher.usedCount} / {voucher.usageLimit}</TableCell>
                        <TableCell>{voucher.validTo}</TableCell>
                        <TableCell>{voucher.branchId ? mockBranches.find(b => b.id === voucher.branchId)?.name : 'All'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            voucher.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
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
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-semibold text-lg">Customer Loyalty</h2>
                  <p className="text-sm text-muted-foreground">10 points = 1 free wash</p>
                </div>
                <Input placeholder="Search by phone..." className="w-64" />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Free Washes Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCustomers.map((customer) => (
                      <TableRow key={customer.phone}>
                        <TableCell className="font-mono">{customer.phone}</TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-wash-orange/20 text-wash-orange">
                            <Gift className="w-3 h-3" />
                            {customer.loyaltyPoints}
                          </span>
                        </TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>₵{customer.totalSpent}</TableCell>
                        <TableCell>{Math.floor(customer.loyaltyPoints / 10)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Report Filters */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display font-semibold text-lg mb-4">Generate Report</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label>Branch</Label>
                    <select 
                      className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      {mockBranches.map(b => (
                        <option key={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input 
                      type="date" 
                      className="mt-1" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Staff (optional)</Label>
                    <select className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3">
                      <option>All Staff</option>
                      {mockStaff.filter(s => s.role === 'receptionist').map(s => (
                        <option key={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={generatePDFReport} className="flex-1">
                      <FileText className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button onClick={generateExcelReport} variant="outline" className="flex-1">
                      <Download className="w-4 h-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sample Report Preview */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{mockDailyReport.branch}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {mockDailyReport.date}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={generatePDFReport}>
                    <FileText className="w-4 h-4" />
                    Download
                  </Button>
                </div>

                <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Staff on duty:</p>
                  <p className="font-medium">{mockDailyReport.staff.join(', ')}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-wash-blue/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-display font-bold text-wash-blue">{mockDailyReport.wash}</p>
                    <p className="text-xs text-muted-foreground">Wash</p>
                  </div>
                  <div className="bg-wash-orange/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-display font-bold text-wash-orange">{mockDailyReport.dryer}</p>
                    <p className="text-xs text-muted-foreground">Dryer</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-2xl font-display font-bold">{mockDailyReport.detergent}</p>
                    <p className="text-xs text-muted-foreground">Detergent</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-2xl font-display font-bold">{mockDailyReport.tokens}</p>
                    <p className="text-xs text-muted-foreground">Tokens</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Extra Detergent</span>
                    <span>{mockDailyReport.extraDetergent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Technical Faults</span>
                    <span>{mockDailyReport.technicalFault}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hubtel/MoMo</span>
                    <span className="font-medium">₵{mockDailyReport.hubtelAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash</span>
                    <span className="font-medium">₵{mockDailyReport.cashAmount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-gradient flex items-center gap-1">
                      <DollarSign className="w-5 h-5" />
                      ₵{mockDailyReport.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

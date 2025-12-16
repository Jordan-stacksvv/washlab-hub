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
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const mockBranches = [
  { id: '1', name: 'Main Campus', location: 'Legon', pricePerLoad: 25, isActive: true },
  { id: '2', name: 'Hostel A', location: 'Akuafo Hall', pricePerLoad: 25, isActive: true },
];

const mockStaff = [
  { id: '1', name: 'Portia', branchId: '1', role: 'receptionist', isActive: true },
  { id: '2', name: 'J.J Nortey', branchId: '1', role: 'receptionist', isActive: true },
  { id: '3', name: 'Admin User', branchId: '1', role: 'admin', isActive: true },
];

const mockVouchers = [
  { id: '1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, usedCount: 45, usageLimit: 100, isActive: true },
  { id: '2', code: 'FREEWASH', discountType: 'free_wash', discountValue: 1, usedCount: 12, usageLimit: 50, isActive: true },
];

const mockCustomers = [
  { phone: '0551234567', name: 'Kwame Asante', loyaltyPoints: 8, totalOrders: 12 },
  { phone: '0201234567', name: 'Ama Serwaa', loyaltyPoints: 3, totalOrders: 5 },
  { phone: '0551112222', name: 'Kofi Mensah', loyaltyPoints: 10, totalOrders: 15 },
];

const mockDailyReport = {
  date: '2025-01-15',
  branch: 'Main Campus',
  staff: ['Portia', 'J.J Nortey'],
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
    // In production, this would generate an actual PDF
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
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="branches" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Branches</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Vouchers</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="gap-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Branches Tab */}
          <TabsContent value="branches">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Manage Branches</h2>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Add Branch
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price/Load</TableHead>
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
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Manage Staff</h2>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Add Staff
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
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
          </TabsContent>

          {/* Vouchers Tab */}
          <TabsContent value="vouchers">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Manage Vouchers</h2>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Create Voucher
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
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
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          voucher.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          {voucher.isActive ? 'Active' : 'Inactive'}
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
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-semibold text-lg">Customer Loyalty</h2>
                  <p className="text-sm text-muted-foreground">10 points = 1 free wash</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Free Washes Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCustomers.map((customer) => (
                    <TableRow key={customer.phone}>
                      <TableCell className="font-mono">{customer.phone}</TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Gift className="w-4 h-4 text-primary" />
                          {customer.loyaltyPoints}
                        </span>
                      </TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>{Math.floor(customer.loyaltyPoints / 10)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                    <Input className="mt-1" defaultValue="Main Campus" />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" className="mt-1" defaultValue="2025-01-15" />
                  </div>
                  <div>
                    <Label>Staff (optional)</Label>
                    <Input className="mt-1" placeholder="All staff" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={generatePDFReport} className="w-full">
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sample Report */}
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

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Staff on duty:</p>
                  <p className="font-medium">{mockDailyReport.staff.join(', ')}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-display font-bold text-primary">{mockDailyReport.wash}</p>
                    <p className="text-xs text-muted-foreground">Wash</p>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-display font-bold text-accent">{mockDailyReport.dryer}</p>
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

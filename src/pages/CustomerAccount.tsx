import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  User, 
  Gift, 
  History, 
  LogOut, 
  Phone,
  Mail,
  Lock,
  ChevronRight,
  Star,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner';

// Mock customer data
const mockCustomer = {
  phone: '0551234567',
  name: 'Kwame Asante',
  email: 'kwame@example.com',
  hall: 'Akuafo Hall',
  room: 'A302',
  loyaltyPoints: 8,
};

const mockOrders = [
  { code: 'WL-4921', status: 'completed', date: '2025-01-15', total: 50 },
  { code: 'WL-4892', status: 'completed', date: '2025-01-10', total: 75 },
  { code: 'WL-4856', status: 'completed', date: '2025-01-05', total: 25 },
];

const mockVouchers = [
  { code: 'WELCOME10', discount: '10% off', expiry: '2025-02-28', status: 'active' },
  { code: 'FREEWASH', discount: '1 Free Wash', expiry: '2025-03-15', status: 'active' },
];

const CustomerAccount = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = () => {
    if (phone === '0551234567' && password === '1234') {
      setIsLoggedIn(true);
      toast.success('Welcome back!');
    } else {
      toast.error('Invalid credentials. Try phone: 0551234567, password: 1234');
    }
  };

  const handleSignup = () => {
    if (phone && password && name) {
      setIsLoggedIn(true);
      toast.success('Account created successfully!');
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPhone('');
    setPassword('');
    toast.success('Logged out successfully');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-md mx-auto px-4 pt-24 pb-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-wash-blue/10 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-wash-blue" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Customer Account</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to view your orders, loyalty points, and redeem vouchers
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div>
                  <Label htmlFor="login-phone">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0XX XXX XXXX"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Login
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Demo: 0551234567 / 1234
                </p>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0XX XXX XXXX"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your existing loyalty points will be linked automatically
                  </p>
                </div>
                <div>
                  <Label htmlFor="signup-password">Create Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleSignup} className="w-full">
                  Create Account
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account? No problem!<br />
            You can still <Link to="/order" className="text-wash-blue hover:underline">place orders</Link> without signing up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl mx-auto px-4 pt-24 pb-12">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-wash-blue to-wash-orange flex items-center justify-center text-2xl text-white font-bold">
              {mockCustomer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-xl">{mockCustomer.name}</h2>
              <p className="text-muted-foreground text-sm">{mockCustomer.phone}</p>
              <p className="text-muted-foreground text-sm">{mockCustomer.hall}, Room {mockCustomer.room}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Loyalty Points */}
          <div className="bg-gradient-to-r from-wash-blue/10 to-wash-orange/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-wash-orange flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loyalty Points</p>
                <p className="text-2xl font-display font-bold">{mockCustomer.loyaltyPoints} <span className="text-sm font-normal text-muted-foreground">/ 10</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next reward</p>
              <p className="text-sm font-medium text-wash-blue">Free Wash!</p>
              <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-wash-blue to-wash-orange rounded-full transition-all"
                  style={{ width: `${(mockCustomer.loyaltyPoints / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" className="gap-2">
              <History className="w-4 h-4" />
              Order History
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="gap-2">
              <Ticket className="w-4 h-4" />
              Vouchers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-display font-semibold mb-4">Recent Orders</h3>
              {mockOrders.length > 0 ? (
                <div className="space-y-3">
                  {mockOrders.map((order) => (
                    <div
                      key={order.code}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate('/track')}
                    >
                      <div>
                        <p className="font-semibold">{order.code}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">₵{order.total}</span>
                        <StatusBadge status={order.status as any} size="sm" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vouchers">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-display font-semibold mb-4">Your Vouchers</h3>
              {mockVouchers.length > 0 ? (
                <div className="space-y-3">
                  {mockVouchers.map((voucher) => (
                    <div
                      key={voucher.code}
                      className="p-4 rounded-xl border-2 border-dashed border-wash-orange/30 bg-wash-orange/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-wash-blue">{voucher.code}</span>
                        <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">
                          {voucher.status}
                        </span>
                      </div>
                      <p className="font-semibold">{voucher.discount}</p>
                      <p className="text-xs text-muted-foreground">Valid until {voucher.expiry}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No vouchers available</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Link to="/order">
            <Button variant="hero" size="lg">
              Place New Order
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccount;

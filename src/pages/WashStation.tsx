import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ORDER_STAGES, OrderStatus } from '@/types';
import { useOrders, Order, PaymentMethod } from '@/context/OrderContext';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { PRICING_CONFIG, getServiceById, calculateTotalPrice, calculateLoads } from '@/config/pricing';
import washLabLogo from '@/assets/washlab-logo.png';
import stackedClothes from '@/assets/stacked-clothes.jpg';
import { 
  Search, 
  Plus, 
  Package, 
  Scale,
  Truck,
  Check,
  ChevronRight,
  ChevronLeft,
  Home,
  X,
  Phone,
  MapPin,
  User,
  ArrowRight,
  Bell,
  Fingerprint,
  Wallet,
  Banknote,
  Smartphone,
  LayoutDashboard,
  ShoppingBag,
  Users,
  CheckCircle2,
  Clock,
  Droplets,
  Wind,
  Sun,
  Settings,
  Delete,
  CreditCard,
  Minus,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

type MainView = 'dashboard' | 'walkin' | 'orders' | 'customers' | 'settings';
type ThemeMode = 'light' | 'dark';
type WalkinStep = 'phone' | 'order' | 'delivery' | 'summary' | 'payment' | 'confirmation';

interface SignedInStaff {
  id: string;
  name: string;
  signedInAt: Date;
}

interface WalkinData {
  phone: string;
  name: string;
  isNewCustomer: boolean;
  serviceType: 'wash_only' | 'wash_and_dry' | 'dry_only';
  weight: number;
  itemCount: number;
  notes: string;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress: string;
  deliveryInstructions: string;
  deliveryFee: number;
}

// Map pricing config services to include icons
const serviceTypes = PRICING_CONFIG.services.map(service => ({
  ...service,
  icon: service.id === 'wash_and_dry' ? Wind : service.id === 'wash_only' ? Droplets : Sun,
}));

const WashStation = () => {
  const { orders, addOrder, updateOrder, getPendingOrders, getActiveOrders, getReadyOrders, getCompletedOrders } = useOrders();
  const { isSupported, isProcessing, enrollStaff, verifyStaff, enrolledStaff } = useWebAuthn();
  
  const [mainView, setMainView] = useState<MainView>('dashboard');
  const [walkinStep, setWalkinStep] = useState<WalkinStep>('phone');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const prevOrderCountRef = useRef(orders.length);
  
  // Walk-in data
  const [walkinData, setWalkinData] = useState<WalkinData>({
    phone: '',
    name: '',
    isNewCustomer: true,
    serviceType: 'wash_and_dry',
    weight: 5.0,
    itemCount: 12,
    notes: '',
    deliveryOption: 'pickup',
    deliveryAddress: '',
    deliveryInstructions: '',
    deliveryFee: 0
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'cash'>('mobile_money');
  const [signedInStaff, setSignedInStaff] = useState<SignedInStaff[]>([
    { id: '1', name: 'Alex M.', signedInAt: new Date() }
  ]);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [enrollName, setEnrollName] = useState('');
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [showNotifications, setShowNotifications] = useState(false);

  // Toggle dark/light mode
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    document.documentElement.classList.toggle('dark', newMode === 'dark');
    toast.success(`Switched to ${newMode} mode`);
  };

  const pendingOrders = getPendingOrders();
  const activeOrders = getActiveOrders();
  const readyOrders = getReadyOrders();
  const completedOrdersList = getCompletedOrders();

  // Today's orders for stats
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === new Date().toDateString();
  });
  const walkInToday = todayOrders.filter(o => o.orderType === 'walkin').length;
  const onlineToday = todayOrders.filter(o => o.orderType === 'online').length;
  const completedToday = todayOrders.filter(o => o.status === 'completed').length;
  const deliveredToday = todayOrders.filter(o => o.status === 'completed').length;

  // Notification for new orders
  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) {
      const newOrder = orders[0];
      toast.success(`New Order! ${newOrder.code}`, {
        description: `${newOrder.customerName} - ${newOrder.orderType === 'online' ? 'Online Order' : 'Walk-in'}`,
        duration: 5000,
      });
    }
    prevOrderCountRef.current = orders.length;
  }, [orders]);

  const resetWalkin = () => {
    setWalkinData({
      phone: '',
      name: '',
      isNewCustomer: true,
      serviceType: 'wash_and_dry',
      weight: 5.0,
      itemCount: 12,
      notes: '',
      deliveryOption: 'pickup',
      deliveryAddress: '',
      deliveryInstructions: '',
      deliveryFee: 0
    });
    setWalkinStep('phone');
  };

  // Calculate pricing using centralized config
  const calculatePrice = () => {
    const includeDelivery = walkinData.deliveryOption === 'delivery';
    return calculateTotalPrice(walkinData.serviceType, walkinData.weight, includeDelivery);
  };

  // Process walk-in order
  const processWalkinOrder = () => {
    const { total } = calculatePrice();
    
    const newOrder = addOrder({
      code: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      customerPhone: walkinData.phone,
      customerName: walkinData.name,
      hall: '',
      room: '',
      status: 'checked_in' as OrderStatus,
      bagCardNumber: `${Math.floor(Math.random() * 900) + 100}`,
      items: [{ category: walkinData.serviceType, quantity: walkinData.itemCount }],
      totalPrice: total,
      weight: walkinData.weight,
      loads: Math.ceil(walkinData.weight / 5),
      hasWhites: false,
      paymentMethod: 'pending',
      paymentStatus: 'pending',
      orderType: 'walkin',
      checkedInBy: signedInStaff[0]?.name || 'Unknown',
    });

    setCompletedOrder(newOrder);
    setWalkinStep('payment');
  };

  // Process payment
  const processPayment = async (method: PaymentMethod) => {
    if (completedOrder) {
      if (method === 'hubtel' || method === 'momo') {
        toast.success(`USSD prompt sent to ${completedOrder.customerPhone}`, {
          description: `Amount: ₵${completedOrder.totalPrice?.toFixed(2)} via Mobile Money`
        });
      }

      updateOrder(completedOrder.id, {
        paymentMethod: method,
        paymentStatus: 'paid',
        paidAt: new Date(),
        paidAmount: completedOrder.totalPrice || 0,
        processedBy: signedInStaff[0]?.name || 'Unknown',
      });

      setCompletedOrder(prev => prev ? { ...prev, paymentMethod: method, paymentStatus: 'paid' } : null);
      toast.success('Payment recorded successfully!');
      setWalkinStep('confirmation');
    }
  };

  const sendWhatsAppReceipt = (order: Order) => {
    const message = encodeURIComponent(
      `*WashLab Receipt – ${order.code}*\n*Amount Paid:* ₵${order.totalPrice?.toFixed(2)}\n\nThank you for choosing WashLab! 🧺`
    );
    const phone = order.customerPhone.startsWith('0') ? `233${order.customerPhone.slice(1)}` : order.customerPhone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened');
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Header Component
  const Header = () => (
    <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      <Link to="/washstation" className="flex items-center gap-2">
        <img src={washLabLogo} alt="WashLab" className="h-8 w-auto" />
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/admin" className="px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Admin
        </Link>
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
        >
          {themeMode === 'light' ? (
            <Sun className="w-5 h-5 text-muted-foreground" />
          ) : (
            <span className="w-5 h-5 text-muted-foreground">🌙</span>
          )}
        </button>
        
        {/* Notifications Button */}
        <button 
          onClick={() => {
            setShowNotifications(!showNotifications);
            if (pendingOrders.length > 0) {
              toast.info(`${pendingOrders.length} pending orders waiting`, {
                description: 'Click to view all orders'
              });
              setMainView('orders');
            } else {
              toast.info('No new notifications');
            }
          }}
          className="p-2 rounded-lg hover:bg-muted transition-colors relative"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {pendingOrders.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {pendingOrders.length}
            </span>
          )}
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="font-semibold text-foreground text-sm">{signedInStaff[0]?.name || 'Staff'}</p>
            <p className="text-xs text-muted-foreground">Shift Manager</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="p-6 space-y-6">
      {/* Welcome Section with Blue Gradient - matches logo */}
      <div className="bg-gradient-to-r from-primary via-primary to-wash-blue-light rounded-2xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-1">{getGreeting()}, {signedInStaff[0]?.name?.split(' ')[0] || 'Staff'}</h1>
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Clock className="w-4 h-4" />
          <span>{formatTime()} | {formatDate()}</span>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium opacity-80">ORDERS TODAY</span>
              <ShoppingBag className="w-4 h-4 opacity-60" />
            </div>
            <p className="text-3xl font-bold">{todayOrders.length}</p>
            <p className="text-xs opacity-70">↗ +12% vs last week</p>
          </div>
          
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium opacity-80">WALK-IN ORDERS</span>
              <Users className="w-4 h-4 opacity-60" />
            </div>
            <p className="text-3xl font-bold">{walkInToday}</p>
            <p className="text-xs opacity-70">↗ +12% vs last week</p>
          </div>
          
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium opacity-80">ONLINE ORDERS</span>
              <Smartphone className="w-4 h-4 opacity-60" />
            </div>
            <p className="text-3xl font-bold">{onlineToday}</p>
            <p className="text-xs opacity-70">↗ +12% vs last week</p>
          </div>
          
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium opacity-80">COMPLETED</span>
              <Package className="w-4 h-4 opacity-60" />
            </div>
            <p className="text-3xl font-bold">{completedToday}</p>
            <p className="text-xs opacity-70">Ready for pickup</p>
          </div>
          
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium opacity-80">DELIVERED</span>
              <CheckCircle2 className="w-4 h-4 opacity-60" />
            </div>
            <p className="text-3xl font-bold">{deliveredToday}</p>
            <p className="text-xs opacity-70">picked up</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* New Walk-In Order Card */}
        <div className="col-span-2 bg-gradient-to-br from-primary/5 to-white border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">New Walk-In Order</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            Start a new drop-off service for a walk-in customer. Quick entry for weigh-in and preferences.
          </p>
          <Button 
            onClick={() => { setMainView('walkin'); resetWalkin(); }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-3 text-lg font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Order
          </Button>
        </div>

        {/* Right Side Cards */}
        <div className="space-y-4">
          {/* Find Customer */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Find Customer</h3>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by phone number..."
                className="pl-10 h-11 rounded-xl bg-muted border-0"
              />
            </div>
            <Button variant="outline" className="w-full rounded-xl h-11">
              Search
            </Button>
          </div>

          {/* Online Orders */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Online Orders</h3>
                <p className="text-xs text-muted-foreground">You have {pendingOrders.length} pending orders from the mobile app waiting for intake.</p>
              </div>
              {pendingOrders.length > 0 && (
                <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </div>
            <Button 
              onClick={() => setMainView('orders')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <button className="text-sm text-primary hover:underline">View History</button>
        </div>
        <div className="divide-y divide-border">
          {orders.slice(0, 3).map((order, i) => (
            <div key={order.id} className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  order.status === 'completed' ? 'bg-success/10 text-success' : 
                  order.status === 'pending_dropoff' ? 'bg-accent/10 text-accent' :
                  'bg-primary/10 text-primary'
                }`}>
                  {order.status === 'completed' ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {order.status === 'completed' ? 'Order Completed' : 'New Walk-In Created'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.code}: {order.customerName} • {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                Details
              </Button>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        WashLab POS | Powered By Lider Technologies
      </div>
    </div>
  );

  // Number Pad for Phone Entry
  const NumberPad = ({ onDigit, onClear, onBackspace }: { onDigit: (d: string) => void; onClear: () => void; onBackspace: () => void }) => (
    <div className="grid grid-cols-3 gap-3">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
        <button
          key={digit}
          onClick={() => onDigit(digit)}
          className="h-14 rounded-xl bg-card border border-border text-xl font-semibold text-foreground hover:bg-muted transition-colors"
        >
          {digit}
        </button>
      ))}
      <button
        onClick={onClear}
        className="h-14 rounded-xl bg-destructive/10 border border-destructive/20 text-xl font-semibold text-destructive hover:bg-destructive/20 transition-colors"
      >
        <X className="w-5 h-5 mx-auto" />
      </button>
      <button
        onClick={() => onDigit('0')}
        className="h-14 rounded-xl bg-card border border-border text-xl font-semibold text-foreground hover:bg-muted transition-colors"
      >
        0
      </button>
      <button
        onClick={onBackspace}
        className="h-14 rounded-xl bg-muted border border-border text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors"
      >
        <Delete className="w-5 h-5 mx-auto" />
      </button>
    </div>
  );

  // Phone Entry Screen (Figma style)
  const PhoneScreen = () => {
    const formatPhone = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
      if (cleaned.length <= 9) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-wash-blue-light relative">
        <Header />
        
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">New Walk-in Order</h1>
                <p className="text-muted-foreground">Enter the customer's mobile number to identify an existing profile or create a new one.</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Left: Phone Input */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">MOBILE NUMBER</Label>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-muted rounded-xl px-4 py-4 text-lg font-semibold text-foreground">
                      +233
                    </div>
                    <div className="flex-1 relative">
                      <Input
                        value={formatPhone(walkinData.phone)}
                        readOnly
                        placeholder="XX XXX XXXX"
                        className="h-14 text-2xl font-semibold bg-card border-2 border-border rounded-xl text-foreground"
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Customer Status */}
                  <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">New Customer</p>
                      <p className="text-sm text-muted-foreground">This number is not in our system. A new profile will be created.</p>
                    </div>
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">NEW</span>
                  </div>

                  <Button
                    onClick={() => {
                      if (walkinData.phone.length >= 9) {
                        setWalkinData(prev => ({ ...prev, name: 'John Doe' }));
                        setWalkinStep('order');
                      }
                    }}
                    disabled={walkinData.phone.length < 9}
                    className="w-full h-14 mt-6 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Create Profile & Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Right: Number Pad */}
                <div>
                  <NumberPad
                    onDigit={(d) => setWalkinData(prev => ({ ...prev, phone: prev.phone.length < 10 ? prev.phone + d : prev.phone }))}
                    onClear={() => setWalkinData(prev => ({ ...prev, phone: '' }))}
                    onBackspace={() => setWalkinData(prev => ({ ...prev, phone: prev.phone.slice(0, -1) }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Order Details Screen (Figma style)
  const OrderScreen = () => {
    const orderCode = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/5">
        <Header />
        
        <div className="p-6">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-primary via-primary to-wash-blue-light rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-primary-foreground">Order #{orderCode}</h1>
                  <span className="px-3 py-1 bg-primary-foreground/20 text-primary-foreground text-xs font-semibold rounded-full">WALK-IN</span>
                </div>
                <p className="text-primary-foreground/80">Customer: {walkinData.name || 'John Doe'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-foreground/60">CURRENT DATE</p>
                <p className="text-primary-foreground font-semibold">{currentDate}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Service Selection */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Select Service</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {serviceTypes.map(service => (
                    <button
                      key={service.id}
                      onClick={() => setWalkinData(prev => ({ ...prev, serviceType: service.id as any }))}
                      className={`p-4 rounded-xl border-2 transition-all relative ${
                        walkinData.serviceType === service.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:border-muted-foreground'
                      }`}
                    >
                      <service.icon className={`w-6 h-6 mx-auto mb-2 ${
                        walkinData.serviceType === service.id ? 'text-primary-foreground' : 'text-primary'
                      }`} />
                      {walkinData.serviceType === service.id && (
                        <CheckCircle2 className="w-4 h-4 absolute top-2 right-2" />
                      )}
                      <p className={`font-semibold text-sm ${walkinData.serviceType === service.id ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {service.label}
                      </p>
                      <p className={`text-xs mt-1 ${walkinData.serviceType === service.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {service.description}
                      </p>
                      <p className={`text-sm font-bold mt-2 ${walkinData.serviceType === service.id ? 'text-primary-foreground' : 'text-primary'}`}>
                        ₵{service.price}/load
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Order Notes</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">OPTIONAL</span>
                </div>
                <Textarea
                  value={walkinData.notes}
                  onChange={(e) => setWalkinData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add special instructions, stain details, or specific care requests..."
                  className="min-h-[100px] bg-muted border-0 rounded-xl"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Weight */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Total Weight</h3>
                  </div>
                  <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded font-semibold">REQUIRED</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => setWalkinData(prev => ({ ...prev, weight: Math.max(0.5, prev.weight - 0.5) }))}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground">{walkinData.weight.toFixed(1)}</span>
                    <span className="text-xl text-muted-foreground">KG</span>
                  </div>
                  <Button
                    className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setWalkinData(prev => ({ ...prev, weight: prev.weight + 0.5 }))}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-4 justify-center">
                  {[0.5, 1.0, 5.0].map(w => (
                    <Button
                      key={w}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setWalkinData(prev => ({ ...prev, weight: prev.weight + w }))}
                    >
                      + {w}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Item Count */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Item Count</h3>
                  </div>
                  <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded font-semibold">REQUIRED</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => setWalkinData(prev => ({ ...prev, itemCount: Math.max(1, prev.itemCount - 1) }))}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground">{walkinData.itemCount}</span>
                    <span className="text-xl text-muted-foreground">PCS</span>
                  </div>
                  <Button
                    className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setWalkinData(prev => ({ ...prev, itemCount: prev.itemCount + 1 }))}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-4 justify-center">
                  {[10, 20, 50, 40].map(c => (
                    <Button
                      key={c}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setWalkinData(prev => ({ ...prev, itemCount: prev.itemCount + c }))}
                    >
                      + {c}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Number of Toiletries</span>
                  <p className="font-bold text-lg">2</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimated Total</span>
                  <p className="font-bold text-lg text-primary">₵{calculatePrice().total.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setWalkinStep('phone')}
                  className="rounded-xl px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setWalkinStep('delivery')}
                  className="bg-foreground hover:bg-foreground/90 text-background rounded-xl px-8"
                >
                  Confirm Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delivery Selection Screen (Figma style)
  const DeliveryScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 relative">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1920')] bg-cover bg-center" />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="p-6 max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-foreground mb-2">Select Logistics Method</h1>
            <p className="text-muted-foreground mb-8">How will the customer receive their laundry?</p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Store Pickup */}
              <button
                onClick={() => setWalkinData(prev => ({ ...prev, deliveryOption: 'pickup', deliveryFee: 0 }))}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                  walkinData.deliveryOption === 'pickup' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="h-40 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                  <div className="text-6xl">🏪</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">Store Pickup</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Customer collects at store</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-success/10 text-success text-xs font-semibold rounded">Free</span>
                </div>
                {walkinData.deliveryOption === 'pickup' && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                )}
              </button>

              {/* Delivery */}
              <button
                onClick={() => setWalkinData(prev => ({ ...prev, deliveryOption: 'delivery', deliveryFee: 5 }))}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                  walkinData.deliveryOption === 'delivery' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <div className="text-6xl">🚚</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">Delivery</span>
                  </div>
                  <p className="text-sm text-muted-foreground">We deliver to customer</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-accent/10 text-accent-foreground text-xs font-semibold rounded">Fees apply</span>
                </div>
                {walkinData.deliveryOption === 'delivery' && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                )}
              </button>
            </div>

            {/* Delivery Details */}
            {walkinData.deliveryOption === 'delivery' && (
              <div className="bg-muted/50 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Delivery Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">Delivery Address</Label>
                    <div className="relative">
                      <Input
                        value={walkinData.deliveryAddress}
                        onChange={(e) => setWalkinData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                        placeholder="1234 Main St, Springfield"
                        className="pr-12 h-12 rounded-xl bg-white border-border"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-success rounded-lg">
                        <MapPin className="w-4 h-4 text-success-foreground" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">Delivery Instructions (Optional)</Label>
                    <Input
                      value={walkinData.deliveryInstructions}
                      onChange={(e) => setWalkinData(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                      placeholder="Gate code, leave at door, etc..."
                      className="h-12 rounded-xl bg-white border-border"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Estimated Delivery Fee</span>
                    <span className="font-bold text-foreground">+ ₵5.00</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setWalkinStep('order')}
                className="rounded-xl px-6"
              >
                Back
              </Button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">TOTAL EXTRA</span>
                  <p className="font-bold text-lg">₵{walkinData.deliveryFee.toFixed(2)}</p>
                </div>
                <Button 
                  onClick={() => setWalkinStep('summary')}
                  className="bg-foreground hover:bg-foreground/90 text-background rounded-xl px-8"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Order Summary Screen (Figma style)
  const SummaryScreen = () => {
    const { subtotal, tax, serviceFee, deliveryFee, total } = calculatePrice();
    const service = serviceTypes.find(s => s.id === walkinData.serviceType);

    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="p-6 max-w-5xl mx-auto">
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-lg">
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-foreground">Order Summary</h1>
              <p className="text-muted-foreground">Review the order details before proceeding to payment.</p>
            </div>

            <div className="grid grid-cols-2 gap-0">
              {/* Left: Image */}
              <div className="bg-gradient-to-br from-primary/5 to-white p-8 flex items-center justify-center">
                <img 
                  src={stackedClothes} 
                  alt="Laundry basket" 
                  className="max-w-xs rounded-2xl shadow-lg"
                />
              </div>

              {/* Right: Details */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{walkinData.name || 'Jane Doe'}</p>
                    <p className="text-sm text-muted-foreground">+233 {walkinData.phone}</p>
                    <span className="text-xs text-primary">Loyalty Member</span>
                  </div>
                  <Button variant="link" className="text-primary">Edit Customer</Button>
                </div>

                {/* Logistics & Notes */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">LOGISTICS</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {walkinData.deliveryOption === 'pickup' ? 'Pickup Tomorrow' : 'Delivery'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {walkinData.deliveryOption === 'pickup' ? 'Wednesday, Oct 24 • 5:00 PM' : walkinData.deliveryAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">NOTES</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Special Instructions</p>
                        <p className="text-sm text-muted-foreground">{walkinData.notes || 'No bleach, cold wash only for delicates.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Items */}
                <div className="border-t border-border pt-4 mb-6">
                  <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground mb-3">
                    <span>SERVICE / ITEM</span>
                    <span>DETAILS</span>
                    <span></span>
                    <span className="text-right">PRICE</span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="font-semibold text-foreground">{service?.label}</p>
                        <p className="text-xs text-muted-foreground">General clothing</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{walkinData.weight}kg × ₵{serviceTypes.find(s => s.id === walkinData.serviceType)?.price || 50}/5kg</span>
                      <span></span>
                      <span className="font-semibold text-right">₵{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-foreground">₵{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="text-foreground">₵{serviceFee.toFixed(2)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="text-foreground">₵{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 border-t border-border">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
              <Button 
                variant="outline" 
                onClick={() => setWalkinStep('delivery')}
                className="rounded-xl px-6"
              >
                Edit Order
              </Button>
              <Button 
                onClick={processWalkinOrder}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8"
              >
                Proceed to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Payment Screen (Figma style)
  const PaymentScreen = () => {
    const { subtotal, tax, serviceFee, deliveryFee, total } = calculatePrice();
    const service = serviceTypes.find(s => s.id === walkinData.serviceType);

    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
            {/* Left: Customer & Order Summary */}
            <div className="bg-gradient-to-b from-primary/10 to-white border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <p className="text-xs text-muted-foreground mb-1">CUSTOMER DETAILS</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{walkinData.name || 'Alice Smith'}</p>
                    <p className="text-sm text-muted-foreground">+233 {walkinData.phone}</p>
                    <p className="text-xs text-primary">{walkinData.name || 'alice.smith'}@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">ORDER SUMMARY</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-foreground">{service?.label} (Regular)</p>
                      <p className="text-xs text-muted-foreground">Colors, Cool Wash</p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">{walkinData.weight}kg</span>
                      <p className="font-semibold">₵{subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Tax (8%)</span>
                    <span>₵{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Grand Total</span>
                    <span className="text-2xl font-bold text-primary">₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Options */}
            <div className="col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Process Payment</h2>
                <p className="text-muted-foreground mb-6">Select payment method to complete the transaction.</p>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Payment Method</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('mobile_money')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'mobile_money' 
                          ? 'border-foreground bg-foreground text-background' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <Smartphone className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'mobile_money' ? 'text-background' : 'text-muted-foreground'}`} />
                      {paymentMethod === 'mobile_money' && <Check className="w-4 h-4 absolute top-2 right-2" />}
                      <p className={`font-semibold text-sm ${paymentMethod === 'mobile_money' ? 'text-background' : 'text-foreground'}`}>
                        Mobile Money
                      </p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-foreground bg-foreground text-background' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-background' : 'text-muted-foreground'}`} />
                      <p className={`font-semibold text-sm ${paymentMethod === 'card' ? 'text-background' : 'text-foreground'}`}>
                        Card
                      </p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-xl border-2 transition-all opacity-50 cursor-not-allowed ${
                        paymentMethod === 'cash' 
                          ? 'border-foreground bg-foreground text-background' 
                          : 'border-border'
                      }`}
                    >
                      <Banknote className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-semibold text-sm text-muted-foreground">Cash</p>
                    </button>
                  </div>
                </div>

                {/* Mobile Money Details */}
                {paymentMethod === 'mobile_money' && (
                  <div className="bg-muted/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Smartphone className="w-5 h-5 text-foreground" />
                      <span className="font-semibold text-foreground">Mobile Money Transfer</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1 block">Total Amount</Label>
                        <div className="bg-muted rounded-xl px-4 py-3">
                          <span className="text-lg font-bold text-foreground">₵ {total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1 block">PROVIDER</Label>
                        <div className="flex gap-2">
                          <button className="flex-1 px-3 py-2 bg-foreground text-background rounded-lg text-sm font-semibold">
                            ● MTN / Default
                          </button>
                          <button className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg text-sm">
                            Other
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-sm text-muted-foreground mb-1 block">Customer Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          value={`+233 ${walkinData.phone}`}
                          readOnly
                          className="pl-12 h-12 rounded-xl bg-primary/10 border-primary text-foreground font-semibold"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Check provider format before sending request.</p>
                      <button className="text-xs text-destructive mt-1">⚠ Verify number with customer</button>
                    </div>

                    <Button
                      onClick={() => processPayment('momo')}
                      className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Request Payment
                    </Button>
                  </div>
                )}

                {/* Order Warning */}
                <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>Order cannot be finalized until payment is confirmed.</span>
                </div>
              </div>

              {/* Finalize Button */}
              <Button
                onClick={() => processPayment(paymentMethod === 'mobile_money' ? 'momo' : paymentMethod === 'card' ? 'hubtel' : 'cash')}
                className="w-full h-14 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-lg font-semibold"
                disabled={!completedOrder}
              >
                Finalize Order
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Decorative Image */}
          <div className="fixed bottom-0 right-0 w-64 opacity-30 pointer-events-none">
            <img src={stackedClothes} alt="" className="w-full" />
          </div>
        </div>
      </div>
    );
  };

  // Confirmation Screen (Figma style)
  const ConfirmationScreen = () => (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full bg-success/10 border-4 border-success flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-success" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            The laundry order has been successfully created and added to the processing queue.
          </p>

          {/* Order Details Card */}
          {completedOrder && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">ORDER ID</p>
                  <p className="text-2xl font-bold text-foreground">#{completedOrder.code}</p>
                </div>
                <span className="px-3 py-1 bg-success/10 text-success text-sm font-semibold rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  IN PROGRESS
                </span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Name</span>
                  <span className="font-semibold text-foreground">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Type</span>
                  <span className="font-semibold text-foreground">{serviceTypes.find(s => s.id === walkinData.serviceType)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Completion</span>
                  <span className="font-semibold text-foreground">Today, 4:30 PM</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">₵{completedOrder.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => { setMainView('dashboard'); resetWalkin(); }}
              className="w-full h-14 bg-foreground hover:bg-foreground/90 text-background rounded-xl text-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Start New Order
            </Button>
            <Button
              variant="outline"
              onClick={() => completedOrder && sendWhatsAppReceipt(completedOrder)}
              className="w-full h-12 rounded-xl"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            ⏱ Screen will reset in 25s
          </p>
        </div>
      </div>
    </div>
  );

  // Orders View
  const OrdersView = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">All Orders</h1>
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No orders yet</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${ORDER_STAGES.find(s => s.status === order.status)?.color || 'bg-muted'}`} />
                <div>
                  <p className="font-semibold text-foreground">{order.code}</p>
                  <p className="text-sm text-muted-foreground">{order.customerName} • {order.customerPhone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">₵{order.totalPrice?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-muted-foreground">{ORDER_STAGES.find(s => s.status === order.status)?.label}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Main Render Logic
  if (mainView === 'walkin') {
    switch (walkinStep) {
      case 'phone': return <PhoneScreen />;
      case 'order': return <OrderScreen />;
      case 'delivery': return <DeliveryScreen />;
      case 'summary': return <SummaryScreen />;
      case 'payment': return <PaymentScreen />;
      case 'confirmation': return <ConfirmationScreen />;
    }
  }

  // Dashboard Layout
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      {mainView === 'dashboard' && <DashboardView />}
      {mainView === 'orders' && <OrdersView />}
      {mainView === 'customers' && (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Customers</h1>
          <p className="text-muted-foreground">Customer management coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default WashStation;

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ORDER_STAGES, OrderStatus, ITEM_CATEGORIES } from '@/types';
import { useOrders, Order, PaymentMethod } from '@/context/OrderContext';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import washLabLogo from '@/assets/washlab-logo.png';
import { 
  Search, 
  Plus, 
  Package, 
  Scale,
  MessageCircle,
  Truck,
  Check,
  ChevronRight,
  ChevronLeft,
  Home,
  ClipboardList,
  Users,
  X,
  CreditCard,
  Phone,
  MapPin,
  User,
  Shirt,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Bell,
  LogIn,
  LogOut,
  Fingerprint,
  ShieldCheck,
  Wallet,
  Banknote,
  Smartphone,
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Settings,
  UserCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

type MainView = 'dashboard' | 'walkin' | 'orders' | 'customers' | 'settings';
type WalkinStep = 'phone' | 'order' | 'delivery' | 'summary' | 'payment' | 'confirmation';

interface SignedInStaff {
  id: string;
  name: string;
  signedInAt: Date;
}

interface WalkinData {
  phone: string;
  name: string;
  hall: string;
  room: string;
  items: { category: string; quantity: number }[];
  weight: number;
  hasWhites: boolean;
  deliveryOption: 'pickup' | 'delivery';
  bagTag: string;
}

const WashStation = () => {
  const { orders, addOrder, updateOrder, getPendingOrders, getActiveOrders, getReadyOrders, getCompletedOrders } = useOrders();
  const { isSupported, isProcessing, enrollStaff, verifyStaff, enrolledStaff, removeEnrollment } = useWebAuthn();
  
  const [mainView, setMainView] = useState<MainView>('dashboard');
  const [walkinStep, setWalkinStep] = useState<WalkinStep>('phone');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const prevOrderCountRef = useRef(orders.length);
  
  // Walk-in data
  const [walkinData, setWalkinData] = useState<WalkinData>({
    phone: '',
    name: '',
    hall: '',
    room: '',
    items: [],
    weight: 0,
    hasWhites: false,
    deliveryOption: 'pickup',
    bagTag: ''
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('hubtel');
  const [paymentAuthorizedBy, setPaymentAuthorizedBy] = useState<string | null>(null);
  
  // Staff attendance state
  const [signedInStaff, setSignedInStaff] = useState<SignedInStaff[]>([]);
  const [enrollName, setEnrollName] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const pendingOrders = getPendingOrders();
  const activeOrders = getActiveOrders();
  const readyOrders = getReadyOrders();
  const completedOrders = getCompletedOrders();

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
      hall: '',
      room: '',
      items: [],
      weight: 0,
      hasWhites: false,
      deliveryOption: 'pickup',
      bagTag: ''
    });
    setWalkinStep('phone');
  };

  // Calculate pricing
  const calculatePrice = () => {
    const weight = walkinData.weight || 0;
    const extraLoadsForWhites = walkinData.hasWhites ? 1 : 0;
    const baseLoads = weight <= 9 ? 1 : Math.ceil(weight / 8);
    const loads = baseLoads + extraLoadsForWhites;
    const pricePerLoad = 25;
    return { loads, totalPrice: loads * pricePerLoad };
  };

  // Handle staff sign in with WebAuthn
  const handleStaffSignIn = async () => {
    if (isSupported) {
      const result = await verifyStaff();
      if (result.success && result.staffName && result.staffId) {
        const newStaff: SignedInStaff = { 
          id: result.staffId, 
          name: result.staffName, 
          signedInAt: new Date() 
        };
        setSignedInStaff(prev => [...prev, newStaff]);
        toast.success(`${result.staffName} signed in`);
        setShowStaffModal(false);
      }
    } else {
      toast.error('WebAuthn not supported');
    }
  };

  const handleManualSignIn = (name: string) => {
    const newStaff: SignedInStaff = { 
      id: `staff-${Date.now()}`, 
      name, 
      signedInAt: new Date() 
    };
    setSignedInStaff(prev => [...prev, newStaff]);
    toast.success(`${name} signed in`);
    setShowStaffModal(false);
  };

  const handleStaffSignOut = (staffId: string) => {
    const staff = signedInStaff.find(s => s.id === staffId);
    setSignedInStaff(prev => prev.filter(s => s.id !== staffId));
    if (staff) toast.success(`${staff.name} signed out`);
  };

  const handleEnrollNewStaff = async () => {
    if (!enrollName.trim()) {
      toast.error('Please enter staff name');
      return;
    }
    const staffId = `staff-${Date.now()}`;
    const success = await enrollStaff(enrollName.trim(), staffId);
    if (success) {
      setEnrollName('');
      setShowEnrollDialog(false);
    }
  };

  // Process walk-in order
  const processWalkinOrder = () => {
    const { loads, totalPrice } = calculatePrice();
    
    const newOrder = addOrder({
      code: `WL-${Math.floor(Math.random() * 9000) + 1000}`,
      customerPhone: walkinData.phone,
      customerName: walkinData.name,
      hall: walkinData.hall,
      room: walkinData.room,
      status: 'checked_in' as OrderStatus,
      bagCardNumber: walkinData.bagTag,
      items: walkinData.items,
      totalPrice,
      weight: walkinData.weight,
      loads,
      hasWhites: walkinData.hasWhites,
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
    // Verify staff with WebAuthn before processing payment
    if (isSupported && signedInStaff.length > 0) {
      const result = await verifyStaff();
      if (!result.success) {
        toast.error('Payment authorization failed');
        return;
      }
      setPaymentAuthorizedBy(result.staffName || signedInStaff[0]?.name);
    } else {
      setPaymentAuthorizedBy(signedInStaff[0]?.name || 'Unknown');
    }

    if (completedOrder) {
      if (method === 'hubtel' || method === 'momo') {
        const phone = completedOrder.customerPhone;
        toast.success(`USSD prompt sent to ${phone}`, {
          description: `Amount: ₵${completedOrder.totalPrice} via ${method.toUpperCase()}`
        });
      }

      updateOrder(completedOrder.id, {
        paymentMethod: method,
        paymentStatus: 'paid',
        paidAt: new Date(),
        paidAmount: completedOrder.totalPrice || 0,
        processedBy: paymentAuthorizedBy || signedInStaff[0]?.name || 'Unknown',
      });

      setCompletedOrder(prev => prev ? { ...prev, paymentMethod: method, paymentStatus: 'paid' } : null);
      toast.success('Payment recorded successfully!');
      setWalkinStep('confirmation');
    }
  };

  const sendWhatsAppReceipt = (order: Order) => {
    const itemsList = order.items.map(i => `• ${i.category} – ${i.quantity}`).join('\n');
    const message = encodeURIComponent(
      `*WashLab Receipt – ${order.code}*\n*Bag Tag: #${order.bagCardNumber}*\n\n*Items:*\n${itemsList}\n\n*Amount Paid:* ₵${order.totalPrice}\n*Payment:* ${order.paymentMethod?.toUpperCase()}\n\nThank you for choosing WashLab! 🧺`
    );
    const phone = order.customerPhone.startsWith('0') ? `233${order.customerPhone.slice(1)}` : order.customerPhone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrder(orderId, { 
      status: newStatus,
      processedBy: signedInStaff[0]?.name || 'Unknown',
    });
    toast.success(`Order updated to ${ORDER_STAGES.find(s => s.status === newStatus)?.label}`);
  };

  // Sidebar Navigation Items
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'walkin', icon: Plus, label: 'New Order' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'customers', icon: Users, label: 'Customers' },
  ];

  // Sidebar Component
  const Sidebar = () => (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-foreground flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-muted-foreground/20">
        <Link to="/" className="flex items-center gap-3">
          <img src={washLabLogo} alt="WashLab" className="h-10 w-auto brightness-0 invert" />
          <span className="hidden lg:block text-xl font-bold text-background">WashLab</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setMainView(item.id as MainView);
                  if (item.id === 'walkin') resetWalkin();
                }}
                className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all ${
                  mainView === item.id
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-background'
                }`}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className="hidden lg:block">{item.label}</span>
                {item.id === 'orders' && pendingOrders.length > 0 && (
                  <span className="ml-auto w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                    {pendingOrders.length}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Staff Section */}
      <div className="p-2 lg:p-4 border-t border-muted-foreground/20">
        <button
          onClick={() => setShowStaffModal(true)}
          className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted-foreground/10 hover:text-background transition-all"
        >
          <Fingerprint className="w-6 h-6 flex-shrink-0" />
          <span className="hidden lg:block">Attendance</span>
          {signedInStaff.length > 0 && (
            <span className="ml-auto w-6 h-6 rounded-full bg-success text-success-foreground text-xs font-bold flex items-center justify-center">
              {signedInStaff.length}
            </span>
          )}
        </button>

        {signedInStaff.length > 0 && (
          <div className="mt-2 hidden lg:block">
            {signedInStaff.map((staff) => (
              <div key={staff.id} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="truncate">{staff.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Home Link */}
      <div className="p-2 lg:p-4">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted-foreground/10 hover:text-background transition-all"
        >
          <Home className="w-6 h-6 flex-shrink-0" />
          <span className="hidden lg:block">Back to Home</span>
        </Link>
      </div>
    </aside>
  );

  // Step indicator for walk-in flow
  const WalkinStepIndicator = () => {
    const steps = [
      { id: 'phone', label: 'Phone' },
      { id: 'order', label: 'Order' },
      { id: 'delivery', label: 'Delivery' },
      { id: 'summary', label: 'Summary' },
      { id: 'payment', label: 'Payment' },
      { id: 'confirmation', label: 'Done' },
    ];
    const currentIndex = steps.findIndex(s => s.id === walkinStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              index <= currentIndex
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {index < currentIndex ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-1 mx-1 rounded ${
                index < currentIndex ? 'bg-accent' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Phone Entry Screen
  const PhoneScreen = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Customer Phone</h2>
        <p className="text-muted-foreground">Enter customer phone number to start</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-foreground mb-2 block">Phone Number *</Label>
          <Input
            type="tel"
            value={walkinData.phone}
            onChange={(e) => setWalkinData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="0XX XXX XXXX"
            className="h-14 text-lg text-center bg-card border-border rounded-xl"
          />
        </div>

        <div>
          <Label className="text-foreground mb-2 block">Customer Name *</Label>
          <Input
            value={walkinData.name}
            onChange={(e) => setWalkinData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter name"
            className="h-14 text-lg bg-card border-border rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground mb-2 block">Hall/Building</Label>
            <Input
              value={walkinData.hall}
              onChange={(e) => setWalkinData(prev => ({ ...prev, hall: e.target.value }))}
              placeholder="e.g. Unity Hall"
              className="h-12 bg-card border-border rounded-xl"
            />
          </div>
          <div>
            <Label className="text-foreground mb-2 block">Room</Label>
            <Input
              value={walkinData.room}
              onChange={(e) => setWalkinData(prev => ({ ...prev, room: e.target.value }))}
              placeholder="e.g. A201"
              className="h-12 bg-card border-border rounded-xl"
            />
          </div>
        </div>

        <Button
          onClick={() => setWalkinStep('order')}
          disabled={!walkinData.phone || !walkinData.name}
          className="w-full h-14 text-lg rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Order Items Screen
  const OrderScreen = () => {
    const addItem = () => {
      setWalkinData(prev => ({
        ...prev,
        items: [...prev.items, { category: '', quantity: 1 }]
      }));
    };

    const updateItem = (index: number, field: 'category' | 'quantity', value: string | number) => {
      setWalkinData(prev => ({
        ...prev,
        items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
      }));
    };

    const removeItem = (index: number) => {
      setWalkinData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Shirt className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Items</h2>
          <p className="text-muted-foreground">Add items and enter weight</p>
        </div>

        {/* Weight and Bag Tag */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-foreground mb-2 block">Weight (kg) *</Label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  value={walkinData.weight || ''}
                  onChange={(e) => setWalkinData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.0"
                  className="pl-10 h-12 bg-muted border-border rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Bag Tag # *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  value={walkinData.bagTag}
                  onChange={(e) => setWalkinData(prev => ({ ...prev, bagTag: e.target.value }))}
                  placeholder="10"
                  className="pl-10 h-12 bg-muted border-border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Has Whites Toggle */}
          <button
            onClick={() => setWalkinData(prev => ({ ...prev, hasWhites: !prev.hasWhites }))}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
              walkinData.hasWhites ? 'border-accent bg-accent/10' : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👕</span>
              <div className="text-left">
                <p className="font-medium text-foreground">Has Whites</p>
                <p className="text-sm text-muted-foreground">Adds +1 load for separate wash</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              walkinData.hasWhites ? 'bg-accent border-accent' : 'border-muted-foreground'
            }`}>
              {walkinData.hasWhites && <Check className="w-4 h-4 text-accent-foreground" />}
            </div>
          </button>
        </div>

        {/* Item Categories */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Item Categories</h3>
            <Button variant="outline" size="sm" onClick={addItem} className="rounded-lg">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {walkinData.items.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <Select
                  value={item.category}
                  onValueChange={(v) => updateItem(index, 'category', v)}
                >
                  <SelectTrigger className="flex-1 h-11 rounded-lg bg-muted">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20 h-11 text-center rounded-lg bg-muted"
                />
                <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ))}
            {walkinData.items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shirt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Click "Add Item" to categorize clothes</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setWalkinStep('phone')}
            className="flex-1 h-14 text-lg rounded-xl"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setWalkinStep('delivery')}
            disabled={!walkinData.weight || !walkinData.bagTag || walkinData.items.length === 0}
            className="flex-1 h-14 text-lg rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // Delivery Options Screen
  const DeliveryScreen = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Truck className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Delivery Option</h2>
        <p className="text-muted-foreground">How will customer receive their laundry?</p>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => setWalkinData(prev => ({ ...prev, deliveryOption: 'pickup' }))}
          className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
            walkinData.deliveryOption === 'pickup'
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-muted-foreground bg-card'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              walkinData.deliveryOption === 'pickup' ? 'bg-accent' : 'bg-muted'
            }`}>
              <Package className={`w-6 h-6 ${walkinData.deliveryOption === 'pickup' ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">Pickup at WashLab</p>
              <p className="text-muted-foreground">Customer will pick up when ready</p>
            </div>
            {walkinData.deliveryOption === 'pickup' && (
              <div className="ml-auto">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
            )}
          </div>
        </button>

        <button
          onClick={() => setWalkinData(prev => ({ ...prev, deliveryOption: 'delivery' }))}
          className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
            walkinData.deliveryOption === 'delivery'
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-muted-foreground bg-card'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              walkinData.deliveryOption === 'delivery' ? 'bg-accent' : 'bg-muted'
            }`}>
              <Truck className={`w-6 h-6 ${walkinData.deliveryOption === 'delivery' ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">Delivery</p>
              <p className="text-muted-foreground">Deliver to {walkinData.hall || 'their hall'}</p>
            </div>
            {walkinData.deliveryOption === 'delivery' && (
              <div className="ml-auto">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setWalkinStep('order')}
          className="flex-1 h-14 text-lg rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setWalkinStep('summary')}
          className="flex-1 h-14 text-lg rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Order Summary Screen
  const SummaryScreen = () => {
    const { loads, totalPrice } = calculatePrice();

    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Summary</h2>
          <p className="text-muted-foreground">Review before processing</p>
        </div>

        {/* Customer Info */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <User className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{walkinData.name}</p>
              <p className="text-muted-foreground">{walkinData.phone}</p>
            </div>
          </div>
          {walkinData.hall && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{walkinData.hall}, Room {walkinData.room}</span>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-4">
          <h3 className="font-semibold text-foreground mb-4">Items</h3>
          <div className="space-y-2 mb-4">
            {walkinData.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.category}</span>
                <span className="font-medium text-foreground">× {item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-medium text-foreground">{walkinData.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loads</span>
              <span className="font-medium text-foreground">{loads} {walkinData.hasWhites && '(+1 whites)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bag Tag</span>
              <span className="font-medium text-foreground">#{walkinData.bagTag}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-foreground capitalize">{walkinData.deliveryOption}</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-accent/20 rounded-2xl p-6 mb-6 text-center">
          <p className="text-sm text-accent mb-1">Total Amount</p>
          <p className="text-4xl font-bold text-accent">₵{totalPrice}</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setWalkinStep('delivery')}
            className="flex-1 h-14 text-lg rounded-xl"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={processWalkinOrder}
            className="flex-1 h-14 text-lg rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Confirm Order
            <Check className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // Payment Screen
  const PaymentScreen = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Payment</h2>
        <p className="text-muted-foreground">Select payment method</p>
      </div>

      {completedOrder && (
        <>
          {/* Order Badge */}
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div>
              <p className="font-semibold text-foreground">Order Created: {completedOrder.code}</p>
              <p className="text-sm text-muted-foreground">Bag Tag: #{completedOrder.bagCardNumber}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
            <p className="text-4xl font-bold text-accent">₵{completedOrder.totalPrice}</p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => processPayment('hubtel')}
              className="w-full p-4 rounded-xl border-2 border-border hover:border-accent bg-card transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Hubtel USSD</p>
                <p className="text-sm text-muted-foreground">Send USSD to customer</p>
              </div>
              <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
            </button>

            <button
              onClick={() => processPayment('momo')}
              className="w-full p-4 rounded-xl border-2 border-border hover:border-accent bg-card transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Phone className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Mobile Money</p>
                <p className="text-sm text-muted-foreground">MTN MoMo / Vodafone Cash</p>
              </div>
              <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
            </button>

            <button
              onClick={() => processPayment('cash')}
              className="w-full p-4 rounded-xl border-2 border-border hover:border-accent bg-card transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Cash</p>
                <p className="text-sm text-muted-foreground">Log manual cash payment</p>
              </div>
              <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Confirmation Screen
  const ConfirmationScreen = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-8">
        <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <Check className="w-12 h-12 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Order Complete!</h2>
        <p className="text-muted-foreground">Payment received successfully</p>
      </div>

      {completedOrder && (
        <>
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="text-5xl font-bold text-foreground mb-2">{completedOrder.code}</div>
            <p className="text-muted-foreground">Bag Tag: #{completedOrder.bagCardNumber}</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => sendWhatsAppReceipt(completedOrder)}
              className="w-full h-14 text-lg rounded-xl bg-success hover:bg-success/90 text-success-foreground"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send Receipt via WhatsApp
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                resetWalkin();
                setCompletedOrder(null);
                setMainView('dashboard');
              }}
              className="w-full h-14 text-lg rounded-xl"
            >
              Back to Dashboard
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                resetWalkin();
                setCompletedOrder(null);
              }}
              className="w-full h-14 text-lg rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Order
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Dashboard Content
  const DashboardContent = () => (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 w-64 h-10 bg-card border-border rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            {pendingOrders.length > 0 && (
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {pendingOrders.length} pending
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingOrders.length}</p>
          <p className="text-sm text-muted-foreground">Awaiting Check-in</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">{activeOrders.length}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{readyOrders.length}</p>
          <p className="text-sm text-muted-foreground">Ready for Pickup</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            <Receipt className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
          <p className="text-sm text-muted-foreground">Completed Today</p>
        </div>
      </div>

      {/* Active Orders */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Orders</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...pendingOrders, ...activeOrders].map((order) => (
            <div
              key={order.id}
              onClick={() => {
                setSelectedOrder(order);
                setShowOrderDetail(true);
              }}
              className="bg-card rounded-2xl border border-border p-5 hover:border-accent/50 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xl font-bold text-foreground">{order.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.bagCardNumber ? `Bag #${order.bagCardNumber}` : 'No bag tag'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'pending_dropoff' ? 'bg-amber-100 text-amber-700' :
                  order.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'ready' ? 'bg-success/20 text-success' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              
              <p className="font-medium text-foreground">{order.customerName}</p>
              <p className="text-sm text-muted-foreground mb-3">{order.customerPhone}</p>
              
              {order.totalPrice && (
                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-success' : 'text-accent'}`}>
                    ₵{order.totalPrice}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              )}
            </div>
          ))}
          {pendingOrders.length === 0 && activeOrders.length === 0 && (
            <div className="col-span-full bg-card rounded-2xl border border-border p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No active orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Orders List Content
  const OrdersContent = () => (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">All Orders</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => {
              setSelectedOrder(order);
              setShowOrderDetail(true);
            }}
            className="bg-card rounded-xl border border-border p-4 hover:border-accent/50 transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-foreground">{order.code}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  order.status === 'pending_dropoff' ? 'bg-amber-100 text-amber-700' :
                  order.status === 'ready' ? 'bg-success/20 text-success' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{order.customerName} • {order.customerPhone}</p>
            </div>
            {order.totalPrice && (
              <p className={`font-bold ${order.paymentStatus === 'paid' ? 'text-success' : 'text-accent'}`}>
                ₵{order.totalPrice}
              </p>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      
      {/* Main Content */}
      <main className="ml-20 lg:ml-64 min-h-screen p-6 lg:p-8">
        {mainView === 'dashboard' && <DashboardContent />}
        {mainView === 'orders' && <OrdersContent />}
        {mainView === 'customers' && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Customers</h2>
            <p className="text-muted-foreground">Customer management coming soon</p>
          </div>
        )}
        {mainView === 'walkin' && (
          <div>
            <WalkinStepIndicator />
            {walkinStep === 'phone' && <PhoneScreen />}
            {walkinStep === 'order' && <OrderScreen />}
            {walkinStep === 'delivery' && <DeliveryScreen />}
            {walkinStep === 'summary' && <SummaryScreen />}
            {walkinStep === 'payment' && <PaymentScreen />}
            {walkinStep === 'confirmation' && <ConfirmationScreen />}
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.code}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                </div>
              </div>

              {selectedOrder.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Items</p>
                  <div className="space-y-1">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span>× {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{selectedOrder.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-semibold capitalize">{selectedOrder.paymentStatus}</p>
                </div>
                {selectedOrder.weight && (
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-semibold">{selectedOrder.weight} kg</p>
                  </div>
                )}
                {selectedOrder.totalPrice && (
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold text-accent">₵{selectedOrder.totalPrice}</p>
                  </div>
                )}
              </div>

              {/* Status Update Buttons */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STAGES.map((stage) => (
                    <Button
                      key={stage.status}
                      variant={selectedOrder.status === stage.status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, stage.status)}
                      className="rounded-lg"
                    >
                      {stage.label}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedOrder.status === 'ready' && (
                <Button
                  onClick={() => {
                    const message = encodeURIComponent(
                      `🧺 *WashLab Order Ready!*\n\nYour order *${selectedOrder.code}* is ready for pickup!\n\nBag Tag: #${selectedOrder.bagCardNumber}\n\nReply:\n*1* – I'll pick up at WashLab\n*2* – Please deliver to my room`
                    );
                    const phone = selectedOrder.customerPhone.startsWith('0') ? `233${selectedOrder.customerPhone.slice(1)}` : selectedOrder.customerPhone;
                    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                  }}
                  className="w-full bg-success hover:bg-success/90"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Notify Customer via WhatsApp
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Staff Attendance Modal */}
      <Dialog open={showStaffModal} onOpenChange={setShowStaffModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {signedInStaff.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Currently Signed In</p>
                <div className="space-y-2">
                  {signedInStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                          <span className="font-bold text-success">{staff.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Since {staff.signedInAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStaffSignOut(staff.id)}
                        className="text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <Button
                onClick={handleStaffSignIn}
                disabled={isProcessing}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
              >
                <Fingerprint className="w-5 h-5 mr-2" />
                {isProcessing ? 'Verifying...' : 'Sign In with Face ID'}
              </Button>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground text-center mb-2">Or manual sign in</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Staff name"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleManualSignIn(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowEnrollDialog(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Enroll New Staff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enroll Staff Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Enroll New Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Staff Name</Label>
              <Input
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                placeholder="Enter staff name"
              />
            </div>
            <Button
              onClick={handleEnrollNewStaff}
              disabled={isProcessing || !enrollName}
              className="w-full bg-accent hover:bg-accent/90"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              {isProcessing ? 'Enrolling...' : 'Enroll with Face ID'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WashStation;

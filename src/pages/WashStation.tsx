import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { StatusBadge } from '@/components/StatusBadge';
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
  Camera,
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
  Clock,
  Shirt,
  Sparkles,
  ArrowRight,
  Bell,
  LogIn,
  LogOut,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  Wallet,
  Banknote,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

type View = 'dashboard' | 'checkin' | 'walkin' | 'order-detail' | 'pending-list' | 'in-progress-list' | 'ready-list' | 'staff-signin' | 'payment' | 'enroll-staff';

interface SignedInStaff {
  id: string;
  name: string;
  signedInAt: Date;
}

const WashStation = () => {
  const { orders, addOrder, updateOrder, getPendingOrders, getActiveOrders, getReadyOrders, getCompletedOrders } = useOrders();
  const { isSupported, isProcessing, enrollStaff, verifyStaff, enrolledStaff, removeEnrollment } = useWebAuthn();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const prevOrderCountRef = useRef(orders.length);
  
  // Check-in state
  const [checkInWeight, setCheckInWeight] = useState('');
  const [checkInBagCard, setCheckInBagCard] = useState('');
  const [checkInItems, setCheckInItems] = useState<{ category: string; quantity: number }[]>([]);
  const [hasWhites, setHasWhites] = useState(false);
  
  // Walk-in state
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInHall, setWalkInHall] = useState('');
  const [walkInRoom, setWalkInRoom] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('hubtel');
  const [isAuthorizingPayment, setIsAuthorizingPayment] = useState(false);
  const [paymentAuthorizedBy, setPaymentAuthorizedBy] = useState<string | null>(null);
  
  // Staff attendance state
  const [signedInStaff, setSignedInStaff] = useState<SignedInStaff[]>([]);
  const [enrollName, setEnrollName] = useState('');
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

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
        action: {
          label: 'View',
          onClick: () => {
            setSelectedOrder(newOrder);
            setCurrentView('order-detail');
          }
        }
      });
    }
    prevOrderCountRef.current = orders.length;
  }, [orders]);

  const handleSearch = () => {
    const found = orders.find(
      o => o.code.toLowerCase() === searchQuery.toLowerCase() || 
           o.customerPhone === searchQuery
    );
    if (found) {
      setSelectedOrder(found);
      setCurrentView('order-detail');
    } else {
      toast.error('Order not found');
    }
  };

  const handleCheckIn = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('checkin');
    setCheckInWeight('');
    setCheckInBagCard('');
    setCheckInItems([]);
    setHasWhites(order.hasWhites || false);
  };

  const addCheckInItem = () => {
    setCheckInItems([...checkInItems, { category: '', quantity: 1 }]);
  };

  const updateCheckInItem = (index: number, field: 'category' | 'quantity', value: string | number) => {
    const updated = [...checkInItems];
    updated[index] = { ...updated[index], [field]: value };
    setCheckInItems(updated);
  };

  const removeCheckInItem = (index: number) => {
    setCheckInItems(checkInItems.filter((_, i) => i !== index));
  };

  const completeCheckIn = () => {
    if (!checkInWeight || !checkInBagCard || checkInItems.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }

    const weight = parseFloat(checkInWeight);
    // Auto-add extra load for whites if selected
    const extraLoadsForWhites = hasWhites && selectedOrder?.washSeparately ? 1 : 0;
    const baseLoads = weight <= 9 ? 1 : Math.ceil(weight / 8);
    const loads = baseLoads + extraLoadsForWhites;
    const pricePerLoad = 25;
    const totalPrice = loads * pricePerLoad;

    if (selectedOrder) {
      updateOrder(selectedOrder.id, {
        status: 'checked_in' as OrderStatus,
        bagCardNumber: checkInBagCard,
        weight,
        loads,
        totalPrice,
        items: checkInItems,
        hasWhites,
        checkedInBy: signedInStaff[0]?.name || 'Unknown',
      });
    }

    toast.success(`Order checked in successfully${extraLoadsForWhites ? ' (+1 load for whites)' : ''}`);
    setCurrentView('dashboard');
    setSelectedOrder(null);
  };

  const createWalkInOrder = () => {
    if (!walkInPhone || !walkInName) {
      toast.error('Please fill in phone and name');
      return;
    }

    const newOrder = addOrder({
      code: `WL-${Math.floor(Math.random() * 9000) + 1000}`,
      customerPhone: walkInPhone,
      customerName: walkInName,
      hall: walkInHall,
      room: walkInRoom,
      status: 'checked_in' as OrderStatus,
      bagCardNumber: null,
      items: [],
      totalPrice: null,
      weight: null,
      loads: null,
      paymentMethod: 'pending',
      paymentStatus: 'pending',
      orderType: 'walkin',
    });

    setSelectedOrder(newOrder);
    setCurrentView('checkin');
    setWalkInPhone('');
    setWalkInName('');
    setWalkInHall('');
    setWalkInRoom('');
    toast.success('Walk-in order created');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrder(orderId, { 
      status: newStatus,
      processedBy: signedInStaff[0]?.name || 'Unknown',
    });
    setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status: newStatus } : prev);
    toast.success(`Order updated to ${ORDER_STAGES.find(s => s.status === newStatus)?.label}`);
  };

  // WebAuthn payment authorization
  const initiatePayment = async () => {
    setIsAuthorizingPayment(true);
    
    // Verify staff with WebAuthn before processing payment
    const result = await verifyStaff();
    
    if (result.success && result.staffName) {
      setPaymentAuthorizedBy(result.staffName);
      setCurrentView('payment');
    } else {
      toast.error('Payment authorization failed. Please try again.');
    }
    
    setIsAuthorizingPayment(false);
  };

  const processPayment = (method: PaymentMethod) => {
    if (!selectedOrder) return;

    if (method === 'hubtel' || method === 'momo') {
      // Send USSD prompt to customer
      const phone = selectedOrder.customerPhone;
      toast.success(`USSD prompt sent to ${phone}`, {
        description: `Amount: ₵${selectedOrder.totalPrice} via ${method.toUpperCase()}`
      });
    }

    updateOrder(selectedOrder.id, {
      paymentMethod: method,
      paymentStatus: 'paid',
      paidAt: new Date(),
      paidAmount: selectedOrder.totalPrice || 0,
      processedBy: paymentAuthorizedBy || signedInStaff[0]?.name || 'Unknown',
    });

    toast.success('Payment recorded successfully!');
    setCurrentView('order-detail');
    setSelectedOrder(prev => prev ? { 
      ...prev, 
      paymentMethod: method, 
      paymentStatus: 'paid',
      paidAt: new Date(),
      paidAmount: prev.totalPrice || 0,
    } : null);
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

  const sendWhatsAppReady = (order: Order) => {
    const message = encodeURIComponent(
      `🧺 *WashLab Order Ready!*\n\nYour order *${order.code}* is ready for pickup!\n\nBag Tag: #${order.bagCardNumber}\n\nReply:\n*1* – I'll pick up at WashLab\n*2* – Please deliver to my room`
    );
    const phone = order.customerPhone.startsWith('0') ? `233${order.customerPhone.slice(1)}` : order.customerPhone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened');
  };

  // Send pickup verification code
  const sendPickupVerification = (order: Order) => {
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const message = encodeURIComponent(
      `🔐 *WashLab Pickup Verification*\n\nOrder: ${order.code}\n\nYour verification code is: *${verificationCode}*\n\nShare this code with the person picking up your laundry.`
    );
    const phone = order.customerPhone.startsWith('0') ? `233${order.customerPhone.slice(1)}` : order.customerPhone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('Verification code sent via WhatsApp');
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
        setCurrentView('dashboard');
      }
    } else {
      toast.error('WebAuthn not supported. Please use manual sign-in.');
    }
  };

  const handleManualSignIn = (name: string) => {
    const newStaff: SignedInStaff = { 
      id: `staff-${Date.now()}`, 
      name, 
      signedInAt: new Date() 
    };
    setSignedInStaff(prev => [...prev, newStaff]);
    toast.success(`${name} signed in (manual)`);
    setCurrentView('dashboard');
  };

  const handleStaffSignOut = async (staffId: string) => {
    if (isSupported) {
      const result = await verifyStaff(staffId);
      if (result.success) {
        const staff = signedInStaff.find(s => s.id === staffId);
        setSignedInStaff(prev => prev.filter(s => s.id !== staffId));
        if (staff) toast.success(`${staff.name} signed out`);
      }
    } else {
      const staff = signedInStaff.find(s => s.id === staffId);
      setSignedInStaff(prev => prev.filter(s => s.id !== staffId));
      if (staff) toast.success(`${staff.name} signed out`);
    }
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

  // Dashboard View - POS Style
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-muted/30">
        {/* Top Bar */}
        <header className="bg-primary text-primary-foreground px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/">
                <img src={washLabLogo} alt="WashLab" className="h-8 sm:h-10 w-auto brightness-0 invert" />
              </Link>
              <div className="h-8 w-px bg-primary-foreground/20 hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-primary-foreground/70 text-xs">Branch</p>
                <p className="font-semibold">Main Campus</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Signed in staff avatars */}
              {signedInStaff.length > 0 && (
                <div className="flex items-center gap-2 mr-2">
                  <div className="flex -space-x-2">
                    {signedInStaff.slice(0, 3).map((staff) => (
                      <div key={staff.id} className="w-8 h-8 rounded-full bg-primary-foreground/20 border-2 border-primary flex items-center justify-center text-xs font-bold">
                        {staff.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-primary-foreground/70 hidden sm:inline">
                    {signedInStaff.length} on duty
                  </span>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('staff-signin')} 
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Fingerprint className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Attendance</span>
              </Button>
              <div className="h-8 w-px bg-primary-foreground/20 hidden sm:block" />
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              <div className="text-right hidden sm:block">
                <p className="text-primary-foreground/70 text-xs">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <p className="font-mono font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by order code or phone..."
                className="pl-12 h-12 bg-card border-border rounded-xl"
              />
            </div>
            <Button onClick={handleSearch} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90">
              Search
            </Button>
          </div>

          {/* MAIN ACTION BUTTONS */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => setCurrentView('walkin')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 min-h-[120px]"
              >
                <Plus className="w-10 h-10" />
                <span className="font-semibold">New Walk-in</span>
              </button>
              
              <button 
                onClick={() => setCurrentView('pending-list')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 min-h-[120px] relative"
              >
                <Package className="w-10 h-10" />
                <span className="font-semibold">Check-in Order</span>
                {pendingOrders.length > 0 && (
                  <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white text-emerald-600 font-bold text-sm flex items-center justify-center animate-pulse">
                    {pendingOrders.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setCurrentView('in-progress-list')}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 min-h-[120px] relative"
              >
                <Sparkles className="w-10 h-10" />
                <span className="font-semibold">In Progress</span>
                {activeOrders.length > 0 && (
                  <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white text-amber-600 font-bold text-sm flex items-center justify-center">
                    {activeOrders.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setCurrentView('ready-list')}
                className="bg-violet-500 hover:bg-violet-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/20 min-h-[120px] relative"
              >
                <Check className="w-10 h-10" />
                <span className="font-semibold">Ready Orders</span>
                {readyOrders.length > 0 && (
                  <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white text-violet-600 font-bold text-sm flex items-center justify-center">
                    {readyOrders.length}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* Pending Drop-offs */}
          {pendingOrders.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Pending Drop-off</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card rounded-2xl border-2 border-amber-200 p-5 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xl font-bold text-foreground">{order.code}</p>
                        <p className="text-sm text-muted-foreground">Bag Tag: —</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                        Pending
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <p className="text-foreground font-medium">{order.customerName}</p>
                      <p className="text-muted-foreground">{order.customerPhone}</p>
                      <p className="text-muted-foreground">{order.hall} • {order.room}</p>
                    </div>
                    
                    <Button 
                      onClick={() => handleCheckIn(order)} 
                      className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Check In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Active Orders */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Active Orders</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => { setSelectedOrder(order); setCurrentView('order-detail'); }}
                  className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xl font-bold text-foreground">{order.code}</p>
                      <p className="text-sm text-muted-foreground">
                        Bag Tag: {order.bagCardNumber ? `#${order.bagCardNumber}` : '—'}
                      </p>
                    </div>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  
                  {order.items.length > 0 && (
                    <div className="space-y-1 mb-4 text-sm">
                      {order.items.slice(0, 3).map((item, i) => (
                        <p key={i} className="text-muted-foreground">• {item.category} – {item.quantity}</p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-muted-foreground">+ {order.items.length - 3} more</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-semibold text-foreground capitalize">{order.status.replace('_', ' ')}</p>
                    </div>
                    {order.totalPrice && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{order.paymentStatus === 'paid' ? 'Paid' : 'Due'}</p>
                        <p className={`font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-primary'}`}>₵{order.totalPrice}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {activeOrders.length === 0 && (
                <div className="col-span-full bg-card rounded-2xl border border-border p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No active orders at the moment</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Check-in View
  if (currentView === 'checkin' && selectedOrder) {
    const weight = parseFloat(checkInWeight) || 0;
    const extraLoadsForWhites = hasWhites ? 1 : 0;
    const baseLoads = weight <= 9 ? 1 : Math.ceil(weight / 8);
    const loads = baseLoads + extraLoadsForWhites;
    const totalPrice = loads * 25;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')} className="text-slate-600">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="flex-1 text-center">
                <h1 className="font-semibold text-slate-900">Check In: {selectedOrder.code}</h1>
              </div>
              <div className="w-16" />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Customer Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-900">{selectedOrder.customerName}</p>
                <p className="text-slate-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {selectedOrder.customerPhone}
                </p>
              </div>
            </div>
            {selectedOrder.hall && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{selectedOrder.hall}, Room {selectedOrder.room}</span>
              </div>
            )}
          </div>

          {/* Weight & Bag Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Order Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-slate-700 mb-2 block">Weight (kg)</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="number"
                    step="0.1"
                    value={checkInWeight}
                    onChange={(e) => setCheckInWeight(e.target.value)}
                    placeholder="0.0"
                    className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-700 mb-2 block">Bag Tag #</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="number"
                    value={checkInBagCard}
                    onChange={(e) => setCheckInBagCard(e.target.value)}
                    placeholder="10"
                    className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Has Whites Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setHasWhites(!hasWhites)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  hasWhites ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👕</span>
                  <div className="text-left">
                    <p className="font-medium">Has Whites</p>
                    <p className="text-sm text-slate-500">Adds +1 load for separate wash</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  hasWhites ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                }`}>
                  {hasWhites && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            </div>

            {checkInWeight && (
              <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Calculated Price</p>
                  <p className="text-2xl font-bold text-blue-700">₵{totalPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Loads</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {loads} {hasWhites && <span className="text-sm font-normal">(+1 whites)</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Item Categories */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Item Categories</h3>
              <Button variant="outline" size="sm" onClick={addCheckInItem} className="rounded-lg">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {checkInItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Select
                    value={item.category}
                    onValueChange={(v) => updateCheckInItem(index, 'category', v)}
                  >
                    <SelectTrigger className="flex-1 h-11 rounded-lg bg-slate-50">
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
                    onChange={(e) => updateCheckInItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 h-11 text-center rounded-lg bg-slate-50"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeCheckInItem(index)} className="text-slate-400 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              {checkInItems.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Shirt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Click "Add Item" to categorize clothes for the receipt</p>
                </div>
              )}
            </div>
          </div>

          {/* Complete Button */}
          <Button onClick={completeCheckIn} className="w-full h-14 text-lg rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
            <Check className="w-5 h-5 mr-2" />
            Complete Check-In
          </Button>
        </main>
      </div>
    );
  }

  // Payment View
  if (currentView === 'payment' && selectedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('order-detail')} className="text-slate-600">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="flex-1 text-center">
                <h1 className="font-semibold text-slate-900">Payment: {selectedOrder.code}</h1>
              </div>
              <div className="w-16" />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Authorization Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-emerald-700">Payment authorized by</p>
              <p className="font-semibold text-emerald-800">{paymentAuthorizedBy}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.category}</span>
                  <span className="font-medium">× {item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between">
                <span className="text-slate-600">Weight</span>
                <span className="font-medium">{selectedOrder.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Loads</span>
                <span className="font-medium">{selectedOrder.loads}</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-sm text-purple-600 mb-1">Total Amount</p>
              <p className="text-4xl font-bold text-purple-700">₵{selectedOrder.totalPrice}</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Select Payment Method</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => processPayment('hubtel')}
                className="w-full p-4 rounded-xl border-2 border-purple-200 hover:border-purple-400 bg-purple-50 transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-900">Hubtel USSD</p>
                  <p className="text-sm text-slate-500">Send USSD prompt to customer's phone</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-500" />
              </button>

              <button
                onClick={() => processPayment('momo')}
                className="w-full p-4 rounded-xl border-2 border-amber-200 hover:border-amber-400 bg-amber-50 transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-900">Mobile Money</p>
                  <p className="text-sm text-slate-500">MTN MoMo / Vodafone Cash / AirtelTigo Money</p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-500" />
              </button>

              <button
                onClick={() => processPayment('cash')}
                className="w-full p-4 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 bg-emerald-50 transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-900">Cash</p>
                  <p className="text-sm text-slate-500">Customer pays cash at counter</p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-500" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Walk-in View
  if (currentView === 'walkin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')} className="text-slate-600">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="flex-1 text-center">
                <h1 className="font-semibold text-slate-900">New Walk-In Order</h1>
              </div>
              <div className="w-16" />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                <User className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-slate-900">Customer Information</h2>
                <p className="text-slate-500">Enter the customer's details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 mb-2 block">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="0XX XXX XXXX"
                    className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-slate-700 mb-2 block">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Customer name"
                    className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 mb-2 block">Hall / Hostel</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      value={walkInHall}
                      onChange={(e) => setWalkInHall(e.target.value)}
                      placeholder="e.g. Akuafo Hall"
                      className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 mb-2 block">Room Number</Label>
                  <Input
                    value={walkInRoom}
                    onChange={(e) => setWalkInRoom(e.target.value)}
                    placeholder="e.g. A302"
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <Button onClick={createWalkInOrder} className="w-full h-14 text-lg rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white mt-6">
              Create Order & Check In
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Order Detail View
  if (currentView === 'order-detail' && selectedOrder) {
    const currentStageIndex = ORDER_STAGES.findIndex(s => s.status === selectedOrder.status);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')} className="text-slate-600">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="flex-1 text-center">
                <h1 className="font-semibold text-slate-900">{selectedOrder.code}</h1>
              </div>
              <StatusBadge status={selectedOrder.status} size="sm" />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-slate-900">{selectedOrder.customerName}</p>
                <p className="text-slate-500">{selectedOrder.customerPhone}</p>
              </div>
              {selectedOrder.bagCardNumber && (
                <div className="px-4 py-2 rounded-xl bg-blue-100">
                  <p className="text-xs text-blue-600">Bag Tag</p>
                  <p className="text-xl font-bold text-blue-700">#{selectedOrder.bagCardNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {selectedOrder.weight && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">{selectedOrder.weight}kg</p>
                  <p className="text-xs text-slate-500">Weight</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">{selectedOrder.loads}</p>
                  <p className="text-xs text-slate-500">Loads</p>
                </div>
                <div className={`text-center p-3 rounded-xl ${selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  <p className={`text-2xl font-bold ${selectedOrder.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>₵{selectedOrder.totalPrice}</p>
                  <p className="text-xs text-slate-500">{selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Due'}</p>
                </div>
              </div>
              
              {selectedOrder.items.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-500 mb-2">Items</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.items.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                        {item.category} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.paymentStatus === 'paid' && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-700">
                      Paid via {selectedOrder.paymentMethod?.toUpperCase()}
                      {selectedOrder.processedBy && ` • Processed by ${selectedOrder.processedBy}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Progress</h3>
            <div className="flex items-center justify-between mb-6 overflow-x-auto">
              {ORDER_STAGES.filter(s => !['pending_dropoff', 'out_for_delivery', 'completed'].includes(s.status)).map((stage, index) => {
                const stageIndex = ORDER_STAGES.findIndex(s => s.status === stage.status);
                const isCompleted = currentStageIndex > stageIndex;
                const isCurrent = currentStageIndex === stageIndex;
                
                return (
                  <div key={stage.status} className="flex-1 flex flex-col items-center min-w-[60px]">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted ? 'bg-emerald-500 text-white' :
                      isCurrent ? 'bg-blue-500 text-white' :
                      'bg-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    <p className={`text-xs text-center ${isCurrent ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                      {stage.label}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Stage Actions */}
            {selectedOrder.status !== 'completed' && selectedOrder.status !== 'pending_dropoff' && (
              <div className="grid grid-cols-2 gap-3">
                {ORDER_STAGES.filter(s => !['pending_dropoff', 'completed'].includes(s.status))
                  .slice(ORDER_STAGES.findIndex(s => s.status === selectedOrder.status) + 1, ORDER_STAGES.findIndex(s => s.status === selectedOrder.status) + 2)
                  .map((nextStage) => (
                    <Button
                      key={nextStage.status}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, nextStage.status)}
                      className="h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Move to {nextStage.label}
                    </Button>
                  ))}
                {selectedOrder.status === 'ready' && (
                  <Button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                    className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark Completed
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {selectedOrder.paymentStatus !== 'paid' && selectedOrder.totalPrice && (
                <Button 
                  onClick={initiatePayment}
                  disabled={isAuthorizingPayment || isProcessing}
                  className="h-12 rounded-xl bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isAuthorizingPayment || isProcessing ? (
                    <>
                      <Fingerprint className="w-5 h-5 mr-2 animate-pulse" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5 mr-2" />
                      Charge Customer
                    </>
                  )}
                </Button>
              )}
              {selectedOrder.paymentStatus === 'paid' && (
                <Button 
                  onClick={() => sendWhatsAppReceipt(selectedOrder)}
                  variant="outline"
                  className="h-12 rounded-xl border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send Receipt
                </Button>
              )}
              {selectedOrder.status === 'ready' && (
                <>
                  <Button 
                    onClick={() => sendWhatsAppReady(selectedOrder)}
                    className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Notify Ready
                  </Button>
                  <Button 
                    onClick={() => sendPickupVerification(selectedOrder)}
                    variant="outline"
                    className="h-12 rounded-xl"
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Send Pickup Code
                  </Button>
                  <Button 
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                    variant="outline"
                    className="h-12 rounded-xl"
                  >
                    <Truck className="w-5 h-5 mr-2" />
                    Out for Delivery
                  </Button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pending Orders List View
  if (currentView === 'pending-list') {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="bg-emerald-500 text-white px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')} className="text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <h1 className="font-semibold flex-1">Pending Check-ins ({pendingOrders.length})</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4 space-y-4">
          {pendingOrders.map(order => (
            <div key={order.id} className="bg-card rounded-xl border p-4" onClick={() => handleCheckIn(order)}>
              <div className="flex justify-between items-start mb-2">
                <div><p className="font-bold text-lg">{order.code}</p><p className="text-sm text-muted-foreground">{order.customerName}</p></div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">Pending</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{order.customerPhone} • {order.hall}</p>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Check In <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          ))}
          {pendingOrders.length === 0 && <div className="text-center py-12 text-muted-foreground">No pending orders</div>}
        </main>
      </div>
    );
  }

  // In Progress List View
  if (currentView === 'in-progress-list') {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="bg-amber-500 text-white px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')} className="text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <h1 className="font-semibold flex-1">In Progress ({activeOrders.length})</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4 space-y-4">
          {activeOrders.map(order => (
            <div key={order.id} className="bg-card rounded-xl border p-4 cursor-pointer" onClick={() => { setSelectedOrder(order); setCurrentView('order-detail'); }}>
              <div className="flex justify-between items-start mb-2">
                <div><p className="font-bold text-lg">{order.code}</p><p className="text-sm text-muted-foreground">Bag #{order.bagCardNumber || '—'}</p></div>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">{order.customerName} • ₵{order.totalPrice || '—'}</p>
            </div>
          ))}
          {activeOrders.length === 0 && <div className="text-center py-12 text-muted-foreground">No orders in progress</div>}
        </main>
      </div>
    );
  }

  // Ready Orders List View
  if (currentView === 'ready-list') {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="bg-violet-500 text-white px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')} className="text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <h1 className="font-semibold flex-1">Ready for Pickup ({readyOrders.length})</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4 space-y-4">
          {readyOrders.map(order => (
            <div key={order.id} className="bg-card rounded-xl border p-4">
              <div className="flex justify-between items-start mb-2">
                <div><p className="font-bold text-lg">{order.code}</p><p className="text-sm text-muted-foreground">Bag #{order.bagCardNumber}</p></div>
                <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">Ready</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{order.customerName} • {order.customerPhone}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => sendWhatsAppReady(order)} className="flex-1 bg-emerald-500"><MessageCircle className="w-4 h-4 mr-1" />Notify</Button>
                <Button size="sm" onClick={() => sendPickupVerification(order)} variant="outline" className="flex-1"><ShieldCheck className="w-4 h-4 mr-1" />Pickup Code</Button>
              </div>
              <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'completed')} variant="outline" className="w-full mt-2"><Check className="w-4 h-4 mr-1" />Mark Complete</Button>
            </div>
          ))}
          {readyOrders.length === 0 && <div className="text-center py-12 text-muted-foreground">No ready orders</div>}
        </main>
      </div>
    );
  }

  // Staff Sign-in View with WebAuthn
  if (currentView === 'staff-signin') {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="bg-primary text-primary-foreground px-4 py-4">
          <div className="max-w-md mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')} className="text-primary-foreground hover:bg-primary-foreground/10">
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <h1 className="font-semibold flex-1">Staff Attendance</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto p-4">
          {/* WebAuthn Sign In */}
          <div className="bg-card rounded-2xl border p-6 mb-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-semibold text-lg">Biometric Sign In</h2>
              <p className="text-sm text-muted-foreground">Use Face ID or fingerprint to sign in</p>
            </div>

            {isSupported ? (
              <div className="space-y-3">
                <Button 
                  onClick={handleStaffSignIn} 
                  disabled={isProcessing}
                  className="w-full h-14 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Fingerprint className="w-5 h-5 mr-2 animate-pulse" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In with Biometrics
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowEnrollDialog(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Enroll New Staff
                </Button>
              </div>
            ) : (
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-amber-700 font-medium">WebAuthn not supported</p>
                <p className="text-sm text-amber-600">Use manual sign-in below</p>
              </div>
            )}
          </div>

          {/* Manual Fallback */}
          <div className="bg-card rounded-2xl border p-6 mb-4">
            <h3 className="font-semibold mb-4">Manual Sign In (Fallback)</h3>
            <div className="space-y-3">
              <Input placeholder="Enter staff name" id="staff-name-input" className="h-12" />
              <Button 
                onClick={() => { 
                  const input = document.getElementById('staff-name-input') as HTMLInputElement; 
                  if (input?.value) handleManualSignIn(input.value); 
                }} 
                variant="outline"
                className="w-full h-12"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Manual Sign In
              </Button>
            </div>
          </div>

          {/* Currently On Duty */}
          {signedInStaff.length > 0 && (
            <div className="bg-card rounded-2xl border p-6 mb-4">
              <h3 className="font-semibold mb-4">Currently On Duty ({signedInStaff.length})</h3>
              <div className="space-y-2">
                {signedInStaff.map(staff => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">Since {staff.signedInAt.toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleStaffSignOut(staff.id)}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enrolled Staff */}
          {enrolledStaff.length > 0 && (
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="font-semibold mb-4">Enrolled Staff ({enrolledStaff.length})</h3>
              <div className="space-y-2">
                {enrolledStaff.map(staff => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="w-5 h-5 text-primary" />
                      <span className="font-medium">{staff.staffName}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeEnrollment(staff.id)} className="text-red-500 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Enroll Dialog */}
        <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enroll New Staff</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Staff Name</Label>
                <Input
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  placeholder="Enter staff name"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleEnrollNewStaff}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Fingerprint className="w-5 h-5 mr-2 animate-pulse" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 mr-2" />
                    Enroll with Biometrics
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Staff will be prompted to use Face ID or fingerprint
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
};

export default WashStation;

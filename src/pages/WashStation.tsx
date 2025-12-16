import { useState, useEffect } from 'react';
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
import { ORDER_STAGES, OrderStatus, ITEM_CATEGORIES } from '@/types';
import { useOrders, Order } from '@/context/OrderContext';
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
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

type View = 'dashboard' | 'checkin' | 'walkin' | 'order-detail';

const WashStation = () => {
  const { orders, addOrder, updateOrder, getPendingOrders, getActiveOrders, getReadyOrders } = useOrders();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Check-in state
  const [checkInWeight, setCheckInWeight] = useState('');
  const [checkInBagCard, setCheckInBagCard] = useState('');
  const [checkInItems, setCheckInItems] = useState<{ category: string; quantity: number }[]>([]);
  
  // Walk-in state
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInHall, setWalkInHall] = useState('');
  const [walkInRoom, setWalkInRoom] = useState('');
  
  // Payment authorization
  const [isAuthorizingPayment, setIsAuthorizingPayment] = useState(false);

  const pendingOrders = getPendingOrders();
  const activeOrders = getActiveOrders();
  const readyOrders = getReadyOrders();

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
    const loads = weight <= 9 ? 1 : Math.ceil(weight / 8);
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
      });
    }

    toast.success('Order checked in successfully');
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
    updateOrder(orderId, { status: newStatus });
    setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status: newStatus } : prev);
    toast.success(`Order updated to ${ORDER_STAGES.find(s => s.status === newStatus)?.label}`);
  };

  const initiatePayment = () => {
    setIsAuthorizingPayment(true);
    setTimeout(() => {
      setIsAuthorizingPayment(false);
      toast.success('Payment initiated! Customer will receive USSD prompt.');
    }, 2000);
  };

  const sendWhatsAppReceipt = (order: Order) => {
    const itemsList = order.items.map(i => `• ${i.category} – ${i.quantity}`).join('\n');
    const message = encodeURIComponent(
      `*WashLab Receipt – ${order.code}*\n*Bag Card: #${order.bagCardNumber}*\n\n*Items:*\n${itemsList}\n\n*Amount Paid:* ₵${order.totalPrice}\n\nThank you!`
    );
    const phone = order.customerPhone.startsWith('0') ? `233${order.customerPhone.slice(1)}` : order.customerPhone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened');
  };

  const sendWhatsAppReady = (order: Order) => {
    const message = encodeURIComponent(
      `Your WashLab order (${order.code}) is ready.\n\nReply:\n1 – Pickup\n2 – Delivery`
    );
    const phone = order.customerPhone.startsWith('0') ? `233${order.customerPhone.slice(1)}` : order.customerPhone;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened');
  };

  // Dashboard View - POS Style
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-muted/30">
        {/* Top Bar - Branch, Clock */}
        <header className="bg-primary text-primary-foreground px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <div className="h-8 w-px bg-primary-foreground/20" />
              <div>
                <p className="text-primary-foreground/70 text-xs">Branch</p>
                <p className="font-semibold">Main Campus</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/staff'} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <Users className="w-4 h-4 mr-2" />
                Staff
              </Button>
              <div className="h-8 w-px bg-primary-foreground/20 hidden sm:block" />
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

          {/* MAIN ACTION BUTTONS - BIG TOUCH BUTTONS */}
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
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 min-h-[120px] relative"
              >
                <Package className="w-10 h-10" />
                <span className="font-semibold">Check-in Order</span>
                {pendingOrders.length > 0 && (
                  <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white text-emerald-600 font-bold text-sm flex items-center justify-center">
                    {pendingOrders.length}
                  </span>
                )}
              </button>
              
              <button 
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

          {/* Pending Drop-offs - ORDER CARDS */}
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

          {/* Active Orders - ORDER CARDS */}
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
                        <p className="text-xs text-muted-foreground">Paid</p>
                        <p className="font-bold text-primary">₵{order.totalPrice}</p>
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
    const loads = weight <= 9 ? 1 : Math.ceil(weight / 8);
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
                <Label className="text-slate-700 mb-2 block">Bag Card #</Label>
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

            {checkInWeight && (
              <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Calculated Price</p>
                  <p className="text-2xl font-bold text-blue-700">₵{totalPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Loads</p>
                  <p className="text-2xl font-bold text-blue-700">{loads}</p>
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
                  <p className="text-xs text-blue-600">Bag Card</p>
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
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">₵{selectedOrder.totalPrice}</p>
                  <p className="text-xs text-slate-500">Total</p>
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
            </div>
          )}

          {/* Stage Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Progress</h3>
            <div className="flex items-center justify-between mb-6">
              {ORDER_STAGES.filter(s => !['pending_dropoff', 'out_for_delivery', 'completed'].includes(s.status)).map((stage, index) => {
                const stageIndex = ORDER_STAGES.findIndex(s => s.status === stage.status);
                const isCompleted = currentStageIndex > stageIndex;
                const isCurrent = currentStageIndex === stageIndex;
                
                return (
                  <div key={stage.status} className="flex-1 flex flex-col items-center">
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
              {!selectedOrder.totalPrice && (
                <Button 
                  onClick={initiatePayment}
                  disabled={isAuthorizingPayment}
                  className="h-12 rounded-xl bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isAuthorizingPayment ? (
                    <>
                      <Camera className="w-5 h-5 mr-2 animate-pulse" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Charge Customer
                    </>
                  )}
                </Button>
              )}
              {selectedOrder.totalPrice && (
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
                <Button 
                  onClick={() => sendWhatsAppReady(selectedOrder)}
                  className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Notify Ready
                </Button>
              )}
              {selectedOrder.status === 'ready' && (
                <Button 
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                  variant="outline"
                  className="h-12 rounded-xl"
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Out for Delivery
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default WashStation;

import { useState } from 'react';
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
import { 
  Search, 
  Plus, 
  Package, 
  Scale,
  CreditCard,
  MessageCircle,
  Camera,
  Truck,
  Check,
  ChevronRight,
  Home,
  ClipboardList,
  Users,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Mock orders
const mockOrders = [
  {
    id: '1',
    code: 'WL-4921',
    customerPhone: '0551234567',
    customerName: 'Kwame Asante',
    status: 'ready' as OrderStatus,
    bagTag: '#10',
    items: [
      { category: 'Shirts', quantity: 3 },
      { category: 'Shorts', quantity: 2 },
    ],
    totalPrice: 50,
    weight: 6.5,
    loads: 1,
  },
  {
    id: '2',
    code: 'WL-4922',
    customerPhone: '0201234567',
    customerName: 'Ama Serwaa',
    status: 'washing' as OrderStatus,
    bagTag: '#11',
    items: [
      { category: 'Dresses', quantity: 4 },
      { category: 'Blouses', quantity: 3 },
    ],
    totalPrice: 75,
    weight: 9.2,
    loads: 2,
  },
  {
    id: '3',
    code: 'WL-4923',
    customerPhone: '0551112222',
    customerName: 'Kofi Mensah',
    status: 'pending_dropoff' as OrderStatus,
    bagTag: null,
    items: [],
    totalPrice: null,
    weight: null,
    loads: null,
  },
];

type View = 'dashboard' | 'checkin' | 'walkin' | 'order-detail';

const WashStation = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [orders, setOrders] = useState(mockOrders);
  
  // Check-in state
  const [checkInWeight, setCheckInWeight] = useState('');
  const [checkInBagTag, setCheckInBagTag] = useState('');
  const [checkInItems, setCheckInItems] = useState<{ category: string; quantity: number }[]>([]);
  
  // Walk-in state
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInClothesCount, setWalkInClothesCount] = useState('');
  
  // Payment authorization
  const [isAuthorizingPayment, setIsAuthorizingPayment] = useState(false);

  const pendingOrders = orders.filter(o => o.status === 'pending_dropoff');
  const activeOrders = orders.filter(o => !['pending_dropoff', 'completed'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'ready');

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

  const handleCheckIn = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setCurrentView('checkin');
    setCheckInWeight('');
    setCheckInBagTag('');
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
    if (!checkInWeight || !checkInBagTag || checkInItems.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }

    const weight = parseFloat(checkInWeight);
    const loads = Math.ceil(weight / 8);
    const pricePerLoad = 25;
    const totalPrice = loads * pricePerLoad;

    setOrders(orders.map(o => 
      o.id === selectedOrder?.id 
        ? { 
            ...o, 
            status: 'checked_in' as OrderStatus,
            bagTag: `#${checkInBagTag}`,
            weight,
            loads,
            totalPrice,
            items: checkInItems,
          } 
        : o
    ));

    toast.success('Order checked in successfully');
    setCurrentView('dashboard');
    setSelectedOrder(null);
  };

  const createWalkInOrder = () => {
    if (!walkInPhone || !walkInName || !walkInClothesCount) {
      toast.error('Please fill in all fields');
      return;
    }

    const newOrder = {
      id: `walk-${Date.now()}`,
      code: `WL-${Math.floor(Math.random() * 9000) + 1000}`,
      customerPhone: walkInPhone,
      customerName: walkInName,
      status: 'checked_in' as OrderStatus,
      bagTag: null,
      items: [],
      totalPrice: null,
      weight: null,
      loads: null,
    };

    setOrders([newOrder, ...orders]);
    setSelectedOrder(newOrder);
    setCurrentView('checkin');
    setWalkInPhone('');
    setWalkInName('');
    setWalkInClothesCount('');
    toast.success('Walk-in order created');
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast.success(`Order updated to ${ORDER_STAGES.find(s => s.status === newStatus)?.label}`);
  };

  const initiatePayment = () => {
    setIsAuthorizingPayment(true);
    // Simulate Face ID authorization
    setTimeout(() => {
      setIsAuthorizingPayment(false);
      toast.success('Payment initiated! Customer will receive USSD prompt.');
    }, 2000);
  };

  const sendWhatsAppNotification = (order: typeof mockOrders[0]) => {
    const message = encodeURIComponent(
      `WashLab Order Update\n\nYour order (${order.code}) is ready!\nBag Tag: ${order.bagTag}\n\nReply:\n1 - Pickup\n2 - Delivery`
    );
    window.open(`https://wa.me/${order.customerPhone}?text=${message}`, '_blank');
    toast.success('WhatsApp opened');
  };

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-strong border-b border-border">
          <div className="container flex items-center justify-between h-16 px-4">
            <Logo size="sm" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/staff'}>
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="container px-4 py-6">
          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by order code or phone"
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="hero" onClick={() => setCurrentView('walkin')}>
              <Plus className="w-5 h-5" />
              Walk-In
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-display font-bold text-warning">{pendingOrders.length}</p>
              <p className="text-xs text-muted-foreground">Pending Drop-off</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-display font-bold text-primary">{activeOrders.length}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-display font-bold text-success">{readyOrders.length}</p>
              <p className="text-xs text-muted-foreground">Ready</p>
            </div>
          </div>

          {/* Pending Drop-offs */}
          {pendingOrders.length > 0 && (
            <div className="mb-6">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-warning" />
                Pending Drop-off ({pendingOrders.length})
              </h2>
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card rounded-xl border border-warning/30 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{order.code}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <Button size="sm" onClick={() => handleCheckIn(order)}>
                      Check In
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Orders */}
          <div>
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Active Orders
            </h2>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => { setSelectedOrder(order); setCurrentView('order-detail'); }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{order.code}</span>
                      {order.bagTag && (
                        <span className="px-2 py-0.5 bg-primary/10 rounded text-xs text-primary font-medium">
                          {order.bagTag}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName} • {order.customerPhone}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check-in View
  if (currentView === 'checkin' && selectedOrder) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass-strong border-b border-border">
          <div className="container flex items-center justify-between h-16 px-4">
            <Button variant="ghost" onClick={() => setCurrentView('dashboard')}>
              <ChevronRight className="w-5 h-5 rotate-180" />
              Back
            </Button>
            <h1 className="font-display font-semibold">Check In: {selectedOrder.code}</h1>
            <div className="w-20" />
          </div>
        </header>

        <div className="container max-w-lg mx-auto px-4 py-6">
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="mb-4 pb-4 border-b border-border">
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-semibold">{selectedOrder.customerName}</p>
              <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
            </div>

            {/* Weight */}
            <div className="mb-4">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={checkInWeight}
                onChange={(e) => setCheckInWeight(e.target.value)}
                placeholder="Enter weight"
                className="mt-1"
              />
              {checkInWeight && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated loads: {Math.ceil(parseFloat(checkInWeight) / 8)} 
                  (₵{Math.ceil(parseFloat(checkInWeight) / 8) * 25})
                </p>
              )}
            </div>

            {/* Bag Tag */}
            <div className="mb-4">
              <Label htmlFor="bagTag">Bag Tag Number</Label>
              <Input
                id="bagTag"
                type="number"
                value={checkInBagTag}
                onChange={(e) => setCheckInBagTag(e.target.value)}
                placeholder="Enter tag number (e.g. 10)"
                className="mt-1"
              />
            </div>

            {/* Item Categories */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Item Categories (for receipt)</Label>
                <Button variant="ghost" size="sm" onClick={addCheckInItem}>
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {checkInItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={item.category}
                      onValueChange={(v) => updateCheckInItem(index, 'category', v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Category" />
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
                      className="w-20"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeCheckInItem(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {checkInItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Click "Add" to categorize items for the receipt
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button onClick={completeCheckIn} className="w-full" size="lg">
            <Check className="w-5 h-5" />
            Complete Check-In
          </Button>
        </div>
      </div>
    );
  }

  // Walk-in View
  if (currentView === 'walkin') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass-strong border-b border-border">
          <div className="container flex items-center justify-between h-16 px-4">
            <Button variant="ghost" onClick={() => setCurrentView('dashboard')}>
              <ChevronRight className="w-5 h-5 rotate-180" />
              Back
            </Button>
            <h1 className="font-display font-semibold">New Walk-In Order</h1>
            <div className="w-20" />
          </div>
        </header>

        <div className="container max-w-lg mx-auto px-4 py-6">
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="0XX XXX XXXX"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Existing customer? Info will auto-fill
                </p>
              </div>
              <div>
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="Enter customer name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="count">Approximate Clothes Count</Label>
                <Input
                  id="count"
                  type="number"
                  value={walkInClothesCount}
                  onChange={(e) => setWalkInClothesCount(e.target.value)}
                  placeholder="Enter number of items"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button onClick={createWalkInOrder} className="w-full" size="lg">
            <Plus className="w-5 h-5" />
            Create Order & Check In
          </Button>
        </div>
      </div>
    );
  }

  // Order Detail View
  if (currentView === 'order-detail' && selectedOrder) {
    const currentStageIndex = ORDER_STAGES.findIndex(s => s.status === selectedOrder.status);
    const nextStage = ORDER_STAGES[currentStageIndex + 1];

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass-strong border-b border-border">
          <div className="container flex items-center justify-between h-16 px-4">
            <Button variant="ghost" onClick={() => setCurrentView('dashboard')}>
              <ChevronRight className="w-5 h-5 rotate-180" />
              Back
            </Button>
            <h1 className="font-display font-semibold">{selectedOrder.code}</h1>
            <StatusBadge status={selectedOrder.status} size="sm" />
          </div>
        </header>

        <div className="container max-w-lg mx-auto px-4 py-6">
          {/* Customer Info */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h3 className="font-display font-semibold mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{selectedOrder.customerPhone}</span>
              </div>
              {selectedOrder.bagTag && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bag Tag</span>
                  <span className="font-semibold text-primary">{selectedOrder.bagTag}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          {selectedOrder.weight && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <h3 className="font-display font-semibold mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span>{selectedOrder.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loads</span>
                  <span>{selectedOrder.loads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">₵{selectedOrder.totalPrice}</span>
                </div>
              </div>
              {selectedOrder.items.length > 0 && (
                <>
                  <div className="border-t border-border my-4" />
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-1 text-sm">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{item.category}</span>
                        <span>{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Stage Progress */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h3 className="font-display font-semibold mb-4">Update Stage</h3>
            <div className="grid grid-cols-3 gap-2">
              {ORDER_STAGES.slice(1, 7).map((stage) => (
                <button
                  key={stage.status}
                  onClick={() => updateOrderStatus(selectedOrder.id, stage.status)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    stage.status === selectedOrder.status
                      ? `${stage.color} text-white`
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="text-xs font-medium">{stage.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Payment */}
            {selectedOrder.totalPrice && selectedOrder.status === 'checked_in' && (
              <Button 
                onClick={initiatePayment} 
                className="w-full" 
                size="lg"
                disabled={isAuthorizingPayment}
              >
                {isAuthorizingPayment ? (
                  <>
                    <Camera className="w-5 h-5 animate-pulse" />
                    Authorizing with Face ID...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Charge Customer (₵{selectedOrder.totalPrice})
                  </>
                )}
              </Button>
            )}

            {/* WhatsApp Notification */}
            {selectedOrder.status === 'ready' && (
              <>
                <Button 
                  onClick={() => sendWhatsAppNotification(selectedOrder)} 
                  className="w-full" 
                  size="lg"
                  variant="success"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send WhatsApp Notification
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                  >
                    <Check className="w-5 h-5" />
                    Mark Picked Up
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                  >
                    <Truck className="w-5 h-5" />
                    Out for Delivery
                  </Button>
                </div>
              </>
            )}

            {selectedOrder.status === 'out_for_delivery' && (
              <Button 
                onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                className="w-full" 
                size="lg"
                variant="success"
              >
                <Check className="w-5 h-5" />
                Mark Delivered
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WashStation;

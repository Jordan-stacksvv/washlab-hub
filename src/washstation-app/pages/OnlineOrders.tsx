import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { useOrders, Order } from '@/context/OrderContext';
import { 
  Search,
  Phone,
  Mail,
  AlertTriangle,
  Minus,
  Plus,
  Scale,
  Package,
  ShoppingBag,
  Trash2,
  MessageSquare,
  ArrowRight,
  Clock,
  User,
  Tag,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const OnlineOrders = () => {
  const navigate = useNavigate();
  const { orders, updateOrder, getPendingOrders } = useOrders();
  
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'online' | 'walkin'>('online');
  
  // Weight intake
  const [weight, setWeight] = useState(0);
  const [laundryBags, setLaundryBags] = useState(1);
  const [hangers, setHangers] = useState(0);
  
  // Service details
  const [serviceType, setServiceType] = useState('wash_and_fold');
  const [detergent, setDetergent] = useState('standard');
  const [softener, setSoftener] = useState('none');

  const pendingOrders = getPendingOrders();

  useEffect(() => {
    const staffData = sessionStorage.getItem('washlab_active_staff');
    const branchData = sessionStorage.getItem('washlab_branch');
    
    if (!staffData || !branchData) {
      navigate('/washstation');
      return;
    }
    
    const parsed = JSON.parse(staffData);
    const staff = Array.isArray(parsed) ? parsed[0] : parsed;
    setActiveStaff({ name: staff.name || 'Staff', role: staff.role || 'Attendant' });
    
    const branch = JSON.parse(branchData);
    setBranchName(branch.name || 'Central Branch');
    
    // Auto-select first pending order
    if (pendingOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(pendingOrders[0]);
    }
  }, [navigate, pendingOrders, selectedOrder]);

  const handleLogout = () => {
    sessionStorage.removeItem('washlab_active_staff');
    navigate('/washstation');
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setWeight(0);
    setLaundryBags(1);
    setHangers(0);
  };

  const handleReject = () => {
    if (selectedOrder) {
      toast.error('Order rejected');
      setSelectedOrder(null);
    }
  };

  const handleContact = () => {
    if (selectedOrder) {
      const phone = selectedOrder.customerPhone?.startsWith('0') 
        ? `233${selectedOrder.customerPhone.slice(1)}` 
        : selectedOrder.customerPhone;
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  const handleConvertToActive = () => {
    if (selectedOrder) {
      updateOrder(selectedOrder.id, {
        status: 'checked_in',
        weight: weight,
        checkedInBy: activeStaff?.name || 'Staff'
      });
      toast.success('Order converted to active');
      navigate('/washstation/orders');
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  // Calculate totals
  const totalVolume = pendingOrders.reduce((acc, o) => acc + (o.weight || 5), 0);
  const oldestOrder = pendingOrders.length > 0 
    ? getTimeAgo(pendingOrders[pendingOrders.length - 1].createdAt)
    : 'N/A';

  const estimatedTotal = (weight * 1.75) + 5.00; // Base price + express fee example

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar 
        activeStaff={activeStaff} 
        branchName={branchName}
      />
      
      <main className="flex-1 ml-64">
        {/* Header with Search and Tabs */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-muted border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('online')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'online' 
                      ? 'bg-card text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Online Orders
                </button>
                <button
                  onClick={() => setActiveTab('walkin')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'walkin' 
                      ? 'bg-card text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Walk-in
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Station 1</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {activeStaff?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AM'}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left - Queue */}
          <div className="w-72 border-r border-border bg-card overflow-y-auto">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Intake Queue</h2>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {pendingOrders.length} Pending
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">ESTIMATED VOLUME</p>
                  <p className="text-xl font-bold text-foreground">{totalVolume} lbs</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">OLDEST ORDER</p>
                  <p className="text-xl font-bold text-destructive">● {oldestOrder}</p>
                </div>
              </div>
            </div>

            {/* Order List */}
            <div className="divide-y divide-border">
              {pendingOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedOrder?.id === order.id 
                      ? 'bg-primary/10 border-l-4 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{order.customerName}</span>
                    <span className="text-xs text-muted-foreground">{getTimeAgo(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary">#{order.code}</span>
                    <span>•</span>
                    <span>{order.items?.[0]?.category?.replace('_', ' & ') || 'Wash & Fold'}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {order.items?.[0]?.category === 'express' && (
                      <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded">Express</span>
                    )}
                  </div>
                </button>
              ))}
              
              {pendingOrders.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Center - Order Details */}
          {selectedOrder ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-foreground">{selectedOrder.customerName}</h2>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          NEW CUSTOMER
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedOrder.customerPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedOrder.customerName?.toLowerCase().replace(' ', '.')}@example.com
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          <AlertTriangle className="w-3 h-3" /> Low Temp
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning text-xs rounded">
                          ○ No Softener
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-bold text-foreground">#{selectedOrder.code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Weight Intake */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Scale className="w-5 h-5" />
                        Weight Intake
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        Customer Estimate: <strong>15 lbs</strong>
                      </span>
                    </div>
                    
                    <div className="bg-card border border-border rounded-xl p-6 mb-4">
                      <div className="text-center">
                        <span className="text-5xl font-bold text-foreground">
                          {weight.toFixed(2)}
                        </span>
                        <span className="text-xl text-muted-foreground ml-2">lbs</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setWeight(prev => prev + 0.5)}
                      >
                        +0.5 lbs Bag Weight
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setWeight(0)}
                      >
                        Reset Scale
                      </Button>
                    </div>
                  </div>

                  {/* Customer Instructions */}
                  <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <MessageSquare className="w-5 h-5 text-warning" />
                      CUSTOMER INSTRUCTIONS
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      "Please keep the white shirts separate if possible. The bag with the red ribbon has delicates."
                    </p>
                  </div>
                </div>

                {/* Items Verification */}
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5" />
                    Items Verification
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Laundry Bags</p>
                          <p className="text-xs text-muted-foreground">Standard WashLab Bag</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setLaundryBags(Math.max(0, laundryBags - 1))}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-foreground">{laundryBags}</span>
                        <button
                          onClick={() => setLaundryBags(laundryBags + 1)}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Tag className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Hangers</p>
                          <p className="text-xs text-muted-foreground">Customer Provided</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setHangers(Math.max(0, hangers - 1))}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-foreground">{hangers}</span>
                        <button
                          onClick={() => setHangers(hangers + 1)}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="mt-4 text-sm text-primary hover:underline">
                    + Add Large Item / Comforter
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-card border-t border-border p-4 flex items-center justify-between">
                <div className="flex gap-3">
                  <Button variant="outline" className="text-destructive border-destructive/30" onClick={handleReject}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="outline" onClick={handleContact}>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Press <span className="px-2 py-0.5 bg-muted rounded">Enter</span> to confirm
                  </span>
                  <Button 
                    onClick={handleConvertToActive}
                    className="bg-primary text-primary-foreground"
                    disabled={weight === 0}
                  >
                    Convert to Active Order <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select an order from the queue</p>
                <p className="text-sm">to start intake process</p>
              </div>
            </div>
          )}

          {/* Right - Service Details */}
          {selectedOrder && (
            <div className="w-72 border-l border-border bg-card p-4 overflow-y-auto">
              <h3 className="font-semibold text-foreground mb-4">Service Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase mb-2 block">SERVICE TYPE</label>
                  <select 
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground"
                  >
                    <option value="wash_and_fold">Wash & Fold (Standard)</option>
                    <option value="wash_only">Wash Only</option>
                    <option value="dry_only">Dry Only</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase mb-2 block">DETERGENT</label>
                    <select 
                      value={detergent}
                      onChange={(e) => setDetergent(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground text-sm"
                    >
                      <option value="standard">Tide (Standard)</option>
                      <option value="sensitive">Sensitive</option>
                      <option value="eco">Eco-Friendly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase mb-2 block">SOFTENER</label>
                    <select 
                      value={softener}
                      onChange={(e) => setSoftener(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border-0 rounded-lg text-foreground text-sm"
                    >
                      <option value="none">None</option>
                      <option value="standard">Standard</option>
                      <option value="fresh">Fresh Scent</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Base Price ($1.75/lb)</span>
                    <span className="text-foreground">${(weight * 1.75).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Express Fee</span>
                    <span className="text-foreground">$5.00</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium text-foreground">Estimated Total</span>
                    <span className="text-xl font-bold text-success">${estimatedTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  View Order History
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OnlineOrders;

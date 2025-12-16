import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ORDER_STAGES, OrderStatus } from '@/types';
import { useOrders } from '@/context/OrderContext';
import { Search, Phone, MessageCircle, Truck, Package } from 'lucide-react';
import { toast } from 'sonner';

const TrackPage = () => {
  const { orders, getOrderByCode } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<ReturnType<typeof getOrderByCode> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an order code or phone number');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate brief loading
    setTimeout(() => {
      // Search by code first
      let order = getOrderByCode(searchQuery.toUpperCase());
      
      // If not found by code, search by phone
      if (!order) {
        order = orders.find(o => o.customerPhone === searchQuery) || null;
      }
      
      if (order) {
        setFoundOrder(order);
        toast.success('Order found!');
      } else {
        setFoundOrder(null);
        toast.error('Order not found. Please check your order code or phone number.');
      }
      setIsSearching(false);
    }, 500);
  };

  const currentStageIndex = foundOrder 
    ? ORDER_STAGES.findIndex(s => s.status === foundOrder.status)
    : -1;

  const sendWhatsAppContact = () => {
    const message = encodeURIComponent('Hi, I have a question about my WashLab order.');
    window.open(`https://wa.me/233XXXXXXXXX?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">
            Enter your order code or phone number to check the status
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter order code (e.g. WL-4921) or phone number"
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Enter the order code you received when placing your order
          </p>
        </div>

        {/* Order Details */}
        {foundOrder && (
          <div className="animate-fade-in">
            {/* Status Header */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order Code</p>
                  <h2 className="text-2xl font-display font-bold">{foundOrder.code}</h2>
                </div>
                <StatusBadge status={foundOrder.status} size="lg" />
              </div>

              {/* Progress Tracker */}
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {ORDER_STAGES.slice(1, 7).map((stage, index) => (
                    <div
                      key={stage.status}
                      className={`flex flex-col items-center flex-1 ${
                        index <= currentStageIndex - 1 ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                          index <= currentStageIndex - 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-[10px] md:text-xs text-center hidden sm:block">
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-10">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.max(0, ((currentStageIndex - 1) / 5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bag Tag</span>
                    <span className="font-semibold text-primary">
                      {foundOrder.bagCardNumber ? `#${foundOrder.bagCardNumber}` : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span>{foundOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{foundOrder.hall}, {foundOrder.room}</span>
                  </div>
                  {foundOrder.totalPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">₵{foundOrder.totalPrice}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Items</h3>
                {foundOrder.items && foundOrder.items.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {foundOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-muted-foreground">{item.category}</span>
                        <span>{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Items will be listed after check-in
                  </p>
                )}
              </div>
            </div>

            {/* Actions for Ready Status */}
            {foundOrder.status === 'ready' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="font-display font-semibold text-lg mb-2">
                    🎉 Your laundry is ready!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how you'd like to receive your clothes
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-4 flex-col items-center gap-2"
                    onClick={() => toast.success('We\'ll see you at the station!')}
                  >
                    <Package className="w-6 h-6" />
                    <span>I'll Pick Up</span>
                    <span className="text-xs text-muted-foreground">Come with your bag tag</span>
                  </Button>
                  <Button
                    size="lg"
                    className="h-auto py-4 flex-col items-center gap-2"
                    onClick={() => toast.success('Delivery request submitted!')}
                  >
                    <Truck className="w-6 h-6" />
                    <span>Request Delivery</span>
                    <span className="text-xs">₵5 delivery fee</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Pending Drop-off Message */}
            {foundOrder.status === 'pending_dropoff' && (
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="font-display font-semibold text-lg mb-2">
                    📦 Awaiting Drop-off
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please bring your clothes to your nearest WashLab station and show your order code.
                  </p>
                  <p className="text-2xl font-display font-bold text-primary">{foundOrder.code}</p>
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call Us
              </Button>
              <Button variant="ghost" size="sm" onClick={sendWhatsAppContact}>
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!foundOrder && !isSearching && hasSearched && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Order Not Found</h3>
            <p className="text-muted-foreground text-sm">
              Please double-check your order code or phone number
            </p>
          </div>
        )}

        {/* Initial State - No search yet */}
        {!foundOrder && !hasSearched && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Track Your Laundry</h3>
            <p className="text-muted-foreground text-sm">
              Enter your order code above to see the status of your laundry
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackPage;

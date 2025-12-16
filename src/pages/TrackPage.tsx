import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ORDER_STAGES, OrderStatus } from '@/types';
import { Search, Phone, MessageCircle, Truck, Package } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for demo
const mockOrder = {
  code: 'WL-4921',
  customerPhone: '0551234567',
  customerName: 'Kwame Asante',
  status: 'ready' as OrderStatus,
  bagTag: '#10',
  items: [
    { category: 'Shirts', quantity: 3 },
    { category: 'Shorts', quantity: 2 },
    { category: 'Bras', quantity: 2 },
  ],
  totalPrice: 50,
  serviceType: 'wash_and_dry',
  createdAt: new Date('2025-01-15T10:30:00'),
};

const TrackPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<typeof mockOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an order code or phone number');
      return;
    }

    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      if (searchQuery.toUpperCase() === 'WL-4921' || searchQuery === '0551234567') {
        setOrder(mockOrder);
      } else {
        setOrder(null);
        toast.error('Order not found. Please check your order code or phone number.');
      }
      setIsSearching(false);
    }, 1000);
  };

  const currentStageIndex = ORDER_STAGES.findIndex(s => s.status === order?.status);

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
            Demo: Try searching for "WL-4921" or "0551234567"
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="animate-fade-in">
            {/* Status Header */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order Code</p>
                  <h2 className="text-2xl font-display font-bold">{order.code}</h2>
                </div>
                <StatusBadge status={order.status} size="lg" />
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
                    style={{ width: `${((currentStageIndex - 1) / 5) * 100}%` }}
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
                    <span className="font-semibold text-primary">{order.bagTag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="capitalize">{order.serviceType.replace('_', ' & ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">₵{order.totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Items</h3>
                <div className="space-y-2 text-sm">
                  {order.items.map((item) => (
                    <div key={item.category} className="flex justify-between">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span>{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions for Ready Status */}
            {order.status === 'ready' && (
              <div className="bg-success/10 rounded-2xl border border-success/20 p-6 animate-fade-in">
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

            {/* Contact */}
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call Us
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && !isSearching && searchQuery && (
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
      </div>
    </div>
  );
};

export default TrackPage;

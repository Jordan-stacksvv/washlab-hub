import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { StepIndicator } from '@/components/StepIndicator';
import { ServiceCard } from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ServiceType } from '@/types';
import { useOrders } from '@/context/OrderContext';
import { 
  Droplets, 
  Wind, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['Service', 'Clothes', 'Whites', 'Details', 'Summary'];

const generateOrderCode = () => {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `WL-${num}`;
};

const OrderPage = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [clothesCount, setClothesCount] = useState<number>(0);
  const [hasWhites, setHasWhites] = useState<boolean | null>(null);
  const [washSeparately, setWashSeparately] = useState(true);
  const [mixDisclaimer, setMixDisclaimer] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    phone: '',
    name: '',
    hall: '',
    room: '',
    notes: '',
  });
  const [orderCode, setOrderCode] = useState<string | null>(null);

  const pricePerLoad = 25; // GHS
  const estimatedWeight = clothesCount * 0.3; // rough estimate
  const estimatedLoads = Math.ceil(estimatedWeight / 8) || 1;
  const estimatedPrice = estimatedLoads * pricePerLoad;

  const canProceed = () => {
    switch (currentStep) {
      case 0: return serviceType !== null;
      case 1: return clothesCount > 0;
      case 2: return hasWhites !== null && (hasWhites === false || washSeparately || mixDisclaimer);
      case 3: return customerInfo.phone && customerInfo.name && customerInfo.hall && customerInfo.room;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit order to shared context
      const code = generateOrderCode();
      addOrder({
        code,
        customerPhone: customerInfo.phone,
        customerName: customerInfo.name,
        hall: customerInfo.hall,
        room: customerInfo.room,
        status: 'pending_dropoff',
        serviceType: serviceType || 'wash_and_dry',
        bagCardNumber: null,
        items: [],
        totalPrice: null,
        weight: null,
        loads: null,
        hasWhites: hasWhites || false,
        washSeparately,
        notes: customerInfo.notes,
        paymentMethod: 'pending',
        paymentStatus: 'pending',
        orderType: 'online',
      });
      setOrderCode(code);
      toast.success('Order placed successfully!');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const copyOrderCode = () => {
    if (orderCode) {
      navigator.clipboard.writeText(orderCode);
      setCopied(true);
      toast.success('Order code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (orderCode) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-2xl mx-auto px-4 pt-24 pb-12">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-success" />
            </div>
            
            <h1 className="text-3xl font-display font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-8">
              Your order has been created successfully
            </p>

            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <p className="text-sm text-muted-foreground mb-2">Your Order Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-display font-bold text-gradient">{orderCode}</span>
                <button
                  onClick={copyOrderCode}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Next Steps
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">1</span>
                  <span>Bring your clothes to your nearest WashLab station</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">2</span>
                  <span>Show your order code <strong>{orderCode}</strong> to the attendant</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">3</span>
                  <span>Your clothes will be weighed and priced</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">4</span>
                  <span>Pay and receive your bag tag</span>
                </li>
              </ol>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/track')}>
                Track Order
              </Button>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Place Your Order</h1>
          <p className="text-muted-foreground">Fill in the details below to get started</p>
        </div>

        <div className="mb-12">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 min-h-[400px]">
          {/* Step 0: Service Selection */}
          {currentStep === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-display font-semibold mb-6">Select Your Service</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <ServiceCard
                  icon={Sparkles}
                  title="Wash & Dry"
                  description="Complete service including washing, drying, and folding"
                  isSelected={serviceType === 'wash_and_dry'}
                  onClick={() => setServiceType('wash_and_dry')}
                  price="₵25/load"
                />
                <ServiceCard
                  icon={Droplets}
                  title="Wash Only"
                  description="Professional washing with premium detergents"
                  isSelected={serviceType === 'wash_only'}
                  onClick={() => setServiceType('wash_only')}
                  price="₵15/load"
                />
                <ServiceCard
                  icon={Wind}
                  title="Dry Only"
                  description="Quick and efficient drying service"
                  isSelected={serviceType === 'dry_only'}
                  onClick={() => setServiceType('dry_only')}
                  price="₵12/load"
                />
              </div>
            </div>
          )}

          {/* Step 1: Clothes Count */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-display font-semibold mb-6">How Many Clothes?</h2>
              <div className="max-w-md mx-auto">
                <Label htmlFor="clothesCount" className="text-sm text-muted-foreground">
                  Enter the approximate number of clothing items
                </Label>
                <Input
                  id="clothesCount"
                  type="number"
                  min="1"
                  value={clothesCount || ''}
                  onChange={(e) => setClothesCount(parseInt(e.target.value) || 0)}
                  className="mt-2 text-2xl font-display h-16 text-center"
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Don't worry about being exact — we'll weigh everything at check-in
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Whites Handling */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-display font-semibold mb-6">Do You Have Whites?</h2>
              <div className="max-w-md mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setHasWhites(true)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      hasWhites === true
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-4xl mb-2 block">👕</span>
                    <span className="font-medium">Yes, I have whites</span>
                  </button>
                  <button
                    onClick={() => setHasWhites(false)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      hasWhites === false
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-4xl mb-2 block">🎨</span>
                    <span className="font-medium">No whites</span>
                  </button>
                </div>

                {hasWhites && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground">
                      Would you like us to wash your whites separately?
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => { setWashSeparately(true); setMixDisclaimer(false); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          washSeparately
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-medium">Wash separately</span>
                        <span className="block text-sm text-muted-foreground">
                          Recommended to prevent color bleeding
                        </span>
                      </button>
                      <button
                        onClick={() => setWashSeparately(false)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          !washSeparately
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-medium">Mix with colors</span>
                        <span className="block text-sm text-muted-foreground">
                          Faster but may cause color transfer
                        </span>
                      </button>
                    </div>

                    {!washSeparately && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20 animate-fade-in">
                        <Checkbox
                          id="disclaimer"
                          checked={mixDisclaimer}
                          onCheckedChange={(checked) => setMixDisclaimer(checked as boolean)}
                        />
                        <Label htmlFor="disclaimer" className="text-sm cursor-pointer">
                          I understand that mixing whites with colors may cause color bleeding, 
                          and I accept responsibility for any color transfer.
                        </Label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Customer Details */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-display font-semibold mb-6">Your Details</h2>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="0XX XXX XXXX"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll use this to send you updates via WhatsApp
                  </p>
                </div>
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hall">Hall / Hostel *</Label>
                    <Input
                      id="hall"
                      value={customerInfo.hall}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, hall: e.target.value })}
                      placeholder="e.g. Akuafo Hall"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room">Room Number *</Label>
                    <Input
                      id="room"
                      value={customerInfo.room}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, room: e.target.value })}
                      placeholder="e.g. A302"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Any special instructions?"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-display font-semibold mb-6">Order Summary</h2>
              <div className="max-w-md mx-auto">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium capitalize">{serviceType?.replace('_', ' & ')}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">{clothesCount} pieces</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Est. Weight</span>
                    <span className="font-medium">~{estimatedWeight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Est. Loads</span>
                    <span className="font-medium">{estimatedLoads}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Whites</span>
                    <span className="font-medium">
                      {hasWhites ? (washSeparately ? 'Separate wash' : 'Mixed') : 'None'}
                    </span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Estimated Total</span>
                    <span className="text-2xl font-display font-bold text-gradient">
                      ₵{estimatedPrice}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Final price will be calculated after weighing at check-in
                  </p>
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium mb-2">Delivery To:</h4>
                  <p className="text-sm text-muted-foreground">
                    {customerInfo.name}<br />
                    {customerInfo.hall}, Room {customerInfo.room}<br />
                    {customerInfo.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === STEPS.length - 1 ? 'Place Order' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;

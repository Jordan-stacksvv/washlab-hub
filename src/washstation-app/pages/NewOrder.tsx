import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/context/OrderContext';
import { PRICING_CONFIG, calculateTotalPrice } from '@/config/pricing';
import washingMachine from '@/assets/laundry-hero-1.jpg';
import dryingImage from '@/assets/laundry-hero-2.jpg';
import foldingImage from '@/assets/stacked-clothes.jpg';
import { 
  Phone,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  Minus,
  Edit,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

type Step = 'phone' | 'customer-found' | 'register' | 'order';

const NewOrder = () => {
  const navigate = useNavigate();
  const { findByPhone, createCustomer } = useCustomers();
  const { addOrder } = useOrders();
  
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [step, setStep] = useState<Step>('phone');
  
  // Phone entry
  const [phone, setPhone] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<any>(null);
  
  // New customer registration
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  
  // Order details
  const [serviceType, setServiceType] = useState('wash_and_dry');
  const [weight, setWeight] = useState(5.0);
  const [itemCount, setItemCount] = useState(0);
  const [orderNotes, setOrderNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');
  
  // ORDER ID - Generated ONCE at mount, NEVER changes
  const [orderId] = useState(() => `ORD-${Math.floor(Math.random() * 9000) + 1000}`);

  const quickNotes = ['Rush Service', 'Stains', 'Delicate', 'No Softener'];

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
  }, [navigate]);

  const handlePhoneSubmit = () => {
    if (phone.length < 9) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    const customer = findByPhone(phone);
    if (customer) {
      setFoundCustomer(customer);
      setStep('customer-found');
    } else {
      setStep('register');
    }
  };

  const handleConfirmCustomer = () => {
    setStep('order');
  };

  const handleRegisterNewCustomer = () => {
    if (!newName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    
    const customer = createCustomer(phone, newName);
    setFoundCustomer(customer);
    toast.success(`Profile created for ${newName}`);
    setStep('order');
  };

  const handleProceedToPayment = () => {
    const pricing = calculateTotalPrice(serviceType, weight, false);
    
    const order = addOrder({
      code: orderId, // Use the stable orderId that was generated once
      customerPhone: phone,
      customerName: foundCustomer?.name || newName,
      hall: '',
      room: '',
      status: 'checked_in',
      bagCardNumber: `${Math.floor(Math.random() * 900) + 100}`,
      items: [{ category: serviceType, quantity: itemCount || 1 }],
      totalPrice: pricing.total,
      weight: weight,
      loads: Math.ceil(weight / 5),
      hasWhites: false,
      paymentMethod: 'pending',
      paymentStatus: 'pending',
      orderType: 'walkin',
      checkedInBy: activeStaff?.name || 'Unknown',
    });
    
    toast.success('Order created successfully');
    navigate('/washstation/payment', { state: { orderId: order.id } });
  };

  const handleSaveAsDraft = () => {
    toast.info('Order saved as draft');
    navigate('/washstation/dashboard');
  };

  const toggleNote = (note: string) => {
    if (orderNotes.includes(note)) {
      setOrderNotes(orderNotes.filter(n => n !== note));
    } else {
      setOrderNotes([...orderNotes, note]);
    }
  };

  const pricing = calculateTotalPrice(serviceType, weight, false);
  const rushFee = orderNotes.includes('Rush Service') ? 5 : 0;
  const service = PRICING_CONFIG.services.find(s => s.id === serviceType);
  const pricePerUnit = service?.price || 50;

  const services = [
    { id: 'wash_and_dry', name: 'Wash & Dry', price: '$1.50 / kg', image: washingMachine },
    { id: 'wash_only', name: 'Wash Only', price: '$1.00 / kg', image: dryingImage },
    { id: 'dry_only', name: 'Dry Only', price: '$0.80 / kg', image: foldingImage },
  ];

  // Number pad component
  const NumberPad = ({ onDigit, onClear, onBackspace }: { onDigit: (d: string) => void; onClear: () => void; onBackspace: () => void }) => (
    <div className="grid grid-cols-3 gap-3">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
        <button
          key={digit}
          onClick={() => onDigit(digit)}
          className="h-14 rounded-xl bg-muted text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors"
        >
          {digit}
        </button>
      ))}
      <button
        onClick={onClear}
        className="h-14 rounded-xl bg-destructive/10 text-xl font-semibold text-destructive hover:bg-destructive/20 transition-colors"
      >
        <X className="w-5 h-5 mx-auto" />
      </button>
      <button
        onClick={() => onDigit('0')}
        className="h-14 rounded-xl bg-muted text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors"
      >
        0
      </button>
      <button
        onClick={onBackspace}
        className="h-14 rounded-xl bg-muted text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors"
      >
        ←
      </button>
    </div>
  );

  const formatPhone = (p: string) => {
    if (p.length <= 2) return p;
    if (p.length <= 5) return `${p.slice(0, 2)} ${p.slice(2)}`;
    if (p.length <= 9) return `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5)}`;
    return `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 9)}`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar 
        activeStaff={activeStaff} 
        branchName={branchName}
      />
      
      <main className="flex-1 ml-64">
        {/* Phone Entry Step */}
        {step === 'phone' && (
          <>
            <WashStationHeader title="Start Walk-in Order" branchName={branchName} activeStaff={activeStaff} />
            <div className="p-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-8">
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <CheckCircle className="w-4 h-4" /> Phone Lookup
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">Registration</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">Order Details</span>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 gap-8">
                  {/* Left - Phone Input */}
                  <div className="bg-card border border-border rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Customer Phone</h2>
                    <p className="text-muted-foreground mb-6">Enter mobile number to find or create profile</p>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-muted rounded-xl px-4 py-4 text-lg font-semibold text-foreground">
                        +233
                      </div>
                      <div className="flex-1 relative">
                        <input
                          value={formatPhone(phone)}
                          readOnly
                          placeholder="XX XXX XXXX"
                          className="w-full h-14 text-2xl font-semibold bg-muted border-0 rounded-xl px-4 text-foreground"
                        />
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>

                    <Button
                      onClick={handlePhoneSubmit}
                      disabled={phone.length < 9}
                      className="w-full h-14 text-lg rounded-xl bg-primary text-primary-foreground font-semibold"
                    >
                      Check Number
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                  {/* Right - Number Pad */}
                  <div className="bg-card border border-border rounded-2xl p-8">
                    <NumberPad
                      onDigit={(d) => setPhone(prev => prev.length < 10 ? prev + d : prev)}
                      onClear={() => setPhone('')}
                      onBackspace={() => setPhone(prev => prev.slice(0, -1))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Customer Found Step */}
        {step === 'customer-found' && foundCustomer && (
          <>
            <WashStationHeader title="Customer Search" branchName={branchName} activeStaff={activeStaff} />
            <div className="p-6">
              <button 
                onClick={() => setStep('phone')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Phone Entry
              </button>

              <div className="max-w-lg mx-auto">
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Customer Match Found</h2>
                  <p className="text-muted-foreground mb-6">Is this the customer you are looking for?</p>

                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{foundCustomer.name}</h3>
                  <p className="text-primary flex items-center justify-center gap-1.5 mb-4">
                    <Phone className="w-4 h-4" /> {foundCustomer.phone}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">LAST VISIT</p>
                      <p className="font-semibold text-foreground">{foundCustomer.lastVisit || 'Oct 12, 2023'}</p>
                      <p className="text-xs text-muted-foreground">{foundCustomer.daysSince || '3 days ago'}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground">LIFETIME VALUE</p>
                      <p className="font-semibold text-success">${(foundCustomer.totalSpent || 450).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{foundCustomer.totalOrders || 12} Orders</p>
                    </div>
                  </div>

                  {foundCustomer.notes && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6 text-sm text-left">
                      <span className="text-primary">ℹ</span> Customer prefers <strong>{foundCustomer.notes}</strong>. Please verify upon intake.
                    </div>
                  )}

                  <Button
                    onClick={handleConfirmCustomer}
                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold mb-3"
                  >
                    <Check className="w-4 h-4 mr-2" /> Confirm & Start Order
                  </Button>
                  <Button
                    onClick={() => { setFoundCustomer(null); setStep('register'); }}
                    variant="outline"
                    className="w-full h-12 rounded-xl"
                  >
                    <User className="w-4 h-4 mr-2" /> No, Register New Customer
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Register New Customer Step */}
        {step === 'register' && (
          <>
            <WashStationHeader title="Start Walk-in Order" branchName={branchName} activeStaff={activeStaff} />
            <div className="p-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-8">
                <span className="flex items-center gap-1.5 text-success">
                  <CheckCircle className="w-4 h-4" /> Phone Lookup
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                  ✦ Registration
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">Order Details</span>
              </div>

              <div className="max-w-lg mx-auto">
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">New Customer</h2>
                  <p className="text-muted-foreground mb-6">Quick create profile for order processing.</p>

                  {/* Phone - locked */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">MOBILE NUMBER</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">(555) {formatPhone(phone)}</span>
                      <span className="ml-auto text-muted-foreground">🔒</span>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      FULL NAME <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full px-4 py-3 bg-background border-2 border-primary rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-0"
                      />
                      <Edit className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Enter the customer's first and last name.</p>
                  </div>

                  {/* Email - optional */}
                  <div className="mb-8">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      EMAIL ADDRESS <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep('phone')}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleRegisterNewCustomer}
                      disabled={!newName.trim()}
                      className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-semibold"
                    >
                      Create & Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>STATUS</span>
                  <span className="text-success font-medium">● ONLINE</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Order Details Step */}
        {step === 'order' && (
          <>
            <WashStationHeader title={`New Order #${orderId}`} branchName={branchName} activeStaff={activeStaff} />
            <div className="p-6">
              <div className="flex gap-6">
                {/* Left - Order Form */}
                <div className="flex-1 space-y-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-foreground">New Order #{orderId}</h2>
                        <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded">PENDING</span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        <User className="w-4 h-4 inline mr-1" />
                        Customer: {foundCustomer?.name || newName} (Guest) 
                        <button className="text-primary ml-2 hover:underline">Edit</button>
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Date</p>
                      <p className="font-medium text-foreground">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* 1. Select Service */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
                      Select Service
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setServiceType(service.id)}
                          className={`rounded-xl overflow-hidden border-2 transition-all ${
                            serviceType === service.id 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                            {serviceType === service.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className={`p-3 text-left ${serviceType === service.id ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                            <p className="font-semibold">{service.name}</p>
                            <p className={`text-sm ${serviceType === service.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{service.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Weight */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
                      Weight
                    </h3>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setWeight(Math.max(0.5, weight - 0.5))}
                        className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="flex-1 text-center">
                        <p className="text-5xl font-bold text-foreground">{weight.toFixed(1)}</p>
                        <p className="text-muted-foreground">KILOGRAMS</p>
                      </div>
                      <button 
                        onClick={() => setWeight(weight + 0.5)}
                        className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-4 justify-center">
                      <button onClick={() => setWeight(weight + 1)} className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80">+ 1kg</button>
                      <button onClick={() => setWeight(weight + 5)} className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80">+ 5kg</button>
                      <button onClick={() => setWeight(20)} className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80">Max</button>
                    </div>
                  </div>

                  {/* 3. Item Count (Optional) */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">3</span>
                      Item Count (Optional)
                    </h3>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setItemCount(Math.max(0, itemCount - 1))}
                        className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <p className="text-3xl font-bold text-foreground">{itemCount || '--'}</p>
                        <p className="text-sm text-muted-foreground">PIECES</p>
                      </div>
                      <button 
                        onClick={() => setItemCount(itemCount + 1)}
                        className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Use for tracking individual expensive items like comforters or jackets.
                    </p>
                  </div>

                  {/* 4. Order Notes */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">4</span>
                      Order Notes
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {quickNotes.map((note) => (
                        <button
                          key={note}
                          onClick={() => toggleNote(note)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            orderNotes.includes(note)
                              ? 'bg-foreground text-background'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {orderNotes.includes(note) && <Check className="w-4 h-4 inline mr-1" />}
                          {note}
                        </button>
                      ))}
                      <button className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80">
                        + Custom
                      </button>
                    </div>
                    <textarea
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Add any specific instructions here..."
                      className="w-full px-4 py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground resize-none h-20"
                    />
                  </div>
                </div>

                {/* Right - Order Summary */}
                <div className="w-80">
                  <div className="bg-card border border-border rounded-2xl p-6 sticky top-6">
                    <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
                    
                    <div className="space-y-3 pb-4 border-b border-border">
                      <div className="flex justify-between">
                        <span className="text-foreground">{services.find(s => s.id === serviceType)?.name}</span>
                        <span className="font-semibold text-foreground">${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground pl-2">
                        {weight.toFixed(1)} kg × ${pricePerUnit.toFixed(2)}
                      </div>
                      {orderNotes.includes('Rush Service') && (
                        <div className="flex justify-between">
                          <span className="text-foreground flex items-center gap-1">
                            Rush Fee <Clock className="w-4 h-4" />
                          </span>
                          <span className="text-foreground">${rushFee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="py-4 border-b border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">${(pricing.subtotal + rushFee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Tax (8%)</span>
                        <span className="text-foreground">${pricing.tax.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="text-3xl font-bold text-primary">${(pricing.total + rushFee).toFixed(2)}</span>
                    </div>

                    <Button
                      onClick={handleProceedToPayment}
                      className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold mb-3"
                    >
                      Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <button
                      onClick={handleSaveAsDraft}
                      className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      Save as Draft
                    </button>

                    <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
                      <p><span className="bg-muted px-2 py-0.5 rounded">Ent</span> Confirm</p>
                      <p><span className="bg-muted px-2 py-0.5 rounded">Esc</span> Cancel</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NewOrder;

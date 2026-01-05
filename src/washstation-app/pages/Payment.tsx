import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { useOrders } from '@/context/OrderContext';
import WebAuthnVerifyModal from '@/components/WebAuthnVerifyModal';
import { 
  Banknote,
  CreditCard,
  Smartphone,
  X,
  ArrowRight,
  Clock,
  Delete
} from 'lucide-react';
import { toast } from 'sonner';

type PaymentMethodType = 'cash' | 'card' | 'mobile_money';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, updateOrder } = useOrders();
  
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  // Get order from location state or find the latest pending order
  const orderId = location.state?.orderId;
  const order = orderId 
    ? orders.find(o => o.id === orderId) 
    : orders.find(o => o.paymentStatus === 'pending');

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

  const handleLogout = () => {
    sessionStorage.removeItem('washlab_active_staff');
    navigate('/washstation');
  };

  const handleDigit = (digit: string) => {
    if (amountTendered.length < 7) {
      setAmountTendered(prev => prev + digit);
    }
  };

  const handleDecimal = () => {
    if (!amountTendered.includes('.')) {
      setAmountTendered(prev => prev + '.');
    }
  };

  const handleBackspace = () => {
    setAmountTendered(prev => prev.slice(0, -1));
  };

  const handleQuickAmount = (amount: number) => {
    setAmountTendered(amount.toFixed(2));
  };

  const totalDue = order?.totalPrice || 45.00;
  const tenderedAmount = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, tenderedAmount - totalDue);

  const handleCompletePayment = () => {
    // Show verification modal for all payment methods
    setShowVerifyModal(true);
  };

  const handleVerificationSuccess = (staffId: string, staffName: string, timestamp: string) => {
    setShowVerifyModal(false);
    
    if (order) {
      // Store transaction with attendant attribution
      const transaction = {
        orderId: order.id,
        orderCode: order.code,
        amount: totalDue,
        paymentMethod: paymentMethod,
        staffId,
        staffName,
        verifiedAt: timestamp,
        customerPhone: order.customerPhone,
        customerName: order.customerName,
        createdAt: new Date().toISOString()
      };

      // Save transaction history
      const transactions = JSON.parse(localStorage.getItem('washlab_transactions') || '[]');
      transactions.push(transaction);
      localStorage.setItem('washlab_transactions', JSON.stringify(transactions));

      updateOrder(order.id, {
        paymentMethod: paymentMethod === 'mobile_money' ? 'momo' : paymentMethod === 'card' ? 'hubtel' : 'cash',
        paymentStatus: 'paid',
        paidAt: new Date(),
        paidAmount: totalDue,
        processedBy: staffName,
      });
    }

    toast.success('Payment completed successfully!');
    navigate('/washstation/order-complete', { 
      state: { 
        orderId: order?.id,
        paymentMethod,
        amountPaid: totalDue,
        changeDue: paymentMethod === 'cash' ? changeDue : 0
      } 
    });
  };

  const handleCancel = () => {
    navigate('/washstation/dashboard');
  };

  // Mock order items for display
  const orderItems = order?.items || [
    { name: 'Wash & Fold (Mixed)', quantity: 1, weight: '15lbs', price: 22.50, priceNote: '@$1.50/lb' },
    { name: 'Comforter Cleaning', quantity: 1, size: 'Queen Size', price: 18.00 },
    { name: 'Detergent Pods', quantity: 2, brand: 'Tide Original', price: 4.50 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar 
        activeStaff={activeStaff} 
        branchName={branchName}
      />
      
      <main className="flex-1 ml-64">
        <WashStationHeader 
          title="Payment"
          branchName={branchName}
          activeStaff={activeStaff}
        />
        
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left - Order Summary */}
          <div className="w-80 border-r border-border bg-card p-6 flex flex-col">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground uppercase">CURRENT ORDER</span>
                <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
                  Ready for Payment
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Order #{order?.code || '1234'}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created at {new Date(order?.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-semibold text-muted-foreground">
                  {order?.customerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AR'}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{order?.customerName || 'Alex Rivera'}</p>
                <p className="text-xs text-muted-foreground">{order?.customerPhone || '+1 (555) 012-3456'}</p>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-sm font-medium text-foreground mb-3">Items</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground mr-2">1×</span>
                      Wash & Fold (Mixed)
                    </p>
                    <p className="text-xs text-muted-foreground pl-5">15lbs @ $1.50/lb</p>
                  </div>
                  <span className="font-medium text-foreground">$22.50</span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground mr-2">1×</span>
                      Comforter Cleaning
                    </p>
                    <p className="text-xs text-muted-foreground pl-5">Queen Size</p>
                  </div>
                  <span className="font-medium text-foreground">$18.00</span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground mr-2">2×</span>
                      Detergent Pods
                    </p>
                    <p className="text-xs text-muted-foreground pl-5">Tide Original</p>
                  </div>
                  <span className="font-medium text-foreground">$4.50</span>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${totalDue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span className="text-foreground">$0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium text-foreground">Total Due</span>
                <span className="text-2xl font-bold text-primary">${totalDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right - Payment Method Selection */}
          <div className="flex-1 p-6">
            <h2 className="text-xl font-bold text-foreground mb-1">Select Payment Method</h2>
            <p className="text-muted-foreground mb-6">Choose how the customer would like to pay.</p>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  paymentMethod === 'cash' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Banknote className="w-6 h-6" />
                </div>
                <span className={`font-medium ${paymentMethod === 'cash' ? 'text-primary' : 'text-foreground'}`}>
                  Cash
                </span>
                {paymentMethod === 'cash' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  paymentMethod === 'card' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'card' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className={`font-medium ${paymentMethod === 'card' ? 'text-primary' : 'text-foreground'}`}>
                  Card
                </span>
              </button>

              <button
                onClick={() => setPaymentMethod('mobile_money')}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  paymentMethod === 'mobile_money' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'mobile_money' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className={`font-medium ${paymentMethod === 'mobile_money' ? 'text-primary' : 'text-foreground'}`}>
                  Mobile Money
                </span>
              </button>
            </div>

            {/* Cash Payment UI */}
            {paymentMethod === 'cash' && (
              <div className="grid grid-cols-2 gap-8">
                {/* Amount Display */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase">
                    Amount Tendered
                  </label>
                  <div className="text-5xl font-bold text-foreground mb-4">
                    <span className="text-muted-foreground">$</span>
                    {amountTendered || '0.00'}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Due</span>
                      <span className="font-medium text-foreground">${totalDue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-success font-medium">Change Due</span>
                      <span className="text-xl font-bold text-success">${changeDue.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleQuickAmount(totalDue)}
                      className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80"
                    >
                      Exact
                    </button>
                    <button
                      onClick={() => handleQuickAmount(50)}
                      className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80"
                    >
                      $50
                    </button>
                    <button
                      onClick={() => handleQuickAmount(60)}
                      className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80"
                    >
                      $60
                    </button>
                    <button
                      onClick={() => handleQuickAmount(100)}
                      className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80"
                    >
                      $100
                    </button>
                  </div>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                    <button
                      key={digit}
                      onClick={() => handleDigit(digit)}
                      className="h-16 rounded-xl bg-muted text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    onClick={handleDecimal}
                    className="h-16 rounded-xl bg-muted text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors"
                  >
                    .
                  </button>
                  <button
                    onClick={() => handleDigit('0')}
                    className="h-16 rounded-xl bg-muted text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors"
                  >
                    0
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="h-16 rounded-xl bg-destructive/10 text-xl font-semibold text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Card/Mobile Money - Simple confirmation */}
            {paymentMethod !== 'cash' && (
              <div className="bg-muted/30 rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  {paymentMethod === 'card' ? (
                    <CreditCard className="w-8 h-8 text-primary" />
                  ) : (
                    <Smartphone className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {paymentMethod === 'card' ? 'Card Payment' : 'Mobile Money Payment'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {paymentMethod === 'card' 
                    ? 'Insert or tap card on the terminal to process payment.'
                    : 'A payment prompt will be sent to the customer\'s mobile number.'}
                </p>
                <p className="text-2xl font-bold text-primary">${totalDue.toFixed(2)}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 h-14 rounded-xl text-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompletePayment}
                disabled={paymentMethod === 'cash' && tenderedAmount < totalDue}
                className="flex-1 h-14 bg-primary text-primary-foreground rounded-xl text-lg font-semibold"
              >
                Complete Payment <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* WebAuthn Verification Modal */}
        <WebAuthnVerifyModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={handleVerificationSuccess}
          orderId={order?.code || 'ORD-1234'}
          action={`Payment: $${totalDue.toFixed(2)}`}
        />
      </main>
    </div>
  );
};

export default Payment;

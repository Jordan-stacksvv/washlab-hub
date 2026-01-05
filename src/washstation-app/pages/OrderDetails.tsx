import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { useOrders, Order } from '@/context/OrderContext';
import WebAuthnVerifyModal from '@/components/WebAuthnVerifyModal';
import { 
  ArrowLeft,
  Phone,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Droplets,
  Wind,
  Shirt,
  Truck,
  User,
  Scale,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Washing stages in order
const WASH_STAGES = [
  { id: 'checked_in', label: 'Checked In', icon: Package },
  { id: 'sorting', label: 'Sorting', icon: Package },
  { id: 'washing', label: 'Washing', icon: Droplets },
  { id: 'drying', label: 'Drying', icon: Wind },
  { id: 'folding', label: 'Folding', icon: Shirt },
  { id: 'ready', label: 'Ready', icon: CheckCircle },
  { id: 'completed', label: 'Delivered', icon: Truck },
];

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { orders, updateOrder } = useOrders();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingStage, setPendingStage] = useState<string | null>(null);
  
  const order = orders.find(o => o.id === orderId);

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

  if (!order) {
    return (
      <div className="flex min-h-screen bg-background">
        <WashStationSidebar activeStaff={activeStaff} branchName={branchName} />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/washstation/orders')}>Back to Orders</Button>
          </div>
        </main>
      </div>
    );
  }

  const currentStageIndex = WASH_STAGES.findIndex(s => s.id === order.status);
  const nextStage = WASH_STAGES[currentStageIndex + 1];

  const handleAdvanceStage = (stageId: string) => {
    setPendingStage(stageId);
    setShowVerifyModal(true);
  };

  const handleVerifySuccess = () => {
    if (pendingStage && order) {
      updateOrder(order.id, { status: pendingStage as Order['status'] });
      toast.success(`Order advanced to ${WASH_STAGES.find(s => s.id === pendingStage)?.label}`);
      setShowVerifyModal(false);
      setPendingStage(null);
    }
  };

  const getStatusColor = (stageId: string) => {
    const stageIndex = WASH_STAGES.findIndex(s => s.id === stageId);
    if (stageIndex < currentStageIndex) return 'bg-success text-success-foreground';
    if (stageIndex === currentStageIndex) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar activeStaff={activeStaff} branchName={branchName} />
      
      <main className="flex-1 ml-64">
        <WashStationHeader 
          title="Order Details"
          branchName={branchName}
          activeStaff={activeStaff}
        />
        
        <div className="p-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/washstation/orders')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>

          <div className="grid grid-cols-3 gap-6">
            {/* Order Info Card */}
            <div className="col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{order.code}</h2>
                    <p className="text-muted-foreground">
                      {order.orderType === 'online' ? 'Online Order' : 'Walk-in'} • Created {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {WASH_STAGES.find(s => s.id === order.status)?.label || order.status}
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between">
                  {WASH_STAGES.slice(0, -1).map((stage, index) => {
                    const StageIcon = stage.icon;
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    
                    return (
                      <div key={stage.id} className="flex items-center">
                        <div className={`flex flex-col items-center ${index < WASH_STAGES.length - 2 ? 'flex-1' : ''}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-success text-success-foreground' :
                            isCurrent ? 'bg-primary text-primary-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            <StageIcon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs mt-2 ${
                            isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                        {index < WASH_STAGES.length - 2 && (
                          <div className={`h-1 w-16 mx-2 rounded ${
                            isCompleted ? 'bg-success' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items?.length > 0 ? order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{item.category}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Scale className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Wash & Fold</p>
                          <p className="text-sm text-muted-foreground">{order.weight || 5}kg</p>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">GH₵ {order.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-border mt-4 pt-4 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-xl text-primary">GH₵ {order.totalPrice?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {nextStage && order.status !== 'completed' && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                  <Button 
                    size="lg"
                    className="w-full"
                    onClick={() => handleAdvanceStage(nextStage.id)}
                  >
                    <nextStage.icon className="w-5 h-5 mr-2" />
                    Move to {nextStage.label}
                  </Button>
                </div>
              )}
            </div>

            {/* Customer Info Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Customer Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">Customer</p>
                    </div>
                  </div>
                  
                  {order.customerPhone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{order.customerPhone}</span>
                    </div>
                  )}
                  
                  {order.hall && (
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <span className="text-foreground">{order.hall} - Room {order.room}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Order Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {order.status !== 'pending_dropoff' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-success mt-2" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Processing Started</p>
                        <p className="text-xs text-muted-foreground">In progress</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WebAuthnVerifyModal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setPendingStage(null);
        }}
        onSuccess={handleVerifySuccess}
        orderId={order.code}
        action={`Move to ${pendingStage ? WASH_STAGES.find(s => s.id === pendingStage)?.label : 'next stage'}`}
      />
    </div>
  );
};

export default OrderDetails;

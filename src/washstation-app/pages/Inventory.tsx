import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { 
  RefreshCw, 
  Plus, 
  ShoppingCart, 
  AlertTriangle,
  Clock,
  Package,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  category: 'cleaning_supplies' | 'add_ons' | 'facility' | 'retail' | 'operational';
  currentStock: number;
  maxStock: number;
  unit: string;
  status: 'critical' | 'low' | 'ok' | 'ordered';
  arrivalDate?: string;
  image?: string;
}

const Inventory = () => {
  const navigate = useNavigate();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'severity'>('severity');
  const [lastChecked, setLastChecked] = useState(new Date());

  // Mock inventory data
  const [inventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Liquid Detergent', category: 'cleaning_supplies', currentStock: 1, maxStock: 20, unit: 'Units', status: 'critical' },
    { id: '2', name: 'Fabric Softener', category: 'add_ons', currentStock: 0, maxStock: 15, unit: 'Units', status: 'critical' },
    { id: '3', name: 'Paper Towels', category: 'facility', currentStock: 2, maxStock: 50, unit: 'Rolls', status: 'critical' },
    { id: '4', name: 'Dryer Sheets', category: 'retail', currentStock: 12, maxStock: 100, unit: 'Boxes', status: 'low' },
    { id: '5', name: 'Wire Hangers', category: 'operational', currentStock: 50, maxStock: 500, unit: 'Units', status: 'low' },
    { id: '6', name: 'Bleach (Gallon)', category: 'cleaning_supplies', currentStock: 0, maxStock: 10, unit: 'Units', status: 'ordered', arrivalDate: 'Tomorrow' },
  ]);

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

  const handleRefresh = () => {
    setLastChecked(new Date());
    toast.success('Inventory refreshed');
  };

  const handleMarkRefilled = (itemId: string) => {
    toast.success('Item marked as refilled');
  };

  const handleUpdateCount = (itemId: string) => {
    toast.info('Update count modal would open');
  };

  const criticalCount = inventory.filter(i => i.status === 'critical').length;
  const lowCount = inventory.filter(i => i.status === 'low').length;
  const orderedCount = inventory.filter(i => i.status === 'ordered').length;

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'critical') return item.status === 'critical';
    if (filter === 'low') return item.status === 'low';
    return true;
  });

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      cleaning_supplies: 'CLEANING SUPPLIES',
      add_ons: 'ADD-ONS',
      facility: 'FACILITY',
      retail: 'RETAIL',
      operational: 'OPERATIONAL'
    };
    return labels[cat] || cat.toUpperCase();
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar 
        activeStaff={activeStaff} 
        branchName={branchName}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64">
        <WashStationHeader 
          title="Inventory Alerts"
          branchName={branchName}
          activeStaff={activeStaff}
        />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Real-time monitoring • Last checked {lastChecked.toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRefresh} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button className="bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                New Order
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CRITICAL ITEMS</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-bold text-foreground">{criticalCount}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
                      Action Required
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">LOW STOCK</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-bold text-foreground">{lowCount}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">
                      Monitor
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-warning" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">PENDING ORDERS</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-bold text-foreground">{orderedCount}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      Arriving Soon
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All Alerts
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'critical' 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Critical Priority
              </button>
              <button
                onClick={() => setFilter('low')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'low' 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Low Stock
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'severity')}
                className="bg-muted border-0 rounded-lg px-3 py-2 text-foreground"
              >
                <option value="severity">Severity (High-Low)</option>
              </select>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-3 gap-4">
            {filteredInventory.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4">
                {/* Item Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{getCategoryLabel(item.category)}</p>
                      <p className="font-semibold text-foreground">{item.name}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.status === 'critical' 
                      ? 'bg-destructive/10 text-destructive' 
                      : item.status === 'low'
                        ? 'bg-warning/10 text-warning'
                        : item.status === 'ordered'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-success/10 text-success'
                  }`}>
                    {item.status === 'critical' ? '● CRITICAL' : 
                     item.status === 'low' ? '● LOW STOCK' :
                     item.status === 'ordered' ? '● ORDERED' : '● OK'}
                  </span>
                </div>

                {/* Stock Info */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${
                      item.status === 'critical' ? 'text-destructive' : 
                      item.status === 'low' ? 'text-warning' : 'text-foreground'
                    }`}>
                      {item.currentStock}
                    </span>
                    <span className="text-muted-foreground">/{item.maxStock}</span>
                    <span className="text-sm text-muted-foreground ml-1">{item.unit}</span>
                    <span className={`text-sm ml-auto ${
                      item.status === 'critical' ? 'text-destructive' : 'text-warning'
                    }`}>
                      {getStockPercentage(item.currentStock, item.maxStock)}%
                      <span className="text-muted-foreground ml-1">Left</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {item.status === 'ordered' ? (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-muted-foreground"
                    disabled
                  >
                    <Clock className="w-4 h-4" />
                    Awaiting Delivery
                  </Button>
                ) : item.status === 'critical' || item.status === 'low' ? (
                  <div className="flex gap-2">
                    {item.status === 'critical' ? (
                      <Button 
                        onClick={() => handleMarkRefilled(item.id)}
                        className="flex-1 bg-primary text-primary-foreground gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Refilled
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => handleUpdateCount(item.id)}
                        className="flex-1 gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Update Count
                      </Button>
                    )}
                    <Button 
                      size="icon"
                      className="bg-primary text-primary-foreground"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                ) : null}

                {/* Arrival Info */}
                {item.arrivalDate && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Arrives {item.arrivalDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { 
  RefreshCw, 
  Plus, 
  ShoppingCart, 
  AlertTriangle,
  Clock,
  Package,
  CheckCircle,
  Edit,
  Trash2
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
}

// Storage key for inventory
const INVENTORY_KEY = 'washlab_inventory';

const getStoredInventory = (): InventoryItem[] => {
  const stored = localStorage.getItem(INVENTORY_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default inventory
  return [
    { id: '1', name: 'Liquid Detergent', category: 'cleaning_supplies', currentStock: 1, maxStock: 20, unit: 'Units', status: 'critical' },
    { id: '2', name: 'Fabric Softener', category: 'add_ons', currentStock: 0, maxStock: 15, unit: 'Units', status: 'critical' },
    { id: '3', name: 'Paper Towels', category: 'facility', currentStock: 2, maxStock: 50, unit: 'Rolls', status: 'critical' },
    { id: '4', name: 'Dryer Sheets', category: 'retail', currentStock: 12, maxStock: 100, unit: 'Boxes', status: 'low' },
    { id: '5', name: 'Wire Hangers', category: 'operational', currentStock: 50, maxStock: 500, unit: 'Units', status: 'low' },
    { id: '6', name: 'Bleach (Gallon)', category: 'cleaning_supplies', currentStock: 0, maxStock: 10, unit: 'Units', status: 'ordered', arrivalDate: 'Tomorrow' },
    { id: '7', name: 'Detergent Box (5kg)', category: 'cleaning_supplies', currentStock: 3, maxStock: 10, unit: 'Boxes', status: 'low' },
  ];
};

const saveInventory = (items: InventoryItem[]) => {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
};

const Inventory = () => {
  const navigate = useNavigate();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');
  const [lastChecked, setLastChecked] = useState(new Date());
  const [inventory, setInventory] = useState<InventoryItem[]>(getStoredInventory);
  
  // Add new item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('cleaning_supplies');
  const [newItemMaxStock, setNewItemMaxStock] = useState(10);
  const [newItemUnit, setNewItemUnit] = useState('Units');

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

  const handleRefresh = () => {
    setLastChecked(new Date());
    toast.success('Inventory refreshed');
  };

  const handleMarkRefilled = (itemId: string) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, currentStock: item.maxStock, status: 'ok' as const };
      }
      return item;
    });
    setInventory(updated);
    saveInventory(updated);
    toast.success('Item marked as refilled');
    
    // Notify admin (in a real app, this would send to backend)
    const item = inventory.find(i => i.id === itemId);
    console.log(`[ADMIN NOTIFICATION] ${item?.name} has been refilled by ${activeStaff?.name}`);
  };

  const handleMarkOutOfStock = (itemId: string) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, currentStock: 0, status: 'critical' as const };
      }
      return item;
    });
    setInventory(updated);
    saveInventory(updated);
    toast.warning('Item marked as out of stock - Admin notified');
    
    // Notify admin
    const item = inventory.find(i => i.id === itemId);
    console.log(`[ADMIN NOTIFICATION] ${item?.name} is OUT OF STOCK - Reported by ${activeStaff?.name}`);
  };

  const handleUpdateCount = (itemId: string, newCount: number) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        const percentage = (newCount / item.maxStock) * 100;
        let status: InventoryItem['status'] = 'ok';
        if (percentage === 0) status = 'critical';
        else if (percentage <= 20) status = 'critical';
        else if (percentage <= 50) status = 'low';
        
        return { ...item, currentStock: newCount, status };
      }
      return item;
    });
    setInventory(updated);
    saveInventory(updated);
    toast.success('Stock count updated');
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter item name');
      return;
    }
    
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      currentStock: 0,
      maxStock: newItemMaxStock,
      unit: newItemUnit,
      status: 'critical'
    };
    
    const updated = [...inventory, newItem];
    setInventory(updated);
    saveInventory(updated);
    
    setShowAddModal(false);
    setNewItemName('');
    setNewItemMaxStock(10);
    toast.success('New item added to inventory');
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
              <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Add Item
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
              {[
                { id: 'all', label: 'All Items' },
                { id: 'critical', label: 'Critical' },
                { id: 'low', label: 'Low Stock' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.id 
                      ? 'bg-foreground text-background' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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
                ) : item.status === 'critical' ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleMarkRefilled(item.id)}
                      className="flex-1 bg-primary text-primary-foreground gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Refilled
                    </Button>
                  </div>
                ) : item.status === 'ok' ? (
                  <Button 
                    variant="outline"
                    onClick={() => handleMarkOutOfStock(item.id)}
                    className="w-full gap-2 text-warning"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Mark Out of Stock
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleMarkRefilled(item.id)}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Refill
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleMarkOutOfStock(item.id)}
                      className="gap-2 text-destructive"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
                  </div>
                )}

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

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-foreground mb-4">Add New Inventory Item</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Item Name</label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Detergent Box"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full h-10 px-3 bg-muted border-0 rounded-md text-foreground"
                  >
                    <option value="cleaning_supplies">Cleaning Supplies</option>
                    <option value="add_ons">Add-ons</option>
                    <option value="facility">Facility</option>
                    <option value="retail">Retail</option>
                    <option value="operational">Operational</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Max Stock</label>
                    <Input
                      type="number"
                      value={newItemMaxStock}
                      onChange={(e) => setNewItemMaxStock(parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Unit</label>
                    <Input
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      placeholder="e.g. Units, Boxes"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddItem} className="flex-1">
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
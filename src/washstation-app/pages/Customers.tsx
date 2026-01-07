import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/context/OrderContext';
import { 
  Search,
  Plus,
  Phone,
  Mail,
  Edit,
  Eye,
  ArrowRight,
  User,
  Award,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';

const Customers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customers, findByPhone } = useCustomers();
  const { orders } = useOrders();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [foundByCard, setFoundByCard] = useState(false);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFoundByCard(false);
    
    // Only show results when there's actual input
    if (query.length >= 1) {
      // First try to find by bag card number (for retrieval)
      const orderByCard = orders.find(o => 
        o.bagCardNumber === query || 
        o.bagCardNumber === query.replace('#', '')
      );
      
      if (orderByCard) {
        // Found by card - find customer from order
        const customer = findByPhone(orderByCard.customerPhone);
        setSelectedCustomer({
          ...customer,
          linkedOrder: orderByCard,
          name: customer?.name || orderByCard.customerName,
          phone: customer?.phone || orderByCard.customerPhone
        });
        setFoundByCard(true);
        return;
      }
      
      // Otherwise search by phone
      if (query.length >= 3) {
        const found = findByPhone(query);
        setSelectedCustomer(found || null);
      } else {
        setSelectedCustomer(null);
      }
    } else {
      // Clear results when input is empty
      setSelectedCustomer(null);
    }
  };

  // Start new order with selected customer - pass customer data properly
  const handleNewOrder = () => {
    if (selectedCustomer) {
      // Store selected customer in session for NewOrder page
      sessionStorage.setItem('washlab_selected_customer', JSON.stringify({
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        email: selectedCustomer.email
      }));
      navigate('/washstation/new-order');
    }
  };

  // Get customer's real orders from context
  const customerOrders = selectedCustomer 
    ? orders.filter(o => o.customerPhone === selectedCustomer.phone)
    : [];

  // View order details
  const handleViewOrder = (orderId: string) => {
    navigate(`/washstation/orders/${orderId}`);
  };

  // View all orders for customer
  const handleViewAllOrders = () => {
    if (selectedCustomer) {
      navigate('/washstation/orders', { state: { customerPhone: selectedCustomer.phone } });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar 
        activeStaff={activeStaff} 
        branchName={branchName}
      />
      
      <main className="flex-1 ml-64">
        <WashStationHeader 
          title="Find Customer"
          branchName={branchName}
          activeStaff={activeStaff}
        />
        
        <div className="p-6">
          {/* Search Header */}
          <div className="mb-6">
            <p className="text-muted-foreground mb-4">
              Search by phone, name, or <span className="text-primary font-medium">bag card number</span> to find a customer.
            </p>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customer or enter card number (e.g. #001)..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-card border border-border rounded-xl text-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCustomer(null); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Found by Card Banner */}
          {foundByCard && selectedCustomer?.linkedOrder && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-success" />
                <div>
                  <p className="font-semibold text-foreground">
                    Card #{selectedCustomer.linkedOrder.bagCardNumber} Found!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Order {selectedCustomer.linkedOrder.code} • Status: {selectedCustomer.linkedOrder.status}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate(`/washstation/orders/${selectedCustomer.linkedOrder.id}`)}
                className="gap-2"
              >
                View Order
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Customer Profile Card - Only show when there's a result */}
          {selectedCustomer ? (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Customer Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-foreground">{selectedCustomer.name}</h2>
                        {customerOrders.length > 10 && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            GOLD
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedCustomer.phone}
                        </span>
                        {selectedCustomer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {selectedCustomer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                    <Button 
                      onClick={handleNewOrder}
                      className="bg-primary text-primary-foreground gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Order
                    </Button>
                  </div>
                </div>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-4 border-b border-border">
                <div className="p-5 border-r border-border">
                  <p className="text-sm text-muted-foreground">Store Credit</p>
                  <p className="text-2xl font-bold text-success mt-1">
                    GH₵ {(selectedCustomer.storeCredit || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-5 border-r border-border">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {customerOrders.length}
                  </p>
                </div>
                <div className="p-5 border-r border-border">
                  <p className="text-sm text-muted-foreground">Last Visit</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {customerOrders.length > 0 
                      ? new Date(customerOrders[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground mt-1 italic text-warning">
                    {selectedCustomer.notes || 'No notes'}
                  </p>
                </div>
              </div>

              {/* Recent Orders - From real order data */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Recent Orders</h3>
                  {customerOrders.length > 0 && (
                    <button 
                      onClick={handleViewAllOrders}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {customerOrders.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                        <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                        <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase">Items</th>
                        <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase">Total</th>
                        <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {customerOrders.slice(0, 5).map(order => (
                        <tr key={order.id}>
                          <td className="py-3 font-medium text-foreground">{order.code}</td>
                          <td className="py-3 text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {order.items?.[0]?.category?.replace('_', ' & ') || 'Wash & Fold'} ({order.weight || 5}kg)
                          </td>
                          <td className="py-3 font-medium text-foreground">GH₵ {(order.totalPrice || 0).toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'completed' ? 'bg-success/10 text-success' :
                              order.status === 'ready' ? 'bg-primary/10 text-primary' :
                              'bg-warning/10 text-warning'
                            }`}>
                              ● {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => handleViewOrder(order.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found for this customer
                  </div>
                )}
              </div>
            </div>
          ) : searchQuery.length >= 3 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Customer Found</h3>
              <p className="text-muted-foreground mb-6">Would you like to create a new customer profile?</p>
              <Button 
                onClick={() => navigate('/washstation/new-order')}
                className="bg-primary text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Customer
              </Button>
            </div>
          ) : searchQuery.length > 0 ? (
            // Show "keep typing" message when partially typing
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Keep Typing...</h3>
              <p className="text-muted-foreground">Enter at least 3 characters to search</p>
            </div>
          ) : (
            // Empty state - no input yet
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Search for a Customer</h3>
              <p className="text-muted-foreground">Enter a phone number, name, or card number to find a customer profile</p>
              <p className="text-sm text-muted-foreground mt-4">
                <FileText className="w-4 h-4 inline mr-1" />
                Can't find them? Create a new customer profile
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Customers;

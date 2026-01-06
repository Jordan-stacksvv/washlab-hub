import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WashStationSidebar from '../components/WashStationSidebar';
import WashStationHeader from '../components/WashStationHeader';
import { 
  Search,
  Filter,
  Banknote,
  CreditCard,
  Smartphone,
  Calendar,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  orderId: string;
  orderCode: string;
  amount: number;
  paymentMethod: string;
  staffId: string;
  staffName: string;
  verifiedAt: string;
  customerPhone: string;
  customerName: string;
  createdAt: string;
}

const Transactions = () => {
  const navigate = useNavigate();
  const [activeStaff, setActiveStaff] = useState<{ name: string; role: string } | null>(null);
  const [branchName, setBranchName] = useState('Central Branch');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'cash' | 'card' | 'mobile_money'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

    // Load transactions from localStorage
    const storedTxns = localStorage.getItem('washlab_transactions');
    if (storedTxns) {
      setTransactions(JSON.parse(storedTxns));
    }
  }, [navigate]);

  const getPaymentIcon = (method: string) => {
    switch(method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'mobile_money': return <Smartphone className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch(method) {
      case 'cash': return 'Cash';
      case 'card': return 'Card';
      case 'mobile_money': return 'Mobile Money';
      case 'momo': return 'Mobile Money';
      case 'hubtel': return 'Card';
      default: return method;
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter !== 'all' && txn.paymentMethod !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        txn.orderCode?.toLowerCase().includes(query) ||
        txn.customerName?.toLowerCase().includes(query) ||
        txn.staffName?.toLowerCase().includes(query)
      );
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const todayTotal = transactions
    .filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <WashStationSidebar activeStaff={activeStaff} branchName={branchName} />
      
      <main className="flex-1 ml-64">
        <WashStationHeader title="Transactions" branchName={branchName} activeStaff={activeStaff} />
        
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">TODAY'S TOTAL</p>
              <p className="text-2xl font-bold text-success">GH₵ {todayTotal.toFixed(2)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">TRANSACTIONS</p>
              <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">CASH</p>
              <p className="text-2xl font-bold text-foreground">
                {transactions.filter(t => t.paymentMethod === 'cash').length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">DIGITAL</p>
              <p className="text-2xl font-bold text-foreground">
                {transactions.filter(t => t.paymentMethod !== 'cash').length}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-muted rounded-xl p-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'cash', label: 'Cash' },
                  { id: 'card', label: 'Card' },
                  { id: 'mobile_money', label: 'Mobile' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === tab.id 
                        ? 'bg-card text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button className="p-2 bg-muted rounded-lg hover:bg-muted/80">
                <Download className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Method</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Processed By</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{txn.orderCode}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{txn.customerName}</p>
                        <p className="text-xs text-muted-foreground">{txn.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-success">GH₵ {txn.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs font-medium">
                          {getPaymentIcon(txn.paymentMethod)}
                          {getPaymentLabel(txn.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">{txn.staffName}</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {format(new Date(txn.createdAt), 'MMM dd, hh:mm a')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transactions;

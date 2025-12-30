import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  UserPlus,
  Link,
  Copy,
  AlertTriangle
} from 'lucide-react';

// Preview mode indicator
const PREVIEW_MODE = true;

// Generate enrollment link
const generateEnrollmentLink = (staffName: string): string => {
  const sanitizedName = staffName.toLowerCase().replace(/\s+/g, '_');
  const timestamp = Date.now();
  const token = `${sanitizedName}-${timestamp}`;
  return `${window.location.origin}/admin/enroll/${token}`;
};

const AdminOverview = () => {
  const { orders } = useOrders();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // Calculate stats
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === new Date().toDateString();
  });
  
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status !== 'completed').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  const stats = [
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Revenue', value: `₵${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
    { label: "Today's Orders", value: todayOrders.length.toString(), icon: TrendingUp, color: 'bg-purple-500' },
    { label: "Today's Revenue", value: `₵${todayRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-orange-500' },
    { label: 'Pending Orders', value: pendingOrders.toString(), icon: Clock, color: 'bg-yellow-500' },
    { label: 'Completed Orders', value: completedOrders.toString(), icon: CheckCircle, color: 'bg-emerald-500' },
  ];

  const handleGenerateLink = () => {
    if (!newStaffName.trim()) {
      toast.error('Please enter staff name');
      return;
    }
    const link = generateEnrollmentLink(newStaffName);
    setGeneratedLink(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCloseDialog = () => {
    setEnrollDialogOpen(false);
    setNewStaffName('');
    setGeneratedLink('');
  };

  return (
    <div>
      {/* Preview Mode Banner */}
      {PREVIEW_MODE && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            <strong>Preview Mode</strong> – Backend Pending. Data stored locally only.
          </span>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome to WashLab Admin</p>
        </div>

        {/* Enroll Staff Button */}
        <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Enroll New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Enrollment Link</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {PREVIEW_MODE && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                  ⚠️ Preview Mode – Links work but data stored locally only
                </div>
              )}

              <div>
                <Label htmlFor="staffName">Staff Name</Label>
                <Input
                  id="staffName"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Enter staff name"
                  className="mt-1"
                />
              </div>

              {!generatedLink ? (
                <Button onClick={handleGenerateLink} className="w-full gap-2">
                  <Link className="w-4 h-4" />
                  Generate Enrollment Link
                </Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label>Enrollment Link</Label>
                    <div className="flex mt-1">
                      <Input
                        value={generatedLink}
                        readOnly
                        className="rounded-r-none text-sm"
                      />
                      <Button
                        onClick={handleCopyLink}
                        variant="secondary"
                        className="rounded-l-none"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Copy the link above</li>
                      <li>Send to staff via WhatsApp or SMS</li>
                      <li>Staff opens link on their phone</li>
                      <li>They complete biometric enrollment</li>
                    </ol>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewStaffName('');
                        setGeneratedLink('');
                      }}
                      className="flex-1"
                    >
                      Generate Another
                    </Button>
                    <Button onClick={handleCloseDialog} className="flex-1">
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold text-foreground">{order.code}</p>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">₵{(order.totalPrice || 0).toFixed(2)}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

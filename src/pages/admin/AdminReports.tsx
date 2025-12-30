import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrders } from '@/context/OrderContext';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Calendar,
  Building2,
  DollarSign,
  Package,
  TrendingUp
} from 'lucide-react';

const AdminReports = () => {
  const { orders } = useOrders();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Filter orders by date and branch
  const filteredOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
    const dateMatch = orderDate === selectedDate;
    const branchMatch = selectedBranch === 'all' || (o as any).branchId === selectedBranch;
    return dateMatch && branchMatch;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalOrders = filteredOrders.length;
  const walkinOrders = filteredOrders.filter(o => o.orderType === 'walkin').length;
  const onlineOrders = filteredOrders.filter(o => o.orderType === 'online').length;
  const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;

  const generatePDFReport = () => {
    // Create printable report
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>WashLab Daily Report - ${selectedDate}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #333; }
              .stat { margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background: #f0f0f0; }
            </style>
          </head>
          <body>
            <h1>WashLab Daily Report</h1>
            <p><strong>Date:</strong> ${selectedDate}</p>
            <p><strong>Branch:</strong> ${selectedBranch === 'all' ? 'All Branches' : selectedBranch}</p>
            
            <div class="stat"><strong>Total Revenue:</strong> ₵${totalRevenue.toFixed(2)}</div>
            <div class="stat"><strong>Total Orders:</strong> ${totalOrders}</div>
            <div class="stat"><strong>Walk-in Orders:</strong> ${walkinOrders}</div>
            <div class="stat"><strong>Online Orders:</strong> ${onlineOrders}</div>
            <div class="stat"><strong>Completed:</strong> ${completedOrders}</div>
            
            <h2>Order Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${filteredOrders.map(o => `
                  <tr>
                    <td>${o.code}</td>
                    <td>${o.customerName}</td>
                    <td>${o.orderType}</td>
                    <td>${o.status}</td>
                    <td>₵${(o.totalPrice || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <p style="margin-top: 40px; color: #888;">Generated on ${new Date().toLocaleString()}</p>
          </body>
        </html>
      `);
      reportWindow.document.close();
      reportWindow.print();
    }
    toast.success('Report generated!');
  };

  const generateCSVReport = () => {
    const headers = ['Code', 'Customer', 'Phone', 'Type', 'Service', 'Status', 'Amount'];
    const rows = filteredOrders.map(o => [
      o.code,
      o.customerName,
      o.customerPhone,
      o.orderType,
      o.serviceType,
      o.status,
      (o.totalPrice || 0).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `washlab-report-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate daily reports and analytics</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Select Date
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4" />
              Branch
            </Label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Branches</option>
              <option value="pentagon">Pentagon Hall</option>
              <option value="brunei">Brunei Hostel</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={generatePDFReport} className="gap-2">
              <FileText className="w-4 h-4" />
              Print Report
            </Button>
            <Button onClick={generateCSVReport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold text-foreground">₵{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold text-foreground">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Walk-in</p>
              <p className="text-xl font-bold text-foreground">{walkinOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Online</p>
              <p className="text-xl font-bold text-foreground">{onlineOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-foreground">{completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Orders for {selectedDate}</h3>
        </div>
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">Code</th>
              <th className="text-left p-4 font-semibold text-foreground">Customer</th>
              <th className="text-left p-4 font-semibold text-foreground">Type</th>
              <th className="text-left p-4 font-semibold text-foreground">Service</th>
              <th className="text-left p-4 font-semibold text-foreground">Status</th>
              <th className="text-left p-4 font-semibold text-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="p-4 font-mono text-foreground">{order.code}</td>
                <td className="p-4 text-foreground">{order.customerName}</td>
                <td className="p-4 text-foreground capitalize">{order.orderType}</td>
                <td className="p-4 text-foreground capitalize">{order.serviceType.replace('_', ' ')}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 font-semibold text-foreground">₵{(order.totalPrice || 0).toFixed(2)}</td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No orders found for this date
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;

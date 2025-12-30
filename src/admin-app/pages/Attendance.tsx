import { useOrders } from '@/context/OrderContext';
import { Clock, User, Building2 } from 'lucide-react';

/**
 * Attendance Page
 * Shows staff attendance logs
 */
const Attendance = () => {
  // Mock attendance data - in production this comes from backend
  const mockLogs = [
    { id: '1', staffName: 'Alex Mensah', branchId: 'pentagon', action: 'sign_in', timestamp: new Date() },
    { id: '2', staffName: 'Grace Osei', branchId: 'brunei', action: 'sign_in', timestamp: new Date(Date.now() - 3600000) },
    { id: '3', staffName: 'Kofi Asante', branchId: 'pentagon', action: 'sign_out', timestamp: new Date(Date.now() - 7200000) },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Attendance Logs</h1>
        <p className="text-muted-foreground mt-1">Staff sign-in and sign-out records</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground">Staff</th>
              <th className="text-left p-4 font-semibold text-foreground">Branch</th>
              <th className="text-left p-4 font-semibold text-foreground">Action</th>
              <th className="text-left p-4 font-semibold text-foreground">Time</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log) => (
              <tr key={log.id} className="border-t border-border">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-foreground">{log.staffName}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{log.branchId}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    log.action === 'sign_in' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {log.action === 'sign_in' ? 'Signed In' : 'Signed Out'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{log.timestamp.toLocaleString()}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;

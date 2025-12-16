import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  UserCheck, 
  UserMinus, 
  Users,
  AlertCircle,
  Fingerprint,
  Clock,
  ArrowRight,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface ActiveStaff {
  id: string;
  name: string;
  signedInAt: Date;
}

const StaffLogin = () => {
  const [branchPin, setBranchPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeStaff, setActiveStaff] = useState<ActiveStaff[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'signin' | 'add' | 'signout' | null>(null);

  const handleBranchLogin = () => {
    if (branchPin === '1234') {
      setIsAuthenticated(true);
      toast.success('Branch authenticated successfully');
    } else {
      toast.error('Invalid PIN');
    }
  };

  const startFaceScan = (mode: 'signin' | 'add' | 'signout') => {
    setScanMode(mode);
    setIsScanning(true);
    
    // Simulate face scan - in production, this would use FaceIO
    setTimeout(() => {
      const mockStaff = {
        id: `staff-${Date.now()}`,
        name: mode === 'add' ? 'J.J Nortey' : 'Portia',
        signedInAt: new Date(),
      };

      if (mode === 'signin' || mode === 'add') {
        setActiveStaff(prev => [...prev, mockStaff]);
        toast.success(`${mockStaff.name} signed in successfully`);
      } else if (mode === 'signout') {
        const staffToRemove = activeStaff[activeStaff.length - 1];
        if (staffToRemove) {
          setActiveStaff(prev => prev.slice(0, -1));
          toast.success(`${staffToRemove.name} signed out`);
          if (activeStaff.length === 1) {
            setIsAuthenticated(false);
            setBranchPin('');
          }
        }
      }

      setIsScanning(false);
      setScanMode(null);
    }, 2000);
  };

  // Branch PIN Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-wash-orange/10 rounded-full blur-3xl" />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-wash-orange mb-6 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Staff Portal</h1>
            <p className="text-slate-400">Enter your branch PIN to access the dashboard</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="space-y-6">
              <div>
                <Label htmlFor="pin" className="text-slate-300 text-sm font-medium">Branch PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={branchPin}
                  onChange={(e) => setBranchPin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBranchLogin()}
                  placeholder="• • • •"
                  className="mt-2 h-14 text-center text-2xl tracking-[0.5em] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-600 rounded-xl"
                  maxLength={4}
                />
              </div>
              <Button 
                onClick={handleBranchLogin} 
                className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-wash-orange hover:opacity-90 transition-opacity"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-6 text-center">
              Demo PIN: <span className="text-slate-400 font-mono">1234</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Face ID Sign In Screen (No active staff)
  if (activeStaff.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-wash-orange/10 rounded-full blur-3xl" />
        </div>
        
        <div className="w-full max-w-md text-center relative z-10">
          <Logo size="lg" className="justify-center mb-8 text-white" />
          
          {isScanning ? (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-10 shadow-2xl">
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-wash-orange/30 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-slate-900/80 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping" style={{ animationDuration: '2s' }} />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Scanning Face...</h2>
              <p className="text-slate-400">Please look directly at the camera</p>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-10 shadow-2xl">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">No Active Staff</h2>
              <p className="text-slate-400 mb-8">
                Sign in with Face ID to start your shift
              </p>
              <Button 
                onClick={() => startFaceScan('signin')} 
                size="lg" 
                className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-wash-orange hover:opacity-90 transition-opacity"
              >
                <Fingerprint className="w-6 h-6 mr-3" />
                Sign In with Face ID
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Staff Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo size="sm" className="text-white" />
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl"
            onClick={() => window.location.href = '/washstation'}
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {isScanning ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-10 text-center shadow-2xl">
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-wash-orange/30 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-slate-900/80 flex items-center justify-center">
                <Camera className="w-16 h-16 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Scanning Face...</h2>
            <p className="text-slate-400">
              {scanMode === 'add' ? 'Adding new attendant' : 
               scanMode === 'signout' ? 'Confirming sign out' : 'Please look at the camera'}
            </p>
          </div>
        ) : (
          <>
            {/* Active Staff List */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 mb-6 shadow-2xl">
              <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                Active Attendants ({activeStaff.length})
              </h2>
              <div className="space-y-3">
                {activeStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{staff.name}</p>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Signed in at {staff.signedInAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => startFaceScan('add')} 
                variant="outline" 
                className="h-16 rounded-2xl border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white flex-col gap-1"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Add Attendant</span>
              </Button>
              <Button 
                onClick={() => startFaceScan('signout')} 
                className="h-16 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex-col gap-1"
              >
                <UserMinus className="w-5 h-5" />
                <span className="text-xs">Sign Out</span>
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-8">
              Face ID is required for attendance tracking and payment authorization
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffLogin;

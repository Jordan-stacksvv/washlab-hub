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
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex flex-col p-4">
        {/* Header with Logo */}
        <div className="w-full max-w-md mx-auto pt-6">
          <a href="/" className="inline-block">
            <Logo size="md" className="text-white" />
          </a>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Staff Portal</h1>
              <p className="text-white/70">Enter your branch PIN to access the dashboard</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="pin" className="text-white/80 text-sm font-medium">Branch PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={branchPin}
                    onChange={(e) => setBranchPin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBranchLogin()}
                    placeholder="• • • •"
                    className="mt-2 h-14 text-center text-2xl tracking-[0.5em] bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                    maxLength={4}
                  />
                </div>
                <Button 
                  onClick={handleBranchLogin} 
                  className="w-full h-14 text-lg rounded-xl bg-white text-primary hover:bg-white/90 transition-all font-semibold"
                >
                  Access Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <p className="text-xs text-white/50 mt-6 text-center">
                Demo PIN: <span className="text-white/70 font-mono">1234</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Face ID Sign In Screen (No active staff)
  if (activeStaff.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex flex-col p-4">
        {/* Header with Logo */}
        <div className="w-full max-w-md mx-auto pt-6">
          <a href="/" className="inline-block">
            <Logo size="md" className="text-white" />
          </a>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            {isScanning ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10">
                <div className="relative w-40 h-40 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full bg-primary/50 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Scanning Face...</h2>
                <p className="text-white/70">Please look directly at the camera</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-amber-500/30 flex items-center justify-center mb-6">
                  <AlertCircle className="w-12 h-12 text-amber-300" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">No Active Staff</h2>
                <p className="text-white/70 mb-8">
                  Sign in with Face ID to start your shift
                </p>
                <Button 
                  onClick={() => startFaceScan('signin')} 
                  size="lg" 
                  className="w-full h-14 text-lg rounded-xl bg-white text-primary hover:bg-white/90 transition-all font-semibold"
                >
                  <Fingerprint className="w-6 h-6 mr-3" />
                  Sign In with Face ID
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Staff Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/">
            <Logo size="sm" className="text-white" />
          </a>
          <Button
            className="bg-white text-primary hover:bg-white/90 rounded-xl font-semibold"
            onClick={() => window.location.href = '/washstation'}
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {isScanning ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10 text-center">
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-primary/50 flex items-center justify-center">
                <Camera className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Scanning Face...</h2>
            <p className="text-white/70">
              {scanMode === 'add' ? 'Adding new attendant' : 
               scanMode === 'signout' ? 'Confirming sign out' : 'Please look at the camera'}
            </p>
          </div>
        ) : (
          <>
            {/* Active Staff List */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 mb-6">
              <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Active Attendants ({activeStaff.length})
              </h2>
              <div className="space-y-3">
                {activeStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-emerald-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{staff.name}</p>
                        <p className="text-sm text-white/60 flex items-center gap-1">
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
                className="h-16 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 flex-col gap-1"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Add Attendant</span>
              </Button>
              <Button 
                onClick={() => startFaceScan('signout')} 
                className="h-16 rounded-2xl bg-red-500/30 hover:bg-red-500/40 text-white flex-col gap-1"
              >
                <UserMinus className="w-5 h-5" />
                <span className="text-xs">Sign Out</span>
              </Button>
            </div>

            <p className="text-xs text-white/50 text-center mt-8">
              Face ID is required for attendance tracking and payment authorization
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffLogin;

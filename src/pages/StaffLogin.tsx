import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowLeft,
  Droplets,
  ChevronRight
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
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
        {/* Header with Logo */}
        <header className="p-4 md:p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-6">
                <Droplets className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Staff Portal</h1>
              <p className="text-white/60 text-lg">Enter your branch PIN to access the dashboard</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-primary/30">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="pin" className="text-foreground text-sm font-medium mb-2 block">Branch PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={branchPin}
                    onChange={(e) => setBranchPin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBranchLogin()}
                    placeholder="• • • •"
                    className="h-14 text-center text-2xl tracking-[0.5em] rounded-xl border-2 border-border focus:border-primary"
                    maxLength={4}
                  />
                </div>
                <Button 
                  onClick={handleBranchLogin} 
                  className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 font-semibold"
                >
                  Access Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-6 text-center">
                Demo PIN: <span className="font-mono font-semibold text-primary">1234</span>
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
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
        <header className="p-4 md:p-6 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {isScanning ? (
              <div className="bg-white rounded-3xl p-10 text-center shadow-2xl shadow-primary/30">
                <div className="relative w-40 h-40 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-primary animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Scanning Face...</h2>
                <p className="text-muted-foreground">Please look directly at the camera</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center shadow-2xl shadow-primary/30">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">No Active Staff</h2>
                <p className="text-muted-foreground mb-8">
                  Sign in with Face ID to start your shift
                </p>
                <Button 
                  onClick={() => startFaceScan('signin')} 
                  size="lg" 
                  className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 font-semibold"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary/5">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/">
              <Logo size="sm" />
            </Link>
            <Button
              className="bg-primary hover:bg-primary/90 rounded-xl font-semibold"
              onClick={() => window.location.href = '/washstation'}
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isScanning ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-border">
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-16 h-16 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Scanning Face...</h2>
            <p className="text-muted-foreground">
              {scanMode === 'add' ? 'Adding new attendant' : 
               scanMode === 'signout' ? 'Confirming sign out' : 'Please look at the camera'}
            </p>
          </div>
        ) : (
          <>
            {/* Branch Info Banner */}
            <div className="bg-primary rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Currently at</p>
                  <h2 className="text-2xl font-display font-bold">Main Campus Branch</h2>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm mb-1">{new Date().toLocaleDateString()}</p>
                  <p className="text-xl font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>

            {/* Active Staff List */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-border">
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                Active Attendants ({activeStaff.length})
              </h2>
              <div className="space-y-3">
                {activeStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{staff.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Signed in at {staff.signedInAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => startFaceScan('add')} 
                variant="outline"
                className="h-20 rounded-2xl flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5"
              >
                <Users className="w-6 h-6 text-primary" />
                <span className="font-medium">Add Attendant</span>
              </Button>
              <Button 
                onClick={() => startFaceScan('signout')} 
                variant="outline"
                className="h-20 rounded-2xl flex-col gap-2 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700"
              >
                <UserMinus className="w-6 h-6" />
                <span className="font-medium">Sign Out</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-8">
              Face ID is required for attendance tracking and payment authorization
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default StaffLogin;

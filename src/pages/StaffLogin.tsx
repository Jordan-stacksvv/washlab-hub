import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  UserCheck, 
  UserMinus, 
  Users,
  AlertCircle,
  Fingerprint,
  Clock,
  ArrowLeft,
  ClipboardCheck,
  UserPlus,
  Sparkles,
  CheckCircle2,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

interface ActiveStaff {
  id: string;
  name: string;
  signedInAt: Date;
  avatar: string;
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
      const staffNames = ['Portia', 'J.J Nortey', 'Kwame', 'Ama'];
      const mockStaff = {
        id: `staff-${Date.now()}`,
        name: mode === 'add' ? staffNames[activeStaff.length % staffNames.length] : 'Portia',
        signedInAt: new Date(),
        avatar: mode === 'add' ? staffNames[activeStaff.length % staffNames.length][0] : 'P',
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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Clean Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">Staff Portal</h1>
              <p className="text-muted-foreground">Enter your branch PIN to continue</p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                value={branchPin}
                onChange={(e) => setBranchPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBranchLogin()}
                placeholder="• • • •"
                className="h-14 text-center text-2xl tracking-[0.5em] rounded-xl border-2 focus:border-primary"
                maxLength={4}
              />
              <Button 
                onClick={handleBranchLogin} 
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-semibold"
              >
                Continue
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6 text-center">
              Demo PIN: <span className="font-mono font-semibold text-primary">1234</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Face ID Sign In Screen (No active staff)
  if (activeStaff.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 py-4 flex items-center justify-between border-b border-border">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {isScanning ? (
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <div className="absolute inset-8 rounded-full bg-primary/5 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-display font-bold text-foreground mb-2">Scanning Face...</h2>
                <p className="text-muted-foreground">Please look directly at the camera</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground mb-2">No Active Staff</h2>
                <p className="text-muted-foreground mb-8">
                  Sign in with Face ID to start your shift
                </p>
                <Button 
                  onClick={() => startFaceScan('signin')} 
                  size="lg" 
                  className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 font-semibold gap-3"
                >
                  <Fingerprint className="w-6 h-6" />
                  Sign In with Face ID
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // POS-Style Staff Dashboard
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar - Branch, Staff Avatars, Clock */}
      <header className="bg-primary text-primary-foreground px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo size="sm" />
            </Link>
            <div className="h-8 w-px bg-primary-foreground/20" />
            <div>
              <p className="text-primary-foreground/70 text-xs">Branch</p>
              <p className="font-semibold">Main Campus</p>
            </div>
          </div>
          
          {/* Active Staff Avatars */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/70 text-sm hidden sm:inline">Staff on duty:</span>
              <div className="flex -space-x-2">
                {activeStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="w-9 h-9 rounded-full bg-primary-foreground text-primary font-bold flex items-center justify-center text-sm border-2 border-primary"
                    title={staff.name}
                  >
                    {staff.avatar}
                  </div>
                ))}
              </div>
            </div>
            <div className="h-8 w-px bg-primary-foreground/20 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-primary-foreground/70 text-xs">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              <p className="font-mono font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {isScanning ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="relative w-40 h-40 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-8 rounded-full bg-primary/5 flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              {scanMode === 'add' ? 'Adding Staff...' : 'Confirming Sign Out...'}
            </h2>
            <p className="text-muted-foreground">Please look at the camera</p>
          </div>
        ) : (
          <>
            {/* MAIN ACTION BUTTONS - BIG TOUCH BUTTONS */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => window.location.href = '/washstation'}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 min-h-[140px]"
                >
                  <ClipboardCheck className="w-10 h-10" />
                  <span className="font-semibold text-lg">Check-in Order</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/washstation'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 min-h-[140px]"
                >
                  <UserPlus className="w-10 h-10" />
                  <span className="font-semibold text-lg">New Walk-in</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/washstation'}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 min-h-[140px]"
                >
                  <Sparkles className="w-10 h-10" />
                  <span className="font-semibold text-lg">Orders in Wash</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/washstation'}
                  className="bg-violet-500 hover:bg-violet-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/20 min-h-[140px]"
                >
                  <CheckCircle2 className="w-10 h-10" />
                  <span className="font-semibold text-lg">Ready Orders</span>
                </button>
              </div>
            </section>

            {/* Active Staff Section */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Staff Attendance</h2>
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Active Staff</p>
                      <p className="text-sm text-muted-foreground">{activeStaff.length} currently signed in</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {activeStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
                          {staff.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{staff.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Signed in at {staff.signedInAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        Active
                      </span>
                    </div>
                  ))}
                </div>

                {/* Attendance Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => startFaceScan('add')} 
                    variant="outline"
                    className="h-14 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 gap-2"
                  >
                    <UserPlus className="w-5 h-5 text-primary" />
                    <span className="font-medium">Add Staff</span>
                  </Button>
                  <Button 
                    onClick={() => startFaceScan('signout')} 
                    variant="outline"
                    className="h-14 rounded-xl border-2 border-dashed border-destructive/30 hover:border-destructive hover:bg-destructive/5 text-destructive gap-2"
                  >
                    <UserMinus className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </Button>
                </div>
              </div>
            </section>

            {/* Quick Stats */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Today's Summary</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Pending', value: '3', color: 'bg-amber-100 text-amber-700' },
                  { label: 'In Progress', value: '5', color: 'bg-primary/10 text-primary' },
                  { label: 'Ready', value: '2', color: 'bg-emerald-100 text-emerald-700' },
                  { label: 'Completed', value: '12', color: 'bg-muted text-muted-foreground' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className={`text-sm font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${stat.color}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer Note */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-xs text-muted-foreground text-center">
          Face ID is required for attendance tracking and payment authorization
        </p>
      </footer>
    </div>
  );
};

export default StaffLogin;

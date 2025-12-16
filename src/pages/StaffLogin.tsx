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
  AlertCircle
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Staff Portal</h1>
            <p className="text-muted-foreground">Enter your branch PIN to continue</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="pin">Branch PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={branchPin}
                  onChange={(e) => setBranchPin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBranchLogin()}
                  placeholder="Enter 4-digit PIN"
                  className="mt-1 text-center text-2xl tracking-widest"
                  maxLength={4}
                />
              </div>
              <Button onClick={handleBranchLogin} className="w-full">
                Login to Branch
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Demo PIN: 1234
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeStaff.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Logo size="lg" className="justify-center mb-8" />
          
          {isScanning ? (
            <div className="bg-card rounded-2xl border border-border p-8 animate-pulse">
              <div className="w-32 h-32 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Camera className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-display font-semibold mb-2">Scanning Face...</h2>
              <p className="text-muted-foreground text-sm">
                Please look at the camera
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-warning/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-warning" />
              </div>
              <h2 className="text-xl font-display font-semibold mb-2">No Active Staff</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Sign in with Face ID to start your shift
              </p>
              <Button onClick={() => startFaceScan('signin')} size="lg" className="w-full">
                <UserCheck className="w-5 h-5 mr-2" />
                Sign In with Face ID
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Logo size="sm" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/washstation'}
          >
            Go to Dashboard
          </Button>
        </div>

        {isScanning ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center animate-pulse">
            <div className="w-32 h-32 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <Camera className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-display font-semibold mb-2">Scanning Face...</h2>
            <p className="text-muted-foreground text-sm">
              {scanMode === 'add' ? 'Adding new attendant' : 
               scanMode === 'signout' ? 'Confirming sign out' : 'Please look at the camera'}
            </p>
          </div>
        ) : (
          <>
            {/* Active Staff List */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Active Attendants ({activeStaff.length})
              </h2>
              <div className="space-y-3">
                {activeStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Signed in at {staff.signedInAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={() => startFaceScan('add')} 
                variant="outline" 
                className="w-full"
              >
                <Users className="w-5 h-5 mr-2" />
                Add Another Attendant
              </Button>
              <Button 
                onClick={() => startFaceScan('signout')} 
                variant="destructive" 
                className="w-full"
              >
                <UserMinus className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Face ID is required for attendance tracking and payment authorization
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffLogin;

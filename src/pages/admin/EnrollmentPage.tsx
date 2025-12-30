import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import {
  Fingerprint,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  Shield,
  AlertTriangle
} from 'lucide-react';

// ============================================
// KILL SWITCH - Set to false to disable enrollment
// ============================================
const ENROLLMENT_ENABLED = true;

// ============================================
// PREVIEW MODE - Backend not connected yet
// ============================================
const PREVIEW_MODE = true;

// Local storage key for enrolled staff
const ENROLLED_STAFF_KEY = 'washlab_enrolled_staff';

interface EnrolledStaffData {
  staffId: string;
  name: string;
  phone: string;
  role: string;
  branch: string;
  enrolledAt: string;
  token: string;
}

// Demo branches for preview mode
const DEMO_BRANCHES = [
  { id: 'branch-001', name: 'Accra Central' },
  { id: 'branch-002', name: 'East Legon' },
  { id: 'branch-003', name: 'Osu Oxford Street' },
  { id: 'branch-004', name: 'Tema Community 1' },
];

// Demo roles
const STAFF_ROLES = [
  { id: 'washer', name: 'Washer' },
  { id: 'folder', name: 'Folder' },
  { id: 'ironer', name: 'Ironer' },
  { id: 'supervisor', name: 'Supervisor' },
  { id: 'cashier', name: 'Cashier' },
];

// Fake token validation (always returns true in preview mode)
const validateToken = (token: string): { valid: boolean; staffName?: string } => {
  // In production, this would be an API call
  if (PREVIEW_MODE) {
    // Extract name from token format: name-timestamp
    const parts = token.split('-');
    if (parts.length >= 2) {
      const name = parts.slice(0, -1).join(' ').replace(/_/g, ' ');
      return { valid: true, staffName: name.charAt(0).toUpperCase() + name.slice(1) };
    }
    return { valid: true };
  }
  return { valid: false };
};

// Store enrollment data in localStorage
const storeEnrollmentData = (data: EnrolledStaffData) => {
  try {
    const existing = localStorage.getItem(ENROLLED_STAFF_KEY);
    const enrolledStaff: EnrolledStaffData[] = existing ? JSON.parse(existing) : [];
    enrolledStaff.push(data);
    localStorage.setItem(ENROLLED_STAFF_KEY, JSON.stringify(enrolledStaff));
  } catch (e) {
    console.error('Failed to store enrollment data:', e);
  }
};

const EnrollmentPage = () => {
  const { token } = useParams<{ token: string }>();
  const { isSupported, isProcessing, enrollStaff, isStaffEnrolled } = useWebAuthn();
  
  const [step, setStep] = useState<'disabled' | 'invalid' | 'welcome' | 'enroll' | 'success' | 'error'>('welcome');
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffBranch, setStaffBranch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  // Check kill switch and validate token
  useEffect(() => {
    if (!ENROLLMENT_ENABLED) {
      setStep('disabled');
      return;
    }

    if (!token) {
      setStep('invalid');
      return;
    }

    const validation = validateToken(token);
    if (!validation.valid) {
      setStep('invalid');
      return;
    }

    setTokenValid(true);
    if (validation.staffName) {
      setStaffName(validation.staffName);
    }
  }, [token]);

  const handleStartEnrollment = () => {
    if (!staffName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!staffRole) {
      toast.error('Please select your role');
      return;
    }
    if (!staffBranch) {
      toast.error('Please select your branch');
      return;
    }
    setStep('enroll');
  };

  const handleEnroll = async () => {
    if (!isSupported) {
      setErrorMessage('Biometric authentication is not supported on this device. Please use a device with Face ID or Fingerprint capability.');
      setStep('error');
      return;
    }

    const staffId = `staff-${token}`;
    
    // Check if already enrolled
    if (isStaffEnrolled(staffId)) {
      setStep('success');
      toast.info('You are already enrolled!');
      return;
    }

    const success = await enrollStaff(staffName, staffId);
    
    if (success) {
      // Store enrollment data in localStorage
      const enrollmentData: EnrolledStaffData = {
        staffId,
        name: staffName,
        phone: staffPhone,
        role: staffRole,
        branch: staffBranch,
        enrolledAt: new Date().toISOString(),
        token: token || '',
      };
      storeEnrollmentData(enrollmentData);
      
      setStep('success');
    } else {
      setErrorMessage('Enrollment failed. Please try again or contact your administrator.');
      setStep('error');
    }
  };

  const handleRetry = () => {
    setStep('welcome');
    setErrorMessage('');
  };

  // Kill switch active
  if (step === 'disabled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Enrollment Paused
          </h1>
          <p className="text-muted-foreground">
            Staff enrollment is temporarily disabled. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (step === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Invalid Enrollment Link
          </h1>
          <p className="text-muted-foreground">
            This enrollment link is invalid or has expired. Please request a new link from your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
      {/* Preview Mode Banner */}
      {PREVIEW_MODE && (
        <div className="bg-yellow-500 text-yellow-900 text-center py-2 px-4 text-sm font-medium">
          ⚠️ Preview Mode – Backend Pending
        </div>
      )}

      {/* Header */}
      <header className="p-6">
        <Logo size="md" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Fingerprint className="w-10 h-10 text-primary" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome to WashLab
              </h1>
              <p className="text-muted-foreground mb-6">
                Complete your biometric enrollment to start using WashStation
              </p>

              <div className="space-y-4 text-left mb-6">
                <div>
                  <Label>Your Name *</Label>
                  <Input
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="0241234567"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Role *</Label>
                  <Select value={staffRole} onValueChange={setStaffRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Branch *</Label>
                  <Select value={staffBranch} onValueChange={setStaffBranch}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_BRANCHES.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleStartEnrollment}
                className="w-full h-12 text-lg rounded-xl"
              >
                Continue to Enrollment
              </Button>

              {PREVIEW_MODE && (
                <p className="text-xs text-yellow-600 mt-4 bg-yellow-50 p-2 rounded">
                  Preview Mode: Token validation bypassed
                </p>
              )}
            </div>
          )}

          {/* Enroll Step */}
          {step === 'enroll' && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Biometric Setup
              </h1>
              <p className="text-muted-foreground mb-6">
                Use Face ID or Fingerprint to enroll
              </p>

              <div className="bg-muted/50 rounded-xl p-6 mb-6 text-left">
                <p className="font-semibold text-foreground mb-3">{staffName}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Role: {STAFF_ROLES.find(r => r.id === staffRole)?.name}</p>
                  <p>Branch: {DEMO_BRANCHES.find(b => b.id === staffBranch)?.name}</p>
                  {staffPhone && <p>Phone: {staffPhone}</p>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                  <Smartphone className="w-4 h-4" />
                  <span>Enrolling on this device</span>
                </div>
              </div>

              <div className="space-y-3 text-left text-sm text-muted-foreground mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Your biometric data stays on your device</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Used for attendance and payment authorization</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>One-time setup, works across all branches</span>
                </div>
              </div>

              <Button 
                onClick={handleEnroll}
                disabled={isProcessing}
                className="w-full h-14 text-lg rounded-xl gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    Enroll with Biometrics
                  </>
                )}
              </Button>

              <button 
                onClick={() => setStep('welcome')}
                className="text-sm text-muted-foreground mt-4 hover:text-foreground"
              >
                ← Go back
              </button>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Enrollment Complete!
              </h1>
              <p className="text-muted-foreground mb-6">
                You're all set, {staffName}! You can now use biometric authentication at WashStation.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-700">
                  ✓ Face ID / Fingerprint enrolled<br />
                  ✓ Ready for attendance sign-in<br />
                  ✓ Payment authorization enabled
                </p>
              </div>

              {PREVIEW_MODE && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Preview Mode: Data stored locally only
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                You can close this page now. Head to WashStation to sign in for your shift!
              </p>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Enrollment Failed
              </h1>
              <p className="text-muted-foreground mb-6">
                {errorMessage}
              </p>

              <Button 
                onClick={handleRetry}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                Try Again
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                Need help? Contact your administrator.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-white/60 text-sm">
          © 2025 WashLab • Secure Biometric Enrollment
        </p>
      </footer>
    </div>
  );
};

export default EnrollmentPage;

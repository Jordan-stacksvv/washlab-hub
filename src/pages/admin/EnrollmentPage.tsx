import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertTriangle,
  Lock
} from 'lucide-react';
import { getActiveBranches, getBranchById } from '@/config/branches';

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
const PENDING_ENROLLMENTS_KEY = 'washlab_pending_enrollments';

interface EnrolledStaffData {
  staffId: string;
  name: string;
  phone: string;
  role: string;
  branch: string;
  branchName: string;
  enrolledAt: string;
  token: string;
}

interface PendingEnrollment {
  token: string;
  role: string;
  roleLabel: string;
  branch: string;
  branchName: string;
  createdAt: string;
  createdBy: string;
}

// Demo roles
const STAFF_ROLES = [
  { id: 'washer', name: 'Washer' },
  { id: 'folder', name: 'Folder' },
  { id: 'ironer', name: 'Ironer' },
  { id: 'supervisor', name: 'Supervisor' },
  { id: 'cashier', name: 'Cashier' },
  { id: 'attendant', name: 'Attendant' },
];

// Token validation - checks pending enrollments
const validateToken = (token: string): { valid: boolean; enrollment?: PendingEnrollment } => {
  if (PREVIEW_MODE) {
    // Check for pending enrollment data
    try {
      const pending = localStorage.getItem(PENDING_ENROLLMENTS_KEY);
      if (pending) {
        const enrollments: PendingEnrollment[] = JSON.parse(pending);
        const found = enrollments.find(e => e.token === token);
        if (found) {
          return { valid: true, enrollment: found };
        }
      }
    } catch (e) {
      console.error('Error reading pending enrollments:', e);
    }
    
    // Fallback for demo tokens
    if (token.includes('-')) {
      return { valid: true };
    }
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
    
    // Remove from pending enrollments
    const pending = localStorage.getItem(PENDING_ENROLLMENTS_KEY);
    if (pending) {
      const enrollments: PendingEnrollment[] = JSON.parse(pending);
      const updated = enrollments.filter(e => e.token !== data.token);
      localStorage.setItem(PENDING_ENROLLMENTS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to store enrollment data:', e);
  }
};

const EnrollmentPage = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const { isSupported, isProcessing, enrollStaff, isStaffEnrolled } = useWebAuthn();
  
  const [step, setStep] = useState<'disabled' | 'invalid' | 'welcome' | 'enroll' | 'success' | 'error'>('welcome');
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  
  // Role and Branch are set by admin - locked for staff
  const [staffRole, setStaffRole] = useState('');
  const [staffRoleLabel, setStaffRoleLabel] = useState('');
  const [staffBranch, setStaffBranch] = useState('');
  const [staffBranchName, setStaffBranchName] = useState('');
  const [roleLockedByAdmin, setRoleLockedByAdmin] = useState(false);
  
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
    
    // If enrollment data exists from admin, lock the role and branch
    if (validation.enrollment) {
      setStaffRole(validation.enrollment.role);
      setStaffRoleLabel(validation.enrollment.roleLabel);
      setStaffBranch(validation.enrollment.branch);
      setStaffBranchName(validation.enrollment.branchName);
      setRoleLockedByAdmin(true);
    } else {
      // Fallback for demo: check URL params
      const roleParam = searchParams.get('role');
      const branchParam = searchParams.get('branch');
      
      if (roleParam) {
        setStaffRole(roleParam);
        const roleObj = STAFF_ROLES.find(r => r.id === roleParam);
        setStaffRoleLabel(roleObj?.name || roleParam);
        setRoleLockedByAdmin(true);
      }
      
      if (branchParam) {
        setStaffBranch(branchParam);
        const branchObj = getBranchById(branchParam);
        setStaffBranchName(branchObj?.name || branchParam);
      }
    }
  }, [token, searchParams]);

  const handleStartEnrollment = () => {
    if (!staffName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!staffPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!staffRole) {
      toast.error('Role not assigned. Please contact admin.');
      return;
    }
    if (!staffBranch) {
      toast.error('Branch not assigned. Please contact admin.');
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
        branchName: staffBranchName,
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

              {/* Admin-assigned Role and Branch - Locked */}
              {roleLockedByAdmin && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Assigned by Admin</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="font-semibold text-foreground">{staffRoleLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Branch</p>
                      <p className="font-semibold text-foreground">{staffBranchName}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-left mb-6">
                <div>
                  <Label>Your Full Name *</Label>
                  <Input
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="0241234567"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                onClick={handleStartEnrollment}
                className="w-full h-12 text-lg rounded-xl"
                disabled={!roleLockedByAdmin}
              >
                Continue to Enrollment
              </Button>

              {!roleLockedByAdmin && (
                <p className="text-xs text-red-600 mt-4 bg-red-50 p-2 rounded">
                  Role and Branch must be assigned by Admin before enrollment
                </p>
              )}

              {PREVIEW_MODE && roleLockedByAdmin && (
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
                  <p>Role: {staffRoleLabel}</p>
                  <p>Branch: {staffBranchName}</p>
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

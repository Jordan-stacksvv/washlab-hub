import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { toast } from 'sonner';
import washLabLogo from '@/assets/washlab-logo.png';
import { 
  Building2, 
  Fingerprint, 
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface BranchLoginProps {
  onSuccess: (staffId: string, staffName: string, branchCode: string) => void;
}

// Mock branches (in production, fetch from backend)
const mockBranches = [
  { code: '001', name: 'Main Campus', location: 'Legon' },
  { code: '002', name: 'Hostel A', location: 'Akuafo Hall' },
  { code: '003', name: 'Hostel B', location: 'Volta Hall' },
];

export const BranchLogin = ({ onSuccess }: BranchLoginProps) => {
  const { isSupported, isProcessing, verifyStaff, enrolledStaff } = useWebAuthn();
  const [step, setStep] = useState<'branch' | 'verify'>('branch');
  const [branchCode, setBranchCode] = useState('');
  const [validBranch, setValidBranch] = useState<typeof mockBranches[0] | null>(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  const validateBranchCode = () => {
    const branch = mockBranches.find(b => b.code === branchCode);
    if (branch) {
      setValidBranch(branch);
      setStep('verify');
      // Auto-trigger Face ID verification
      handleBiometricVerification();
    } else {
      toast.error('Invalid branch code. Please try again.');
    }
  };

  const handleBiometricVerification = async () => {
    if (!isSupported) {
      toast.error('WebAuthn not supported on this device. Please use a compatible device.');
      return;
    }

    if (enrolledStaff.length === 0) {
      toast.error('No staff enrolled. Please contact admin to enroll staff members.');
      return;
    }

    setVerificationAttempted(true);
    const result = await verifyStaff();
    
    if (result.success && result.staffId && result.staffName) {
      toast.success(`Welcome, ${result.staffName}! Checked in successfully.`);
      onSuccess(result.staffId, result.staffName, branchCode);
    } else {
      // Allow retry
      setVerificationAttempted(false);
    }
  };

  const NumberPad = () => (
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((digit, idx) => (
        <button
          key={idx}
          onClick={() => {
            if (digit === 'del') {
              setBranchCode(prev => prev.slice(0, -1));
            } else if (digit !== '') {
              setBranchCode(prev => prev.length < 4 ? prev + digit : prev);
            }
          }}
          disabled={digit === ''}
          className={`h-14 rounded-xl font-semibold text-lg transition-all ${
            digit === '' 
              ? 'invisible' 
              : digit === 'del' 
                ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' 
                : 'bg-muted hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          {digit === 'del' ? '⌫' : digit}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <img src={washLabLogo} alt="WashLab" className="h-16 w-auto filter brightness-0 invert" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {step === 'branch' ? (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Enter Branch Code</h1>
              <p className="text-muted-foreground text-sm">
                Enter your branch code to access the WashStation
              </p>
            </div>

            {/* Branch Code Display */}
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                    branchCode[idx] 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {branchCode[idx] || '•'}
                </div>
              ))}
            </div>

            <NumberPad />

            <Button
              onClick={validateBranchCode}
              disabled={branchCode.length < 3}
              className="w-full mt-6 h-14 rounded-xl text-lg bg-primary hover:bg-primary/90"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Demo codes: 001, 002, 003
            </p>
          </div>
        ) : (
          <div className="p-8">
            <div className="text-center mb-8">
              {validBranch && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium mb-4">
                  <CheckCircle2 className="w-4 h-4" />
                  {validBranch.name}
                </div>
              )}
              
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {isProcessing ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : (
                  <Fingerprint className="w-10 h-10 text-primary" />
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isProcessing ? 'Verifying...' : 'Verify Identity'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isProcessing 
                  ? 'Please complete biometric verification'
                  : 'Use Face ID or fingerprint to sign in'
                }
              </p>
            </div>

            {!isProcessing && (
              <>
                <Button
                  onClick={handleBiometricVerification}
                  className="w-full h-14 rounded-xl text-lg bg-primary hover:bg-primary/90"
                >
                  <Fingerprint className="w-5 h-5 mr-2" />
                  Verify with Biometrics
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep('branch');
                    setBranchCode('');
                  }}
                  className="w-full mt-4"
                >
                  Back to Branch Code
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-primary-foreground/60 text-sm mt-6">
        Staff Attendance & Verification System
      </p>
    </div>
  );
};
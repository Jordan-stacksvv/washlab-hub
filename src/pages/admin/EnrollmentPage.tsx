import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Shield
} from 'lucide-react';

const EnrollmentPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isSupported, isProcessing, enrollStaff, isStaffEnrolled } = useWebAuthn();
  
  const [step, setStep] = useState<'welcome' | 'verify' | 'enroll' | 'success' | 'error'>('welcome');
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Parse token to extract staff info (in production, this would be validated server-side)
  useEffect(() => {
    if (token) {
      // Extract name from token (format: name-timestamp)
      const parts = token.split('-');
      if (parts.length >= 2) {
        const name = parts.slice(0, -1).join(' ').replace(/-/g, ' ');
        setStaffName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    }
  }, [token]);

  const handleStartEnrollment = () => {
    if (!staffName.trim()) {
      toast.error('Please enter your name');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
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
                  <Label>Your Name</Label>
                  <Input
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone Number (optional)</Label>
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
              >
                Continue to Enrollment
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                Token: {token}
              </p>
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

              <div className="bg-muted/50 rounded-xl p-6 mb-6">
                <p className="font-semibold text-foreground mb-2">{staffName}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
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

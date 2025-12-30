import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { useWebAuthn } from '@/shared/hooks/useWebAuthn';
import washLabLogo from '@/assets/washlab-logo.png';
import { Fingerprint, Loader2, CheckCircle, AlertCircle, QrCode } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  code: string;
}

/**
 * Face Scan Page
 * 
 * Biometric authentication for staff attendance
 * - WebAuthn Face ID / Fingerprint scan
 * - Auto-identifies staff
 * - Records timestamp
 * - Redirects to dashboard on success
 */
const FaceScan = () => {
  const navigate = useNavigate();
  const { isSupported, isProcessing, verifyStaff, enrolledStaff } = useWebAuthn();
  
  const [branch, setBranch] = useState<Branch | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [staffName, setStaffName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Get branch from session
    const stored = sessionStorage.getItem('washstation_branch');
    if (stored) {
      setBranch(JSON.parse(stored));
    } else {
      navigate('/washstation');
    }
  }, [navigate]);

  const handleScan = async () => {
    if (!isSupported) {
      setErrorMessage('Biometric authentication not supported on this device');
      setStatus('error');
      return;
    }

    if (enrolledStaff.length === 0) {
      setErrorMessage('No staff enrolled. Please enroll via Admin portal first.');
      setStatus('error');
      return;
    }

    setStatus('scanning');
    
    const result = await verifyStaff();
    
    if (result.success && result.staffName) {
      setStaffName(result.staffName);
      setStatus('success');
      
      // Store pending staff for confirmation page
      sessionStorage.setItem('washstation_pending_staff', JSON.stringify({
        id: result.staffId,
        name: result.staffName,
        role: 'Attendant'
      }));

      // Redirect to confirm clock-in page
      setTimeout(() => {
        navigate('/washstation/confirm-clock-in');
      }, 1500);
    } else {
      setErrorMessage('Authentication failed. Please try again.');
      setStatus('error');
    }
  };

  const handleQRFallback = () => {
    // QR fallback - would open camera
    setErrorMessage('QR fallback not implemented yet');
    setStatus('error');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <img src={washLabLogo} alt="WashLab" className="h-10 w-auto" />
        {branch && (
          <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {branch.name}
          </span>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            
            {/* Idle State */}
            {status === 'idle' && (
              <>
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Fingerprint className="w-12 h-12 text-primary" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Staff Sign In
                </h1>
                <p className="text-muted-foreground mb-8">
                  Use Face ID or Fingerprint to clock in
                </p>

                <Button
                  onClick={handleScan}
                  className="w-full h-14 text-lg rounded-xl gap-2 mb-4"
                >
                  <Fingerprint className="w-5 h-5" />
                  Scan to Sign In
                </Button>

                <button
                  onClick={handleQRFallback}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mx-auto"
                >
                  <QrCode className="w-4 h-4" />
                  Use QR Code instead
                </button>
              </>
            )}

            {/* Scanning State */}
            {status === 'scanning' && (
              <>
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Scanning...
                </h1>
                <p className="text-muted-foreground">
                  Look at your device or place your finger on the sensor
                </p>
              </>
            )}

            {/* Success State */}
            {status === 'success' && (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Welcome, {staffName}!
                </h1>
                <p className="text-muted-foreground mb-4">
                  You've signed in successfully
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleTimeString()} • {branch?.name}
                </p>
              </>
            )}

            {/* Error State */}
            {status === 'error' && (
              <>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Sign In Failed
                </h1>
                <p className="text-muted-foreground mb-6">
                  {errorMessage}
                </p>

                <Button
                  onClick={() => setStatus('idle')}
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <button 
          onClick={() => navigate('/washstation')}
          className="text-white/60 text-sm hover:text-white"
        >
          ← Change Branch
        </button>
      </footer>
    </div>
  );
};

export default FaceScan;

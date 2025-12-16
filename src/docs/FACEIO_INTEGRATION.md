# FaceIO Integration Guide

## Overview
FaceIO provides facial recognition for staff attendance and payment authorization in WashLab.

## Installation

```bash
npm install @faceio/fiojs
```

## Environment Setup

Add to your `.env` file:
```
FACEIO_PUBLIC_ID=your_faceio_public_id
```

## Implementation

### 1. Initialize FaceIO

```typescript
// src/lib/faceio.ts
import faceIO from '@faceio/fiojs';

let faceio: any = null;

export const initFaceIO = async () => {
  if (!faceio) {
    faceio = new faceIO(import.meta.env.VITE_FACEIO_PUBLIC_ID);
  }
  return faceio;
};

export const getFaceIO = () => faceio;
```

### 2. Staff Face Enrollment

```typescript
// src/hooks/useFaceAuth.ts
import { useState } from 'react';
import { initFaceIO } from '@/lib/faceio';

export const useFaceAuth = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enroll new staff face
  const enrollFace = async (staffId: string, staffName: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const faceio = await initFaceIO();
      const response = await faceio.enroll({
        locale: 'auto',
        payload: {
          staffId,
          staffName,
          enrolledAt: new Date().toISOString()
        }
      });
      
      return {
        success: true,
        faceId: response.facialId,
        details: response
      };
    } catch (err: any) {
      const errorMessage = getFaceIOErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  // Authenticate staff face
  const authenticateFace = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const faceio = await initFaceIO();
      const response = await faceio.authenticate({
        locale: 'auto'
      });
      
      return {
        success: true,
        staffId: response.payload.staffId,
        staffName: response.payload.staffName,
        faceId: response.facialId
      };
    } catch (err: any) {
      const errorMessage = getFaceIOErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    enrollFace,
    authenticateFace,
    isProcessing,
    error
  };
};

// Error code mapping
function getFaceIOErrorMessage(errorCode: number): string {
  const errors: Record<number, string> = {
    1: 'Face not found. Please try again.',
    2: 'Session expired. Please refresh.',
    3: 'Permission denied. Allow camera access.',
    4: 'No face detected. Position your face clearly.',
    5: 'Face already enrolled.',
    6: 'Network error. Check your connection.',
    7: 'Multiple faces detected. Only one person allowed.',
    8: 'Face not recognized.',
    9: 'Browser not supported.',
    10: 'Terms not accepted.'
  };
  return errors[errorCode] || 'An error occurred. Please try again.';
}
```

### 3. Staff Attendance Component

```typescript
// src/components/StaffAttendance.tsx
import { useState } from 'react';
import { useFaceAuth } from '@/hooks/useFaceAuth';
import { Button } from '@/components/ui/button';
import { Camera, LogIn, LogOut, Loader2 } from 'lucide-react';

interface StaffAttendanceProps {
  onSignIn: (staff: { id: string; name: string }) => void;
  onSignOut: (staffId: string) => void;
  signedInStaff: { id: string; name: string; signedInAt: Date }[];
}

export const StaffAttendance = ({ onSignIn, onSignOut, signedInStaff }: StaffAttendanceProps) => {
  const { authenticateFace, isProcessing, error } = useFaceAuth();
  const [mode, setMode] = useState<'idle' | 'signin' | 'signout'>('idle');

  const handleSignIn = async () => {
    setMode('signin');
    const result = await authenticateFace();
    
    if (result.success) {
      // Check if already signed in
      const alreadySignedIn = signedInStaff.some(s => s.id === result.staffId);
      if (alreadySignedIn) {
        toast.error('Already signed in');
        return;
      }
      
      onSignIn({ id: result.staffId!, name: result.staffName! });
      toast.success(`Welcome, ${result.staffName}!`);
      
      // Log attendance to backend
      await logAttendance(result.staffId!, 'sign_in');
    }
    setMode('idle');
  };

  const handleSignOut = async () => {
    setMode('signout');
    const result = await authenticateFace();
    
    if (result.success) {
      const staff = signedInStaff.find(s => s.id === result.staffId);
      if (!staff) {
        toast.error('You are not signed in');
        return;
      }
      
      onSignOut(result.staffId!);
      toast.success(`Goodbye, ${result.staffName}!`);
      
      // Log attendance to backend
      await logAttendance(result.staffId!, 'sign_out');
    }
    setMode('idle');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button 
          onClick={handleSignIn}
          disabled={isProcessing}
          className="flex-1 h-16 text-lg"
        >
          {isProcessing && mode === 'signin' ? (
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
          ) : (
            <LogIn className="w-6 h-6 mr-2" />
          )}
          Sign In
        </Button>
        
        <Button 
          onClick={handleSignOut}
          disabled={isProcessing}
          variant="outline"
          className="flex-1 h-16 text-lg"
        >
          {isProcessing && mode === 'signout' ? (
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
          ) : (
            <LogOut className="w-6 h-6 mr-2" />
          )}
          Sign Out
        </Button>
      </div>
      
      {error && (
        <p className="text-destructive text-sm text-center">{error}</p>
      )}
      
      {/* Currently signed in */}
      {signedInStaff.length > 0 && (
        <div className="bg-muted rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Currently on duty:</p>
          <div className="flex flex-wrap gap-2">
            {signedInStaff.map(staff => (
              <span 
                key={staff.id}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {staff.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to log attendance
async function logAttendance(staffId: string, action: 'sign_in' | 'sign_out') {
  // Replace with your actual API endpoint
  try {
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffId,
        action,
        timestamp: new Date().toISOString(),
        branchId: 'current_branch_id' // Get from context
      })
    });
  } catch (err) {
    console.error('Failed to log attendance:', err);
  }
}
```

### 4. Payment Authorization Component

```typescript
// src/components/PaymentAuthorization.tsx
import { useState } from 'react';
import { useFaceAuth } from '@/hooks/useFaceAuth';
import { Button } from '@/components/ui/button';
import { Camera, CreditCard, Loader2, ShieldCheck } from 'lucide-react';

interface PaymentAuthorizationProps {
  orderId: string;
  amount: number;
  customerPhone: string;
  onAuthorized: (staffId: string) => void;
  onCancel: () => void;
}

export const PaymentAuthorization = ({ 
  orderId, 
  amount, 
  customerPhone,
  onAuthorized,
  onCancel 
}: PaymentAuthorizationProps) => {
  const { authenticateFace, isProcessing, error } = useFaceAuth();
  const [step, setStep] = useState<'confirm' | 'scanning' | 'authorized'>('confirm');

  const handleAuthorize = async () => {
    setStep('scanning');
    const result = await authenticateFace();
    
    if (result.success) {
      setStep('authorized');
      
      // Record who authorized this payment
      onAuthorized(result.staffId!);
      
      // Trigger payment (e.g., Hubtel USSD)
      await initiatePayment(orderId, amount, customerPhone, result.staffId!);
    } else {
      setStep('confirm');
    }
  };

  return (
    <div className="bg-card rounded-2xl border p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Authorize Payment</h2>
        <p className="text-muted-foreground">Face verification required</p>
      </div>

      <div className="bg-muted rounded-xl p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">Order</span>
          <span className="font-semibold">{orderId}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-bold text-xl text-primary">₵{amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phone</span>
          <span className="font-medium">{customerPhone}</span>
        </div>
      </div>

      {step === 'confirm' && (
        <div className="space-y-3">
          <Button 
            onClick={handleAuthorize}
            className="w-full h-14 text-lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Verify Face & Charge
          </Button>
          <Button 
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}

      {step === 'scanning' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your face...</p>
          <p className="text-sm text-muted-foreground">Please look at the camera</p>
        </div>
      )}

      {step === 'authorized' && (
        <div className="text-center py-8">
          <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-green-600">Payment Authorized!</p>
          <p className="text-muted-foreground">USSD prompt sent to customer</p>
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm text-center mt-4">{error}</p>
      )}
    </div>
  );
};

async function initiatePayment(orderId: string, amount: number, phone: string, staffId: string) {
  // Replace with your Hubtel API call
  try {
    await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount,
        phone,
        authorizedBy: staffId,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.error('Failed to initiate payment:', err);
    throw err;
  }
}
```

### 5. Staff Enrollment (Admin)

```typescript
// src/components/StaffEnrollment.tsx
import { useState } from 'react';
import { useFaceAuth } from '@/hooks/useFaceAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, UserPlus, Loader2, CheckCircle } from 'lucide-react';

export const StaffEnrollment = () => {
  const { enrollFace, isProcessing, error } = useFaceAuth();
  const [staffId, setStaffId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  const handleEnroll = async () => {
    if (!staffId || !staffName) {
      toast.error('Please enter staff ID and name');
      return;
    }

    const result = await enrollFace(staffId, staffName);
    
    if (result.success) {
      setEnrolled(true);
      toast.success('Face enrolled successfully!');
      
      // Save face ID to database
      await saveStaffFaceId(staffId, result.faceId!);
    }
  };

  if (enrolled) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Enrollment Complete!</h3>
        <p className="text-muted-foreground mb-4">{staffName} can now sign in with face recognition.</p>
        <Button onClick={() => { setEnrolled(false); setStaffId(''); setStaffName(''); }}>
          Enroll Another Staff
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Staff ID</Label>
        <Input 
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          placeholder="Enter staff ID"
        />
      </div>
      
      <div>
        <Label>Staff Name</Label>
        <Input 
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          placeholder="Enter full name"
        />
      </div>

      <Button 
        onClick={handleEnroll}
        disabled={isProcessing || !staffId || !staffName}
        className="w-full h-14"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Camera className="w-5 h-5 mr-2" />
        )}
        Capture Face & Enroll
      </Button>

      {error && (
        <p className="text-destructive text-sm text-center">{error}</p>
      )}
    </div>
  );
};

async function saveStaffFaceId(staffId: string, faceId: string) {
  await fetch('/api/staff/face-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId, faceId })
  });
}
```

## FaceIO Dashboard Setup

1. Go to [FaceIO Console](https://console.faceio.net)
2. Create a new application
3. Configure security settings:
   - Enable liveness detection
   - Set minimum confidence score (recommended: 0.85)
   - Enable duplicate face prevention
4. Copy your Public ID to environment variables

## Security Best Practices

1. **Never expose API keys** - Use environment variables
2. **Enable liveness detection** - Prevents photo spoofing
3. **Set high confidence thresholds** - Reduces false positives
4. **Log all auth attempts** - For audit trail
5. **Implement session timeout** - Auto sign-out after inactivity

## Database Schema

```sql
-- Staff face enrollment
CREATE TABLE staff_face_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  face_id VARCHAR(255) NOT NULL UNIQUE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Face auth logs
CREATE TABLE face_auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id),
  action VARCHAR(50) NOT NULL, -- 'attendance_signin', 'attendance_signout', 'payment_auth'
  success BOOLEAN NOT NULL,
  error_code INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Testing

For development, FaceIO provides a test mode:
- Use test Public ID from dashboard
- Simulates face detection without real camera
- Returns mock face IDs for testing flows

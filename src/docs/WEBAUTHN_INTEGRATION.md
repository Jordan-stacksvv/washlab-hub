# WebAuthn Integration Guide for WashLab

## Overview

WashLab uses WebAuthn (Web Authentication) for secure biometric authentication. This replaces FaceIO with a free, browser-native solution that supports Face ID, Touch ID, Windows Hello, and other platform authenticators.

## What is WebAuthn?

WebAuthn is a W3C standard for passwordless authentication using biometrics and security keys. It's built into modern browsers and operating systems, making it free to use with no third-party dependencies.

### Supported Authenticators
- **Face ID** (iOS/macOS)
- **Touch ID** (iOS/macOS)
- **Windows Hello** (Windows 10/11)
- **Android Biometrics** (Fingerprint, Face)
- **Security Keys** (YubiKey, etc.)

## Implementation Details

### 1. Staff Enrollment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    STAFF ENROLLMENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Admin generates enrollment link for new staff            │
│     └── Link format: /enroll?token=xxx&staff=yyy            │
│                                                              │
│  2. Staff opens link on their device (tablet/phone)          │
│     └── Must be on HTTPS (WebAuthn requirement)              │
│                                                              │
│  3. Staff enters their name and clicks "Enroll"              │
│     └── Browser prompts for biometric (Face ID/Touch ID)     │
│                                                              │
│  4. WebAuthn creates keypair on device                       │
│     ├── Private key: Stored securely on device (never leaves)│
│     └── Public key: Sent to server and stored in database    │
│                                                              │
│  5. Enrollment complete!                                     │
│     └── Staff can now sign in using biometrics               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Daily Attendance Flow (Tablet)

```
┌─────────────────────────────────────────────────────────────┐
│                    ATTENDANCE SIGN-IN                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Staff approaches tablet and taps "Sign In"               │
│                                                              │
│  2. WebAuthn prompts for biometric verification              │
│     └── Face ID / Touch ID / Windows Hello                   │
│                                                              │
│  3. Device verifies biometric locally                        │
│     └── Signs challenge with private key                     │
│                                                              │
│  4. Server verifies signature with stored public key         │
│     └── Confirms staff identity                              │
│                                                              │
│  5. Attendance logged with:                                  │
│     ├── Staff ID                                             │
│     ├── Timestamp                                            │
│     ├── Branch ID                                            │
│     └── Action (sign_in / sign_out)                          │
│                                                              │
│  6. Dashboard updates to show staff as "Active"              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Payment Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  PAYMENT AUTHORIZATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Staff clicks "Charge Customer"                           │
│                                                              │
│  2. System prompts for biometric verification                │
│     └── "Verify your identity to process payment"            │
│                                                              │
│  3. Staff authenticates with Face ID / Touch ID              │
│                                                              │
│  4. Upon success:                                            │
│     ├── Staff ID linked to payment transaction               │
│     ├── Hubtel/Paystack USSD sent to customer                │
│     └── Audit trail created                                  │
│                                                              │
│  5. Payment record includes:                                 │
│     ├── Order ID                                             │
│     ├── Amount                                               │
│     ├── Authorized By (Staff ID from WebAuthn)               │
│     ├── Timestamp                                            │
│     └── Branch ID                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Code Implementation

### Hook: useWebAuthn

Location: `src/hooks/useWebAuthn.ts`

```typescript
import { useWebAuthn } from '@/hooks/useWebAuthn';

const MyComponent = () => {
  const { 
    isSupported,      // Boolean: WebAuthn available
    isProcessing,     // Boolean: Authentication in progress
    enrollStaff,      // Function: Enroll new staff
    verifyStaff,      // Function: Verify staff identity
    isStaffEnrolled,  // Function: Check if staff enrolled
    enrolledStaff,    // Array: List of enrolled staff
    removeEnrollment  // Function: Remove enrollment
  } = useWebAuthn();
  
  // Check support
  if (!isSupported) {
    return <div>WebAuthn not supported</div>;
  }
  
  // Enroll new staff
  const handleEnroll = async () => {
    const success = await enrollStaff('John Doe', 'staff-123');
  };
  
  // Verify for attendance/payment
  const handleVerify = async () => {
    const result = await verifyStaff();
    if (result.success) {
      console.log('Authenticated:', result.staffName);
    }
  };
};
```

## Database Schema (Convex)

### staff_credentials table

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  staff_credentials: defineTable({
    staffId: v.string(),
    staffName: v.string(),
    branchId: v.string(),
    credentialId: v.string(),     // Base64 encoded
    publicKey: v.string(),         // Base64 encoded
    enrolledAt: v.number(),        // Timestamp
    lastUsed: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_staff", ["staffId"])
    .index("by_credential", ["credentialId"])
    .index("by_branch", ["branchId"]),

  attendance_logs: defineTable({
    staffId: v.string(),
    staffName: v.string(),
    branchId: v.string(),
    action: v.union(v.literal("sign_in"), v.literal("sign_out")),
    timestamp: v.number(),
    verificationMethod: v.literal("webauthn"),
  })
    .index("by_staff", ["staffId"])
    .index("by_branch", ["branchId"])
    .index("by_date", ["timestamp"]),
});
```

## Security Considerations

### 1. HTTPS Required
WebAuthn only works over HTTPS. Ensure your deployment uses SSL certificates.

### 2. Credential Storage
- **Private keys** never leave the device
- **Public keys** stored in database are useless without the device
- No biometric data is ever transmitted or stored on server

### 3. Replay Attack Prevention
Each authentication includes a unique challenge that expires after use.

### 4. Device Binding
Credentials are bound to the specific device used for enrollment. Staff must re-enroll if changing devices.

## Fallback Mechanisms

### QR Code Fallback
If WebAuthn fails or device doesn't support it:

1. Tablet displays QR code with unique session token
2. Staff scans with personal phone
3. Phone performs WebAuthn authentication
4. Session token validated on tablet
5. Attendance logged

### Manual Override (Admin Only)
Admins can manually log attendance with audit trail.

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 67+ | ✅ Full |
| Safari | 13+ | ✅ Full |
| Firefox | 60+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Mobile Safari | 14.5+ | ✅ Face ID |
| Chrome Android | 70+ | ✅ Fingerprint |

## Testing

### Local Development
For local testing, use localhost (exempt from HTTPS requirement).

### Test Credentials
Use Chrome DevTools to simulate WebAuthn:
1. Open DevTools → More tools → WebAuthn
2. Enable virtual authenticator
3. Test enrollment and verification flows

## Troubleshooting

### "WebAuthn not supported"
- Check browser version
- Ensure HTTPS (except localhost)
- Verify device has biometric hardware

### "Enrollment failed"
- Check if biometrics are set up on device
- Ensure user allows camera/biometric access
- Try in incognito mode to rule out extensions

### "Verification failed"
- Confirm staff used same device for enrollment
- Check if credential was removed
- Verify network connectivity

## Migration from FaceIO

If migrating from FaceIO:

1. Keep FaceIO data during transition
2. Prompt staff to re-enroll with WebAuthn
3. Support both methods temporarily
4. Remove FaceIO after all staff migrated
5. Delete FaceIO account and API keys

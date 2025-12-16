# WashLab Integration Documentation

## Overview
WashLab is a campus laundry management system. This document covers the integrations needed for production deployment.

---

## 📱 Demo Credentials

| Portal | Credential | Value |
|--------|-----------|-------|
| Customer Account | Phone | `0551234567` |
| Customer Account | Password | `1234` |
| Staff Portal | Branch PIN | `1234` |
| Admin Dashboard | Password | `admin123` |
| Track Order | Order Code | `WL-4921` |
| Track Order | Phone | `0551234567` |

---

## 📋 Page Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Home page | Public |
| `/order` | Place order (5 steps) | Public |
| `/track` | Track order by code/phone | Public |
| `/account` | Customer login/signup | Public |
| `/staff` | Staff portal (Face ID) | Branch PIN |
| `/washstation` | Staff dashboard | After Face ID |
| `/admin` | Admin dashboard | Password |

---

## 1. Convex Backend Setup

### Installation
```bash
npm install convex
npx convex init
```

### Schema (convex/schema.ts)
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (for authentication)
  users: defineTable({
    phone: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    passwordHash: v.string(),
    role: v.union(v.literal("customer"), v.literal("staff"), v.literal("admin")),
  }).index("by_phone", ["phone"]),

  // Customer profiles (linked by phone)
  customerProfiles: defineTable({
    phone: v.string(),
    name: v.string(),
    hall: v.optional(v.string()),
    room: v.optional(v.string()),
    loyaltyPoints: v.number(),
  }).index("by_phone", ["phone"]),

  // Branches
  branches: defineTable({
    name: v.string(),
    location: v.string(),
    pricePerLoad: v.number(),
    deliveryFee: v.number(),
    overflowAllowance: v.number(), // default 1kg
    isActive: v.boolean(),
  }),

  // Staff members
  staff: defineTable({
    name: v.string(),
    phone: v.string(),
    branchId: v.id("branches"),
    role: v.union(v.literal("receptionist"), v.literal("admin")),
    faceId: v.optional(v.string()), // FaceIO facial ID
    isActive: v.boolean(),
  })
    .index("by_branch", ["branchId"])
    .index("by_phone", ["phone"]),

  // Orders
  orders: defineTable({
    code: v.string(),
    branchId: v.id("branches"),
    customerPhone: v.string(),
    bagCardNumber: v.optional(v.string()),
    status: v.string(), // pending_dropoff, checked_in, sorting, washing, drying, folding, ready, out_for_delivery, completed
    serviceType: v.string(), // wash_and_dry, wash_only, dry_only
    clothesCount: v.number(),
    hasWhites: v.boolean(),
    washWhitesSeparately: v.boolean(),
    weight: v.optional(v.number()),
    loads: v.optional(v.number()),
    totalPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
    // Timestamps for each stage
    checkedInAt: v.optional(v.number()),
    sortingAt: v.optional(v.number()),
    washingAt: v.optional(v.number()),
    dryingAt: v.optional(v.number()),
    foldingAt: v.optional(v.number()),
    readyAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    // Staff who handled each stage
    checkedInBy: v.optional(v.id("staff")),
    statusUpdatedBy: v.optional(v.id("staff")),
  })
    .index("by_code", ["code"])
    .index("by_phone", ["customerPhone"])
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"]),

  // Order items (for receipt)
  orderItems: defineTable({
    orderId: v.id("orders"),
    category: v.string(),
    quantity: v.number(),
  }).index("by_order", ["orderId"]),

  // Payments
  payments: defineTable({
    orderId: v.id("orders"),
    method: v.string(), // ussd, mobile_money, cash
    amount: v.number(),
    staffId: v.id("staff"),
    branchId: v.id("branches"),
    reference: v.optional(v.string()), // payment reference from gateway
  }),

  // Attendance logs
  attendanceLogs: defineTable({
    staffId: v.id("staff"),
    branchId: v.id("branches"),
    action: v.union(v.literal("sign_in"), v.literal("sign_out")),
  }),

  // Vouchers
  vouchers: defineTable({
    code: v.string(),
    phone: v.optional(v.string()), // if assigned to specific customer
    branchId: v.optional(v.id("branches")), // if branch-specific
    discountType: v.string(), // percentage, fixed, free_wash
    discountValue: v.number(),
    usageLimit: v.number(),
    usedCount: v.number(),
    validFrom: v.number(),
    validTo: v.number(),
    isActive: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_phone", ["phone"]),
});
```

### Environment Variables
```env
CONVEX_DEPLOYMENT=your-deployment-id
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## 2. FaceIO Integration (Face Recognition)

### Get API Credentials
1. Go to https://faceio.net
2. Sign up and create an application
3. Copy your Public ID (starts with "fio")

### Installation
Add the FaceIO script to your index.html:
```html
<script src="https://cdn.faceio.net/fio.js"></script>
```

### Setup (src/lib/faceio.ts)
```typescript
// FaceIO instance
let faceio: any = null;

export const initFaceIO = (publicId: string) => {
  if (typeof window !== 'undefined' && (window as any).faceIO) {
    faceio = new (window as any).faceIO(publicId);
  }
  return faceio;
};

// Enroll new face (for staff registration)
export const enrollFace = async (payload: { staffId: string; staffName: string }) => {
  if (!faceio) throw new Error("FaceIO not initialized");
  
  try {
    const response = await faceio.enroll({
      locale: "auto",
      payload: payload,
      userConsent: true,
      pictureQuality: 0.8,
    });
    
    return {
      facialId: response.facialId,
      timestamp: response.timestamp,
    };
  } catch (error: any) {
    handleFaceIOError(error);
    throw error;
  }
};

// Authenticate face (for sign-in and payment authorization)
export const authenticateFace = async () => {
  if (!faceio) throw new Error("FaceIO not initialized");
  
  try {
    const response = await faceio.authenticate({
      locale: "auto",
    });
    
    return {
      facialId: response.facialId,
      payload: response.payload, // Contains staffId, staffName
    };
  } catch (error: any) {
    handleFaceIOError(error);
    throw error;
  }
};

// Error handler
const handleFaceIOError = (error: any) => {
  const errorMessages: Record<number, string> = {
    1: "Permission denied - camera access required",
    2: "No faces detected in frame",
    3: "Unrecognized face",
    4: "Multiple faces detected",
    5: "Face PAD (anti-spoofing) failed",
    6: "Face already enrolled",
    7: "Invalid image input",
    8: "Minors not allowed",
    9: "Face mismatch",
    10: "Network error",
  };
  
  console.error("FaceIO Error:", errorMessages[error.code] || error.message);
};
```

### Usage in Component
```typescript
import { initFaceIO, authenticateFace, enrollFace } from "@/lib/faceio";

// Initialize on mount
useEffect(() => {
  initFaceIO("YOUR_FACEIO_PUBLIC_ID"); // Replace with your Public ID
}, []);

// Staff sign-in
const handleSignIn = async () => {
  try {
    const { payload } = await authenticateFace();
    // payload contains staffId and staffName
    console.log("Signed in:", payload.staffName);
    // Record attendance in database
  } catch (error) {
    console.error("Authentication failed");
  }
};

// Payment authorization
const handlePaymentAuth = async () => {
  try {
    const { payload } = await authenticateFace();
    // payload.staffId links payment to staff
    return payload.staffId;
  } catch (error) {
    throw new Error("Payment authorization failed");
  }
};

// New staff enrollment
const handleEnrollStaff = async (staffId: string, staffName: string) => {
  try {
    const { facialId } = await enrollFace({ staffId, staffName });
    // Save facialId to database
    return facialId;
  } catch (error) {
    console.error("Enrollment failed");
  }
};
```

---

## 3. WhatsApp Integration (Click-to-Send)

No API needed. Uses WhatsApp's URL scheme for free click-to-send messages.

### Utility Function (src/lib/whatsapp.ts)
```typescript
// Format phone number for WhatsApp (Ghana: +233)
const formatPhone = (phone: string): string => {
  // Remove leading 0 and add country code
  if (phone.startsWith("0")) {
    return `233${phone.slice(1)}`;
  }
  return phone;
};

// Send WhatsApp receipt
export const sendWhatsAppReceipt = (
  phone: string,
  orderCode: string,
  bagCard: string,
  items: { category: string; quantity: number }[],
  amount: number
) => {
  const itemsList = items.map(i => `• ${i.category} – ${i.quantity}`).join('\n');
  
  const message = `*WashLab Receipt – ${orderCode}*
*Bag Card: #${bagCard}*

*Items:*
${itemsList}

*Amount Paid:* ₵${amount}

Thank you for choosing WashLab! 🧺`;

  const formattedPhone = formatPhone(phone);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
};

// Send ready notification
export const sendWhatsAppReady = (phone: string, orderCode: string) => {
  const message = `Your WashLab order (${orderCode}) is ready.

Reply:
1 – Pickup
2 – Delivery`;

  const formattedPhone = formatPhone(phone);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
};

// Send delivery notification
export const sendWhatsAppDelivery = (phone: string, orderCode: string) => {
  const message = `Your WashLab order (${orderCode}) is on its way!

Our staff will deliver to your location shortly.`;

  const formattedPhone = formatPhone(phone);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
};
```

---

## 4. Payment Integration (Paystack/Hubtel USSD)

### Paystack Setup
```bash
npm install @paystack/inline-js
```

### Configuration (src/lib/paystack.ts)
```typescript
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxx"; // Get from Paystack dashboard

export const initializePayment = async ({
  email,
  amount,
  phone,
  reference,
  orderId,
  onSuccess,
  onClose,
}: {
  email: string;
  amount: number; // in pesewas (amount * 100)
  phone: string;
  reference: string;
  orderId: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) => {
  const PaystackPop = (await import("@paystack/inline-js")).default;
  const paystack = new PaystackPop();
  
  paystack.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email: email || `${phone}@washlab.com`, // Use phone as fallback
    amount: amount * 100, // Convert to pesewas
    currency: "GHS",
    ref: reference,
    channels: ["mobile_money", "ussd"], // MoMo and USSD only
    metadata: {
      phone,
      orderId,
    },
    onSuccess: (transaction) => {
      onSuccess(transaction.reference);
    },
    onCancel: onClose,
  });
};

// Generate unique reference
export const generatePaymentRef = (orderId: string) => {
  return `WL-${orderId}-${Date.now()}`;
};
```

### Get Paystack Credentials
1. Go to https://paystack.com
2. Sign up and verify your business
3. Get API keys from Settings > API Keys & Webhooks
4. Enable Mobile Money and USSD channels

---

## 5. Production Deployment Checklist

### Environment Variables Needed
```env
# Convex
CONVEX_DEPLOYMENT=
VITE_CONVEX_URL=

# FaceIO
VITE_FACEIO_PUBLIC_ID=

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
```

### Security Considerations
- [ ] Enable row-level security on all database tables
- [ ] Validate all user inputs server-side
- [ ] Implement rate limiting on API calls
- [ ] Use HTTPS only
- [ ] Sanitize WhatsApp messages
- [ ] Store only facial IDs, not actual face data
- [ ] Implement proper error handling

### Before Going Live
- [ ] Test all payment flows in Paystack sandbox
- [ ] Verify FaceIO face recognition accuracy
- [ ] Test WhatsApp messages on actual devices
- [ ] Set up monitoring and error tracking
- [ ] Configure branch-specific settings
- [ ] Train staff on the system
- [ ] Set up daily backup procedures

---

## 6. Quick Reference

### Order Status Flow
```
pending_dropoff → checked_in → sorting → washing → drying → folding → ready → [completed OR out_for_delivery → completed]
```

### Price Calculation
```typescript
const PRICE_PER_LOAD = 25; // GHS
const KG_PER_LOAD = 8;
const OVERFLOW_TOLERANCE = 1; // kg (configurable)

const calculateLoads = (weight: number) => {
  if (weight <= KG_PER_LOAD + OVERFLOW_TOLERANCE) return 1;
  return Math.ceil(weight / KG_PER_LOAD);
};

const calculatePrice = (weight: number, pricePerLoad: number = PRICE_PER_LOAD) => {
  return calculateLoads(weight) * pricePerLoad;
};
```

### Loyalty Points
```typescript
const POINTS_PER_ORDER = 1;
const POINTS_FOR_FREE_WASH = 10;

const addLoyaltyPoints = (currentPoints: number) => {
  return currentPoints + POINTS_PER_ORDER;
};

const checkFreeWashEligibility = (points: number) => {
  return points >= POINTS_FOR_FREE_WASH;
};

const redeemFreeWash = (currentPoints: number) => {
  if (currentPoints >= POINTS_FOR_FREE_WASH) {
    return currentPoints - POINTS_FOR_FREE_WASH;
  }
  return currentPoints;
};
```

### Item Categories (for receipts)
```typescript
const ITEM_CATEGORIES = [
  'Shirts',
  'T-Shirts',
  'Shorts',
  'Trousers',
  'Jeans',
  'Dresses',
  'Skirts',
  'Underwear',
  'Bras',
  'Socks',
  'Towels',
  'Bedsheets',
  'Jackets',
  'Hoodies',
  'Other',
];
```

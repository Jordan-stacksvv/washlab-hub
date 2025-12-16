# WashLab Integration Documentation

## Overview
WashLab is a campus laundry management system. This document covers the integrations needed for production deployment.

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
  customerProfiles: defineTable({
    phone: v.string(),
    name: v.string(),
    hall: v.string(),
    room: v.string(),
    loyaltyPoints: v.number(),
  }).index("by_phone", ["phone"]),

  orders: defineTable({
    code: v.string(),
    branchId: v.string(),
    customerPhone: v.string(),
    bagTag: v.optional(v.string()),
    status: v.string(),
    serviceType: v.string(),
    clothesCount: v.number(),
    hasWhites: v.boolean(),
    washWhitesSeparately: v.boolean(),
    weight: v.optional(v.number()),
    loads: v.optional(v.number()),
    totalPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_code", ["code"])
    .index("by_phone", ["customerPhone"])
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    category: v.string(),
    quantity: v.number(),
  }).index("by_order", ["orderId"]),

  payments: defineTable({
    orderId: v.id("orders"),
    method: v.string(),
    amount: v.number(),
    staffId: v.string(),
    branchId: v.string(),
  }),

  branches: defineTable({
    name: v.string(),
    location: v.string(),
    pricePerLoad: v.number(),
    deliveryFee: v.number(),
    isActive: v.boolean(),
  }),

  staff: defineTable({
    name: v.string(),
    branchId: v.id("branches"),
    role: v.string(),
    faceId: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_branch", ["branchId"]),

  attendanceLogs: defineTable({
    staffId: v.id("staff"),
    action: v.string(),
    branchId: v.id("branches"),
  }),

  vouchers: defineTable({
    code: v.string(),
    phone: v.optional(v.string()),
    branchId: v.optional(v.id("branches")),
    discountType: v.string(),
    discountValue: v.number(),
    usageLimit: v.number(),
    usedCount: v.number(),
    validFrom: v.number(),
    validTo: v.number(),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),
});
```

### Environment Variables
```env
CONVEX_DEPLOYMENT=your-deployment-id
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## 2. FaceIO Integration (Face Recognition)

### Installation
```bash
npm install @faceio/fiojs
```

### Setup (src/lib/faceio.ts)
```typescript
import faceIO from "@faceio/fiojs";

let faceio: faceIO | null = null;

export const initFaceIO = (publicId: string) => {
  faceio = new faceIO(publicId);
  return faceio;
};

export const enrollFace = async (staffId: string) => {
  if (!faceio) throw new Error("FaceIO not initialized");
  
  const response = await faceio.enroll({
    locale: "auto",
    payload: { staffId },
  });
  
  return response.facialId;
};

export const authenticateFace = async () => {
  if (!faceio) throw new Error("FaceIO not initialized");
  
  const response = await faceio.authenticate({
    locale: "auto",
  });
  
  return {
    facialId: response.facialId,
    staffId: response.payload.staffId,
  };
};
```

### Usage in Component
```typescript
import { initFaceIO, authenticateFace } from "@/lib/faceio";

// Initialize on mount
useEffect(() => {
  initFaceIO("YOUR_FACEIO_PUBLIC_ID");
}, []);

// Authenticate
const handleFaceAuth = async () => {
  try {
    const { staffId } = await authenticateFace();
    // Handle successful authentication
  } catch (error) {
    // Handle error
  }
};
```

### Get FaceIO Credentials
1. Go to https://faceio.net
2. Sign up and create an application
3. Copy your Public ID

---

## 3. WhatsApp Integration (Click-to-Send)

No API needed. Uses WhatsApp's URL scheme.

### Usage
```typescript
const sendWhatsAppMessage = (phone: string, message: string) => {
  // Remove leading 0 and add country code (Ghana: 233)
  const formattedPhone = phone.startsWith("0") 
    ? `233${phone.slice(1)}` 
    : phone;
    
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, "_blank");
};

// Example: Ready notification
sendWhatsAppMessage(
  "0551234567",
  `WashLab Order Update

Your order (WL-4921) is ready!
Bag Tag: #10

Reply:
1 - Pickup
2 - Delivery`
);
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
  onSuccess,
  onClose,
}: {
  email: string;
  amount: number; // in pesewas
  phone: string;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) => {
  const PaystackPop = (await import("@paystack/inline-js")).default;
  const paystack = new PaystackPop();
  
  paystack.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount,
    currency: "GHS",
    ref: reference,
    channels: ["mobile_money", "ussd"],
    metadata: {
      phone,
    },
    onSuccess: (transaction) => {
      onSuccess(transaction.reference);
    },
    onClose,
  });
};
```

### Get Paystack Credentials
1. Go to https://paystack.com
2. Sign up and verify your business
3. Get API keys from Settings > API Keys & Webhooks

---

## 5. Production Deployment Checklist

### Environment Variables Needed
```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# FaceIO
NEXT_PUBLIC_FACEIO_PUBLIC_ID=

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
```

### Security Considerations
- [ ] Enable RLS on all Convex tables
- [ ] Validate all user inputs
- [ ] Implement rate limiting on API calls
- [ ] Use HTTPS only
- [ ] Sanitize WhatsApp messages
- [ ] Implement proper error handling

### Before Going Live
- [ ] Test all payment flows in sandbox
- [ ] Verify FaceIO face recognition accuracy
- [ ] Test WhatsApp messages on actual devices
- [ ] Set up monitoring and error tracking
- [ ] Configure branch-specific settings
- [ ] Train staff on the system

---

## 6. Quick Reference

### Order Status Flow
```
pending_dropoff → checked_in → sorting → washing → drying → folding → ready → [pickup OR out_for_delivery] → completed
```

### Price Calculation
```typescript
const PRICE_PER_LOAD = 25; // GHS
const KG_PER_LOAD = 8;
const OVERFLOW_TOLERANCE = 1; // kg

const calculateLoads = (weight: number) => {
  if (weight <= KG_PER_LOAD + OVERFLOW_TOLERANCE) return 1;
  return Math.ceil(weight / KG_PER_LOAD);
};

const calculatePrice = (weight: number) => {
  return calculateLoads(weight) * PRICE_PER_LOAD;
};
```

### Loyalty Points
```typescript
const POINTS_PER_ORDER = 1;
const POINTS_FOR_FREE_WASH = 10;

const checkFreeWashEligibility = (points: number) => {
  return points >= POINTS_FOR_FREE_WASH;
};
```

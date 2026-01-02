# WashLab Code Change Locations Guide

This document maps all key functionality to specific file locations for easy backend integration with **Convex**.

## 🔐 Authentication & Enrollment

### WebAuthn Biometric Authentication
- **Hook**: `src/shared/hooks/useWebAuthn.ts`
- **Enrollment UI**: `src/pages/admin/EnrollmentPage.tsx`
- **Face Scan UI**: `src/washstation-app/pages/FaceScan.tsx`
- **Confirm Clock-In**: `src/washstation-app/pages/ConfirmClockIn.tsx`

**What to change for backend:**
```typescript
// In useWebAuthn.ts, replace localStorage with Convex queries/mutations:
// Line 14-27: getStoredCredentials() & storeCredential()

// Create convex/staffCredentials.ts:
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCredentials = query({
  args: { staffId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.staffId) {
      return await ctx.db
        .query("staffCredentials")
        .filter((q) => q.eq(q.field("staffId"), args.staffId))
        .collect();
    }
    return await ctx.db.query("staffCredentials").collect();
  },
});

export const storeCredential = mutation({
  args: {
    staffId: v.string(),
    staffName: v.string(),
    credentialId: v.string(),
    publicKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("staffCredentials", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

### Staff Enrollment
- **File**: `src/pages/admin/EnrollmentPage.tsx`
- **Storage**: Currently localStorage (`washlab_enrollments`)

**Backend integration:**
```typescript
// Replace localStorage with Convex mutation:
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const createEnrollment = useMutation(api.staffEnrollments.create);

// Line ~85-115: Replace localStorage.setItem with:
await createEnrollment({
  token: enrollmentToken,
  staffId: newStaffId,
  name: formData.name,
  phone: formData.phone,
  role: formData.role,
  branchId: formData.branch,
  webauthnCredential: credentialData,
});
```

---

## 💳 Payment Processing

### Hubtel Mobile Money
- **File**: `src/pages/WashStation.tsx`
- **Function**: `processPayment()` (Line ~202-222)

**Current mock:**
```typescript
if (method === 'hubtel' || method === 'momo') {
  toast.success(`USSD prompt sent...`);
}
```

**Replace with Convex action:**
```typescript
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

const initiatePayment = useAction(api.hubtel.initiatePayment);

const response = await initiatePayment({
  customerPhone: completedOrder.customerPhone,
  amount: completedOrder.totalPrice || 0,
  orderId: completedOrder.id,
  description: `WashLab Order ${completedOrder.code}`,
});
```

### WebAuthn Verification Before Payment
- **File**: `src/pages/WashStation.tsx`
- **Where**: Before calling `processPayment()` in payment flow

**Add:**
```typescript
// Before processing USSD payment, verify attendant
const { success, staffId } = await verifyStaff();
if (!success) {
  toast.error('Biometric verification required');
  return;
}
// Log who processed the payment
processPayment(method, staffId);
```

---

## 📊 Attendance & Shifts

### Clock In/Out
- **Clock In Confirmation**: `src/washstation-app/pages/ConfirmClockIn.tsx`
- **Clock Out/Shift Management**: `src/washstation-app/pages/ShiftManagement.tsx`
- **Storage**: Currently localStorage (`washlab_attendance_log`)

**Backend integration points:**

```typescript
// Create convex/attendance.ts:
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logAttendance = mutation({
  args: {
    staffId: v.string(),
    branchId: v.string(),
    action: v.string(), // 'clock_in', 'clock_out', 'break_start', 'break_end'
    shiftId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("attendanceLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getActiveStaff = query({
  args: { branchId: v.string() },
  handler: async (ctx, args) => {
    // Get staff who clocked in but haven't clocked out
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await ctx.db
      .query("attendanceLogs")
      .filter((q) => 
        q.and(
          q.eq(q.field("branchId"), args.branchId),
          q.gte(q.field("timestamp"), today.getTime()),
          q.eq(q.field("action"), "clock_in")
        )
      )
      .collect();
  },
});
```

### Active Staff Tracking
- **Dashboard**: `src/pages/WashStation.tsx` - Line ~107-109
- **Storage**: Currently sessionStorage (`washlab_active_staff`)

**For real-time sync with Convex:**
```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Real-time active staff subscription
const activeStaff = useQuery(api.attendance.getActiveStaff, {
  branchId: currentBranch.id,
});
```

---

## 📦 Order Management

### Order Creation
- **File**: `src/context/OrderContext.tsx`
- **Function**: `addOrder()` (Line ~varies)

**Backend integration:**
```typescript
// Create convex/orders.ts:
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    code: v.string(),
    customerPhone: v.string(),
    customerName: v.string(),
    items: v.array(v.object({
      serviceId: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    totalPrice: v.number(),
    orderType: v.string(),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      ...args,
      status: "pending_dropoff",
      paymentStatus: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});
```

### Order Display
- **WashStation Dashboard**: `src/pages/WashStation.tsx`
- **Customer Track Page**: `src/public-app/pages/Track.tsx`

---

## 🏢 Branch Management

### Branch List
- **File**: `src/washstation-app/pages/BranchEntry.tsx` - Line 10-15
- **Current**: Mock data `BRANCHES` array

**Replace with Convex query:**
```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const branches = useQuery(api.branches.list);

// In convex/branches.ts:
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("branches").collect();
  },
});
```

### Default Branch (Academic City)
- **Files to update when changing default:**
  - `src/washstation-app/pages/BranchEntry.tsx` - Line 11
  - `src/washstation-app/pages/ConfirmClockIn.tsx` - Line ~163
  - `src/pages/admin/EnrollmentPage.tsx` - Branch dropdown

---

## 📱 WhatsApp Integration

### Send Receipt
- **File**: `src/pages/WashStation.tsx`
- **Function**: `sendWhatsAppReceipt()` (Line ~224-231)

**Current (basic wa.me link):**
```typescript
window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
```

**Replace with Convex action:**
```typescript
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

const sendWhatsApp = useAction(api.whatsapp.sendMessage);

await sendWhatsApp({
  to: phone,
  template: 'order_confirmation',
  parameters: [...],
});
```

---

## 🗄️ Data Storage Locations

### localStorage Keys (Replace with Convex Tables)

| Key | Current Use | Convex Table |
|-----|------------|--------------|
| `washlab_webauthn_credentials` | Staff biometrics | `staffCredentials` |
| `washlab_enrollments` | Staff enrollments | `staffEnrollments` |
| `washlab_attendance_log` | Attendance records | `attendanceLogs` |
| `washlab_orders` | Order data | `orders` |

### sessionStorage Keys (Keep for Session)

| Key | Use | Notes |
|-----|-----|-------|
| `washlab_branch` | Current branch | Session-specific |
| `washlab_staff` | Current staff | Session-specific |
| `washlab_active_staff` | All active staff | Could sync with Convex |
| `washlab_pending_staff` | Pre-confirmation | Session-specific |

---

## 🔧 Configuration Files

### Pricing
- **File**: `src/config/pricing.ts`
- **Move to**: Convex `pricingConfig` table

### Theme/UI
- **File**: `src/index.css` - CSS variables
- **File**: `tailwind.config.ts` - Theme config

---

## 🚀 Convex Files to Create

1. **`convex/hubtel.ts`** - Process mobile money payments
2. **`convex/whatsapp.ts`** - Send WhatsApp messages
3. **`convex/http.ts`** - HTTP actions for callbacks/webhooks
4. **`convex/orders.ts`** - Order CRUD operations
5. **`convex/attendance.ts`** - Attendance tracking
6. **`convex/staffEnrollments.ts`** - Staff management
7. **`convex/branches.ts`** - Branch management
8. **`convex/staffCredentials.ts`** - WebAuthn credentials

---

## 📋 Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Staff & Authentication
  staffEnrollments: defineTable({
    name: v.string(),
    phone: v.string(),
    role: v.string(),
    branchId: v.string(),
    webauthnCredential: v.optional(v.any()),
    enrollmentToken: v.string(),
    enrolledAt: v.optional(v.number()),
    status: v.string(), // 'pending', 'active', 'inactive'
  }),
  
  staffCredentials: defineTable({
    staffId: v.string(),
    staffName: v.string(),
    credentialId: v.string(),
    publicKey: v.string(),
    createdAt: v.number(),
  }),
  
  // Attendance
  attendanceLogs: defineTable({
    staffId: v.string(),
    branchId: v.string(),
    action: v.string(), // 'clock_in', 'clock_out', 'break_start', 'break_end'
    timestamp: v.number(),
    shiftId: v.string(),
    notes: v.optional(v.string()),
  }),
  
  // Orders
  orders: defineTable({
    code: v.string(),
    customerPhone: v.string(),
    customerName: v.string(),
    items: v.array(v.object({
      serviceId: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    status: v.string(),
    totalPrice: v.number(),
    paymentStatus: v.string(),
    paymentMethod: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    processedBy: v.optional(v.string()),
    orderType: v.string(), // 'online', 'walkin'
    branchId: v.string(),
  }),
  
  // Branches
  branches: defineTable({
    name: v.string(),
    code: v.string(),
    address: v.optional(v.string()),
    isActive: v.boolean(),
  }),
  
  // Customers
  customers: defineTable({
    phone: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    loyaltyPoints: v.number(),
    createdAt: v.number(),
  }),
});
```

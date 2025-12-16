# Convex Backend Integration Guide

## Overview

This guide explains how to connect WashLab to a Convex backend for real-time data persistence, authentication, and multi-branch management.

---

## Step 1: Install Convex

```bash
npm install convex
npx convex dev
```

This creates a `convex/` folder in your project root.

---

## Step 2: Database Schema

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users/Customers
  users: defineTable({
    phone: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    hall: v.optional(v.string()),
    room: v.optional(v.string()),
    loyaltyPoints: v.number(),
    createdAt: v.number(),
  }).index("by_phone", ["phone"]),

  // Branches
  branches: defineTable({
    name: v.string(),
    location: v.string(),
    pricePerLoad: v.number(),
    deliveryFee: v.number(),
    isActive: v.boolean(),
  }),

  // Staff
  staff: defineTable({
    name: v.string(),
    phone: v.string(),
    branchId: v.id("branches"),
    role: v.union(v.literal("receptionist"), v.literal("admin")),
    faceId: v.optional(v.string()),
    isActive: v.boolean(),
    pin: v.optional(v.string()),
  }).index("by_branch", ["branchId"]),

  // Orders
  orders: defineTable({
    code: v.string(),
    branchId: v.id("branches"),
    customerPhone: v.string(),
    customerName: v.string(),
    hall: v.optional(v.string()),
    room: v.optional(v.string()),
    status: v.string(),
    serviceType: v.string(),
    bagCardNumber: v.optional(v.string()),
    weight: v.optional(v.number()),
    loads: v.optional(v.number()),
    totalPrice: v.optional(v.number()),
    hasWhites: v.boolean(),
    washSeparately: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    checkedInBy: v.optional(v.id("staff")),
    checkedInAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_phone", ["customerPhone"])
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"]),

  // Order Items
  orderItems: defineTable({
    orderId: v.id("orders"),
    category: v.string(),
    quantity: v.number(),
  }).index("by_order", ["orderId"]),

  // Payments
  payments: defineTable({
    orderId: v.id("orders"),
    branchId: v.id("branches"),
    staffId: v.id("staff"),
    method: v.union(
      v.literal("hubtel"),
      v.literal("mobile_money"),
      v.literal("cash")
    ),
    amount: v.number(),
    reference: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_branch", ["branchId"]),

  // Attendance
  attendance: defineTable({
    staffId: v.id("staff"),
    branchId: v.id("branches"),
    action: v.union(v.literal("sign_in"), v.literal("sign_out")),
    timestamp: v.number(),
    verificationMethod: v.optional(v.string()),
  })
    .index("by_staff", ["staffId"])
    .index("by_branch_date", ["branchId", "timestamp"]),

  // Vouchers
  vouchers: defineTable({
    code: v.string(),
    phone: v.optional(v.string()),
    branchId: v.optional(v.id("branches")),
    discountType: v.union(
      v.literal("percentage"),
      v.literal("fixed"),
      v.literal("free_wash")
    ),
    discountValue: v.number(),
    usageLimit: v.number(),
    usedCount: v.number(),
    validFrom: v.number(),
    validTo: v.number(),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  // Daily Reports (for reconciliation)
  dailyReports: defineTable({
    branchId: v.id("branches"),
    date: v.string(),
    washLoads: v.number(),
    dryLoads: v.number(),
    detergentUsed: v.number(),
    extraDetergent: v.number(),
    technicalFaults: v.number(),
    tokensUsed: v.number(),
    hubtelTotal: v.number(),
    cashTotal: v.number(),
    grandTotal: v.number(),
    staffIds: v.array(v.id("staff")),
    createdAt: v.number(),
  })
    .index("by_branch", ["branchId"])
    .index("by_date", ["date"]),
});
```

---

## Step 3: Convex Functions

### Orders Functions (`convex/orders.ts`)

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create new order
export const create = mutation({
  args: {
    code: v.string(),
    branchId: v.id("branches"),
    customerPhone: v.string(),
    customerName: v.string(),
    hall: v.optional(v.string()),
    room: v.optional(v.string()),
    serviceType: v.string(),
    hasWhites: v.boolean(),
    washSeparately: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("orders", {
      ...args,
      status: "pending_dropoff",
      bagCardNumber: undefined,
      weight: undefined,
      loads: undefined,
      totalPrice: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get orders by status
export const getByStatus = query({
  args: { 
    branchId: v.id("branches"),
    status: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

// Get order by code
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

// Check in order
export const checkIn = mutation({
  args: {
    orderId: v.id("orders"),
    bagCardNumber: v.string(),
    weight: v.number(),
    loads: v.number(),
    totalPrice: v.number(),
    staffId: v.id("staff"),
    items: v.array(v.object({
      category: v.string(),
      quantity: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { orderId, items, ...orderUpdates } = args;
    
    // Update order
    await ctx.db.patch(orderId, {
      ...orderUpdates,
      status: "checked_in",
      checkedInBy: args.staffId,
      checkedInAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add items
    for (const item of items) {
      await ctx.db.insert("orderItems", {
        orderId,
        category: item.category,
        quantity: item.quantity,
      });
    }

    return orderId;
  },
});

// Update order status
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
```

### Payments Functions (`convex/payments.ts`)

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record payment
export const record = mutation({
  args: {
    orderId: v.id("orders"),
    branchId: v.id("branches"),
    staffId: v.id("staff"),
    method: v.union(
      v.literal("hubtel"),
      v.literal("mobile_money"),
      v.literal("cash")
    ),
    amount: v.number(),
    reference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Get payments by branch and date
export const getByBranchAndDate = query({
  args: {
    branchId: v.id("branches"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startDate),
          q.lte(q.field("timestamp"), args.endDate)
        )
      )
      .collect();
  },
});

// Get totals by payment method
export const getTotalsByMethod = query({
  args: {
    branchId: v.id("branches"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const startOfDay = new Date(args.date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(args.date).setHours(23, 59, 59, 999);

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), startOfDay),
          q.lte(q.field("timestamp"), endOfDay)
        )
      )
      .collect();

    return {
      hubtel: payments
        .filter((p) => p.method === "hubtel")
        .reduce((sum, p) => sum + p.amount, 0),
      cash: payments
        .filter((p) => p.method === "cash")
        .reduce((sum, p) => sum + p.amount, 0),
      mobileMoney: payments
        .filter((p) => p.method === "mobile_money")
        .reduce((sum, p) => sum + p.amount, 0),
      total: payments.reduce((sum, p) => sum + p.amount, 0),
    };
  },
});
```

### Attendance Functions (`convex/attendance.ts`)

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Sign in
export const signIn = mutation({
  args: {
    staffId: v.id("staff"),
    branchId: v.id("branches"),
    verificationMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("attendance", {
      ...args,
      action: "sign_in",
      timestamp: Date.now(),
    });
  },
});

// Sign out
export const signOut = mutation({
  args: {
    staffId: v.id("staff"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("attendance", {
      ...args,
      action: "sign_out",
      timestamp: Date.now(),
    });
  },
});

// Get active staff for branch
export const getActiveStaff = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logs = await ctx.db
      .query("attendance")
      .withIndex("by_branch_date", (q) =>
        q.eq("branchId", args.branchId)
      )
      .filter((q) => q.gte(q.field("timestamp"), today.getTime()))
      .collect();

    // Find staff who signed in but haven't signed out
    const staffStatus = new Map();
    for (const log of logs) {
      staffStatus.set(log.staffId, log.action === "sign_in");
    }

    const activeStaffIds = Array.from(staffStatus.entries())
      .filter(([_, isActive]) => isActive)
      .map(([id]) => id);

    // Fetch staff details
    const activeStaff = await Promise.all(
      activeStaffIds.map((id) => ctx.db.get(id))
    );

    return activeStaff.filter(Boolean);
  },
});
```

---

## Step 4: React Integration

### Setup ConvexProvider (`src/main.tsx`)

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
```

### Using Convex in Components

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function WashStation() {
  const branchId = "your_branch_id"; // From context or URL
  
  // Real-time queries
  const pendingOrders = useQuery(api.orders.getByStatus, {
    branchId,
    status: "pending_dropoff",
  });
  
  const activeStaff = useQuery(api.attendance.getActiveStaff, { branchId });
  
  // Mutations
  const checkInOrder = useMutation(api.orders.checkIn);
  const updateStatus = useMutation(api.orders.updateStatus);
  
  const handleCheckIn = async (orderId: string, data: CheckInData) => {
    await checkInOrder({
      orderId,
      bagCardNumber: data.bagCard,
      weight: data.weight,
      loads: data.loads,
      totalPrice: data.totalPrice,
      staffId: currentStaffId,
      items: data.items,
    });
  };
  
  // ... rest of component
}
```

---

## Step 5: Environment Setup

Add to `.env.local`:

```
VITE_CONVEX_URL=https://your-project.convex.cloud
```

---

## Step 6: Migration from localStorage

Replace `OrderContext` calls with Convex queries/mutations:

| Current (OrderContext) | Convex Equivalent |
|------------------------|-------------------|
| `addOrder()` | `useMutation(api.orders.create)` |
| `updateOrder()` | `useMutation(api.orders.updateStatus)` |
| `getPendingOrders()` | `useQuery(api.orders.getByStatus)` |
| `getOrderByCode()` | `useQuery(api.orders.getByCode)` |

---

## Real-time Benefits

With Convex, you get:
- **Real-time updates**: All connected clients see changes instantly
- **Multi-device sync**: Staff at different tablets see same data
- **Offline support**: Changes sync when back online
- **Type safety**: Full TypeScript support throughout

---

## Files to Modify

1. `src/main.tsx` - Add ConvexProvider
2. `src/pages/WashStation.tsx` - Replace localStorage with Convex
3. `src/pages/OrderPage.tsx` - Use Convex mutation for order creation
4. `src/pages/TrackPage.tsx` - Use Convex query for order lookup
5. `src/pages/AdminDashboard.tsx` - Use Convex for all admin data
6. Remove `src/context/OrderContext.tsx` after migration

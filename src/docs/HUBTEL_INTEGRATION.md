# Hubtel Payment Integration Guide

> ⚠️ **Preview Mode**: Currently using mock data. Replace with actual Hubtel API calls when backend is ready.

## Overview

Hubtel provides USSD-based mobile money payment services in Ghana. This integration allows WashLab to:
- Send payment prompts to customers' phones
- Process MTN MoMo, Vodafone Cash, and AirtelTigo Money
- Receive payment confirmations

## Required Credentials

Store these in Convex environment variables (Settings → Environment Variables):
- `HUBTEL_CLIENT_ID` - Your Hubtel client ID
- `HUBTEL_CLIENT_SECRET` - Your Hubtel client secret
- `HUBTEL_MERCHANT_ACCOUNT_NUMBER` - Your merchant account

## API Endpoints

### 1. Initiate Payment

```typescript
// File: convex/hubtel.ts

import { action } from "./_generated/server";
import { v } from "convex/values";

const HUBTEL_BASE_URL = 'https://api.hubtel.com/v1';

export const initiatePayment = action({
  args: {
    customerPhone: v.string(),
    amount: v.number(),
    orderId: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.HUBTEL_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
    const accountNumber = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER;
    
    const response = await fetch(
      `${HUBTEL_BASE_URL}/merchantaccount/merchants/${accountNumber}/receive/mobilemoney`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CustomerMsisdn: args.customerPhone,
          Amount: args.amount,
          PrimaryCallbackUrl: 'https://yourapp.com/api/hubtel/callback',
          Description: args.description,
          ClientReference: args.orderId,
        }),
      }
    );
    
    return response.json();
  },
});
```

### 2. Payment Callback (HTTP Action)

Create an HTTP action to handle Hubtel callbacks:

```typescript
// File: convex/http.ts

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/hubtel-callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json();
    
    // Verify the payment status
    if (payload.Status === 'Success') {
      // Update order payment status via mutation
      await ctx.runMutation(api.orders.updatePaymentStatus, {
        orderId: payload.ClientReference,
        paymentStatus: 'paid',
        paymentMethod: 'hubtel',
      });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }),
});

export default http;
```

### 3. Order Mutation for Payment Status

```typescript
// File: convex/orders.ts

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updatePaymentStatus = mutation({
  args: {
    orderId: v.string(),
    paymentStatus: v.string(),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("_id"), args.orderId))
      .first();
    
    if (order) {
      await ctx.db.patch(order._id, {
        paymentStatus: args.paymentStatus,
        paymentMethod: args.paymentMethod,
        paidAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});
```

## Current Implementation Locations

### Files to Modify

1. **Payment Processing** - `src/pages/WashStation.tsx`
   - Line ~202-222: `processPayment()` function
   - Replace mock toast with actual Hubtel API call

2. **Order Context** - `src/context/OrderContext.tsx`
   - Add Hubtel payment status tracking
   - Add webhook response handling

3. **Create Convex Actions**
   - Path: `convex/hubtel.ts`
   - Path: `convex/http.ts` for callback handling

### Code Changes Required

```typescript
// In src/pages/WashStation.tsx, replace:
if (method === 'hubtel' || method === 'momo') {
  toast.success(`USSD prompt sent to ${completedOrder.customerPhone}`, {
    description: `Amount: ₵${completedOrder.totalPrice?.toFixed(2)} via Mobile Money`
  });
}

// With:
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const initiatePayment = useMutation(api.hubtel.initiatePayment);

if (method === 'hubtel' || method === 'momo') {
  try {
    const result = await initiatePayment({
      customerPhone: completedOrder.customerPhone,
      amount: completedOrder.totalPrice || 0,
      orderId: completedOrder.id,
      description: `WashLab Order ${completedOrder.code}`,
    });
    
    if (result.success) {
      toast.success(`USSD prompt sent to ${completedOrder.customerPhone}`);
    } else {
      toast.error('Payment initiation failed');
    }
  } catch (error) {
    toast.error('Payment service unavailable');
  }
}
```

## Testing

1. Use Hubtel's sandbox environment for testing
2. Test phone numbers: Use any valid Ghana phone number format
3. Sandbox transactions don't deduct real money

## Security Notes

- Never expose API credentials in frontend code
- Always process payments through Convex actions (server-side)
- Verify WebAuthn before initiating payments (already implemented)
- Log all payment attempts for audit purposes

## Error Handling

| Error Code | Meaning | Action |
|------------|---------|--------|
| 4010 | Invalid phone number | Validate phone format |
| 4011 | Insufficient funds | Notify customer |
| 4012 | Transaction declined | Ask customer to authorize |
| 5000 | Server error | Retry with backoff |

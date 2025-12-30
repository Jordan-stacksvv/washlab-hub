# Hubtel Payment Integration Guide

> ⚠️ **Preview Mode**: Currently using mock data. Replace with actual Hubtel API calls when backend is ready.

## Overview

Hubtel provides USSD-based mobile money payment services in Ghana. This integration allows WashLab to:
- Send payment prompts to customers' phones
- Process MTN MoMo, Vodafone Cash, and AirtelTigo Money
- Receive payment confirmations

## Required Credentials

Store these in Lovable Cloud secrets:
- `HUBTEL_CLIENT_ID` - Your Hubtel client ID
- `HUBTEL_CLIENT_SECRET` - Your Hubtel client secret
- `HUBTEL_MERCHANT_ACCOUNT_NUMBER` - Your merchant account

## API Endpoints

### 1. Initiate Payment

```typescript
// File: src/lib/hubtel.ts (create this file)

const HUBTEL_BASE_URL = 'https://api.hubtel.com/v1';

interface PaymentRequest {
  customerPhone: string;
  amount: number;
  orderId: string;
  description: string;
}

export async function initiatePayment(request: PaymentRequest) {
  const response = await fetch(`${HUBTEL_BASE_URL}/merchantaccount/merchants/{accountNumber}/receive/mobilemoney`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      CustomerMsisdn: request.customerPhone,
      Amount: request.amount,
      PrimaryCallbackUrl: 'https://yourapp.com/api/hubtel/callback',
      Description: request.description,
      ClientReference: request.orderId,
    }),
  });
  
  return response.json();
}
```

### 2. Payment Callback Webhook

Create an edge function to handle Hubtel callbacks:

```typescript
// Edge function: supabase/functions/hubtel-callback/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const payload = await req.json();
  
  // Verify the payment status
  if (payload.Status === 'Success') {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Update order payment status
    await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid',
        payment_method: 'hubtel',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payload.ClientReference);
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
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

3. **Create Edge Function**
   - Path: `supabase/functions/hubtel-callback/index.ts`
   - Handles payment confirmations from Hubtel

### Code Changes Required

```typescript
// In src/pages/WashStation.tsx, replace:
if (method === 'hubtel' || method === 'momo') {
  toast.success(`USSD prompt sent to ${completedOrder.customerPhone}`, {
    description: `Amount: ₵${completedOrder.totalPrice?.toFixed(2)} via Mobile Money`
  });
}

// With:
if (method === 'hubtel' || method === 'momo') {
  try {
    const result = await initiateHubtelPayment({
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
- Always process payments through edge functions
- Verify WebAuthn before initiating payments (already implemented)
- Log all payment attempts for audit purposes

## Error Handling

| Error Code | Meaning | Action |
|------------|---------|--------|
| 4010 | Invalid phone number | Validate phone format |
| 4011 | Insufficient funds | Notify customer |
| 4012 | Transaction declined | Ask customer to authorize |
| 5000 | Server error | Retry with backoff |

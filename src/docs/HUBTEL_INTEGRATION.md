# Hubtel/Paystack Payment Integration Guide

## Overview

WashLab supports multiple payment methods:
- **Hubtel USSD** - Customer receives USSD prompt on their phone
- **Mobile Money** - Direct MoMo transfer
- **Cash** - Manual cash payment logged by staff

---

## Option 1: Paystack Integration (Recommended)

Paystack is easier to integrate and supports Ghana Mobile Money.

### Step 1: Get API Keys

1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your **Secret Key** and **Public Key**

### Step 2: Add Secret to Lovable

Use the Lovable secrets feature to store `PAYSTACK_SECRET_KEY`.

### Step 3: Create Edge Function

Create `supabase/functions/initiate-payment/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  email: string;
  amount: number; // In pesewas (₵1 = 100 pesewas)
  phone: string;
  orderCode: string;
  orderId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount, phone, orderCode, orderId }: PaymentRequest = await req.json();
    
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    
    // Initialize transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email || `${phone}@washlab.gh`,
        amount: amount * 100, // Convert to pesewas
        currency: "GHS",
        mobile_money: {
          phone,
          provider: "mtn", // or "vodafone", "airteltigo"
        },
        metadata: {
          orderCode,
          orderId,
          custom_fields: [
            {
              display_name: "Order Code",
              variable_name: "order_code",
              value: orderCode,
            },
          ],
        },
        channels: ["mobile_money"],
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Step 4: Frontend Integration

```typescript
// src/lib/payment.ts

export interface PaymentInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export const initiatePayment = async (
  orderId: string,
  orderCode: string,
  phone: string,
  amount: number
): Promise<PaymentInitResponse> => {
  const response = await fetch("/functions/v1/initiate-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `${phone}@washlab.gh`,
      amount,
      phone,
      orderCode,
      orderId,
    }),
  });

  if (!response.ok) {
    throw new Error("Payment initialization failed");
  }

  return response.json();
};

export const generatePaymentRef = (): string => {
  return `WL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```

### Step 5: Payment Flow in WashStation

```typescript
// In WashStation.tsx

const handlePayment = async (order: Order) => {
  setIsProcessingPayment(true);
  
  try {
    // 1. Face ID verification first (if implemented)
    // await verifyStaffFace();
    
    // 2. Initiate payment
    const result = await initiatePayment(
      order.id,
      order.code,
      order.customerPhone,
      order.totalPrice
    );
    
    if (result.status) {
      toast.success("USSD sent to customer's phone!");
      
      // 3. Update order with payment reference
      updateOrder(order.id, {
        paymentReference: result.data.reference,
        paymentStatus: "pending",
      });
      
      // 4. Start polling for payment status
      startPaymentPolling(result.data.reference);
    }
  } catch (error) {
    toast.error("Payment failed. Try again.");
  } finally {
    setIsProcessingPayment(false);
  }
};
```

---

## Option 2: Hubtel Direct Integration

### API Setup

1. Sign up at [hubtel.com](https://hubtel.com)
2. Get your Client ID and Client Secret
3. Store in Lovable secrets

### Edge Function for Hubtel

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, amount, orderCode } = await req.json();
    
    const clientId = Deno.env.get("HUBTEL_CLIENT_ID");
    const clientSecret = Deno.env.get("HUBTEL_CLIENT_SECRET");
    const credentials = btoa(`${clientId}:${clientSecret}`);
    
    const response = await fetch(
      "https://api.hubtel.com/v1/merchantaccount/merchants/YOUR_MERCHANT_ID/receive/mobilemoney",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CustomerName: "WashLab Customer",
          CustomerMsisdn: phone,
          CustomerEmail: `${phone}@washlab.gh`,
          Channel: "mtn-gh", // or "vodafone-gh", "tigo-gh"
          Amount: amount,
          PrimaryCallbackUrl: "https://your-app.com/api/hubtel-callback",
          Description: `WashLab Order: ${orderCode}`,
          ClientReference: orderCode,
        }),
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## Payment Webhook Handler

Create webhook to receive payment confirmations:

```typescript
// supabase/functions/payment-webhook/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const payload = await req.json();
    
    // Verify webhook signature (Paystack)
    const hash = req.headers.get("x-paystack-signature");
    // ... verify hash with your secret
    
    if (payload.event === "charge.success") {
      const { reference, amount, metadata } = payload.data;
      
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      // Update order payment status
      await supabase
        .from("orders")
        .update({ 
          paymentStatus: "paid",
          paymentReference: reference,
          paidAt: new Date().toISOString(),
        })
        .eq("id", metadata.orderId);
      
      // Record payment
      await supabase.from("payments").insert({
        orderId: metadata.orderId,
        method: "mobile_money",
        amount: amount / 100, // Convert from pesewas
        reference,
        timestamp: new Date().toISOString(),
      });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

---

## Cash Payment Flow

For cash payments, no external integration needed:

```typescript
const handleCashPayment = async (order: Order, staffId: string) => {
  // Record payment in database
  await recordPayment({
    orderId: order.id,
    method: "cash",
    amount: order.totalPrice,
    staffId,
    timestamp: Date.now(),
  });
  
  // Update order status
  updateOrder(order.id, {
    paymentStatus: "paid",
    paidAt: new Date().toISOString(),
  });
  
  toast.success("Cash payment recorded!");
};
```

---

## UI Components

### Payment Modal

```tsx
// src/components/PaymentModal.tsx

const PaymentModal = ({ order, onClose, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cash'>('momo');
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment for {order.code}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-3xl font-bold text-center">
            ₵{order.totalPrice}
          </div>
          
          {/* Payment Method Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('momo')}
              className={`p-4 rounded-xl border-2 ${
                paymentMethod === 'momo' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <Phone className="w-8 h-8 mx-auto mb-2" />
              <span className="font-medium">Mobile Money</span>
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 rounded-xl border-2 ${
                paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <Banknote className="w-8 h-8 mx-auto mb-2" />
              <span className="font-medium">Cash</span>
            </button>
          </div>
          
          {/* Phone number for MoMo */}
          {paymentMethod === 'momo' && (
            <div>
              <Label>Customer Phone</Label>
              <Input value={order.customerPhone} disabled className="mt-1" />
            </div>
          )}
          
          {/* Process Button */}
          <Button 
            onClick={() => handlePayment(paymentMethod)}
            disabled={isProcessing}
            className="w-full h-14"
          >
            {isProcessing ? 'Processing...' : `Charge ₵${order.totalPrice}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Admin Reports: Cash vs Online

In AdminDashboard, show payment breakdown:

```typescript
// Query for payment totals
const paymentTotals = useQuery(api.payments.getTotalsByMethod, {
  branchId,
  date: selectedDate,
});

// Display in reconciliation
<div className="grid grid-cols-3 gap-4">
  <div className="bg-card p-4 rounded-xl">
    <p className="text-muted-foreground text-sm">Hubtel/MoMo</p>
    <p className="text-2xl font-bold text-emerald-600">
      ₵{paymentTotals?.hubtel || 0}
    </p>
  </div>
  <div className="bg-card p-4 rounded-xl">
    <p className="text-muted-foreground text-sm">Cash</p>
    <p className="text-2xl font-bold text-amber-600">
      ₵{paymentTotals?.cash || 0}
    </p>
  </div>
  <div className="bg-card p-4 rounded-xl">
    <p className="text-muted-foreground text-sm">Total</p>
    <p className="text-2xl font-bold text-primary">
      ₵{paymentTotals?.total || 0}
    </p>
  </div>
</div>
```

---

## Required Secrets

Add these to Lovable Cloud secrets:

| Secret Name | Description |
|-------------|-------------|
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key (optional, for frontend) |
| `HUBTEL_CLIENT_ID` | Hubtel client ID (if using Hubtel) |
| `HUBTEL_CLIENT_SECRET` | Hubtel client secret (if using Hubtel) |

---

## Testing

1. Use Paystack test mode with test API keys
2. Test phone numbers:
   - MTN: 0551234987
   - Vodafone: 0201234987
3. Amount must be at least ₵1 (100 pesewas)

# WhatsApp Business Integration Guide

> ⚠️ **Preview Mode**: Currently using basic `wa.me` links. Replace with WhatsApp Business API when backend is ready.

## Overview

WhatsApp integration for WashLab provides:
- Order confirmation receipts
- Status update notifications
- Customer support messaging
- Promotional messages (opt-in)

## Integration Options

### Option 1: Basic wa.me Links (Current - No Backend Required)

Current implementation using URL schemes:

```typescript
// Current implementation in src/pages/WashStation.tsx (line ~224-231)
const sendWhatsAppReceipt = (order: Order) => {
  const message = encodeURIComponent(
    `*WashLab Receipt – ${order.code}*\n*Amount Paid:* ₵${order.totalPrice?.toFixed(2)}\n\nThank you!`
  );
  const phone = order.customerPhone.startsWith('0') 
    ? `233${order.customerPhone.slice(1)}` 
    : order.customerPhone;
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};
```

### Option 2: WhatsApp Business API (Recommended for Production)

## Required Setup

1. **Meta Business Account**
   - Create at business.facebook.com
   - Verify your business

2. **WhatsApp Business API Access**
   - Apply at developers.facebook.com
   - Get phone number verified

3. **Required Environment Variables (Convex)**
   - `WHATSAPP_ACCESS_TOKEN` - API access token
   - `WHATSAPP_PHONE_NUMBER_ID` - Your business phone number ID
   - `WHATSAPP_BUSINESS_ACCOUNT_ID` - Business account ID
   - `WHATSAPP_VERIFY_TOKEN` - Webhook verification token

## API Implementation

### 1. Send Message Action

```typescript
// File: convex/whatsapp.ts

import { action } from "./_generated/server";
import { v } from "convex/values";

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export const sendMessage = action({
  args: {
    to: v.string(),
    template: v.string(),
    parameters: v.array(v.object({
      type: v.string(),
      text: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: args.to,
          type: 'template',
          template: {
            name: args.template,
            language: { code: 'en' },
            components: args.parameters,
          },
        }),
      }
    );
    
    return response.json();
  },
});
```

### 2. HTTP Action for Webhook

```typescript
// File: convex/http.ts (add to existing)

http.route({
  path: "/whatsapp-webhook",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Webhook verification
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new Response(challenge);
    }
    return new Response('Forbidden', { status: 403 });
  }),
});

http.route({
  path: "/whatsapp-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Handle incoming messages
    const payload = await request.json();
    console.log('Incoming WhatsApp message:', payload);
    
    // Process customer replies here
    // You can call mutations to store messages
    
    return new Response('OK');
  }),
});
```

### 3. Message Templates

Create these templates in Meta Business Suite:

#### order_confirmation
```
Hello {{1}}! 🧺

Your WashLab order #{{2}} has been received.

📦 Service: {{3}}
💰 Total: ₵{{4}}
⏰ Ready by: {{5}}

Track your order at: {{6}}

Thank you for choosing WashLab!
```

#### order_ready
```
Hi {{1}}! ✨

Great news! Your laundry order #{{2}} is ready for pickup at {{3}}.

🕐 Pickup hours: 8AM - 8PM

Don't forget your bag card!
```

#### payment_received
```
Payment Confirmed! ✅

Order: #{{1}}
Amount: ₵{{2}}
Method: {{3}}

Thank you for your payment!
```

## Current Implementation Locations

### Files to Modify

1. **Receipt Sending** - `src/pages/WashStation.tsx`
   - Line ~224-231: `sendWhatsAppReceipt()` function
   - Replace with API call

2. **Order Status Updates** - `src/context/OrderContext.tsx`
   - Add notification triggers on status changes

3. **Create Convex Actions**
   - Path: `convex/whatsapp.ts`
   - Path: `convex/http.ts` (add webhook routes)

### Code Changes Required

```typescript
// Replace in src/pages/WashStation.tsx:
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const sendWhatsAppMessage = useMutation(api.whatsapp.sendMessage);

// Current (basic):
const sendWhatsAppReceipt = (order: Order) => {
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};

// Production (API):
const sendWhatsAppReceipt = async (order: Order) => {
  try {
    const response = await sendWhatsAppMessage({
      to: formatGhanaPhone(order.customerPhone),
      template: 'order_confirmation',
      parameters: [
        { type: 'text', text: order.customerName },
        { type: 'text', text: order.code },
        { type: 'text', text: getServiceLabel(order) },
        { type: 'text', text: order.totalPrice?.toFixed(2) || '0' },
        { type: 'text', text: getEstimatedTime() },
        { type: 'text', text: `washlab.com/track/${order.id}` },
      ],
    });
    
    if (response.messages) {
      toast.success('Receipt sent via WhatsApp');
    }
  } catch (error) {
    // Fallback to wa.me link
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }
};
```

## Phone Number Formatting

```typescript
// Utility function for Ghana phone numbers
function formatGhanaPhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('233')) {
    return cleaned; // Already international format
  }
  if (cleaned.startsWith('0')) {
    return `233${cleaned.slice(1)}`; // Convert local to international
  }
  return `233${cleaned}`; // Assume local without leading 0
}
```

## Testing

1. Use Meta's test phone numbers during development
2. Test templates in sandbox before production
3. Verify webhook with test events

## Rate Limits

- Template messages: 1000/day per phone number
- Session messages: 100/day per user
- Business messages: Unlimited within 24hr window

## Error Handling

| Error Code | Meaning | Action |
|------------|---------|--------|
| 131047 | Template not found | Check template name |
| 131048 | Invalid phone format | Use international format |
| 131051 | Rate limit exceeded | Implement backoff |
| 500 | Server error | Retry with exponential backoff |

# WhatsApp Integration Guide

## Overview

WashLab uses WhatsApp's URL scheme for sending notifications to customers. This is a simple, no-API approach that works on all devices.

---

## Integration Points

### 1. Receipt After Payment (WashStation)

**Location:** `src/pages/WashStation.tsx` - `sendWhatsAppReceipt()` function

**Trigger:** After payment is confirmed

**Message Template:**
```
*WashLab Receipt – WL-4921*
*Bag Card: #10*

*Items:*
• Shirts – 3
• Shorts – 2
• Bras – 2

*Amount Paid:* ₵50

Thank you for choosing WashLab!
```

**Code:**
```typescript
const sendWhatsAppReceipt = (order: Order) => {
  const itemsList = order.items.map(i => `• ${i.category} – ${i.quantity}`).join('\n');
  const message = encodeURIComponent(
    `*WashLab Receipt – ${order.code}*\n*Bag Card: #${order.bagCardNumber}*\n\n*Items:*\n${itemsList}\n\n*Amount Paid:* ₵${order.totalPrice}\n\nThank you for choosing WashLab!`
  );
  const phone = order.customerPhone.startsWith('0') 
    ? `233${order.customerPhone.slice(1)}` 
    : order.customerPhone;
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};
```

---

### 2. Order Ready Notification

**Location:** `src/pages/WashStation.tsx` - `sendWhatsAppReady()` function

**Trigger:** When order status changes to "ready"

**Message Template:**
```
Your WashLab order (WL-4921) is ready!

Reply:
1 – Pickup at WashLab
2 – Delivery to your hall/room
```

**Code:**
```typescript
const sendWhatsAppReady = (order: Order) => {
  const message = encodeURIComponent(
    `Your WashLab order (${order.code}) is ready!\n\nReply:\n1 – Pickup at WashLab\n2 – Delivery to your hall/room`
  );
  const phone = order.customerPhone.startsWith('0') 
    ? `233${order.customerPhone.slice(1)}` 
    : order.customerPhone;
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};
```

---

### 3. Delivery Confirmation

**Location:** `src/pages/WashStation.tsx`

**Trigger:** When order is marked "out_for_delivery"

**Message Template:**
```
Your WashLab order (WL-4921) is on its way!

Our delivery person will reach you shortly.
Bag Card: #10

Please have your bag card ready for verification.
```

---

## Phone Number Formatting

Ghana phone numbers need to be converted to international format:

```typescript
const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove any spaces or dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Convert 0XX to 233XX
  if (cleaned.startsWith('0')) {
    return `233${cleaned.slice(1)}`;
  }
  
  // Already has country code
  if (cleaned.startsWith('233')) {
    return cleaned;
  }
  
  // Assume Ghana if no prefix
  return `233${cleaned}`;
};
```

---

## Utility Functions (Add to `src/lib/whatsapp.ts`)

```typescript
// WhatsApp utility functions for WashLab

export const formatPhoneForWhatsApp = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('0')) {
    return `233${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith('233')) {
    return cleaned;
  }
  return `233${cleaned}`;
};

export const sendWhatsAppMessage = (phone: string, message: string) => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
};

export const createReceiptMessage = (order: {
  code: string;
  bagCardNumber: string;
  items: { category: string; quantity: number }[];
  totalPrice: number;
}): string => {
  const itemsList = order.items
    .map(i => `• ${i.category} – ${i.quantity}`)
    .join('\n');
  
  return `*WashLab Receipt – ${order.code}*
*Bag Card: #${order.bagCardNumber}*

*Items:*
${itemsList}

*Amount Paid:* ₵${order.totalPrice}

Thank you for choosing WashLab!`;
};

export const createReadyMessage = (order: { code: string }): string => {
  return `Your WashLab order (${order.code}) is ready!

Reply:
1 – Pickup at WashLab
2 – Delivery to your hall/room`;
};

export const createDeliveryMessage = (order: { 
  code: string; 
  bagCardNumber: string 
}): string => {
  return `Your WashLab order (${order.code}) is on its way!

Our delivery person will reach you shortly.
Bag Card: #${order.bagCardNumber}

Please have your bag card ready for verification.`;
};
```

---

## UI Implementation

### Button in Order Card (WashStation)

```tsx
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => sendWhatsAppReceipt(order)}
  className="gap-2"
>
  <MessageCircle className="w-4 h-4" />
  Send Receipt
</Button>
```

### Notify Customer Button (Ready Orders)

```tsx
<Button 
  onClick={() => sendWhatsAppReady(order)}
  className="w-full bg-emerald-500 hover:bg-emerald-600"
>
  <MessageCircle className="w-4 h-4 mr-2" />
  Notify Customer
</Button>
```

---

## Where WhatsApp is Used

| Page | Function | Trigger |
|------|----------|---------|
| WashStation | `sendWhatsAppReceipt` | After payment confirmed |
| WashStation | `sendWhatsAppReady` | Order status → ready |
| WashStation | `sendWhatsAppDelivery` | Order status → out_for_delivery |
| TrackPage | Contact button | Manual customer action |

---

## Testing

1. Use a test phone number (your own)
2. Place an order with that phone
3. Process through WashStation
4. Click "Send Receipt" → Should open WhatsApp with pre-filled message
5. Mark as ready → Click "Notify" → Should open WhatsApp

---

## Notes

- WhatsApp Web must be logged in for desktop
- Mobile devices open WhatsApp app directly
- No API key required for this approach
- Messages are NOT sent automatically - staff must click send in WhatsApp

## Future Enhancement: WhatsApp Business API

For automatic sending without staff interaction, integrate WhatsApp Business API:

1. Register for WhatsApp Business API
2. Create message templates in Business Manager
3. Use Twilio or direct API for sending
4. Replace `window.open()` with API calls in edge functions

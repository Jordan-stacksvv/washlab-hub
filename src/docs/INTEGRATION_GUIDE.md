# WashLab Integration Guide

## Overview
WashLab is a campus laundry management system. This document covers the current integrations and future integration options.

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
| `/staff` | Staff portal | Branch PIN |
| `/washstation` | Walk-in order processing | Staff access |
| `/admin` | Admin dashboard | Password |

---

## Current State Management

Orders are currently stored in **localStorage** via `OrderContext`. For production deployment, integrate with **Convex** for real-time data sync.

---

## WhatsApp Integration (Click-to-Send)

Currently implemented using WhatsApp's URL scheme for free click-to-send messages.

### Utility Function
```typescript
// Format phone number for WhatsApp (Ghana: +233)
const formatPhone = (phone: string): string => {
  if (phone.startsWith("0")) {
    return `233${phone.slice(1)}`;
  }
  return phone;
};

// Send WhatsApp receipt
export const sendWhatsAppReceipt = (
  phone: string,
  orderCode: string,
  amount: number
) => {
  const message = `*WashLab Receipt – ${orderCode}*
*Amount Paid:* ₵${amount}

Thank you for choosing WashLab! 🧺`;

  const formattedPhone = formatPhone(phone);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
};
```

---

## Pricing

| Service | Price |
|---------|-------|
| Wash Only | ₵25 per 5kg load |
| Wash & Dry | ₵50 per 5kg load |
| Dry Only | ₵25 per 5kg load |

### Price Calculation
```typescript
const serviceTypes = [
  { id: 'wash_only', label: 'Wash Only', price: 25 },
  { id: 'wash_and_dry', label: 'Wash & Dry', price: 50 },
  { id: 'dry_only', label: 'Dry Only', price: 25 },
];

const calculatePrice = (weight: number, servicePrice: number) => {
  // Price per 5kg
  const loads = Math.ceil(weight / 5);
  return loads * servicePrice;
};
```

---

## Order Status Flow
```
pending_dropoff → checked_in → sorting → washing → drying → folding → ready → completed
```

---

## Backend Integration (Convex)

### 1. Database (Convex)
- Real-time order sync across devices
- Persistent storage
- User authentication
- Reactive queries (auto-updates UI)

### 2. Payment Gateway (Hubtel)
- Mobile Money payments
- USSD integration
- Card payments
- See `HUBTEL_INTEGRATION.md` for details

### 3. Staff Authentication
- PIN-based login (current)
- WebAuthn/Face ID for biometric verification
- See `CODE_CHANGE_LOCATIONS.md` for implementation details

---

## Quick Reference

### Loyalty Points
```typescript
const POINTS_PER_ORDER = 1;
const POINTS_FOR_FREE_WASH = 10;
```

### Order Types
- `online` - Placed via website
- `walkin` - Created at WashStation

### Payment Methods
- `mobile_money` - MTN/Vodafone Mobile Money
- `card` - Card payment
- `cash` - Physical cash

---

## Getting Started with Convex

### 1. Install Convex
```bash
npm install convex
npx convex dev
```

### 2. Create Schema
See `CODE_CHANGE_LOCATIONS.md` for the full Convex schema.

### 3. Setup Provider
```typescript
// src/main.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
);
```

### 4. Use in Components
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Read data (reactive)
const orders = useQuery(api.orders.list);

// Write data
const createOrder = useMutation(api.orders.create);
await createOrder({ ... });
```

# WashLab - Complete Project Documentation

## Overview

WashLab is a campus laundry management system designed for students. It handles online ordering, walk-in customers, order tracking, staff management, payment processing, and WebAuthn-based staff attendance.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER FACING                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Landing Page   │   Order Page    │      Track Page             │
│  (Marketing)    │  (Place Order)  │   (Order Status)            │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ORDER CONTEXT                            │
│              (Shared State - localStorage)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STAFF FACING                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   WashStation   │   Staff Login   │     Admin Dashboard         │
│  (Operations)   │  (Attendance)   │    (Management)             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

---

## Page Directory

### 1. PUBLIC PAGES

#### Landing Page (`/`)
**Purpose:** Marketing, brand trust, conversion

**Features:**
- Animated phone slideshow showing WashLab process
- How It Works (3 steps)
- Why Students Love WashLab benefits
- Branch locations with status
- Pricing cards (Wash Only: ₵25, Wash & Dry: ₵50, Dry Only: ₵25)
- CTA buttons (Start Laundry, Track Order)

---

#### Order Page (`/order`)
**Purpose:** Online order creation

**Flow:**
1. Service Selection (Wash & Dry, Wash Only, Dry Only)
2. Clothes Count
3. Whites Handling
4. Customer Info (Phone, Name, Hall, Room)
5. Summary & Order Code Generation

**Key Features:**
- Generates unique order code (WL-XXXX)
- Stores order in OrderContext

---

#### Track Page (`/track`)
**Purpose:** Order status visibility

**Features:**
- Search by order code or phone
- Visual progress indicator
- Status timeline
- Payment status

---

#### Customer Account (`/account`)
**Purpose:** Loyalty & history

**Features:**
- Order history
- Loyalty points
- Available vouchers
- Profile management

---

### 2. STAFF PAGES

#### WashStation Dashboard (`/washstation`)
**Purpose:** Main operations hub for walk-in orders

**Authentication Flow:**
1. **Branch Code Entry** - Staff enters branch code (e.g., 001, 002, 003)
2. **WebAuthn Verification** - Face ID / fingerprint verification
3. **Dashboard Access** - Once authenticated, full access to operations

**Walk-In Order Flow:**
1. Phone Entry - Customer phone lookup/registration
2. Order Details - Service type, weight, item count
3. Delivery Selection - Pickup or delivery
4. Order Summary - Review before payment
5. Payment - Mobile Money, Card, or Cash
6. Confirmation - Order created

**Features:**
- Branch-locked session (no logout required)
- Dashboard with stats (Orders Today, Walk-ins, Online, Completed, Delivered)
- New Walk-In Order button
- Find Customer search
- Online Orders queue
- Recent Activity feed
- **Attendance Button** - Staff check-in/check-out via Face ID
- Link to Admin Dashboard
- Dark/Light theme toggle
- Notifications for new orders

---

#### Staff Login (`/staff`)
**Purpose:** Staff authentication & attendance

**Features:**
- PIN backup
- Attendance logging
- WebAuthn enrollment

---

#### Admin Dashboard (`/admin`)
**Purpose:** Business management

**Sections:**
- **Overview** - Revenue stats (Today, Cash, Online, Total)
- **Branches** - Add/edit branch locations with pricing
- **Staff** - Add staff, send enrollment links via WhatsApp
- **Attendance** - View staff check-in/check-out logs
- **Vouchers** - Create and manage discount codes
- **Loyalty** - Customer points tracking
- **Reports** - PDF/Excel export by date
- **WhatsApp** - Broadcast messaging

---

## Pricing

| Service | Price per 8kg Load |
|---------|-------------------|
| Wash Only | ₵25 |
| Wash & Dry | ₵50 |
| Dry Only | ₵25 |

---

## WebAuthn Staff Attendance System

### Overview
The system uses WebAuthn (Face ID / fingerprint) for staff verification without storing biometric data.

### Key Components

#### BranchLogin Component
- Displayed on WashStation before authentication
- Validates branch code
- Triggers WebAuthn verification
- Logs first staff check-in

#### AttendanceButton Component
- Available on WashStation header after login
- Any staff can check-in/check-out via Face ID
- Auto-detects if staff is already checked in
- Records attendance with timestamp

### Data Model

```typescript
// Staff Enrollment (localStorage for demo)
interface WebAuthnCredential {
  id: string;
  staffName: string;
  credentialId: string;
  publicKey: string;
  createdAt: Date;
}

// Attendance Record (localStorage for demo)
interface AttendanceRecord {
  staffId: string;
  staffName: string;
  type: 'check_in' | 'check_out';
  timestamp: Date;
  branchCode: string;
}
```

### Flow Summary

1. **First Staff of Day:**
   - Enter Branch Code → Face ID → Check-in → Dashboard

2. **Additional Staff Check-in:**
   - Tap "Attendance" button → Face ID → Check-in logged

3. **Staff Check-out:**
   - Same "Attendance" button → Face ID → Check-out logged

4. **Payment Verification (Future):**
   - Before USSD → Face ID confirms staff identity

---

## Order Statuses

```typescript
type OrderStatus = 
  | 'pending_dropoff'   // Awaiting customer arrival
  | 'checked_in'        // Received, weighed, priced
  | 'sorting'           // Categorizing clothes
  | 'washing'           // In wash machine
  | 'drying'            // In dryer
  | 'folding'           // Being folded
  | 'ready'             // Ready for pickup/delivery
  | 'out_for_delivery'  // Being delivered
  | 'completed';        // Order finished
```

---

## Payment Methods

- **Mobile Money (MTN/Vodafone):** USSD prompt sent to customer phone
- **Card:** Card payment at station
- **Cash:** Physical payment

---

## File Structure

```
src/
├── assets/              # Images, logos
├── components/
│   ├── ui/              # shadcn components
│   ├── AttendanceButton.tsx  # Staff attendance
│   ├── BranchLogin.tsx       # Branch authentication
│   ├── Logo.tsx
│   ├── Navbar.tsx
│   ├── PhoneSlideshow.tsx
│   ├── StatusBadge.tsx
│   └── ...
├── context/
│   └── OrderContext.tsx # Shared order state
├── docs/
│   ├── INTEGRATION_GUIDE.md
│   └── PROJECT_DOCUMENTATION.md
├── hooks/
│   ├── useWebAuthn.ts   # WebAuthn hook
│   └── use-toast.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── Index.tsx        # Landing page
│   ├── OrderPage.tsx    # Place order
│   ├── TrackPage.tsx    # Track order
│   ├── WashStation.tsx  # Staff operations (branch login + walk-in flow)
│   ├── StaffLogin.tsx   # Staff auth
│   ├── AdminDashboard.tsx
│   └── CustomerAccount.tsx
├── types/
│   └── index.ts         # TypeScript types
└── App.tsx              # Routes
```

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Index | Landing page |
| `/order` | OrderPage | Place new order |
| `/track` | TrackPage | Track existing order |
| `/account` | CustomerAccount | Customer dashboard |
| `/staff` | StaffLogin | Staff authentication |
| `/washstation` | WashStation | Branch login + Walk-in order processing |
| `/admin` | AdminDashboard | Business management |

---

## Design System

### Colors
- **Primary:** WashLab Blue (220 65% 44%)
- **Accent:** WashLab Orange/Yellow (38 90% 55%)
- **Success:** Green for completed states
- **Destructive:** Red for errors/alerts

### Fonts
- **Display:** Outfit
- **Body:** Plus Jakarta Sans

---

## State Management

Orders are managed through `OrderContext` which provides:
- `addOrder()` - Create new order
- `updateOrder()` - Update order fields
- `getOrderByCode()` - Find by order code
- `getPendingOrders()` - Orders awaiting drop-off
- `getActiveOrders()` - Orders in process
- `getReadyOrders()` - Completed orders
- Revenue calculation functions

Data is persisted to localStorage.

---

## Demo Credentials

| Component | Credential |
|-----------|------------|
| Branch Codes | 001, 002, 003 |
| Admin Password | admin123 |
| Customer Account | Phone: 0551234567, Password: 1234 |

---

## Future Enhancements

- Backend database integration (Supabase)
- Real Hubtel payment processing
- Multi-branch geo-validation
- WhatsApp Business API integration
- Supervisor override for attendance
- QR code fallback for attendance
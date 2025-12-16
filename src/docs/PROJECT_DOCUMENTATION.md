# WashLab - Complete Project Documentation

## Overview

WashLab is a campus laundry management system designed for students. It handles online ordering, walk-in customers, order tracking, staff management, and payment processing.

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
│              (Shared State - localStorage/Convex)               │
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
- Pricing cards
- CTA buttons (Start Laundry, Track Order)

**Components:**
- `PhoneSlideshow` - Animated phone mockup
- `Navbar` - Navigation
- `Logo` - Brand logo

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
- No payment at this stage

---

#### Track Page (`/track`)
**Purpose:** Order status visibility

**Features:**
- Search by order code or phone
- Visual progress indicator
- Status timeline
- Payment status
- Pickup/Delivery info

---

#### Customer Account (`/account`)
**Purpose:** Loyalty & history (optional)

**Features:**
- Order history
- Loyalty points
- Available vouchers
- Profile management

---

### 2. STAFF PAGES

#### WashStation Dashboard (`/washstation`)
**Purpose:** Main operations hub

**Sections:**
- **Quick Actions Grid:**
  - New Walk-in
  - Check-in Order (with pending count)
  - In Progress (with active count)
  - Ready Orders (with ready count)

- **Pending Drop-offs:** Orders waiting for customer arrival
- **Active Orders:** Orders being processed
- **Ready Orders:** Completed, awaiting pickup

**Features:**
- Real-time order counts
- Toast notifications for new orders
- Search by code/phone
- Staff attendance (Sign In/Out with FaceIO)

**Views:**
- Dashboard (main)
- Check-in (weigh, tag, categorize)
- Walk-in (create new order)
- Order Detail (full order management)
- Pending List
- In Progress List
- Ready List
- Staff Sign-in

---

#### Staff Login (`/staff`)
**Purpose:** Staff authentication & attendance

**Features:**
- Face ID sign-in/sign-out
- PIN backup
- Attendance logging
- Dashboard lock when no staff signed in

---

#### Admin Dashboard (`/admin`)
**Purpose:** Business management

**Sections:**
- Revenue Overview (Cash vs Online)
- Order Statistics
- Branch Performance
- Staff Attendance
- Reconciliation Reports
- Voucher Management

---

## Data Flow

### Order Lifecycle

```
1. ORDER CREATED
   └── Online: Customer places order on /order
   └── Walk-in: Staff creates on WashStation

2. PENDING DROP-OFF
   └── Customer brings clothes to WashStation

3. CHECK-IN
   └── Staff weighs clothes
   └── Assigns bag card number
   └── Categorizes items
   └── Calculates price

4. PAYMENT
   └── FaceIO authorization (staff)
   └── USSD sent to customer (Hubtel)
   └── Payment confirmed
   └── WhatsApp receipt sent

5. PROCESSING
   └── Sorting → Washing → Drying → Folding

6. READY
   └── WhatsApp notification sent
   └── Customer chooses pickup/delivery

7. COMPLETED
   └── Pickup: Customer collects with bag card
   └── Delivery: Staff delivers to hall
```

---

## State Management

### OrderContext

**Location:** `src/context/OrderContext.tsx`

**State:**
```typescript
interface Order {
  id: string;
  code: string;
  customerPhone: string;
  customerName: string;
  hall: string;
  room: string;
  status: OrderStatus;
  serviceType?: string;
  bagCardNumber: string | null;
  items: OrderItem[];
  totalPrice: number | null;
  weight: number | null;
  loads: number | null;
  hasWhites?: boolean;
  washSeparately?: boolean;
  notes?: string;
  createdAt: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  paidAt?: Date;
  paidAmount?: number;
  checkedInBy?: string;
  processedBy?: string;
  orderType: 'online' | 'walkin';
}
```

**Methods:**
- `addOrder()` - Create new order
- `updateOrder()` - Update order fields
- `getOrderByCode()` - Find by order code
- `getOrderByPhone()` - Find by phone
- `getPendingOrders()` - Orders awaiting drop-off
- `getActiveOrders()` - Orders in process
- `getReadyOrders()` - Completed orders
- `getTotalRevenue()` - Sum of all paid amounts
- `getCashRevenue()` - Cash payments only
- `getOnlineRevenue()` - Hubtel/MoMo payments

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

```typescript
type PaymentMethod = 'cash' | 'hubtel' | 'momo' | 'pending';
```

**Flow:**
1. Staff authorizes payment with FaceIO
2. System sends USSD to customer phone (Hubtel)
3. Customer approves on their phone
4. Callback confirms payment
5. Receipt sent via WhatsApp

---

## Integrations

### 1. FaceIO (Face Recognition)
- **Staff Attendance:** Sign-in/Sign-out
- **Payment Authorization:** Before charging customer
- See: `src/docs/FACEIO_INTEGRATION.md`

### 2. Hubtel (Payments)
- USSD prompt for MoMo payments
- Callback handling for confirmation
- See: `src/docs/HUBTEL_INTEGRATION.md`

### 3. WhatsApp
- Order receipt after payment
- Ready notification
- Click-to-send (wa.me links)
- See: `src/docs/WHATSAPP_INTEGRATION.md`

### 4. Convex (Backend)
- Real-time database
- Order sync across devices
- See: `src/docs/CONVEX_INTEGRATION.md`

---

## Pricing Logic

```typescript
const calculatePrice = (weight: number) => {
  const PRICE_PER_LOAD = 25; // GHS
  const KG_PER_LOAD = 8;
  
  // First 9kg = 1 load
  const loads = weight <= 9 ? 1 : Math.ceil(weight / KG_PER_LOAD);
  
  return {
    loads,
    totalPrice: loads * PRICE_PER_LOAD
  };
};
```

---

## File Structure

```
src/
├── assets/              # Images, logos
├── components/
│   ├── ui/              # shadcn components
│   ├── Logo.tsx
│   ├── Navbar.tsx
│   ├── PhoneSlideshow.tsx
│   ├── StatusBadge.tsx
│   └── ...
├── context/
│   └── OrderContext.tsx # Shared order state
├── docs/
│   ├── CONVEX_INTEGRATION.md
│   ├── FACEIO_INTEGRATION.md
│   ├── HUBTEL_INTEGRATION.md
│   ├── INTEGRATION_GUIDE.md
│   ├── PROJECT_DOCUMENTATION.md
│   └── WHATSAPP_INTEGRATION.md
├── hooks/
│   └── use-toast.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── Index.tsx        # Landing page
│   ├── OrderPage.tsx    # Place order
│   ├── TrackPage.tsx    # Track order
│   ├── WashStation.tsx  # Staff operations
│   ├── StaffLogin.tsx   # Staff auth
│   ├── AdminDashboard.tsx
│   └── CustomerAccount.tsx
├── types/
│   └── index.ts         # TypeScript types
└── App.tsx              # Routes
```

---

## Deployment Checklist

### Environment Variables
```
VITE_FACEIO_PUBLIC_ID=xxx
VITE_HUBTEL_CLIENT_ID=xxx
VITE_HUBTEL_CLIENT_SECRET=xxx
VITE_CONVEX_URL=xxx
```

### Pre-Deploy
- [ ] Test all order flows end-to-end
- [ ] Verify FaceIO enrollment for all staff
- [ ] Test Hubtel payment flow
- [ ] Confirm WhatsApp links work
- [ ] Check mobile responsiveness
- [ ] Validate admin reports

### Post-Deploy
- [ ] Monitor error logs
- [ ] Test real payments (small amounts)
- [ ] Verify notifications arriving
- [ ] Check attendance logging

---

## Common Issues & Solutions

### Orders not showing on WashStation
- Check OrderContext is wrapping App
- Verify localStorage has orders
- Check status filters

### FaceIO not working
- Camera permissions required
- Check Public ID in env
- Try different browser

### Payments failing
- Verify Hubtel credentials
- Check callback URL is accessible
- Customer must have MoMo balance

### WhatsApp not opening
- Phone number format must be international (233...)
- URL encoding required for message

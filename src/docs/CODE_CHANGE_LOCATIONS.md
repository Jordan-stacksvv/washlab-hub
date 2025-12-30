# WashLab Code Change Locations Guide

This document maps all key functionality to specific file locations for easy backend integration.

## 🔐 Authentication & Enrollment

### WebAuthn Biometric Authentication
- **Hook**: `src/shared/hooks/useWebAuthn.ts`
- **Enrollment UI**: `src/pages/admin/EnrollmentPage.tsx`
- **Face Scan UI**: `src/washstation-app/pages/FaceScan.tsx`
- **Confirm Clock-In**: `src/washstation-app/pages/ConfirmClockIn.tsx`

**What to change for backend:**
```typescript
// In useWebAuthn.ts, replace localStorage with API calls:
// Line 14-27: getStoredCredentials() & storeCredential()
// Replace with:
// - GET /api/staff/credentials
// - POST /api/staff/credentials
```

### Staff Enrollment
- **File**: `src/pages/admin/EnrollmentPage.tsx`
- **Storage**: Currently localStorage (`washlab_enrollments`)

**Backend integration:**
```typescript
// Line ~85-115: Replace localStorage.setItem with:
await supabase.from('staff_enrollments').insert({
  token: enrollmentToken,
  staff_id: newStaffId,
  name: formData.name,
  phone: formData.phone,
  role: formData.role,
  branch_id: formData.branch,
  webauthn_credential: credentialData,
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

**Replace with:**
```typescript
const response = await supabase.functions.invoke('hubtel-payment', {
  body: {
    phone: completedOrder.customerPhone,
    amount: completedOrder.totalPrice,
    orderId: completedOrder.id,
  },
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
// ConfirmClockIn.tsx - Line ~80-95
// Replace:
localStorage.setItem('washlab_attendance_log', JSON.stringify(attendanceLog));

// With:
await supabase.from('attendance_logs').insert({
  staff_id: staffData.id,
  branch_id: branch.id,
  action: 'clock_in',
  timestamp: new Date().toISOString(),
  shift_id: newStaffEntry.shiftId,
});
```

### Active Staff Tracking
- **Dashboard**: `src/pages/WashStation.tsx` - Line ~107-109
- **Storage**: Currently sessionStorage (`washstation_active_staff`)

**For real-time sync:**
```typescript
// Subscribe to active staff changes
const subscription = supabase
  .channel('active-staff')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'active_shifts' }, 
    (payload) => setActiveStaff(payload.new)
  )
  .subscribe();
```

---

## 📦 Order Management

### Order Creation
- **File**: `src/context/OrderContext.tsx`
- **Function**: `addOrder()` (Line ~varies)

**Backend integration:**
```typescript
// Replace context state with Supabase
const addOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
  return data;
};
```

### Order Status Updates
- **File**: `src/context/OrderContext.tsx`
- **Function**: `updateOrder()` (Line ~varies)

### Order Display
- **WashStation Dashboard**: `src/pages/WashStation.tsx`
- **Customer Track Page**: `src/public-app/pages/Track.tsx`

---

## 🏢 Branch Management

### Branch List
- **File**: `src/washstation-app/pages/BranchEntry.tsx` - Line 10-15
- **Current**: Mock data `BRANCHES` array

**Replace with:**
```typescript
const [branches, setBranches] = useState([]);

useEffect(() => {
  const fetchBranches = async () => {
    const { data } = await supabase.from('branches').select('*');
    setBranches(data);
  };
  fetchBranches();
}, []);
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

**Replace with API:**
```typescript
await supabase.functions.invoke('whatsapp-send', {
  body: {
    to: phone,
    template: 'order_confirmation',
    parameters: [...],
  },
});
```

---

## 🗄️ Data Storage Locations

### localStorage Keys (Replace with Database)

| Key | Current Use | Replacement Table |
|-----|------------|-------------------|
| `washlab_webauthn_credentials` | Staff biometrics | `staff_credentials` |
| `washlab_enrollments` | Staff enrollments | `staff_enrollments` |
| `washlab_attendance_log` | Attendance records | `attendance_logs` |

### sessionStorage Keys (Keep for Session)

| Key | Use | Notes |
|-----|-----|-------|
| `washstation_branch` | Current branch | Session-specific |
| `washstation_staff` | Current staff | Session-specific |
| `washstation_active_staff` | All active staff | Could sync with DB |
| `washstation_pending_staff` | Pre-confirmation | Session-specific |

---

## 🔧 Configuration Files

### Pricing
- **File**: `src/config/pricing.ts`
- **Move to**: Database `pricing_config` table

### Theme/UI
- **File**: `src/index.css` - CSS variables
- **File**: `tailwind.config.ts` - Theme config

---

## 🚀 Edge Functions to Create

1. **`hubtel-payment`** - Process mobile money payments
2. **`hubtel-callback`** - Handle payment confirmations
3. **`whatsapp-send`** - Send WhatsApp messages
4. **`whatsapp-webhook`** - Receive WhatsApp messages

---

## 📋 Database Tables to Create

```sql
-- Staff & Authentication
CREATE TABLE staff_enrollments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  branch_id UUID REFERENCES branches(id),
  webauthn_credential JSONB,
  enrollment_token TEXT UNIQUE,
  enrolled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending'
);

-- Attendance
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY,
  staff_id UUID REFERENCES staff_enrollments(id),
  branch_id UUID REFERENCES branches(id),
  action TEXT NOT NULL, -- 'clock_in', 'clock_out', 'break_start', 'break_end'
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  shift_id TEXT,
  notes TEXT
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL,
  total_price DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_by UUID REFERENCES staff_enrollments(id)
);

-- Branches
CREATE TABLE branches (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true
);
```

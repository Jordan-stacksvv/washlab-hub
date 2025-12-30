// Shared Types
// Used across all apps

export type OrderStatus = 
  | 'pending_dropoff'
  | 'checked_in'
  | 'sorting'
  | 'washing'
  | 'drying'
  | 'folding'
  | 'ready'
  | 'out_for_delivery'
  | 'completed';

export type ServiceType = 'wash_and_dry' | 'wash_only' | 'dry_only';

export type PaymentMethod = 'ussd' | 'mobile_money' | 'cash';

export interface CustomerProfile {
  phone: string;
  name: string;
  hall: string;
  room: string;
  loyaltyPoints: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  code: string;
  branchId: string;
  customerPhone: string;
  customerName: string;
  bagCardNumber?: string;
  status: OrderStatus;
  serviceType: ServiceType;
  clothesCount: number;
  hasWhites: boolean;
  washWhitesSeparately: boolean;
  weight?: number;
  loads?: number;
  totalPrice?: number;
  notes?: string;
  orderType: 'walkin' | 'online';
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  branchId: string;
  role: 'receptionist' | 'admin';
  isEnrolled: boolean;
  enrollmentToken?: string;
  createdAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  isActive: boolean;
}

export interface AttendanceLog {
  id: string;
  staffId: string;
  staffName: string;
  branchId: string;
  action: 'sign_in' | 'sign_out';
  timestamp: Date;
  verifiedBy: 'webauthn' | 'qr';
}

export const ORDER_STAGES: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'pending_dropoff', label: 'Pending Drop-off', color: 'bg-wash-orange' },
  { status: 'checked_in', label: 'Checked In', color: 'bg-wash-blue' },
  { status: 'sorting', label: 'Sorting', color: 'bg-purple-500' },
  { status: 'washing', label: 'Washing', color: 'bg-blue-500' },
  { status: 'drying', label: 'Drying', color: 'bg-cyan-500' },
  { status: 'folding', label: 'Folding', color: 'bg-pink-500' },
  { status: 'ready', label: 'Ready', color: 'bg-success' },
  { status: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-amber-500' },
  { status: 'completed', label: 'Completed', color: 'bg-muted-foreground' },
];

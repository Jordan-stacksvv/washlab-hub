// Centralized Pricing Configuration
// All pricing information should come from this file to maintain consistency across the app

export interface ServicePrice {
  id: 'wash_only' | 'wash_and_dry' | 'dry_only';
  label: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  tokens: number;
  featured?: boolean;
}

export const PRICING_CONFIG = {
  KG_PER_LOAD: 8,
  OVERFLOW_ALLOWED: 2,
  
  services: [
    {
      id: 'wash_only',
      label: 'Wash Only',
      price: 25,
      unit: '/load',
      description: 'Professional washing with premium detergents',
      features: ['Quality detergent', 'Color separation', 'Gentle care'],
      tokens: 1,
    },
    {
      id: 'wash_and_dry',
      label: 'Wash & Dry',
      price: 50,
      unit: '/load',
      description: 'Complete service including washing, drying, and folding',
      features: ['Everything in Wash', 'Tumble drying', 'Neatly folded'],
      tokens: 2,
      featured: true,
    },
    {
      id: 'dry_only',
      label: 'Dry Only',
      price: 25,
      unit: '/load',
      description: 'Quick and efficient drying service',
      features: ['Quick dry', 'All fabrics', 'Ready to wear'],
      tokens: 1,
    },
  ] as ServicePrice[],

  deliveryFee: 5,
  taxRate: 0.08,
  serviceFee: 1.50,

  loyalty: {
    washesForFreeWash: 10,
  },
};

export const getServiceById = (id: string): ServicePrice | undefined => {
  return PRICING_CONFIG.services.find(s => s.id === id);
};

export const calculateLoads = (weight: number): number => {
  const effectiveWeight = weight <= PRICING_CONFIG.KG_PER_LOAD + PRICING_CONFIG.OVERFLOW_ALLOWED 
    ? PRICING_CONFIG.KG_PER_LOAD 
    : weight;
  return Math.ceil(effectiveWeight / PRICING_CONFIG.KG_PER_LOAD);
};

export const calculateTotalPrice = (
  serviceId: string,
  weight: number,
  includeDelivery: boolean = false
): {
  subtotal: number;
  tax: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  loads: number;
} => {
  const service = getServiceById(serviceId);
  const loads = calculateLoads(weight);
  const basePrice = (service?.price || 50) * loads;
  const deliveryFee = includeDelivery ? PRICING_CONFIG.deliveryFee : 0;
  const subtotal = basePrice;
  const tax = subtotal * PRICING_CONFIG.taxRate;
  const serviceFee = PRICING_CONFIG.serviceFee;
  
  return {
    subtotal,
    tax,
    serviceFee,
    deliveryFee,
    total: subtotal + tax + serviceFee + deliveryFee,
    loads,
  };
};

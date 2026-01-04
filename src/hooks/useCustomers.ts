import { useState, useCallback } from 'react';

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  isLoyaltyMember: boolean;
}

const CUSTOMERS_KEY = 'washlab_customers';

/**
 * Customer Management Hook
 * 
 * Handles customer lookup and creation
 * - Phone-first identification
 * - Auto-load existing customers
 * - Only ask for name if new
 */
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveCustomers = useCallback((newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(newCustomers));
  }, []);

  const findByPhone = useCallback((phone: string): Customer | null => {
    const cleanPhone = phone.replace(/\D/g, '');
    return customers.find(c => c.phone.replace(/\D/g, '') === cleanPhone) || null;
  }, [customers]);

  const createCustomer = useCallback((phone: string, name: string): Customer => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if already exists
    const existing = findByPhone(cleanPhone);
    if (existing) return existing;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      phone: cleanPhone,
      name,
      createdAt: new Date().toISOString(),
      orderCount: 0,
      totalSpent: 0,
      isLoyaltyMember: false
    };

    const updated = [...customers, newCustomer];
    saveCustomers(updated);
    return newCustomer;
  }, [customers, saveCustomers, findByPhone]);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>): Customer | null => {
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated = [...customers];
    updated[index] = { ...updated[index], ...updates };
    saveCustomers(updated);
    return updated[index];
  }, [customers, saveCustomers]);

  const incrementOrderStats = useCallback((phone: string, amount: number) => {
    const customer = findByPhone(phone);
    if (customer) {
      updateCustomer(customer.id, {
        orderCount: customer.orderCount + 1,
        totalSpent: customer.totalSpent + amount
      });
    }
  }, [findByPhone, updateCustomer]);

  return {
    customers,
    findByPhone,
    createCustomer,
    updateCustomer,
    incrementOrderStats
  };
};

export default useCustomers;

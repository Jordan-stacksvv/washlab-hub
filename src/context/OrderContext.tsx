import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OrderStatus } from '@/types';

export interface OrderItem {
  category: string;
  quantity: number;
}

export interface Order {
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
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  getOrderByCode: (code: string) => Order | undefined;
  getOrderByPhone: (phone: string) => Order | undefined;
  getPendingOrders: () => Order[];
  getActiveOrders: () => Order[];
  getReadyOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'washlab_orders';

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt)
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, ...updates } : order
      )
    );
  };

  const getOrderByCode = (code: string) => {
    return orders.find(o => o.code.toLowerCase() === code.toLowerCase());
  };

  const getOrderByPhone = (phone: string) => {
    return orders.find(o => o.customerPhone === phone);
  };

  const getPendingOrders = () => {
    return orders.filter(o => o.status === 'pending_dropoff');
  };

  const getActiveOrders = () => {
    return orders.filter(o => !['pending_dropoff', 'completed'].includes(o.status));
  };

  const getReadyOrders = () => {
    return orders.filter(o => o.status === 'ready');
  };

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrder,
      getOrderByCode,
      getOrderByPhone,
      getPendingOrders,
      getActiveOrders,
      getReadyOrders,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

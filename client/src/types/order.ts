import { CartItem } from './cart';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed';

export interface PaymentInfo {
  paymentIntentId: string;
  status: PaymentStatus;
  paidAt?: Date;
  amount: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  pickupCode: string;
  payment: PaymentInfo;
}

export interface OrderFormData {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}
export type BookingStatus = 'pending_reservation' | 'unpaid_reservation' | 'paid_reservation' | 'past_reservation' | 'declined_reservation' | 'cancelled_reservation';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed';

export interface PaymentInfo {
  paymentIntentId?: string;
  status: PaymentStatus;
  paidAt?: Date;
  amount: number;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  date: Date;
  time: string;
  numberOfPeople: number;
  specialRequests?: string;
  status: BookingStatus;
  reservationFee: number;
  payment?: PaymentInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingFormData = {
  customerName: string;
  date: Date;
  time: string;
  numberOfPeople: number;
  specialRequests?: string;
};
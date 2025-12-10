export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'declined';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  date: Date;
  time: string;
  numberOfPeople: number;
  specialRequests?: string;
  status: BookingStatus;
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
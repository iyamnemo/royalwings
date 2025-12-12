import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking, BookingFormData, BookingStatus, PaymentStatus } from '../types/booking';

const BOOKINGS_COLLECTION = 'bookings';
const RESERVATION_FEE = 100; // PHP 100 as reservation fee

export const bookingService = {
  async createBooking(userId: string, userName: string, bookingData: BookingFormData): Promise<string> {
    const booking = {
      ...bookingData,
      userId,
      userName,
      status: 'pending_reservation' as BookingStatus,
      reservationFee: RESERVATION_FEE,
      payment: {
        status: 'unpaid' as PaymentStatus,
        amount: RESERVATION_FEE,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
    return docRef.id;
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          date: data.date.toDate(),
          time: data.time,
          numberOfPeople: data.numberOfPeople,
          specialRequests: data.specialRequests,
          status: data.status,
          reservationFee: data.reservationFee || RESERVATION_FEE,
          payment: data.payment || { status: 'unpaid', amount: RESERVATION_FEE },
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Booking;
      });
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  async getAllBookings(): Promise<Booking[]> {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        reservationFee: data.reservationFee || RESERVATION_FEE,
        payment: data.payment || { status: 'unpaid', amount: RESERVATION_FEE },
      } as Booking;
    });
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: Timestamp.now()
    });
  },

  async updatePaymentStatus(bookingId: string, paymentStatus: PaymentStatus, paymentIntentId?: string): Promise<void> {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const updateData: any = {
      'payment.status': paymentStatus,
      updatedAt: Timestamp.now()
    };

    if (paymentIntentId) {
      updateData['payment.paymentIntentId'] = paymentIntentId;
    }

    if (paymentStatus === 'paid') {
      updateData['payment.paidAt'] = Timestamp.fromDate(new Date());
      updateData['status'] = 'paid_reservation';
    }

    await updateDoc(bookingRef, updateData);
  },

  async deleteBooking(bookingId: string): Promise<void> {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await deleteDoc(bookingRef);
  },

  async deleteUserCompletedBookings(userId: string): Promise<void> {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'cancelled_reservation')
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  async deleteCompletedBookings(): Promise<void> {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('status', '==', 'declined_reservation')
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  async updatePastBookings(): Promise<void> {
    try {
      const now = new Date();
      const allBookings = await this.getAllBookings();
      
      const updatePromises = allBookings
        .filter(booking => {
          const bookingDate = new Date(booking.date);
          return (booking.status === 'paid_reservation' || booking.status === 'cancelled_reservation') && bookingDate <= now;
        })
        .filter(booking => booking.status !== 'past_reservation')
        .map(booking => this.updateBookingStatus(booking.id, 'past_reservation'));
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating past bookings:', error);
    }
  }
};
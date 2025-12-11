import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking, BookingFormData, BookingStatus } from '../types/booking';

const BOOKINGS_COLLECTION = 'bookings';

export const bookingService = {
  async createBooking(userId: string, userName: string, bookingData: BookingFormData): Promise<string> {
    const booking = {
      ...bookingData,
      userId,
      userName,
      status: 'pending' as BookingStatus,
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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Booking[];
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: Timestamp.now()
    });
  },

  async deleteBooking(bookingId: string): Promise<void> {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await deleteDoc(bookingRef);
  },

  async deleteUserCompletedBookings(userId: string): Promise<void> {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'cancelled')
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  async deleteCompletedBookings(): Promise<void> {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('status', '==', 'declined')
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};
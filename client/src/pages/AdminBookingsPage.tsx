import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { bookingService } from '../services/bookingService';
import { Booking, BookingStatus } from '../types/booking';

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [declinedPage, setDeclinedPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ type: 'confirm' | 'decline' | 'cancel' | 'clearHistory', bookingId?: string } | null>(null);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const allBookings = await bookingService.getAllBookings();
      setBookings(allBookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return (b.status === 'confirmed' || b.status === 'pending') && bookingDate > now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getPastBookings = () => {
    const now = new Date();
    return bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return (b.status === 'confirmed' || b.status === 'cancelled') && bookingDate <= now;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getDeclinedBookings = () => {
    return bookings.filter(b => b.status === 'declined').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const getPaginatedUpcomingBookings = () => {
    const upcoming = getUpcomingBookings();
    const startIndex = (upcomingPage - 1) * ITEMS_PER_PAGE;
    return upcoming.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalUpcomingPages = () => {
    return Math.ceil(getUpcomingBookings().length / ITEMS_PER_PAGE);
  };

  const getPaginatedPastBookings = () => {
    const past = getPastBookings();
    const startIndex = (pastPage - 1) * ITEMS_PER_PAGE;
    return past.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalPastPages = () => {
    return Math.ceil(getPastBookings().length / ITEMS_PER_PAGE);
  };

  const getPaginatedDeclinedBookings = () => {
    const declined = getDeclinedBookings();
    const startIndex = (declinedPage - 1) * ITEMS_PER_PAGE;
    return declined.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalDeclinedPages = () => {
    return Math.ceil(getDeclinedBookings().length / ITEMS_PER_PAGE);
  };

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      await fetchBookings(); 
      
      if (status === 'confirmed') {
        toast.success('Booking confirmed successfully!');
      } else if (status === 'declined') {
        toast.success('Booking declined!');
      } else if (status === 'cancelled') {
        toast.success('Booking cancelled successfully!');
      }
    } catch (err) {
      toast.error('Failed to update booking status');
      console.error('Failed to update booking status:', err);
    }
  };

  const handleConfirmBooking = (bookingId: string) => {
    setConfirmModal({ type: 'confirm', bookingId });
  };

  const handleDeclineBooking = (bookingId: string) => {
    setConfirmModal({ type: 'decline', bookingId });
  };

  const handleCancelBooking = (bookingId: string) => {
    setConfirmModal({ type: 'cancel', bookingId });
  };

  const confirmAction = async () => {
    if (!confirmModal) return;
    
    try {
      if (confirmModal.type === 'confirm' && confirmModal.bookingId) {
        await handleStatusUpdate(confirmModal.bookingId, 'confirmed');
      } else if (confirmModal.type === 'decline' && confirmModal.bookingId) {
        await handleStatusUpdate(confirmModal.bookingId, 'declined');
      } else if (confirmModal.type === 'cancel' && confirmModal.bookingId) {
        await handleStatusUpdate(confirmModal.bookingId, 'cancelled');
      } else if (confirmModal.type === 'clearHistory') {
        await handleClearHistory();
      }
    } finally {
      setConfirmModal(null);
    }
  };

  const handleClearHistory = async () => {
    try {
      await bookingService.deleteCompletedBookings();
      await fetchBookings(); 
      toast.success('Declined history cleared successfully!');
    } catch (err) {
      toast.error('Failed to clear history');
      console.error('Failed to clear history:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'declined':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const BookingCard: React.FC<{ booking: Booking; isPastBooking?: boolean }> = ({ booking, isPastBooking = false }) => (
    <li key={booking.id} className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {booking.userName}
            </p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Date: {new Date(booking.date).toLocaleDateString()} at {booking.time}
          </p>
          <p className="text-sm text-gray-500">
            People: {booking.numberOfPeople}
          </p>
          {booking.specialRequests && (
            <p className="mt-2 text-sm text-gray-500">
              Special Requests: {booking.specialRequests}
            </p>
          )}
        </div>
        
        {!isPastBooking && booking.status === 'pending' && (
          <div className="ml-6 flex items-center space-x-4">
            <button
              onClick={() => handleConfirmBooking(booking.id)}
              className="flex-1 px-3 py-2 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => handleDeclineBooking(booking.id)}
              className="flex-1 px-3 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
            >
              Decline
            </button>
          </div>
        )}
        
        {!isPastBooking && booking.status === 'confirmed' && (
          <button
            onClick={() => handleCancelBooking(booking.id)}
            className="flex-1 px-3 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </li>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();
  const declinedBookings = getDeclinedBookings();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Table Reservations</h1>
          {declinedBookings.length > 0 && (
            <button
              onClick={() => setConfirmModal({ type: 'clearHistory' })}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
            >
              Clear Declined History
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
              Upcoming Bookings {upcomingBookings.length > 0 && <span className="ml-2 text-lg text-blue-600">({upcomingBookings.length})</span>}
            </h2>
            {upcomingBookings.length > 0 ? (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {getPaginatedUpcomingBookings().map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </ul>
                </div>
                
                {getTotalUpcomingPages() > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setUpcomingPage(prev => Math.max(1, prev - 1))}
                      disabled={upcomingPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {upcomingPage} of {getTotalUpcomingPages()}
                    </span>
                    <button
                      onClick={() => setUpcomingPage(prev => Math.min(getTotalUpcomingPages(), prev + 1))}
                      disabled={upcomingPage === getTotalUpcomingPages()}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
                No upcoming bookings
              </div>
            )}
          </div>

          {/* Past Bookings Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              Past Bookings {pastBookings.length > 0 && <span className="ml-2 text-lg text-green-600">({pastBookings.length})</span>}
            </h2>
            {pastBookings.length > 0 ? (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {getPaginatedPastBookings().map((booking) => (
                      <BookingCard key={booking.id} booking={booking} isPastBooking={true} />
                    ))}
                  </ul>
                </div>
                
                {getTotalPastPages() > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setPastPage(prev => Math.max(1, prev - 1))}
                      disabled={pastPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pastPage} of {getTotalPastPages()}
                    </span>
                    <button
                      onClick={() => setPastPage(prev => Math.min(getTotalPastPages(), prev + 1))}
                      disabled={pastPage === getTotalPastPages()}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
                No past bookings
              </div>
            )}
          </div>

          {/* Declined Bookings Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-3"></span>
              Declined Bookings {declinedBookings.length > 0 && <span className="ml-2 text-lg text-red-600">({declinedBookings.length})</span>}
            </h2>
            {declinedBookings.length > 0 ? (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {getPaginatedDeclinedBookings().map((booking) => (
                      <BookingCard key={booking.id} booking={booking} isPastBooking={true} />
                    ))}
                  </ul>
                </div>
                
                {getTotalDeclinedPages() > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setDeclinedPage(prev => Math.max(1, prev - 1))}
                      disabled={declinedPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {declinedPage} of {getTotalDeclinedPages()}
                    </span>
                    <button
                      onClick={() => setDeclinedPage(prev => Math.min(getTotalDeclinedPages(), prev + 1))}
                      disabled={declinedPage === getTotalDeclinedPages()}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
                No declined bookings
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modals */}
        {confirmModal?.type === 'confirm' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Booking</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to confirm this booking?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmAction();
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:shadow-md transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal?.type === 'decline' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Decline Booking</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to decline this booking?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmAction();
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:shadow-md transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal?.type === 'cancel' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Cancel Booking</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to cancel this booking?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Don't Cancel
                </button>
                <button
                  onClick={() => {
                    confirmAction();
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:shadow-md transition-all"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal?.type === 'clearHistory' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Clear Declined History</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to clear all declined bookings? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmAction();
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg hover:shadow-md transition-all"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
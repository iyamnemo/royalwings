import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types/booking';

const UserBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [declinedPage, setDeclinedPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ bookingId: string; bookingDetails: Booking } | null>(null);
  const ITEMS_PER_PAGE = 5;

  const handleOpenCancelModal = (booking: Booking) => {
    setConfirmModal({ bookingId: booking.id, bookingDetails: booking });
  };

  const handleConfirmCancel = async () => {
    if (!confirmModal) return;

    try {
      await bookingService.updateBookingStatus(confirmModal.bookingId, 'cancelled');
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === confirmModal.bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      toast.success('Booking cancelled successfully!');
      setConfirmModal(null);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      toast.error('Failed to cancel booking. Please try again.');
      setError('Failed to cancel booking. Please try again.');
      setConfirmModal(null);
    }
  };

  const handleCancelModal = () => {
    setConfirmModal(null);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching bookings for user:', currentUser.uid);
        const userBookings = await bookingService.getUserBookings(currentUser.uid);
        console.log('Received bookings:', userBookings);
        setBookings(userBookings || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

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

  const BookingCard: React.FC<{ booking: Booking; isPastBooking?: boolean }> = ({ booking, isPastBooking = false }) => (
    <li className="p-6">
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
        
        {!isPastBooking && (booking.status === 'pending' || booking.status === 'confirmed') && (
          <button
            onClick={() => handleOpenCancelModal(booking)}
            className="ml-6 px-3 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <Link
            to="/book"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:text-white hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            New Booking
          </Link>
        </div>  

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
            <Link
              to="/book"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              Make Your First Booking
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Bookings */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
                Upcoming {getUpcomingBookings().length > 0 && <span className="ml-2 text-lg text-blue-600">({getUpcomingBookings().length})</span>}
              </h2>
              {getUpcomingBookings().length > 0 ? (
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

            {/* Past Bookings */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                Past {getPastBookings().length > 0 && <span className="ml-2 text-lg text-green-600">({getPastBookings().length})</span>}
              </h2>
              {getPastBookings().length > 0 ? (
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

            {/* Declined Bookings */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-3"></span>
                Declined {getDeclinedBookings().length > 0 && <span className="ml-2 text-lg text-red-600">({getDeclinedBookings().length})</span>}
              </h2>
              {getDeclinedBookings().length > 0 ? (
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
        )}

        {/* Confirmation Modal for Cancel */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 animate-slideUp">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
              
              <div className="bg-gray-50 rounded-md p-4 mb-6 space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Name:</span> {confirmModal.bookingDetails.userName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Date:</span> {new Date(confirmModal.bookingDetails.date).toLocaleDateString()} at {confirmModal.bookingDetails.time}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Party Size:</span> {confirmModal.bookingDetails.numberOfPeople} {confirmModal.bookingDetails.numberOfPeople === 1 ? 'person' : 'people'}
                </p>
                {confirmModal.bookingDetails.specialRequests && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Special Requests:</span> {confirmModal.bookingDetails.specialRequests}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to cancel this booking?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookingsPage;
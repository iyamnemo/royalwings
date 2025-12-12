import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { Booking, BookingStatus, PaymentStatus } from '../types/booking';
import BookingCheckout from '../components/BookingCheckout';
import BookingDetailsModal from '../components/BookingDetailsModal';

const UserBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [unpaidPage, setUnpaidPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [declinedPage, setDeclinedPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ bookingId: string; bookingDetails: Booking } | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ bookingId: string; amount: number; email: string } | null>(null);
  const [detailsModal, setDetailsModal] = useState<Booking | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const ITEMS_PER_PAGE = 5;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await bookingService.updatePastBookings();
      const userBookings = await bookingService.getUserBookings(currentUser?.uid || '');
      setBookings(userBookings || []);
      toast.success('Bookings refreshed!');
    } catch (err) {
      console.error('Failed to refresh bookings:', err);
      toast.error('Failed to refresh bookings');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenCancelModal = (booking: Booking) => {
    setConfirmModal({ bookingId: booking.id, bookingDetails: booking });
  };

  const handleOpenPaymentModal = (booking: Booking) => {
    setPaymentModal({
      bookingId: booking.id,
      amount: booking.reservationFee || 100,
      email: currentUser?.email || ''
    });
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentModal) return;

    try {
      await bookingService.updatePaymentStatus(paymentModal.bookingId, 'paid', paymentIntentId);
      setBookings(prevBookings =>
        prevBookings.map(booking => {
          if (booking.id === paymentModal.bookingId) {
            return {
              ...booking,
              status: 'paid_reservation' as BookingStatus,
              payment: {
                status: 'paid' as PaymentStatus,
                paymentIntentId,
                paidAt: new Date(),
                amount: booking.reservationFee || 100
              }
            } as Booking;
          }
          return booking;
        })
      );
      toast.success('Payment successful! Your reservation is confirmed.');
      setPaymentModal(null);
    } catch (err) {
      console.error('Failed to update payment status:', err);
      toast.error('Payment successful but failed to update status. Please contact support.');
    }
  };

  const handleConfirmCancel = async () => {
    if (!confirmModal) return;

    try {
      await bookingService.updateBookingStatus(confirmModal.bookingId, 'cancelled_reservation');
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === confirmModal.bookingId 
            ? { ...booking, status: 'cancelled_reservation' } 
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

  const handleCancelPaymentModal = () => {
    setPaymentModal(null);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching bookings for user:', currentUser.uid);
        // Update any past bookings first
        await bookingService.updatePastBookings();
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

  const applyFilters = (bookingsList: Booking[]): Booking[] => {
    return bookingsList.filter(booking => {
      // Name filter
      const matchesName = booking.userName.toLowerCase().includes(searchName.toLowerCase());
      
      // Date range filter
      const bookingDate = new Date(booking.date);
      let matchesDateRange = true;
      
      if (filterStartDate) {
        const startDate = new Date(filterStartDate);
        startDate.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && bookingDate >= startDate;
      }
      
      if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && bookingDate <= endDate;
      }
      
      return matchesName && matchesDateRange;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_reservation':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid_reservation':
        return 'bg-orange-100 text-orange-800';
      case 'paid_reservation':
        return 'bg-green-100 text-green-800';
      case 'past_reservation':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled_reservation':
        return 'bg-red-100 text-red-800';
      case 'declined_reservation':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    const filtered = applyFilters(bookings);
    return filtered.filter(b => {
      const bookingDate = new Date(b.date);
      return (b.status === 'pending_reservation' || b.status === 'paid_reservation') && bookingDate > now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getUnpaidReservations = () => {
    const now = new Date();
    const filtered = applyFilters(bookings);
    return filtered.filter(b => {
      const bookingDate = new Date(b.date);
      return b.status === 'unpaid_reservation' && bookingDate > now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getPastBookings = () => {
    const now = new Date();
    const filtered = applyFilters(bookings);
    return filtered.filter(b => {
      const bookingDate = new Date(b.date);
      return b.status === 'past_reservation' && bookingDate <= now;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getDeclinedBookings = () => {
    const filtered = applyFilters(bookings);
    return filtered.filter(b => b.status === 'declined_reservation').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const getPaginatedUpcomingBookings = () => {
    const upcoming = getUpcomingBookings();
    const startIndex = (upcomingPage - 1) * ITEMS_PER_PAGE;
    return upcoming.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalUpcomingPages = () => {
    return Math.ceil(getUpcomingBookings().length / ITEMS_PER_PAGE);
  };

  const getPaginatedUnpaidReservations = () => {
    const unpaid = getUnpaidReservations();
    const startIndex = (unpaidPage - 1) * ITEMS_PER_PAGE;
    return unpaid.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalUnpaidPages = () => {
    return Math.ceil(getUnpaidReservations().length / ITEMS_PER_PAGE);
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
      <div className="space-y-4">
        {/* Top Row - Name and Status */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-900 truncate">
            {booking.userName}
          </p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status === 'pending_reservation' && 'Pending Reservations'}
            {booking.status === 'unpaid_reservation' && 'Unpaid Reservation'}
            {booking.status === 'paid_reservation' && 'Paid Reservations'}
            {booking.status === 'past_reservation' && 'Past Reservations'}
            {booking.status === 'cancelled_reservation' && 'Cancelled'}
            {booking.status === 'declined_reservation' && 'Declined Reservations'}
          </span>
        </div>

        {/* Middle Row - Date and People */}
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            Date: {new Date(booking.date).toLocaleDateString()} at {booking.time}
          </p>
          <p className="text-sm text-gray-500">
            People: {booking.numberOfPeople}
          </p>
        </div>

        {/* View Details Link */}
        <button
          onClick={() => setDetailsModal(booking)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
        >
          View Details
        </button>

        {/* Bottom Row - Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {!isPastBooking && booking.status === 'unpaid_reservation' && (
            <>
              <button
                onClick={() => handleOpenPaymentModal(booking)}
                className="px-4 py-2 text-xs font-semibold bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
              >
                Pay Now
              </button>
              <button
                onClick={() => handleOpenCancelModal(booking)}
                className="px-4 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </>
          )}

          {!isPastBooking && (booking.status === 'pending_reservation' || booking.status === 'paid_reservation') && (
            <button
              onClick={() => handleOpenCancelModal(booking)}
              className="px-4 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
          )}
        </div>
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
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <i className={`fas fa-sync-alt mr-2 ${isRefreshing ? 'animate-spin' : ''}`}></i>
              Refresh
            </button>
            <Link
              to="/book"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:text-white hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              New Booking
            </Link>
          </div>
        </div>  

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setUpcomingPage(1);
                  setUnpaidPage(1);
                  setPastPage(1);
                  setDeclinedPage(1);
                }}
                placeholder="Enter name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value);
                  setUpcomingPage(1);
                  setUnpaidPage(1);
                  setPastPage(1);
                  setDeclinedPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setUpcomingPage(1);
                  setUnpaidPage(1);
                  setPastPage(1);
                  setDeclinedPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchName || filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setSearchName('');
                setFilterStartDate('');
                setFilterEndDate('');
                setUpcomingPage(1);
                setUnpaidPage(1);
                setPastPage(1);
                setDeclinedPage(1);
              }}
              className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Unpaid Reservations - PRIORITY */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-3"></span>
                Action Required {getUnpaidReservations().length > 0 && <span className="ml-2 text-lg text-red-600">({getUnpaidReservations().length})</span>}
              </h2>
              {getUnpaidReservations().length > 0 ? (
                <>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {getPaginatedUnpaidReservations().map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </ul>
                  </div>
                  
                  {getTotalUnpaidPages() > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => setUnpaidPage(prev => Math.max(1, prev - 1))}
                        disabled={unpaidPage === 1}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {unpaidPage} of {getTotalUnpaidPages()}
                      </span>
                      <button
                        onClick={() => setUnpaidPage(prev => Math.min(getTotalUnpaidPages(), prev + 1))}
                        disabled={unpaidPage === getTotalUnpaidPages()}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
                  No unpaid reservations
                </div>
              )}
            </div>

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

              </div>

              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this booking?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
                <p className="text-xs text-red-900"><span className="font-semibold">⚠ Warning:</span> If you have already paid the reservation fee, it will NOT be refunded.</p>
              </div>

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

        {/* Payment Modal */}
        {paymentModal && (
          <BookingCheckout
            bookingId={paymentModal.bookingId}
            amount={paymentModal.amount}
            email={paymentModal.email}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancelPaymentModal}
          />
        )}

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={detailsModal}
          onClose={() => setDetailsModal(null)}
          statusColor={detailsModal ? getStatusColor(detailsModal.status) : ''}
          getStatusLabel={(status) => {
            switch (status) {
              case 'pending_reservation':
                return 'Pending Reservations';
              case 'unpaid_reservation':
                return 'Unpaid Reservation';
              case 'paid_reservation':
                return 'Paid Reservations';
              case 'past_reservation':
                return 'Past Reservations';
              case 'cancelled_reservation':
                return 'Cancelled';
              case 'declined_reservation':
                return 'Declined Reservations';
              default:
                return status;
            }
          }}
        />
      </div>
    </div>
  );
};

export default UserBookingsPage;
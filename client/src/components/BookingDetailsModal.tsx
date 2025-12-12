import React from 'react';
import { Booking } from '../types/booking';

interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
  statusColor: string;
  getStatusLabel: (status: string) => string;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  statusColor,
  getStatusLabel,
}) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <p className="text-gray-900 font-semibold break-words">{booking.userName}</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <p className="text-gray-900">
                {new Date(booking.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <p className="text-gray-900">{booking.time}</p>
            </div>
          </div>

          {/* Party Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of People
            </label>
            <p className="text-gray-900">
              {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
            </p>
          </div>

          {/* Reservation Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reservation Fee
            </label>
            <p className="text-gray-900 font-semibold">₱{booking.reservationFee || 100}</p>
          </div>

          {/* Payment Status */}
          {booking.payment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <p className={`font-semibold ${
                booking.payment.status === 'paid'
                  ? 'text-green-600'
                  : booking.payment.status === 'unpaid'
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`}>
                {booking.payment.status === 'paid' && '✓ Paid'}
                {booking.payment.status === 'unpaid' && 'Unpaid'}
                {booking.payment.status === 'failed' && 'Failed'}
              </p>
            </div>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded break-words whitespace-pre-wrap text-sm">
                {booking.specialRequests}
              </p>
            </div>
          )}

          {/* Created At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Created
            </label>
            <p className="text-gray-600 text-sm">
              {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingDetailsModal;

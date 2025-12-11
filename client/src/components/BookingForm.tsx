import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { BookingFormData } from '../types/booking';

const schema = yup.object().shape({
  customerName: yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces')
    .required('Customer name is required'),
  date: yup.date()
    .min(new Date(), 'Date must be in the future')
    .required('Date is required'),
  time: yup.string().required('Time is required'),
  numberOfPeople: yup.number()
    .min(1, 'Minimum 1 person required')
    .max(20, 'Maximum 20 people allowed')
    .required('Number of people is required'),
  specialRequests: yup.string()
});

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, isLoading = false }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<BookingFormData | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<BookingFormData>({
    resolver: yupResolver(schema)
  });

  const customerName = watch('customerName');
  const date = watch('date');
  const time = watch('time');
  const numberOfPeople = watch('numberOfPeople');
  const specialRequests = watch('specialRequests');

  const validateAndShowErrors = (data: BookingFormData) => {
    let hasErrors = false;

    // Validate customer name
    if (!data.customerName) {
      toast.error('Customer name is required');
      hasErrors = true;
    } else if (data.customerName.length < 2) {
      toast.error('Name must be at least 2 characters');
      hasErrors = true;
    } else if (data.customerName.length > 50) {
      toast.error('Name must not exceed 50 characters');
      hasErrors = true;
    } else if (!/^[a-zA-Z\s]*$/.test(data.customerName)) {
      toast.error('Name can only contain letters and spaces');
      hasErrors = true;
    }

    // Validate date
    if (!data.date) {
      toast.error('Date is required');
      hasErrors = true;
    } else if (new Date(data.date) < new Date()) {
      toast.error('Date must be in the future');
      hasErrors = true;
    }

    // Validate time
    if (!data.time) {
      toast.error('Time is required');
      hasErrors = true;
    }

    // Validate number of people
    if (!data.numberOfPeople) {
      toast.error('Number of people is required');
      hasErrors = true;
    } else if (data.numberOfPeople < 1) {
      toast.error('Minimum 1 person required');
      hasErrors = true;
    } else if (data.numberOfPeople > 20) {
      toast.error('Maximum 20 people allowed');
      hasErrors = true;
    }

    return hasErrors;
  };

  const handleFormSubmit = (data: BookingFormData) => {
    if (validateAndShowErrors(data)) {
      return;
    }

    // Show confirmation modal
    setPendingBookingData(data);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = () => {
    if (pendingBookingData) {
      setShowConfirmation(false);
      onSubmit(pendingBookingData);
      setPendingBookingData(null);
    }
  };

  const handleCancelBooking = () => {
    setShowConfirmation(false);
    setPendingBookingData(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            {...register('customerName')}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
            placeholder="Enter your full name"
            maxLength={50}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">{customerName?.length || 0}/50 characters</p>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            {...register('date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <select
            {...register('time')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a time</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="21:00">9:00 PM</option>
            <option value="22:00">10:00 PM</option>
            <option value="23:00">11:00 PM</option>
          </select>
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700">
            Number of People
          </label>
          <input
            type="number"
            {...register('numberOfPeople')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="1"
            max="20"
          />
          {errors.numberOfPeople && (
            <p className="mt-1 text-sm text-red-600">{errors.numberOfPeople.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
            Special Requests (Optional)
          </label>
          <textarea
            {...register('specialRequests')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Any special requests or notes..."
          />
          {errors.specialRequests && (
            <p className="mt-1 text-sm text-red-600">{errors.specialRequests.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Submitting...' : 'Book Table'}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && pendingBookingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 animate-slideUp">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Booking</h3>
            
            <div className="bg-gray-50 rounded-md p-4 mb-6 space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Name:</span> {pendingBookingData.customerName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Date:</span> {new Date(pendingBookingData.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Time:</span> {pendingBookingData.time}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Party Size:</span> {pendingBookingData.numberOfPeople} {pendingBookingData.numberOfPeople === 1 ? 'person' : 'people'}
              </p>
              {pendingBookingData.specialRequests && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Special Requests:</span> {pendingBookingData.specialRequests}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to proceed with this booking?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-md hover:from-cyan-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingForm;
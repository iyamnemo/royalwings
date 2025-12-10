import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import BookingForm from '../components/BookingForm';
import { BookingFormData } from '../types/booking';

const BookingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: BookingFormData) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await bookingService.createBooking(
        currentUser.uid,
        data.customerName,
        data
      );
      toast.success('Table booked successfully!');
      setTimeout(() => {
        navigate('/bookings');
      }, 1000);
    } catch (err) {
      console.error('Failed to create booking:', err);
      toast.error('Failed to create booking. Please try again.');
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Booking Form */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Table Reservation Form</h1>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <BookingForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Why Book With Us Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Book With Us?</h2>
              
              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cyan-100">
                      <i className="fas fa-crown text-cyan-600 text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Premium Experience</h3>
                    <p className="text-sm text-gray-600 mt-1">Enjoy our finest dining atmosphere with attentive service</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-100">
                      <i className="fas fa-clock text-indigo-600 text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Service</h3>
                    <p className="text-sm text-gray-600 mt-1">Fast and efficient service without compromising quality</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100">
                      <i className="fas fa-leaf text-green-600 text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Fresh Ingredients</h3>
                    <p className="text-sm text-gray-600 mt-1">Only the finest and freshest ingredients in every dish</p>
                  </div>
                </div>

                {/* Feature 4*/}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-pink-100">
                      <i className="fas fa-heart text-pink-600 text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Special Occasions</h3>
                    <p className="text-sm text-gray-600 mt-1">Perfect venue for celebrations and special moments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg shadow-md p-6 border border-cyan-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-cyan-600"></i>
                Quick Info
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-green-600 mt-1"></i>
                  <span><span className="font-semibold">Operating Hours:</span> 01:00 PM - 11:00 PM</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-green-600 mt-1"></i>
                  <span><span className="font-semibold">Capacity:</span> Up to 20 people per booking</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-green-600 mt-1"></i>
                  <span><span className="font-semibold">Advance Notice:</span> Book at least 1 day in advance</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fas fa-check text-green-600 mt-1"></i>
                  <span><span className="font-semibold">View Status:</span> View your booking status</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
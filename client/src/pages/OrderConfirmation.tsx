import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { formatPriceInPHP } from '../utils/formatters';
import StripeCheckout from '../components/StripeCheckout';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const OrderConfirmation: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [storeOpen, setStoreOpen] = useState(true);

  const fetchStoreStatus = async () => {
    try {
      const storeStatusDoc = await getDoc(doc(db, 'storeStatus', 'settings'));
      if (storeStatusDoc.exists()) {
        setStoreOpen(storeStatusDoc.data().isOpen ?? true);
      } else {
        setStoreOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch store status:', err);
      setStoreOpen(true);
    }
  };

  useEffect(() => {
    fetchStoreStatus();
    const interval = setInterval(fetchStoreStatus, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleSubmitOrder = async () => {
    if (!currentUser) {
      setError('You must be logged in to place an order');
      return;
    }

    if (!storeOpen) {
      setError('The store is currently closed. Please try again when we are open.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await currentUser.getIdToken(true);
      console.log('Authentication verified');

      if (!currentUser.email) {
        throw new Error('User email not found');
      }

      if (!currentUser.uid) {
        throw new Error('User ID not found');
      }

      const orderData = {
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        notes: notes.trim() || undefined,
      };

      console.log('Submitting order with data:', orderData);
      
      // Create order with temporary payment intent ID (will be updated after payment)
      const tempPaymentIntentId = 'pending-' + Date.now();
      
      const createdOrderId = await orderService.createOrder(
        orderData,
        currentUser.uid,
        currentUser.email || '',
        tempPaymentIntentId
      );
      console.log('Order created successfully:', createdOrderId);
      
      setOrderId(createdOrderId);
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    
    try {
      // Update order with the real payment intent ID from Stripe
      if (orderId) {
        await orderService.updatePaymentStatus(orderId, 'paid' as const, paymentIntentId);
        console.log('Order updated with payment status and intent:', orderId, paymentIntentId);
      }
    } catch (err) {
      console.error('Error updating order payment status:', err);
      // Continue anyway, the order exists with pending payment
    }
    
    setShowPaymentModal(false);
    clearCart();
    
    toast.success('Payment successful! Redirecting to order details...', {
      duration: 3000,
      position: 'top-center',
    });
    
    if (orderId) {
      setTimeout(() => {
        navigate(`/orders`);
      }, 1500);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setError('Payment cancelled. Your order has been created but is pending payment.');
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            View Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {!storeOpen && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            <p className="font-medium">⚠️ The store is currently closed. You cannot place orders at this time.</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Confirmation</h2>

            {/* Order Summary */}
            <div className="border-b pb-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2">
                  <div>
                    <span className="font-medium">{item.quantity}x</span>{' '}
                    {item.menuItem.name}
                    {item.notes && (
                      <p className="text-sm text-gray-500">Note: {item.notes}</p>
                    )}
                  </div>
                  <div className="font-medium">
                    {formatPriceInPHP(item.menuItem.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="Any special requests?"
              />
            </div>

            {/* Order Total */}
            <div className="border-t pt-6 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPriceInPHP(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPriceInPHP(cart.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPriceInPHP(cart.total)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/cart')}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Back to Cart
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isProcessing || !storeOpen}
                className="flex-1 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-cyan-400 disabled:to-blue-400"
              >
                {!storeOpen ? 'Store Closed' : isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      {showPaymentModal && orderId && currentUser && (
        <StripeCheckout
          orderId={orderId}
          amount={Math.round(cart.total)}
          email={currentUser.email || ''}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default OrderConfirmation;
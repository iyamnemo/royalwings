import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeService } from '../services/stripeService';
import { formatPriceInPHP } from '../utils/formatters';

interface StripeCheckoutProps {
  orderId: string;
  amount: number;
  email: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutProps> = ({
  orderId,
  amount,
  email,
  onSuccess,
  onCancel,
}) => {
  const stripeInstance = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    createPaymentIntent();
  }, [orderId, amount, email]);

  const createPaymentIntent = async () => {
    try {
      const response = await stripeService.createPaymentIntent(orderId, amount, email);
      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      console.error('Error creating payment intent:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripeInstance || !elements || !clientSecret) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripeInstance.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: email,
            },
          },
        },
        { handleActions: false }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        if (paymentIntentId) {
          onSuccess(paymentIntentId);
        }
      } else if (paymentIntent?.status === 'requires_action' || paymentIntent?.status === 'requires_payment_method') {
        setError('Payment requires additional authentication');
        setIsProcessing(false);
      } else {
        setError('Payment did not complete successfully');
        setIsProcessing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-600">Initializing payment...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Amount */}
        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <p className="text-gray-600 text-sm mb-2">Amount to Pay</p>
          <p className="text-3xl font-bold text-indigo-600">
            {formatPriceInPHP(amount)}
          </p>
        </div>

        {/* Payment form */}
        <form onSubmit={handleSubmit} className="mb-6">
          {/* Card element */}
          <div className="mb-6 p-3 border border-gray-300 rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripeInstance || isProcessing}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : `Pay ${formatPriceInPHP(amount)}`}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Once the payment is successful, you will no longer be able to cancel the order.
        </p>
      </div>
    </div>
  );
};

interface StripeCheckoutWrapperProps {
  orderId: string;
  amount: number;
  email: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutWrapperProps> = (props) => {
  const [stripe, setStripe] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if ((window as any).Stripe && publishableKey) {
        setStripe((window as any).Stripe(publishableKey));
      }
    };
    document.body.appendChild(script);
  }, []);

  if (!stripe) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-600">Loading payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripe}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;

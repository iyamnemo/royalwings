import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
      console.log('Payment intent created:', response.paymentIntentId);
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
      // Use confirmPayment with PaymentElement
      const { error: stripeError, paymentIntent } = await stripeInstance.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-status/${orderId}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        console.error('Stripe error:', stripeError);
        setIsProcessing(false);
        return;
      }

      // Check payment status
      if (paymentIntent?.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else if (paymentIntent?.status === 'requires_action') {
        setError('Payment requires additional authentication. Please complete the authentication.');
        setIsProcessing(false);
      } else if (paymentIntent?.status === 'processing') {
        console.log('Payment processing...');
        onSuccess(paymentIntent.id);
      } else {
        setError('Payment did not complete successfully. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      console.error('Payment error:', err);
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
          {/* Payment Element */}
          <div className="mb-6">
            <PaymentElement
              options={{
                layout: 'tabs',
              }}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 transition-all"
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
    <Elements
      stripe={stripe}
      options={{
        clientSecret: undefined, // Will be set per component
      }}
    >
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;

export default StripeCheckout;

/* Stripe Payment Service Handles all Stripe API calls */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const stripeService = {
  async createPaymentIntent(orderId: string, amount: number, email: string) {
    try {
      const amountInCents = Math.round(amount * 100);

      console.log(`Creating payment intent for order ${orderId}, amount: ${amountInCents}`, { API_URL });

      const response = await fetch(`${API_URL}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: amountInCents,
          email,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || error.message || 'Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /* Verify payment status*/
  async verifyPayment(paymentIntentId: string) {
    try {
      const response = await fetch(`${API_URL}/api/stripe/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || error.message || 'Failed to verify payment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
};

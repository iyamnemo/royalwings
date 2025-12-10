const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

/**
 * Create a Stripe checkout session
 * POST /api/stripe/create-checkout-session
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { orderId, amount, email, items } = req.body;

    if (!orderId || !amount || !email || !items) {
      return res.status(400).json({
        error: 'Missing required fields: orderId, amount, email, items',
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sgd', // Using SGD for testing ONLY
            product_data: {
              name: `Royal Wings Order #${orderId}`,
              description: `${items.length} item(s)`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-status/${orderId}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/order-confirmation?payment=cancelled`,
      customer_email: email,
      metadata: {
        orderId: orderId,
      },
    });

    console.log('Stripe session created:', session.id);

    res.json({
      sessionId: session.id,
      clientSecret: session.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({
      error: 'Failed to create payment session',
      message: error.message,
    });
  }
});

/**
 * Get payment intent
 * POST /api/stripe/create-payment-intent
 */
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { orderId, amount, email } = req.body;

    if (!orderId || !amount || !email) {
      return res.status(400).json({
        error: 'Missing required fields: orderId, amount, email',
      });
    }

    console.log(`Processing payment intent - Order: ${orderId}, Amount: ${amount} cents, Email: ${email}`);

    // Validate Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return res.status(500).json({
        error: 'Payment service configuration error',
        message: 'Stripe key not configured',
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'sgd',
      payment_method_types: ['card'],
      metadata: {
        orderId: orderId,
      },
      description: `Royal Wings Order #${orderId}`,
    });

    console.log('Payment Intent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * Verify payment status
 * POST /api/stripe/verify-payment
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Missing required field: paymentIntentId',
      });
    }

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      error: 'Failed to verify payment',
      message: error.message,
    });
  }
});

/**
 * Webhook handler for Stripe events
 * POST /api/stripe/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;

  // Verify webhook signature
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.sendStatus(400);
    }
  } else {
    // If no webhook secret, parse the body directly (for testing)
    event = JSON.parse(req.body);
  }

  console.log('Webhook event received:', event.type);

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object.id);
      // Update order status to paid
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      // Update order status to failed
      break;
    case 'checkout.session.completed':
      console.log('Checkout session completed:', event.data.object.id);
      // Update order status to paid
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;

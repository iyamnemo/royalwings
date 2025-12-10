# Payment Processing Troubleshooting Guide

## Symptoms and Solutions

### Issue 1: "Initializing payment..." Stuck Indefinitely

**Root Causes:**
- Backend service is down or not responding
- Incorrect API URL in client `.env`
- Network connectivity issues
- CORS blocking the request

**Solutions:**
1. **Check Backend Status**
   ```
   curl https://royalwings-backend.onrender.com/health
   ```
   - If this returns an error, your backend is down

2. **Verify API URL in Client**
   - Open `client/.env`
   - Check: `VITE_API_URL=https://royalwings-backend.onrender.com`
   - Should match your actual Render backend URL

3. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for network errors or CORS issues
   - Note the exact error message

4. **Check Network Tab**
   - In DevTools, go to Network tab
   - Try placing order again
   - Look for failed requests to `/api/stripe/create-payment-intent`
   - Click on the failed request to see response details

---

### Issue 2: 404 Error on Payment Intent Creation

**Root Cause:** The backend route `/api/stripe/create-payment-intent` is not responding

**Solutions:**
1. **Verify Routes are Registered**
   - Check `server/src/index.js` has: `app.use('/api/stripe', stripeRoutes);`
   
2. **Verify Stripe Routes File Exists**
   - Ensure `server/src/routes/stripeRoutes.js` exists
   - Check it exports the router correctly: `module.exports = router;`

3. **Check Render Deployment**
   - Push your latest code to GitHub
   - Verify Render shows "Deploy successful"
   - Check Render logs for any errors during deployment

---

### Issue 3: "Failed to create payment intent" - Stripe Key Error

**Root Cause:** Missing or invalid `STRIPE_SECRET_KEY` environment variable

**Solutions:**
1. **Set Environment Variables on Render**
   - Dashboard → Your Service → Environment
   - Add `STRIPE_SECRET_KEY=sk_test_YOUR_KEY`
   - Redeploy after adding variables

2. **Verify Key Format**
   - Should start with `sk_test_` (for testing) or `sk_live_` (for production)
   - Should be about 100+ characters long

3. **Check Render Logs**
   - In Render dashboard, click "Logs"
   - You should see: `Payment Intent created: pi_xxxxx`
   - If you see errors about Stripe key, environment variable isn't set

---

### Issue 4: Payment Modal Opens but Card Processing Fails

**Root Causes:**
- Invalid Stripe Publishable Key
- Card details are incorrect
- Stripe account configuration issue

**Solutions:**
1. **Verify Stripe Keys Match**
   - Client: `VITE_STRIPE_PUBLISHABLE_KEY` (should start with `pk_`)
   - Server: `STRIPE_SECRET_KEY` (should start with `sk_`)
   - Both should be from the same Stripe account
   - Both should be test keys (not live) unless in production

2. **Use Stripe Test Cards**
   - For testing, use: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits
   - See full list: https://stripe.com/docs/testing

3. **Check Stripe Dashboard**
   - Go to stripe.com
   - Ensure you're in Test mode (toggle in top right)
   - Verify publishable and secret keys match your `.env` files

---

## Step-by-Step Debugging Process

### Step 1: Verify Backend is Running
```bash
# Test the health endpoint
curl https://royalwings-backend.onrender.com/health
```
Expected response: `{"status":"ok","message":"Server is running"}`

### Step 2: Check Environment Variables
1. In Render dashboard, go to your service
2. Click "Environment" → Check all variables are set:
   - `STRIPE_SECRET_KEY` ✓
   - `NODE_ENV` set to `production` ✓

### Step 3: Test from Browser Console
```javascript
// Test API URL
fetch('https://royalwings-backend.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log(d))

// Test payment intent creation
fetch('https://royalwings-backend.onrender.com/api/stripe/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'test-123',
    amount: 6700,  // PHP 67.00 in cents
    email: 'test@example.com'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

### Step 4: Check Render Logs
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Look for:
   - `Payment Intent created: pi_xxxxx` (success)
   - `STRIPE_SECRET_KEY environment variable is not set` (missing key)
   - Any other error messages

---

## Common Configuration Mistakes

| Mistake | Fix |
|---------|-----|
| Using Render API endpoint instead of backend URL | Use `https://royalwings-backend.onrender.com` |
| Stripe keys swapped | Publishable starts with `pk_`, Secret starts with `sk_` |
| Using live keys in development | Use test keys (start with `_test_`) |
| Environment variables not set on Render | Go to Environment tab and add them |
| Not redeploying after env var changes | Redeploy service in Render |
| Using localhost in production `.env` | Should use full Render URL |
| Missing `/api/stripe` route mounting | Ensure `app.use('/api/stripe', stripeRoutes);` in index.js |

---

## Getting Help

If you're still stuck:

1. **Collect this information:**
   - Screenshot of the error
   - Browser console error message
   - Render logs (last 20 lines)
   - Your Render backend URL

2. **Check These Files:**
   - `client/.env` (VITE_API_URL correct?)
   - `server/src/index.js` (routes registered?)
   - Render Environment settings (all variables set?)

3. **Test Endpoints:**
   - Health: `https://royalwings-backend.onrender.com/health`
   - Create Intent: Make the POST request from Step 3 above

# Deployment Checklist

## Pre-Deployment Verification

### Client-Side (Vercel)

- [ ] `.env` file has correct values:
  ```
  VITE_API_URL=https://royalwings-backend.onrender.com
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
  ```
  
- [ ] Replace `royalwings-backend.onrender.com` with your actual Render backend URL
- [ ] Stripe publishable key matches your Stripe account
- [ ] All Firebase config values are correct
- [ ] Built app runs locally without errors: `npm run build && npm run preview`

### Server-Side (Render)

- [ ] All files are pushed to GitHub:
  ```bash
  git add .
  git commit -m "Update server configuration"
  git push origin main
  ```

- [ ] **Environment Variables Set in Render:**
  - [ ] `STRIPE_SECRET_KEY=sk_test_xxxx`
  - [ ] `STRIPE_PUBLISHABLE_KEY=pk_test_xxxx`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`

- [ ] Backend Render service details:
  - [ ] Service name: `royalwings-backend` (or your name)
  - [ ] Root directory: `client/server` (if server is in that folder)
  - [ ] Start command: `npm start`
  - [ ] Build command: `npm install`

---

## Post-Deployment Tests

### Test 1: Backend Health Check
```bash
curl https://royalwings-backend.onrender.com/health
```
Expected: `{"status":"ok","message":"Server is running"}`

### Test 2: Payment Intent Creation
```bash
curl -X POST https://royalwings-backend.onrender.com/api/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test123","amount":6700,"email":"test@example.com"}'
```
Expected: `{"clientSecret":"pi_xxxxx_secret_xxxxx","paymentIntentId":"pi_xxxxx"}`

### Test 3: Full Payment Flow
1. Go to `https://royalwings.vercel.app`
2. Add items to cart
3. Proceed to checkout
4. Try to place an order
5. Payment modal should appear quickly (not stuck on "Initializing")
6. Use Stripe test card: `4242 4242 4242 4242`

---

## Environment Variables Reference

### Stripe Keys
- Get from: https://dashboard.stripe.com/test/apikeys
- **Test Mode (for development):**
  - Publishable Key: `pk_test_...`
  - Secret Key: `sk_test_...`
- **Live Mode (for production - DON'T USE YET):**
  - Publishable Key: `pk_live_...`
  - Secret Key: `sk_live_...`

### Firebase Keys
- Get from: Firebase Console → Project Settings
- Copy the config object and use those values
- Private key must be the actual JSON private key file contents

---

## Troubleshooting During Deployment

### Backend Won't Deploy
1. Check Render build logs for errors
2. Ensure all dependencies are in `server/package.json`
3. Verify root directory is correct in Render settings
4. Check for syntax errors: `node client/server/src/index.js`

### Payment Still Fails After Deployment
1. Check Render logs for the specific error
2. Verify environment variables are set (Render → Environment tab)
3. Redeploy after changing environment variables
4. Test health endpoint works

### CORS Errors
1. Browser console shows: "Access to XMLHttpRequest ... blocked by CORS"
2. Add your Vercel URL to CORS whitelist in `server/src/index.js`
3. Current whitelist includes: `https://royalwings.vercel.app`
4. If using different domain, update the list and redeploy

---

## Quick Deployment Steps

### For Client (Vercel)
1. Update `.env` with production values
2. Run `npm run build` (verify no errors)
3. Push to GitHub: `git push`
4. Vercel auto-deploys (check dashboard)

### For Server (Render)
1. Ensure all code is pushed to GitHub
2. Go to Render dashboard
3. Select service → Manual Deploy → Deploy latest commit
4. Wait for deployment to complete
5. Check logs for errors
6. Test health endpoint

---

## Success Indicators

✅ **You're ready to go when:**
1. `https://royalwings-backend.onrender.com/health` returns success
2. Payment intent creation endpoint responds (no 404)
3. Client `.env` has correct `VITE_API_URL`
4. Stripe keys are valid and set on Render
5. Orders can be placed without "Initializing payment..." getting stuck
6. Payment modal appears and accepts card details

---

## Important Notes

⚠️ **DO NOT:**
- Commit `.env` files to GitHub (they should be in `.gitignore`)
- Use test Stripe keys in production
- Share your secret keys publicly
- Deploy without testing locally first

✅ **DO:**
- Keep environment variables in Render dashboard (not in code)
- Use test keys for development, live keys for production
- Test payment flow after deployment
- Monitor Render logs for issues

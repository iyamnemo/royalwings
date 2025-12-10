# Render Backend Setup Guide

## Environment Variables Required on Render

When deploying your Node.js backend server to Render, you need to set these environment variables in the Render dashboard:

### Required Environment Variables

```
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET (optional initially)

FIREBASE_PROJECT_ID=royalwings-c87a4
FIREBASE_PRIVATE_KEY=your-firebase-private-key-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@royalwings-c87a4.iam.gserviceaccount.com

NODE_ENV=production
PORT=5000
```

### Steps to Set Up on Render

1. **Go to your Render Service**
   - Navigate to your backend service in Render dashboard
   - Click on "Environment" in the left sidebar

2. **Add Environment Variables**
   - Click "Add Environment Variable"
   - Paste each key-value pair from above
   - Make sure to use your actual keys from Stripe and Firebase

3. **Critical Configuration**
   - Ensure `STRIPE_SECRET_KEY` is set correctly (starts with `sk_test_` or `sk_live_`)
   - Verify `STRIPE_PUBLISHABLE_KEY` matches what's in your client `.env`
   - Make sure `NODE_ENV=production` is set

4. **Redeploy**
   - After adding environment variables, redeploy your service
   - Go to "Deploys" tab and click "Deploy latest commit" or push new code

## Troubleshooting

### Payment Intent Creation Fails (404 Error)
- Check that Render backend is running: `https://royalwings-backend.onrender.com/health`
- Verify all environment variables are set (especially `STRIPE_SECRET_KEY`)
- Check Render logs for specific error messages

### CORS Errors
- The backend CORS is configured to accept requests from `https://royalwings.vercel.app`
- If using a different Vercel URL, update `client/server/src/index.js` CORS origins list

### Payment Stays "Initializing"
1. Open browser DevTools (F12) → Console tab
2. Check for error messages
3. Common causes:
   - Backend is down or not responding
   - Stripe key is invalid
   - Network connectivity issue
   - CORS blocking the request

## Verifying the Setup

Test the backend health:
```
curl https://royalwings-backend.onrender.com/health
```

You should get:
```json
{"status":"ok","message":"Server is running"}
```

## For Development (Local Testing)

Make sure your local `.env` file in the server directory has:
```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
NODE_ENV=development
```

Then run:
```
npm run dev
```

The server will run on `http://localhost:5000`

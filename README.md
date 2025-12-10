# RoyalWings - Restaurant Ordering & Booking System

A comprehensive full-stack restaurant management platform built with React, TypeScript, Vite, Node.js, Express, Firebase, and Stripe integration. Features an intuitive ordering system, table booking management, and admin dashboard.

## 🌟 Features

### Customer Features
- 🔐 User authentication (Login/Register)
- 🍽️ Browse menu with categorized items
- 🎨 View menu items with images, descriptions, and pricing
- 🛒 Shopping cart with quantity management
- 💳 Stripe payment integration
- 📦 Order tracking and order history
- 🎫 Table booking and reservations
- 📲 Real-time order status updates
- 🧾 Digital receipts

### Admin Features
- 📊 Admin dashboard with analytics
- 🍲 Menu management (add, edit, delete items)
- 🏷️ Category management
- 📋 Order management and status updates
- 🎟️ Booking management
- 🖼️ Image upload for menu items
- ⏰ Store open/close status control
- 📈 Order and booking history

### Technical Features
- 🎯 Alphabetically sorted menu items
- 🔄 Real-time Firestore updates
- 🔒 Role-based access control
- 📱 Responsive design (Tailwind CSS)
- ✅ Form validation (Yup + React Hook Form)
- 🌐 RESTful API
- 🔐 Firebase security rules
- 💾 Cloud storage integration

## 📁 Project Structure

```
RoyalWings/
├── client/                           # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable React components (15 components)
│   │   │   ├── AuthNavbar.tsx       # Auth navigation bar
│   │   │   ├── BookingForm.tsx      # Booking reservation form
│   │   │   ├── CartItem.tsx         # Shopping cart item
│   │   │   ├── CartPopup.tsx        # Cart popup/sidebar
│   │   │   ├── CategoryForm.tsx     # Category management form
│   │   │   ├── FlavorSelector.tsx   # Item flavor selection modal
│   │   │   ├── ImageUpload.tsx      # Image upload handler
│   │   │   ├── MenuCard.tsx         # Individual menu item card
│   │   │   ├── MenuCarousel.tsx     # Featured items carousel
│   │   │   ├── MenuGrid.tsx         # Menu items grid with search/filter
│   │   │   ├── MenuItemForm.tsx     # Menu item creation/edit form
│   │   │   ├── Navigation.tsx       # Main navigation component
│   │   │   ├── ProtectedRoute.tsx   # Route authentication guard
│   │   │   ├── Receipt.tsx          # Order receipt display
│   │   │   └── StripeCheckout.tsx   # Stripe payment form
│   │   ├── pages/                   # Page components (12 pages)
│   │   │   ├── AdminPage.tsx        # Admin dashboard
│   │   │   ├── AdminBookingsPage.tsx # Admin booking management
│   │   │   ├── AdminOrdersPage.tsx  # Admin order management
│   │   │   ├── BookingPage.tsx      # Customer booking page
│   │   │   ├── CartPage.tsx         # Shopping cart page
│   │   │   ├── Login.tsx            # Login page
│   │   │   ├── MenuPage.tsx         # Menu browsing page
│   │   │   ├── OrderConfirmation.tsx # Order confirmation page
│   │   │   ├── OrderHistory.tsx     # Customer order history
│   │   │   ├── OrderStatus.tsx      # Real-time order status tracking
│   │   │   ├── Register.tsx         # User registration page
│   │   │   └── UserBookingsPage.tsx # Customer bookings page
│   │   ├── services/                # Firebase & API services
│   │   │   ├── bookingService.ts    # Booking CRUD operations
│   │   │   ├── menuService.ts       # Menu item management
│   │   │   ├── orderService.ts      # Order processing & tracking
│   │   │   └── stripeService.ts     # Stripe payment processing
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AuthContext.tsx      # Authentication state management
│   │   │   └── CartContext.tsx      # Shopping cart state management
│   │   ├── types/                   # TypeScript type definitions
│   │   │   ├── booking.ts           # Booking interfaces
│   │   │   ├── cart.ts              # Cart interfaces
│   │   │   ├── index.ts             # Common type exports
│   │   │   ├── menu.ts              # Menu item interfaces
│   │   │   └── order.ts             # Order interfaces
│   │   ├── utils/                   # Utility functions
│   │   │   └── formatters.ts        # Price formatting utilities
│   │   ├── config/                  # Configuration
│   │   │   └── firebase.ts          # Firebase initialization
│   │   ├── App.tsx                  # Main app component with routing
│   │   ├── index.css                # Global styles
│   │   └── main.tsx                 # React entry point
│   ├── public/                       # Static assets
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── eslint.config.js             # ESLint configuration
│
├── server/                           # Express Backend
│   ├── src/
│   │   ├── index.js                 # Server entry point
│   │   ├── config/
│   │   │   ├── firebase.js          # Firebase Admin SDK configuration
│   │   │   └── serviceAccountKey.json # Firebase service account
│   │   ├── routes/
│   │   │   ├── stripeRoutes.js      # Stripe payment routes
│   │   │   └── uploadRoutes.js      # File upload routes
│   │   └── scripts/
│   │       └── createAdmin.js       # Admin user creation script
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Backend environment variables
│
├── firebase/                        # Firebase configuration
│   ├── firestore.rules              # Firestore security rules
│   └── storage.rules                # Cloud Storage security rules
│
├── firebase.json                    # Firebase project configuration
├── firestore.indexes.json           # Firestore index configuration
└── README.md                        # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14 or higher
- **npm** v6 or higher
- **Firebase** account with a project created
- **Stripe** account (for payment processing)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RoyalWings
   ```

2. **Setup Frontend**
   ```bash
   cd client
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

### Configuration

#### Frontend Environment Variables (`client/.env`)

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
VITE_API_URL=http://localhost:5000
```

#### Backend Environment Variables (`server/.env`)

```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
NODE_ENV=development
```

### Running the Application

#### Development Mode

**Terminal 1 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```

The application will be available at `http://localhost:5173` (Vite default)

### Admin Account Setup

After setting up the project, you need to create an admin account to access the admin dashboard.

#### Creating Admin User

1. **Navigate to the server scripts directory**
   ```bash
   cd server
   ```

2. **Run the admin creation script**
   ```bash
   node scripts/createAdmin.js admin@example.com password123
   ```

   **Parameters:**
   - First argument: Admin email address
   - Second argument: Admin password

3. **Example:**
   ```bash
   node scripts/createAdmin.js admin@royalwings.com SecurePassword123
   ```

4. **Success Output**
   ```
   Successfully created admin user:
   Email: admin@royalwings.com
   User UID: [generated-uid]
   Role: admin
   ```

⚠️ **Important Notes:**
- The script uses your Firebase service account key (`serviceAccountKey.json`)
- Make sure the service account key is in `server/config/serviceAccountKey.json`
- Use a strong password for the admin account
- Store the admin credentials securely
- You can create multiple admin accounts by running the script multiple times with different emails

#### Logging in as Admin

1. Go to `http://localhost:5173/login`
2. Enter your admin email and password
3. You'll be redirected to the admin dashboard at `/admin`

#### Admin Dashboard Features

Once logged in as admin, you can:
- View all orders and update their status
- Manage menu items (add, edit, delete)
- Manage menu categories
- View and manage table bookings
- Control store open/close status
- View order and booking history

#### Production Admin Creation

For production deployment:

```bash
# Set environment variables for production Firebase
export FIREBASE_PROJECT_ID=your-prod-project-id
export FIREBASE_PRIVATE_KEY=your-prod-private-key
export FIREBASE_CLIENT_EMAIL=your-prod-client-email

# Run the admin creation script
node scripts/createAdmin.js admin@yourdomain.com ProductionPassword123
```

#### Production Build

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

**Backend:**
```bash
cd server
npm run start
```

## 📦 Dependencies

### Frontend
- **React** 18.2.0 - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** 10.5.2 - Backend services (Auth, Firestore, Storage)
- **Stripe** - Payment processing
- **React Router** v6 - Client-side routing
- **React Hook Form** - Efficient form handling
- **Yup** - Schema validation
- **React Hot Toast** - Toast notifications
- **ESLint** - Code linting

### Backend
- **Express** 5.1.0 - Web framework
- **Firebase Admin SDK** 13.5.0 - Server-side Firebase
- **Stripe** 20.0.0 - Payment API
- **CORS** - Cross-origin resource sharing
- **Multer** - File upload middleware
- **Dotenv** - Environment variable management
- **Nodemon** - Development auto-reload

## 🔐 Authentication & Security

- Firebase Authentication (Email/Password)
- Role-based access control (Admin/Customer)
- Protected routes for authenticated users only
- Firestore security rules for database access
- Cloud Storage security rules for file uploads
- Stripe webhook verification for payments
- **Password Reset via Email** - Secure password recovery using Firebase

### Password Reset / Forgot Password Feature

RoyalWings includes a complete password recovery system using Firebase's built-in email authentication:

#### How It Works

1. **Request Password Reset** - User navigates to `/forgot-password`
2. **Enter Email** - User enters their registered email address
3. **Firebase Sends Email** - Firebase automatically sends a password reset link via Gmail
4. **Click Reset Link** - User clicks the link in their email (valid for 1 hour)
5. **New Password Page** - Reset link redirects to `/reset-password`
6. **Set New Password** - User enters and confirms their new password
7. **Password Updated** - Automatic redirect to login page

#### Pages & Routes

| Route | Purpose | Public |
|-------|---------|--------|
| `/forgot-password` | Request password reset email | ✅ Yes |
| `/reset-password?oobCode=...` | Reset password with verification code | ✅ Yes |
| `/login` | Sign in (includes "Forgot password?" link) | ✅ Yes |

#### Key Features

- ✅ Email validation before sending reset email
- ✅ One-click password reset from email
- ✅ Automatic code verification
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, number)
- ✅ Password confirmation matching
- ✅ 1-hour reset link expiration
- ✅ User-friendly error messages
- ✅ Toast notifications for all actions
- ✅ Responsive design on all devices

#### Firebase Console Configuration

To customize the password reset email template:

1. Go to Firebase Console → Authentication → Templates
2. Click on "Password reset" email template
3. Customize:
   - Email subject
   - Email content
   - Add your logo/branding
   - Change button text and colors
4. Save changes

**Default Email Variables:**
- `%LINK%` - Password reset link
- `%EMAIL%` - User's email address
- `%APP_NAME%` - Application name (RoyalWings)

#### Testing Password Reset

1. Create a test account in the application
2. Go to `/forgot-password`
3. Enter your email
4. Check your email inbox (may take a few seconds)
5. Click the reset link
6. Enter a new password meeting the requirements
7. Confirm the password change

#### Troubleshooting Password Reset

| Issue | Solution |
|-------|----------|
| Email not received | Check spam folder, verify email is correct |
| Reset link expired | Request a new reset link (links valid for 1 hour) |
| "User not found" | Verify email is registered with the system |
| "Invalid reset code" | Link may be expired, request new reset |
| Password too weak | Must include 8+ chars, uppercase, lowercase, number |

## 🗄️ Database Schema

### Collections (Firestore)

- **users** - User profiles and roles
- **menuItems** - Menu item catalog with images and pricing
- **categories** - Menu categories
- **orders** - Customer orders with items and status
- **bookings** - Table reservations
- **storeStatus** - Store open/close status

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **PostCSS** for CSS processing
- **Responsive design** - Mobile, tablet, and desktop optimized
- **Gradient colors** - Modern gradient UI elements
- **Animation** - Smooth transitions and hover effects

## 🛠️ Development Tools & Technologies

### Frontend Tools
| Tool | Purpose | Version |
|------|---------|---------|
| **Vite** | Build tool and dev server | 4.4.5 |
| **TypeScript** | Type-safe JavaScript | 5.0.2 |
| **ESLint** | Code quality and linting | 8.45.0 |
| **Tailwind CSS** | Utility-first CSS framework | 3.3.5 |
| **PostCSS** | CSS processing | 8.4.31 |
| **React Hot Toast** | Toast notifications | 2.6.0 |

### Backend Tools
| Tool | Purpose | Version |
|------|---------|---------|
| **Express.js** | Web framework | 5.1.0 |
| **Nodemon** | Auto-reload during development | 3.1.10 |
| **Multer** | File upload handling | 2.0.2 |
| **Firebase Admin SDK** | Server-side Firebase operations | 13.5.0 |
| **CORS** | Cross-origin resource sharing | 2.8.5 |
| **Stripe** | Payment processing | 20.0.0 |

### External Services
| Service | Purpose | Integration |
|---------|---------|-------------|
| **Firebase Authentication** | User login & registration | Email/Password auth |
| **Firestore** | Cloud database | Real-time data sync |
| **Cloud Storage** | Image & file storage | Menu item images |
| **Stripe** | Payment processing | Card payments |

### Development Environment
- **Node.js** - JavaScript runtime
- **npm** - Package manager
- **Git** - Version control
- **VS Code** (Recommended) - Code editor

## 📱 Pages & Routes

```
/                    → Login page
/register            → User registration
/menu                → Browse menu (sorted alphabetically)
/cart                → Shopping cart
/checkout            → Stripe payment checkout
/order-confirmation  → Order confirmation
/order-status/:id    → Track order in real-time
/order-history       → View past orders
/booking             → Make table reservations
/user-bookings       → View user's bookings
/admin               → Admin dashboard
/admin/orders        → Manage orders
/admin/bookings      → Manage bookings
```

## 🔧 Available Scripts

### Frontend

```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend

```bash
npm run dev        # Start with nodemon (hot reload)
npm run start      # Start production server
npm run test       # Run tests
```

## 🎯 Key Features Breakdown

### Menu Management
- Alphabetically sorted menu items
- Category filtering
- Search functionality
- Featured items carousel
- Item availability toggle
- Image upload support
- Flavor selection for customizable items

### Ordering System
- Add items to cart with quantity management
- Real-time cart updates
- Stripe payment integration
- Order confirmation with receipt
- Order status tracking
- Order history view
- Pickup code generation

### Booking System
- Date and time selection
- Party size management
- Special requests field
- Booking confirmation
- Booking history
- Availability management

### Admin Features
- Dashboard with key metrics
- Menu item CRUD operations
- Category management
- Order management with status updates
- Booking management
- Store status control
- Customer viewing

## 🚨 Troubleshooting

### Common Issues

1. **Firebase connection errors**
   - Verify all environment variables are set correctly
   - Check Firebase project configuration

2. **Stripe payment failures**
   - Ensure Stripe keys are correct
   - Check webhook configuration in Stripe dashboard

3. **Image upload issues**
   - Verify Cloud Storage security rules
   - Check file size limits in Multer configuration

## 👥 Support & Contribution

For issues, feature requests, or contributions, please email me at galapon.luismiguel.paterno@gmail.com



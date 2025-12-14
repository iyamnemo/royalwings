import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { menuService } from '../services/menuService';
import { authService } from '../services/authService';
import { MenuItem } from '../types/menu';
import AuthNavbar from '../components/AuthNavbar';
import { auth } from '../config/firebase';

interface RegisterFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        console.log('Fetching menu items...');
        const items = await menuService.getAllMenuItems();
        console.log('Fetched items:', items);
        const featuredItems = items.filter(item => item.featured);
        const itemsToShow = featuredItems.length > 0 ? featuredItems : items.slice(0, 6);
        setMenuItems(itemsToShow);
        if (items.length === 0) {
          setError('No menu items available yet. Start by adding items in the admin panel.');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try refreshing the page.');
        setTimeout(() => {
          fetchMenuItems();
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 150) {
      toast.error('Email cannot exceed 150 characters', {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 150) {
      toast.error('Password cannot exceed 150 characters', {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 150) {
      toast.error('Confirm password cannot exceed 150 characters', {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
    }
  };
  const {
    register,
    handleSubmit,
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await signUp(data.email, data.password);
      
      // Send verification email
      if (auth.currentUser) {
        await authService.sendVerificationEmail(auth.currentUser);
      }
      
      toast.success('Account created! Check your email to verify.', {
        duration: 2000,
        position: 'top-right',
        icon: '✓',
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
      // Redirect to email verification page
      setTimeout(() => navigate('/verify-email'), 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create an account', {
        duration: 4000,
        position: 'top-right',
        icon: '✕',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
    }
  };

  const onError = (errors: any) => {
    if (errors.email) {
      toast.error(errors.email.message || 'Email is required', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
    }
    if (errors.password) {
      toast.error(errors.password.message || 'Password is required', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
    }
    if (errors.confirmPassword) {
      toast.error(errors.confirmPassword.message || 'Passwords do not match', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        },
      });
    }
  };

  const handleNavigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AuthNavbar onNavigateToSection={handleNavigateToSection} />
      
      {/* HOME SECTION - Registration Form */}
      <section id="home-section" className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-32">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side*/}
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Join Royal Wings</h1>
              <p className="text-xl text-gray-600 mb-8">
                Create an account and start ordering delicious meals from our restaurant
              </p>
              <div className="flex gap-4">
                <p className="text-xl text-gray-600 mb-8">
                  Already have an account?  
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-3 px-8 rounded-lg border-2 border-blue-600 transition"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Right Side */}
            <div className="bg-white rounded-lg shadow-2xl p-8 border-2 border-teal-200 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit, onError)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    maxLength={150}
                    onChange={(e) => {
                      register('email').onChange?.(e);
                      handleEmailChange(e);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      maxLength={150}
                      onChange={(e) => {
                        register('password').onChange?.(e);
                        handlePasswordChange(e);
                      }}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      maxLength={150}
                      onChange={(e) => {
                        register('confirmPassword').onChange?.(e);
                        handleConfirmPasswordChange(e);
                      }}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    >
                      <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold rounded-lg transition"
                >
                  Create Account
                </button>
              </form>
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MENU SECTION - Featured Menu Items */}
      <section id="menu-section" className="min-h-screen bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Featured Menu</h2>
            <p className="text-center text-gray-600 text-lg">Discover our delicious selection of offerings</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-teal-700 py-8 bg-teal-50 rounded-lg p-8">
              <p className="text-lg">{error}</p>
            </div>
          ) : menuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition border border-teal-100"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-teal-600">
                        ₱{item.price.toFixed(2)}
                      </span>
                      {item.category && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">No menu items available yet</div>
          )}
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about-section" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Royal Wings</h2>
            <p className="text-xl text-gray-600">Learn more about our restaurant and mission</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Mission & Vision */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-teal-600">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <i className="fa-solid fa-bullseye text-teal-600"></i> Our Mission
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To serve delicious, high-quality meals with exceptional customer service. We believe in using fresh ingredients and authentic recipes to create memorable dining experiences.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <i className="fa-solid fa-eye text-blue-600"></i> Our Vision
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To become the most trusted and beloved restaurant in the region, known for our commitment to quality, taste, and customer satisfaction.
                </p>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-teal-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Royal Wings?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                    <i className="fa-solid fa-check text-cyan-600"></i>
                  </div>
                  <p className="text-gray-700 pt-1">Premium ingredients sourced from trusted suppliers</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fa-solid fa-check text-blue-600"></i>
                  </div>
                  <p className="text-gray-700 pt-1">Expert chefs with years of culinary experience</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <i className="fa-solid fa-check text-indigo-600"></i>
                  </div>
                  <p className="text-gray-700 pt-1">Fast and reliable delivery service</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <i className="fa-solid fa-check text-green-600"></i>
                  </div>
                  <p className="text-gray-700 pt-1">Friendly and attentive customer service</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                    <i className="fa-solid fa-check text-pink-600"></i>
                  </div>
                  <p className="text-gray-700 pt-1">Affordable prices without compromising quality</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Connect & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <i className="fa-solid fa-handshake text-blue-600"></i> Connect With Us
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 flex items-center gap-3">
                  <i className="fa-solid fa-phone text-blue-600 w-6"></i>
                  <span>+63 (2) 1234-5678</span>
                </p>
                <p className="text-gray-700 flex items-center gap-3">
                  <i className="fa-solid fa-envelope text-blue-600 w-6"></i>
                  <span>demo@royalwings.com</span>
                </p>
                <p className="text-gray-700 flex items-center gap-3">
                  <i className="fa-solid fa-clock text-blue-600 w-6"></i>
                  <span>Open Daily: 01:00 PM - 11:00 PM</span>
                </p>
                <div className="flex gap-4 pt-4">
                  <a href="https://www.facebook.com/royalwingschicken" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg shadow-lg p-8 border border-teal-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <i className="fa-solid fa-map-pin text-teal-600"></i> Visit Us
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>Royal Wings Restaurant</strong><br />
                  Ph 2, Purok 5 Lupang Pangako<br />
                  Payatas B, Quezon City, Philippines
                </p>
                <div className="mt-6 bg-white rounded-lg p-4 border border-teal-200">
                  <p className="text-sm text-gray-600 mb-3">
                    <i className="fa-solid fa-info-circle text-teal-600 mr-2"></i>
                    Get directions and find us on Google Maps for the best route to our restaurant.
                  </p>
                  <a href="https://www.google.com/maps/place/Royal+wings/@14.7185492,121.1066641,17z/data=!3m1!4b1!4m6!3m5!1s0x3397bbb11258d741:0xb0c34b838ff5f54!8m2!3d14.7185492!4d121.1066641!16s%2Fg%2F11thhf78jb?entry=ttu&g_ep=EgoyMDI1MTIwMi4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="inline-block w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition">
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Toaster />
    </>
  );
};

export default Register;

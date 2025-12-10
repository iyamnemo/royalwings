import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface ForgotPasswordFormInputs {
  email: string;
}

const schema = yup.object().shape({
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
});

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ForgotPasswordFormInputs>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setIsLoading(true);
    try {
      // Check if email exists in database
      const emailExists = await authService.checkEmailExists(data.email);
      console.log('Validation check - Email exists:', emailExists, 'for:', data.email);
      
      if (!emailExists) {
        console.log('Email not found in Firestore');
        toast.error('No account found with this email address', {
          duration: 4000,
          position: 'top-center',
        });
        setIsLoading(false);
        return;
      }

      // Send password reset email
      console.log('Sending password reset to:', data.email);
      await authService.sendPasswordResetEmail(data.email);
      setSentEmail(data.email);
      setEmailSent(true);
      reset();
      toast.success('Password reset email sent! Check your inbox.', {
        duration: 4000,
        position: 'top-center',
      });
    } catch (error: any) {
      let errorMessage = 'Failed to send password reset email';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
              Email Sent!
            </h1>

            {/* Message */}
            <p className="text-center text-slate-600 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-center text-blue-600 font-semibold mb-6 break-all">
              {sentEmail}
            </p>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Next steps:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Check your email (including spam folder)</li>
                <li>✓ Click the password reset link</li>
                <li>✓ Enter your new password</li>
                <li>✓ Sign in with your new password</li>
              </ul>
            </div>

            {/* Note */}
            <p className="text-xs text-slate-500 text-center mb-6">
              The reset link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Send to another email
              </button>
              <Link
                to="/login"
                className="w-full py-2.5 rounded-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:from-cyan-700 hover:to-blue-700 transition-all active:scale-95 text-center block"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            {/* Back Button */}
            <Link
              to="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Login
            </Link>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-slate-600 mb-8">
            No problem. Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 14.586l-6.687-6.687a1 1 0 00-1.414 1.414l8.101 8.101a1 1 0 001.414 0l10.101-10.101z" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-all active:scale-95 ${
                isLoading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:from-cyan-700 hover:to-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-slate-300"></div>
            <span className="px-4 text-slate-500 text-sm">Or</span>
            <div className="flex-1 border-t border-slate-300"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-600 mb-2">
              Remember your password?
            </p>
            <Link
              to="/login"
              className="inline-block text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

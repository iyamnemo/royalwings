import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { auth } from '../config/firebase';
import { sendEmailVerification, reload } from 'firebase/auth';

const EmailVerification = () => {
  const navigate = useNavigate();
  const { currentUser, emailVerified } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check if email is verified when component mounts or emailVerified changes
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // If email is already verified, redirect immediately
    if (emailVerified && !hasRedirected) {
      setHasRedirected(true);
      toast.success('Email verified! Redirecting...', {
        duration: 2000,
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
        },
      });
      setTimeout(() => navigate('/menu'), 2000);
    } else if (!emailVerified) {
      setLoading(false);
    }
  }, [emailVerified, currentUser, navigate, hasRedirected]);

  // Resend verification email
  const handleResendEmail = async () => {
    if (!currentUser) return;

    try {
      setResendLoading(true);
      await sendEmailVerification(currentUser);
      
      toast.success('Verification email sent! Check your inbox.', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
        },
      });

      // Start 60 second cooldown
      setResendCooldown(60);
      const countdown = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '16px',
        },
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Email Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-envelope text-4xl text-blue-600"></i>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          We've sent a verification link to<br />
          <span className="font-semibold text-gray-900">{currentUser?.email}</span>
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-700 mb-3">
            <strong>What to do:</strong>
          </p>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Check your email inbox</li>
            <li>Click the verification link</li>
            <li>Come back here to continue</li>
          </ol>
        </div>

        {/* Status */}
        {loading ? (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-sm font-medium">Waiting for verification...</span>
            </div>
          </div>
        ) : null}

        {/* Resend Button */}
        <button
          onClick={handleResendEmail}
          disabled={resendLoading || resendCooldown > 0}
          className="w-full mb-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendLoading ? (
            'Sending...'
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            "Didn't receive email? Resend"
          )}
        </button>

        {/* Spam reminder */}
        <p className="text-xs text-gray-500 mb-4">
          💡 Check your spam/junk folder if you don't see the email
        </p>

        {/* Support info */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-600 mb-4">
            Having trouble? Contact us at <br />
            <a href="mailto:support@royalwings.com" className="text-blue-600 hover:underline font-semibold">
              support@royalwings.com
            </a>
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Back to Login
          </button>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default EmailVerification;

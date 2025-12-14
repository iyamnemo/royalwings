import {
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  sendEmailVerification as firebaseSendEmailVerification,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { query, where, collection, getDocs } from 'firebase/firestore';

export const authService = {
  /**
   * Check if an email is registered in the database
   * @param email - User's email address
   * @returns Promise<boolean> - True if email exists, false otherwise
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const emailLower = email.toLowerCase();
      console.log('Checking Firestore for email:', emailLower);
      const q = query(collection(db, 'users'), where('email', '==', emailLower));
      const querySnapshot = await getDocs(q);
      console.log('Firestore query result - size:', querySnapshot.size);
      querySnapshot.docs.forEach(doc => {
        console.log('Found user:', doc.data());
      });
      return querySnapshot.size > 0;
    } catch (error) {
      console.error('Error checking email in Firestore:', error);
      // If there's an error checking, we'll proceed with password reset anyway
      // Firebase will handle the error if email doesn't exist
      return true;
    }
  },

  /**
   * Send a password reset email to the user
   * @param email - User's email address
   * @returns Promise<void>
   */
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Please try again later');
      } else {
        throw error;
      }
    }
  },

  /**
   * Verify a password reset code
   * @param code - Password reset code from email
   * @returns Promise<string> - User's email associated with the code
   */
  verifyPasswordResetCode: async (code: string): Promise<string> => {
    try {
      const email = await firebaseVerifyPasswordResetCode(auth, code);
      return email;
    } catch (error: any) {
      if (error.code === 'auth/invalid-action-code') {
        throw new Error('This password reset link is invalid or has expired');
      } else if (error.code === 'auth/expired-action-code') {
        throw new Error('This password reset link has expired');
      } else {
        throw error;
      }
    }
  },

  /**
   * Confirm password reset with new password
   * @param code - Password reset code from email
   * @param newPassword - New password for the account
   * @returns Promise<void>
   */
  confirmPasswordReset: async (code: string, newPassword: string): Promise<void> => {
    try {
      await firebaseConfirmPasswordReset(auth, code, newPassword);
    } catch (error: any) {
      if (error.code === 'auth/invalid-action-code') {
        throw new Error('This password reset link is invalid or has expired');
      } else if (error.code === 'auth/expired-action-code') {
        throw new Error('This password reset link has expired');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password');
      } else {
        throw error;
      }
    }
  },

  /**
   * Send email verification link to user
   * @param user - Firebase user object
   * @returns Promise<void>
   */
  sendVerificationEmail: async (user: any): Promise<void> => {
    try {
      await firebaseSendEmailVerification(user);
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many verification emails sent. Please try again later');
      } else {
        throw error;
      }
    }
  }
};

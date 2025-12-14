import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      if (user) {
        // Get the ID token result which contains custom claims
        const tokenResult = await user.getIdTokenResult();
        const isAdminUser = !!tokenResult.claims.admin;
        const isEmailVerified = user.emailVerified;
        
        console.log('User auth state:', {
          uid: user.uid,
          email: user.email,
          isAdmin: isAdminUser,
          emailVerified: isEmailVerified,
          claims: tokenResult.claims
        });
        
        setIsAdmin(isAdminUser);
        setEmailVerified(isEmailVerified);
      } else {
        setIsAdmin(false);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Periodically refresh email verification status
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      try {
        // Check current user's email verification status
        if (auth.currentUser) {
          // Force refresh the user to get latest email verification status
          await auth.currentUser.reload();
          setEmailVerified(auth.currentUser.emailVerified);
          
          if (auth.currentUser.emailVerified) {
            console.log('Email verified detected!');
          }
        }
      } catch (error) {
        console.error('Error checking email verification:', error);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email.toLowerCase(),
      role: 'customer',
      createdAt: serverTimestamp()
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    isAdmin,
    emailVerified,
    signUp,
    signIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
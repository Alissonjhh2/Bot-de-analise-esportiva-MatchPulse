'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configured = firebaseAuth.isConfigured();
    setIsConfigured(configured);
    
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      // Store Firebase token in localStorage for API calls
      if (user) {
        try {
          const token = await user.getIdToken();
          if (typeof window !== 'undefined') {
            localStorage.setItem('firebase_token', token);
          }
        } catch (error) {
          console.error('Error getting Firebase token:', error);
        }
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('firebase_token');
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) throw new Error('Firebase not configured');
    const userCredential = await firebaseAuth.signIn(email, password);
    
    // Sync user with backend database
    try {
      const token = await userCredential.user.getIdToken();
      
      const syncData = {
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || '',
      };
      
      await apiClient.post('/users/sync', syncData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!isConfigured) throw new Error('Firebase not configured');
    const userCredential = await firebaseAuth.signUp(email, password, name);
    
    // Sync user with backend database
    try {
      const token = await userCredential.user.getIdToken();
      await apiClient.post('/users/sync', {
        firebaseUid: userCredential.user.uid,
        email: userCredential.user.email,
        name: name || userCredential.user.displayName || '',
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  const signOut = async () => {
    if (!isConfigured) return;
    await firebaseAuth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) throw new Error('Firebase not configured');
    await firebaseAuth.resetPassword(email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

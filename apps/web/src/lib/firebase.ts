import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  UserCredential,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Log Firebase config for debugging (remove in production)
if (typeof window !== 'undefined') {
  console.log('Firebase config check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId,
    apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'missing',
  });
}

// Check if all required Firebase config is present
const isFirebaseConfigValid = () => {
  const isValid = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
  
  if (!isValid && typeof window !== 'undefined') {
    console.error('Firebase config invalid. Missing:', {
      apiKey: !firebaseConfig.apiKey,
      authDomain: !firebaseConfig.authDomain,
      projectId: !firebaseConfig.projectId,
      appId: !firebaseConfig.appId,
    });
  }
  
  return isValid;
};

// Initialize Firebase only if config is valid
let app: any = null;
let auth: any = null;

if (isFirebaseConfigValid()) {
  try {
    const existingApps = getApps();
    if (existingApps.length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
    } else {
      app = existingApps[0];
      console.log('Using existing Firebase app');
    }
    auth = getAuth(app);
    console.log('Firebase auth initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase not initialized - config invalid');
}

export const firebaseAuth = {
  signUp: async (email: string, password: string, name?: string): Promise<UserCredential> => {
    if (!auth) throw new Error('Firebase not configured');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name if provided
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    
    return userCredential;
  },

  signIn: async (email: string, password: string): Promise<UserCredential> => {
    if (!auth) throw new Error('Firebase not configured');
    return signInWithEmailAndPassword(auth, email, password);
  },

  signOut: async (): Promise<void> => {
    if (!auth) return;
    return firebaseSignOut(auth);
  },

  resetPassword: async (email: string): Promise<void> => {
    if (!auth) throw new Error('Firebase not configured');
    return sendPasswordResetEmail(auth, email);
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: (): User | null => {
    if (!auth) return null;
    return auth.currentUser;
  },
  
  isConfigured: () => isFirebaseConfigValid(),
};

export { auth };

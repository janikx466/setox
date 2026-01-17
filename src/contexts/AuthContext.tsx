import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type UserRole = 'user' | 'admin' | 'demo-admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isDemoAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REAL_ADMIN_EMAIL = 'foxo.admin@gmail.com';
const REAL_ADMIN_PASSWORD = 'unlock.admin';
const DEMO_ADMIN_EMAIL = 'demo.admin@gmail.com';
const DEMO_ADMIN_PASSWORD = 'unlock.demo';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('user');

  const determineRole = (email: string | null): UserRole => {
    if (!email) return 'user';
    if (email.toLowerCase() === REAL_ADMIN_EMAIL.toLowerCase()) return 'admin';
    if (email.toLowerCase() === DEMO_ADMIN_EMAIL.toLowerCase()) return 'demo-admin';
    return 'user';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setRole(determineRole(user?.email || null));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // Special handling for admin accounts
    if (email.toLowerCase() === REAL_ADMIN_EMAIL.toLowerCase() && password !== REAL_ADMIN_PASSWORD) {
      throw new Error('Invalid admin credentials');
    }
    if (email.toLowerCase() === DEMO_ADMIN_EMAIL.toLowerCase() && password !== DEMO_ADMIN_PASSWORD) {
      throw new Error('Invalid demo admin credentials');
    }
    
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, fullName: string) => {
    // Prevent signup with admin emails
    if (email.toLowerCase() === REAL_ADMIN_EMAIL.toLowerCase() || 
        email.toLowerCase() === DEMO_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('This email is reserved');
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: fullName });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        role, 
        login, 
        signup, 
        logout,
        isAdmin: role === 'admin',
        isDemoAdmin: role === 'demo-admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

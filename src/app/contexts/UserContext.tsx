import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';

type UserMode = 'user' | 'owner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  accountType: UserMode;
}

interface UserContextType {
  mode: UserMode;
  toggleMode: () => void;
  setMode: (mode: UserMode) => void;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, accountType: UserMode) => Promise<{success: boolean, error?: string}>;
  signup: (email: string, password: string, name: string, accountType: UserMode) => Promise<{success: boolean, error?: string, requireOtp?: boolean}>;
  verifyOtp: (email: string, otp: string, name: string, accountType: UserMode) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UserMode>('user');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load user from localStorage on mount since we are using a custom table
  useEffect(() => {
    const storedUser = localStorage.getItem('bohol_board_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setModeState(parsedUser.accountType);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, []);

  const toggleMode = async () => {
    const newMode: UserMode = mode === 'user' ? 'owner' : 'user';
    setModeState(newMode);
    
    // Update metadata directly in user_profiles table if logged in
    if (user) {
      const updatedUser = { ...user, accountType: newMode };
      setUser(updatedUser);
      localStorage.setItem('bohol_board_user', JSON.stringify(updatedUser));
      
      await supabase
        .from('user_profiles')
        .update({ accountType: newMode })
        .eq('id', user.id);
    }
  };

  const setMode = async (newMode: UserMode) => {
    setModeState(newMode);
    
    if (user) {
      const updatedUser = { ...user, accountType: newMode };
      setUser(updatedUser);
      localStorage.setItem('bohol_board_user', JSON.stringify(updatedUser));
      
      await supabase
        .from('user_profiles')
        .update({ accountType: newMode })
        .eq('id', user.id);
    }
  };

  const signup = async (email: string, password: string, name: string, accountType: UserMode): Promise<{success: boolean, error?: string, requireOtp?: boolean}> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, accountType }
        }
      });

      if (error) {
        // If user already exists in custom table but not in auth, catch it
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        return { success: true, requireOtp: true };
      }

      // If no OTP required (email format only, automatic confirm)
      if (data.user) {
        await upsertUserProfile(data.user.id, email, name, accountType, password);
        const newUser: AuthUser = { id: data.user.id, email, name, accountType };
        setUserStore(newUser);
      }
      return { success: true, requireOtp: false };
    } catch (e: any) {
      return { success: false, error: 'Unexpected error: ' + e.message };
    }
  };

  const verifyOtp = async (email: string, token: string, name: string, accountType: UserMode): Promise<{success: boolean, error?: string}> => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        await upsertUserProfile(data.user.id, email, name, accountType, 'migrated');
        const newUser: AuthUser = { id: data.user.id, email, name, accountType };
        setUserStore(newUser);
        return { success: true };
      }
      return { success: false, error: 'Verification failed. Try again.' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const upsertUserProfile = async (id: string, email: string, name: string, accountType: UserMode, passwordStr: string) => {
    const { data: existing } = await supabase.from('user_profiles').select('id').eq('id', id).single();
    if (!existing) {
      await supabase.from('user_profiles').insert([{
        id, email, name, accountType, password: passwordStr
      }]);
    }
  };

  const setUserStore = (authUser: AuthUser) => {
    setUser(authUser);
    setModeState(authUser.accountType);
    localStorage.setItem('bohol_board_user', JSON.stringify(authUser));
  };

  const login = async (email: string, password: string, accountType: UserMode): Promise<{success: boolean, error?: string}> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Fallback for legacy local users without auth account
        const { data: legacyUsers, error: legacyError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .eq('accountType', accountType);

        if (legacyError || !legacyUsers || legacyUsers.length === 0) {
          return { success: false, error: 'Invalid credentials or wrong account type.' };
        }

        const legacyUser = legacyUsers[0];
        setUserStore({
          id: legacyUser.id,
          email: legacyUser.email,
          name: legacyUser.name || 'User',
          accountType: legacyUser.accountType
        });
        return { success: true };
      }

      // Found in supabase auth, fetch profile for metadata
      if (data.user) {
        const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', data.user.id).single();
        if (profile && profile.accountType !== accountType) {
          await supabase.auth.signOut();
          return { success: false, error: 'Wrong account type.' };
        }

        setUserStore({
          id: data.user.id,
          email: data.user.email || email,
          name: profile?.name || data.user.user_metadata?.name || 'User',
          accountType: profile?.accountType || accountType
        });
        return { success: true };
      }
      return { success: false, error: 'An unknown error occurred logging in.' };
    } catch (e: any) {
      return { success: false, error: 'Unexpected error: ' + e.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setModeState('user');
    localStorage.removeItem('bohol_board_user');
  };

  return (
    <UserContext.Provider value={{ 
      mode, 
      toggleMode, 
      setMode, 
      user, 
      isAuthenticated: !!user,
      login,
      signup,
      verifyOtp,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
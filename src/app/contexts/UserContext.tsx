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
  signup: (email: string, password: string, name: string, accountType: UserMode) => Promise<{success: boolean, error?: string}>;
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

  const signup = async (email: string, password: string, name: string, accountType: UserMode): Promise<{success: boolean, error?: string}> => {
    try {
      // Check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email);
        
      if (checkError) {
        return { success: false, error: 'Database error: ' + checkError.message };
      }

      if (existingUsers && existingUsers.length > 0) {
        return { success: false, error: 'Email already exists. Please login instead.' };
      }

      const newId = `user-${Date.now()}`;

      // Insert new user into custom table
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: newId,
            email,
            password,
            name,
            accountType
          }
        ])
        .select();

      if (error) {
        console.error('Signup insert error:', error);
        return { success: false, error: 'Insert error: ' + error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Failed to create user.' };
      }

      // Auto login after successful signup
      const newUser = data[0];
      const { password: _, ...userWithoutPassword } = newUser;
      
      setUser(userWithoutPassword as AuthUser);
      setModeState(accountType);
      localStorage.setItem('bohol_board_user', JSON.stringify(userWithoutPassword));

      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: 'Unexpected error: ' + e.message };
    }
  };

  const login = async (email: string, password: string, accountType: UserMode): Promise<{success: boolean, error?: string}> => {
    try {
      // Fetch user from custom table
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('accountType', accountType);

      if (error) {
        return { success: false, error: 'Database error: ' + error.message };
      }

      if (!users || users.length === 0) {
        return { success: false, error: 'Invalid credentials or wrong account type.' };
      }

      const foundUser = users[0];
      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword as AuthUser);
      setModeState(accountType);
      localStorage.setItem('bohol_board_user', JSON.stringify(userWithoutPassword));

      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: 'Unexpected error: ' + e.message };
    }
  };

  const logout = () => {
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
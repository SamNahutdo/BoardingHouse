import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  login: (email: string, password: string, accountType: UserMode) => Promise<boolean>;
  signup: (email: string, password: string, name: string, accountType: UserMode) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UserMode>('user');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load user from localStorage on mount
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

  const toggleMode = () => {
    const newMode: UserMode = mode === 'user' ? 'owner' : 'user';
    setModeState(newMode);
    
    // If user is authenticated, update their account type
    if (user) {
      const updatedUser = { ...user, accountType: newMode };
      setUser(updatedUser);
      localStorage.setItem('bohol_board_user', JSON.stringify(updatedUser));
    }
  };

  const setMode = (newMode: UserMode) => {
    setModeState(newMode);
    
    // If user is authenticated, update their account type
    if (user) {
      const updatedUser = { ...user, accountType: newMode };
      setUser(updatedUser);
      localStorage.setItem('bohol_board_user', JSON.stringify(updatedUser));
    }
  };

  const signup = async (email: string, password: string, name: string, accountType: UserMode): Promise<boolean> => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('bohol_board_users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      return false; // User already exists
    }

    // Create new user
    const newUser: AuthUser & { password: string } = {
      id: Date.now().toString(),
      email,
      password,
      name,
      accountType,
    };

    users.push(newUser);
    localStorage.setItem('bohol_board_users', JSON.stringify(users));

    // Auto login after signup
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setModeState(accountType);
    localStorage.setItem('bohol_board_user', JSON.stringify(userWithoutPassword));

    return true;
  };

  const login = async (email: string, password: string, accountType: UserMode): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('bohol_board_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password && u.accountType === accountType);

    if (!foundUser) {
      return false;
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    setModeState(accountType);
    localStorage.setItem('bohol_board_user', JSON.stringify(userWithoutPassword));

    return true;
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
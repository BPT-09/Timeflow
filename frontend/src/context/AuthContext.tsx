import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  signup: (credentials: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('tm_token');
    const savedUser = localStorage.getItem('tm_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('tm_token');
        localStorage.removeItem('tm_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (res: AuthResponse) => {
    const userObj: User = {
      id: res.id,
      username: res.username,
      email: res.email,
    };
    setToken(res.token);
    setUser(userObj);
    localStorage.setItem('tm_token', res.token);
    localStorage.setItem('tm_user', JSON.stringify(userObj));
  };

  const login = async (credentials: { username: string; password: string }) => {
    const res = await authApi.login(credentials);
    handleAuthSuccess(res);
  };

  const signup = async (credentials: { username: string; email: string; password: string }) => {
    const res = await authApi.signup(credentials);
    handleAuthSuccess(res);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

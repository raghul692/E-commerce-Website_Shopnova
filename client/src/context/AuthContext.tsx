import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.js';
import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loginAsCustomer: () => Promise<void>;
  loginAsSeller: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loginAsCustomer: async () => {},
  loginAsSeller: async () => {},
  loginAsAdmin: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiRequest('/auth/me');
      if (res.success) {
        setUser(res.user);
      }
    } catch {
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (data: any) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const loginAsCustomer = () => login('customer@example.com', 'Password123!');
  const loginAsSeller = () => login('seller@example.com', 'Password123!');
  const loginAsAdmin = () => login('admin@example.com', 'Password123!');

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginAsCustomer, loginAsSeller, loginAsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

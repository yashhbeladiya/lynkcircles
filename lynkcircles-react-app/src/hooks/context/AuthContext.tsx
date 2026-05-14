import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, tokenData: string) => void;
  logout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        return res.data;
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          // Unauthorized
          return null;
        }
        return null;
      }
    },
  });

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setToken(authUser.token); // Assuming the token is part of the authUser data
    }
  }, [authUser]);

  const login = (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
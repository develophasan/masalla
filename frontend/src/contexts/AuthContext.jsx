import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/config/api';

const AuthContext = createContext(null);

// Create axios instance with auth interceptor
const authAxios = axios.create();

authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await authAxios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('session_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, 
      { email, password }
    );
    
    // Store token in localStorage
    if (response.data.session_token) {
      localStorage.setItem('session_token', response.data.session_token);
    }
    
    setUser(response.data.user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await axios.post(`${API}/auth/register`, userData);
    return response.data;
  };

  const loginWithGoogle = () => {
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const processGoogleCallback = async (sessionId) => {
    const response = await axios.post(`${API}/auth/google/session`,
      { session_id: sessionId }
    );
    
    // Store token in localStorage
    if (response.data.session_token) {
      localStorage.setItem('session_token', response.data.session_token);
    }
    
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    const token = localStorage.getItem('session_token');
    
    try {
      if (token) {
        await authAxios.post(`${API}/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('session_token');
    setUser(null);
  };

  const updateUser = (updates) => {
    if (typeof updates === 'object' && updates !== null) {
      setUser(prev => prev ? { ...prev, ...updates } : updates);
    } else {
      setUser(updates);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAxios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('session_token');
      setUser(null);
    }
  };

  // Export authAxios for use in other components
  const getAuthAxios = () => authAxios;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      processGoogleCallback,
      logout,
      updateUser,
      refreshUser,
      isAuthenticated: !!user,
      getAuthAxios
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export for direct use
export { authAxios };

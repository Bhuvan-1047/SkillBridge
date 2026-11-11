import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const normalizeUser = (u) => {
  if (!u) return null;
  const uid = u._id || u.id;
  return { ...u, id: uid, _id: uid };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('skillbridge_user') || localStorage.getItem('skillswap_user');
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('skillbridge_token') || localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);

  // Sync / verify user session on initial mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('skillbridge_token') || localStorage.getItem('skillswap_token');
      if (storedToken) {
        try {
          const data = await authService.getProfile();
          if (data.success && data.user) {
            const normalized = normalizeUser(data.user);
            setUser(normalized);
            localStorage.setItem('skillbridge_user', JSON.stringify(normalized));
          }
        } catch {
          // Token invalid or expired
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.success) {
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setToken(data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(normalized));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success) {
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setToken(data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(normalized));
    }
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getProfile();
      if (data.success && data.user) {
        const normalized = normalizeUser(data.user);
        setUser(normalized);
        localStorage.setItem('skillbridge_user', JSON.stringify(normalized));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const updateUserProfile = async (formData) => {
    const data = await authService.updateProfile(formData);
    if (data.success && data.user) {
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      localStorage.setItem('skillbridge_user', JSON.stringify(normalized));
    }
    return data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

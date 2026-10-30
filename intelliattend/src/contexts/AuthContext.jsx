import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { DEMO_USERS } from './demoUsers';

/* oxlint-disable react/only-export-components */
export { DEMO_USERS };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('hrms_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.role) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('hrms_user');
      const token = localStorage.getItem('token');
      if (savedUserStr && token) {
        const parsed = JSON.parse(savedUserStr);
        return Boolean(parsed && parsed.role);
      }
      return false;
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoggedIn(false);
      return false;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.data) {
        const currentUser = response.data.data;
        setUser(currentUser);
        localStorage.setItem('hrms_user', JSON.stringify(currentUser));
        setIsLoggedIn(true);
        return true;
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('hrms_user');
        setUser(null);
        setIsLoggedIn(false);
        return false;
      }
    }
    return Boolean(user);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    api.get('/auth/me')
      .then(response => {
        if (response.data?.success && response.data?.data) {
          const currentUser = response.data.data;
          setUser(currentUser);
          localStorage.setItem('hrms_user', JSON.stringify(currentUser));
          setIsLoggedIn(true);
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('hrms_user');
          setUser(null);
          setIsLoggedIn(false);
        }
      });
  }, []);

  const login = async (credentials) => {
    const email = (credentials.email || '').toLowerCase().trim();
    const password = credentials.password || '';

    if (!email || !password) {
      return {
        success: false,
        message: 'Please provide both email and password.',
      };
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.data?.success) {
        const token = response.data?.token || response.data?.data?.token;
        const apiUser = response.data?.user || response.data?.data?.user;

        if (token && apiUser) {
          localStorage.setItem('token', token);
          localStorage.setItem('hrms_user', JSON.stringify(apiUser));
          setUser(apiUser);
          setIsLoggedIn(true);
          return { success: true, user: apiUser };
        }
      }

      return {
        success: false,
        message: response.data?.message || 'Authentication failed. Please check credentials.',
      };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Server connection error during sign-in.';
      return {
        success: false,
        message: errMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async () => {
    console.warn('Role switching is disabled in production mode. Please sign in with respective credentials.');
    return user;
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hrms_user');
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('hrms_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    switchRole,
    register,
    logout,
    updateUser,
    checkAuth,
    DEMO_USERS,
  };

  return (
    <AuthContext.Provider value={value}>
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
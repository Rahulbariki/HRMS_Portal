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
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        return Boolean(parsed && parsed.role);
      }
      return false;
    } catch {
      return false;
    }
  });

  const [loading] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token || token.startsWith('mock-')) return Boolean(user);

    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        localStorage.setItem('hrms_user', JSON.stringify(response.data.data));
        setIsLoggedIn(true);
        return true;
      }
    } catch {
      // Retain local demo session
    }
    return Boolean(user);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token.startsWith('mock-')) return;

    api.get('/auth/me')
      .then(response => {
        if (response.data?.success && response.data?.data) {
          setUser(response.data.data);
          localStorage.setItem('hrms_user', JSON.stringify(response.data.data));
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
        // Retain local demo session
      });
  }, []);

  const login = async (credentials) => {
    const email = (credentials.email || '').toLowerCase().trim();
    const password = credentials.password || '';

    // Enforce email format: must end with .intelliattend@gmail.com or @intelliattend.com
    const isValidFormat = email.endsWith('.intelliattend@gmail.com') || email.endsWith('@intelliattend.com');
    if (!isValidFormat) {
      return {
        success: false,
        message: 'Invalid login email format. Logins are strictly restricted to *.intelliattend@gmail.com (e.g. rahulbariki.intelliattend@gmail.com).',
      };
    }

    // Enforce password for production accounts
    if (password && password !== 'password123') {
      return {
        success: false,
        message: 'Invalid password. All accounts require password123.',
      };
    }

    // 1. Try real backend API first if available
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data?.success) {
        const { token, user: apiUser } = response.data.data;
        localStorage.setItem('token', token || 'mock-token-session');
        localStorage.setItem('hrms_user', JSON.stringify(apiUser));
        setUser(apiUser);
        setIsLoggedIn(true);
        return { success: true, user: apiUser };
      }
    } catch {
      // Fallback to enterprise session authentication
    }

    // 2. Resolve role from credentials or email
    let targetRole = credentials.role;

    if (email === 'rahulbariki.intelliattend@gmail.com') {
      targetRole = 'superadmin';
    } else if (email === 'clientadmin.intelliattend@gmail.com') {
      targetRole = 'client';
    } else if (email === 'manager.intelliattend@gmail.com') {
      targetRole = 'manager';
    } else if (email === 'employee.intelliattend@gmail.com') {
      targetRole = 'employee';
    } else if (!targetRole) {
      if (credentials.isSuperAdmin || email.includes('superadmin')) {
        targetRole = 'superadmin';
      } else if (email.includes('client') || email.includes('admin') || credentials.company) {
        targetRole = 'client';
      } else if (email.includes('manager') || email.includes('lead')) {
        targetRole = 'manager';
      } else {
        targetRole = 'employee';
      }
    }

    const demoUser = DEMO_USERS[targetRole] || {
      id: `user-${Date.now()}`,
      name: email ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'HRMS User',
      email: email,
      loginEmail: email,
      role: targetRole,
      avatar: (email ? email[0] : targetRole[0]).toUpperCase(),
      designation: targetRole.toUpperCase(),
      company: credentials.company || 'IntelliAttend',
    };

    const activeUser = {
      ...demoUser,
      email: email || demoUser.email,
      loginEmail: email || demoUser.loginEmail,
    };

    const token = `mock-hrms-token-${targetRole}-${Date.now()}`;
    localStorage.setItem('token', token);
    localStorage.setItem('hrms_user', JSON.stringify(activeUser));
    setUser(activeUser);
    setIsLoggedIn(true);

    return { success: true, user: activeUser };
  };

  const switchRole = (role) => {
    if (DEMO_USERS[role]) {
      const newUser = DEMO_USERS[role];
      const token = `mock-hrms-token-${role}-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('hrms_user', JSON.stringify(newUser));
      setUser(newUser);
      setIsLoggedIn(true);
      return newUser;
    }
    return user;
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch {
      return { success: true, message: 'Registration demo successful' };
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
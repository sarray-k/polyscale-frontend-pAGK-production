import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('polyscale-user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('polyscale-token') || '');
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem('polyscale-token')));

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('polyscale-user');
    localStorage.removeItem('polyscale-token');
  };

  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('polyscale-user', JSON.stringify(userData));
    localStorage.setItem('polyscale-token', tokenValue);
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const syncUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Session invalide');
        }

        const data = await res.json();
        if (mounted) {
          setUser(data);
          localStorage.setItem('polyscale-user', JSON.stringify(data));
        }
      } catch (error) {
        if (mounted) {
          logout();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    syncUser();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios.js'; // Your axios instance, ensure it has withCredentials: true

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // to handle initial loading state

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/profile');
        setUser(res.data.user);
      } catch (error) {
        if (error.response?.status === 429) {
        console.warn("Rate limit exceeded. Retrying later.");
        return; // don't logout
    }
        console.log('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // login no longer receives token; after successful login/register API call,
  // call fetchUser again to update user state
  const login = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile');
      setUser(res.data.user);
    } catch(err) {
        console.log("Login failed", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      // optionally handle error
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Automatically send cookies with every request
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = async () => {
        try {
            const res = await axios.get('/api/users/profile');
            if (res.data.success) {
                setUser(res.data.user);
                setIsAuthenticated(true);
            }
        } catch (err) {
            // Attempt auto refresh of access token
            try {
                const refreshRes = await axios.post('/api/auth/refresh');
                if (refreshRes.data.success) {
                    const profileRes = await axios.get('/api/users/profile');
                    if (profileRes.data.success) {
                        setUser(profileRes.data.user);
                        setIsAuthenticated(true);
                        return;
                    }
                }
            } catch (refreshErr) {
                // Refresh expired, user is logged out
            }
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (usernameOrEmail, password) => {
        setIsLoading(true);
        try {
            const payload = usernameOrEmail.includes('@') 
                ? { email: usernameOrEmail, password }
                : { username: usernameOrEmail, password };
                
            const res = await axios.post('/api/auth/login', payload);
            if (res.data.success) {
                setUser(res.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || 'Invalid credentials' 
            };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username, email, password, role) => {
        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/register', { username, email, password, role });
            if (res.data.success) {
                setUser(res.data.user);
                setIsAuthenticated(true);
                return { success: true, message: res.data.message };
            }
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed' 
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await axios.post('/api/auth/logout');
        } catch (err) {
            // ignore logout exceptions
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    const verifyEmail = async (token) => {
        try {
            const res = await axios.get(`/api/auth/verify-email/${token}`);
            if (res.data.success) {
                await loadUser();
                return { success: true, message: res.data.message };
            }
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || 'Verification failed' 
            };
        }
    };

    const updateProfile = async (username, email) => {
        try {
            const res = await axios.patch('/api/users/profile', { username, email });
            if (res.data.success) {
                setUser(res.data.user);
                return { success: true, message: res.data.message };
            }
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || 'Profile update failed' 
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            login,
            register,
            logout,
            verifyEmail,
            updateProfile,
            refreshSession: loadUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

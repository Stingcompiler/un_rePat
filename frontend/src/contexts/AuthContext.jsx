import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/check/');
                setUser(response.data.user);
            } catch (error) {
                // 401 = not logged in, which is expected — not a real error
                if (error.response?.status !== 401) {
                    console.error('Auth check failed:', error);
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/auth/login/', { username, password });
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            // Optional: Clear any local storage if used
        }
    };

    const updateProfile = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

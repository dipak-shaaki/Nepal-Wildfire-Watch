import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        // Check if user is logged in on app start
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('userToken');
        const storedAdminName = localStorage.getItem('adminName');
        const storedUserName = localStorage.getItem('userName');
        
        if (adminToken) {
            setIsAuthenticated(true);
            setUserRole('admin');
            if (storedAdminName) setUserName(storedAdminName);
        } else if (userToken) {
            setIsAuthenticated(true);
            setUserRole('user');
            if (storedUserName) setUserName(storedUserName);
        }
        
        setIsLoading(false);
    }, []);

    const login = (token, role, name) => {
        if (role === 'admin') {
            localStorage.setItem('adminToken', token);
            if (name) {
                localStorage.setItem('adminName', name);
                setUserName(name);
            }
        } else {
            localStorage.setItem('userToken', token);
            if (name) {
                localStorage.setItem('userName', name);
                setUserName(name);
            }
        }
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userToken');
        localStorage.removeItem('adminName');
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName("");
    };

    const value = {
        isAuthenticated,
        userRole,
        isLoading,
        userName,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 
import { createContext, useContext, useState } from "react";
import {
    login as loginUser,
    register as registerUser,
    logout as logoutUser,
    getStoredUser,
    isAuthenticated,
} from "../services/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser);
    const [loading, setLoading] = useState(false);

    async function login(email, password) {
        setLoading(true);

        try {
            const data = await loginUser(email, password);
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    }

    async function register(userData) {
        setLoading(true);

        try {
            const data = await registerUser(userData);
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        logoutUser();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user) && isAuthenticated(),
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}

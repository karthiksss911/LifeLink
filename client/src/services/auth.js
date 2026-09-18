import { api } from "./api.js";

const TOKEN_KEY = "lifelink_token";
const USER_KEY = "lifelink_user";

export async function login(email, password) {
    const data = await api.post("/api/auth/login", {
        email,
        password,
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
}

export async function register({
    fullName,
    email,
    phone,
    password,
    role = "donor",
}) {
    const data = await api.post("/api/auth/register", {
        fullName,
        email,
        phone,
        password,
        role,
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
    return Boolean(getStoredToken());
}
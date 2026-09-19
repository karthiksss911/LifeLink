const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/i, "");

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("lifelink_token");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const response = await fetch(`${API_URL}${cleanEndpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {}),
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const err = new Error(
            data.message || data.error || `HTTP ${response.status}: ${response.statusText || "Request failed"}`
        );
        err.status = response.status;
        err.data = data;
        throw err;
    }

    return data;
}

export const api = {
    get: (endpoint) =>
        request(endpoint),

    post: (endpoint, body) =>
        request(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        }),

    patch: (endpoint, body) =>
        request(endpoint, {
            method: "PATCH",
            body: JSON.stringify(body),
        }),
};
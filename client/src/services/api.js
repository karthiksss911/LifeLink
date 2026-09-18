const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("lifelink_token");

    const response = await fetch(`${API_URL}${endpoint}`, {
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

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
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
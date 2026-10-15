import axios from 'axios';

// 1. Bikin Instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
    },
});

// 2. INTERCEPTOR (Tugasnya nyelipin token sebelum request terbang)
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. RESPONSE INTERCEPTOR (Kalau token expired atau unauthorized, bersihkan storage & arahkan ke login)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || "";
        const isAuthError = status === 401 || (status === 403 && /token/i.test(message));

        if (isAuthError) {
            const isAuthRequest = error?.config?.url?.includes('/api/sign-in') ||
                error?.config?.url?.includes('/api/auth/');

            if (typeof window !== "undefined" && !isAuthRequest) {
                sessionStorage.removeItem('auth_user');
                sessionStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
                sessionStorage.setItem('session_expired', 'true');
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
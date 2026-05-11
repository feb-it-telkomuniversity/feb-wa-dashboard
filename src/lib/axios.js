import axios from 'axios';

// 1. Bikin Instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
    },
})

// 2. INTERCEPTOR (Tugasnya nyelipin token sebelum request terbang)
// api.interceptors.request.use(
//     (config) => {
//         if (typeof window !== "undefined") {
//             const token = sessionStorage.getItem('auth_token')
//             if (token) {
//                 config.headers.Authorization = `Bearer ${token}`
//             }
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// )

// 3. RESPONSE INTERCEPTOR (Kalau token expired, tendang user)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== "undefined") {
                // sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_user');
                window.location.href = '/'
            }
        }
        return Promise.reject(error)
    }
)

export default api
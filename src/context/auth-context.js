'use client'

import api from "@/lib/axios"
import { useRouter } from "next/navigation"
import { createContext, useEffect, useState } from "react"
import { toast } from "sonner"

const AuthContext = createContext({
    user: null,
    login: (userData, token) => { },
    logout: () => { },
    fetchFreshUserData: () => { },
    isLoading: true,
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchFreshUserData = async () => {
        try {
            const res = await api.get('/api/users/me')

            const freshUser = res.data.user;
            setUser(freshUser);
            sessionStorage.setItem('auth_user', JSON.stringify(freshUser));

        } catch (error) {
            const status = error?.response?.status;
            const message = error?.response?.data?.message || "";
            const isAuthError = status === 401 || (status === 403 && /token/i.test(message));

            if (isAuthError) {
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                setUser(null);
            } else {
                console.error("Gagal sinkronisasi data user dari server:", error);
            }
        }
    }

    useEffect(() => {
        const storedUser = sessionStorage.getItem('auth_user')

        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser))
                fetchFreshUserData()
            } catch (err) {
                console.error("Invalid auth_user in sessionStorage", err)
                sessionStorage.removeItem("auth_user")
            }
        }
        setIsLoading(false)
    }, [])

    const login = (userData, token) => {
        if (token) {
            sessionStorage.setItem('auth_token', token)
        }
        sessionStorage.setItem('auth_user', JSON.stringify(userData))
        setUser(userData)
        router.push('/dashboard')
    }

    const logout = async () => {
        try {
            await api.post('/api/sign-out')
        } catch (error) {
            console.error("Gagal logout:", error);
        } finally {
            sessionStorage.setItem('is_logging_out', 'true')
            sessionStorage.removeItem('auth_token')
            sessionStorage.removeItem('auth_user')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            setUser(null)
            toast.success("Sampai jumpaa... Jangan lupa kembali lagi ya!", {
                position: 'top-center',
                duration: 2000,
                style: { background: "#059669", color: "#d1fae5" },
                className: "border border-emerald-500"
            })
            router.push('/')
        }
    }

    const value = {
        user,
        setUser,
        isLoading,
        login,
        logout,
        fetchFreshUserData,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
'use client'

import api from "@/lib/axios"
import { useRouter } from "next/navigation"
import { createContext, useEffect, useState } from "react"
import { toast } from "sonner"

const AuthContext = createContext({
    user: null,
    // token: null,
    login: (userData) => { },
    logout: () => { },
    fetchFreshUserData: () => { },
    isLoading: true,
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    // const [token, setToken] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchFreshUserData = async () => {
        try {
            const res = await api.get('/api/users/me')

            const freshUser = res.data.user;
            setUser(freshUser);
            sessionStorage.setItem('auth_user', JSON.stringify(freshUser));

        } catch (error) {
            console.error("Gagal sinkronisasi data user dari server:", error);
        }
    }

    useEffect(() => {
        // const storedToken = sessionStorage.getItem('auth_token')
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

    const login = (userData) => {
        // sessionStorage.setItem('auth_token', token)
        sessionStorage.setItem('auth_user', JSON.stringify(userData))
        // setToken(token)
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
            // sessionStorage.removeItem('auth_token')
            sessionStorage.removeItem('auth_user')
            // setToken(null)
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

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

export default AuthContext
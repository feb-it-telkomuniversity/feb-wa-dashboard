'use client'

import { useRouter } from "next/navigation"
import { createContext, useEffect, useState } from "react"
import { toast } from "sonner"

const AuthContext = createContext({
    user: null,
    token: null,
    login: (token, userData) => { },
    logout: () => { },
    isLoading: true,
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const storedToken = sessionStorage.getItem('auth_token')
        const storedUser = sessionStorage.getItem('auth_user')

        if (storedToken && storedUser && storedUser !== "undefined") {
            try {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            } catch (err) {
                console.error("Invalid auth_user in sessionStorage", err)
                sessionStorage.removeItem("auth_user")
            }
        }
        setIsLoading(false)
    }, [])

    const login = (token, userData) => {
        sessionStorage.setItem('auth_token', token)
        sessionStorage.setItem('auth_user', JSON.stringify(userData))
        setToken(token)
        setUser(userData)
        router.push('/dashboard')
    }

    const logout = () => {
        sessionStorage.setItem('is_logging_out', 'true')
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_user')
        setToken(null)
        setUser(null)
        toast.success("Jangan lupa kembali lagi ya!", {
            style: { background: "#059669", color: "#d1fae5" },
            className: "border border-emerald-500"
        })
        router.push('/')
    }

    const value = {
        user,
        setUser,
        token,
        isLoading,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

export default AuthContext
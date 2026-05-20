'use client'

import { useAuth } from "@/hooks/use-auth"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { navigation } from '@/lib/navigation'
import { MiraLoading } from "../mira-loading"

const MIN_LOADING_TIME = 4000

export default function RoleGuard({ children }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [minDelayDone, setMinDelayDone] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinDelayDone(true)
        }, MIN_LOADING_TIME)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (isLoading || !minDelayDone) return

        if (!user) {
            router.push('/')
            const isLoggingOut = sessionStorage.getItem('is_logging_out')

            if (isLoggingOut) {
                sessionStorage.removeItem('is_logging_out')
            } else {
                toast.error("Oops... Kamu tidak memiliki akses ke halaman ini", {
                    style: { background: "#fee2e2", color: "#991b1b" },
                    className: "border border-red-500"
                })
            }
            return
        }

        // 2. Cari item navigasi yang sesuai dengan pathname
        const activeItem = navigation.find(item => {
            return pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')
        })

        // 3. Cek permission jika item ditemukan dan memiliki batasan role
        if (activeItem && activeItem.allowedRoles) {
            const hasPermission = activeItem.allowedRoles.includes(user.role)
            if (!hasPermission) {
                toast.error("Oops... Kamu tidak memiliki akses ke halaman ini", {
                    style: { background: "#fee2e2", color: "#991b1b" },
                    className: "border border-red-500"
                })
                router.push('/dashboard')
                return
            }
        }

        // 4. Jika sampai sini, berarti authorized
        setIsAuthorized(true)
    }, [user, isLoading, router, pathname, minDelayDone])

    if (isLoading || !isAuthorized) {
        return (
            <main className="min-h-screen bg-background">
                <div className="container mx-auto px-10 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Memuat semua data</h1>
                        <p className="text-muted-foreground">MIRA: Media Informasi dan Relasi Anda</p>
                    </div>

                    <MiraLoading message="Memasuki dengan sopan..." />
                </div>
            </main>
        )
    }

    return <>{children}</>
}

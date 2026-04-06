'use client'

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Shield, Calendar, User, AtSign, Loader2, X } from "lucide-react"
import api from "@/lib/axios"
import { useAuth } from "@/hooks/use-auth"
import AvatarSection from "@/components/Account/AvatarSection"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { toast } from "sonner"

const AccountPage = () => {
    const { user, setUser, fetchFreshUserData } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingUsername, setIsEditingUsername] = useState(false)
    const [editName, setEditName] = useState(user?.name)
    const [editUsername, setEditUsername] = useState(user?.username)
    const [linkedEmail, setLinkedEmail] = useState(user?.googleEmail || null)
    const [error, setIsError] = useState(null)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const updateProfile = async (data) => {
        try {
            setIsLoading(true)
            setIsError(null)

            const payload = {}
            if (data.name) payload.name = data.name
            if (data.username) payload.username = data.username
            if (data.avatarUrl) payload.avatarUrl = data.avatarUrl

            const res = await api.patch('/api/users/me', payload)

            setUser(res.data.user)
            sessionStorage.setItem("auth_user", JSON.stringify(res.data.user))
            return true
        } catch (error) {
            setIsError(error.response?.data?.message || "Gagal memperbarui profil")
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveName = async () => {
        if (!editName || editName === user.name) {
            setIsEditingName(false)
            return
        }
        if (await updateProfile({ name: editName })) {
            setIsEditingName(false)
        }
    }

    const handleSaveUsername = async () => {
        if (!editUsername || editUsername === user.username) {
            setIsEditingUsername(false)
            return
        }
        if (await updateProfile({ username: editUsername })) {
            setIsEditingUsername(false)
        }
    }

    const handleGoogleLinkSuccess = async (credentialResponse) => {
        try {
            const res = await api.post('/api/account/link-google', {
                googleToken: credentialResponse.credential,
                userId: user.id
            });

            if (res.data.success) {
                setLinkedEmail(res.data.email)
                setUser({ ...user, email: res.data.email })

                toast.success('Berhasil menautkan akun Google!', {
                    position: "top-center",
                    style: { background: "#059669", color: "#d1fae5" },
                    className: "border border-emerald-500"
                })
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menautkan akun', {
                position: "top-center",
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        }
    }

    const handleDisconnectGoogle = async () => {
        try {
            const res = await api.post('/api/account/unlink-google')

            if (res.data.success) {
                setLinkedEmail(null)
                setUser({ ...user, email: null })
                toast.success('Berhasil memutus tautan akun Google!', {
                    position: "top-center",
                    style: { background: "#059669", color: "#d1fae5" },
                    className: "border border-emerald-500"
                })
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Gagal memutus tautan akun')
        }
    }

    useEffect(() => {
        if (user) {
            setEditName(user.name)
            setEditUsername(user.username)
        }
        fetchFreshUserData()
    }, [])

    if (!user) return null

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative">
            <div className="pointer-events-none absolute -top-30 h-[200px] w-[100%] rounded-full bg-primary/20 blur-[120px] dark:bg-primary/30 animate-pulse duration-500" />
            <main className="max-w-3xl mx-auto py-12 px-6 lg:px-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                {/* Header Section */}
                <header className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                        Profil Anda
                    </h1>
                </header>

                <div className="space-y-10">
                    <AvatarSection
                        user={user}
                        setUser={setUser}
                        updateProfile={updateProfile}
                    />

                    {/* DATA FIELDS SECTION */}
                    <section className="space-y-0 divide-y divide-border border-t border-border">
                        {/* Nama Field */}
                        <div className="group flex items-center justify-between py-7 transition-all">
                            <div className="space-y-1.5 flex-1 pr-4">
                                <label className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">
                                    <User className="w-3.5 h-3.5 opacity-70" />
                                    Nama
                                </label>
                                {isEditingName ? (
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="max-w-md h-10 mt-1"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                        {user.name}
                                    </p>
                                )}
                            </div>
                            {isEditingName ? (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditingName(false)
                                            setEditName(user?.name)
                                        }}
                                        disabled={isLoading}
                                        className="rounded-lg px-4 h-10 font-medium transition-all"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleSaveName}
                                        disabled={isLoading}
                                        className="rounded-lg px-4 h-10 font-medium transition-all"
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditingName(true)}
                                    className="rounded-lg px-6 h-10 font-medium transition-all"
                                >
                                    Edit
                                </Button>
                            )}
                        </div>

                        {/* Username Field */}
                        <div className="group flex items-center justify-between py-7 transition-all">
                            <div className="space-y-1.5 flex-1 pr-4">
                                <label className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">
                                    <AtSign className="w-3.5 h-3.5 opacity-70" />
                                    Username
                                </label>
                                {isEditingUsername ? (
                                    <Input
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="max-w-md h-10 mt-1"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                        {user.username}
                                    </p>
                                )}
                            </div>
                            {isEditingUsername ? (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={isLoading}
                                        onClick={() => {
                                            setIsEditingUsername(false)
                                            setEditUsername(user?.username)
                                        }}
                                        className="rounded-lg px-4 h-10 font-medium transition-all"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleSaveUsername}
                                        className="rounded-lg px-4 h-10 font-medium transition-all"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditingUsername(true)}
                                    className="rounded-lg px-6 h-10 font-medium transition-all"
                                >
                                    Edit
                                </Button>
                            )}
                        </div>

                        {/* Connected Accounts */}
                        <div className="rounded-xl border border-primary/20 dark:border-white/10 bg-primary/5 dark:bg-white/5 backdrop-blur-sm overflow-hidden shadow-sm my-7">
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-primary/20 dark:border-white/10">
                                <h3 className="text-sm font-semibold text-primary dark:text-white">Akun Terhubung</h3>
                                <p className="text-xs dark:text-white/50 mt-0.5">
                                    Layanan yang kamu gunakan untuk masuk ke MIRA
                                </p>
                            </div>

                            {/* Google Row */}
                            <div className="px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Left: Icon + Info */}
                                    <div className="flex items-center gap-3">
                                        {/* Google Icon */}
                                        <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-white/10 border border-primary/20 dark:border-white/10 flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium caramellatte:text-white dark:text-white">Google</p>
                                            {linkedEmail ? (
                                                <p className="text-xs text-gray-500 caramellatte:text-white/50 dark:text-white/50 mt-0.5">{linkedEmail}</p>
                                            ) : (
                                                <p className="text-xs text-gray-500 caramellatte:text-white/50 dark:text-white/50 mt-0.5">Login dengan Google</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Action */}
                                    {linkedEmail ? (
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                                Terhubung
                                            </span>

                                            <button
                                                onClick={handleDisconnectGoogle}
                                                className="flex items-center gap-1 text-xs text-red-400 transition-colors ml-2 border border-gray-200 dark:border-white/10 dark:hover:border-red-500/50 hover:border-red-400/30 rounded-md px-2 py-1"
                                            >
                                                <X className="size-4" />
                                                Putuskan
                                            </button>
                                        </div>
                                    ) : (
                                        <GoogleOAuthProvider clientId={clientId}>
                                            <GoogleLogin
                                                onSuccess={handleGoogleLinkSuccess}
                                                onError={() => {
                                                    if (process.env.NODE_ENV === 'development') {
                                                        console.info('[Google Link] Dibatalkan oleh pengguna.');
                                                    }
                                                }}
                                                text="continue_with"
                                                shape="pill"
                                                size="medium"
                                            />
                                        </GoogleOAuthProvider>
                                    )}
                                </div>
                            </div>

                            {/* Footer note */}
                            <div className="px-5 py-3 border-t border-primary/20 dark:border-white/10 bg-primary/5 dark:bg-white/[0.02]">
                                <p className="text-xs text-primary/80 dark:text-white/30">
                                    {linkedEmail
                                        ? '✓ Akunmu sudah terhubung. Kamu bisa login menggunakan Google.'
                                        : 'Kamu perlu menghubungkan minimal satu akun atau menggunakan password untuk login.'
                                    }
                                </p>
                            </div>
                        </div>
                        {error && (
                            <div className="py-4">
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 backdrop-blur-sm space-y-3 hover:border-primary/50 transition-all group/card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 text-muted-foreground">
                                        <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover/card:text-primary transition-colors">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Peran Akun</span>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/20 capitalize">
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Anda memiliki akses sebagai <span className="text-foreground font-semibold">{user.role}</span> dalam sistem MIRA ini.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 backdrop-blur-sm space-y-3 hover:border-primary/50 transition-all group/card">
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover/card:text-primary transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Anggota Sejak</span>
                                </div>
                                <div className="pt-1">
                                    <p className="text-foreground font-semibold text-lg">{formatDate(user.createdAt)}</p>
                                    <p className="text-muted-foreground text-[13px]">Berdasarkan data pendaftaran akun</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="pt-10 flex flex-col items-center gap-4 text-center">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Terakhir diperbarui: {formatDate(user.updatedAt)}</span>
                            </div>

                            <p className="text-muted-foreground text-[11px] max-w-sm">
                                Jika ada ketidaksesuaian data yang tidak dapat diubah secara mandiri, silakan hubungi administrator sistem.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default AccountPage
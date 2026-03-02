'use client'

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Shield, Calendar, User, AtSign, Loader2 } from "lucide-react"
import api from "@/lib/axios"
import { useAuth } from "@/hooks/use-auth"
import AvatarSection from "@/components/Account/AvatarSection"

const AccountPage = () => {
    const { user, setUser, fetchFreshUserData } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingUsername, setIsEditingUsername] = useState(false)
    const [editName, setEditName] = useState(user?.name)
    const [editUsername, setEditUsername] = useState(user?.username)
    const [error, setIsError] = useState(null)

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
            <div className="pointer-events-none absolute -top-30 h-[200px] w-[100%] rounded-full bg-[#cb0000]/20 blur-[120px] dark:bg-primary/30 animate-pulse duration-500" />
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

                        {error && (
                            <div className="py-4">
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
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
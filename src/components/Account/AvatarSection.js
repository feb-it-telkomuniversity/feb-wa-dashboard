"use client"

import React, { useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Trash2, ArrowLeft } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import api from "@/lib/axios"
import { toast } from "sonner"

const AvatarSection = ({ user, setUser, updateProfile }) => {
    const fileInputRef = useRef(null)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [error, setIsError] = useState(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
            setIsError("Format file tidak didukung. Harap unggah file JPG atau PNG saja")
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setIsError("Ukuran gambar maksimal 2MB ya")
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        try {
            setIsUploadingAvatar(true)
            setIsError(null)

            const formData = new FormData()
            formData.append('avatar', file)

            const uploadRes = await api.post('/api/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            const newAvatarUrl = uploadRes.data.url
            await updateProfile({ avatarUrl: newAvatarUrl })

            toast.success("Foto profil berhasil diperbarui")

        } catch (err) {
            console.error("Gagal upload avatar:", err)
            setIsError("Gagal mengunggah foto profil.")
            toast.error("Gagal mengunggah foto profil")
        } finally {
            setIsUploadingAvatar(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveAvatar = async () => {
        try {
            setIsUploadingAvatar(true)
            setIsError(null)

            const res = await api.delete('/api/users/delete-avatar', {
                data: { avatarUrl: user.avatarUrl }
            })

            setUser(res.data.user)
            sessionStorage.setItem("auth_user", JSON.stringify(res.data.user))

            toast.success("Foto profil berhasil dihapus")
            setIsDeleteDialogOpen(false)

        } catch (err) {
            console.error("Gagal hapus avatar:", err)
            setIsError("Terjadi kesalahan saat menghapus foto profil")
            toast.error("Gagal menghapus foto profil")
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    return (
        <section className="flex flex-col sm:flex-row items-center gap-8 py-2">
            <div
                className={`relative group overflow-hidden rounded-full ring-4 ring-primary/20 ${isUploadingAvatar ? "cursor-wait" : "cursor-pointer"}`}
                onClick={!isUploadingAvatar ? handleAvatarClick : undefined}
            >
                <Avatar className={`h-28 w-28 border-2 border-border transition-all duration-300 ${isUploadingAvatar ? "opacity-50 scale-95" : "group-hover:scale-105"}`}>
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/50 text-white text-6xl font-bold italic">
                        {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>

                {isUploadingAvatar && (
                    <style>{`
                        @keyframes fillUp {
                            0% { top: 100%; }
                            100% { top: -20%; }
                        }
                        @keyframes spinWave {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        .wave-fill {
                            position: absolute;
                            left: -50%;
                            width: 200%;
                            height: 200%;
                            background-color: rgba(0, 196, 204, 0.9);
                            border-radius: 43%;
                            animation: spinWave 2.5s infinite linear, fillUp 8s ease-in-out forwards;
                        }
                        .wave-fill-2 {
                            position: absolute;
                            left: -45%;
                            width: 190%;
                            height: 190%;
                            background-color: rgba(0, 196, 204, 0.4);
                            border-radius: 40%;
                            animation: spinWave 3s infinite linear, fillUp 8s ease-in-out forwards;
                        }
                    `}</style>
                )}

                {isUploadingAvatar ? (
                    <div className="absolute inset-0 overflow-hidden rounded-full z-10 bg-black/50 flex items-center justify-center">
                        <div className="wave-fill-2" />
                        <div className="wave-fill" />
                        <Loader2 className="w-8 h-8 text-white relative z-20 animate-spin drop-shadow-md" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                        <Camera className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Pasang dulu yuk foto profilnya</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                    Hal ini dapat membantu rekan tim mengenali kamu di dalam MIRA dashboard ini.
                </p>
                {error && (
                    <p className="text-sm text-red-500 font-medium mt-2">{error}</p>
                )}
            </div>

            <div className="flex-shrink-0 flex flex-col gap-2">
                <input
                    type="file"
                    id="avatar-upload"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarUpload}
                />

                <Button
                    variant="outline"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="w-full sm:w-auto font-medium rounded-lg px-6"
                >
                    {isUploadingAvatar ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : user?.avatarUrl ? (
                        "Ubah foto"
                    ) : (
                        "Unggah foto"
                    )}
                </Button>

                {user?.avatarUrl && (
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                disabled={isUploadingAvatar}
                                className="w-full sm:w-auto font-medium rounded-lg px-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus foto
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[400px]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus foto profil?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini akan menghapus foto profil Anda secara permanen. Anda dapat mengunggah foto baru kapan saja.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel disabled={isUploadingAvatar} className="rounded-lg">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleRemoveAvatar()
                                    }}
                                    asChild
                                >
                                    <Button
                                        variant="destructive"
                                        disabled={isUploadingAvatar}
                                        className="rounded-lg"
                                    >
                                        {isUploadingAvatar ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Hapus
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </section>
    )
}

export default AvatarSection

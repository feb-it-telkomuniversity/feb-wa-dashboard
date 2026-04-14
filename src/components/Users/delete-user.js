'use client'

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
import { Button } from "../ui/button";
import { ArrowLeft, LoaderCircle, LoaderIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

const DeleteUser = ({ isLoading, setIsLoading, userId, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleDeleteUser = async (userId) => {
        setIsLoading(true)
        try {
            const res = await api.delete(`/api/users/${userId}`)
            await new Promise(resolve => setTimeout(resolve, 3000))
            if (res.status === 200) {
                toast.success("Pengguna ini telah berhasil dihapus", {
                    position: "top-center",
                    style: { background: "#fee2e2", color: "#991b1b" },
                    className: "border border-red-500"
                })
            }
        } catch (error) {
            console.error("Oops...Gagal menghapus data user:", error)
            toast.error("Oops...Gagal menghapus data user, silahkan dicoba lagi", {
                position: "top-center",
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            onSuccess()
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => {
            if (!isLoading) setIsOpen(open)
        }}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full text-left" size="sm" aria-label="Hapus">
                    <Trash2 className="size-4 text-destructive" /> Hapus
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda telah mempertimbangkan dengan seksama penghapusan data pengguna tersebut?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Perlu kami sampaikan bahwa tindakan ini bersifat final dan tidak dapat dibatalkan. Penghapusan ini akan secara permanen menghapus data pengguna yang bersangkutan dari arsip sistem kami.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        <ArrowLeft className="size-4" /> Kembali
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            if (!isLoading) {
                                handleDeleteUser(userId)
                            }
                        }}
                        asChild
                    >
                        <Button
                            variant="destructive"
                            className="dark:text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <LoaderIcon className="size-4 animate-spin mr-2" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="size-4 mr-2" />
                                    Lanjutkan
                                </>
                            )}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteUser
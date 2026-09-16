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

const DeleteActivity = ({ onSuccess, activityId, trigger, children }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleDeleteActivity = async (id) => {
        try {
            setIsLoading(true)
            const res = await api.delete(`/api/activity-monitoring/${id}`)
            if (res.status === 204 || res.status === 200) {
                toast.success("Aktivitas telah berhasil dihapus")
            }
            if (onSuccess) onSuccess()
            setIsOpen(false)
        } catch (error) {
            console.error("Gagal menghapus aktivitas:", error)
            toast.error(error.response?.data?.message || "Gagal menghapus aktivitas, silahkan dicoba lagi")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => {
            if (!isLoading) setIsOpen(open)
        }}>
            <AlertDialogTrigger asChild>
                {trigger || children || (
                    <Button variant="ghost" size="icon" aria-label="Hapus">
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda telah mempertimbangkan dengan seksama penghapusan aktivitas di Fakultas saat ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Perlu kami sampaikan bahwa tindakan ini bersifat final dan tidak dapat dibatalkan. Penghapusan ini akan secara permanen menghapus data yang bersangkutan dari arsip sistem kami.
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
                                handleDeleteActivity(activityId)
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

export default DeleteActivity
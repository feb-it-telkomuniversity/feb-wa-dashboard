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
import { ArrowLeft, LoaderIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

const DeleteUnit = ({ isLoading, setIsLoading, unitId, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleDeleteUnit = async (unitId) => {
        setIsLoading(true)
        try {
            const res = await api.delete(`/api/units/${unitId}`)
            await new Promise(resolve => setTimeout(resolve, 3000))
            if (res.status === 200) {
                toast.success("Unit ini telah berhasil dihapus", {
                    position: "top-center",
                    style: { background: "#fee2e2", color: "#991b1b" },
                    className: "border border-red-500"
                })
            }
        } catch (error) {
            console.error("Oops...Gagal menghapus data unit:", error)
            toast.error("Oops...Gagal menghapus data unit, silahkan dicoba lagi", {
                position: "top-center",
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            onSuccess()
            setIsLoading(false)
            setIsOpen(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => {
            if (!isLoading) setIsOpen(open)
        }}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 flex-1 sm:flex-none h-10 font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20"
                >
                    <Trash2 className="w-4 h-4" />
                    Hapus Unit
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda telah mempertimbangkan dengan seksama penghapusan data unit tersebut?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Perlu kami sampaikan bahwa tindakan ini bersifat final dan tidak dapat dibatalkan. Penghapusan ini akan secara permanen menghapus data unit yang bersangkutan dari arsip sistem kami.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        <ArrowLeft className="size-4 mr-2" /> Kembali
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            if (!isLoading) {
                                handleDeleteUnit(unitId)
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

export default DeleteUnit
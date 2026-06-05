'use client'

import { useState } from 'react'
import api from '@/lib/axios'
import DeleteDialog from '@/components/shadcn-space/radix/dialog/dialog-02'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteSuratKeluar({ suratId, nomorSurat, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        try {
            setIsLoading(true)
            const res = await api.delete(`/api/administrasi-surat/surat-keluar/${suratId}`)

            if (res.data?.success) {
                toast.success('Yes... Data Surat Keluar berhasil dihapus', {
                    position: 'bottom-center',
                    style: { background: "#059669", color: "#d1fae5" },
                    className: "border border-emerald-500",
                })
                onSuccess(suratId)
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Yahh... Gagal menghapus data Surat Keluar'
            toast.error(msg, {
                position: 'bottom-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DeleteDialog
            trigger={
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg"
                    disabled={isLoading}
                    title="Hapus Surat Keluar"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            }
            title="Hapus Data Surat Keluar"
            description={`Apakah Anda yakin ingin menghapus surat keluar "${nomorSurat || 'Draft'}"? Tindakan ini tidak dapat dibatalkan.`}
            onConfirm={handleDelete}
            confirmText="Ya, Hapus"
            cancelText="Batal"
        />
    )
}

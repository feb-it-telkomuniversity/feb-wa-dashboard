'use client'

import { useState } from 'react'
import api from '@/lib/axios'
import DeleteDialog from '@/components/shadcn-space/radix/dialog/dialog-02'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteSuratMasuk({ suratId, nomorSurat, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      const res = await api.delete(`/api/administrasi-surat/surat-masuk/${suratId}`)

      if (res.data?.success) {
        toast.success('Surat masuk berhasil dihapus.')
        onSuccess(suratId)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus surat masuk'
      toast.error(msg)
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
          title="Hapus Surat Masuk"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      }
      title="Hapus Surat Masuk"
      description={`Apakah Anda yakin ingin menghapus surat masuk "${nomorSurat}"? Tindakan ini tidak dapat dibatalkan dan data akan dihapus permanen.`}
      onConfirm={handleDelete}
      confirmText="Ya, Hapus"
      cancelText="Batal"
    />
  )
}

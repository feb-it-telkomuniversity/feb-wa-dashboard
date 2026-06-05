'use client'

import { useState } from 'react'
import api from '@/lib/axios'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

const defaultForm = {
    jenisSurat: 'SuratResmi',
    kerahasiaan: 'Normal',
    tujuanPenerima: '',
    perihal: '',
    isiUtama: ''
}

export default function AddSuratKeluar({ open, onOpenChange, onSuccess }) {
    const [formData, setFormData] = useState(defaultForm)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.tujuanPenerima || !formData.perihal || !formData.isiUtama) {
            toast.error('Harap isi tujuan, perihal, dan isi utama surat!', {
                position: 'bottom-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
            return
        }

        try {
            setIsLoading(true)
            const payload = {
                ...formData
            }

            const res = await api.post('/api/administrasi-surat/surat-keluar', payload)

            if (res.data?.success) {
                toast.success('Yes... Draft surat keluar berhasil dibuat', {
                    position: 'bottom-center',
                    style: { background: "#059669", color: "#d1fae5" },
                    className: "border border-emerald-500",
                })
                onSuccess(res.data.data)
                setFormData(defaultForm)
                onOpenChange(false)
            }
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.message || 'Yahh... Gagal membuat draft surat keluar'
            toast.error(msg, {
                position: 'bottom-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Buat Draft Surat Keluar
                    </DialogTitle>
                    <DialogDescription>
                        Buat draf surat keluar baru. Setelah diajukan, Wakil Dekan/Dekanat dapat memberikan persetujuan (approval) sebelum nomor resmi diterbitkan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="jenisSurat" className="font-semibold text-xs">Jenis Surat</Label>
                            <Select
                                value={formData.jenisSurat}
                                onValueChange={(val) => setFormData({ ...formData, jenisSurat: val })}
                            >
                                <SelectTrigger id="jenisSurat" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SuratResmi">Surat Resmi</SelectItem>
                                    <SelectItem value="SuratTugas">Surat Tugas</SelectItem>
                                    <SelectItem value="SuratUndangan">Surat Undangan</SelectItem>
                                    <SelectItem value="NotaDinas">Nota Dinas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="kerahasiaan" className="font-semibold text-xs">Klasifikasi Surat</Label>
                            <Select
                                value={formData.kerahasiaan}
                                onValueChange={(val) => setFormData({ ...formData, kerahasiaan: val })}
                            >
                                <SelectTrigger id="kerahasiaan" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Normal">Normal (Biasa)</SelectItem>
                                    <SelectItem value="Confidential">Confidential (Rahasia)</SelectItem>
                                    <SelectItem value="Urgent">Urgent (Penting/Segera)</SelectItem>
                                    <SelectItem value="Restricted">Restricted (Terbatas)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tujuanPenerima" className="font-semibold text-xs">Tujuan Penerima <span className="text-red-500">*</span></Label>
                        <Input
                            id="tujuanPenerima"
                            placeholder="Contoh: Rektor Universitas Telkom atau Mitra Industri"
                            value={formData.tujuanPenerima}
                            onChange={(e) => setFormData({ ...formData, tujuanPenerima: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="perihal" className="font-semibold text-xs">Perihal Surat <span className="text-red-500">*</span></Label>
                        <Input
                            id="perihal"
                            placeholder="Subjek/perihal surat keluar"
                            value={formData.perihal}
                            onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="isiUtama" className="font-semibold text-xs">Isi Dokumen Surat <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="isiUtama"
                            rows={6}
                            placeholder="Tulis draf lengkap isi surat dinas di sini..."
                            value={formData.isiUtama}
                            onChange={(e) => setFormData({ ...formData, isiUtama: e.target.value })}
                            required
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl" disabled={isLoading}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/95 text-white rounded-xl" disabled={isLoading}>
                            {isLoading ? 'Menyimpan...' : 'Simpan & Ajukan Persetujuan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

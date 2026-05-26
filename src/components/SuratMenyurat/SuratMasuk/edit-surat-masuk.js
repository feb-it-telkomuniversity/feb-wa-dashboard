'use client'

import { useState, useEffect } from 'react'
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
import { Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const defaultForm = {
    nomorSuratAsal: '',
    instansiPengirim: '',
    tanggalSurat: '',
    tanggalDiterima: '',
    kerahasiaan: 'Normal',
    perihal: '',
    ringkasan: '',
    retensi: 'LimaTahun',
    linkPdf: ''
}

export default function EditSuratMasuk({ open, onOpenChange, suratId, onSuccess }) {
    const [formData, setFormData] = useState(defaultForm)
    const [isFetching, setIsFetching] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Fetch detail saat dialog dibuka
    useEffect(() => {
        if (!open || !suratId) return

        const fetchDetail = async () => {
            try {
                setIsFetching(true)
                const res = await api.get(`/api/administrasi-surat/surat-masuk/${suratId}`)
                if (res.data?.success) {
                    const d = res.data.data
                    setFormData({
                        nomorSuratAsal: d.nomorSuratAsal || '',
                        instansiPengirim: d.instansiPengirim || '',
                        tanggalSurat: d.tanggalSurat ? d.tanggalSurat.split('T')[0] : '',
                        tanggalDiterima: d.tanggalDiterima ? d.tanggalDiterima.split('T')[0] : '',
                        kerahasiaan: d.kerahasiaan || 'Normal',
                        perihal: d.perihal || '',
                        ringkasan: d.ringkasan || '',
                        retensi: d.retensi || 'LimaTahun',
                        linkPdf: d.linkPdf || ''
                    })
                }
            } catch (err) {
                console.error(err)
                toast.error('Gagal mengambil data surat masuk')
            } finally {
                setIsFetching(false)
            }
        }

        fetchDetail()
    }, [open, suratId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.nomorSuratAsal || !formData.instansiPengirim || !formData.perihal || !formData.tanggalSurat) {
            toast.error('Harap isi semua kolom wajib!')
            return
        }

        try {
            setIsLoading(true)
            const payload = {
                ...formData,
                tanggalSurat: new Date(formData.tanggalSurat).toISOString(),
                tanggalDiterima: new Date(formData.tanggalDiterima).toISOString(),
                linkPdf: formData.linkPdf || null
            }

            const res = await api.put(`/api/administrasi-surat/surat-masuk/${suratId}`, payload)

            if (res.data?.success) {
                toast.success('Surat masuk berhasil diperbarui!')
                onSuccess(res.data.data)
                onOpenChange(false)
            }
        } catch (err) {
            console.error(err)
            toast.error('Gagal memperbarui surat masuk')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-primary" /> Edit Surat Masuk
                    </DialogTitle>
                    <DialogDescription>
                        Perbarui metadata surat masuk. Perubahan akan tersimpan ke database secara permanen.
                    </DialogDescription>
                </DialogHeader>

                {isFetching ? (
                    <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Memuat data...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-nomorSuratAsal" className="font-semibold text-xs">Nomor Surat Asal <span className="text-red-500">*</span></Label>
                                <Input
                                    id="edit-nomorSuratAsal"
                                    placeholder="Contoh: 002.1/DPK/FEB/2026"
                                    value={formData.nomorSuratAsal}
                                    onChange={(e) => setFormData({ ...formData, nomorSuratAsal: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-instansiPengirim" className="font-semibold text-xs">Instansi Pengirim <span className="text-red-500">*</span></Label>
                                <Input
                                    id="edit-instansiPengirim"
                                    placeholder="Contoh: LLDIKTI Wilayah IV"
                                    value={formData.instansiPengirim}
                                    onChange={(e) => setFormData({ ...formData, instansiPengirim: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-tanggalSurat" className="font-semibold text-xs">Tanggal Surat <span className="text-red-500">*</span></Label>
                                <Input
                                    id="edit-tanggalSurat"
                                    type="date"
                                    value={formData.tanggalSurat}
                                    onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-tanggalDiterima" className="font-semibold text-xs">Tanggal Diterima</Label>
                                <Input
                                    id="edit-tanggalDiterima"
                                    type="date"
                                    value={formData.tanggalDiterima}
                                    onChange={(e) => setFormData({ ...formData, tanggalDiterima: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-kerahasiaan" className="font-semibold text-xs">Klasifikasi Kerahasiaan</Label>
                                <Select
                                    value={formData.kerahasiaan}
                                    onValueChange={(val) => setFormData({ ...formData, kerahasiaan: val })}
                                >
                                    <SelectTrigger id="edit-kerahasiaan" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Normal">Normal</SelectItem>
                                        <SelectItem value="Confidential">Confidential</SelectItem>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                        <SelectItem value="Restricted">Restricted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-retensi" className="font-semibold text-xs">Masa Retensi Rekam</Label>
                                <Select
                                    value={formData.retensi}
                                    onValueChange={(val) => setFormData({ ...formData, retensi: val })}
                                >
                                    <SelectTrigger id="edit-retensi" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SatuTahun">1 Tahun (Operasional)</SelectItem>
                                        <SelectItem value="DuaTahun">2 Tahun</SelectItem>
                                        <SelectItem value="LimaTahun">5 Tahun (Standar Akreditasi)</SelectItem>
                                        <SelectItem value="SepuluhTahun">10 Tahun (Kepegawaian/Keuangan)</SelectItem>
                                        <SelectItem value="Permanen">Permanent (Arsip Vital)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-perihal" className="font-semibold text-xs">Perihal Surat <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit-perihal"
                                placeholder="Subjek formal surat"
                                value={formData.perihal}
                                onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-ringkasan" className="font-semibold text-xs">Sari Isi / Ringkasan Surat</Label>
                            <Textarea
                                id="edit-ringkasan"
                                rows={3}
                                placeholder="Rangkuman ringkas isi surat..."
                                value={formData.ringkasan}
                                onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-linkPdf" className="font-semibold text-xs">Lampiran Link (PDF)</Label>
                            <Input
                                id="edit-linkPdf"
                                placeholder="Contoh: https://drive.google.com/..."
                                value={formData.linkPdf}
                                onChange={(e) => setFormData({ ...formData, linkPdf: e.target.value })}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl"
                                disabled={isLoading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/95 text-white rounded-xl"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

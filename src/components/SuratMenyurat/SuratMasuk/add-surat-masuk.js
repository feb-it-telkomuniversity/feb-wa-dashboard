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
    nomorSuratAsal: '',
    instansiPengirim: '',
    tanggalSurat: '',
    tanggalDiterima: new Date().toISOString().split('T')[0],
    kerahasiaan: 'Normal',
    perihal: '',
    ringkasan: '',
    retensi: 'LimaTahun',
    linkPdf: ''
}

export default function AddSuratMasuk({ open, onOpenChange, onSuccess }) {
    const [formData, setFormData] = useState(defaultForm)
    const [isLoading, setIsLoading] = useState(false)

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

            const res = await api.post('/api/administrasi-surat/surat-masuk', payload)

            if (res.data?.success) {
                toast.success('Surat masuk berhasil didaftarkan!')
                onSuccess(res.data.data)
                onOpenChange(false)
                setFormData(defaultForm)
            }
        } catch (err) {
            console.error(err)
            toast.error('Gagal mendaftarkan surat masuk')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Registrasi Surat Masuk Baru
                    </DialogTitle>
                    <DialogDescription>
                        Catat metadata surat masuk sesuai dengan standar ISO 23081 untuk mempermudah pelacakan dan audit.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="nomorSuratAsal" className="font-semibold text-xs">Nomor Surat Asal <span className="text-red-500">*</span></Label>
                            <Input
                                id="nomorSuratAsal"
                                placeholder="Contoh: 002.1/DPK/FEB/2026"
                                value={formData.nomorSuratAsal}
                                onChange={(e) => setFormData({ ...formData, nomorSuratAsal: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="instansiPengirim" className="font-semibold text-xs">Instansi Pengirim <span className="text-red-500">*</span></Label>
                            <Input
                                id="instansiPengirim"
                                placeholder="Contoh: LLDIKTI Wilayah IV"
                                value={formData.instansiPengirim}
                                onChange={(e) => setFormData({ ...formData, instansiPengirim: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="tanggalSurat" className="font-semibold text-xs">Tanggal Surat <span className="text-red-500">*</span></Label>
                            <Input
                                id="tanggalSurat"
                                type="date"
                                value={formData.tanggalSurat}
                                onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tanggalDiterima" className="font-semibold text-xs">Tanggal Diterima</Label>
                            <Input
                                id="tanggalDiterima"
                                type="date"
                                value={formData.tanggalDiterima}
                                onChange={(e) => setFormData({ ...formData, tanggalDiterima: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="kerahasiaan" className="font-semibold text-xs">Klasifikasi Kerahasiaan</Label>
                            <Select
                                value={formData.kerahasiaan}
                                onValueChange={(val) => setFormData({ ...formData, kerahasiaan: val })}
                            >
                                <SelectTrigger id="kerahasiaan" className="w-full">
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
                            <Label htmlFor="retensi" className="font-semibold text-xs">Masa Retensi Rekam</Label>
                            <Select
                                value={formData.retensi}
                                onValueChange={(val) => setFormData({ ...formData, retensi: val })}
                            >
                                <SelectTrigger id="retensi" className="w-full">
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
                        <Label htmlFor="perihal" className="font-semibold text-xs">Perihal Surat <span className="text-red-500">*</span></Label>
                        <Input
                            id="perihal"
                            placeholder="Subjek formal surat"
                            value={formData.perihal}
                            onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ringkasan" className="font-semibold text-xs">Sari Isi / Ringkasan Surat</Label>
                        <Textarea
                            id="ringkasan"
                            rows={3}
                            placeholder="Rangkuman ringkas isi surat untuk mempermudah pembacaan disposisi..."
                            value={formData.ringkasan}
                            onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="linkPdf" className="font-semibold text-xs">Lampiran Link (PDF)</Label>
                        <Input
                            id="linkPdf"
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
                            {isLoading ? 'Menyimpan...' : 'Simpan & Daftarkan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

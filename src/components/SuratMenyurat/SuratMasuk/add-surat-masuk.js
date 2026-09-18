'use client'

import { useState, useRef } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Sparkles, FileCheck, FileText, Loader2, UploadCloud, RefreshCw } from 'lucide-react'
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
    const [isExtracting, setIsExtracting] = useState(false)
    const [extractedFileName, setExtractedFileName] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    // Handle File Extraction via AI
    const handleFileUpload = async (file) => {
        if (!file) return

        if (file.size > 15 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 15MB')
            return
        }

        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Format berkas harus berupa PDF atau gambar (JPG, PNG)')
            return
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        setIsExtracting(true)
        const toastId = toast.loading('AI sedang membaca & menganalisis dokumen surat...', {
            description: 'Mengekstrak nomor, pengirim, perihal, dan tanggal surat.'
        })

        try {
            const res = await api.post('/api/administrasi-surat/surat-masuk/extract-ai', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            if (res.data?.success && res.data?.data) {
                const d = res.data.data

                setFormData(prev => ({
                    ...prev,
                    nomorSuratAsal: d.nomorSuratAsal || prev.nomorSuratAsal,
                    instansiPengirim: d.instansiPengirim || prev.instansiPengirim,
                    tanggalSurat: d.tanggalSurat || prev.tanggalSurat,
                    perihal: d.perihal || prev.perihal,
                    ringkasan: d.ringkasan || prev.ringkasan,
                    kerahasiaan: d.kerahasiaan || prev.kerahasiaan,
                    linkPdf: d.linkPdf || prev.linkPdf,
                }))

                setExtractedFileName(file.name)
                toast.success('Informasi surat berhasil diekstrak otomatis oleh AI! ✨', {
                    id: toastId,
                    description: 'Silakan verifikasi isian formulir di bawah sebelum menyimpan.'
                })
            } else {
                toast.error('Gagal mengekstrak data surat dari berkas', { id: toastId })
            }
        } catch (err) {
            console.error('AI Extraction Error:', err)
            const errMsg = err.response?.data?.message || 'Gagal menganalisis dokumen dengan AI. Anda dapat mengisi form secara manual.'
            toast.error(errMsg, { id: toastId })
        } finally {
            setIsExtracting(false)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0])
        }
    }

    const handleResetModal = () => {
        setFormData(defaultForm)
        setExtractedFileName(null)
        setIsExtracting(false)
    }

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
                handleResetModal()
            }
        } catch (err) {
            console.error(err)
            toast.error('Gagal mendaftarkan surat masuk')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val)
            if (!val) handleResetModal()
        }}>
            <DialogContent className="max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Registrasi Surat Masuk Baru
                    </DialogTitle>
                    <DialogDescription>
                        Unggah berkas surat untuk ekstraksi otomatis dengan AI atau isi metadata secara manual.
                    </DialogDescription>
                </DialogHeader>

                {/* AI Document Dropzone Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isExtracting && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 text-center transition-all cursor-pointer ${
                        isExtracting 
                            ? 'border-primary bg-primary/5 cursor-wait' 
                            : dragActive 
                                ? 'border-primary bg-primary/10 shadow-sm' 
                                : 'border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleFileInputChange}
                        disabled={isExtracting}
                    />

                    {isExtracting ? (
                        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                            <div className="flex items-center gap-2 text-primary font-semibold text-xs animate-pulse">
                                <Sparkles className="h-4 w-4 animate-spin text-primary" />
                                <span>AI sedang membaca & mengekstrak data surat...</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Mengidentifikasi kop surat, nomor, tanggal, perihal, dan ringkasan isi...
                            </p>
                        </div>
                    ) : extractedFileName ? (
                        <div className="flex items-center justify-between gap-2 px-1">
                            <div className="flex items-center gap-2.5 min-w-0 text-left">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                                    <FileCheck className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-semibold text-foreground truncate max-w-[220px] sm:max-w-[320px]">
                                            {extractedFileName}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 border-emerald-300 bg-emerald-50 px-1 py-0">
                                            Ekstraksi AI Selesai ✨
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Form terisi otomatis. Klik untuk ganti file jika diperlukan.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    fileInputRef.current?.click()
                                }}
                            >
                                <RefreshCw className="h-3 w-3" />
                                Ganti
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 py-0.5">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="text-center sm:text-left">
                                <div className="text-xs font-semibold text-foreground">
                                    <span className="text-primary">Tarik & lepas file surat</span> atau <span className="underline decoration-primary/50">klik untuk unggah</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Format PDF atau scan foto JPG/PNG — Data surat akan otomatis dibaca oleh AI ✨
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 py-1">
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
                            disabled={isLoading || isExtracting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/95 text-white rounded-xl"
                            disabled={isLoading || isExtracting}
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan & Daftarkan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


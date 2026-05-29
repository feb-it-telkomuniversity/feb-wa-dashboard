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
import { UserCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

// Mapping enum backend -> label tampilan
const instruksiOptions = [
    { value: 'TindakLanjuti', label: 'Tindak Lanjuti & Laporkan' },
    { value: 'Pelajari', label: 'Pelajari & Beri Saran' },
    { value: 'Hadiri', label: 'Hadiri / Wakili' },
    { value: 'Simpan', label: 'Simpan / Arsipkan' },
    { value: 'DraftBalasan', label: 'Draft Balasan' },
]

const defaultForm = {
    penerimaUnitId: '',
    instruksi: 'TindakLanjuti',
    batasWaktu: '',
    catatan: ''
}

export default function AddDisposisi({ open, onOpenChange, suratMasuk, onSuccess }) {
    const { user } = useAuth()
    const [formData, setFormData] = useState(defaultForm)
    const [units, setUnits] = useState([])
    const [isFetchingUnits, setIsFetchingUnits] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Fetch daftar unit saat dialog dibuka
    useEffect(() => {
        if (!open) return

        const fetchUnits = async () => {
            try {
                setIsFetchingUnits(true)
                const res = await api.get('/api/units')
                if (res.data?.success && Array.isArray(res.data?.units)) {
                    setUnits(res.data.units)
                }
            } catch (err) {
                console.error('Gagal mengambil data unit:', err)
                toast.error('Gagal memuat daftar unit')
            } finally {
                setIsFetchingUnits(false)
            }
        }

        fetchUnits()
        setFormData(defaultForm)
    }, [open])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.penerimaUnitId || !formData.instruksi || !formData.batasWaktu) {
            toast.error('Harap lengkapi unit penerima, instruksi, dan batas waktu!')
            return
        }

        if (!user?.id) {
            toast.error('Sesi pengguna tidak ditemukan. Silakan login kembali.')
            return
        }

        try {
            setIsLoading(true)
            const payload = {
                suratMasukId: suratMasuk.id,
                pemberiId: user.id,
                penerimaUnitId: parseInt(formData.penerimaUnitId),
                instruksi: formData.instruksi,
                batasWaktu: new Date(formData.batasWaktu).toISOString(),
                catatan: formData.catatan || null
            }

            const res = await api.post('/api/administrasi-surat/disposisi-surat', payload)

            if (res.data?.success) {
                toast.success('Surat berhasil didisposisikan!')
                onSuccess(res.data.data)
                onOpenChange(false)
            }
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.message || 'Gagal mendisposisikan surat'
            toast.error(msg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-primary" /> Disposisi Surat Masuk
                    </DialogTitle>
                    <DialogDescription>
                        Klasifikasi: <strong>{suratMasuk?.kerahasiaan}</strong>. Delegasikan secara terstruktur ke unit yang bertanggung jawab.
                    </DialogDescription>
                </DialogHeader>

                {/* Info Ringkas Surat */}
                {suratMasuk && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border text-xs space-y-1">
                        <div><strong>Nomor:</strong> {suratMasuk.nomorSuratAsal}</div>
                        <div><strong>Pengirim:</strong> {suratMasuk.instansiPengirim}</div>
                        <div className="line-clamp-1"><strong>Perihal:</strong> {suratMasuk.perihal}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Unit Penerima */}
                    <div className="space-y-1.5">
                        <Label htmlFor="penerimaUnitId" className="font-semibold text-xs">Unit Penerima Disposisi <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.penerimaUnitId}
                            onValueChange={(val) => setFormData({ ...formData, penerimaUnitId: val })}
                            disabled={isFetchingUnits}
                        >
                            <SelectTrigger id="penerimaUnitId" className="w-full">
                                {isFetchingUnits
                                    ? <span className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="w-3 h-3 animate-spin" /> Memuat unit...</span>
                                    : <SelectValue placeholder="Pilih Unit / Jabatan" />
                                }
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem key={unit.id} value={String(unit.id)}>
                                        {unit.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Instruksi & Batas Waktu */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="instruksi" className="font-semibold text-xs">Instruksi Aksi <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.instruksi}
                                onValueChange={(val) => setFormData({ ...formData, instruksi: val })}
                            >
                                <SelectTrigger id="instruksi" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {instruksiOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="batasWaktu" className="font-semibold text-xs">Batas Waktu <span className="text-red-500">*</span></Label>
                            <Input
                                id="batasWaktu"
                                type="date"
                                value={formData.batasWaktu}
                                onChange={(e) => setFormData({ ...formData, batasWaktu: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Catatan */}
                    <div className="space-y-1.5">
                        <Label htmlFor="catatan" className="font-semibold text-xs">Catatan / Petunjuk Tambahan</Label>
                        <Textarea
                            id="catatan"
                            rows={3}
                            placeholder="Tulis instruksi khusus yang perlu dikerjakan oleh penerima disposisi..."
                            value={formData.catatan}
                            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
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
                            disabled={isLoading || isFetchingUnits}
                        >
                            {isLoading ? 'Mengirim...' : 'Kirim Disposisi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

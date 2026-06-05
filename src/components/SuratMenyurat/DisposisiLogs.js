'use client'

import React, { useState, useEffect } from 'react'
import api from '@/lib/axios'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ClipboardList,
    AlertTriangle,
    FolderOpen,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import DeleteDisposisi from './DisposisiSurat/delete-disposisi'

// Mapping enum backend -> label tampilan
const instruksiLabel = {
    TindakLanjuti: 'Tindak Lanjuti & Laporkan',
    Pelajari: 'Pelajari & Beri Saran',
    Hadiri: 'Hadiri / Wakili',
    Simpan: 'Simpan / Arsipkan',
    DraftBalasan: 'Draft Balasan',
}

export default function DisposisiLogs() {
    const [dispositions, setDispositions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadingAction, setLoadingAction] = useState(null) // tracks id of row being acted on

    useEffect(() => {
        const fetchDisposisi = async () => {
            try {
                setIsLoading(true)
                const res = await api.get('/api/administrasi-surat/disposisi-surat')
                if (res.data?.success) {
                    setDispositions(res.data.data)
                }
            } catch (err) {
                console.error('Gagal mengambil data disposisi:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDisposisi()
    }, [])

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Selesai':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Selesai</Badge>
            case 'Diproses':
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Diproses</Badge>
            default:
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Belum Diproses</Badge>
        }
    }

    const isOverdue = (dateStr, status) => {
        if (status === 'Selesai' || !dateStr) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return new Date(dateStr) < today
    }

    // Toggle status: BelumDiproses -> Diproses -> Selesai -> BelumDiproses
    const handleToggleStatus = async (id, currentStatus) => {
        const nextStatus =
            currentStatus === 'BelumDiproses' ? 'Diproses'
                : currentStatus === 'Diproses' ? 'Selesai'
                    : 'BelumDiproses'

        setLoadingAction(id)
        try {
            await api.patch(`/api/administrasi-surat/disposisi-surat/${id}/status`, { status: nextStatus })
            setDispositions(prev =>
                prev.map(d => d.id === id ? { ...d, status: nextStatus } : d)
            )
            toast.success(`Status disposisi diubah menjadi "${nextStatus}"`, {
                position: 'bottom-center',
                style: { background: "#059669", color: "#d1fae5" },
                className: "border border-emerald-500",
            })
        } catch (err) {
            // console.error('Gagal mengubah status disposisi:', err)
            toast.error('Yahh... Gagal mengubah status disposisi', {
                position: 'bottom-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            setLoadingAction(null)
        }
    }


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-primary" /> Log Delegasi & Disposisi Aktif
                </h3>
            </div>

            <div className="rounded-xl border border-border bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40">
                            <TableRow>
                                <TableHead className="w-[180px] font-bold">No. Surat Masuk</TableHead>
                                <TableHead className="font-bold">Perihal</TableHead>
                                <TableHead className="font-bold">Pemberi</TableHead>
                                <TableHead className="font-bold">Penerima (Unit)</TableHead>
                                <TableHead className="font-bold">Instruksi / Catatan</TableHead>
                                <TableHead className="w-[120px] font-bold">Batas Waktu</TableHead>
                                <TableHead className="w-[120px] font-bold">Status</TableHead>
                                <TableHead className="w-[120px] text-right font-bold">Tindakan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                                            <span className="text-sm">Memuat data disposisi...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : dispositions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
                                            <span>Belum ada disposisi surat masuk yang tercatat.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                dispositions.map((disp) => {
                                    const overdue = isOverdue(disp.batasWaktu, disp.status)
                                    return (
                                        <TableRow key={disp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <TableCell className="font-mono text-xs font-semibold">
                                                {disp.suratMasuk?.nomorSuratAsal || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-sm line-clamp-1">
                                                    {disp.suratMasuk?.perihal || 'Surat dihapus'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-muted-foreground">
                                                {disp.pemberi?.name || '-'}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {disp.penerimaUnit?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-semibold text-sm text-primary">
                                                        {instruksiLabel[disp.instruksi] || disp.instruksi}
                                                    </div>
                                                    {disp.catatan && (
                                                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{disp.catatan}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {disp.batasWaktu
                                                            ? new Date(disp.batasWaktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : '-'}
                                                    </span>
                                                    {overdue && (
                                                        <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5">
                                                            <AlertTriangle className="w-3 h-3" /> Terlambat!
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(disp.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={loadingAction === disp.id}
                                                        onClick={() => handleToggleStatus(disp.id, disp.status)}
                                                        className="h-8 text-xs hover:bg-slate-100 rounded-lg text-primary gap-1"
                                                    >
                                                        {loadingAction === disp.id
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <CheckCircle2 className="w-3.5 h-3.5" />
                                                        } Progress
                                                    </Button>
                                                    <DeleteDisposisi
                                                        disposisiId={disp.id}
                                                        nomorSurat={disp.suratMasuk?.nomorSuratAsal}
                                                        onSuccess={(id) =>
                                                            setDispositions(prev => prev.filter(d => d.id !== id))
                                                        }
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }))
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Mail,
    Building2,
    Calendar,
    FileText,
    ExternalLink,
    UserCheck,
    Pencil,
    Shield,
    Clock,
    Hash,
    CheckCircle2
} from 'lucide-react'

export default function DetailSuratMasuk({
    open,
    onOpenChange,
    letter,
    onOpenDisposisi,
    onOpenEdit
}) {
    if (!letter) return null

    const getBadgeColor = (classification) => {
        switch (classification) {
            case 'Confidential':
                return 'bg-red-500/10 text-red-600 border-red-500/20'
            case 'Urgent':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            case 'Restricted':
                return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
            default:
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        }
    }

    const getStatusBadge = (status) => {
        if (status === 'Disposed' || status === 'Didisposisikan' || status === 'BelumDiproses') {
            return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Didisposisikan</Badge>
        }
        if (status === 'Selesai') {
            return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Selesai</Badge>
        }
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{status === 'Diterima' ? 'Diterima' : 'Pending'}</Badge>
    }

    const formatRetensi = (val) => {
        switch (val) {
            case 'SatuTahun': return '1 Tahun (Operasional)'
            case 'DuaTahun': return '2 Tahun'
            case 'LimaTahun': return '5 Tahun (Standar Akreditasi)'
            case 'SepuluhTahun': return '10 Tahun (Kepegawaian/Keuangan)'
            case 'Permanen': return 'Permanen (Arsip Vital)'
            default: return val || 'Standar (5 Tahun)'
        }
    }

    const tanggalSuratFormatted = letter.tanggalSurat
        ? new Date(letter.tanggalSurat).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '-'

    const tanggalDiterimaFormatted = (letter.tanggalDiterima || letter.dateReceived)
        ? new Date(letter.tanggalDiterima || letter.dateReceived).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '-'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95vw] rounded-2xl max-h-[90vh] flex flex-col p-6 sm:p-7 overflow-hidden">
                {/* Header - Tetap di atas (tidak ikut scroll) */}
                <DialogHeader className="pb-3 border-b border-border/50 text-left shrink-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${getBadgeColor(letter.kerahasiaan || letter.classification)} text-xs font-semibold px-2 py-0.5 whitespace-nowrap`}>
                                <Shield className="w-3.5 h-3.5 mr-1" />
                                {letter.kerahasiaan || letter.classification || 'Normal'}
                            </Badge>
                            {getStatusBadge(letter.status)}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-md border">
                            ID: #{letter.id}
                        </span>
                    </div>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug mt-2.5 break-words">
                        {letter.perihal || letter.subject || 'Surat Masuk Tanpa Perihal'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Rincian lengkap arsip tata naskah dinas dan status penanganan surat masuk.
                    </DialogDescription>
                </DialogHeader>

                {/* Konten Utama - Scroll Vertikal Mulus, Tanpa Scroll Horizontal */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 py-3 pr-1 text-xs w-full min-w-0">
                    {/* Ringkasan Identitas Dokumen */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/60 w-full min-w-0">
                        <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5 text-primary shrink-0" /> Nomor Surat Asal
                            </div>
                            <div className="font-mono font-bold text-xs sm:text-sm text-foreground select-all break-all sm:break-words">
                                {letter.nomorSuratAsal || letter.letterNumber || '-'}
                            </div>
                        </div>

                        <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" /> Instansi / Pengirim
                            </div>
                            <div className="font-semibold text-xs sm:text-sm text-foreground break-words">
                                {letter.instansiPengirim || letter.sender || '-'}
                            </div>
                        </div>

                        <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> Tanggal Surat
                            </div>
                            <div className="font-medium text-foreground break-words">
                                {tanggalSuratFormatted}
                            </div>
                        </div>

                        <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" /> Tanggal Diterima di Fakultas
                            </div>
                            <div className="font-medium text-foreground break-words">
                                {tanggalDiterimaFormatted}
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1 pt-2 border-t border-border/40 min-w-0">
                            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> Masa Retensi Arsip
                            </div>
                            <div className="text-xs text-foreground font-medium">
                                {formatRetensi(letter.retensi)}
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan / Sari Isi */}
                    <div className="space-y-1.5 w-full min-w-0">
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" /> Sari Isi / Ringkasan Surat
                        </div>
                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap break-words">
                            {letter.ringkasan || letter.summary || 'Tidak ada ringkasan atau catatan tambahan untuk surat masuk ini.'}
                        </div>
                    </div>

                    {/* Lampiran Dokumen PDF */}
                    <div className="space-y-1.5 w-full min-w-0">
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary shrink-0" /> Berkas Dokumen Fisik / Digital
                        </div>
                        {letter.linkPdf ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 min-w-0">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                        Lampiran Surat Terverifikasi
                                    </p>
                                    <p className="text-[11px] text-muted-foreground break-all mt-0.5 line-clamp-2">
                                        {letter.linkPdf}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => window.open(letter.linkPdf, '_blank')}
                                    className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 h-8 shrink-0 rounded-lg shadow-xs w-full sm:w-auto"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Buka Berkas PDF
                                </Button>
                            </div>
                        ) : (
                            <div className="p-3.5 rounded-xl border border-dashed text-center text-muted-foreground text-xs bg-muted/10">
                                Tidak ada berkas digital (PDF) yang dilampirkan pada registrasi surat ini.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Tetap di bawah (tidak ikut scroll) */}
                <DialogFooter className="pt-3 border-t border-border/50 shrink-0 flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl text-xs h-9"
                    >
                        Tutup
                    </Button>

                    <div className="flex items-center gap-2">
                        {onOpenEdit && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onOpenChange(false)
                                    onOpenEdit(letter)
                                }}
                                className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 text-xs h-9 gap-1.5 rounded-xl flex-1 sm:flex-none"
                            >
                                <Pencil className="w-3.5 h-3.5" /> Edit Surat
                            </Button>
                        )}
                        {onOpenDisposisi && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    onOpenChange(false)
                                    onOpenDisposisi(letter)
                                }}
                                className="bg-primary hover:bg-primary/90 text-white text-xs h-9 gap-1.5 rounded-xl shadow-xs flex-1 sm:flex-none"
                            >
                                <UserCheck className="w-3.5 h-3.5" /> Disposisikan
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

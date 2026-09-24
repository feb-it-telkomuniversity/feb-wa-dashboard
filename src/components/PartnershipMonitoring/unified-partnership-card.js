'use client'

import React, { useState, useEffect } from 'react'
import { BellRing, Clock, Settings2, FileSignature, Handshake, ScrollText, Globe2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { DEFAULT_REMINDER_DAYS, getStoredReminderDays } from './partnership-reminder'

export default function UnifiedPartnershipCard({ statusData = {}, onFilterExpiring, onRefreshStats }) {
    const [reminderDays, setReminderDays] = useState(DEFAULT_REMINDER_DAYS)
    const [inputDays, setInputDays] = useState(DEFAULT_REMINDER_DAYS)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        const days = getStoredReminderDays()
        setReminderDays(days)
        setInputDays(days)
    }, [])

    const handleSaveSettings = () => {
        const parsed = parseInt(inputDays, 10)
        if (isNaN(parsed) || parsed <= 0) {
            toast.error("Waktu pengingat harus berupa angka positif (dalam hari)")
            return
        }
        localStorage.setItem('mira_partnership_reminder_days', parsed.toString())
        setReminderDays(parsed)
        setIsDialogOpen(false)
        toast.success(`Pengaturan pengingat berhasil disimpan (${parsed} hari)`)
        if (onRefreshStats) {
            onRefreshStats(parsed)
        }
        window.dispatchEvent(new Event('storage'))
    }

    const expiringCount = statusData.expiringCount ?? 0

    return (
        <Card className="border border-border/80 bg-card/95 shadow-xs p-2.5 sm:px-4 sm:py-2.5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Bagian Kiri: Pengingat Masa Berlaku (Minimalis) */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                        <BellRing className="h-4 w-4" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-semibold text-foreground">Pengingat:</span>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-amber-300 bg-amber-50/50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                            H-{reminderDays}
                        </Badge>
                        <span className="text-muted-foreground">
                            {expiringCount > 0 ? (
                                <span className="text-amber-700 dark:text-amber-400 font-medium">
                                    {expiringCount} dokumen mendekati kadaluarsa
                                </span>
                            ) : (
                                "Tidak ada dokumen kadaluarsa"
                            )}
                        </span>

                        {expiringCount > 0 && onFilterExpiring && (
                            <button
                                onClick={onFilterExpiring}
                                className="text-[11px] font-medium text-amber-800 dark:text-amber-300 underline hover:no-underline ml-1"
                            >
                                Lihat data
                            </button>
                        )}
                    </div>

                    {/* Tombol Atur Pengingat (Icon saja tanpa text untuk minimalis) */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
                                title="Atur batas hari pengingat"
                            >
                                <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                    Pengaturan Waktu Pengingat
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Tentukan batas waktu (dalam hari) sebelum masa berlaku dokumen habis untuk memunculkan status peringatan di dashboard.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={inputDays}
                                        onChange={(e) => setInputDays(e.target.value)}
                                        className="w-24 text-center font-bold text-base"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Hari sebelum tanggal masa berlaku berakhir
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {[7, 14, 30, 60, 90].map((preset) => (
                                        <Badge
                                            key={preset}
                                            variant="outline"
                                            className={`cursor-pointer px-2.5 py-1 text-xs transition-colors ${
                                                parseInt(inputDays, 10) === preset
                                                    ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                                                    : 'hover:bg-amber-100 dark:hover:bg-amber-900/40'
                                            }`}
                                            onClick={() => setInputDays(preset)}
                                        >
                                            H-{preset}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setInputDays(reminderDays)
                                        setIsDialogOpen(false)
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                    onClick={handleSaveSettings}
                                >
                                    Simpan Pengaturan
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Divider Pemisah */}
                <div className="hidden md:block h-6 w-px bg-border/70 shrink-0" />

                {/* Bagian Kanan: 4 Metrik Ringkasan (Icon tanpa teks panjang untuk tampilan minimalis) */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    {/* MoA */}
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/80 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40 select-none cursor-default"
                        title={`Jumlah MoA (Memorandum of Agreement): ${statusData.totalMoA ?? 0}`}
                    >
                        <FileSignature className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold leading-none">{statusData.totalMoA ?? 0}</span>
                    </div>

                    {/* MoU */}
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50/80 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40 select-none cursor-default"
                        title={`Jumlah MoU (Memorandum of Understanding): ${statusData.totalMoU ?? 0}`}
                    >
                        <Handshake className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold leading-none">{statusData.totalMoU ?? 0}</span>
                    </div>

                    {/* IA */}
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40 select-none cursor-default"
                        title={`Jumlah IA (Surat Keputusan Kerjasama): ${statusData.totalIA ?? 0}`}
                    >
                        <ScrollText className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold leading-none">{statusData.totalIA ?? 0}</span>
                    </div>

                    {/* Mitra Aktif */}
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40 select-none cursor-default"
                        title={`Total Mitra Aktif: ${statusData.activePartnerGroup ?? 0}`}
                    >
                        <Globe2 className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold leading-none">{statusData.activePartnerGroup ?? 0}</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

'use client'

import React, { useState, useEffect } from 'react'
import { BellRing, Calendar, Clock, AlertTriangle, Settings2, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

export const DEFAULT_REMINDER_DAYS = 30

export const getStoredReminderDays = () => {
    if (typeof window === 'undefined') return DEFAULT_REMINDER_DAYS
    const stored = localStorage.getItem('mira_partnership_reminder_days')
    const parsed = parseInt(stored, 10)
    return isNaN(parsed) || parsed <= 0 ? DEFAULT_REMINDER_DAYS : parsed
}

export default function PartnershipReminder({ partnershipData = [], onFilterExpiring }) {
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
        toast.success(`Pengaturan pengingat berhasil disimpan (${parsed} hari sebelum kadaluarsa)`)
        // Trigger storage event so other components update if needed
        window.dispatchEvent(new Event('storage'))
    }

    // Hitung dokumen yang kadaluarsa & mendekati kadaluarsa
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const expiringItems = partnershipData.filter(item => {
        if (!item.validUntil) return false
        const validDate = new Date(item.validUntil)
        validDate.setHours(0, 0, 0, 0)
        const diffTime = validDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= reminderDays
    })

    const expiredItemsCount = partnershipData.filter(item => {
        if (!item.validUntil) return false
        const validDate = new Date(item.validUntil)
        validDate.setHours(0, 0, 0, 0)
        return validDate.getTime() < today.getTime()
    }).length

    return (
        <div className="space-y-3">
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-xl shrink-0 mt-0.5">
                            <BellRing className="h-5 w-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                    Pengingat Masa Berlaku Dokumen
                                </h4>
                                <Badge variant="outline" className="text-xs bg-amber-100/80 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300">
                                    Ambrik H-{reminderDays} Hari
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                {expiringItems.length > 0 ? (
                                    <span>
                                        Ada <strong className="text-amber-700 dark:text-amber-400 font-bold">{expiringItems.length} dokumen</strong> yang akan kadaluarsa dalam waktu kurang dari {reminderDays} hari.
                                    </span>
                                ) : (
                                    <span>
                                        Tidak ada dokumen yang akan kadaluarsa dalam kurun waktu {reminderDays} hari ke depan.
                                    </span>
                                )}
                                {expiredItemsCount > 0 && (
                                    <span className="ml-1.5 text-red-600 dark:text-red-400 font-medium">
                                        ({expiredItemsCount} dokumen telah otomatis tidak aktif/kadaluarsa).
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        {expiringItems.length > 0 && onFilterExpiring && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs border-amber-300 hover:bg-amber-100/60 dark:border-amber-800"
                                onClick={onFilterExpiring}
                            >
                                Lihat Dokumen ({expiringItems.length})
                            </Button>
                        )}

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5 text-slate-700 dark:text-slate-300 hover:bg-amber-100/40">
                                    <Settings2 className="h-3.5 w-3.5" />
                                    Atur Pengingat
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                        Pengaturan Waktu Pengingat
                                    </DialogTitle>
                                    <DialogDescription>
                                        Tentukan batas waktu (dalam hari) sebelum masa berlaku dokumen habis untuk memunculkan status peringatan di dashboard.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Batas Waktu Pengingat (Hari)</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={inputDays}
                                                onChange={(e) => setInputDays(e.target.value)}
                                                placeholder="30"
                                                className="w-32"
                                            />
                                            <span className="text-sm text-muted-foreground">Hari Sebelum Kadaluarsa</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <span className="text-xs text-muted-foreground w-full block">Pilihan Cepat:</span>
                                        {[7, 14, 30, 60, 90].map((preset) => (
                                            <Button
                                                key={preset}
                                                type="button"
                                                variant={parseInt(inputDays, 10) === preset ? "default" : "outline"}
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => setInputDays(preset.toString())}
                                            >
                                                {preset} Hari
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button onClick={handleSaveSettings} className="gap-1.5">
                                        <Check className="h-4 w-4" />
                                        Simpan Pengaturan
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

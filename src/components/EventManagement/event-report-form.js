'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileText, Link as LinkIcon, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea as ShadedTextarea } from '@/components/ui/textarea'

export default function EventReportForm({ activity, onSave }) {
    const [report, setReport] = useState({
        title: '',
        content: '',
        obstacles: '',
        recommendations: '',
        status: 'Draft',
        attachments: ''
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (activity?.report) {
            setReport({
                title: activity.report.title || '',
                content: activity.report.content || '',
                obstacles: activity.report.obstacles || '',
                recommendations: activity.report.recommendations || '',
                status: activity.report.status || 'Draft',
                attachments: activity.report.attachments || ''
            })
        } else {
            setReport({
                title: `Laporan Kegiatan - ${activity?.namaKegiatan || ''}`,
                content: '',
                obstacles: '',
                recommendations: '',
                status: 'Draft',
                attachments: ''
            })
        }
    }, [activity])

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSaving(true)

        setTimeout(() => {
            onSave({
                ...report,
                updatedAt: new Date().toISOString()
            })
            setIsSaving(false)
        }, 500)
    }

    const markAsSubmitted = () => {
        const nextReport = { ...report, status: 'Submitted' }
        setReport(nextReport)
        onSave(nextReport)
        toast.success("Laporan berhasil diajukan untuk direview!")
    }

    const approveReport = () => {
        const nextReport = { ...report, status: 'Approved' }
        setReport(nextReport)
        onSave(nextReport)
        toast.success("Laporan telah disetujui (Approved)!")
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3 mb-2">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                        <h4 className="font-semibold text-sm">Laporan Pasca Kegiatan</h4>
                        <p className="text-xs text-muted-foreground">Isi detail pelaksanaan dan evaluasi kegiatan</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        report.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                        report.status === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    }`}>
                        {report.status}
                    </span>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="rep-title" className="text-xs font-semibold">Judul Laporan</Label>
                <Input 
                    id="rep-title"
                    value={report.title}
                    onChange={(e) => setReport({ ...report, title: e.target.value })}
                    placeholder="Judul laporan kegiatan..."
                    required
                    className="h-9 text-sm"
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="rep-content" className="text-xs font-semibold">Ringkasan Hasil & Capaian</Label>
                <ShadedTextarea 
                    id="rep-content"
                    value={report.content}
                    onChange={(e) => setReport({ ...report, content: e.target.value })}
                    placeholder="Tuliskan jalannya acara, jumlah kehadiran nyata, pencapaian target, dll..."
                    rows={4}
                    required
                    className="text-sm resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="rep-obstacles" className="text-xs font-semibold">Hambatan / Kendala</Label>
                    <ShadedTextarea 
                        id="rep-obstacles"
                        value={report.obstacles}
                        onChange={(e) => setReport({ ...report, obstacles: e.target.value })}
                        placeholder="Masalah logistik, kehadiran, waktu, dll..."
                        rows={3}
                        className="text-sm resize-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="rep-recs" className="text-xs font-semibold">Rekomendasi / Solusi</Label>
                    <ShadedTextarea 
                        id="rep-recs"
                        value={report.recommendations}
                        onChange={(e) => setReport({ ...report, recommendations: e.target.value })}
                        placeholder="Rekomendasi untuk perbaikan acara serupa ke depan..."
                        rows={3}
                        className="text-sm resize-none"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="rep-attachments" className="text-xs font-semibold flex items-center gap-1">
                    <LinkIcon className="h-3.5 w-3.5" />
                    Link Lampiran & Dokumentasi
                </Label>
                <Input 
                    id="rep-attachments"
                    value={report.attachments}
                    onChange={(e) => setReport({ ...report, attachments: e.target.value })}
                    placeholder="Link Google Drive, Album foto, presensi rapat..."
                    className="h-9 text-sm"
                />
            </div>

            <div className="flex justify-between items-center pt-2 border-t mt-4">
                <div className="flex gap-2">
                    {report.status === 'Draft' && (
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={markAsSubmitted}
                        >
                            Ajukan Laporan
                        </Button>
                    )}
                    {report.status === 'Submitted' && (
                        <Button 
                            type="button" 
                            variant="default" 
                            size="sm"
                            onClick={approveReport}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Approve Laporan
                        </Button>
                    )}
                </div>

                <Button type="submit" size="sm" className="gap-1" disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Check className="h-4 w-4" />
                            Simpan Draft
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}

'use client'

import { useState, useMemo } from 'react'
import { useEventManagement } from '@/hooks/use-event-management'
import EventDetailDrawer from '@/components/EventManagement/event-detail-drawer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCamelCaseLabel } from '@/lib/utils'
import { Search, FileText, Printer, ChevronRight, Loader2 } from 'lucide-react'
import { PHASES } from '@/hooks/use-event-management'

const units = [
  "Dekan",
  "WakilDekanI",
  "WakilDekanII",
  "UrusanSekretariatDekan",
  "UrusanLayananAkademik",
  "UrusanLaboratorium",
  "UrusanSDMKeuangan",
  "UrusanKemahasiswaan",
  "ProdiS1Manajemen",
  "ProdiS1AdministrasiBisnis",
  "ProdiS1Akuntansi",
  "ProdiS1LeisureManagement",
  "ProdiS1BisnisDigital",
  "ProdiS2Manajemen",
  "ProdiS2ManajemenPJJ",
  "ProdiS2AdministrasiBisnis",
  "ProdiS2Akuntansi",
  "ProdiS3Manajemen",
  "Lainnya"
]

export default function LaporanKegiatanPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterUnit, setFilterUnit] = useState('all')

    const {
        activities,
        isLoading,
        updatePhase,
        updatePriority,
        updateChecklist,
        updateNotes,
        updateReport
    } = useEventManagement({
        searchQuery,
        filterUnit
    })

    // Detail Drawer State
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [drawerTab, setDrawerTab] = useState('report')

    const evaluationActivities = useMemo(() => {
        // Show events in Evaluasi or Selesai phases
        return activities.filter(a => a.phase === PHASES.EVALUATION || a.phase === PHASES.COMPLETED)
    }, [activities])

    const handleManageReport = (activity) => {
        setSelectedActivity(activity)
        setDrawerTab('report')
        setIsDetailOpen(true)
    }

    const handlePrintReport = (activity) => {
        if (!activity.report) return
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
            <html>
            <head>
                <title>Laporan Pertanggungjawaban - ${activity.namaKegiatan}</title>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; font-size: 24px; color: #0f172a; }
                    .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-weight: bold; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 10px; color: #0f172a; }
                    .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
                    .grid-item { font-size: 14px; }
                    .grid-item span { font-weight: bold; color: #475569; display: block; font-size: 11px; text-transform: uppercase; }
                    .content { font-size: 14px; text-align: justify; white-space: pre-wrap; }
                    .footer { margin-top: 50px; text-align: right; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>LAPORAN PERTANGGUNGJAWABAN KEGIATAN</h1>
                    <p>FAKULTAS EKONOMI DAN BISNIS - TELKOM UNIVERSITY</p>
                </div>
                
                <div class="grid">
                    <div class="grid-item"><span>Nama Kegiatan</span>${activity.namaKegiatan}</div>
                    <div class="grid-item"><span>Unit Pelaksana</span>${formatCamelCaseLabel(activity.unit)}</div>
                    <div class="grid-item"><span>Tanggal Pelaksanaan</span>${activity.tanggal}</div>
                    <div class="grid-item"><span>Lokasi / Ruangan</span>${activity.ruangan === 'Lainnya' ? activity.locationDetail : formatCamelCaseLabel(activity.ruangan)}</div>
                </div>

                <div class="section">
                    <div class="section-title">I. Ringkasan Pelaksanaan & Hasil</div>
                    <div class="content">${activity.report.content || '-'}</div>
                </div>

                <div class="section">
                    <div class="section-title">II. Hambatan & Kendala</div>
                    <div class="content">${activity.report.obstacles || '-'}</div>
                </div>

                <div class="section">
                    <div class="section-title">III. Rekomendasi & Solusi</div>
                    <div class="content">${activity.report.recommendations || '-'}</div>
                </div>

                <div class="footer">
                    <p>Status Laporan: <strong>${activity.report.status}</strong></p>
                    <p>Dicetak otomatis melalui MIRA FEB Dashboard pada ${new Date().toLocaleDateString('id-ID')}</p>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

    const getReportStatusBadge = (report) => {
        if (!report) {
            return (
                <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50/50">
                    Belum Dibuat
                </Badge>
            )
        }
        switch (report.status) {
            case 'Approved':
                return (
                    <Badge className="bg-green-600 text-white">
                        Disetujui
                    </Badge>
                )
            case 'Submitted':
                return (
                    <Badge className="bg-blue-600 text-white">
                        Menunggu Review
                    </Badge>
                )
            default:
                return (
                    <Badge variant="secondary">
                        Draft
                    </Badge>
                )
        }
    }

    const activeActivity = selectedActivity 
        ? activities.find(a => a.id === selectedActivity.id) 
        : null

    return (
        <div className="space-y-6">
            
            {/* Filter Card */}
            <Card className="border border-border/80">
                <CardHeader className="py-4">
                    <CardTitle className="text-sm font-semibold">Filter Laporan</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama kegiatan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={filterUnit} onValueChange={setFilterUnit}>
                                <SelectTrigger className="w-[180px] h-9 text-xs">
                                    <SelectValue placeholder="Semua Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Unit</SelectItem>
                                    {units.map((unit) => (
                                        <SelectItem key={unit} value={unit}>
                                            {formatCamelCaseLabel(unit)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reports List Table */}
            <Card className="border">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Laporan Pertanggungjawaban Kegiatan (LPJ)
                    </CardTitle>
                    <CardDescription>
                        Daftar kegiatan pasca-pelaksanaan yang wajib melengkapi laporan pertanggungjawaban kegiatan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Tanggal</TableHead>
                                    <TableHead>Nama Kegiatan</TableHead>
                                    <TableHead>Penyelenggara</TableHead>
                                    <TableHead className="text-center">Peserta</TableHead>
                                    <TableHead>Status LPJ</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-muted-foreground">Memuat data laporan...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : evaluationActivities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                                            Tidak ada kegiatan pasca-pelaksanaan ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    evaluationActivities.map(act => (
                                        <TableRow key={act.id} className="hover:bg-muted/30">
                                            <TableCell className="font-medium text-xs">
                                                {act.tanggal} {act.tanggalBerakhir ? `s.d ${act.tanggalBerakhir}` : ''}
                                            </TableCell>
                                            <TableCell className="font-semibold text-sm text-foreground/90">
                                                {act.namaKegiatan}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatCamelCaseLabel(act.unit)}
                                            </TableCell>
                                            <TableCell className="text-center text-xs font-semibold">
                                                {act.jumlahPeserta}
                                            </TableCell>
                                            <TableCell>
                                                {getReportStatusBadge(act.report)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleManageReport(act)}
                                                        className="h-8 text-xs gap-1"
                                                    >
                                                        Detail & Laporan
                                                        <ChevronRight className="h-3 w-3" />
                                                    </Button>
                                                    {act.report && (
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            onClick={() => handlePrintReport(act)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            title="Cetak LPJ"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Event Detail Sheet Drawer */}
            <EventDetailDrawer 
                activity={activeActivity}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                updatePhase={updatePhase}
                updatePriority={updatePriority}
                updateChecklist={updateChecklist}
                updateNotes={updateNotes}
                updateReport={updateReport}
                defaultTab={drawerTab}
            />

        </div>
    )
}

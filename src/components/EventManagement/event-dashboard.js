'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Calendar, 
    ClipboardList, 
    ClipboardCheck, 
    PlayCircle, 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    FileText, 
    ArrowRight,
    Plus
} from 'lucide-react'
import { formatCamelCaseLabel } from '@/lib/utils'
import { PHASES } from '@/hooks/use-event-management'
import Link from 'next/link'

export default function EventDashboard({ activities = [], onCardClick, onCreateClick }) {
    
    // Stats calculation
    const totalCount = activities.length
    
    const phaseStats = activities.reduce((acc, act) => {
        acc[act.phase] = (acc[act.phase] || 0) + 1
        return acc
    }, {
        [PHASES.PLANNING]: 0,
        [PHASES.PREPARATION]: 0,
        [PHASES.EXECUTION]: 0,
        [PHASES.EVALUATION]: 0,
        [PHASES.COMPLETED]: 0
    })

    const conflictCount = activities.filter(a => a.hasConflict).length

    // Upcoming events (filter future dates and sorted)
    const upcomingEvents = activities
        .filter(a => {
            if (!a.tanggal) return false
            return new Date(a.tanggal) >= new Date(new Date().toISOString().split('T')[0])
        })
        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
        .slice(0, 5)

    // Events that need reports (in Evaluation phase)
    const needsReportEvents = activities
        .filter(a => a.phase === PHASES.EVALUATION && (!a.report || a.report.status !== 'Approved'))
        .slice(0, 5)

    const completedPercentage = totalCount > 0 
        ? Math.round(((phaseStats[PHASES.COMPLETED] + phaseStats[PHASES.EVALUATION]) / totalCount) * 100) 
        : 0

    return (
        <div className="space-y-6">
            
            {/* Stats Summary Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                
                <Card className="border-l-4 border-l-[#329D9C]">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Perencanaan</CardTitle>
                        <ClipboardList className="h-4 w-4 text-[#329D9C]" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-bold">{phaseStats[PHASES.PLANNING]}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Ide & Penyusunan Proposal</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#329D9C]">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Persiapan</CardTitle>
                        <FileText className="h-4 w-4 text-[#329D9C]" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-bold">{phaseStats[PHASES.PREPARATION]}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Logistik & Administrasi</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#329D9C]">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pelaksanaan</CardTitle>
                        <PlayCircle className="h-4 w-4 text-[#329D9C]" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-bold">{phaseStats[PHASES.EXECUTION]}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Sedang Berlangsung</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#329D9C]">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Evaluasi / Laporan</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-[#329D9C]" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-bold">{phaseStats[PHASES.EVALUATION]}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Penyusunan LPJ</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#329D9C]">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Selesai</CardTitle>
                        <CheckCircle className="h-4 w-4 text-[#329D9C]" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-bold">{phaseStats[PHASES.COMPLETED]}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">LPJ Disetujui</p>
                    </CardContent>
                </Card>

            </div>

            {/* Middle Section: Progress & Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3">
                
                {/* Progress Ring Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Capaian Pelaksanaan Acara</CardTitle>
                        <CardDescription>Rasio acara yang telah terlaksana atau selesai dilaporkan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-4xl font-bold text-foreground">{completedPercentage}%</span>
                                <span className="text-xs text-muted-foreground block mt-1">Acara Telah Terlaksana & Selesai ({phaseStats[PHASES.COMPLETED] + phaseStats[PHASES.EVALUATION]} dari {totalCount})</span>
                            </div>
                            <div className="flex flex-col items-end text-xs space-y-1">
                                <span className="flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {conflictCount} Bentrokan Jadwal
                                </span>
                                <span className="text-muted-foreground">Perlu koordinasi ruangan/pejabat</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                                <div 
                                    className="bg-primary h-full transition-all duration-300 ease-out" 
                                    style={{ width: `${completedPercentage}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Persiapan ({phaseStats[PHASES.PREPARATION] + phaseStats[PHASES.PLANNING]})</span>
                                <span>Pelaksanaan ({phaseStats[PHASES.EXECUTION]})</span>
                                <span>Selesai ({phaseStats[PHASES.COMPLETED] + phaseStats[PHASES.EVALUATION]})</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Aksi Cepat</CardTitle>
                        <CardDescription>Kelola acara Anda secara instan</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2.5">
                        <Button onClick={onCreateClick} className="w-full justify-start h-10 gap-2">
                            <Plus className="h-4.5 w-4.5" />
                            Buat Acara Baru
                        </Button>
                        <Link href="/dashboard/manajemen-acara/kanban" className="w-full">
                            <Button variant="outline" className="w-full justify-start h-10 gap-2">
                                <ClipboardList className="h-4.5 w-4.5 text-[#329D9C]" />
                                Kanban Board
                            </Button>
                        </Link>
                        <Link href="/dashboard/manajemen-acara/timeline" className="w-full">
                            <Button variant="outline" className="w-full justify-start h-10 gap-2">
                                <Calendar className="h-4.5 w-4.5 text-[#329D9C]" />
                                Timeline (Gantt)
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

            </div>

            {/* Bottom Section: Lists */}
            <div className="grid gap-6 md:grid-cols-2">
                
                {/* Upcoming Events */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold">Agenda Terdekat</CardTitle>
                            <CardDescription>Kegiatan mendatang yang perlu dipersiapkan</CardDescription>
                        </div>
                        <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="divide-y">
                            {upcomingEvents.map(act => (
                                <div 
                                    key={act.id} 
                                    onClick={() => onCardClick(act)}
                                    className="p-4 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="space-y-1 pr-4 min-w-0">
                                        <h5 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                                            {act.namaKegiatan}
                                        </h5>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span className="truncate">{formatCamelCaseLabel(act.unit)}</span>
                                            <span>•</span>
                                            <span>{act.tanggal}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="shrink-0 text-[10px] uppercase font-bold">
                                        {act.phase}
                                    </Badge>
                                </div>
                            ))}

                            {upcomingEvents.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-xs">
                                    Tidak ada kegiatan mendatang.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Reports */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold">Evaluasi & Tagihan Laporan</CardTitle>
                            <CardDescription>Acara selesai yang belum melengkapi laporan LPJ</CardDescription>
                        </div>
                        <FileText className="h-4.5 w-4.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="divide-y">
                            {needsReportEvents.map(act => (
                                <div 
                                    key={act.id} 
                                    onClick={() => onCardClick(act)}
                                    className="p-4 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="space-y-1 pr-4 min-w-0">
                                        <h5 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                                            {act.namaKegiatan}
                                        </h5>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span className="truncate">{formatCamelCaseLabel(act.unit)}</span>
                                            <span>•</span>
                                            <span>Selesai: {act.tanggalBerakhir || act.tanggal}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Butuh LPJ
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {needsReportEvents.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-xs">
                                    Semua laporan kegiatan sudah lengkap!
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>

        </div>
    )
}

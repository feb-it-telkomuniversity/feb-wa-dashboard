'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Calendar, 
    ClipboardList, 
    ClipboardCheck, 
    PlayCircle, 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    FileText
} from 'lucide-react'
import { formatCamelCaseLabel } from '@/lib/utils'
import { PHASES } from '@/hooks/use-event-management'

export default function EventDashboard({ activities = [], onCardClick }) {
    
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
        <div className="space-y-2.5">
            
            {/* 1. Kotak Ringkasan & Capaian Acara (Unified Single Card) */}
            <Card className="border-border/60 shadow-2xs">
                <CardContent className="p-2.5 sm:px-3 sm:py-2.5 space-y-2">
                    
                    {/* Header: Title, Percentage, Ratio, & Conflict Badge */}
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">Ringkasan & Capaian Acara</span>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                {completedPercentage}% Selesai
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                ({phaseStats[PHASES.COMPLETED] + phaseStats[PHASES.EVALUATION]} dari {totalCount} acara terlaksana/selesai)
                            </span>
                        </div>
                        {conflictCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="h-3 w-3" />
                                {conflictCount} Bentrokan Jadwal
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-primary h-full transition-all duration-300 ease-out" 
                            style={{ width: `${completedPercentage}%` }}
                        />
                    </div>

                    {/* 5 Phase Metrics Grid (Interactive) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 pt-0.5">
                        <div 
                            onClick={() => onCardClick?.({ phase: PHASES.PLANNING })}
                            className="flex items-center justify-between p-1.5 px-2.5 rounded-md bg-muted/40 hover:bg-muted/70 border border-border/50 cursor-pointer transition-colors group"
                            title="Filter Perencanaan"
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                <ClipboardList className="h-3.5 w-3.5 text-[#329D9C] shrink-0" />
                                <span className="text-[11px] font-medium text-muted-foreground truncate">Perencanaan</span>
                            </div>
                            <span className="text-xs font-bold text-foreground pl-1">{phaseStats[PHASES.PLANNING]}</span>
                        </div>

                        <div 
                            onClick={() => onCardClick?.({ phase: PHASES.PREPARATION })}
                            className="flex items-center justify-between p-1.5 px-2.5 rounded-md bg-muted/40 hover:bg-muted/70 border border-border/50 cursor-pointer transition-colors group"
                            title="Filter Persiapan"
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                <FileText className="h-3.5 w-3.5 text-[#329D9C] shrink-0" />
                                <span className="text-[11px] font-medium text-muted-foreground truncate">Persiapan</span>
                            </div>
                            <span className="text-xs font-bold text-foreground pl-1">{phaseStats[PHASES.PREPARATION]}</span>
                        </div>

                        <div 
                            onClick={() => onCardClick?.({ phase: PHASES.EXECUTION })}
                            className="flex items-center justify-between p-1.5 px-2.5 rounded-md bg-muted/40 hover:bg-muted/70 border border-border/50 cursor-pointer transition-colors group"
                            title="Filter Pelaksanaan"
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                <PlayCircle className="h-3.5 w-3.5 text-[#329D9C] shrink-0" />
                                <span className="text-[11px] font-medium text-muted-foreground truncate">Pelaksanaan</span>
                            </div>
                            <span className="text-xs font-bold text-foreground pl-1">{phaseStats[PHASES.EXECUTION]}</span>
                        </div>

                        <div 
                            onClick={() => onCardClick?.({ phase: PHASES.EVALUATION })}
                            className="flex items-center justify-between p-1.5 px-2.5 rounded-md bg-muted/40 hover:bg-muted/70 border border-border/50 cursor-pointer transition-colors group"
                            title="Filter Evaluasi (LPJ)"
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                <ClipboardCheck className="h-3.5 w-3.5 text-[#329D9C] shrink-0" />
                                <span className="text-[11px] font-medium text-muted-foreground truncate">Evaluasi (LPJ)</span>
                            </div>
                            <span className="text-xs font-bold text-foreground pl-1">{phaseStats[PHASES.EVALUATION]}</span>
                        </div>

                        <div 
                            onClick={() => onCardClick?.({ phase: PHASES.COMPLETED })}
                            className="flex items-center justify-between p-1.5 px-2.5 rounded-md bg-muted/40 hover:bg-muted/70 border border-border/50 cursor-pointer transition-colors group col-span-2 sm:col-span-1"
                            title="Filter Selesai"
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                <CheckCircle className="h-3.5 w-3.5 text-[#329D9C] shrink-0" />
                                <span className="text-[11px] font-medium text-muted-foreground truncate">Selesai</span>
                            </div>
                            <span className="text-xs font-bold text-foreground pl-1">{phaseStats[PHASES.COMPLETED]}</span>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* 3. Bottom Section: Lists */}
            <div className="grid gap-2 md:grid-cols-2">
                
                {/* Upcoming Events */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="p-2.5 sm:px-3 sm:py-2 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
                        <div>
                            <CardTitle className="text-xs font-semibold">Agenda Terdekat</CardTitle>
                            <CardDescription className="text-[10px] text-muted-foreground">Kegiatan mendatang yang perlu dipersiapkan</CardDescription>
                        </div>
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {upcomingEvents.map(act => (
                                <div 
                                    key={act.id} 
                                    onClick={() => onCardClick(act)}
                                    className="px-3 py-1.5 sm:py-2 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="space-y-0.5 pr-2.5 min-w-0">
                                        <h5 className="font-medium text-xs text-foreground truncate group-hover:text-primary transition-colors">
                                            {act.namaKegiatan}
                                        </h5>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <span className="truncate max-w-[140px]">{formatCamelCaseLabel(act.unit)}</span>
                                            <span>•</span>
                                            <span>{act.tanggal}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 uppercase font-semibold">
                                        {act.phase}
                                    </Badge>
                                </div>
                            ))}

                            {upcomingEvents.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground text-xs">
                                    Tidak ada kegiatan mendatang.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Reports */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="p-2.5 sm:px-3 sm:py-2 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
                        <div>
                            <CardTitle className="text-xs font-semibold">Evaluasi & Tagihan LPJ</CardTitle>
                            <CardDescription className="text-[10px] text-muted-foreground">Acara selesai yang belum melengkapi LPJ</CardDescription>
                        </div>
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {needsReportEvents.map(act => (
                                <div 
                                    key={act.id} 
                                    onClick={() => onCardClick(act)}
                                    className="px-3 py-1.5 sm:py-2 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="space-y-0.5 pr-2.5 min-w-0">
                                        <h5 className="font-medium text-xs text-foreground truncate group-hover:text-primary transition-colors">
                                            {act.namaKegiatan}
                                        </h5>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <span className="truncate max-w-[140px]">{formatCamelCaseLabel(act.unit)}</span>
                                            <span>•</span>
                                            <span>Selesai: {act.tanggalBerakhir || act.tanggal}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 bg-destructive/10 px-1.5 py-0.5 rounded">
                                            <Clock className="h-3 w-3" />
                                            Butuh LPJ
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {needsReportEvents.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground text-xs">
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

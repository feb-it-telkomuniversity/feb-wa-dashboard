'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCamelCaseLabel } from '@/lib/utils'
import { PRIORITIES } from '@/hooks/use-event-management'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EventTimeline({ activities = [], onCardClick }) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() // 0-11

    const daysInMonth = useMemo(() => {
        return new Date(currentYear, currentMonth + 1, 0).getDate()
    }, [currentYear, currentMonth])

    const daysArray = useMemo(() => {
        const days = []
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i)
            days.push({
                dayNum: i,
                dayName: date.toLocaleDateString('id-ID', { weekday: 'narrow' }),
                isWeekend: date.getDay() === 0 || date.getDay() === 6
            })
        }
        return days
    }, [currentYear, currentMonth, daysInMonth])

    // Filter activities that occur in the selected month & year
    const monthlyActivities = useMemo(() => {
        return activities.filter(activity => {
            if (!activity.tanggal) return false
            const startDate = new Date(activity.tanggal)
            const endDate = activity.tanggalBerakhir ? new Date(activity.tanggalBerakhir) : startDate

            const monthStart = new Date(currentYear, currentMonth, 1)
            const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

            // Overlap check with selected month range
            return startDate <= monthEnd && endDate >= monthStart
        })
    }, [activities, currentYear, currentMonth])

    const monthLabel = currentDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    })

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentYear, currentMonth + direction, 1))
    }

    const getPhaseColor = (phase) => {
        switch (phase) {
            case 'Perencanaan': return 'bg-[#329D9C] hover:brightness-110'
            case 'Persiapan': return 'bg-[#329D9C] hover:brightness-110'
            case 'Pelaksanaan': return 'bg-[#329D9C] hover:brightness-110'
            case 'Evaluasi': return 'bg-[#329D9C] hover:brightness-110'
            case 'Selesai': return 'bg-[#329D9C] hover:brightness-110'
            default: return 'bg-slate-500 hover:bg-slate-600'
        }
    }

    return (
        <Card className="shadow-sm border">
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Timeline Acara (Gantt Chart)
                        </CardTitle>
                        <CardDescription>
                            Visualisasi jadwal dan durasi pelaksanaan kegiatan dalam satu bulan
                        </CardDescription>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)} className="h-9 w-9">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-sm w-36 text-center select-none">{monthLabel}</span>
                        <Button variant="outline" size="icon" onClick={() => navigateMonth(1)} className="h-9 w-9">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 border-t overflow-hidden">
                {monthlyActivities.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground border-b">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm">Tidak ada kegiatan di bulan ini.</p>
                    </div>
                ) : (
                    <div className="flex flex-col min-w-full overflow-x-auto select-none">
                        
                        {/* Table Header Row */}
                        <div className="flex border-b bg-muted/30 shrink-0 font-medium">
                            {/* Frozen Header Left Column */}
                            <div className="w-[260px] md:w-[320px] shrink-0 p-3 text-xs font-semibold text-muted-foreground uppercase border-r sticky left-0 bg-background z-10">
                                Kegiatan / Unit
                            </div>

                            {/* Days Timeline Header Right Column */}
                            <div className="flex-1 flex min-w-[620px]">
                                {daysArray.map(day => (
                                    <div 
                                        key={day.dayNum} 
                                        className={`w-8 shrink-0 text-center py-2 text-[10px] border-r flex flex-col items-center justify-center ${
                                            day.isWeekend ? 'bg-amber-500/5 text-amber-700 dark:text-amber-500 font-semibold' : 'text-muted-foreground'
                                        }`}
                                    >
                                        <span>{day.dayName}</span>
                                        <span className="text-xs font-semibold">{day.dayNum}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Table Body Row */}
                        <div className="divide-y max-h-[50vh] overflow-y-auto">
                            {monthlyActivities.map(activity => {
                                const startDate = new Date(activity.tanggal)
                                const endDate = activity.tanggalBerakhir ? new Date(activity.tanggalBerakhir) : startDate

                                // Day spanning calculations in active month range
                                const startDay = Math.max(1, startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear ? startDate.getDate() : 1)
                                const endDay = Math.min(daysInMonth, endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear ? endDate.getDate() : daysInMonth)

                                const startOffset = startDay - 1
                                const spanWidth = endDay - startDay + 1

                                return (
                                    <div key={activity.id} className="flex hover:bg-muted/10 group">
                                        
                                        {/* Frozen Body Left Column */}
                                        <div 
                                            onClick={() => onCardClick(activity)}
                                            className="w-[260px] md:w-[320px] shrink-0 p-3 border-r sticky left-0 bg-background z-10 group-hover:bg-muted/30 cursor-pointer transition-colors flex flex-col justify-center gap-1.5"
                                        >
                                            <div className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                                                {activity.namaKegiatan}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <span className="truncate">{formatCamelCaseLabel(activity.unit)}</span>
                                                <span>•</span>
                                                <span className="shrink-0">{activity.waktuMulai}</span>
                                            </div>
                                        </div>

                                        {/* Timeline Bar Right Column */}
                                        <div className="flex-1 flex min-w-[620px] relative items-center py-3">
                                            {/* Column day borders behind the bars */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {daysArray.map(day => (
                                                    <div 
                                                        key={day.dayNum} 
                                                        className={`w-8 h-full border-r ${
                                                            day.isWeekend ? 'bg-amber-500/5' : ''
                                                        }`}
                                                    />
                                                ))}
                                            </div>

                                            {/* Span Bar event */}
                                            <div 
                                                onClick={() => onCardClick(activity)}
                                                className={`absolute h-8 rounded-lg flex items-center justify-start px-2.5 text-[10px] text-white font-semibold cursor-pointer shadow-xs border border-white/10 select-none overflow-hidden transition-all hover:brightness-105 hover:shadow-md ${getPhaseColor(activity.phase)}`}
                                                style={{
                                                    left: `${startOffset * 32 + 4}px`,
                                                    width: `${spanWidth * 32 - 8}px`
                                                }}
                                                title={`${activity.namaKegiatan} (${activity.tanggal} s.d ${activity.tanggalBerakhir || activity.tanggal})`}
                                            >
                                                <span className="truncate w-full leading-none">{activity.namaKegiatan}</span>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

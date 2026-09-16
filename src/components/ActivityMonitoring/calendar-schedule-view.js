'use client'

import { useMemo } from "react"
import { MapPin, Users, AlertTriangle } from "lucide-react"
import { isEventPast } from "@/lib/utils"

const CalendarScheduleView = ({
    activities = [],
    currentDate,
    onEdit,
}) => {
    // Kelompokkan kegiatan berdasarkan tanggal secara kronologis
    const scheduleGroups = useMemo(() => {
        // Ambil kegiatan mulai dari awal bulan currentDate sampai akhir tahun
        const startAnchor = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        startAnchor.setHours(0, 0, 0, 0)

        // Filter kegiatan yang berada pada atau setelah awal bulan yang dipilih
        const relevant = activities.filter((act) => {
            const actStart = new Date(act.tanggal)
            actStart.setHours(0, 0, 0, 0)
            const actEnd = act.tanggalBerakhir ? new Date(act.tanggalBerakhir) : actStart
            actEnd.setHours(23, 59, 59, 999)
            return actEnd >= startAnchor
        })

        // Sort kronologis berdasarkan tanggal dan jam mulai
        relevant.sort((a, b) => {
            const diffDate = new Date(a.tanggal) - new Date(b.tanggal)
            if (diffDate !== 0) return diffDate
            return (a.waktuMulai || '').localeCompare(b.waktuMulai || '')
        })

        // Kelompokkan berdasarkan tanggal kegiatan
        const groups = {}
        relevant.forEach((act) => {
            const dateStr = act.tanggal
            if (!groups[dateStr]) {
                groups[dateStr] = {
                    dateKey: dateStr,
                    dateObj: new Date(dateStr),
                    events: []
                }
            }
            groups[dateStr].events.push(act)
        })

        return Object.values(groups).sort((a, b) => a.dateObj - b.dateObj)
    }, [activities, currentDate])

    const todayStr = new Date().toISOString().split('T')[0]

    if (scheduleGroups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center p-8">
                <div className="w-12 h-12 rounded-full bg-[#009da5]/10 text-[#009da5] flex items-center justify-center mb-3">
                    📅
                </div>
                <h3 className="text-sm font-semibold text-foreground">Tidak Ada Jadwal Kegiatan</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Tidak ditemukan agenda kegiatan pada atau setelah {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.
                </p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto divide-y divide-border/60 pr-1">
            {scheduleGroups.map((group) => {
                const isToday = group.dateKey === todayStr
                const dayNumber = group.dateObj.getDate()
                const monthShort = group.dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()
                const dayShort = group.dateObj.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase()

                return (
                    <div key={group.dateKey} className="py-2.5 px-2 hover:bg-muted/20 transition-colors">
                        {/* Indikator Garis Waktu Hari Ini ala Google Calendar */}
                        {isToday && (
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                                <div className="h-[2px] bg-red-500 flex-1 rounded-full opacity-80" />
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
                            {/* Kolom Tanggal Kiri */}
                            <div className="flex items-center gap-2 w-28 shrink-0 select-none">
                                <div
                                    className={`
                                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                        ${isToday
                                            ? "bg-[#009da5] text-white shadow-xs"
                                            : "text-foreground font-semibold"
                                        }
                                    `}
                                >
                                    {dayNumber}
                                </div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                                    {monthShort}, {dayShort}
                                </div>
                            </div>

                            {/* Kolom Daftar Acara Hari Tersebut */}
                            <div className="flex-1 space-y-1.5 w-full">
                                {group.events.map((act) => {
                                    const isConflict = Boolean(act.hasConflict)
                                    const isPast = isEventPast(act)
                                    const timeLabel = act.waktuMulai
                                        ? `${act.waktuMulai}${act.waktuSelesai ? ` – ${act.waktuSelesai}` : ''}`
                                        : "Sepanjang hari"

                                    return (
                                        <div
                                            key={act.id}
                                            onClick={() => onEdit && onEdit(act)}
                                            className={`
                                                flex items-center justify-between gap-3 px-2 py-1.5 rounded-md cursor-pointer
                                                transition-colors duration-150 hover:bg-accent/70 group
                                                ${isConflict ? "bg-red-50/50 dark:bg-red-950/20" : ""}
                                                ${isPast ? "opacity-55 hover:opacity-90" : ""}
                                            `}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                {/* Bullet dot */}
                                                <span
                                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                                        isPast
                                                            ? (isConflict ? "bg-red-400/70" : "bg-[#009da5]/70")
                                                            : (isConflict ? "bg-red-500" : "bg-[#009da5]")
                                                    }`}
                                                />

                                                {/* Waktu Kegiatan */}
                                                <span className={`font-mono text-xs w-24 shrink-0 ${isPast ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                                                    {timeLabel}
                                                </span>

                                                {/* Nama Kegiatan */}
                                                <span className={`text-xs truncate ${
                                                    isConflict 
                                                        ? "text-red-700 dark:text-red-400 font-semibold" 
                                                        : (isPast ? "text-muted-foreground font-normal" : "text-foreground font-medium")
                                                }`}>
                                                    {act.namaKegiatan}
                                                </span>

                                                {/* Lokasi / Ruangan */}
                                                {act.ruangan && (
                                                    <span className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 max-w-[200px] truncate">
                                                        <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                                                        <span className="truncate">{act.ruangan}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Tag Unit / Konflik */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {isConflict && (
                                                    <span className="flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-semibold bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                                        Konflik
                                                    </span>
                                                )}
                                                {act.unit && (
                                                    <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded hidden lg:inline">
                                                        {act.unit}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default CalendarScheduleView

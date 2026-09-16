'use client'

import { useMemo } from "react"
import { MapPin } from "lucide-react"

const CalendarWeekView = ({
    activities = [],
    currentDate,
    onEdit,
    onDateSelect,
}) => {
    // Hitung 7 hari dalam minggu dari currentDate (Minggu - Sabtu)
    const weekDays = useMemo(() => {
        const d = new Date(currentDate)
        const dayOfWeek = d.getDay() // 0 = Minggu
        const sunday = new Date(d)
        sunday.setDate(d.getDate() - dayOfWeek)
        sunday.setHours(0, 0, 0, 0)

        const days = []
        for (let i = 0; i < 7; i++) {
            const current = new Date(sunday)
            current.setDate(sunday.getDate() + i)
            const year = current.getFullYear()
            const month = String(current.getMonth() + 1).padStart(2, '0')
            const day = String(current.getDate()).padStart(2, '0')
            const dateKey = `${year}-${month}-${day}`

            days.push({
                dateObj: current,
                dateKey,
                dayNumber: current.getDate(),
                dayName: current.toLocaleDateString('id-ID', { weekday: 'short' }),
                isToday: current.toDateString() === new Date().toDateString(),
            })
        }
        return days
    }, [currentDate])

    // Filter kegiatan untuk setiap hari dalam minggu ini
    const weekActivitiesMap = useMemo(() => {
        const map = {}
        weekDays.forEach((w) => {
            map[w.dateKey] = []
        })

        activities.forEach((act) => {
            const start = new Date(act.tanggal)
            start.setHours(0, 0, 0, 0)
            const end = act.tanggalBerakhir ? new Date(act.tanggalBerakhir) : new Date(act.tanggal)
            end.setHours(23, 59, 59, 999)

            weekDays.forEach((day) => {
                const checkDate = new Date(day.dateObj)
                checkDate.setHours(12, 0, 0, 0)
                if (checkDate >= start && checkDate <= end) {
                    map[day.dateKey].push(act)
                }
            })
        })

        // Sort events per day by waktuMulai
        Object.keys(map).forEach((k) => {
            map[k].sort((a, b) => (a.waktuMulai || '').localeCompare(b.waktuMulai || ''))
        })

        return map
    }, [activities, weekDays])

    return (
        <div className="h-full flex flex-col min-h-0 border rounded-md overflow-hidden bg-background">
            {/* Header Hari dalam Minggu */}
            <div className="grid grid-cols-7 border-b border-border/70 bg-muted/20 shrink-0 select-none">
                {weekDays.map((day, idx) => (
                    <div
                        key={day.dateKey}
                        className={`p-2 text-center border-r last:border-r-0 border-border/60 ${
                            idx === 0 || idx === 6 ? "bg-muted/30" : ""
                        }`}
                    >
                        <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                            {day.dayName}
                        </div>
                        <div className="mt-0.5 flex justify-center">
                            <span
                                className={`
                                    w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full transition-all
                                    ${day.isToday
                                        ? "bg-[#009da5] text-white shadow-xs"
                                        : "text-foreground"
                                    }
                                `}
                            >
                                {day.dayNumber}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Kolom-kolom Hari (Isi Kegiatan) */}
            <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto divide-x divide-border/60">
                {weekDays.map((day) => {
                    const dayEvents = weekActivitiesMap[day.dateKey] || []

                    return (
                        <div
                            key={day.dateKey}
                            onClick={() => onDateSelect && onDateSelect(day.dateKey, day.dateKey)}
                            className={`p-1.5 space-y-1.5 flex flex-col min-h-[300px] transition-colors hover:bg-muted/10 ${
                                day.isToday ? "bg-[#009da5]/5" : ""
                            }`}
                        >
                            {dayEvents.map((act) => {
                                const isMultiDay = Boolean(
                                    act.tanggalBerakhir &&
                                    new Date(act.tanggalBerakhir).setHours(0, 0, 0, 0) > new Date(act.tanggal).setHours(0, 0, 0, 0)
                                )
                                const isConflict = Boolean(act.hasConflict)

                                return (
                                    <div
                                        key={act.id}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (onEdit) onEdit(act)
                                        }}
                                        className={`
                                            cursor-pointer transition-all duration-150 rounded-xs select-none
                                            ${isMultiDay
                                                ? isConflict
                                                    ? "bg-red-500 hover:bg-red-600 text-white p-1.5 text-[11px] shadow-2xs font-medium"
                                                    : "bg-[#009da5] hover:bg-[#00888f] text-white p-1.5 text-[11px] shadow-2xs font-medium"
                                                : isConflict
                                                    ? "hover:bg-red-50 dark:hover:bg-red-950/30 p-1 text-[11px] text-red-600 dark:text-red-400 font-medium"
                                                    : "hover:bg-accent/80 p-1 text-[11px] text-foreground font-medium"
                                            }
                                        `}
                                        title={`${act.namaKegiatan}${act.waktuMulai ? ` (${act.waktuMulai})` : ''}`}
                                    >
                                        {isMultiDay ? (
                                            <div>
                                                {act.waktuMulai && (
                                                    <span className="opacity-90 font-mono text-[10px] block leading-tight">
                                                        {act.waktuMulai}
                                                    </span>
                                                )}
                                                <div className="truncate">{act.namaKegiatan}</div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-1.5 min-w-0">
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                                                        isConflict ? "bg-red-500" : "bg-[#009da5]"
                                                    }`}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    {act.waktuMulai && (
                                                        <span className="font-mono text-[10px] text-muted-foreground block leading-tight">
                                                            {act.waktuMulai}
                                                        </span>
                                                    )}
                                                    <div className="truncate leading-snug">{act.namaKegiatan}</div>
                                                    {act.ruangan && (
                                                        <div className="text-[10px] opacity-70 truncate mt-0.5 flex items-center gap-0.5">
                                                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                                                            <span>{act.ruangan}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {dayEvents.length === 0 && (
                                <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground/40 italic select-none">
                                    Kosong
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CalendarWeekView

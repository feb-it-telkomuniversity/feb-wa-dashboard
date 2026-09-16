'use client'

import { useMemo } from "react"

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April",
    "Mei", "Juni", "Juli", "Agustus",
    "September", "Oktober", "November", "Desember"
]

const CalendarYearView = ({
    activities = [],
    currentDate,
    onSelectMonth,
    onSelectDay,
}) => {
    const year = currentDate.getFullYear()

    // Pre-index activities per YYYY-MM-DD for fast lookup
    const dateEventsMap = useMemo(() => {
        const map = {}
        activities.forEach((act) => {
            const start = new Date(act.tanggal)
            const end = act.tanggalBerakhir ? new Date(act.tanggalBerakhir) : new Date(act.tanggal)
            const cur = new Date(start)
            cur.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)

            while (cur <= end) {
                const y = cur.getFullYear()
                const m = String(cur.getMonth() + 1).padStart(2, '0')
                const d = String(cur.getDate()).padStart(2, '0')
                const key = `${y}-${m}-${d}`

                if (!map[key]) {
                    map[key] = { count: 0, hasConflict: false }
                }
                map[key].count += 1
                if (act.hasConflict) map[key].hasConflict = true

                cur.setDate(cur.getDate() + 1)
            }
        })
        return map
    }, [activities])

    const todayStr = useMemo(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }, [])

    return (
        <div className="h-full overflow-y-auto p-2 sm:p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {MONTH_NAMES.map((monthName, monthIndex) => {
                    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay()
                    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

                    const daysArray = []
                    for (let i = 0; i < firstDayOfMonth; i++) {
                        daysArray.push(null)
                    }
                    for (let d = 1; d <= daysInMonth; d++) {
                        daysArray.push(d)
                    }

                    return (
                        <div
                            key={monthIndex}
                            className="border border-border/60 rounded-lg p-2.5 bg-card hover:border-[#009da5]/40 transition-colors shadow-2xs flex flex-col"
                        >
                            {/* Judul Bulan */}
                            <button
                                type="button"
                                onClick={() => onSelectMonth && onSelectMonth(monthIndex)}
                                className="text-left text-xs font-bold text-foreground hover:text-[#009da5] transition-colors mb-2 cursor-pointer"
                                title={`Buka tampilan bulan ${monthName}`}
                            >
                                {monthName}
                            </button>

                            {/* Header Hari (M S S R K J S) */}
                            <div className="grid grid-cols-7 text-center text-[10px] text-muted-foreground font-semibold mb-1 select-none">
                                {["M", "S", "S", "R", "K", "J", "S"].map((initial, idx) => (
                                    <span key={idx} className={idx === 0 || idx === 6 ? "text-red-500/70" : ""}>
                                        {initial}
                                    </span>
                                ))}
                            </div>

                            {/* Kotak-kotak Tanggal */}
                            <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] flex-1">
                                {daysArray.map((dayNum, idx) => {
                                    if (dayNum === null) {
                                        return <div key={`empty-${idx}`} className="h-5" />
                                    }

                                    const mStr = String(monthIndex + 1).padStart(2, '0')
                                    const dStr = String(dayNum).padStart(2, '0')
                                    const dateKey = `${year}-${mStr}-${dStr}`
                                    const eventData = dateEventsMap[dateKey]
                                    const isToday = dateKey === todayStr

                                    return (
                                        <button
                                            key={`day-${dayNum}`}
                                            type="button"
                                            onClick={() => onSelectDay && onSelectDay(new Date(year, monthIndex, dayNum))}
                                            className={`
                                                h-5 w-full flex flex-col items-center justify-center rounded-xs transition-colors cursor-pointer relative
                                                hover:bg-accent
                                                ${isToday ? "bg-[#009da5] text-white font-bold" : "text-foreground"}
                                            `}
                                            title={`${dayNum} ${monthName} ${year}${eventData ? ` (${eventData.count} kegiatan)` : ''}`}
                                        >
                                            <span className="leading-none">{dayNum}</span>
                                            {eventData && !isToday && (
                                                <span
                                                    className={`
                                                        absolute -bottom-0.5 w-1 h-1 rounded-full
                                                        ${eventData.hasConflict ? "bg-red-500" : "bg-[#009da5]"}
                                                    `}
                                                />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CalendarYearView

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"


const TabsCalendarView = ({ filteredActivities, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date())

    // ===== Helper =====
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const startDay = startOfMonth.getDay()
    const daysInMonth = endOfMonth.getDate()

    const calendarDays = useMemo(() => {
        const days = []

        const prevMonthDays = startDay
        const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()

        for (let i = prevMonthDays - 1; i >= 0; i--) {
            days.push({
                date: prevMonthLastDate - i,
                isCurrentMonth: false,
                fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDate - i)
            })
        }

        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: i,
                isCurrentMonth: true,
                fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
            })
        }

        // Next month leading days
        while (days.length < 42) {
            const nextDay = days.length - (prevMonthDays + daysInMonth) + 1
            days.push({
                date: nextDay,
                isCurrentMonth: false,
                fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, nextDay)
            })
        }

        return days
    }, [currentDate])

    // Map events per date
    const eventsByDate = useMemo(() => {
        const map = {}
        filteredActivities.forEach((activity) => {
            const key = activity.tanggal
            if (!map[key]) map[key] = []
            map[key].push(activity)
        })
        return map
    }, [filteredActivities])

    const formatDateKey = (date) => {
        return date.toISOString().split("T")[0]
    }

    const monthLabel = currentDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric"
    })

    return (
        <Card className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm">
            <CardHeader>
                <CardTitle>Kalender Interaktif</CardTitle>
                <CardDescription>
                    Tampilan kalender interaktif untuk memantau seluruh kegiatan
                </CardDescription>
            </CardHeader>

            <CardContent>

                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                        className="p-2 rounded-full hover:bg-accent transition"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <h2 className="text-lg font-medium capitalize">
                        {monthLabel}
                    </h2>

                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                        className="p-2 rounded-full hover:bg-accent transition"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 text-xs uppercase text-muted-foreground mb-2">
                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                        <div key={day} className="text-center py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 border border-border/60">

                    {calendarDays.map((day, index) => {
                        const key = formatDateKey(day.fullDate)
                        const dayEvents = eventsByDate[key] || []
                        const hasConflict = dayEvents.some(e => e.hasConflict)

                        const isToday =
                            new Date().toDateString() === day.fullDate.toDateString()

                        return (
                            <div
                                key={index}
                                className={`min-h-[120px] border border-border/60 p-2 flex flex-col
                  ${!day.isCurrentMonth && "bg-muted/30 text-muted-foreground"}
                `}
                            >
                                {/* Date Number */}
                                <div className="flex justify-center mb-2">
                                    <div className={`
                    w-7 h-7 flex items-center justify-center text-xs rounded-full
                    ${isToday ? "bg-blue-600 text-white font-semibold" : ""}
                  `}>
                                        {day.date}
                                    </div>
                                </div>

                                {/* Events */}
                                <div className="space-y-1 overflow-hidden">
                                    {dayEvents.slice(0, 4).map((event) => (
                                        <div
                                            key={event.id}
                                            onClick={() => onEdit && onEdit(event)}
                                            className={`
                                                text-[11px] px-2 py-1 rounded-md cursor-pointer truncate
                                                transition-all duration-200 ease-out
                                                hover:scale-[1.03] hover:shadow-md
                                                border-l-6
                                                ${event.hasConflict
                                                    ? `
                                                        bg-red-100 text-red-600 
                                                        dark:bg-red-900/30 dark:text-red-400 
                                                        border-red-500
                                                        hover:bg-red-200 dark:hover:bg-red-900/40
                                                        font-medium
                                                    `
                                                    : `
                                                        bg-blue-100 text-blue-700 
                                                        dark:bg-blue-900/30 dark:text-blue-300 
                                                        border-transparent
                                                        hover:border-blue-500
                                                        hover:bg-blue-200 dark:hover:bg-blue-900/40
                                                    `}
                                                `}
                                        >
                                            {event.waktuMulai} - {event.namaKegiatan}
                                        </div>
                                    ))}

                                    {dayEvents.length > 4 && (
                                        <div className="text-[10px] text-muted-foreground">
                                            +{dayEvents.length - 4} lainnya
                                        </div>
                                    )}
                                </div>

                            </div>
                        )
                    })}

                </div>
            </CardContent>
        </Card>
    )
}

export default TabsCalendarView
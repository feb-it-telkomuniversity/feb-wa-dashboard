import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import CalendarMobileView from "./calendar-mobile-view";
import CalendarDesktopView from "./calendar-desktop-view";
import CalendarScheduleView from "./calendar-schedule-view";
import CalendarWeekView from "./calendar-week-view";
import CalendarDayView from "./calendar-day-view";
import CalendarYearView from "./calendar-year-view";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarCheck, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import ActivityDetailModal from "./activity-detail-modal";

const MODE_OPTIONS = [
    { value: 'day', label: 'Hari', shortcut: 'D' },
    { value: 'week', label: 'Minggu', shortcut: 'W' },
    { value: 'month', label: 'Bulan', shortcut: 'M' },
    { value: 'year', label: 'Tahun', shortcut: 'Y' },
    { value: 'schedule', label: 'Jadwal', shortcut: 'A' },
]

const TabsCalendarView = ({
    filteredActivities,
    onEdit,
    onSuccess,
    onEventMove,
    onDateSelect,
    exportToGoogleCalendar,
    getStatusBadge
}) => {
    const [calendarMode, setCalendarMode] = useState('month')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectionStart, setSelectionStart] = useState(null)
    const [selectionEnd, setSelectionEnd] = useState(null)
    const contentRef = useRef(null)

    // ===== Responsive height tracking =====
    const [calendarBodyHeight, setCalendarBodyHeight] = useState(0)

    const updateHeight = useCallback(() => {
        if (!contentRef.current) return
        setCalendarBodyHeight(contentRef.current.clientHeight)
    }, [])

    useEffect(() => {
        updateHeight()
        const ro = new ResizeObserver(updateHeight)
        if (contentRef.current) ro.observe(contentRef.current)
        return () => ro.disconnect()
    }, [updateHeight])

    // ===== Helper =====
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDay = startOfMonth.getDay()
    const daysInMonth = endOfMonth.getDate()

    const calendarDays = useMemo(() => {
        const days = []
        const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()

        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: prevMonthLastDate - i,
                isCurrentMonth: false,
                fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDate - i)
            })
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: i,
                isCurrentMonth: true,
                fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
            })
        }
        while (days.length < 42) {
            const nextDay = days.length - (startDay + daysInMonth) + 1
            days.push({
                date: nextDay,
                isCurrentMonth: false,
                fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, nextDay)
            })
        }
        return days
    }, [currentDate])

    // Bagi calendarDays menjadi array of weeks (per 7 hari)
    const weeks = useMemo(() => {
        const result = []
        for (let i = 0; i < calendarDays.length; i += 7) {
            result.push(calendarDays.slice(i, i + 7))
        }
        return result
    }, [calendarDays])

    const toDateKey = (date) => {
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // ===== Proses events untuk spanning =====
    // Untuk setiap event multi-hari, kita hitung posisi dan lebar di setiap baris minggu
    const processedWeekEvents = useMemo(() => {
        // weekEvents[weekIndex] = array of { event, colStart, colEnd, isStart, isEnd, row }
        const weekEvents = weeks.map(() => [])

        filteredActivities.forEach((activity) => {
            const eventStart = new Date(activity.tanggal)
            eventStart.setHours(0, 0, 0, 0)

            const eventEnd = activity.tanggalBerakhir
                ? new Date(activity.tanggalBerakhir)
                : new Date(activity.tanggal)
            eventEnd.setHours(0, 0, 0, 0)

            // Cek setiap minggu, apakah event ini ada di minggu tersebut
            weeks.forEach((week, weekIndex) => {
                const weekStart = new Date(week[0].fullDate)
                weekStart.setHours(0, 0, 0, 0)
                const weekEnd = new Date(week[6].fullDate)
                weekEnd.setHours(0, 0, 0, 0)

                // Event tidak ada di minggu ini
                if (eventEnd < weekStart || eventStart > weekEnd) return

                // Hitung kolom mulai dan akhir dalam minggu ini (0-6)
                const colStart = eventStart >= weekStart
                    ? Math.round((eventStart - weekStart) / (1000 * 60 * 60 * 24))
                    : 0

                const colEnd = eventEnd <= weekEnd
                    ? Math.round((eventEnd - weekStart) / (1000 * 60 * 60 * 24))
                    : 6

                const isStart = eventStart >= weekStart
                const isEnd = eventEnd <= weekEnd

                weekEvents[weekIndex].push({
                    event: activity,
                    colStart,
                    colEnd,
                    isStart,
                    isEnd,
                })
            })
        })

        // Assign row (vertical stacking) agar events tidak overlap
        weekEvents.forEach((events) => {
            // Sort: event yang mulai lebih awal duluan, lalu yang lebih panjang
            events.sort((a, b) => a.colStart - b.colStart || b.colEnd - a.colEnd)

            events.forEach((ev) => {
                let row = 0
                while (true) {
                    const conflict = events.find(
                        (other) =>
                            other !== ev &&
                            other.row === row &&
                            other.colStart <= ev.colEnd &&
                            other.colEnd >= ev.colStart
                    )
                    if (!conflict) break
                    row++
                }
                ev.row = row
            })
        })

        return weekEvents
    }, [filteredActivities, weeks])

    // ===== Navigasi dan Judul Header Dinamis =====
    const handlePrev = useCallback(() => {
        setCurrentDate((prev) => {
            const d = new Date(prev)
            if (calendarMode === 'day') {
                d.setDate(d.getDate() - 1)
            } else if (calendarMode === 'week') {
                d.setDate(d.getDate() - 7)
            } else if (calendarMode === 'month') {
                d.setMonth(d.getMonth() - 1)
            } else if (calendarMode === 'year') {
                d.setFullYear(d.getFullYear() - 1)
            } else if (calendarMode === 'schedule') {
                d.setMonth(d.getMonth() - 1)
            }
            return new Date(d)
        })
    }, [calendarMode])

    const handleNext = useCallback(() => {
        setCurrentDate((prev) => {
            const d = new Date(prev)
            if (calendarMode === 'day') {
                d.setDate(d.getDate() + 1)
            } else if (calendarMode === 'week') {
                d.setDate(d.getDate() + 7)
            } else if (calendarMode === 'month') {
                d.setMonth(d.getMonth() + 1)
            } else if (calendarMode === 'year') {
                d.setFullYear(d.getFullYear() + 1)
            } else if (calendarMode === 'schedule') {
                d.setMonth(d.getMonth() + 1)
            }
            return new Date(d)
        })
    }, [calendarMode])

    const handleToday = useCallback(() => {
        setCurrentDate(new Date())
    }, [])

    // Keyboard shortcuts ala Google Calendar: D, W, M, Y, A, T
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeTag = document.activeElement?.tagName?.toLowerCase()
            if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
                return
            }

            const key = e.key.toLowerCase()
            if (key === 'd') setCalendarMode('day')
            else if (key === 'w') setCalendarMode('week')
            else if (key === 'm') setCalendarMode('month')
            else if (key === 'y') setCalendarMode('year')
            else if (key === 'a') setCalendarMode('schedule')
            else if (key === 't') handleToday()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleToday])

    const headerTitle = useMemo(() => {
        if (calendarMode === 'year') {
            return currentDate.getFullYear().toString()
        }
        if (calendarMode === 'day') {
            return currentDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            })
        }
        if (calendarMode === 'week') {
            const d = new Date(currentDate)
            const dayOfWeek = d.getDay()
            const sunday = new Date(d)
            sunday.setDate(d.getDate() - dayOfWeek)
            const saturday = new Date(sunday)
            saturday.setDate(sunday.getDate() + 6)

            const startDay = sunday.getDate()
            const endDay = saturday.getDate()
            const startMonth = sunday.toLocaleDateString("id-ID", { month: "short" })
            const endMonth = saturday.toLocaleDateString("id-ID", { month: "short" })
            const year = saturday.getFullYear()

            if (startMonth === endMonth) {
                return `${startDay} – ${endDay} ${endMonth} ${year}`
            }
            return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`
        }
        if (calendarMode === 'schedule') {
            return currentDate.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric"
            })
        }
        return currentDate.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric"
        })
    }, [currentDate, calendarMode])

    const monthLabel = headerTitle

    // ===== Dynamic sizing berdasarkan tinggi container =====
    const NUM_WEEKS = weeks.length || 6
    // Weekday header (~24px) + margin/padding = ~28px
    const CALENDAR_HEADER_TOTAL_HEIGHT = 28
    const availableForCells = calendarBodyHeight > CALENDAR_HEADER_TOTAL_HEIGHT
        ? calendarBodyHeight - CALENDAR_HEADER_TOTAL_HEIGHT
        : 0
    const cellHeight = availableForCells > 0 ? Math.floor(availableForCells / NUM_WEEKS) : 90

    // Dari cellHeight, hitung konstanta event dinamis
    const DATE_NUMBER_HEIGHT = 24
    const EVENT_GAP = 2
    const availableForEvents = Math.max(0, cellHeight - DATE_NUMBER_HEIGHT - 4)
    const EVENT_HEIGHT = Math.max(16, Math.min(22, Math.floor((availableForEvents - EVENT_GAP) / 3) - EVENT_GAP))
    const MAX_VISIBLE_ROWS = Math.max(1, Math.floor(availableForEvents / (EVENT_HEIGHT + EVENT_GAP)))

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    )

    const handleDragEnd = (event) => {
        const { active, over } = event;

        // Kalau dilepas di luar kotak kalender, abaikan
        if (!over) return;

        const draggedEvent = active.data.current.originalEvent;
        const targetDateKey = over.id; // Ini YYYY-MM-DD dari kotak tujuan

        // Kalau tanggalnya nggak berubah, abaikan
        const originalDateKey = toDateKey(draggedEvent.tanggal);
        if (targetDateKey === originalDateKey) return;

        // Panggil fungsi ke parent (atau bisa langsung panggil API Axios di sini)
        if (onEventMove) {
            onEventMove(draggedEvent, targetDateKey);
        } else {
            console.log(`Pindah event ${draggedEvent.namaKegiatan} ke tanggal ${targetDateKey}`);
        }
    }

    // Fungsi untuk mengecek apakah suatu tanggal berada di dalam rentang sorotan
    const isDateInSelection = (dateKey) => {
        if (!isSelecting || !selectionStart || !selectionEnd) return false;
        const current = new Date(dateKey).getTime();
        const start = new Date(selectionStart).getTime();
        const end = new Date(selectionEnd).getTime();
        return current >= Math.min(start, end) && current <= Math.max(start, end)
    }

    const handleMouseDown = (dateKey) => {
        setIsSelecting(true);
        setSelectionStart(dateKey);
        setSelectionEnd(dateKey); // Awal klik, start dan end sama
    }

    const handleMouseEnter = (dateKey) => {
        if (isSelecting) {
            setSelectionEnd(dateKey); // Update rentang saat diseret
        }
    }

    const handleMouseUp = () => {
        if (isSelecting && selectionStart && selectionEnd) {
            // Tentukan mana yang lebih awal (karena user bisa seret dari kanan ke kiri)
            const d1 = new Date(selectionStart);
            const d2 = new Date(selectionEnd);
            const startDate = d1 <= d2 ? selectionStart : selectionEnd;
            const endDate = d1 <= d2 ? selectionEnd : selectionStart;

            if (onDateSelect) {
                onDateSelect(startDate, endDate);
            }
        }
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
    }

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsSelecting(false)
        window.addEventListener('mouseup', handleGlobalMouseUp)
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
    }, [])

    const mobileAgendaList = useMemo(() => {
        const currentMonthActivities = filteredActivities.filter(act => {
            const actDate = new Date(act.tanggal);
            return actDate.getMonth() === currentDate.getMonth() &&
                actDate.getFullYear() === currentDate.getFullYear();
        });

        currentMonthActivities.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

        const grouped = {};
        currentMonthActivities.forEach(act => {
            const dateStr = act.tanggal
            if (!grouped[dateStr]) {
                grouped[dateStr] = {
                    dateObj: new Date(act.tanggal),
                    events: []
                };
            }
            grouped[dateStr].events.push(act);
        });

        // Ubah object jadi array biar gampang di-map
        return Object.values(grouped)
    }, [filteredActivities, currentDate])

    return (
        <Card
            className="border-border/60 shadow-sm flex flex-col h-[calc(100vh-210px)] min-h-[520px]"
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3.5 py-2 border-b shrink-0 gap-2 flex-wrap sm:flex-nowrap">
                {/* Sisi Kiri: Hari Ini (pill), Panah Prev/Next, dan Judul Tanggal Dinamis */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                    {/* Tombol Hari Ini berbentuk pill ala Google Calendar */}
                    <button
                        type="button"
                        onClick={handleToday}
                        className="px-3.5 py-1 text-xs font-medium rounded-full border border-border/80 hover:bg-accent transition text-foreground"
                        title="Kembali ke hari ini (T)"
                    >
                        Hari Ini
                    </button>

                    {/* Tombol Panah Navigasi */}
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent transition text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Sebelumnya"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent transition text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Berikutnya"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold capitalize text-foreground ml-1">
                        {headerTitle}
                    </h2>
                </div>

                {/* Sisi Kanan: Dropdown Mode (Day, Week, Month, Year, Schedule), Legend, & Tombol Aksi */}
                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                    {/* Dropdown Mode Tampilan ala Google Calendar */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 text-xs font-medium gap-1 px-2.5">
                                <span>{MODE_OPTIONS.find(o => o.value === calendarMode)?.label || 'Bulan'}</span>
                                <ChevronDown className="size-3.5 opacity-60 ml-0.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            {MODE_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => setCalendarMode(opt.value)}
                                    className="flex items-center justify-between text-xs cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        {calendarMode === opt.value ? (
                                            <Check className="h-3.5 w-3.5 text-[#009da5]" />
                                        ) : (
                                            <span className="w-3.5" />
                                        )}
                                        <span>{opt.label}</span>
                                    </div>
                                    <DropdownMenuShortcut>{opt.shortcut}</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button asChild size="sm" className="h-7 text-xs gap-1.5">
                        <Link href="/dashboard/manajemen-acara">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            Manajemen Acara
                        </Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent ref={contentRef} className="flex-1 min-h-0 overflow-hidden p-2.5 sm:p-3 flex flex-col">
                {/* 1. Mode Month (Bulan) */}
                {calendarMode === 'month' && (
                    <>
                        <div className="md:flex md:flex-col h-full min-h-0 flex-1 hidden">
                            <CalendarDesktopView
                                sensors={sensors}
                                handleDragEnd={handleDragEnd}
                                weeks={weeks}
                                processedWeekEvents={processedWeekEvents}
                                MAX_VISIBLE_ROWS={MAX_VISIBLE_ROWS}
                                DATE_NUMBER_HEIGHT={DATE_NUMBER_HEIGHT}
                                EVENT_HEIGHT={EVENT_HEIGHT}
                                EVENT_GAP={EVENT_GAP}
                                cellHeight={cellHeight}
                                toDateKey={toDateKey}
                                isDateInSelection={isDateInSelection}
                                handleMouseDown={handleMouseDown}
                                handleMouseEnter={handleMouseEnter}
                                handleMouseUp={handleMouseUp}
                                onEdit={(event) => setSelectedActivity(event)}
                            />
                        </div>

                        <div className="block md:hidden space-y-4 h-full overflow-y-auto">
                            <CalendarMobileView
                                mobileAgendaList={mobileAgendaList}
                                onEdit={(event) => setSelectedActivity(event)}
                            />
                        </div>
                    </>
                )}

                {/* 2. Mode Week (Minggu) */}
                {calendarMode === 'week' && (
                    <CalendarWeekView
                        activities={filteredActivities}
                        currentDate={currentDate}
                        onEdit={(event) => setSelectedActivity(event)}
                        onDateSelect={onDateSelect}
                    />
                )}

                {/* 3. Mode Day (Hari) */}
                {calendarMode === 'day' && (
                    <CalendarDayView
                        activities={filteredActivities}
                        currentDate={currentDate}
                        onEdit={(event) => setSelectedActivity(event)}
                        onSuccess={onSuccess}
                        onDateSelect={onDateSelect}
                    />
                )}

                {/* 4. Mode Year (Tahun) */}
                {calendarMode === 'year' && (
                    <CalendarYearView
                        activities={filteredActivities}
                        currentDate={currentDate}
                        onSelectMonth={(monthIdx) => {
                            setCurrentDate(new Date(currentDate.getFullYear(), monthIdx, 1))
                            setCalendarMode('month')
                        }}
                        onSelectDay={(date) => {
                            setCurrentDate(date)
                            setCalendarMode('day')
                        }}
                    />
                )}

                {/* 5. Mode Schedule (Jadwal) */}
                {calendarMode === 'schedule' && (
                    <CalendarScheduleView
                        activities={filteredActivities}
                        currentDate={currentDate}
                        onEdit={(event) => setSelectedActivity(event)}
                    />
                )}
            </CardContent>

            {/* Modal Detail Informasi Lengkap Kegiatan */}
            <ActivityDetailModal
                isOpen={Boolean(selectedActivity)}
                onClose={() => setSelectedActivity(null)}
                activity={selectedActivity}
                onEdit={onEdit}
                onSuccess={onSuccess}
                exportToGoogleCalendar={exportToGoogleCalendar}
                getStatusBadge={getStatusBadge}
            />
        </Card>
    )
}
export default TabsCalendarView
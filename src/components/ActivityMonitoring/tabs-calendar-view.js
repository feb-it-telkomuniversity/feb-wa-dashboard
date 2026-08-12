import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react"
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import CalendarMobileView from "./calendar-mobile-view";
import CalendarDesktopView from "./calendar-desktop-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";

const TabsCalendarView = ({ filteredActivities, onEdit, onEventMove, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectionStart, setSelectionStart] = useState(null)
    const [selectionEnd, setSelectionEnd] = useState(null)

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

    const monthLabel = currentDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    })

    const EVENT_HEIGHT = 22      // px tinggi satu event bar
    const EVENT_GAP = 2          // px gap antar event
    const DATE_NUMBER_HEIGHT = 28 // px ruang untuk nomor tanggal
    const MAX_VISIBLE_ROWS = 3   // berapa baris event yang ditampilkan sebelum "+N lainnya"

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
            const endDate = d1 > d2 ? selectionStart : selectionEnd;

            // Panggil fungsi dari Parent untuk buka modal!
            // (Kita akan buat prop onDateSelect nanti di parent)
            if (onDateSelect) {
                // Jika hanya 1 hari, kirim endDate null. Jika lebih, kirim endDate.
                onDateSelect(startDate, startDate === endDate ? null : endDate);
            }
        }

        // Reset state
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
        <Card className="bg-base-200 dark:bg-slate-950/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
                <div>
                    <CardTitle>Kalender Interaktif</CardTitle>
                    <CardDescription>
                        Tampilan kalender interaktif untuk memantau seluruh kegiatan
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="gap-2">
                    <Link href="/dashboard/manajemen-acara">
                        <CalendarCheck className="h-4 w-4" />
                        Manajemen Acara
                    </Link>
                </Button>
            </CardHeader>

            <CardContent>
                <div className="md:block hidden">
                    <CalendarDesktopView
                        sensors={sensors}
                        handleDragEnd={handleDragEnd}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        monthLabel={monthLabel}
                        weeks={weeks}
                        processedWeekEvents={processedWeekEvents}
                        MAX_VISIBLE_ROWS={MAX_VISIBLE_ROWS}
                        DATE_NUMBER_HEIGHT={DATE_NUMBER_HEIGHT}
                        EVENT_HEIGHT={EVENT_HEIGHT}
                        EVENT_GAP={EVENT_GAP}
                        toDateKey={toDateKey}
                        isDateInSelection={isDateInSelection}
                        handleMouseDown={handleMouseDown}
                        handleMouseEnter={handleMouseEnter}
                        handleMouseUp={handleMouseUp}
                        onEdit={onEdit}
                    />
                </div>

                <div className="block md:hidden space-y-6">
                    <CalendarMobileView mobileAgendaList={mobileAgendaList} />
                </div>
            </CardContent>
        </Card>
    )
}
export default TabsCalendarView
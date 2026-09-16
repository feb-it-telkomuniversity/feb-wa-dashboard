'use client'

import { useMemo } from "react"
import { MapPin, Users, AlertTriangle, Clock, Building2, UserCheck, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCamelCaseLabel } from "@/lib/utils"

const CalendarDayView = ({
    activities = [],
    currentDate,
    onEdit,
    onDateSelect,
}) => {
    const dayStr = useMemo(() => {
        const d = new Date(currentDate)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }, [currentDate])

    // Filter kegiatan yang terjadi pada hari currentDate
    const dayActivities = useMemo(() => {
        const target = new Date(currentDate)
        target.setHours(12, 0, 0, 0)

        const filtered = activities.filter((act) => {
            const start = new Date(act.tanggal)
            start.setHours(0, 0, 0, 0)
            const end = act.tanggalBerakhir ? new Date(act.tanggalBerakhir) : new Date(act.tanggal)
            end.setHours(23, 59, 59, 999)
            return target >= start && target <= end
        })

        filtered.sort((a, b) => (a.waktuMulai || '').localeCompare(b.waktuMulai || ''))
        return filtered
    }, [activities, currentDate])

    const isToday = currentDate.toDateString() === new Date().toDateString()
    const formattedFullDate = currentDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="h-full flex flex-col min-h-0">
            {/* Top Bar Informasi Hari */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/70 bg-muted/20 shrink-0">
                <div className="flex items-center gap-2">
                    <span
                        className={`
                            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                            ${isToday ? "bg-[#009da5] text-white shadow-xs" : "bg-muted text-foreground"}
                        `}
                    >
                        {currentDate.getDate()}
                    </span>
                    <div>
                        <h3 className="text-sm font-bold text-foreground leading-tight">
                            {formattedFullDate}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            {dayActivities.length} agenda kegiatan terjadwal
                        </p>
                    </div>
                </div>

                {onDateSelect && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDateSelect(dayStr, dayStr)}
                        className="h-7 text-xs gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah di Hari Ini
                    </Button>
                )}
            </div>

            {/* List Agenda Kegiatan Hari Ini */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
                {dayActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center p-6 border border-dashed rounded-xl">
                        <Clock className="w-10 h-10 text-muted-foreground/50 mb-2" />
                        <h4 className="text-sm font-semibold text-foreground">Tidak Ada Jadwal Kegiatan</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                            Belum ada agenda yang dijadwalkan pada {formattedFullDate}.
                        </p>
                        {onDateSelect && (
                            <Button
                                size="sm"
                                onClick={() => onDateSelect(dayStr, dayStr)}
                                className="mt-3 h-8 text-xs gap-1.5 bg-[#009da5] hover:bg-[#00888f] text-white"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Buat Agenda Baru
                            </Button>
                        )}
                    </div>
                ) : (
                    dayActivities.map((act) => {
                        const isConflict = Boolean(act.hasConflict)
                        return (
                            <div
                                key={act.id}
                                onClick={() => onEdit && onEdit(act)}
                                className={`
                                    p-3.5 rounded-lg border transition-all duration-150 cursor-pointer hover:shadow-sm
                                    ${isConflict
                                        ? "border-red-300 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20"
                                        : "border-border/60 hover:border-[#009da5]/50 bg-card hover:bg-accent/30"
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                                                isConflict ? "bg-red-500" : "bg-[#009da5]"
                                            }`}
                                        />
                                        <div className="space-y-1 min-w-0">
                                            <h4 className={`text-sm font-bold leading-tight ${isConflict ? "text-red-700 dark:text-red-400" : "text-foreground"}`}>
                                                {act.namaKegiatan}
                                            </h4>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                <div className="flex items-center gap-1 font-mono font-medium">
                                                    <Clock className="h-3 w-3 shrink-0" />
                                                    <span>
                                                        {act.waktuMulai ? `${act.waktuMulai}${act.waktuSelesai ? ` – ${act.waktuSelesai}` : ''}` : "Sepanjang hari"}
                                                    </span>
                                                </div>

                                                {act.ruangan && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 shrink-0 text-primary" />
                                                        <span className="truncate">{act.ruangan}</span>
                                                    </div>
                                                )}

                                                {act.unit && (
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3 shrink-0" />
                                                        <span>{act.unit}</span>
                                                    </div>
                                                )}

                                                {act.jumlahPeserta > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3 shrink-0" />
                                                        <span>{act.jumlahPeserta} Peserta</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Daftar Pejabat */}
                                            {act.pejabat && act.pejabat.length > 0 && (
                                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                    {act.pejabat.map((p, pIdx) => {
                                                        const isPConflict = act.conflictingOfficialsList?.includes(p)
                                                        return (
                                                            <span
                                                                key={pIdx}
                                                                className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                                                    isPConflict
                                                                        ? "bg-red-100 dark:bg-red-900/50 text-red-700 font-semibold"
                                                                        : "bg-muted text-muted-foreground"
                                                                }`}
                                                            >
                                                                <UserCheck className="h-2.5 w-2.5 shrink-0" />
                                                                {formatCamelCaseLabel(p)}
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Indikator Konflik */}
                                    {isConflict && (
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full shrink-0">
                                            <AlertTriangle className="h-3 w-3" />
                                            <span>Konflik Jadwal</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default CalendarDayView

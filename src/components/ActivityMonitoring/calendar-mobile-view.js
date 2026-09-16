
const CalendarMobileView = ({ mobileAgendaList, onEdit }) => {
    return (
        <>
            {mobileAgendaList.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border/60 rounded-xl">
                    Tidak ada jadwal kegiatan di bulan ini.
                </div>
            ) : (
                mobileAgendaList.map((group, idx) => (
                    <div key={idx} className="relative">
                        {/* Header Tanggal (Sticky di mobile) */}
                        <div className="sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-10 py-2 border-b border-border/50 mb-3 flex items-baseline gap-2 pl-2">
                            <span className="text-2xl font-bold text-[#009da5]">
                                {group.dateObj.getDate()}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                                {group.dateObj.toLocaleDateString("id-ID", { weekday: 'long', month: 'long' })}
                            </span>
                        </div>

                        {/* List Acara di hari tersebut */}
                        <div className="space-y-3 pl-2 border-l-2 border-border/50 ml-3">
                            {group.events.map((ev, evIdx) => (
                                <div
                                    key={evIdx}
                                    onClick={() => onEdit && onEdit(ev)}
                                    className={`
                                                relative p-3 rounded-xl border shadow-sm cursor-pointer transition-transform active:scale-95
                                                ${ev.hasConflict
                                            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"
                                            : "bg-white dark:bg-slate-900 border-border/50"
                                        }
                                            `}
                                >
                                    {/* Indikator Garis Warna Kiri */}
                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${ev.hasConflict ? "bg-red-500" : "bg-[#009da5]"}`} />

                                    <div className="pl-3">
                                        <h4 className={`text-sm font-semibold mb-1 ${ev.hasConflict ? "text-red-700 dark:text-red-400" : "text-foreground"}`}>
                                            {ev.namaKegiatan}
                                        </h4>

                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <span>🕒</span>
                                                <span>
                                                    {ev.waktuMulai || "-"} s/d {ev.waktuSelesai || "-"}
                                                </span>
                                            </div>
                                            {ev.ruangan && (
                                                <div className="flex items-center gap-1.5">
                                                    <span>📍</span>
                                                    <span className="truncate">{ev.ruangan}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

        </>
    )
}

export default CalendarMobileView
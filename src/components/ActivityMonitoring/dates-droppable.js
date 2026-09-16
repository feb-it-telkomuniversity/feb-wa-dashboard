import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { isEventPast } from '@/lib/utils'

// Komponen untuk setiap kotak hari di layer background
export const DroppableDayCell = ({
    day,
    dateKey,
    isToday,
    isSelected,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    children
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: dateKey,
    })

    return (
        <div
            ref={setNodeRef}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseUp={onMouseUp}
            className={`group relative border-r border-b border-border/50 p-1 transition-colors select-none cursor-pointer
                hover:bg-muted/30 dark:hover:bg-slate-800/30
                ${!day.isCurrentMonth ? "bg-muted/20 opacity-50 dark:bg-slate-900/30" : "bg-card"}
            `}
        >
            {/* Box highlight saat dipilih (drag/klik) - menggunakan absolute inset-0 agar seluruh 4 sisi border selalu utuh dan tidak terpotong */}
            {isSelected && (
                <div className="absolute inset-0 pointer-events-none border-2 border-[#009da5] bg-[#009da5]/15 z-20" />
            )}
            {/* Box highlight saat drag over */}
            {isOver && (
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#009da5] bg-[#009da5]/20 z-20" />
            )}

            <div className="flex items-center justify-between px-1 mb-1 relative z-10">
                <div className={`
                    w-5 h-5 flex items-center justify-center text-[11px] rounded-full pointer-events-none transition-all
                    ${!day.isCurrentMonth ? "text-muted-foreground" : "text-foreground font-medium"}
                    ${isToday ? "bg-[#009da5] text-white font-bold shadow-xs" : ""}
                `}>
                    {day.date}
                </div>
            </div>
            {children}
        </div>
    )
}

export const DraggableEventBlock = ({ eventData, styleProps, onEdit }) => {
    const { event, isStart, isEnd, colStart } = eventData;
    const isPast = isEventPast(event);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        // ID harus unik! Kalau event nyebrang 2 minggu, id-nya kita bedakan
        id: `${event.id}-${styleProps.weekIndex}`,
        data: { originalEvent: event }
    })

    const mergedStyle = {
        ...styleProps.style,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.6 : (isPast ? 0.52 : 1),
        zIndex: isDragging ? 50 : styleProps.style.zIndex,
        cursor: isDragging ? 'grabbing' : 'pointer'
    }

    const isMultiDay = Boolean(
        event.tanggalBerakhir &&
        new Date(event.tanggalBerakhir).setHours(0, 0, 0, 0) > new Date(event.tanggal).setHours(0, 0, 0, 0)
    );

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={mergedStyle}
            onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(event);
            }}
            className={`absolute pointer-events-auto transition-opacity duration-150 ${isPast ? "hover:!opacity-90" : ""}`}
            title={`${event.namaKegiatan}${event.waktuMulai ? ` (${event.waktuMulai} - ${event.waktuSelesai || ''})` : ''}${isPast ? ' (Sudah Lewat)' : ''}`}
        >
            {isMultiDay ? (
                /* Multi-day banner: Background solid #009da5 / red */
                <div
                    className={`
                        h-full flex items-center px-1.5 text-[11px] font-medium leading-none rounded-xs
                        transition-all duration-150 select-none
                        ${event.hasConflict
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-2xs"
                            : "bg-[#009da5] hover:bg-[#00888f] text-white shadow-2xs"
                        }
                        ${isStart ? "rounded-l-sm" : ""}
                        ${isEnd ? "rounded-r-sm" : ""}
                        ${!isStart ? "pl-1" : ""}
                        ${isPast ? "saturate-[0.7] brightness-95" : ""}
                    `}
                    style={{ borderLeft: !isStart ? "2px dashed rgba(255,255,255,0.4)" : undefined }}
                >
                    {(isStart || colStart === 0) && (
                        <span className="truncate flex items-center gap-1">
                            {event.waktuMulai && (
                                <span className="opacity-90 font-mono text-[10px]">
                                    {event.waktuMulai}
                                </span>
                            )}
                            <span className="truncate">{event.namaKegiatan}</span>
                        </span>
                    )}
                </div>
            ) : (
                /* Single-day event: Google Calendar style (tanpa background, bullet dot #009da5 / merah + waktu + judul) */
                <div
                    className={`
                        h-full flex items-center gap-1.5 px-1.5 text-[11px] leading-none rounded-xs
                        transition-colors duration-150 select-none
                        hover:bg-accent/80 dark:hover:bg-slate-800/80
                        ${isPast
                            ? "text-muted-foreground/80 font-normal"
                            : event.hasConflict 
                                ? "text-red-600 dark:text-red-400 font-semibold" 
                                : "text-foreground font-medium"
                        }
                    `}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isPast
                                ? (event.hasConflict ? "bg-red-400/70" : "bg-[#009da5]/70")
                                : (event.hasConflict ? "bg-red-500" : "bg-[#009da5]")
                        }`}
                    />
                    {event.waktuMulai && (
                        <span className={`font-mono text-[10px] shrink-0 ${isPast ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                            {event.waktuMulai}
                        </span>
                    )}
                    <span className="truncate">
                        {event.namaKegiatan}
                    </span>
                </div>
            )}
        </div>
    );
};
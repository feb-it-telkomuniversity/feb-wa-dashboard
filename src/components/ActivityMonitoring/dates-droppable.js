import { useDroppable } from '@dnd-kit/core'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

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
            className={`group relative border-r border-b border-border/60 p-1 transition-all duration-100 select-none cursor-crosshair
                hover:bg-muted/50 dark:hover:bg-slate-800/50 hover:shadow-[inset_0_0_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[inset_0_0_12px_rgba(255,255,255,0.03)]
                ${!day.isCurrentMonth ? "bg-muted/30" : ""}
                ${isOver ? "bg-blue-100/50 dark:bg-blue-900/30 ring-2 ring-blue-400 ring-inset" : ""}
                ${isSelected ? "bg-blue-100 dark:bg-blue-900/40" : ""}
            `}
        >
            <div className="flex justify-center mb-4">
                <div className={`
                    w-7 h-7 flex items-center justify-center text-xs rounded-full pointer-events-none transition-transform duration-100 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-300
                    ${!day.isCurrentMonth ? "text-muted-foreground" : ""}
                    ${isToday && !isSelected ? "bg-blue-600 text-white font-semibold shadow-md group-hover:bg-blue-700 group-hover:text-white" : ""}
                    ${isSelected && isToday ? "bg-blue-700 text-white font-semibold shadow-md group-hover:text-white" : ""}
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

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        // ID harus unik! Kalau event nyebrang 2 minggu, id-nya kita bedakan
        id: `${event.id}-${styleProps.weekIndex}`,
        data: { originalEvent: event }
    })

    const mergedStyle = {
        ...styleProps.style,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 50 : styleProps.style.zIndex,
        cursor: isDragging ? 'grabbing' : 'pointer'
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={mergedStyle}
            onClick={() => onEdit && onEdit(event)}
            className={`absolute pointer-events-auto`}
        >
            <div
                className={`
                    h-full flex items-center px-2 text-[11px] font-medium
                    transition-all duration-150 hover:brightness-95 hover:shadow-md
                    ${event.hasConflict ? "bg-red-500 text-white" : "bg-blue-500 text-white"}
                    ${isStart ? "rounded-l-md" : ""}
                    ${isEnd ? "rounded-r-md" : ""}
                    ${!isStart ? "pl-1" : ""}
                `}
                style={{ borderLeft: !isStart ? "2px dashed rgba(255,255,255,0.4)" : undefined }}
            >
                {(isStart || colStart === 0) && (
                    <span className="truncate select-none">
                        {event.waktuMulai && `${event.waktuMulai} · `}{event.namaKegiatan}
                    </span>
                )}
            </div>
        </div>
    );
};
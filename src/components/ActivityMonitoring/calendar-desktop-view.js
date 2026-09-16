import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Close as PopoverClose } from "@radix-ui/react-popover"
import { DndContext, pointerWithin } from "@dnd-kit/core";
import { DraggableEventBlock, DroppableDayCell } from "./dates-droppable";
import { XIcon } from "../ui/x-icon";

const CalendarDesktopView = ({
    sensors,
    handleDragEnd,
    weeks,
    processedWeekEvents,
    MAX_VISIBLE_ROWS,
    DATE_NUMBER_HEIGHT,
    EVENT_HEIGHT,
    EVENT_GAP,
    cellHeight,
    toDateKey,
    isDateInSelection,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    onEdit
}) => {
    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={pointerWithin}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >

            {/* Weekday Header */}
            <div className="grid grid-cols-7 text-xs uppercase font-semibold text-muted-foreground mb-1 border-b border-border/60 pb-1 text-center shrink-0">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, dIdx) => (
                    <div
                        key={day}
                        className={`text-center text-[11px] ${dIdx === 0 || dIdx === 6 ? "text-red-500/80 font-bold" : ""}`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid - per row/week */}
            <div className="flex flex-col flex-1 border-l border-t border-border/60">
                {weeks.map((week, weekIndex) => {
                    const weekEvs = processedWeekEvents[weekIndex]
                    const maxRow = weekEvs.length > 0 ? Math.max(...weekEvs.map(e => e.row)) : -1
                    const visibleRows = Math.min(maxRow + 1, MAX_VISIBLE_ROWS)

                    // Tinggi row: gunakan cellHeight dinamis jika tersedia, fallback ke kalkulasi
                    const calculatedHeight = DATE_NUMBER_HEIGHT + visibleRows * (EVENT_HEIGHT + EVENT_GAP) + 12
                    const rowHeight = cellHeight > 0 ? cellHeight : Math.max(calculatedHeight, 100)

                    return (
                        <div
                            key={weekIndex}
                            className="relative grid grid-cols-7 flex-1"
                            style={{ height: rowHeight, minHeight: rowHeight }}
                        >
                            {/* Sel-sel tanggal (background + nomor) */}
                            {week.map((day, dayIndex) => {
                                const isToday = new Date().toDateString() === day.fullDate.toDateString()
                                const dateKey = toDateKey(day.fullDate)
                                const isSelected = isDateInSelection(dateKey)

                                return (
                                    <DroppableDayCell
                                        key={dayIndex}
                                        day={day}
                                        dateKey={dateKey}
                                        isToday={isToday}
                                        isSelected={isSelected}
                                        onMouseDown={() => handleMouseDown(dateKey)}
                                        onMouseEnter={() => handleMouseEnter(dateKey)}
                                        onMouseUp={handleMouseUp}
                                    />
                                );
                            })}

                            {/* ===== LAYER EVENT (absolute, di atas grid) ===== */}
                            <div
                                className="absolute inset-0 pointer-events-none mt-2"
                                style={{ top: DATE_NUMBER_HEIGHT }}
                            >
                                {weekEvs
                                    .filter(ev => ev.row < MAX_VISIBLE_ROWS)
                                    .map((ev, evIdx) => {
                                        const { event, colStart, colEnd, isStart, isEnd, row } = ev
                                        const spanCols = colEnd - colStart + 1

                                        // Width: berapa kolom yang di-span, dikurangi sedikit padding
                                        const CELL_WIDTH_PERCENT = 100 / 7
                                        const leftPercent = colStart * CELL_WIDTH_PERCENT
                                        // Kurangi 2px kanan agar ada gap visual antar kolom
                                        const widthPercent = spanCols * CELL_WIDTH_PERCENT

                                        const topPx = row * (EVENT_HEIGHT + EVENT_GAP) + EVENT_GAP

                                        const styleProps = {
                                            weekIndex, // Lempar buat id unik
                                            style: {
                                                left: `calc(${leftPercent}% + ${ev.isStart ? 4 : 0}px)`,
                                                width: `calc(${widthPercent}% - ${ev.isStart ? 4 : 0}px - ${ev.isEnd ? 4 : 0}px)`,
                                                top: topPx,
                                                height: EVENT_HEIGHT,
                                                zIndex: 10,
                                            }
                                        };
                                        return (
                                            <DraggableEventBlock
                                                key={evIdx}
                                                eventData={{ event, isStart, isEnd, colStart }}
                                                styleProps={styleProps}
                                                onEdit={onEdit}
                                            />
                                        );
                                    })}

                                {/* "+N lainnya" per kolom hari */}
                                {week.map((day, dayIndex) => {
                                    const dateKey = toDateKey(day.fullDate)
                                    // Hitung berapa event yang hidden di hari ini
                                    const hiddenEvents = weekEvs.filter(ev =>
                                        ev.colStart <= dayIndex &&
                                        ev.colEnd >= dayIndex &&
                                        ev.row >= MAX_VISIBLE_ROWS
                                    )
                                    if (hiddenEvents.length === 0) return null

                                    const CELL_WIDTH_PERCENT = 100 / 7
                                    const topPx = MAX_VISIBLE_ROWS * (EVENT_HEIGHT + EVENT_GAP) + EVENT_GAP

                                    return (
                                        <Popover key={dateKey}>
                                            <PopoverTrigger asChild>
                                                <div
                                                    className="absolute text-[10px] font-medium text-muted-foreground hover:text-foreground pointer-events-auto cursor-pointer select-none px-1 py-0.5 rounded hover:bg-muted/50 transition-colors"
                                                    style={{
                                                        left: `calc(${dayIndex * CELL_WIDTH_PERCENT}% + 4px)`,
                                                        width: `calc(${CELL_WIDTH_PERCENT}% - 8px)`,
                                                        top: topPx,
                                                        zIndex: 20,
                                                    }}
                                                >
                                                    +{hiddenEvents.length} lainnya
                                                </div>
                                            </PopoverTrigger>

                                            <PopoverContent
                                                className="w-64 p-2 z-[100] bg-white dark:bg-slate-950 shadow-xl border-border/50 relative"
                                                align="center"
                                                side="left"
                                            >
                                                <PopoverClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none cursor-pointer">
                                                    <XIcon className="size-4" />
                                                    <span className="sr-only">Close</span>
                                                </PopoverClose>
                                                <div className="mb-2 pr-6 px-1 pb-2 border-b border-border/50 text-xs font-semibold text-foreground flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-[#009da5]/15 text-[#009da5] font-bold flex items-center justify-center">
                                                        {day.date}
                                                    </div>
                                                    {day.fullDate.toLocaleDateString("id-ID", { weekday: 'long', month: 'long', year: 'numeric' })}
                                                </div>

                                                {/* List Acara (Scrollable kalau banyak) */}
                                                <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-1">
                                                    {weekEvs.filter(ev => ev.colStart <= dayIndex && ev.colEnd >= dayIndex).map((ev, idx) => {
                                                        const isMultiDay = Boolean(
                                                            ev.event.tanggalBerakhir &&
                                                            new Date(ev.event.tanggalBerakhir).setHours(0, 0, 0, 0) > new Date(ev.event.tanggal).setHours(0, 0, 0, 0)
                                                        );

                                                        return (
                                                            <div
                                                                key={idx}
                                                                onClick={() => {
                                                                    if (onEdit) onEdit(ev.event);
                                                                }}
                                                                className={`
                                                                    text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-all
                                                                    ${isMultiDay
                                                                        ? ev.event.hasConflict
                                                                            ? "bg-red-500 hover:bg-red-600 text-white font-medium"
                                                                            : "bg-[#009da5] hover:bg-[#00888f] text-white font-medium"
                                                                        : "border border-border/60 hover:bg-accent text-foreground"
                                                                    }
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    {!isMultiDay && (
                                                                        <span
                                                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                                                ev.event.hasConflict ? "bg-red-500" : "bg-[#009da5]"
                                                                            }`}
                                                                        />
                                                                    )}
                                                                    {ev.event.waktuMulai && (
                                                                        <span className="font-mono text-[10px] opacity-75 shrink-0">
                                                                            {ev.event.waktuMulai}
                                                                        </span>
                                                                    )}
                                                                    <span className="font-medium truncate">{ev.event.namaKegiatan}</span>
                                                                </div>
                                                                {ev.event.ruangan && (
                                                                    <div className="text-[10px] opacity-75 truncate mt-0.5 pl-3">
                                                                        📍 {ev.event.ruangan}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                    )
                                })}
                            </div>

                        </div>
                    )
                })}
            </div>
        </DndContext>
    )
}

export default CalendarDesktopView
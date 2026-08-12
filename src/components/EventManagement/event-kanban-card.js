'use client'

import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, MapPin, Building2, CheckCircle2, ChevronRight } from 'lucide-react'
import { formatCamelCaseLabel } from '@/lib/utils'
import { PRIORITIES } from '@/hooks/use-event-management'

export default function EventKanbanCard({ activity, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `card-${activity.id}`,
        data: { activity }
    })

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.4 : undefined,
        cursor: 'grab',
        zIndex: isDragging ? 50 : undefined
    }

    const getPriorityColor = (p) => {
        switch (p) {
            case PRIORITIES.HIGH:
                return 'bg-red-500 hover:bg-red-600 text-white'
            case PRIORITIES.LOW:
                return 'bg-slate-500 hover:bg-slate-600 text-white'
            default:
                return 'bg-blue-500 hover:bg-blue-600 text-white'
        }
    }

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes}
            onClick={() => onClick(activity)}
            className="select-none active:cursor-grabbing group touch-none"
        >
            <Card className={`border hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden bg-card ${
                activity.hasConflict ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-gray-500'
            }`}>
                <CardHeader className="p-3.5 pb-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <Badge className={`text-[10px] px-1.5 py-0 h-5 font-semibold ${getPriorityColor(activity.priority)}`}>
                            {activity.priority}
                        </Badge>
                        
                        {activity.hasConflict && (
                            <Badge variant="destructive" className="h-5 px-1.5 py-0 gap-0.5 text-[10px]">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                Konflik
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="text-sm font-semibold text-foreground/90 group-hover:text-primary transition-colors line-clamp-2 mt-1.5">
                        {activity.namaKegiatan}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-3.5 pt-0 space-y-2.5">
                    {/* Event metadata details */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>{activity.tanggal} | {activity.waktuMulai}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{activity.ruangan === 'Lainnya' ? activity.locationDetail : formatCamelCaseLabel(activity.ruangan)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{formatCamelCaseLabel(activity.unit)}</span>
                        </div>
                    </div>

                    {/* Checklist progress bar */}
                    {activity.checklist && activity.checklist.length > 0 && (
                        <div className="space-y-1 pt-1.5 border-t border-dashed">
                            <div className="flex items-center justify-between text-[10px] font-medium">
                                <span className="text-muted-foreground">Persiapan</span>
                                <span className="text-foreground">{activity.checklistProgress}%</span>
                            </div>
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-primary h-full transition-all duration-300"
                                    style={{ width: `${activity.checklistProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-1">
                        <span className="text-[10px] text-primary flex items-center font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            Detail Acara <ChevronRight className="h-3 w-3" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

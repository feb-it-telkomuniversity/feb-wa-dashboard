'use client'

import { useMemo } from 'react'
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import EventKanbanCard from './event-kanban-card'
import { Badge } from '@/components/ui/badge'
import { PHASES } from '@/hooks/use-event-management'
import { ClipboardList, ClipboardCheck, PlayCircle, ClipboardEdit, CheckCircle } from 'lucide-react'

function KanbanColumn({ id, title, count, icon: Icon, colorClass, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id
    })

    return (
        <div 
            ref={setNodeRef} 
            className={`flex flex-col w-full min-w-[280px] md:min-w-[310px] bg-muted/40 p-3.5 rounded-xl border transition-colors ${
                isOver ? 'border-primary bg-primary/5' : 'border-border/60'
            }`}
        >
            <div className="flex items-center justify-between mb-3.5 shrink-0 px-1">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${colorClass} text-white`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm text-foreground/95">{title}</span>
                </div>
                <Badge variant="secondary" className="rounded-full text-xs h-5 px-2 flex items-center justify-center font-bold">
                    {count}
                </Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3.5 pb-20 pr-1 min-h-[450px] max-h-[60vh] scrollbar-thin">
                {children}
                {count === 0 && (
                    <div className="border border-dashed border-border/70 rounded-xl py-12 text-center text-xs text-muted-foreground bg-background/20">
                        Kosong
                    </div>
                )}
            </div>
        </div>
    )
}

export default function EventKanbanBoard({ activities = [], updatePhase, onCardClick }) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const columns = [
        { id: PHASES.PLANNING, title: 'Perencanaan', icon: ClipboardList, colorClass: 'bg-[#329D9C]' },
        { id: PHASES.PREPARATION, title: 'Persiapan', icon: ClipboardEdit, colorClass: 'bg-[#329D9C]' },
        { id: PHASES.EXECUTION, title: 'Pelaksanaan', icon: PlayCircle, colorClass: 'bg-[#329D9C]' },
        { id: PHASES.EVALUATION, title: 'Evaluasi / Laporan', icon: ClipboardCheck, colorClass: 'bg-[#329D9C]' },
        { id: PHASES.COMPLETED, title: 'Selesai', icon: CheckCircle, colorClass: 'bg-[#329D9C]' }
    ]

    const groupedActivities = useMemo(() => {
        const groups = {
            [PHASES.PLANNING]: [],
            [PHASES.PREPARATION]: [],
            [PHASES.EXECUTION]: [],
            [PHASES.EVALUATION]: [],
            [PHASES.COMPLETED]: []
        }
        activities.forEach(activity => {
            if (groups[activity.phase] !== undefined) {
                groups[activity.phase].push(activity)
            } else {
                groups[PHASES.PLANNING].push(activity) // Fallback
            }
        })
        return groups
    }, [activities])

    const handleDragEnd = (event) => {
        const { active, over } = event

        if (!over) return

        const activeCardId = active.id.toString()
        const targetColumnId = over.id.toString()

        const activityId = activeCardId.replace('card-', '')
        const activity = activities.find(a => a.id.toString() === activityId)

        if (activity && activity.phase !== targetColumnId) {
            updatePhase(activity.id, targetColumnId)
        }
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6 w-full snap-x">
                {columns.map(col => (
                    <div key={col.id} className="flex-1 min-w-[280px] md:min-w-[310px] snap-center">
                        <KanbanColumn
                            id={col.id}
                            title={col.title}
                            icon={col.icon}
                            colorClass={col.colorClass}
                            count={groupedActivities[col.id]?.length || 0}
                        >
                            {groupedActivities[col.id]?.map(act => (
                                <EventKanbanCard
                                    key={act.id}
                                    activity={act}
                                    onClick={onCardClick}
                                />
                            ))}
                        </KanbanColumn>
                    </div>
                ))}
            </div>
        </DndContext>
    )
}

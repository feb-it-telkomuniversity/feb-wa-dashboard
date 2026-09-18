'use client'

import { useState } from 'react'
import { useEventManagement } from '@/hooks/use-event-management'
import EventTimeline from '@/components/EventManagement/event-timeline'
import EventDetailDrawer from '@/components/EventManagement/event-detail-drawer'
import EventManagementToolbar from '@/components/EventManagement/event-management-toolbar'
import { Loader2 } from 'lucide-react'

const units = [
  "Dekan",
  "WakilDekanI",
  "WakilDekanII",
  "UrusanSekretariatDekan",
  "UrusanLayananAkademik",
  "UrusanLaboratorium",
  "UrusanSDMKeuangan",
  "UrusanKemahasiswaan",
  "ProdiS1Manajemen",
  "ProdiS1AdministrasiBisnis",
  "ProdiS1Akuntansi",
  "ProdiS1LeisureManagement",
  "ProdiS1BisnisDigital",
  "ProdiS2Manajemen",
  "ProdiS2ManajemenPJJ",
  "ProdiS2AdministrasiBisnis",
  "ProdiS2Akuntansi",
  "ProdiS3Manajemen",
  "Lainnya"
]

export default function ManajemenAcaraTimelinePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterUnit, setFilterUnit] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    const {
        activities,
        isLoading,
        updatePhase,
        updatePriority,
        updateChecklist,
        updateNotes,
        updateReport
    } = useEventManagement({
        searchQuery,
        filterUnit,
        filterStatus
    })

    // Detail Drawer State
    const [selectedActivity, setSelectedActivity] = useState(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const handleCardClick = (activity) => {
        setSelectedActivity(activity)
        setIsDetailOpen(true)
    }

    const activeActivity = selectedActivity 
        ? activities.find(a => a.id === selectedActivity.id) 
        : null

    const totalCount = activities.length
    const conflictCount = activities.filter(a => a.hasConflict).length

    return (
        <div className="space-y-3">
            
            {/* Unified Header & Toolbar */}
            <EventManagementToolbar
                title="Timeline Acara"
                totalCount={totalCount}
                conflictCount={conflictCount}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterUnit={filterUnit}
                setFilterUnit={setFilterUnit}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                units={units}
            />

            {/* Timeline Gantt view */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Memuat data linimasa...</span>
                </div>
            ) : (
                <EventTimeline 
                    activities={activities} 
                    onCardClick={handleCardClick}
                />
            )}

            {/* Event Detail Sheet Drawer */}
            <EventDetailDrawer 
                activity={activeActivity}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                updatePhase={updatePhase}
                updatePriority={updatePriority}
                updateChecklist={updateChecklist}
                updateNotes={updateNotes}
                updateReport={updateReport}
            />

        </div>
    )
}

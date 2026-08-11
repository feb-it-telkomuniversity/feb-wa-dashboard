'use client'

import { useState } from 'react'
import { useEventManagement } from '@/hooks/use-event-management'
import EventKanbanBoard from '@/components/EventManagement/event-kanban-board'
import EventDetailDrawer from '@/components/EventManagement/event-detail-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCamelCaseLabel } from '@/lib/utils'
import { Search, Loader2 } from 'lucide-react'

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

export default function ManajemenAcaraKanbanPage() {
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

    return (
        <div className="space-y-6">
            
            {/* Filter Card */}
            <Card className="border border-border/80">
                <CardHeader className="py-4">
                    <CardTitle className="text-sm font-semibold">Filter Kanban</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama kegiatan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={filterUnit} onValueChange={setFilterUnit}>
                                <SelectTrigger className="w-[180px] h-9 text-xs">
                                    <SelectValue placeholder="Semua Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Unit</SelectItem>
                                    {units.map((unit) => (
                                        <SelectItem key={unit} value={unit}>
                                            {formatCamelCaseLabel(unit)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[160px] h-9 text-xs">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="conflict">Ada Konflik</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Memuat data papan Kanban...</span>
                </div>
            ) : (
                <EventKanbanBoard 
                    activities={activities} 
                    updatePhase={updatePhase}
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

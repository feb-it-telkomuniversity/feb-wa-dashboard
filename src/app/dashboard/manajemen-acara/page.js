'use client'

import { useState } from 'react'
import { useEventManagement } from '@/hooks/use-event-management'
import EventDashboard from '@/components/EventManagement/event-dashboard'
import EventDetailDrawer from '@/components/EventManagement/event-detail-drawer'
import AddActivity from '@/components/ActivityMonitoring/add-activity'
import EventManagementToolbar from '@/components/EventManagement/event-management-toolbar'
import { Loader2 } from 'lucide-react'

const units = [
  "Dekan",
  "Wakil Dekan I",
  "Wakil Dekan II",
  "Urusan Sekretariat Dekan",
  "Urusan Layanan Akademik",
  "Urusan Laboratorium",
  "Urusan SDM Keuangan",
  "Urusan Kemahasiswaan",
  "Prodi S1 Manajemen",
  "Prodi S1 Administrasi Bisnis",
  "Prodi S1 Akuntansi",
  "Prodi S1 Leisure Management",
  "Prodi S1 Bisnis Digital",
  "Prodi S2 Manajemen",
  "Prodi S2 Manajemen PJJ",
  "Prodi S2 Administrasi Bisnis",
  "Prodi S2 Akuntansi",
  "Prodi S3 Manajemen",
  "Lainnya"
]

const rooms = [
  "Ruang Rapat Manterawu Lt2",
  "Ruang Rapat Miossu Lt1",
  "Ruang Rapat Miossu Lt2",
  "Ruang Rapat Maratua Lt1",
  "Aula FEB",
  "Aula Manterawu",
  "Lainnya",
]

const officials = [
  "Rektor",
  "Wakil Rektor 1",
  "Wakil Rektor 2",
  "Wakil Rektor 3",
  "Wakil Rektor 4",
  "Dekan",
  "Wakil Dekan I",
  "Dekanat",
  "Wakil Dekan II",
  "Ponggawa",
  "Kaur Sekretariat Dekan",
  "Kaur Akademik",
  "Kaur Laboratorium",
  "Kaur SDM Keuangan",
  "KaurKemahasiswaan",
  "Ketua KK AEFS",
  "Ketua KK TBM",
  "Ketua KK     DBE",
  "Kaprodi S1 Manajemen",
  "Kaprodi S1 Administrasi Bisnis",
  "Kaprodi S1 Akuntansi",
  "Kaprodi S1 Leisure Management",
  "Kaprodi S1 Bisnis Digital",
  "Kaprodi S2 Manajemen",
  "Kaprodi S2 Manajemen PJJ",
  "Kaprodi S2 Administrasi Bisnis",
  "Kaprodi S2 Akuntansi",
  "Kaprodi S3 Manajemen",
  "Sekprodi S1 Manajemen",
  "Sekprodi S1 ICTBusiness",
  "Sekprodi S1 Akuntansi",
  "Sekprodi S2 Manajemen",
  "Sekprodi S2 Manajemen PJJ",
  "Sekprodi S2 Administrasi Bisnis",
]

export default function ManajemenAcaraDashboardPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterUnit, setFilterUnit] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    const {
        activities,
        isLoading,
        fetchActivities,
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

    // Add Activity Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isCreateLoading, setIsCreateLoading] = useState(false)
    const [formData, setFormData] = useState({
        namaKegiatan: "",
        tanggal: "",
        tanggalBerakhir: "",
        waktuMulai: "",
        waktuSelesai: "",
        unit: "",
        otherUnit: "",
        ruangan: "",
        locationDetail: "",
        pejabat: [],
        jumlahPeserta: "",
        keterangan: "",
    })

    const handleCardClick = (activity) => {
        setSelectedActivity(activity)
        setIsDetailOpen(true)
    }

    const handleCreateClick = () => {
        setFormData({
            namaKegiatan: "",
            tanggal: new Date().toISOString().split('T')[0],
            tanggalBerakhir: "",
            waktuMulai: "08:00",
            waktuSelesai: "10:00",
            unit: "",
            otherUnit: "",
            ruangan: "",
            locationDetail: "",
            pejabat: [],
            jumlahPeserta: "",
            keterangan: "",
        })
        setIsCreateOpen(true)
    }

    const totalCount = activities.length
    const conflictCount = activities.filter(a => a.hasConflict).length

    // Refresh selected activity if activities update (e.g. updating notes, checklist, etc)
    const activeActivity = selectedActivity 
        ? activities.find(a => a.id === selectedActivity.id) 
        : null

    return (
        <div className="space-y-3">
            
            {/* ── Unified Header & Toolbar ── */}
            <EventManagementToolbar
                title="Manajemen Acara"
                totalCount={totalCount}
                conflictCount={conflictCount}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterUnit={filterUnit}
                setFilterUnit={setFilterUnit}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                units={units}
                onCreateClick={handleCreateClick}
            />

            {/* Dashboard Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Memuat data manajemen acara...</span>
                </div>
            ) : (
                <EventDashboard 
                    activities={activities} 
                    onCardClick={handleCardClick}
                    onCreateClick={handleCreateClick}
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

            {/* Add Activity Modal Form */}
            <AddActivity
                isDialogOpen={isCreateOpen}
                setIsDialogOpen={setIsCreateOpen}
                isLoading={isCreateLoading}
                setIsLoading={setIsCreateLoading}
                formData={formData}
                setFormData={setFormData}
                units={units}
                rooms={rooms}
                officials={officials}
                onSuccess={() => {
                    fetchActivities()
                    setIsCreateOpen(false)
                }}
            />

        </div>
    )
}

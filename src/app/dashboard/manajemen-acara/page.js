'use client'

import { useState } from 'react'
import { useEventManagement } from '@/hooks/use-event-management'
import EventDashboard from '@/components/EventManagement/event-dashboard'
import EventDetailDrawer from '@/components/EventManagement/event-detail-drawer'
import AddActivity from '@/components/ActivityMonitoring/add-activity'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCamelCaseLabel } from '@/lib/utils'
import { Search } from 'lucide-react'
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

const rooms = [
  "RuangRapatManterawuLt2",
  "RuangRapatMiossuLt1",
  "RuangRapatMiossuLt2",
  "RuangRapatMaratuaLt1",
  "AulaFEB",
  "AulaManterawu",
  "Lainnya",
]

const officials = [
  "Rektor",
  "WakilRektor1",
  "WakilRektor2",
  "WakilRektor3",
  "WakilRektor4",
  "Dekan",
  "WakilDekanI",
  "Dekanat",
  "WakilDekanII",
  "Ponggawa",
  "KaurSekretariatDekan",
  "KaurAkademik",
  "KaurLaboratorium",
  "KaurSDMKeuangan",
  "KaurKemahasiswaan",
  "KetuaKKAEFS",
  "KetuaKKTBM",
  "KetuaKKDBE",
  "KaprodiS1Manajemen",
  "KaprodiS1AdministrasiBisnis",
  "KaprodiS1Akuntansi",
  "KaprodiS1LeisureManagement",
  "KaprodiS1BisnisDigital",
  "KaprodiS2Manajemen",
  "KaprodiS2ManajemenPJJ",
  "KaprodiS2AdministrasiBisnis",
  "KaprodiS2Akuntansi",
  "KaprodiS3Manajemen",
  "SekprodiS1Manajemen",
  "SekprodiS1ICTBusiness",
  "SekprodiS1Akuntansi",
  "SekprodiS2Manajemen",
  "SekprodiS2ManajemenPJJ",
  "SekprodiS2AdministrasiBisnis",
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

    // Refresh selected activity if activities update (e.g. updating notes, checklist, etc)
    const activeActivity = selectedActivity 
        ? activities.find(a => a.id === selectedActivity.id) 
        : null

    return (
        <div className="space-y-6">
            
            {/* Filter Card */}
            <Card className="border border-border/80">
                <CardHeader className="py-4">
                    <CardTitle className="text-sm font-semibold">Filter Pencarian</CardTitle>
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

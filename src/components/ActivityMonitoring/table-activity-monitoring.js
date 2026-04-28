'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { CalendarDays, LayoutGrid, Search, Columns } from "lucide-react";
import { Input } from "../ui/input";

import { formatCamelCaseLabel } from "@/lib/utils";
import TabsTableView from "./tabs-table-view";
import TabsBoardView from "./tabs-board-view";
import TabsCalendarView from "./tabs-calendar-view";
import api from "@/lib/axios";
import { toast } from "sonner";

const TableActivityMonitoring = ({
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterUnit,
    setFilterUnit,
    units,
    filterStatus,
    setFilterStatus,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    rowFilter,
    setRowFilter,
    rawActivities,
    filteredActivities,
    fetchActivities,
    setActivities,
    isLoading = false,
    pagination = { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
    currentPage = 1,
    onPageChange,
    getStatusBadge,
    exportToGoogleCalendar,
    onEdit,
    setEditingId,
    setIsDialogOpen,
    setFormData,
    onSuccess
}) => {

    const handleEventMove = async (draggedEvent, targetDateStr) => {
        const oldStartDate = new Date(draggedEvent.tanggal)
        const newStartDate = new Date(targetDateStr)
        let newEndDateStr = null

        // Geser tanggal berakhir jika acaranya multi-hari
        if (draggedEvent.tanggalBerakhir) {
            const oldEndDate = new Date(draggedEvent.tanggalBerakhir);
            const diffTime = oldEndDate.getTime() - oldStartDate.getTime();
            const newEndDate = new Date(newStartDate.getTime() + diffTime);
            newEndDateStr = newEndDate.toISOString().split("T")[0]
        }

        // OPTIMISTIC UI UPDATE
        setActivities((prevActivities) =>
            prevActivities.map((act) => {
                if (act.id === draggedEvent.id) {
                    return {
                        ...act,
                        // Update dengan key yang sesuai dengan form dan state FE kamu
                        tanggal: targetDateStr,
                        ...(newEndDateStr && { tanggalBerakhir: newEndDateStr }),

                        // RESET SEMUA INDIKATOR KONFLIK agar visual instan jadi Normal (biru)
                        status: "Normal",
                        hasConflict: false,
                        conflictTypes: [],
                        conflictType: null,
                        conflictingOfficialsList: [],
                    }
                }
                return act
            })
        );

        try {
            await api.patch(`/api/activity-monitoring/${draggedEvent.id}`, {
                tanggal: targetDateStr,
            })

            fetchActivities(currentPage)

        } catch (error) {
            toast.error(error.response.data.message || "Gagal menyimpan perubahan ke server", {
                position: 'top-center',
            })

            fetchActivities(currentPage)
        }
    }

    const handleDateSelect = (startDate, endDate) => {
        // Kosongkan form dari data sisa edit sebelumnya
        setFormData({
            namaKegiatan: "",
            tanggal: startDate,
            tanggalBerakhir: endDate || "",
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

        setEditingId(null)

        setIsDialogOpen(true);
    }

    return (
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Filter & Tampilan</CardTitle>
                        <TabsList>
                            <TabsTrigger value="calendar" className="gap-2">
                                <CalendarDays className="size-4" />
                                Calendar
                            </TabsTrigger>
                            <TabsTrigger value="table" className="gap-2">
                                <LayoutGrid className="size-4" />
                                Tabel
                            </TabsTrigger>
                            <TabsTrigger value="board" className="gap-2">
                                <Columns className="size-4" />
                                Board
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kegiatan, atau unit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={String(rowFilter)}
                                onValueChange={(value) => setRowFilter(parseInt(value))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Batas Data" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">Menampilkan 10 data</SelectItem>
                                    <SelectItem value="30">Menampilkan 30 data</SelectItem>
                                    <SelectItem value="3000">Semua Data</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterMonth} onValueChange={setFilterMonth}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Semua Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Bulan</SelectItem>
                                    <SelectItem value="1">Januari</SelectItem>
                                    <SelectItem value="2">Februari</SelectItem>
                                    <SelectItem value="3">Maret</SelectItem>
                                    <SelectItem value="4">April</SelectItem>
                                    <SelectItem value="5">Mei</SelectItem>
                                    <SelectItem value="6">Juni</SelectItem>
                                    <SelectItem value="7">Juli</SelectItem>
                                    <SelectItem value="8">Agustus</SelectItem>
                                    <SelectItem value="9">September</SelectItem>
                                    <SelectItem value="10">Oktober</SelectItem>
                                    <SelectItem value="11">November</SelectItem>
                                    <SelectItem value="12">Desember</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterYear} onValueChange={setFilterYear}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Semua Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun</SelectItem>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                    <SelectItem value="2027">2027</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterUnit} onValueChange={setFilterUnit}>
                                <SelectTrigger className="w-[180px]">
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
                                <SelectTrigger className="w-[180px]">
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

            {/* Calendar View */}
            <TabsContent value="calendar" className="mt-0">
                <TabsCalendarView filteredActivities={rawActivities || filteredActivities} onEdit={onEdit} onEventMove={handleEventMove} onDateSelect={handleDateSelect} exportToGoogleCalendar={exportToGoogleCalendar} />
            </TabsContent>

            {/* Table View */}
            <TabsContent value="table" className="mt-0">
                <TabsTableView isLoading={isLoading} pagination={pagination} currentPage={currentPage} onPageChange={onPageChange} filteredActivities={filteredActivities} onEdit={onEdit} onSuccess={onSuccess} exportToGoogleCalendar={exportToGoogleCalendar} getStatusBadge={getStatusBadge} />
            </TabsContent>

            {/* Card View */}
            <TabsContent value="board" className="mt-0">
                <TabsBoardView filteredActivities={filteredActivities} exportToGoogleCalendar={exportToGoogleCalendar} getStatusBadge={getStatusBadge} />
            </TabsContent>
        </Tabs>
    )
}

export default TableActivityMonitoring
'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    CalendarDays, LayoutGrid, Search, Columns, SlidersHorizontal,
} from "lucide-react";
import { Input } from "../ui/input";
import { formatCamelCaseLabel } from "@/lib/utils";
import TabsTableView from "./tabs-table-view";
import TabsBoardView from "./tabs-board-view";
import TabsCalendarView from "./tabs-calendar-view";
import api from "@/lib/axios";
import { toast } from "sonner";

const MONTHS = [
    { value: "all", label: "Semua Bulan" },
    { value: "1", label: "Januari" }, { value: "2", label: "Februari" },
    { value: "3", label: "Maret" }, { value: "4", label: "April" },
    { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "Agustus" },
    { value: "9", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" },
]

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
    onSuccess,
    // Unified toolbar props
    pageTitle,
    stats = [],
    addButton,
}) => {

    const [filterOpen, setFilterOpen] = useState(false)

    // Count active filters (non-default values)
    const activeFilterCount = [
        rowFilter !== 3000,
        filterMonth !== String(new Date().getMonth() + 1),
        filterYear !== String(new Date().getFullYear()),
        filterUnit !== 'all',
        filterStatus !== 'all',
    ].filter(Boolean).length

    const hasActiveFilters = activeFilterCount > 0

    const handleEventMove = async (draggedEvent, targetDateStr) => {
        const oldStartDate = new Date(draggedEvent.tanggal)
        const newStartDate = new Date(targetDateStr)
        let newEndDateStr = null

        if (draggedEvent.tanggalBerakhir) {
            const oldEndDate = new Date(draggedEvent.tanggalBerakhir);
            const diffTime = oldEndDate.getTime() - oldStartDate.getTime();
            const newEndDate = new Date(newStartDate.getTime() + diffTime);
            newEndDateStr = newEndDate.toISOString().split("T")[0]
        }

        setActivities((prevActivities) =>
            prevActivities.map((act) => {
                if (act.id === draggedEvent.id) {
                    return {
                        ...act,
                        tanggal: targetDateStr,
                        ...(newEndDateStr && { tanggalBerakhir: newEndDateStr }),
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
            await api.patch(`/api/activity-monitoring/${draggedEvent.id}`, { tanggal: targetDateStr })
            fetchActivities(currentPage)
        } catch (error) {
            toast.error(error.response.data.message || "Gagal menyimpan perubahan ke server", { position: 'top-center' })
            fetchActivities(currentPage)
        }
    }

    const handleDateSelect = (startDate, endDate) => {
        setFormData({
            namaKegiatan: "", tanggal: startDate, tanggalBerakhir: endDate || "",
            waktuMulai: "", waktuSelesai: "", unit: "", otherUnit: "",
            ruangan: "", locationDetail: "", pejabat: [], jumlahPeserta: "", keterangan: "",
        })
        setEditingId(null)
        setIsDialogOpen(true);
    }

    return (
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-3">

            {/* ── Responsive Unified Toolbar ── */}
            <Card className="border-border/60">
                <CardContent className="p-2.5 sm:px-3 sm:py-2">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">

                        {/* Left / Top Section: Title & Stats */}
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                            {pageTitle && (
                                <span className="text-sm font-bold text-primary whitespace-nowrap shrink-0">
                                    {pageTitle}
                                </span>
                            )}

                            {pageTitle && stats && stats.length > 0 && (
                                <div className="h-4 w-px bg-border shrink-0 hidden sm:block" />
                            )}

                            {/* Stat Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {stats.map((s, i) => (
                                    <div
                                        key={i}
                                        title={s.label}
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border whitespace-nowrap ${s.variant === 'danger'
                                            ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900 text-red-600'
                                            : 'bg-muted/40 border-border/60 text-foreground'
                                        }`}
                                    >
                                        <s.icon className={`h-3 w-3 shrink-0 ${s.variant === 'danger' ? 'text-red-500' : 'text-muted-foreground'}`} />
                                        <span className="font-semibold">{s.value}</span>
                                        <span className={`hidden sm:inline ${s.variant === 'danger' ? 'text-red-500' : 'text-muted-foreground'}`}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right / Bottom Section: Search, Filter, Tabs, Add Button */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end min-w-0">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-48 md:w-56 lg:w-64 min-w-[140px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Cari kegiatan atau unit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8 text-xs w-full"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                {/* Filter Icon Button + Popover */}
                                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1.5 relative shrink-0">
                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                            <span className="text-xs hidden sm:inline">Filter</span>
                                            {hasActiveFilters && (
                                                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center leading-none">
                                                    {activeFilterCount}
                                                </span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-64 p-3">
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Opsi Filter</p>

                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Tampilkan</label>
                                                <Select value={String(rowFilter)} onValueChange={(v) => setRowFilter(parseInt(v))}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="10">10 data</SelectItem>
                                                        <SelectItem value="30">30 data</SelectItem>
                                                        <SelectItem value="3000">Semua Data</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground">Bulan</label>
                                                    <Select value={filterMonth} onValueChange={setFilterMonth}>
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground">Tahun</label>
                                                    <Select value={filterYear} onValueChange={setFilterYear}>
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Semua</SelectItem>
                                                            <SelectItem value="2024">2024</SelectItem>
                                                            <SelectItem value="2025">2025</SelectItem>
                                                            <SelectItem value="2026">2026</SelectItem>
                                                            <SelectItem value="2027">2027</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Unit</label>
                                                <Select value={filterUnit} onValueChange={setFilterUnit}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Unit</SelectItem>
                                                        {units.map((unit) => (
                                                            <SelectItem key={unit} value={unit}>{formatCamelCaseLabel(unit)}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Status</label>
                                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Status</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="conflict">Ada Konflik</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {hasActiveFilters && (
                                                <Button
                                                    variant="ghost" size="sm"
                                                    className="w-full h-7 text-xs text-muted-foreground"
                                                    onClick={() => {
                                                        setRowFilter(3000)
                                                        setFilterMonth(String(new Date().getMonth() + 1))
                                                        setFilterYear(String(new Date().getFullYear()))
                                                        setFilterUnit('all')
                                                        setFilterStatus('all')
                                                        setFilterOpen(false)
                                                    }}
                                                >
                                                    Reset semua filter
                                                </Button>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* View Toggle Tabs */}
                                <TabsList className="h-8 shrink-0">
                                    <TabsTrigger value="calendar" className="h-7 px-2 sm:px-2.5 gap-1.5" title="Kalender">
                                        <CalendarDays className="size-3.5" />
                                        <span className="text-xs hidden md:inline">Kalender</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="table" className="h-7 px-2 sm:px-2.5 gap-1.5" title="Tabel">
                                        <LayoutGrid className="size-3.5" />
                                        <span className="text-xs hidden md:inline">Tabel</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="board" className="h-7 px-2 sm:px-2.5 gap-1.5" title="Board">
                                        <Columns className="size-3.5" />
                                        <span className="text-xs hidden md:inline">Board</span>
                                    </TabsTrigger>
                                </TabsList>

                                {/* Add Button */}
                                {addButton && <div className="shrink-0">{addButton}</div>}
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* Calendar View */}
            <TabsContent value="calendar" className="mt-0">
                <TabsCalendarView
                    filteredActivities={rawActivities || filteredActivities}
                    onEdit={onEdit}
                    onSuccess={onSuccess}
                    onEventMove={handleEventMove}
                    onDateSelect={handleDateSelect}
                    exportToGoogleCalendar={exportToGoogleCalendar}
                    getStatusBadge={getStatusBadge}
                />
            </TabsContent>

            {/* Table View */}
            <TabsContent value="table" className="mt-0">
                <TabsTableView isLoading={isLoading} pagination={pagination} currentPage={currentPage} onPageChange={onPageChange} filteredActivities={filteredActivities} onEdit={onEdit} onSuccess={onSuccess} exportToGoogleCalendar={exportToGoogleCalendar} getStatusBadge={getStatusBadge} filterMonth={filterMonth} filterYear={filterYear} setFilterMonth={setFilterMonth} setFilterYear={setFilterYear} />
            </TabsContent>

            {/* Board View */}
            <TabsContent value="board" className="mt-0">
                <TabsBoardView
                    filteredActivities={filteredActivities}
                    onEdit={onEdit}
                    onSuccess={onSuccess}
                    exportToGoogleCalendar={exportToGoogleCalendar}
                    getStatusBadge={getStatusBadge}
                />
            </TabsContent>
        </Tabs>
    )
}

export default TableActivityMonitoring

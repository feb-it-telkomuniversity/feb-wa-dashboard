'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
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
    ChevronLeft, ChevronRight, ChevronDown, Check, CalendarCheck,
} from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "../ui/input";
import { formatCamelCaseLabel } from "@/lib/utils";
import TabsTableView from "./tabs-table-view";
import TabsBoardView from "./tabs-board-view";
import TabsCalendarView from "./tabs-calendar-view";
import api from "@/lib/axios";
import { toast } from "sonner";

const MODE_OPTIONS = [
    { value: 'day', label: 'Hari', shortcut: 'D' },
    { value: 'week', label: 'Minggu', shortcut: 'W' },
    { value: 'month', label: 'Bulan', shortcut: 'M' },
    { value: 'year', label: 'Tahun', shortcut: 'Y' },
    { value: 'schedule', label: 'Jadwal', shortcut: 'A' },
]

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
    const [calendarMode, setCalendarMode] = useState('month')
    const [calendarDate, setCalendarDate] = useState(new Date())

    // Judul Header Kalender Dinamis
    const headerTitle = useMemo(() => {
        if (calendarMode === 'year') {
            return calendarDate.getFullYear().toString()
        }
        if (calendarMode === 'day') {
            return calendarDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            })
        }
        if (calendarMode === 'week') {
            const d = new Date(calendarDate)
            const dayOfWeek = d.getDay()
            const sunday = new Date(d)
            sunday.setDate(d.getDate() - dayOfWeek)
            const saturday = new Date(sunday)
            saturday.setDate(sunday.getDate() + 6)

            const startDay = sunday.getDate()
            const endDay = saturday.getDate()
            const startMonth = sunday.toLocaleDateString("id-ID", { month: "short" })
            const endMonth = saturday.toLocaleDateString("id-ID", { month: "short" })
            const year = saturday.getFullYear()

            if (startMonth === endMonth) {
                return `${startDay} – ${endDay} ${endMonth} ${year}`
            }
            return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`
        }
        if (calendarMode === 'schedule') {
            return calendarDate.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric"
            })
        }
        return calendarDate.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric"
        })
    }, [calendarDate, calendarMode])

    const handlePrev = useCallback(() => {
        setCalendarDate((prev) => {
            const d = new Date(prev)
            if (calendarMode === 'day') {
                d.setDate(d.getDate() - 1)
            } else if (calendarMode === 'week') {
                d.setDate(d.getDate() - 7)
            } else if (calendarMode === 'month') {
                d.setMonth(d.getMonth() - 1)
            } else if (calendarMode === 'year') {
                d.setFullYear(d.getFullYear() - 1)
            } else if (calendarMode === 'schedule') {
                d.setMonth(d.getMonth() - 1)
            }
            return new Date(d)
        })
    }, [calendarMode])

    const handleNext = useCallback(() => {
        setCalendarDate((prev) => {
            const d = new Date(prev)
            if (calendarMode === 'day') {
                d.setDate(d.getDate() + 1)
            } else if (calendarMode === 'week') {
                d.setDate(d.getDate() + 7)
            } else if (calendarMode === 'month') {
                d.setMonth(d.getMonth() + 1)
            } else if (calendarMode === 'year') {
                d.setFullYear(d.getFullYear() + 1)
            } else if (calendarMode === 'schedule') {
                d.setMonth(d.getMonth() + 1)
            }
            return new Date(d)
        })
    }, [calendarMode])

    const handleToday = useCallback(() => {
        setCalendarDate(new Date())
    }, [])

    // Keyboard shortcuts ala Google Calendar: D, W, M, Y, A, T
    useEffect(() => {
        if (viewMode !== 'calendar') return

        const handleKeyDown = (e) => {
            const activeTag = document.activeElement?.tagName?.toLowerCase()
            if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
                return
            }

            const key = e.key.toLowerCase()
            if (key === 'd') setCalendarMode('day')
            else if (key === 'w') setCalendarMode('week')
            else if (key === 'm') setCalendarMode('month')
            else if (key === 'y') setCalendarMode('year')
            else if (key === 'a') setCalendarMode('schedule')
            else if (key === 't') handleToday()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [viewMode, handleToday])

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
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-2">

            {/* ── Responsive Unified Toolbar ── */}
            <Card className="border-border/60">
                <CardContent className="p-2 sm:px-3 sm:py-2">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">

                        {/* Left / Top Section: Title & Stats (or Calendar Nav when in Calendar view) */}
                        {viewMode === 'calendar' ? (
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                                {/* Tombol Hari Ini */}
                                <button
                                    type="button"
                                    onClick={handleToday}
                                    className="px-3 py-1 text-xs font-medium rounded-full border border-border/80 hover:bg-accent transition text-foreground cursor-pointer shrink-0"
                                    title="Kembali ke hari ini (T)"
                                >
                                    Hari Ini
                                </button>

                                {/* Panah Prev / Next */}
                                <div className="flex items-center shrink-0">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent transition text-muted-foreground hover:text-foreground cursor-pointer"
                                        title="Sebelumnya"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent transition text-muted-foreground hover:text-foreground cursor-pointer"
                                        title="Berikutnya"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                {/* Judul Bulan / Rentang Tanggal */}
                                <h2 className="text-sm sm:text-base font-bold capitalize text-foreground whitespace-nowrap">
                                    {headerTitle}
                                </h2>

                                {/* Dropdown Mode Kalender */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 text-xs font-medium gap-1 px-2 shrink-0">
                                            <span>{MODE_OPTIONS.find(o => o.value === calendarMode)?.label || 'Bulan'}</span>
                                            <ChevronDown className="size-3.5 opacity-60" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-36">
                                        {MODE_OPTIONS.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => setCalendarMode(opt.value)}
                                                className="flex items-center justify-between text-xs cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {calendarMode === opt.value ? (
                                                        <Check className="h-3.5 w-3.5 text-[#009da5]" />
                                                    ) : (
                                                        <span className="w-3.5" />
                                                    )}
                                                    <span>{opt.label}</span>
                                                </div>
                                                <DropdownMenuShortcut>{opt.shortcut}</DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Stat Badges Ringkas */}
                                {stats && stats.length > 0 && (
                                    <>
                                        <div className="h-4 w-px bg-border shrink-0 hidden md:block" />
                                        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                                            {stats.map((s, i) => (
                                                <div
                                                    key={i}
                                                    title={s.label}
                                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border whitespace-nowrap ${s.variant === 'danger'
                                                        ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900 text-red-600 font-semibold'
                                                        : 'bg-muted/40 border-border/60 text-foreground'
                                                    }`}
                                                >
                                                    <s.icon className={`h-3 w-3 shrink-0 ${s.variant === 'danger' ? 'text-red-500' : 'text-muted-foreground'}`} />
                                                    <span className="font-semibold">{s.value}</span>
                                                    <span className={`hidden 2xl:inline ${s.variant === 'danger' ? 'text-red-500' : 'text-muted-foreground'}`}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
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
                        )}

                        {/* Right / Bottom Section: Search, Filter, Tabs, Manajemen Acara, Add Button */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end min-w-0">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-44 md:w-52 lg:w-56 min-w-[130px]">
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

                                {/* Manajemen Acara Link Button */}
                                <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 px-2.5 hidden sm:flex shrink-0">
                                    <Link href="/dashboard/manajemen-acara">
                                        <CalendarCheck className="h-3.5 w-3.5 text-[#009da5]" />
                                        <span className="hidden xl:inline">Manajemen Acara</span>
                                        <span className="xl:hidden">Acara</span>
                                    </Link>
                                </Button>

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
                    currentDate={calendarDate}
                    setCurrentDate={setCalendarDate}
                    calendarMode={calendarMode}
                    setCalendarMode={setCalendarMode}
                    hideHeader={true}
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

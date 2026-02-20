'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarPlus, LayoutGrid, Search, Clock, Building2, MapPin, UserCheck, Users, Pencil, Loader2, Trash2, Columns, AlertTriangle } from "lucide-react";
import { Input } from "../ui/input";
import DeleteActivity from "./delete-activity";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { formatCamelCaseLabel } from "@/lib/utils";

const formatRangeInfo = (pagination, currentPage) => {
    const total = pagination?.totalItems ?? 0
    const pageSize = pagination?.pageSize ?? 0

    if (total === 0 || pageSize === 0) {
        return "0–0 dari 0"
    }

    const safePage = Math.max(currentPage || 1, 1)
    const start = (safePage - 1) * pageSize + 1
    const end = Math.min(safePage * pageSize, total)

    return `${start} – ${end} dari ${total} data`
}

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
    filteredActivities,
    isLoading = false,
    pagination = { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
    currentPage = 1,
    onPageChange,
    getStatusBadge,
    exportToGoogleCalendar,
    onEdit,
    onSuccess
}) => {
    return (
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Filter & Tampilan</CardTitle>
                        <TabsList>
                            <TabsTrigger value="table" className="gap-2">
                                <LayoutGrid className="h-4 w-4" />
                                Tabel
                            </TabsTrigger>
                            <TabsTrigger value="board" className="gap-2">
                                <Columns className="h-4 w-4" />
                                Board
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Calendar
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
                        <div className="flex gap-2">
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

            {/* Table View */}
            <TabsContent value="table" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kegiatan</CardTitle>
                        <CardDescription>
                            Monitoring kegiatan unit dan program studi dengan deteksi
                            konflik otomatis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Waktu</TableHead>
                                        <TableHead>Nama Kegiatan</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Ruangan</TableHead>
                                        <TableHead>Pejabat</TableHead>
                                        <TableHead>Peserta</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={10}
                                                className="text-center py-8"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span className="text-muted-foreground">Memuat data...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredActivities.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={10}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Tidak ada kegiatan ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredActivities.map((activity) => (
                                            <TableRow
                                                key={activity.id}
                                                className={activity.hasConflict ? "bg-red-50 dark:bg-red-800" : ""}
                                            >
                                                <TableCell className="font-medium">
                                                    {new Date(activity.tanggal).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        {activity.waktuMulai} - {activity.waktuSelesai}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {activity.namaKegiatan}
                                                        </div>
                                                        {activity.keterangan && (
                                                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[260px]" title={activity.keterangan}>
                                                                {activity.keterangan}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {activity.unit === "Lainnya" ? activity.otherUnit : formatCamelCaseLabel(activity.unit)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {activity.ruangan === "Lainnya"
                                                                ? activity.locationDetail
                                                                : formatCamelCaseLabel(activity.ruangan)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {activity.pejabat.map((p, idx) => {
                                                            const isConflicting = activity.conflictingOfficialsList?.includes(p);
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex items-center gap-1 ${isConflicting ? "text-red-600 font-medium" : ""}`}
                                                                >
                                                                    {isConflicting ? (
                                                                        <AlertTriangle className="h-3 w-3 text-red-600" />
                                                                    ) : (
                                                                        <UserCheck className="h-3 w-3 text-muted-foreground" />
                                                                    )}
                                                                    <span className="text-xs">{formatCamelCaseLabel(p)}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {activity.jumlahPeserta}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge ? getStatusBadge(activity) : null}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <DeleteActivity
                                                            activityId={activity.id}
                                                            onSuccess={onSuccess}
                                                        />

                                                        {onEdit && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => onEdit(activity)}
                                                            >
                                                                <Pencil className="size-4" />
                                                                {/* Edit */}
                                                            </Button>
                                                        )}
                                                        {exportToGoogleCalendar && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => exportToGoogleCalendar(activity)}
                                                                className="gap-1"
                                                            >
                                                                <CalendarPlus className="h-3 w-3" />
                                                                Sync
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {!isLoading && pagination.totalPages > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    {formatRangeInfo(pagination, currentPage)}
                                </div>
                                <div className="flex justify-start">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        if (currentPage > 1 && onPageChange) {
                                                            onPageChange(currentPage - 1)
                                                        }
                                                    }}
                                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                                                if (
                                                    page === 1 ||
                                                    page === pagination.totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <PaginationItem key={page}>
                                                            <PaginationLink
                                                                href="#"
                                                                isActive={page === currentPage}
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    if (onPageChange) {
                                                                        onPageChange(page)
                                                                    }
                                                                }}
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    )
                                                } else if (
                                                    page === currentPage - 2 ||
                                                    page === currentPage + 2
                                                ) {
                                                    return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>
                                                }
                                                return null
                                            })}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        if (currentPage < pagination.totalPages && onPageChange) {
                                                            onPageChange(currentPage + 1)
                                                        }
                                                    }}
                                                    className={currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Card View */}
            <TabsContent value="board" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Kartu Kegiatan</CardTitle>
                        <CardDescription>
                            Tampilan kartu agenda kegiatan fakultas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Group activities by date */}
                            {Object.entries(
                                filteredActivities.reduce((acc, activity) => {
                                    const date = new Date(activity.tanggal).toLocaleDateString(
                                        "id-ID",
                                        {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        }
                                    );
                                    if (!acc[date]) acc[date] = [];
                                    acc[date].push(activity);
                                    return acc;
                                }, {})
                            )
                                .sort(([dateA], [dateB]) => {
                                    const a = filteredActivities.find(
                                        (act) =>
                                            new Date(act.tanggal).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            }) === dateA
                                    );
                                    const b = filteredActivities.find(
                                        (act) =>
                                            new Date(act.tanggal).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            }) === dateB
                                    );
                                    return new Date(a.tanggal) - new Date(b.tanggal);
                                })
                                .map(([date, dayActivities]) => (
                                    <div key={date} className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#e31e25] text-white px-3 py-1 rounded-md">
                                                <CalendarDays className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-semibold text-lg">{date}</h3>
                                            <Badge variant="secondary">
                                                {dayActivities.length} kegiatan
                                            </Badge>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {dayActivities.map((activity) => (
                                                <Card
                                                    key={activity.id}
                                                    className={
                                                        activity.hasConflict ? "border-red-500" : ""
                                                    }
                                                >
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <CardTitle className="text-base">
                                                                    {activity.namaKegiatan}
                                                                </CardTitle>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    {getStatusBadge ? getStatusBadge(activity) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                {activity.waktuMulai} -{" "}
                                                                {activity.waktuSelesai}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                            <span>{activity.ruangan === "Lainnya" ? activity.locationDetail : formatCamelCaseLabel(activity.ruangan)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                            <span>{formatCamelCaseLabel(activity.unit)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                            <span>{activity.jumlahPeserta || 0} peserta</span>
                                                        </div>
                                                        {activity.pejabat && activity.pejabat.length > 0 && (
                                                            <div className="pt-2 border-t">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    Pejabat:
                                                                </p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {activity.pejabat.map((p, idx) => (
                                                                        <Badge
                                                                            key={idx}
                                                                            variant="outline"
                                                                            className="text-xs"
                                                                        >
                                                                            {formatCamelCaseLabel(p)}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {exportToGoogleCalendar && (
                                                            <div className="pt-2 flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        exportToGoogleCalendar(activity)
                                                                    }
                                                                    className="flex-1 gap-1"
                                                                >
                                                                    <CalendarPlus className="h-3 w-3" />
                                                                    Sync
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            {filteredActivities.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Tidak ada kegiatan ditemukan</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Real Calendar View */}
            <TabsContent value="calendar" className="mt-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Kalender Interaktif</CardTitle>
                        <CardDescription>
                            Tampilan kalender interaktif untuk memantau seluruh kegiatan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="calendar-container bg-white dark:bg-slate-900 p-4 rounded-xl border">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "dayGridMonth,dayGridWeek",
                                }}
                                events={filteredActivities.map((activity) => ({
                                    id: activity.id.toString(),
                                    title: activity.namaKegiatan,
                                    start: `${activity.tanggal}T${activity.waktuMulai}`,
                                    end: `${activity.tanggal}T${activity.waktuSelesai}`,
                                    backgroundColor: activity.hasConflict ? "#ef4444" : "#e31e25",
                                    borderColor: activity.hasConflict ? "#ef4444" : "#e31e25",
                                    extendedProps: { ...activity },
                                }))}
                                eventClick={(info) => {
                                    const activity = info.event.extendedProps;
                                    setFormData({
                                        namaKegiatan: activity.namaKegiatan,
                                        tanggal: activity.tanggal,
                                        waktuMulai: activity.waktuMulai,
                                        waktuSelesai: activity.waktuSelesai,
                                        unit: activity.unit,
                                        tempat: activity.tempat === "Lainnya" ? "Lainnya" : activity.tempat,
                                        tempatLainnya: activity.tempat === "Lainnya" ? "" : "",
                                        pejabat: activity.pejabat,
                                        jumlahPeserta: activity.jumlahPeserta,
                                        keterangan: activity.keterangan,
                                    });
                                    setIsDialogOpen(true);
                                }}
                                height="auto"
                                eventTimeFormat={{
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    meridiem: false,
                                    hour12: false,
                                }}
                                locale="id"
                            />
                        </div>
                        <style jsx global>{`
                .fc .fc-button-primary {
                  background-color: #e31e25;
                  border-color: #e31e25;
                }
                .fc .fc-button-primary:hover {
                  background-color: #c41a20;
                  border-color: #c41a20;
                }
                .fc .fc-button-primary:disabled {
                  background-color: #e31e25;
                  opacity: 0.65;
                }
                .fc .fc-button-active {
                  background-color: #c41a20 !important;
                  border-color: #c41a20 !important;
                }
                .fc-event {
                  cursor: pointer;
                  padding: 2px 4px;
                }
                .dark .fc-theme-standard td, .dark .fc-theme-standard th {
                  border-color: #334155;
                }
                .dark .fc .fc-daygrid-day-number {
                  color: #f8fafc;
                }
              `}</style>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default TableActivityMonitoring
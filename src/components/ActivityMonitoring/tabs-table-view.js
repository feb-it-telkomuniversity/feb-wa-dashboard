import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import DeleteActivity from "./delete-activity";
import { CalendarPlus, Clock, Building2, MapPin, UserCheck, Users, Pencil, Loader2, AlertTriangle, CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCamelCaseLabel, cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import ActivityDetailModal from "./activity-detail-modal";

const formatRangeInfo = (pagination, currentPage, filteredCount) => {
    const total = pagination?.totalItems ?? 0
    const pageSize = pagination?.pageSize ?? 0

    if (total === 0 || pageSize === 0) {
        return "0–0 dari 0"
    }

    if (pageSize >= 3000) {
        return `Menampilkan ${filteredCount} data`
    }

    const safePage = Math.max(currentPage || 1, 1)
    const start = (safePage - 1) * pageSize + 1
    const end = Math.min(safePage * pageSize, total)

    return `${start} – ${end} dari ${total} data`
}


const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const shiftMonth = (month, year, delta) => {
    let m = parseInt(month)
    let y = parseInt(year)
    if (isNaN(m) || m < 1 || m > 12) { m = new Date().getMonth() + 1 }
    if (isNaN(y)) { y = new Date().getFullYear() }
    m += delta
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    return { month: String(m), year: String(y) }
}

const TabsTableView = ({
    isLoading,
    pagination,
    currentPage,
    onPageChange,
    filteredActivities,
    onEdit,
    onSuccess,
    exportToGoogleCalendar,
    getStatusBadge,
    // Month navigation props
    filterMonth,
    filterYear,
    setFilterMonth,
    setFilterYear,
}) => {
    const [selectedActivity, setSelectedActivity] = useState(null)

    // Aktif hanya jika filterMonth bukan "all"
    const canScrollMonth = filterMonth !== 'all'

    const monthLabel = (() => {
        if (filterMonth === 'all') return 'Semua Bulan'
        const m = parseInt(filterMonth)
        const y = parseInt(filterYear)
        if (isNaN(m)) return 'Semua Bulan'
        return `${MONTHS_ID[m - 1]}${!isNaN(y) && filterYear !== 'all' ? ' ' + y : ''}`
    })()

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-3 pb-3">
                <div>
                    <CardTitle className="text-lg">Daftar Kegiatan</CardTitle>
                    <CardDescription className="text-xs">
                        Monitoring kegiatan unit dan program studi. Klik pada baris kegiatan untuk melihat detail lengkap.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {/* Month navigator — hanya tampil jika filterMonth aktif */}
                    {canScrollMonth && (
                        <div className="flex items-center gap-1 border rounded-md px-1 py-0.5">
                            <button
                                onClick={() => {
                                    const { month, year } = shiftMonth(filterMonth, filterYear, -1)
                                    setFilterMonth(month)
                                    setFilterYear(year)
                                }}
                                className="p-1 rounded hover:bg-accent transition"
                                title="Bulan sebelumnya"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-medium px-1 min-w-[100px] text-center">{monthLabel}</span>
                            <button
                                onClick={() => {
                                    const { month, year } = shiftMonth(filterMonth, filterYear, 1)
                                    setFilterMonth(month)
                                    setFilterYear(year)
                                }}
                                className="p-1 rounded hover:bg-accent transition"
                                title="Bulan berikutnya"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                    <Button asChild size="sm" className="gap-2 text-xs">
                        <Link href="/dashboard/manajemen-acara">
                            <CalendarCheck className="h-4 w-4" />
                            Manajemen Acara
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-5 pt-0 sm:pt-0">
                <div className="rounded-md border overflow-x-auto w-full">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-[95px] text-xs font-semibold py-2.5 px-2.5 whitespace-nowrap">Tanggal</TableHead>
                                <TableHead className="w-[90px] text-xs font-semibold py-2.5 px-2.5 whitespace-nowrap">Waktu</TableHead>
                                <TableHead className="min-w-[170px] max-w-[260px] text-xs font-semibold py-2.5 px-2.5">Nama Kegiatan</TableHead>
                                <TableHead className="w-[115px] max-w-[140px] text-xs font-semibold py-2.5 px-2.5">Unit</TableHead>
                                <TableHead className="w-[115px] max-w-[140px] text-xs font-semibold py-2.5 px-2.5">Ruangan</TableHead>
                                <TableHead className="w-[130px] max-w-[160px] text-xs font-semibold py-2.5 px-2.5">Pejabat</TableHead>
                                <TableHead className="w-[60px] text-xs font-semibold py-2.5 px-2 text-center whitespace-nowrap">Peserta</TableHead>
                                <TableHead className="w-[105px] text-xs font-semibold py-2.5 px-2.5 whitespace-nowrap">Status</TableHead>
                                <TableHead className="w-[85px] text-xs font-semibold py-2.5 px-2 text-center whitespace-nowrap">Aksi</TableHead>
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
                                            <span className="text-muted-foreground text-xs">Memuat data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredActivities.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="text-center text-muted-foreground py-8 text-xs"
                                    >
                                        Tidak ada kegiatan ditemukan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredActivities.map((activity) => (
                                    <TableRow
                                        key={activity.id}
                                        onClick={() => setSelectedActivity(activity)}
                                        className={cn(
                                            "cursor-pointer transition-colors hover:bg-muted/70 group",
                                            activity.hasConflict
                                                ? "bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/60 dark:hover:bg-red-900/30"
                                                : ""
                                        )}
                                        title="Klik untuk melihat rincian kegiatan lengkap"
                                    >
                                        <TableCell className="py-2 px-2.5 text-xs font-medium whitespace-nowrap">
                                            {activity.tanggal && !isNaN(new Date(activity.tanggal).getTime()) ? (
                                                <div>
                                                    <div>
                                                        {new Date(activity.tanggal).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </div>
                                                    {activity.tanggalBerakhir && !isNaN(new Date(activity.tanggalBerakhir).getTime()) && activity.tanggalBerakhir !== activity.tanggal && (
                                                        <div className="text-[10px] text-muted-foreground leading-none mt-0.5">
                                                            s.d. {new Date(activity.tanggalBerakhir).toLocaleDateString("id-ID", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell className="py-2 px-2.5 text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-muted-foreground font-mono">
                                                <Clock className="h-3 w-3 shrink-0" />
                                                <span>{activity.waktuMulai || "-"} - {activity.waktuSelesai || "-"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-2.5 whitespace-normal min-w-[170px] max-w-[260px]">
                                            <div>
                                                <div className="font-semibold text-xs text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors" title={activity.namaKegiatan}>
                                                    {activity.namaKegiatan}
                                                </div>
                                                {activity.keterangan && (
                                                    <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5" title={activity.keterangan}>
                                                        {activity.keterangan}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-2.5 whitespace-normal w-[115px] max-w-[140px]">
                                            <div className="flex items-start gap-1">
                                                <Building2 className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                                <span className="text-xs leading-tight line-clamp-2" title={activity.unit === "Lainnya" ? activity.otherUnit : formatCamelCaseLabel(activity.unit)}>
                                                    {activity.unit === "Lainnya" ? activity.otherUnit : formatCamelCaseLabel(activity.unit)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-2.5 whitespace-normal w-[115px] max-w-[140px]">
                                            <div className="flex items-start gap-1">
                                                <MapPin className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                                <span className="text-xs leading-tight line-clamp-2" title={activity.ruangan === "Lainnya" ? activity.locationDetail : formatCamelCaseLabel(activity.ruangan)}>
                                                    {activity.ruangan === "Lainnya"
                                                        ? activity.locationDetail
                                                        : formatCamelCaseLabel(activity.ruangan)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-2.5 whitespace-normal w-[130px] max-w-[160px]">
                                            {(!activity.pejabat || activity.pejabat.length === 0) ? (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    {activity.pejabat.slice(0, 2).map((p, idx) => {
                                                        const isConflicting = activity.conflictingOfficialsList?.includes(p);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={cn(
                                                                    "flex items-center gap-1 text-[11px] leading-tight truncate",
                                                                    isConflicting ? "text-red-600 font-medium" : "text-muted-foreground"
                                                                )}
                                                                title={formatCamelCaseLabel(p)}
                                                            >
                                                                {isConflicting ? (
                                                                    <AlertTriangle className="h-2.5 w-2.5 text-red-600 shrink-0" />
                                                                ) : (
                                                                    <UserCheck className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                                                )}
                                                                <span className="truncate">{formatCamelCaseLabel(p)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    {activity.pejabat.length > 2 && (
                                                        <span className="text-[10px] text-primary/90 font-medium">
                                                            +{activity.pejabat.length - 2} lainnya
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2 px-2 text-center w-[60px] whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                                <Users className="h-3 w-3 shrink-0" />
                                                <span>{activity.jumlahPeserta || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 px-2.5 w-[105px] whitespace-nowrap">
                                            {getStatusBadge ? getStatusBadge(activity) : null}
                                        </TableCell>
                                        <TableCell className="py-2 px-2 text-center w-[85px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                <DeleteActivity
                                                    activityId={activity.id}
                                                    onSuccess={onSuccess}
                                                />
                                                {onEdit && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(activity);
                                                        }}
                                                        title="Edit Kegiatan"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                )}
                                                {exportToGoogleCalendar && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            exportToGoogleCalendar(activity);
                                                        }}
                                                        title="Sync ke Google Calendar"
                                                    >
                                                        <CalendarPlus className="size-3.5" />
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
                            {formatRangeInfo(pagination, currentPage, filteredActivities.length)}
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

            {/* Modal Detail Informasi Lengkap Kegiatan */}
            <ActivityDetailModal
                isOpen={Boolean(selectedActivity)}
                onClose={() => setSelectedActivity(null)}
                activity={selectedActivity}
                onEdit={onEdit}
                exportToGoogleCalendar={exportToGoogleCalendar}
                getStatusBadge={getStatusBadge}
            />
        </Card>
    )
}

export default TabsTableView
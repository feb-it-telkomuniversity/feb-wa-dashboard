'use client'

import { useMemo, useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Edit,
    Trash2,
    Plus,
    FileText,
    Inbox,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    Clock,
    X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ButtonBlobFill from "../shadcn-space/radix/button/button-17";
import ButtonWithIcon from "../shadcn-space/radix/button/button-08";
import RangeCalendar from "@/components/shadcn-space/radix/calendar/calendar-04";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/hash-ids";
import ExportNotulensiExcelButton from "@/components/shared/ExportNotulensiExcelButton";

const PER_PAGE = 5;

const rooms = [
    "Ruang Rapat Manterawu lt. 2",
    "Ruang Rapat Miossu lt. 1",
    "Ruang Rapat Miossu lt. 2",
    "Ruang Rapat Maratua lt. 1",
    "Aula FEB",
    "Aula Manterawu",
    "Lainnya",
];

const statusOptions = ["Terjadwal", "Berlangsung", "Selesai"];

// ─── Status Badge ───────────────────────────────────────────────────
function StatusBadge({ status }) {
    const config = {
        Selesai: { className: "bg-green-600 hover:bg-green-700 text-white" },
        Berlangsung: { className: "bg-blue-600 hover:bg-blue-700 text-white" },
        Terjadwal: { className: "" },
    };
    const { className } = config[status] || config["Terjadwal"];
    return (
        <Badge variant={status === "Terjadwal" ? "secondary" : "default"} className={className}>
            {status}
        </Badge>
    );
}

// ─── Pagination ─────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
    const pages = useMemo(() => {
        const p = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) p.push(i);
        } else {
            p.push(1);
            if (page > 3) p.push("...");
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) p.push(i);
            if (page < totalPages - 2) p.push("...");
            p.push(totalPages);
        }
        return p;
    }, [page, totalPages]);

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => onPage(page - 1)}
            >
                <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`e-${i}`} className="px-1 text-xs text-gray-400">···</span>
                ) : (
                    <Button
                        key={p}
                        variant={p === page ? "default" : "ghost"}
                        size="icon"
                        className={`h-7 w-7 text-xs ${p === page
                            ? "bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500"
                            : "text-gray-500"
                            }`}
                        onClick={() => onPage(p)}
                    >
                        {p}
                    </Button>
                )
            )}

            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === totalPages}
                onClick={() => onPage(page + 1)}
            >
                <ChevronRight className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

// ─── Delete Dialog ───────────────────────────────────────────────────
function DeleteDialog({ meetingId, onSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await api.delete(`/api/meetings/${meetingId}`);
            toast.success("Mantap... Data rapat berhasil dihapus", {
                position: "bottom-center",
                style: { background: "#059669", color: "#d1fae5" },
                className: "border border-emerald-500",
            });
            setIsOpen(false);
            onSuccess?.();
        } catch (error) {
            toast.error(error.response?.data?.message || "Yahh... Gagal menghapus data rapat", {
                position: "bottom-center",
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => { if (!isDeleting) setIsOpen(open); }}>
            <AlertDialogTrigger asChild>
                <div className="inline-block cursor-pointer">
                    <ButtonWithIcon
                        size="icon"
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        className="h-7 w-7 bg-red-50 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border-0 shadow-none"
                        title="Hapus"
                    />
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Data Rapat</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus data rapat ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh notulensi yang terkait.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
                            {isDeleting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menghapus...</> : <><Trash2 className="h-4 w-4 mr-2" />Hapus</>}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function TableMeetingMinutes({ onAdd, onEdit }) {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        dateRange: { from: undefined, to: undefined },
        status: "",
    });

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = {
                search: debouncedSearch || undefined,
                status: (filters.status && filters.status !== "all") ? filters.status : undefined,
            };
            if (filters.dateRange?.from) params.startDate = format(filters.dateRange.from, "yyyy-MM-dd");
            if (filters.dateRange?.to) params.endDate = format(filters.dateRange.to, "yyyy-MM-dd");
            Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);

            const res = await api.get("/api/meetings", { params });
            if (res.data?.success) {
                const mapped = (res.data.data || []).map(item => {
                    const startTime = new Date(item.startTime);
                    const endTime = new Date(item.endTime);
                    const waktu = `${startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })} - ${endTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
                    return {
                        id: item.id,
                        judulRapat: item.title,
                        tanggal: item.date,
                        tanggalFormatted: item.date ? format(new Date(item.date), "dd MMMM yyyy", { locale: idLocale }) : "-",
                        waktu,
                        ruangan: item.room,
                        locationDetail: item.locationDetail,
                        pemimpin: item.leader,
                        notulen: item.notetaker,
                        status: item.status,
                        hasNotulensi: item.hasNotulensi,
                    };
                });
                setData(mapped);
            }
        } catch (err) {
            console.error("Gagal fetch meetings:", err);
            toast.error("Gagal memuat data rapat");
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, filters]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const clearFilters = () => {
        setFilters({ dateRange: { from: undefined, to: undefined }, status: "" });
    };
    const hasFilters = filters.dateRange?.from || filters.dateRange?.to || filters.status;

    const handleAdd = onAdd || (() => router.push("/dashboard/notulensi-rapat/create"));
    const handleViewNotulensi = (id) => router.push(`/dashboard/notulensi-rapat/${encodeId(id)}`);
    const handleEditNotulensi = (id) => {
        if (onEdit) {
            onEdit(id);
        } else {
            router.push(`/dashboard/notulensi-rapat/${encodeId(id)}/edit`);
        }
    };

    const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const slice = data.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
    const rangeStart = data.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
    const rangeEnd = Math.min(safePage * PER_PAGE, data.length);

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start mt-1 gap-3">
                    <div className="p-3 rounded-xl bg-primary dark:bg-primary/20">
                        <FileText className="size-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Notulensi Rapat</h1>
                        <p className="text-muted-foreground">Kelola dan dokumentasi notulensi rapat fakultas.</p>
                    </div>
                </div>
            </div>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                {/* ── Card Header: Filter + Search + Tambah ── */}
                <CardHeader className="flex flex-col px-5 py-4 border-b border-gray-100 dark:border-gray-800 gap-4">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <RangeCalendar
                                date={filters.dateRange}
                                onDateChange={(date) => setFilters(prev => ({ ...prev, dateRange: date }))}
                            />

                            <Select
                                value={filters.status || "all"}
                                onValueChange={(val) => setFilters(prev => ({ ...prev, status: val === "all" ? "" : val }))}
                            >
                                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl shadow-sm h-11">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    {statusOptions.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {hasFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-11 px-4 rounded-xl"
                                >
                                    <X className="w-4 h-4 mr-1.5" />
                                    Reset
                                </Button>
                            )}
                        </div>

                        {/* Search + Tambah */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari judul rapat atau pemimpin..."
                                    className="pl-8 h-8 text-xs w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Tambah */}
                            <ButtonBlobFill
                                text="Tambah Notula"
                                icon={<Plus className="h-3.5 w-3.5" />}
                                className="h-8 text-xs gap-1.5 rounded-lg text-white"
                                onClick={handleAdd}
                            />
                        </div>
                    </div>
                </CardHeader>

                {/* ── Table ── */}
                <CardContent className="p-0">
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        { label: "No", w: "w-10", center: true },
                                        { label: "Tanggal", w: "w-[110px]" },
                                        { label: "Judul Rapat", w: "w-[220px]" },
                                        { label: "Waktu", w: "w-[110px]" },
                                        { label: "Ruangan", w: "w-[160px]" },
                                        { label: "Pemimpin", w: "w-[130px]" },
                                        { label: "Notulen", w: "w-[130px]" },
                                        { label: "Status", w: "w-[100px]" },
                                        { label: "Export", w: "w-[56px]", center: true },
                                        { label: "Aksi", w: "w-[100px]", center: true },
                                    ].map((col) => (
                                        <TableHead
                                            key={col.label}
                                            className={`${col.w} py-2.5 px-3 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 ${col.center ? "text-center" : ""}`}
                                        >
                                            {col.label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-14">
                                            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-teal-600 dark:text-teal-400" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data rapat...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : slice.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-14">
                                            <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Belum ada data rapat"}
                                            </p>
                                            {searchQuery && (
                                                <button
                                                    onClick={() => { setSearchQuery(""); setPage(1); }}
                                                    className="mt-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                                                >
                                                    Hapus pencarian
                                                </button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    slice.map((item, i) => (
                                        <TableRow
                                            key={item.id}
                                        >
                                            {/* No */}
                                            <TableCell className="px-3 py-3 text-center text-xs text-gray-400">
                                                {(safePage - 1) * PER_PAGE + i + 1}
                                            </TableCell>

                                            {/* Tanggal */}
                                            <TableCell className="px-3 py-3">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {item.tanggalFormatted}
                                                </span>
                                            </TableCell>

                                            {/* Judul Rapat */}
                                            <TableCell className="px-3 py-3">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed cursor-default">
                                                                {item.judulRapat}
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="max-w-[260px]">
                                                            <p className="text-xs">{item.judulRapat}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>

                                            {/* Waktu */}
                                            <TableCell className="px-3 py-3">
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    <Clock className="h-3 w-3 shrink-0" />
                                                    {item.waktu}
                                                </div>
                                            </TableCell>

                                            {/* Ruangan */}
                                            <TableCell className="px-3 py-3">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    {item.ruangan === "Lainnya" ? item.locationDetail : item.ruangan}
                                                </span>
                                            </TableCell>

                                            {/* Pemimpin */}
                                            <TableCell className="px-3 py-3">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">{item.pemimpin}</span>
                                            </TableCell>

                                            {/* Notulen */}
                                            <TableCell className="px-3 py-3">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">{item.notulen}</span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="px-3 py-3">
                                                <StatusBadge status={item.status} />
                                            </TableCell>

                                            {/* Export */}
                                            <TableCell className="px-3 py-3 text-center">
                                                <ExportNotulensiExcelButton meetingId={item.id} isIconOnly={true} />
                                            </TableCell>

                                            {/* Aksi */}
                                            <TableCell className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {item.status === "Selesai" ? (
                                                        <ButtonWithIcon
                                                            size="icon"
                                                            icon={<Eye className="h-3.5 w-3.5" />}
                                                            className="h-7 w-7 bg-blue-50 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-0 shadow-none"
                                                            onClick={() => handleViewNotulensi(item.id)}
                                                            title="Lihat Notulensi"
                                                        />
                                                    ) : (
                                                        <ButtonWithIcon
                                                            size="icon"
                                                            icon={<FileText className="h-3.5 w-3.5" />}
                                                            className="h-7 w-7 bg-amber-50 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-0 shadow-none"
                                                            onClick={() => handleEditNotulensi(item.id)}
                                                            title="Lanjutkan Notulensi"
                                                        />
                                                    )}
                                                    <ButtonWithIcon
                                                        size="icon"
                                                        icon={<Edit className="h-3.5 w-3.5" />}
                                                        className="h-7 w-7 bg-emerald-50 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-0 shadow-none"
                                                        onClick={() => handleEditNotulensi(item.id)}
                                                        title="Edit"
                                                    />
                                                    <DeleteDialog
                                                        meetingId={item.id}
                                                        onSuccess={fetchData}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* ── Footer / Pagination ── */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            {data.length === 0
                                ? "Tidak ada data"
                                : `Menampilkan ${rangeStart}–${rangeEnd} dari ${data.length} entri`}
                        </p>
                        {totalPages > 1 && (
                            <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
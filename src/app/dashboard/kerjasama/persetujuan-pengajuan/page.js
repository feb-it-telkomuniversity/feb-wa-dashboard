"use client";

import { useState, useEffect, useMemo } from "react";
import {
    FileCheck2,
    RefreshCcw,
    Search,
    Eye,
    Calendar,
    List,
    LayoutGrid,
    Globe,
    Building2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    FileText,
    ExternalLink,
    Send,
    User,
    Mail,
    Phone,
    ShieldCheck,
    MessageSquareText,
    DownloadCloud
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import {
    PartnershipTemplatesDialog,
    PartnershipTemplatesInline
} from "@/components/PartnershipMonitoring/partnership-templates";

// Format tanggal standar
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

const STATUS_CONFIG = {
    Submitted: {
        label: "Diajukan",
        bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
        badgeColor: "bg-blue-500",
        icon: Clock,
        desc: "Menunggu penelaahan awal oleh admin"
    },
    InReview: {
        label: "Sedang Ditinjau",
        bg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400",
        badgeColor: "bg-sky-500",
        icon: Search,
        desc: "Dokumen sedang diteliti kelayakan & klausulnya"
    },
    RevisionNeeded: {
        label: "Perlu Revisi",
        bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
        badgeColor: "bg-amber-500",
        icon: AlertTriangle,
        desc: "Memerlukan perbaikan berkas dari pengusul"
    },
    Approved: {
        label: "Disetujui",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
        badgeColor: "bg-emerald-500",
        icon: CheckCircle2,
        desc: "Pengajuan disetujui untuk proses penandatanganan"
    },
    Rejected: {
        label: "Ditolak",
        bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400",
        badgeColor: "bg-rose-500",
        icon: XCircle,
        desc: "Pengajuan tidak dapat diproses lebih lanjut"
    }
};

const DOC_TYPE_BADGES = {
    MoA: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400",
    MoU: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400",
    IA: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400",
};

export default function PersetujuanPengajuanKerjasamaPage() {
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState({
        all: 0,
        Submitted: 0,
        InReview: 0,
        RevisionNeeded: 0,
        Approved: 0,
        Rejected: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState("all");
    const [viewMode, setViewMode] = useState("table");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [decisionStatus, setDecisionStatus] = useState("");
    const [reviewNotesInput, setReviewNotesInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSubmissions = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit: 15,
                search: searchQuery.trim(),
                status: activeStatus === "all" ? "" : activeStatus
            };
            const res = await api.get("/api/partnership/submissions", { params });
            if (res.data?.success) {
                setSubmissions(res.data.data || []);
                if (res.data.stats) {
                    setStats(res.data.stats);
                }
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.totalPages || 1);
                    setCurrentPage(res.data.pagination.currentPage || 1);
                }
            }
        } catch (error) {
            console.error("Gagal mengambil daftar pengajuan kerjasama:", error);
            toast.error("Gagal memuat data pengajuan kerjasama");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubmissions(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, activeStatus]);

    const handleOpenReview = (item) => {
        setSelectedItem(item);
        setDecisionStatus(item.submissionStatus || "InReview");
        setReviewNotesInput(item.reviewNotes || "");
        setIsModalOpen(true);
    };

    const handleSaveDecision = async () => {
        if (!selectedItem) return;

        if (!decisionStatus) {
            toast.error("Silakan tentukan status keputusan");
            return;
        }

        if ((decisionStatus === "RevisionNeeded" || decisionStatus === "Rejected") && !reviewNotesInput.trim()) {
            toast.error(
                decisionStatus === "RevisionNeeded"
                    ? "Mohon berikan rincian catatan revisi yang diperlukan"
                    : "Mohon berikan alasan penolakan pengajuan"
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                submissionStatus: decisionStatus,
                reviewNotes: reviewNotesInput.trim()
            };

            const res = await api.patch(`/api/partnership/submissions/${selectedItem.id}/status`, payload);
            if (res.data?.success) {
                toast.success(`Status berhasil diubah menjadi "${STATUS_CONFIG[decisionStatus]?.label || decisionStatus}"`, {
                    description: "Notifikasi email telah dikirimkan ke pemohon & ditembuskan ke seb@telkomuniversity.ac.id"
                });
                setIsModalOpen(false);
                fetchSubmissions(currentPage);
            }
        } catch (error) {
            console.error("Gagal memperbarui status pengajuan:", error);
            toast.error(error.response?.data?.message || "Gagal memperbarui status pengajuan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileCheck2 className="h-6 w-6 text-primary" />
                        Persetujuan Pengajuan Kerjasama
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Periksa kelayakan draft dokumen kerjasama yang diajukan user, berikan review, setujui, minta revisi, atau tolak.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <PartnershipTemplatesDialog />
                    <Button
                        variant="outline"
                        onClick={() => fetchSubmissions(currentPage)}
                        disabled={isLoading}
                        className="shadow-sm border-gray-200"
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Segarkan
                    </Button>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div
                    onClick={() => setActiveStatus("all")}
                    className={cn(
                        "bg-white dark:bg-gray-800/60 rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-sm",
                        activeStatus === "all" ? "border-primary ring-1 ring-primary/30" : "border-border/60"
                    )}
                >
                    <p className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase mb-1">
                        Total Masuk
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.all || 0}
                    </p>
                </div>

                <div
                    onClick={() => setActiveStatus("Submitted")}
                    className={cn(
                        "bg-white dark:bg-gray-800/60 rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-sm",
                        activeStatus === "Submitted" ? "border-blue-500 ring-1 ring-blue-500/30" : "border-border/60"
                    )}
                >
                    <p className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase mb-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse"></span>
                        Menunggu
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                        {stats.Submitted || 0}
                    </p>
                </div>

                <div
                    onClick={() => setActiveStatus("InReview")}
                    className={cn(
                        "bg-white dark:bg-gray-800/60 rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-sm",
                        activeStatus === "InReview" ? "border-sky-500 ring-1 ring-sky-500/30" : "border-border/60"
                    )}
                >
                    <p className="text-[10px] font-semibold text-sky-600 tracking-wider uppercase mb-1">
                        Sedang Ditinjau
                    </p>
                    <p className="text-2xl font-bold text-sky-600">
                        {stats.InReview || 0}
                    </p>
                </div>

                <div
                    onClick={() => setActiveStatus("RevisionNeeded")}
                    className={cn(
                        "bg-white dark:bg-gray-800/60 rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-sm",
                        activeStatus === "RevisionNeeded" ? "border-amber-500 ring-1 ring-amber-500/30" : "border-border/60"
                    )}
                >
                    <p className="text-[10px] font-semibold text-amber-600 tracking-wider uppercase mb-1">
                        Perlu Revisi
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                        {stats.RevisionNeeded || 0}
                    </p>
                </div>

                <div
                    onClick={() => setActiveStatus("Approved")}
                    className={cn(
                        "bg-white dark:bg-gray-800/60 rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-sm",
                        activeStatus === "Approved" ? "border-emerald-500 ring-1 ring-emerald-500/30" : "border-border/60"
                    )}
                >
                    <p className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase mb-1">
                        Disetujui
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {stats.Approved || 0}
                    </p>
                </div>

                <div
                    onClick={() => setActiveStatus("Rejected")}
                    className={cn(
                        "bg-white dark:bg-gray-800/60 rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-sm",
                        activeStatus === "Rejected" ? "border-rose-500 ring-1 ring-rose-500/30" : "border-border/60"
                    )}
                >
                    <p className="text-[10px] font-semibold text-rose-600 tracking-wider uppercase mb-1">
                        Ditolak
                    </p>
                    <p className="text-2xl font-bold text-rose-600">
                        {stats.Rejected || 0}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Cari no. tiket, nama mitra, pemohon, PIC..."
                            className="pl-9 text-sm rounded-full bg-white dark:bg-gray-800/80"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Switcher */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-border/50">
                        <button
                            type="button"
                            onClick={() => setViewMode("table")}
                            className={cn(
                                "p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                                viewMode === "table"
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs"
                                    : "text-gray-500 hover:text-gray-800"
                            )}
                            title="Tampilan Tabel"
                        >
                            <List className="h-4 w-4" />
                            <span className="hidden md:inline">Tabel</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                                viewMode === "grid"
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs"
                                    : "text-gray-500 hover:text-gray-800"
                            )}
                            title="Tampilan Grid"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span className="hidden md:inline">Grid</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <RefreshCcw className="h-8 w-8 animate-spin mb-3 text-primary" />
                    <p className="text-sm">Memuat data pengajuan kerjasama...</p>
                </div>
            ) : submissions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <FileCheck2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        Tidak ada pengajuan yang ditemukan
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                        {searchQuery
                            ? `Tidak ada hasil untuk kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                            : "Belum ada pengajuan kerjasama pada filter ini."}
                    </p>
                </div>
            ) : viewMode === "table" ? (
                /* TABLE VIEW */
                <div className="bg-white dark:bg-gray-800/40 rounded-xl border border-border/70 overflow-hidden shadow-xs">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[140px] font-semibold text-xs">No. Tiket</TableHead>
                                <TableHead className="font-semibold text-xs">Mitra / Dokumen</TableHead>
                                <TableHead className="font-semibold text-xs">Pemohon & PIC</TableHead>
                                <TableHead className="font-semibold text-xs">Jenis Kegiatan</TableHead>
                                <TableHead className="font-semibold text-xs">Tanggal</TableHead>
                                <TableHead className="font-semibold text-xs">Status</TableHead>
                                <TableHead className="text-right font-semibold text-xs">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((item) => {
                                const statusCfg = STATUS_CONFIG[item.submissionStatus] || STATUS_CONFIG.Submitted;
                                const StatusIcon = statusCfg.icon;

                                return (
                                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono text-xs font-semibold text-primary">
                                            {item.ticketCode || `KS-${item.id}`}
                                        </TableCell>

                                        <TableCell>
                                            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {item.partnerName}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-[10px] px-1.5 py-0", DOC_TYPE_BADGES[item.docType] || "")}
                                                >
                                                    {item.docType || "Dokumen"}
                                                </Badge>
                                                <span className="text-[11px] text-gray-500 capitalize">
                                                    &bull; {item.scope || "Nasional"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="text-xs font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                                <User className="w-3 h-3 text-gray-400" />
                                                {item.user?.name || item.picInternal || "-"}
                                            </div>
                                            {item.user?.email && (
                                                <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    {item.user.email}
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                {Array.isArray(item.activities) && item.activities.length > 0 ? (
                                                    item.activities.slice(0, 2).map((act, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full truncate max-w-[150px]"
                                                            title={act.name || act.type}
                                                        >
                                                            {act.name || act.type}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                                {item.activities && item.activities.length > 2 && (
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        +{item.activities.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                                            {formatDate(item.createdAt)}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs font-semibold px-2.5 py-1 border flex items-center gap-1.5 w-fit shadow-2xs", statusCfg.bg)}
                                            >
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusCfg.label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleOpenReview(item)}
                                                className="bg-primary hover:bg-primary/90 text-white font-medium text-xs shadow-xs"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                                Periksa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {submissions.map((item) => {
                        const statusCfg = STATUS_CONFIG[item.submissionStatus] || STATUS_CONFIG.Submitted;
                        const StatusIcon = statusCfg.icon;

                        return (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800/60 rounded-xl p-5 border border-border/70 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs font-semibold text-primary">
                                            {item.ticketCode || `KS-${item.id}`}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs font-semibold px-2 py-0.5 border flex items-center gap-1", statusCfg.bg)}
                                        >
                                            <StatusIcon className="w-3 h-3" />
                                            {statusCfg.label}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 line-clamp-1">
                                            {item.partnerName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge
                                                variant="outline"
                                                className={cn("text-[10px] px-1.5 py-0", DOC_TYPE_BADGES[item.docType] || "")}
                                            >
                                                {item.docType || "Dokumen"}
                                            </Badge>
                                            <span className="text-xs text-gray-500 capitalize">
                                                {item.scope || "Nasional"} &bull; {item.yearIssued || "-"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1.5">
                                        <div className="flex items-center justify-between text-gray-600">
                                            <span className="text-gray-400">Pengusul:</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-200">
                                                {item.user?.name || item.picInternal || "-"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-gray-600">
                                            <span className="text-gray-400">Tgl Masuk:</span>
                                            <span>{formatDate(item.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Activities */}
                                    <div className="flex flex-wrap gap-1">
                                        {Array.isArray(item.activities) && item.activities.length > 0 ? (
                                            item.activities.slice(0, 3).map((act, i) => (
                                                <span
                                                    key={i}
                                                    className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full"
                                                >
                                                    {act.name || act.type}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Tidak ada rincian kegiatan</span>
                                        )}
                                        {item.activities && item.activities.length > 3 && (
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                +{item.activities.length - 3} lainnya
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/50 mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        PIC: {item.picInternal || "-"}
                                    </span>
                                    <Button
                                        size="sm"
                                        onClick={() => handleOpenReview(item)}
                                        className="bg-primary hover:bg-primary/90 text-white font-medium text-xs"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                        Periksa & Review
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && fetchSubmissions(currentPage - 1)}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        isActive={currentPage === p}
                                        onClick={() => fetchSubmissions(p)}
                                        className="cursor-pointer"
                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => currentPage < totalPages && fetchSubmissions(currentPage + 1)}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* MODAL PEMERIKSAAN & PERSETUJUAN */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="p-6 bg-gradient-to-r from-teal-700 to-teal-900 text-white sticky top-0 z-10 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full tracking-wider">
                                {selectedItem?.ticketCode || `KS-${selectedItem?.id}`}
                            </span>
                            <span className="text-xs text-teal-100">
                                Diajukan: {formatDate(selectedItem?.createdAt)}
                            </span>
                        </div>
                        <DialogTitle className="text-xl font-bold text-white mt-1">
                            {selectedItem?.partnerName}
                        </DialogTitle>
                        <DialogDescription className="text-teal-100 text-xs mt-0.5">
                            Pemeriksaan data pengajuan kerjasama & penetapan status
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* Section 1: Informasi Dokumen & Pemohon */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border/70 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-primary" />
                                Rincian Pengusul & Kontak
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-gray-500">Nama Pengusul:</span>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {selectedItem?.user?.name || selectedItem?.picInternal || "-"}
                                    </p>
                                    {selectedItem?.user?.email && (
                                        <p className="text-[11px] text-gray-500">{selectedItem.user.email}</p>
                                    )}
                                </div>
                                <div>
                                    <span className="text-gray-500">PIC Internal FEB:</span>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {selectedItem?.picInternal || "-"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">PIC Eksternal:</span>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {selectedItem?.picExternal || "-"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Kontak PIC Eksternal:</span>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {selectedItem?.picExternalPhone || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Info Kerjasama & Jenis Kegiatan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                Informasi Kerjasama
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                <div className="p-2.5 bg-muted/40 rounded-lg">
                                    <span className="text-gray-400 block text-[10px]">Tipe Dokumen</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedItem?.docType || "-"}</span>
                                </div>
                                <div className="p-2.5 bg-muted/40 rounded-lg">
                                    <span className="text-gray-400 block text-[10px]">Lingkup</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">{selectedItem?.scope || "-"}</span>
                                </div>
                                <div className="p-2.5 bg-muted/40 rounded-lg col-span-2 md:col-span-1">
                                    <span className="text-gray-400 block text-[10px]">Bidang Kerjasama</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedItem?.partnershipType || "-"}</span>
                                </div>
                            </div>

                            {/* Activities Chips */}
                            <div>
                                <span className="text-xs text-gray-500 block mb-1.5 font-medium">Jenis Kegiatan Kerja Sama:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.isArray(selectedItem?.activities) && selectedItem.activities.length > 0 ? (
                                        selectedItem.activities.map((act, i) => (
                                            <span
                                                key={i}
                                                className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-md font-medium"
                                            >
                                                {act.name || act.type}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Tidak ada aktivitas terdaftar</span>
                                    )}
                                </div>
                            </div>

                            {selectedItem?.notes && (
                                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs">
                                    <span className="font-bold text-amber-800 dark:text-amber-400 block mb-0.5">Catatan Pemohon:</span>
                                    <p className="text-amber-900 dark:text-amber-200 whitespace-pre-wrap">{selectedItem.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Berkas Word Dokumen Kerjasama */}
                        <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                        DOC
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm text-blue-950 dark:text-blue-100">
                                            Berkas Draft Dokumen Kerjasama
                                        </h5>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                                            Format wajib Word (.doc / .docx) yang diunggah oleh pemohon
                                        </p>
                                    </div>
                                </div>

                                {selectedItem?.docLink ? (
                                    <Button
                                        size="sm"
                                        onClick={() => window.open(selectedItem.docLink, "_blank")}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 gap-1.5 shadow-sm"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Buka Dokumen
                                    </Button>
                                ) : (
                                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500 border-gray-200">
                                        Tidak ada lampiran
                                    </Badge>
                                )}
                            </div>

                            {/* Template Acuan FEB */}
                            <PartnershipTemplatesInline activeDocType={selectedItem?.docType} className="mt-3 bg-white/70 dark:bg-black/20" />
                        </div>

                        {/* Section 4: FORM KEPUTUSAN ADMIN */}
                        <div className="border-t border-border pt-4 space-y-4">
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Tentukan Keputusan Status <span className="text-destructive">*</span>
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Pilih status persetujuan yang sesuai untuk pengajuan ini.
                                </p>
                            </div>

                            {/* 4 Status Option Cards */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    {
                                        value: "Approved",
                                        label: "Terima & Setujui",
                                        color: "border-emerald-500 bg-emerald-50 text-emerald-800",
                                        icon: CheckCircle2,
                                        desc: "Disetujui untuk penandatanganan"
                                    },
                                    {
                                        value: "InReview",
                                        label: "Sedang Ditinjau",
                                        color: "border-sky-500 bg-sky-50 text-sky-800",
                                        icon: Search,
                                        desc: "Dalam proses telaah berkas"
                                    },
                                    {
                                        value: "RevisionNeeded",
                                        label: "Minta Revisi",
                                        color: "border-amber-500 bg-amber-50 text-amber-800",
                                        icon: AlertTriangle,
                                        desc: "Perlu perbaikan oleh pemohon"
                                    },
                                    {
                                        value: "Rejected",
                                        label: "Tolak Pengajuan",
                                        color: "border-rose-500 bg-rose-50 text-rose-800",
                                        icon: XCircle,
                                        desc: "Pengajuan tidak memenuhi syarat"
                                    }
                                ].map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected = decisionStatus === opt.value;
                                    return (
                                        <div
                                            key={opt.value}
                                            onClick={() => setDecisionStatus(opt.value)}
                                            className={cn(
                                                "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2.5",
                                                isSelected
                                                    ? `${opt.color} shadow-xs font-semibold`
                                                    : "border-border/60 hover:border-gray-300 bg-white dark:bg-gray-800/40 opacity-80"
                                            )}
                                        >
                                            <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", isSelected ? "" : "text-gray-400")} />
                                            <div>
                                                <div className="text-xs font-bold">{opt.label}</div>
                                                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                                    {opt.desc}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Textarea Catatan Review / Alasan */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="reviewNotes" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        Catatan / Instruksi Revisi / Alasan{" "}
                                        {(decisionStatus === "RevisionNeeded" || decisionStatus === "Rejected") && (
                                            <span className="text-destructive">* (Wajib diisi)</span>
                                        )}
                                    </Label>
                                </div>
                                <Textarea
                                    id="reviewNotes"
                                    rows={4}
                                    placeholder={
                                        decisionStatus === "RevisionNeeded"
                                            ? "Tuliskan poin-poin yang wajib diperbaiki oleh pemohon (contoh: masa berlaku dokumen MoU harus minimal 3 tahun, mohon lampirkan klausul kerahasiaan)..."
                                            : decisionStatus === "Rejected"
                                            ? "Tuliskan alasan penolakan pengajuan kerjasama ini secara jelas..."
                                            : "Tuliskan catatan opsional atau arahan tindak lanjut..."
                                    }
                                    value={reviewNotesInput}
                                    onChange={(e) => setReviewNotesInput(e.target.value)}
                                    className="text-xs resize-none"
                                />
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-teal-600" />
                                    Catatan ini akan dikirimkan otomatis melalui email kepada pemohon & ditembuskan ke seb@telkomuniversity.ac.id.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-muted/30 border-t border-border flex items-center justify-between sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSubmitting}
                            className="text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSaveDecision}
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    Simpan Keputusan & Kirim Email
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

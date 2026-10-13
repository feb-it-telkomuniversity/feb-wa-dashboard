"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    FileText, 
    RefreshCcw, 
    Search, 
    Eye, 
    Calendar, 
    List, 
    LayoutGrid,
    Globe
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import SubmissionDetailDrawer from "@/components/PartnershipMonitoring/submission-detail-drawer";
import { PartnershipTemplatesDialog } from "@/components/PartnershipMonitoring/partnership-templates";

// Format tanggal standar id-ID
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

// Menghitung status ringkasan dokumen
function getOverallStatus(item) {
    if (item.submissionStatus === "Approved" || item.approvalDekan === "Approved" || item.approvalRektor === "Approved") {
        return { label: "Disetujui", key: "Approved", class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200" };
    }
    if (item.submissionStatus === "Rejected") {
        return { label: "Ditolak", key: "Rejected", class: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200" };
    }
    if (item.submissionStatus === "RevisionNeeded" || item.approvalWadek2 === "Returned" || item.approvalWadek1 === "Returned") {
        return { label: "Perlu Revisi", key: "RevisionNeeded", class: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200" };
    }
    if (item.submissionStatus === "InReview" || item.approvalWadek2 === "Approved" || item.approvalWadek1 === "Approved") {
        return { label: "Sedang Direview", key: "InReview", class: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200" };
    }
    return { label: "Diajukan", key: "Submitted", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" };
}

// Badge tipe dokumen
const DOC_TYPE_COLORS = {
    MoA: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200",
    MoU: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-teal-200",
    IA: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200",
};

export default function RiwayatPengajuanKerjasamaPage() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [activeView, setActiveView] = useState("table");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPartnership, setSelectedPartnership] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const itemsPerPage = 10;

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/api/partnership/my-tickets");
            if (res.data?.success && Array.isArray(res.data.data)) {
                setTickets(res.data.data);
            } else if (Array.isArray(res.data?.data)) {
                setTickets(res.data.data);
            }
        } catch (error) {
            console.error("Gagal mengambil riwayat tiket kerjasama:", error);
            toast.error("Gagal memuat riwayat pengajuan kerjasama");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Derived stats
    const stats = useMemo(() => {
        const total = tickets.length;
        const approved = tickets.filter(t => getOverallStatus(t).key === "Approved").length;
        const inReview = tickets.filter(t => getOverallStatus(t).key === "InReview").length;
        const submitted = tickets.filter(t => getOverallStatus(t).key === "Submitted").length;
        const revision = tickets.filter(t => getOverallStatus(t).key === "RevisionNeeded").length;
        const rejected = tickets.filter(t => getOverallStatus(t).key === "Rejected").length;
        return { total, approved, inReview, submitted, revision, rejected };
    }, [tickets]);

    // Filter tickets
    const filteredTickets = useMemo(() => {
        return tickets.filter((item) => {
            const q = searchQuery.toLowerCase().trim();
            const ticketCode = (item.ticketCode || item.docNumberInternal || "").toLowerCase();
            const partnerName = (item.partnerName || "").toLowerCase();
            const docType = (item.docType || "").toLowerCase();
            const pType = (item.partnershipType || "").toLowerCase();

            const matchSearch = !q || ticketCode.includes(q) || partnerName.includes(q) || docType.includes(q) || pType.includes(q);
            const statusObj = getOverallStatus(item);
            const matchFilter = activeFilter === "all" || statusObj.key === activeFilter;

            return matchSearch && matchFilter;
        });
    }, [tickets, searchQuery, activeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));
    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTickets.slice(start, start + itemsPerPage);
    }, [filteredTickets, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeFilter]);

    const handleOpenDetail = (item) => {
        setSelectedPartnership(item);
        setIsDrawerOpen(true);
    };

    return (
        <div className="space-y-6 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Riwayat Pengajuan Kerjasama
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Pantau status registrasi tiket dan proses persetujuan (Baju Surat) kemitraan Anda.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <PartnershipTemplatesDialog />
                    <Button 
                        variant="outline" 
                        onClick={fetchTickets} 
                        disabled={isLoading} 
                        className="shadow-sm"
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Segarkan
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-3.5 border border-primary/50 hover:border-teal-500/20 transition-all">
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">
                        Total Diajukan
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-3.5 border border-primary/50 hover:border-teal-500/20 transition-all">
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">
                        Dalam Review
                    </p>
                    <p className="text-2xl font-semibold text-sky-600 dark:text-sky-400">
                        {stats.inReview + stats.submitted}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-3.5 border border-primary/50 hover:border-teal-500/20 transition-all">
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">
                        Disetujui
                    </p>
                    <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                        {stats.approved}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-3.5 border border-primary/50 hover:border-teal-500/20 transition-all">
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-1">
                        Perlu Revisi
                    </p>
                    <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
                        {stats.revision}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Cari no. tiket, mitra, tipe..."
                        className="pl-9 text-sm rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {[
                        { key: "all", label: "Semua" },
                        { key: "Submitted", label: "Diajukan" },
                        { key: "InReview", label: "Review" },
                        { key: "Approved", label: "Disetujui" },
                        { key: "RevisionNeeded", label: "Perlu Revisi" },
                        { key: "Rejected", label: "Ditolak" }
                    ].map((opt) => (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => setActiveFilter(opt.key)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                activeFilter === opt.key
                                    ? "bg-teal-600 text-white border-teal-600 dark:bg-teal-500 dark:border-teal-500"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* View Toggle */}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden sm:block">
                        Tampilan
                    </span>
                    <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setActiveView("table")}
                            title="Table View"
                            aria-label="Table View"
                            className={`px-2.5 py-1.5 transition-all border-r border-gray-200 dark:border-gray-700 ${
                                activeView === "table"
                                    ? "bg-teal-600 text-white dark:bg-teal-500"
                                    : "bg-white text-gray-400 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-500 dark:hover:bg-gray-800"
                            }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveView("grid")}
                            title="Grid View"
                            aria-label="Grid View"
                            className={`px-2.5 py-1.5 transition-all ${
                                activeView === "grid"
                                    ? "bg-teal-600 text-white dark:bg-teal-500"
                                    : "bg-white text-gray-400 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-500 dark:hover:bg-gray-800"
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Table or Grid */}
            {isLoading ? (
                <div className="py-16 text-center text-sm text-gray-400 border rounded-xl bg-card">
                    <RefreshCcw className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
                    Memuat data riwayat pengajuan...
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400 border rounded-xl bg-card">
                    <FileText className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    Tidak ada pengajuan kerjasama yang cocok dengan filter atau pencarian Anda.
                </div>
            ) : activeView === "table" ? (
                <div className="rounded-xl border overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="w-12 text-center text-xs font-semibold uppercase">No</TableHead>
                                <TableHead className="w-[140px] text-xs font-semibold uppercase">No. Tiket</TableHead>
                                <TableHead className="w-[120px] text-xs font-semibold uppercase">Tanggal</TableHead>
                                <TableHead className="text-xs font-semibold uppercase">Nama Mitra</TableHead>
                                <TableHead className="w-[100px] text-center text-xs font-semibold uppercase">Tipe</TableHead>
                                <TableHead className="w-[140px] text-xs font-semibold uppercase">Bidang</TableHead>
                                <TableHead className="w-[140px] text-center text-xs font-semibold uppercase">Status</TableHead>
                                <TableHead className="w-20 text-center text-xs font-semibold uppercase">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTickets.map((item, idx) => {
                                const statusObj = getOverallStatus(item);
                                const ticketCode = item.ticketCode || item.docNumberInternal || `KS-${item.id}`;
                                return (
                                    <TableRow 
                                        key={item.id}
                                        onClick={() => handleOpenDetail(item)}
                                        className="cursor-pointer hover:bg-muted/30 transition-colors group"
                                    >
                                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                            {(currentPage - 1) * itemsPerPage + idx + 1}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                                            {ticketCode}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDate(item.createdAt || item.dateCreated)}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm text-foreground max-w-[240px] truncate">
                                            {item.partnerName}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                DOC_TYPE_COLORS[item.docType] || "bg-gray-100 text-gray-700 border-gray-200"
                                            }`}>
                                                {item.docType || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground truncate max-w-[140px]">
                                            {item.partnershipType || "-"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={`${statusObj.class} px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase border`}>
                                                {statusObj.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 group-hover:text-teal-600 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20"
                                                title="Lihat Detail"
                                                aria-label="Lihat Detail"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDetail(item);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedTickets.map((item) => {
                        const statusObj = getOverallStatus(item);
                        const ticketCode = item.ticketCode || item.docNumberInternal || `KS-${item.id}`;
                        return (
                            <div
                                key={item.id}
                                onClick={() => handleOpenDetail(item)}
                                className="flex flex-col bg-card border border-border/70 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-3 gap-2">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400">
                                            {ticketCode}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 opacity-70" />
                                            {formatDate(item.createdAt || item.dateCreated)}
                                        </span>
                                    </div>
                                    <Badge className={`${statusObj.class} px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase border`}>
                                        {statusObj.label}
                                    </Badge>
                                </div>

                                <h3 className="text-base font-semibold text-foreground line-clamp-1 mb-1">
                                    {item.partnerName}
                                </h3>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                        DOC_TYPE_COLORS[item.docType] || "bg-gray-100 text-gray-700 border-gray-200"
                                    }`}>
                                        <FileText className="w-3 h-3" />
                                        {item.docType || "Dokumen"}
                                    </span>
                                    {item.scope && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                            <Globe className="w-3 h-3" />
                                            {item.scope.toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-grow">
                                    {item.notes || "Pengajuan dokumen kemitraan resmi Fakultas Ekonomi dan Bisnis."}
                                </p>

                                <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/50 text-xs">
                                    <span className="text-muted-foreground truncate max-w-[160px]">
                                        {item.partnershipType ? `Bidang: ${item.partnershipType}` : "Kemitraan"}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs rounded-lg gap-1 border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-900/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenDetail(item);
                                        }}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Detail
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredTickets.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-border/40 gap-4">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Menampilkan {filteredTickets.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTickets.length)} dari {filteredTickets.length} pengajuan
                    </div>
                    <div className="flex justify-end">
                        <Pagination>
                            <PaginationContent className="gap-1.5">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) setCurrentPage(p => p - 1);
                                        }}
                                        className={`h-8 w-8 p-0 flex items-center justify-center rounded-md border [&>span]:hidden ${
                                            currentPage === 1 ? "pointer-events-none opacity-50 border-border" : "cursor-pointer border-border/70 hover:bg-muted"
                                        }`}
                                    />
                                </PaginationItem>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                    if (
                                        p === 1 ||
                                        p === totalPages ||
                                        (p >= currentPage - 1 && p <= currentPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={p === currentPage}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(p);
                                                    }}
                                                    className={`h-8 w-8 p-0 flex items-center justify-center rounded-md font-medium text-sm transition-colors ${
                                                        p === currentPage 
                                                            ? "bg-[#009da5] text-white hover:bg-[#008c93] hover:text-white border-transparent" 
                                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent bg-transparent"
                                                    }`}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (
                                        p === currentPage - 2 ||
                                        p === currentPage + 2
                                    ) {
                                        return <PaginationItem key={p} className="text-slate-400"><PaginationEllipsis /></PaginationItem>;
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < totalPages) setCurrentPage(p => p + 1);
                                        }}
                                        className={`h-8 w-8 p-0 flex items-center justify-center rounded-md border [&>span]:hidden ${
                                            currentPage >= totalPages ? "pointer-events-none opacity-50 border-border" : "cursor-pointer border-border/70 hover:bg-muted"
                                        }`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}

            {/* Detail Drawer Modal */}
            {selectedPartnership && (
                <SubmissionDetailDrawer
                    partnershipId={selectedPartnership.id}
                    partnership={selectedPartnership}
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    onSuccess={fetchTickets}
                />
            )}
        </div>
    );
}

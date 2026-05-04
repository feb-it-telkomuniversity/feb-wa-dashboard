"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Search,
    Eye,
    ImageIcon,
    CheckCircle2,
    AlignJustify,
    AlignCenter,
    Menu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios"

const DENSITY_OPTIONS = [
    {
        key: "compact",
        label: "Compact",
        icon: AlignJustify,
        cellClass: "py-1.5 px-3",
        headClass: "py-2 px-3",
        textSize: "text-xs",
        avatarSize: "w-5 h-5 text-[9px]",
    },
    {
        key: "comfortable",
        label: "Comfortable",
        icon: AlignCenter,
        cellClass: "py-2.5 px-3",
        headClass: "py-2.5 px-3",
        textSize: "text-sm",
        avatarSize: "w-6 h-6 text-[10px]",
    },
    {
        key: "spacious",
        label: "Spacious",
        icon: Menu,
        cellClass: "py-4 px-3",
        headClass: "py-3.5 px-3",
        textSize: "text-sm",
        avatarSize: "w-8 h-8 text-xs",
    },
];

// ─── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
    Submitted: { styleClass: "bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400", label: "Submitted" },
    InProgress: { styleClass: "bg-sky-100 text-sky-600 border-0 dark:bg-sky-800/30 dark:text-sky-300", label: "In Progress" },
    AssignedToUnit: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
    WaitingApproval: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Waiting Approval" },
    RevisionNeeded: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
    Resolved: { styleClass: "bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Resolved" },
    Rejected: { styleClass: "bg-red-100 text-red-800 border-0 dark:bg-red-900/30 dark:text-red-400", label: "Rejected" },
    Cancelled: { styleClass: "bg-gray-100 text-gray-800 border-0 dark:bg-gray-900/30 dark:text-gray-400", label: "Cancelled" },
}

// ─── Category config ───────────────────────────────────────────────
const CATEGORY_CONFIG = {
    Akademik: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    Fasilitas: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    Kemahasiswaan: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

// ─── Filter pills ──────────────────────────────────────────────────
const FILTER_OPTIONS = [
    { key: "all", label: "Semua" },
    { key: "Resolved", label: "Resolved" },
    { key: "InProgress", label: "In Progress" },
    { key: "Submitted", label: "Submitted" },
    { key: "Rejected", label: "Rejected" },
];

// ─── Helpers ───────────────────────────────────────────────────────
function getInitials(name = "") {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateString));
}

function getStatusBadge(status) {
    const config = STATUS_CONFIG[status] ?? {
        label: status,
        styleClass: "bg-gray-100 text-gray-600 border-0",
    };
    return (
        <Badge
            className={`${config.styleClass} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full`}
        >
            {config.label}
        </Badge>
    );
}

// ─── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, valueClass = "" }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-1">
                {label}
            </p>
            <p className={`text-2xl font-semibold ${valueClass} text-gray-900 dark:text-gray-100`}>
                {value}
            </p>
        </div>
    );
}

// ─── Avatar ────────────────────────────────────────────────────────
function Avatar({ name, sizeClass = "w-6 h-6 text-[10px]" }) {
    return (
        <div
            className={`${sizeClass} rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center font-semibold text-teal-700 dark:text-teal-400 flex-shrink-0`}
        >
            {getInitials(name)}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────
export default function MonitoringLaporanPage() {
    const [tickets, setTickets] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [activeDensity, setActiveDensity] = useState("comfortable");

    const density = DENSITY_OPTIONS.find((d) => d.key === activeDensity) ?? DENSITY_OPTIONS[1];

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await api.get("/api/halodekan/dekan/tickets");
                if (res.data?.success) {
                    setTickets(res.data.data);
                }
            } catch (error) {
                console.error("Gagal mengambil data tiket:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTickets();
    }, []);

    // ── Derived stats ──────────────────────────────────────────────
    const stats = {
        total: tickets.length,
        resolved: tickets.filter((t) => t.status === "Resolved").length,
        inProgress: tickets.filter((t) => t.status === "InProgress").length,
        pending: tickets.filter(
            (t) => t.status !== "Resolved" && t.status !== "InProgress"
        ).length,
    };

    // ── Filtered tickets ───────────────────────────────────────────
    const filteredTickets = tickets.filter((ticket) => {
        const matchSearch =
            ticket.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter =
            activeFilter === "all" || ticket.status === activeFilter;
        return matchSearch && matchFilter;
    });

    const handleRowClick = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-950 min-h-screen">

            {/* ── Header ── */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    Rekapitulasi Laporan Halo Dekan
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Daftar seluruh pengaduan dan status penyelesaiannya.
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label="Total Laporan" value={stats.total} />
                <StatCard
                    label="Resolved"
                    value={stats.resolved}
                    valueClass="!text-emerald-600 dark:!text-emerald-400"
                />
                <StatCard
                    label="In Progress"
                    value={stats.inProgress}
                    valueClass="!text-blue-600 dark:!text-blue-400"
                />
                <StatCard
                    label="Belum Ditangani"
                    value={stats.pending}
                    valueClass="!text-amber-600 dark:!text-amber-400"
                />
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Search */}
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Cari kode, kategori, atau nama..."
                        className="pl-9 text-sm rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {FILTER_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => setActiveFilter(opt.key)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeFilter === opt.key
                                ? "bg-teal-600 text-white border-teal-600 dark:bg-teal-500 dark:border-teal-500"
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800"
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Density toggle */}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden sm:block">
                        Tampilan
                    </span>
                    <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {DENSITY_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.key}
                                    onClick={() => setActiveDensity(opt.key)}
                                    title={opt.label}
                                    className={`px-2.5 py-1.5 transition-all border-r last:border-r-0 border-gray-200 dark:border-gray-700 ${activeDensity === opt.key
                                        ? "bg-teal-600 text-white dark:bg-teal-500"
                                        : "bg-white text-gray-400 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-500 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                        <TableRow>
                            {[
                                { label: "No", width: "w-10" },
                                { label: "Kode Tiket", width: "w-[120px]" },
                                { label: "Tanggal", width: "w-[110px]" },
                                { label: "Pelapor", width: "w-[90px]" },
                                { label: "Kategori", width: "w-[120px]" },
                                { label: "Isi Laporan", width: "w-[220px]" },
                                { label: "Ditangani Oleh", width: "w-[130px]" },
                                { label: "Status", width: "w-[100px]", center: true },
                                { label: "", width: "w-10" },
                            ].map((col) => (
                                <TableHead
                                    key={col.label}
                                    className={`${col.width} ${density.headClass} text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.center ? "text-center" : ""}`}
                                >
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="text-center py-12 text-sm text-gray-400"
                                >
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : filteredTickets.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="text-center py-12 text-sm text-gray-400"
                                >
                                    Tidak ada data laporan yang sesuai.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTickets.map((ticket, i) => (
                                <TableRow
                                    key={ticket.id}
                                    onClick={() => handleRowClick(ticket)}
                                    className="hover:bg-teal-50/50 dark:hover:bg-teal-900/10 cursor-pointer transition-colors"
                                >
                                    {/* No */}
                                    <TableCell className={`${density.cellClass} ${density.textSize} text-gray-400 font-mono`}>
                                        {i + 1}
                                    </TableCell>

                                    {/* Kode Tiket */}
                                    <TableCell className={`${density.cellClass} font-mono ${density.textSize} font-semibold text-teal-600 dark:text-teal-400`}>
                                        {ticket.ticketCode}
                                    </TableCell>

                                    {/* Tanggal */}
                                    <TableCell className={`${density.cellClass} ${density.textSize} text-gray-500 dark:text-gray-400`}>
                                        {formatDate(ticket.createdAt)}
                                    </TableCell>

                                    {/* Pelapor */}
                                    <TableCell className={`${density.cellClass}`}>
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                name={ticket.user?.name || ticket.name || "?"}
                                                sizeClass={density.avatarSize}
                                            />
                                            <span className={`${density.textSize} font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]`}>
                                                {ticket.user?.name || ticket.name || "Anonim"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Kategori */}
                                    <TableCell className={`${density.cellClass}`}>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${CATEGORY_CONFIG[ticket.category] ??
                                                "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {ticket.category}
                                        </span>
                                    </TableCell>

                                    {/* Isi Laporan */}
                                    <TableCell className={`${density.cellClass} ${density.textSize} text-gray-500 dark:text-gray-400 max-w-[220px] truncate`}>
                                        {ticket.description}
                                    </TableCell>

                                    {/* Ditangani Oleh */}
                                    <TableCell className={`${density.cellClass}`}>
                                        {ticket.assignedTo ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium dark:bg-blue-900/20 dark:text-blue-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                {ticket.assignedTo.name}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-gray-400 italic">
                                                Belum ditugaskan
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className={`${density.cellClass} text-center`}>
                                        {getStatusBadge(ticket.status)}
                                    </TableCell>

                                    {/* Action */}
                                    <TableCell className={`${density.cellClass}`}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors cursor-pointer"
                                            title="Lihat Detail"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(ticket);
                                            }}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── Modal Detail ── */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                    {selectedTicket && (
                        <>
                            <DialogHeader className="border-b pb-4 mb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <DialogTitle className="text-xl font-bold text-teal-600 dark:text-teal-400 font-mono mb-1">
                                            {selectedTicket.ticketCode}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Dilaporkan oleh:{" "}
                                            <span className="font-medium">
                                                {selectedTicket.user?.name || selectedTicket.name}
                                            </span>{" "}
                                            &bull; {formatDate(selectedTicket.createdAt)}
                                        </DialogDescription>
                                    </div>
                                    {getStatusBadge(selectedTicket.status)}
                                </div>
                            </DialogHeader>

                            <div className="space-y-5">
                                {/* Deskripsi */}
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                        Detail Laporan &mdash; {selectedTicket.category}
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-gray-100 dark:border-gray-800 leading-relaxed">
                                        {selectedTicket.description}
                                    </div>
                                </div>

                                {/* Foto Laporan */}
                                {selectedTicket.attachmentUrl?.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                            <ImageIcon className="h-3.5 w-3.5" />
                                            Foto Laporan
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedTicket.attachmentUrl.map((url, i) => (
                                                <img
                                                    key={i}
                                                    src={url}
                                                    alt="Lampiran"
                                                    className="rounded-lg object-cover w-full h-32 border border-gray-200 dark:border-gray-700"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tindak Lanjut */}
                                {selectedTicket.assignedTo && (
                                    <div className="bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100 dark:border-teal-900">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5 mb-3">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Tindak Lanjut &mdash; {selectedTicket.assignedTo.name}
                                        </h4>

                                        {selectedTicket.actionNote && (
                                            <div className="mb-3">
                                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                                    Catatan Penugasan
                                                </span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {selectedTicket.actionNote}
                                                </p>
                                            </div>
                                        )}

                                        {selectedTicket.resolutionNote && (
                                            <div className="mb-3">
                                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                                    Catatan Penyelesaian
                                                </span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                                    {selectedTicket.resolutionNote}
                                                </p>
                                            </div>
                                        )}

                                        {selectedTicket.resolutionProofUrls?.length > 0 && (
                                            <div className="mt-3">
                                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                                                    Bukti Perbaikan
                                                </span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {selectedTicket.resolutionProofUrls.map((url, i) => (
                                                        <img
                                                            key={i}
                                                            src={url}
                                                            alt="Bukti Selesai"
                                                            className="rounded-lg object-cover w-full h-32 border border-emerald-200 dark:border-emerald-800"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
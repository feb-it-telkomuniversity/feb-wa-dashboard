"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    Search,
    Eye,
    Filter,
    RefreshCcw,
    TicketIcon,
    CalendarIcon,
    UserCircle2,
    InboxIcon,
    ChevronRight,
    MessageSquare,
    LinkIcon,
    Save
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import AttachmentGallery from "@/components/HaloDekan/AttachmentGallery";

const STATUS_OPTIONS = [
    { value: "InProgress", label: "In Progress" },
    { value: "Resolved", label: "Resolved" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Rejected", label: "Rejected" },
]

export default function VerifikasiLaporanPage() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Triage state
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [triageForm, setTriageForm] = useState({
        status: "",
        actionNote: ""
    });

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/api/halodekan/admin/tickets");
            const data = res.data?.data || res.data || [];

            const ticketArray = Array.isArray(data) ? data : [];

            // Sort by latest first (descending id/createdAt)
            ticketArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setTickets(ticketArray);
            setFilteredTickets(ticketArray);

            // Update selected ticket data if it exists
            if (selectedTicket) {
                const updatedSelected = ticketArray.find(t => t.id === selectedTicket.id);
                if (updatedSelected) {
                    setSelectedTicket(updatedSelected);
                    setTriageForm({
                        status: updatedSelected.status || "",
                        actionNote: updatedSelected.actionNote || ""
                    });
                }
            }
        } catch (err) {
            console.error("Gagal fetching tiket admin:", err);
            toast.error("Gagal memuat daftar tiket pengaduan");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Fitur Filter / Search Lokal
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredTickets(tickets);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = tickets.filter(
            (t) =>
                t.ticketCode?.toLowerCase().includes(query) ||
                t.category?.toLowerCase().includes(query) ||
                t.user?.name?.toLowerCase().includes(query)
        );
        setFilteredTickets(filtered);
    }, [searchQuery, tickets]);

    const selectTicket = (ticket) => {
        setSelectedTicket(ticket);
        setTriageForm({
            status: ticket.status || "",
            actionNote: ticket.actionNote || ""
        });
    };

    const handleTriageSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTicket) return;

        try {
            setIsUpdating(true);

            const payload = {
                status: triageForm.status,
                actionNote: triageForm.actionNote
            };

            await api.patch(`/api/halodekan/admin/tickets/${selectedTicket.id}/triage`, payload);

            toast.success(`Tiket ${selectedTicket.ticketCode} berhasil dialihkan!`, {
                position: 'top-center',
                style: { background: "#22c55e", color: "#fff" },
                iconTheme: { primary: "#22c55e", secondary: "#fff" }
            });

            // Refresh tickets implicitly to get latest data
            await fetchTickets();
        } catch (err) {
            console.error("Gagal update tiket:", err);
            const errorMessage = err?.response?.data?.message || "Terjadi kesalahan saat memproses tiket";
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Submitted: { styleClass: "bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400", label: "Submitted" },
            InProgress: { styleClass: "bg-sky-100 text-sky-600 border-0 dark:bg-sky-800/30 dark:text-sky-300", label: "In Progress" },
            AssignedToUnit: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
            WaitingApproval: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Waiting Approval" },
            RevisionNeeded: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Revision Needed" },
            Resolved: { styleClass: "bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Resolved" },
            Rejected: { styleClass: "bg-red-100 text-red-800 border-0 dark:bg-red-900/30 dark:text-red-400", label: "Rejected" },
            Cancelled: { styleClass: "bg-gray-100 text-gray-800 border-0 dark:bg-gray-900/30 dark:text-gray-400", label: "Cancelled" },
        }

        const config = statusConfig[status] || { styleClass: "bg-gray-500 text-white", label: status || "Unknown" };

        return (
            <Badge className={`${config.styleClass} px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase shadow-none border-none`}>
                {config.label}
            </Badge>
        )
    }

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const options = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        };
        if (includeTime) {
            options.hour = "2-digit";
            options.minute = "2-digit";
        }
        return new Intl.DateTimeFormat("id-ID", options).format(date);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <InboxIcon className="h-8 w-8 text-primary/80" />
                        Verifikasi & Triage Laporan
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Sortir, perbarui status, dan tindak lanjuti tiket pengajuan dengan cepat.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchTickets} disabled={isLoading} className="shadow-sm">
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Segarkan Data
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">

                {/* LEFT PANEL: MASTER */}
                <div className="w-full lg:w-[30%] flex flex-col bg-card/40 border border-border/50 rounded-xl shadow-sm overflow-hidden backdrop-blur-sm shrink-0">
                    <div className="p-4 border-b border-border/50 bg-muted/20">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari berdasarkan tiket, kategori, atau nama..."
                                className="pl-9 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/30 rounded-full h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-3 px-1">
                            <span className="text-xs font-medium text-muted-foreground">
                                Menampilkan {filteredTickets.length} tiket
                            </span>
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                <p className="text-sm">Memuat daftar tiket...</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <InboxIcon className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                                <p className="text-sm font-medium text-foreground">Kosong</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tidak ada tiket ditemukan.
                                </p>
                            </div>
                        ) : (
                            filteredTickets.map((ticket) => {
                                const isSelected = selectedTicket?.id === ticket.id;

                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => selectTicket(ticket)}
                                        className={`
                      cursor-pointer group relative overflow-hidden transition-all duration-200 border rounded-xl p-3 
                      flex flex-col gap-2.5
                      ${isSelected
                                                ? "bg-primary/[0.05] border-primary/40 shadow-sm ring-1 ring-primary/20"
                                                : "bg-background border-border shadow-sm hover:border-primary/30 hover:bg-muted/10"}
                    `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs font-semibold text-primary/80 mb-1">{ticket.ticketCode}</span>
                                                <span className="font-semibold text-foreground text-sm line-clamp-1">{ticket.category}</span>
                                            </div>
                                            {getStatusBadge(ticket.status)}
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                                                <span>{formatDate(ticket.createdAt)}</span>
                                            </div>

                                            <div className={`p-1 rounded-full transition-colors ${isSelected ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:bg-muted group-hover:text-foreground"}`}>
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>


                {/* RIGHT PANEL: DETAIL & TRIAGE */}
                <div className="w-full lg:w-[65%] flex flex-col min-h-0 bg-card border border-border/50 rounded-xl shadow-md overflow-hidden shrink-0 relative">
                    {!selectedTicket ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                                <TicketIcon className="h-10 w-10 text-muted-foreground/60" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Tidak Ada Tiket Terpilih</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                Silakan pilih salah satu tiket dari panel sebelah kiri untuk melihat detail lengkap dan melakukan proses verifikasi (Triage).
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden">

                            {/* Detail Header */}
                            <div className="border-b border-border p-5 bg-background shrink-0 flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold font-mono text-primary">{selectedTicket.ticketCode}</h2>
                                        {getStatusBadge(selectedTicket.status)}
                                    </div>
                                    <h3 className="text-base font-semibold text-foreground">{selectedTicket.category}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <CalendarIcon className="h-4 w-4" />
                                            {formatDate(selectedTicket.createdAt, true)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-muted/5">
                                <div className="grid gap-6">

                                    {/* User Profile Card */}
                                    <Card className="shadow-none border-border/60 bg-background/50">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <UserCircle2 className="h-7 w-7 text-primary" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-foreground truncate">{selectedTicket.user?.name || "User Tidak Diketahui"}</span>
                                                <span className="text-xs text-muted-foreground truncate">{selectedTicket.user?.email || "-"}</span>
                                                <span className="text-[10px] uppercase font-bold text-primary tracking-wider mt-1 w-fit bg-primary/10 px-2 py-0.5 rounded-full">
                                                    {selectedTicket.user?.role || "-"}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Deskripsi */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                            Deskripsi Pengaduan
                                        </Label>
                                        <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                            {selectedTicket.description || "Tidak ada deskripsi."}
                                        </div>
                                    </div>

                                    {/* Attachment */}
                                    <AttachmentGallery urls={selectedTicket.attachmentUrl} />
                                    <hr className="border-border/50" />

                                    {selectedTicket.assignedTo && (
                                        <div className="flex items-center gap-2 mt-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                                            <span className="text-sm font-medium text-zinc-400">ditangani oleh:</span>
                                            <Badge className="bg-primary text-primary-foreground border-none hover:bg-[#dcb38f]/30">
                                                {selectedTicket.assignedTo.name}
                                            </Badge>
                                        </div>
                                    )}

                                    {/* FORM TRIAGE */}
                                    <div className="space-y-5">
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">Triage Action</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Ubah status pengaduan dan berikan catatan terkait tindakan yang dilakukan.
                                            </p>
                                        </div>

                                        <form id="triage-form" onSubmit={handleTriageSubmit} className="space-y-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status Baru *</Label>
                                                <Select
                                                    value={triageForm.status}
                                                    onValueChange={(val) => setTriageForm(prev => ({ ...prev, status: val }))}
                                                >
                                                    <SelectTrigger className="w-full bg-background">
                                                        <SelectValue placeholder="Pilih status saat ini" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="actionNote">Catatan Tindakan (Opsional)</Label>
                                                <Textarea
                                                    id="actionNote"
                                                    placeholder="Mencatat rencana dari tim Dekanat untuk menyelesaikan laporan ini..."
                                                    value={triageForm.actionNote}
                                                    onChange={(e) => setTriageForm(prev => ({ ...prev, actionNote: e.target.value }))}
                                                    rows={4}
                                                    className="bg-background"
                                                />
                                            </div>
                                        </form>
                                    </div>

                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="border-t border-border p-4 bg-background shrink-0 flex items-center justify-end gap-3">
                                <Button
                                    type="submit"
                                    form="triage-form"
                                    disabled={isUpdating}
                                    className="bg-primary hover:bg-[#c41a20]"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* Scrollbar overrides specific to this complex view to keep it clean */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
        </div>
    );
}
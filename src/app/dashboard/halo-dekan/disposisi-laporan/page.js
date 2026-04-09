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
    Filter,
    RefreshCcw,
    TicketIcon,
    CalendarIcon,
    UserCircle2,
    InboxIcon,
    ChevronRight,
    MessageSquare,
    Save,
    CheckCircle2,
    Send
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import AttachmentGallery from "@/components/HaloDekan/AttachmentGallery";

export default function DisposisiLaporanPage() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Selected state
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Forms
    const [assignForm, setAssignForm] = useState({
        assignedToId: "",
        actionNote: ""
    });

    const [approveForm, setApproveForm] = useState({
        status: "",
        actionNote: ""
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [resTickets, resUsers] = await Promise.all([
                api.get("/api/halodekan/dekan/tickets"),
                api.get("/api/users")
            ])

            const ticketArray = Array.isArray(resTickets.data?.data) ? resTickets.data.data : [];
            ticketArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            const usersArray = Array.isArray(resUsers.data?.users) ? resUsers.data.users : [];
            const nonMahasiswaUsers = usersArray.filter((u) => u.role !== "mahasiswa");

            setTickets(ticketArray);
            setFilteredTickets(ticketArray);
            setUsersList(nonMahasiswaUsers);

            // Update selected ticket in case it changed Status
            if (selectedTicket) {
                const updatedSelected = ticketArray.find(t => t.id === selectedTicket.id);
                if (updatedSelected) {
                    setSelectedTicket(updatedSelected);
                    // Reset forms based on new status if needed
                    setAssignForm({ assignedToId: updatedSelected.assignedToId || "", actionNote: "" });
                    setApproveForm({ status: "", actionNote: "" });
                }
            }
        } catch (err) {
            console.error("Gagal fetching data dekan:", err);
            toast.error("Gagal memuat data disposisi laporan", {
                position: 'top-center',
                style: { background: "#ef4444", color: "#fff" },
                iconTheme: { primary: "#ef4444", secondary: "#fff" }
            })
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter tickets
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
        setAssignForm({
            assignedToId: ticket.assignedToId ? ticket.assignedToId.toString() : "",
            actionNote: ""
        });
        setApproveForm({
            status: "",
            actionNote: ""
        });
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTicket || !assignForm.assignedToId) return;

        try {
            setIsUpdating(true);
            await api.patch(`/api/halodekan/dekan/tickets/${selectedTicket.id}/assign`, {
                assignedToId: assignForm.assignedToId,
                actionNote: assignForm.actionNote
            });

            toast.success(`Tiket ${selectedTicket.ticketCode} berhasil ditugaskan!`, {
                position: 'top-center',
                style: { background: "#22c55e", color: "#fff" },
                iconTheme: { primary: "#22c55e", secondary: "#fff" }
            })
            await fetchData();
        } catch (err) {
            console.error("Gagal assign:", err);
            toast.error(err?.response?.data?.message || "Gagal menugaskan tiket ke unit terkait.", {
                position: 'top-center',
                style: { background: "#ef4444", color: "#fff" },
                iconTheme: { primary: "#ef4444", secondary: "#fff" }
            })
        } finally {
            setIsUpdating(false);
        }
    };

    const handleApproveSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTicket || !approveForm.status) return;

        try {
            setIsUpdating(true);
            await api.patch(`/api/halodekan/dekan/tickets/${selectedTicket.id}/approve`, {
                status: approveForm.status,
                actionNote: approveForm.actionNote
            });

            toast.success(`Keputusan untuk tiket ${selectedTicket.ticketCode} berhasil dikirim!`, {
                position: 'top-center',
                style: { background: "#22c55e", color: "#fff" },
                iconTheme: { primary: "#22c55e", secondary: "#fff" }
            })
            await fetchData();
        } catch (err) {
            console.error("Gagal approve:", err);
            toast.error(err?.response?.data?.message || "Gagal memproses persetujuan.", {
                position: 'top-center',
                style: { background: "#ef4444", color: "#fff" },
                iconTheme: { primary: "#ef4444", secondary: "#fff" }
            })
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Submitted: { styleClass: "bg-slate-500 text-white", label: "Submitted" },
            InProgress: { styleClass: "bg-blue-500 text-white", label: "In Progress" },
            EscalatedToDean: { styleClass: "bg-orange-500 text-white", label: "Perlu Tinjauan Dekan" },
            WaitingDeanApproval: { styleClass: "bg-yellow-500 text-white", label: "Menunggu Acc Dekan" },
            RevisionNeeded: { styleClass: "bg-rose-500 text-white", label: "Perlu Revisi Unit" },
            Resolved: { styleClass: "bg-green-500 text-white", label: "Resolved" },
            Cancelled: { styleClass: "bg-red-500 text-white", label: "Cancelled" },
        }

        const config = statusConfig[status] || { styleClass: "bg-gray-500 text-white", label: status || "Unknown" };

        return (
            <Badge className={`${config.styleClass} px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase shadow-none border-none`}>
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const options = { day: "2-digit", month: "short", year: "numeric" };
        if (includeTime) {
            options.hour = "2-digit";
            options.minute = "2-digit";
        }
        return new Intl.DateTimeFormat("id-ID", options).format(date);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <InboxIcon className="h-8 w-8 text-primary/80" />
                        Disposisi Laporan Khusus Dekan
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tinjau laporan, delegasikan ke unit terkait, dan konfirmasi penyelesaian.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={isLoading} className="shadow-sm">
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Segarkan Data
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
                {/* LEFT PANEL: MASTER LIST (35%) */}
                <div className="w-full lg:w-[30%] flex flex-col bg-card/40 border border-border/50 rounded-xl shadow-sm overflow-hidden backdrop-blur-sm shrink-0">
                    <div className="p-4 border-b border-border/50 bg-muted/20">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari berdasarkan tiket, kategori..."
                                className="pl-9 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/30 rounded-full h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-3 px-1">
                            <span className="text-xs font-medium text-muted-foreground">
                                {filteredTickets.length} Tiket Menunggu Arahan Dekan
                            </span>
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                <p className="text-sm">Memuat prioritas tiket...</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <CheckCircle2 className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                                <p className="text-sm font-medium text-foreground">Selesai</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tidak ada tiket yang memerlukan atensi Dekan saat ini.
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
                                        <div className="flex justify-between items-start gap-1">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-mono text-xs font-semibold text-primary/80 mb-1">{ticket.ticketCode}</span>
                                                <span className="font-semibold text-foreground text-sm line-clamp-1">{ticket.category}</span>
                                            </div>
                                            <div className="shrink-0">{getStatusBadge(ticket.status)}</div>
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

                {/* RIGHT PANEL: DETAIL VIEW (65%) */}
                <div className="w-full lg:w-[65%] flex flex-col min-h-0 bg-card border border-border/50 rounded-xl shadow-md overflow-hidden shrink-0 relative">
                    {!selectedTicket ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                                <TicketIcon className="h-10 w-10 text-muted-foreground/60" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Tidak Ada Tiket Terpilih</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                Silakan pilih salah satu tiket dari panel sebelah kiri untuk meninjau laporan dan memberikan instruksi (Disposisi).
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Header Panel Detail */}
                            <div className="border-b border-border p-5 bg-background shrink-0 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold font-mono text-primary">{selectedTicket.ticketCode}</h2>
                                        {getStatusBadge(selectedTicket.status)}
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-foreground">{selectedTicket.category}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-4 w-4" />
                                        {formatDate(selectedTicket.createdAt, true)}
                                    </span>
                                </div>
                            </div>

                            {/* Scrollable Content Detail */}
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-card/50">
                                <div className="space-y-6">

                                    {/* Data Pelapor */}
                                    <Card className="shadow-none border-border/60 bg-muted/10">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <UserCircle2 className="h-7 w-7 text-primary" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-foreground truncate">{selectedTicket.user?.name || "User Tidak Diketahui"}</span>
                                                <span className="text-[10px] uppercase font-bold text-primary tracking-wider mt-1 w-fit bg-primary/10 px-2 py-0.5 rounded-full">
                                                    Pelapor
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Deskripsi */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                            Detail Laporan Pengaduan
                                        </Label>
                                        <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                                            {selectedTicket.description || "Tidak ada deskripsi rinci."}
                                        </div>
                                    </div>

                                    <AttachmentGallery urls={selectedTicket.attachmentUrl} />

                                    <hr className="border-border/60" />

                                    {/* FORM CONDITIONAL (ASSIGN OR APPROVE) */}
                                    <div className="space-y-5 pb-4">
                                        {selectedTicket.status === "EscalatedToDean" && (
                                            <>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">Disposisi & Penugasan</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Tentukan unit mana yang bertanggung jawab untuk menangani aduan ini.
                                                    </p>
                                                </div>

                                                <form id="assign-form" onSubmit={handleAssignSubmit} className="space-y-5 bg-background p-5 rounded-xl border border-primary/20 shadow-sm ring-1 ring-primary/5">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="assignUser">Tugaskan Laporan Ini Kepada *</Label>
                                                        <Select
                                                            value={assignForm.assignedToId}
                                                            onValueChange={(val) => setAssignForm(prev => ({ ...prev, assignedToId: val }))}
                                                        >
                                                            <SelectTrigger className="w-full bg-background border-primary/30">
                                                                <SelectValue placeholder="Pilih Penanggung Jawab / Unit (misal: Kaur Akademik)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {usersList.length > 0 ? (
                                                                    usersList.map((user) => (
                                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                                            {user.name} <span className="text-muted-foreground uppercase text-[10px] ml-2">({user.role})</span>
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <SelectItem value="loading" disabled>Memuat user...</SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="assignNote">Arahan Tambahan (Opsional)</Label>
                                                        <Textarea
                                                            id="assignNote"
                                                            placeholder="Berikan instruksi khusus kepada unit yang ditunjuk terkait penyelesaian masalah ini..."
                                                            value={assignForm.actionNote}
                                                            onChange={(e) => setAssignForm(prev => ({ ...prev, actionNote: e.target.value }))}
                                                            rows={3}
                                                            className="bg-background"
                                                        />
                                                    </div>
                                                </form>
                                            </>
                                        )}

                                        {selectedTicket.status === "WaitingDeanApproval" && (
                                            <>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">Persetujuan Evaluasi Akhir</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Unit terkait telah memberikan laporannya. Keputusan penyelesaian ada di tangan Anda.
                                                    </p>
                                                </div>

                                                <form id="approve-form" onSubmit={handleApproveSubmit} className="space-y-5 bg-background p-5 rounded-xl border border-primary/20 shadow-sm ring-1 ring-primary/5">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="approveStatus">Keputusan Dekan *</Label>
                                                        <Select
                                                            value={approveForm.status}
                                                            onValueChange={(val) => setApproveForm(prev => ({ ...prev, status: val }))}
                                                        >
                                                            <SelectTrigger className="w-full bg-background border-primary/30">
                                                                <SelectValue placeholder="Pilih keputusan (ACC / Revisi)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Resolved">Setujui & Selesaikan (Resolved)</SelectItem>
                                                                <SelectItem value="RevisionNeeded">Tolak & Minta Revisi Laporan</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="approveNote">Catatan Dekan</Label>
                                                        <Textarea
                                                            id="approveNote"
                                                            placeholder="Berikan alasan apabila meminta revisi atau ucapan penyelesaian..."
                                                            value={approveForm.actionNote}
                                                            onChange={(e) => setApproveForm(prev => ({ ...prev, actionNote: e.target.value }))}
                                                            rows={3}
                                                            className="bg-background"
                                                        />
                                                    </div>
                                                </form>
                                            </>
                                        )}

                                        {/* Fallback Display if not Assignable/Approvable */}
                                        {(!["EscalatedToDean", "WaitingDeanApproval"].includes(selectedTicket.status)) && (
                                            <div className="bg-muted/10 p-4 rounded-xl border border-border text-center">
                                                <p className="text-sm text-muted-foreground">
                                                    Status tiket ini adalah <strong>{selectedTicket.status}</strong> dan tidak memerlukan pengambilan aksi lebih lanjut dari pihak Dekan saat ini.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer (Only shows if forms exist and are actionable) */}
                            {["EscalatedToDean", "WaitingDeanApproval"].includes(selectedTicket.status) && (
                                <div className="border-t border-border p-4 bg-background shrink-0 flex items-center justify-end gap-3 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                                    <Button
                                        type="submit"
                                        form={selectedTicket.status === "EscalatedToDean" ? "assign-form" : "approve-form"}
                                        disabled={isUpdating}
                                        className="bg-primary hover:bg-[#c41a20]"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : selectedTicket.status === "EscalatedToDean" ? (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Tugaskan Instrusksi
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Konfirmasi Keputusan
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* Scrollbar overrides for specific split pane scroll views */}
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
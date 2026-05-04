"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Briefcase } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import TindakLanjutMasterList from "@/components/HaloDekan/TindakLanjutMasterList";
import TindakLanjutDetailPanel from "@/components/HaloDekan/TindakLanjutDetailPanel";

export default function TindakLanjutPengaduanPage() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Selected state
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form inputs untuk Unit
    const [resolutionForm, setResolutionForm] = useState({
        resolutionNote: ""
    });
    const [resolutionFiles, setResolutionFiles] = useState([]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/api/halodekan/unit/tickets");

            const ticketArray = Array.isArray(res.data?.data) ? res.data.data : [];
            ticketArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setTickets(ticketArray);
            setFilteredTickets(ticketArray);

            // Update selected ticket in case it changed Status
            if (selectedTicket) {
                const updatedSelected = ticketArray.find(t => t.id === selectedTicket.id);
                if (updatedSelected) {
                    setSelectedTicket(updatedSelected);
                    // Reset forms on success if it moved away from action needed
                    if (!["AssignedToUnit", "RevisionNeeded"].includes(updatedSelected.status)) {
                        setResolutionForm({ resolutionNote: "" });
                        setResolutionFiles([]);
                    }
                } else {
                    setSelectedTicket(null); // Just in case it was deleted
                }
            }
        } catch (err) {
            console.error("Gagal fetching tiket unit:", err);
            toast.error("Gagal memuat tugas tindak lanjut pengaduan", {
                position: 'top-center',
                style: { background: "#ef4444", color: "#fff" },
                iconTheme: { primary: "#ef4444", secondary: "#fff" }
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setResolutionForm({ resolutionNote: "" });
        setResolutionFiles([]);
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTicket) return;

        if (resolutionFiles.length === 0) {
            toast.error("Wajib menyertakan minimal 1 bukti penyelesaian!", {
                position: 'top-center',
                style: { background: "#ef4444", color: "#fff" },
                iconTheme: { primary: "#ef4444", secondary: "#fff" }
            });
            return;
        }

        try {
            setIsUpdating(true);
            let uploadedUrls = [];

            // Upload files first
            const uploadData = new FormData();
            resolutionFiles.forEach((file) => {
                uploadData.append("attachments", file);
            });

            const uploadRes = await api.post("/api/halodekan/tickets/upload-attachments", uploadData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            uploadedUrls = uploadRes.data.urls;

            // Submit completion data
            await api.patch(`/api/halodekan/unit/tickets/${selectedTicket.id}/resolve`, {
                resolutionNote: resolutionForm.resolutionNote,
                resolutionProofUrls: uploadedUrls
            });

            toast.success(`Tindak lanjut untuk ${selectedTicket.ticketCode} berhasil dikirim ke Dekan!`, {
                position: 'top-center',
                style: { background: "#22c55e", color: "#fff" },
                iconTheme: { primary: "#22c55e", secondary: "#fff" }
            });

            // Clean forms
            setResolutionForm({ resolutionNote: "" });
            setResolutionFiles([]);
            await fetchData();

        } catch (err) {
            console.error("Gagal resolve:", err);
            toast.error(err?.response?.data?.message || err?.message || "Gagal mengirim bukti penyelesaian.", {
                position: 'top-center',
                style: { background: "#ef4444", color: "#fff" },
                iconTheme: { primary: "#ef4444", secondary: "#fff" }
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            AssignedToUnit: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
            WaitingApproval: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Waiting Approval" },
            RevisionNeeded: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
            Resolved: { styleClass: "bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Resolved" },
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
                        <Briefcase className="h-8 w-8 text-primary/80" />
                        Tindak Lanjut Laporan
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Baca keluhan mahasiswa, berikan tindak lanjut, dan unggah foto/dokumen penyelesaian untuk disetujui Dekan.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={isLoading} className="shadow-sm">
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Segarkan Data
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
                <TindakLanjutMasterList
                    filteredTickets={filteredTickets}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedTicket={selectedTicket}
                    selectTicket={selectTicket}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                />

                <TindakLanjutDetailPanel
                    selectedTicket={selectedTicket}
                    isUpdating={isUpdating}
                    resolutionForm={resolutionForm}
                    setResolutionForm={setResolutionForm}
                    handleResolveSubmit={handleResolveSubmit}
                    resolutionFiles={resolutionFiles}
                    setResolutionFiles={setResolutionFiles}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                />
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
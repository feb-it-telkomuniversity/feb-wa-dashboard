"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, InboxIcon } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import DisposisiMasterList from "@/components/HaloDekan/DisposisiMasterList";
import DisposisiDetailPanel from "@/components/HaloDekan/DisposisiDetailPanel";

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

            let ticketArray = Array.isArray(resTickets.data?.data) ? resTickets.data.data : []

            const STATUS_PRIORITY = {
                InProgress: 1,
                WaitingApproval: 1,
                AssignedToUnit: 2,
                RevisionNeeded: 2,
                Resolved: 3,
                Rejected: 3,
                Cancelled: 3,
                Submitted: 3,
                Close: 3
            }

            ticketArray.sort((a, b) => {
                const priorityA = STATUS_PRIORITY[a.status] || 3;
                const priorityB = STATUS_PRIORITY[b.status] || 3;
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            const usersArray = Array.isArray(resUsers.data?.users) ? resUsers.data.users : [];
            const kaurUsers = usersArray.filter((u) =>
                u.role?.toLowerCase().includes("kaur")
            )
            setTickets(ticketArray);
            setFilteredTickets(ticketArray);
            setUsersList(kaurUsers);

            if (selectedTicket) {
                const updatedSelected = ticketArray.find(t => t.id === selectedTicket.id);
                if (updatedSelected) {
                    setSelectedTicket(updatedSelected);
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
    }

    useEffect(() => {
        fetchData()
    }, [])

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
    }

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
            Submitted: { styleClass: "bg-blue-500 text-white", label: "Submitted" },
            InProgress: { styleClass: "bg-blue-500/80 text-white", label: "In Progress" },
            AssignedToUnit: { styleClass: "bg-yellow-500 text-white", label: "Assigned to Unit" },
            WaitingApproval: { styleClass: "bg-yellow-500 text-white", label: "Waiting Approval" },
            RevisionNeeded: { styleClass: "bg-red-500 text-white", label: "Revision Needed" },
            Resolved: { styleClass: "bg-green-500 text-white", label: "Resolved" },
            Rejected: { styleClass: "bg-red-500 text-white", label: "Rejected" },
            Cancelled: { styleClass: "bg-gray-500 text-white", label: "Cancelled" },
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
                        Disposisi Laporan
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
                <DisposisiMasterList
                    filteredTickets={filteredTickets}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedTicket={selectedTicket}
                    selectTicket={selectTicket}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                />

                <DisposisiDetailPanel
                    selectedTicket={selectedTicket}
                    usersList={usersList}
                    isUpdating={isUpdating}
                    assignForm={assignForm}
                    setAssignForm={setAssignForm}
                    approveForm={approveForm}
                    setApproveForm={setApproveForm}
                    handleAssignSubmit={handleAssignSubmit}
                    handleApproveSubmit={handleApproveSubmit}
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
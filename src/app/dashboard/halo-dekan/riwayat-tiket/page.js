"use client";

import { useEffect, useState, useMemo } from "react";
import { RefreshCcw, TicketPercent, TicketIcon, CalendarIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/hash-ids";

import {
    HaloDekanToolbar,
    HaloDekanTable,
    StatusBadge,
    formatDate
} from "@/components/halo-dekan";

function RiwayatCard({ ticket, onRowClick }) {
    return (
        <div
            onClick={() => onRowClick(ticket)}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md cursor-pointer group"
        >
            <div className="flex justify-between items-start gap-2">
                <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-0.5 tracking-wider uppercase">NO. TIKET</p>
                    <p className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">{ticket.ticketCode}</p>
                </div>
                <div>
                    <StatusBadge status={ticket.status} />
                </div>
            </div>

            <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{ticket.category}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                    <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                    {formatDate(ticket.createdAt)}
                </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full rounded-lg shadow-none justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(ticket);
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail
                </Button>
            </div>
        </div>
    );
}

export default function RiwayatTiketPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Toolbar states
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [activeView, setActiveView] = useState("table");

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/api/halodekan/tickets");
            const data = res.data?.data || res.data || [];
            const rawData = Array.isArray(data) ? data : [];
            const ticketArray = rawData.map(ticket => ({
                ...ticket,
                status: ticket.status === "WaitingApproval" ? "AssignedToUnit" : ticket.status
            }));
            setTickets(ticketArray);
        } catch (err) {
            console.error("Gagal fetching tiket:", err);
            toast.error("Gagal memuat riwayat tiket");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Filter logic
    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const query = searchQuery.toLowerCase();
            const matchSearch =
                !query ||
                ticket.ticketCode?.toLowerCase().includes(query) ||
                ticket.category?.toLowerCase().includes(query);

            const matchFilter =
                activeFilter === "all" || ticket.status === activeFilter;

            return matchSearch && matchFilter;
        });
    }, [searchQuery, activeFilter, tickets]);

    const handleRowClick = (ticket) => {
        router.push(`/dashboard/halo-dekan/riwayat-tiket/${encodeId(ticket.id)}`);
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-950 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <TicketPercent className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        Riwayat Tiket
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Pantau status dan riwayat pengaduan yang sudah kamu kirimkan.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchTickets} disabled={isLoading} className="shadow-sm">
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Segarkan
                </Button>
            </div>

            {/* Toolbar */}
            <HaloDekanToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                activeView={activeView}
                setActiveView={setActiveView}
            />

            {/* Content Area */}
            {isLoading && tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <RefreshCcw className="h-10 w-10 animate-spin text-teal-500 mb-4" />
                    <p>Memuat data tiket...</p>
                </div>
            ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700">
                        <TicketIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Tidak Ada Tiket</p>
                    <p className="text-sm text-gray-500 max-w-sm mt-1">
                        Anda belum pernah mengirimkan pengaduan apa pun.
                    </p>
                </div>
            ) : (
                <>
                    {activeView === "grid" ? (
                        filteredTickets.length === 0 ? (
                            <div className="text-center p-8 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                Tidak ada tiket yang cocok dengan pencarian Anda.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredTickets.map((ticket) => (
                                    <RiwayatCard
                                        key={ticket.id || ticket.ticketCode}
                                        ticket={ticket}
                                        onRowClick={handleRowClick}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <HaloDekanTable
                                    tickets={filteredTickets}
                                    isLoading={isLoading}
                                    onRowClick={handleRowClick}
                                    type="riwayat"
                                />
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden flex flex-col gap-3">
                                {filteredTickets.length === 0 ? (
                                    <div className="text-center p-8 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                        Tidak ada tiket yang cocok dengan pencarian Anda.
                                    </div>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <RiwayatCard
                                            key={ticket.id || ticket.ticketCode}
                                            ticket={ticket}
                                            onRowClick={handleRowClick}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
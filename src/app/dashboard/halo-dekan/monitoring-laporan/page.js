"use client";

import { useState, useEffect, useMemo } from "react";
import { FileText, RefreshCcw } from "lucide-react";
import api from "@/lib/axios";
import {
    DENSITY_OPTIONS,
    StatCard,
    HaloDekanToolbar,
    HaloDekanTable,
    TicketDetailModal
} from "@/components/halo-dekan";
import { Button } from "@/components/ui/button";

export default function MonitoringLaporanPage() {
    const [tickets, setTickets] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [activeDensity, setActiveDensity] = useState("comfortable");

    const density = useMemo(() =>
        DENSITY_OPTIONS.find((d) => d.key === activeDensity) ?? DENSITY_OPTIONS[1],
        [activeDensity]);

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
    useEffect(() => {
        fetchTickets()
    }, []);

    // ── Derived stats ──────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: tickets.length,
        resolved: tickets.filter((t) => t.status === "Resolved").length,
        inProgress: tickets.filter((t) => t.status === "InProgress").length,
        pending: tickets.filter(
            (t) => t.status !== "Resolved" && t.status !== "InProgress"
        ).length,
    }), [tickets]);

    // ── Filtered tickets ───────────────────────────────────────────
    const filteredTickets = useMemo(() =>
        tickets.filter((ticket) => {
            const matchSearch =
                ticket.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchFilter =
                activeFilter === "all" || ticket.status === activeFilter;
            return matchSearch && matchFilter;
        }),
        [tickets, searchQuery, activeFilter]);

    const handleRowClick = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* ── Header ── */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Rekapitulasi Laporan Halo Dekan
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Daftar seluruh pengaduan dan status penyelesaiannya.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchTickets} disabled={isLoading} className="shadow-sm">
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Segarkan
                </Button>
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
            <HaloDekanToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                activeDensity={activeDensity}
                setActiveDensity={setActiveDensity}
            />

            {/* ── Table ── */}
            <HaloDekanTable
                tickets={filteredTickets}
                isLoading={isLoading}
                density={density}
                onRowClick={handleRowClick}
            />

            {/* ── Modal Detail ── */}
            <TicketDetailModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                ticket={selectedTicket}
            />
        </div>
    );
}
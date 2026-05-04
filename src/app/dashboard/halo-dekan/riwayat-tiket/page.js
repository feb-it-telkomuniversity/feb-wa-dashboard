"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Eye, Filter, RefreshCcw, TicketIcon, CalendarIcon } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/hash-ids";

export default function RiwayatTiketPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            // Endpoint didapat dari instruksi
            const res = await api.get("/api/halodekan/tickets");
            const data = res.data?.data || res.data || [];

            // Jika data API dalam property khusus, ini akan menangani keduanya
            const ticketArray = Array.isArray(data) ? data : [];
            setTickets(ticketArray);
            setFilteredTickets(ticketArray);
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

    // Fitur Filter / Search Lokal (Bandingkan search query dengan kode tiket atau kategori)
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredTickets(tickets);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = tickets.filter(
            (t) =>
                t.ticketCode?.toLowerCase().includes(query) ||
                t.category?.toLowerCase().includes(query)
        );
        setFilteredTickets(filtered)
    }, [searchQuery, tickets])

    const getStatusBadge = (status) => {
        const statusConfig = {
            Submitted: { styleClass: "bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400", label: "Submitted" },
            InProgress: { styleClass: "bg-sky-100 text-sky-600 border-0 dark:bg-sky-800/30 dark:text-sky-300", label: "In Progress" },
            AssignedToUnit: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
            WaitingApproval: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Waiting Approval" },
            RevisionNeeded: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
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

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <TicketIcon className="h-8 w-8 text-primary/80" />
                        Riwayat Tiket
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Pantau status dan riwayat pengaduan yang telah Anda kirimkan.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchTickets} disabled={isLoading} className="shadow-sm">
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Segarkan
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5 text-muted-foreground" />
                            Daftar Pengaduan
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari No. Tiket atau Kategori..."
                                className="pl-9 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/30 rounded-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p>Memuat data tiket...</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-border">
                                <TicketIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                            </div>
                            <p className="text-lg font-medium text-foreground">Tidak Ada Tiket</p>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                {searchQuery
                                    ? "Tidak ada tiket yang cocok dengan pencarian Anda."
                                    : "Anda belum pernah mengirimkan pengaduan apa pun."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View (Hidden on small screens) */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[80px] font-semibold text-center">No</TableHead>
                                            <TableHead className="font-semibold whitespace-nowrap">No. Tiket</TableHead>
                                            <TableHead className="font-semibold">Kategori</TableHead>
                                            <TableHead className="font-semibold">Tanggal Kirim</TableHead>
                                            <TableHead className="font-semibold text-center">Status</TableHead>
                                            <TableHead className="font-semibold text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTickets.map((ticket, index) => (
                                            <TableRow key={ticket.id || ticket.ticketCode || index} className="group transition-colors hover:bg-muted/30">
                                                <TableCell className="text-center font-medium text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-mono font-semibold text-primary">
                                                    {ticket.ticketCode}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-foreground">{ticket.category}</span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                        <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                                                        {formatDate(ticket.createdAt)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(ticket.status)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 rounded-full px-3 text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                                                        onClick={() => router.push(`/dashboard/halo-dekan/riwayat-tiket/${encodeId(ticket.id)}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1.5" />
                                                        Detail
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card List View (Hidden on medium/large screens) */}
                            <div className="md:hidden flex flex-col gap-3 p-4 bg-muted/10">
                                {filteredTickets.map((ticket) => (
                                    <div
                                        key={ticket.id || ticket.ticketCode}
                                        className="bg-background rounded-xl p-4 border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all hover:border-primary/30"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium mb-1">NO. TIKET</p>
                                                <p className="font-mono font-bold text-primary text-sm">{ticket.ticketCode}</p>
                                            </div>
                                            <div>
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-foreground">{ticket.category}</p>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                                                <CalendarIcon className="h-3 w-3" />
                                                {formatDate(ticket.createdAt)}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-border mt-1">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full rounded-lg shadow-none justify-center"
                                                onClick={() => router.push(`/dashboard/halo-dekan/riwayat-tiket/${encodeId(ticket.id)}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Lihat Detail
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
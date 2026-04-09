import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, CheckCircle2, CalendarIcon, ChevronRight } from "lucide-react";

export default function DisposisiMasterList({
    filteredTickets,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTicket,
    selectTicket,
    getStatusBadge,
    formatDate
}) {
    return (
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
    );
}

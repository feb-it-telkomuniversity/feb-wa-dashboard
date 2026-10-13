import { Eye, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, CATEGORY_CONFIG } from "./halo-dekan-helper";
import { StatusBadge, HaloDekanAvatar } from "./halo-dekan-ui";

export function HaloDekanGrid({ 
    tickets, 
    isLoading, 
    onRowClick 
}) {
    if (isLoading) {
        return (
            <div className="py-12 text-center text-sm text-gray-400 border rounded-lg">
                Memuat data...
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-gray-400 border rounded-lg">
                Tidak ada data laporan yang sesuai.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
                <div 
                    key={ticket.id}
                    onClick={() => onRowClick(ticket)}
                    className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="flex flex-col">
                            <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400">
                                {ticket.ticketCode}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(ticket.createdAt)}
                            </span>
                        </div>
                        <StatusBadge status={ticket.status} />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <HaloDekanAvatar
                            name={ticket.user?.name || ticket.name || "?"}
                            sizeClass="w-7 h-7 text-xs"
                        />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {ticket.user?.name || ticket.name || "Anonim"}
                            </span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${CATEGORY_CONFIG[ticket.category] ??
                                "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                        >
                            <Tag className="w-3 h-3" />
                            {ticket.category}
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">
                        {ticket.description}
                    </p>

                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Ditangani Oleh</span>
                            {ticket.assignedTo ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                    {ticket.assignedTo.name}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-400 italic">
                                    Belum ditugaskan
                                </span>
                            )}
                        </div>
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full text-gray-400 group-hover:text-teal-600 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20"
                            title="Lihat Detail"
                            aria-label="Lihat Detail"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRowClick(ticket);
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

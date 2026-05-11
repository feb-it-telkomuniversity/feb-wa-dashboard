import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate, CATEGORY_CONFIG } from "./halo-dekan-helper";
import { StatusBadge, HaloDekanAvatar } from "./halo-dekan-ui";

export function HaloDekanTable({ 
    tickets, 
    isLoading, 
    density, 
    onRowClick,
    type = "monitoring" // "monitoring" | "riwayat"
}) {
    const columns = type === "monitoring" ? [
        { key: "no", label: "No", width: "w-10" },
        { key: "ticketCode", label: "Kode Tiket", width: "w-[120px]" },
        { key: "date", label: "Tanggal", width: "w-[110px]" },
        { key: "reporter", label: "Pelapor", width: "w-[120px]" },
        { key: "category", label: "Kategori", width: "w-[120px]" },
        { key: "description", label: "Isi Laporan", width: "w-[220px]" },
        { key: "assignedTo", label: "Ditangani Oleh", width: "w-[150px]" },
        { key: "status", label: "Status", width: "w-[100px]", center: true },
        { key: "action", label: "", width: "w-10" },
    ] : [
        { key: "no", label: "No", width: "w-10" },
        { key: "ticketCode", label: "Kode Tiket", width: "w-[120px]" },
        { key: "category", label: "Kategori", width: "w-[150px]" },
        { key: "date", label: "Tanggal Kirim", width: "w-[150px]" },
        { key: "status", label: "Status", width: "w-[120px]", center: true },
        { key: "action", label: "Aksi", width: "w-[100px]", center: true },
    ];

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead
                                key={col.key}
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
                                colSpan={columns.length}
                                className="text-center py-12 text-sm text-gray-400"
                            >
                                Memuat data...
                            </TableCell>
                        </TableRow>
                    ) : tickets.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="text-center py-12 text-sm text-gray-400"
                            >
                                Tidak ada data laporan yang sesuai.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tickets.map((ticket, i) => (
                            <TableRow
                                key={ticket.id}
                                onClick={() => onRowClick(ticket)}
                                className="hover:bg-teal-50/50 dark:hover:bg-teal-900/10 cursor-pointer transition-colors group"
                            >
                                {/* No */}
                                <TableCell className={`${density.cellClass} ${density.textSize} text-gray-400 font-mono`}>
                                    {i + 1}
                                </TableCell>

                                {/* Kode Tiket */}
                                <TableCell className={`${density.cellClass} font-mono ${density.textSize} font-semibold text-teal-600 dark:text-teal-400`}>
                                    {ticket.ticketCode}
                                </TableCell>

                                {/* Tanggal (Monitoring) */}
                                {type === "monitoring" && (
                                    <TableCell className={`${density.cellClass} ${density.textSize} text-gray-500 dark:text-gray-400`}>
                                        {formatDate(ticket.createdAt)}
                                    </TableCell>
                                )}

                                {/* Pelapor (Monitoring) */}
                                {type === "monitoring" && (
                                    <TableCell className={`${density.cellClass}`}>
                                        <div className="flex items-center gap-2">
                                            <HaloDekanAvatar
                                                name={ticket.user?.name || ticket.name || "?"}
                                                sizeClass={density.avatarSize}
                                            />
                                            <span className={`${density.textSize} font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]`}>
                                                {ticket.user?.name || ticket.name || "Anonim"}
                                            </span>
                                        </div>
                                    </TableCell>
                                )}

                                {/* Kategori */}
                                <TableCell className={`${density.cellClass}`}>
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${CATEGORY_CONFIG[ticket.category] ??
                                            "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {ticket.category}
                                    </span>
                                </TableCell>

                                {/* Tanggal Kirim (Riwayat) */}
                                {type === "riwayat" && (
                                    <TableCell className={`${density.cellClass} ${density.textSize} text-gray-500 dark:text-gray-400`}>
                                        {formatDate(ticket.createdAt)}
                                    </TableCell>
                                )}

                                {/* Isi Laporan (Monitoring) */}
                                {type === "monitoring" && (
                                    <TableCell className={`${density.cellClass} ${density.textSize} text-gray-500 dark:text-gray-400 max-w-[220px] truncate`}>
                                        {ticket.description}
                                    </TableCell>
                                )}

                                {/* Ditangani Oleh (Monitoring) */}
                                {type === "monitoring" && (
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
                                )}

                                {/* Status */}
                                <TableCell className={`${density.cellClass} text-center`}>
                                    <StatusBadge status={ticket.status} />
                                </TableCell>

                                {/* Action */}
                                <TableCell className={`${density.cellClass} ${type === "riwayat" ? "text-center" : ""}`}>
                                    <Button
                                        variant={type === "riwayat" ? "outline" : "ghost"}
                                        size={type === "riwayat" ? "sm" : "icon"}
                                        className={`h-7 ${type === "riwayat" ? "rounded-full px-3 text-teal-600 border-teal-200 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-900/20 text-xs" : "w-7 text-gray-400 group-hover:text-teal-600 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20"} transition-colors`}
                                        title={type === "riwayat" ? "Lihat Detail" : "Lihat Detail"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRowClick(ticket);
                                        }}
                                    >
                                        <Eye className={`h-3.5 w-3.5 ${type === "riwayat" ? "mr-1.5" : ""}`} />
                                        {type === "riwayat" && "Detail"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

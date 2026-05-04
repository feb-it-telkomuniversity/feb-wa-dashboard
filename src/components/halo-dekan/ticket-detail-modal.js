import { ImageIcon, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "./halo-dekan-helper";
import { StatusBadge } from "./halo-dekan-ui";

export function TicketDetailModal({ isOpen, onOpenChange, ticket }) {
    if (!ticket) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4 mb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl font-bold text-teal-600 dark:text-teal-400 font-mono mb-1">
                                {ticket.ticketCode}
                            </DialogTitle>
                            <DialogDescription>
                                Dilaporkan oleh:{" "}
                                <span className="font-medium">
                                    {ticket.user?.name || ticket.name || "Anonim"}
                                </span>{" "}
                                &bull; {formatDate(ticket.createdAt)}
                            </DialogDescription>
                        </div>
                        <StatusBadge status={ticket.status} />
                    </div>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Deskripsi */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Detail Laporan &mdash; {ticket.category}
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-gray-100 dark:border-gray-800 leading-relaxed">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Foto Laporan */}
                    {ticket.attachmentUrl?.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Foto Laporan
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {ticket.attachmentUrl.map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt="Lampiran"
                                        className="rounded-lg object-cover w-full h-32 border border-gray-200 dark:border-gray-700"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tindak Lanjut */}
                    {ticket.assignedTo && (
                        <div className="bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100 dark:border-teal-900">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5 mb-3">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Tindak Lanjut &mdash; {ticket.assignedTo.name}
                            </h4>

                            {ticket.actionNote && (
                                <div className="mb-3">
                                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                        Catatan Penugasan
                                    </span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {ticket.actionNote}
                                    </p>
                                </div>
                            )}

                            {ticket.resolutionNote && (
                                <div className="mb-3">
                                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                        Catatan Penyelesaian
                                    </span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                        {ticket.resolutionNote}
                                    </p>
                                </div>
                            )}

                            {ticket.resolutionProofUrls?.length > 0 && (
                                <div className="mt-3">
                                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                                        Bukti Perbaikan
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ticket.resolutionProofUrls.map((url, i) => (
                                            <img
                                                key={i}
                                                src={url}
                                                alt="Bukti Selesai"
                                                className="rounded-lg object-cover w-full h-32 border border-emerald-200 dark:border-emerald-800"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

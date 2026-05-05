"use client";

import {
    ArrowRight,
    CheckCircle2,
    Clock,
    FileText,
    UserCheck,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Shared Components
import {
    formatDate,
    StatusBadge,
    CategoryBadge,
    HaloDekanAvatar
} from "./index";

import AttachmentGallery from "@/components/HaloDekan/AttachmentGallery";

// ─── Section Label ─────────────────────────────────────────────────
function SectionLabel({ icon: Icon, children }) {
    return (
        <div className="flex items-center gap-1.5 mb-2">
            {Icon && <Icon className="h-3 w-3 text-gray-400" />}
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {children}
            </span>
        </div>
    );
}

// ─── Timeline Item ─────────────────────────────────────────────────
function TimelineItem({ icon: Icon, dotClass, lineClass, title, date, children, isLast = false }) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 ${dotClass}`}>
                    <Icon className="h-2.5 w-2.5" />
                </div>
                {!isLast && (
                    <div className={`w-px flex-1 mt-1 mb-1 ${lineClass}`} />
                )}
            </div>
            <div className="flex-1 pb-4 last:pb-0 pt-0.5">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{date}</p>
                {children}
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────
export function TicketDetailModal({ isOpen, onOpenChange, ticket }) {
    if (!ticket) return null;

    const reporterName = ticket.user?.name || ticket.name || "Anonim";
    const hasAssignment = !!ticket.assignedTo;
    const isResolved = ticket.status === "Resolved";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[88vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">

                {/* ── Header ── */}
                <DialogTitle className="px-5 pt-5 pb-0">
                    {/* Top row: kode tiket + badge + close */}
                    <div className="flex items-start justify-between mb-3">
                        <span className="font-mono text-lg font-semibold text-teal-600 dark:text-teal-400 tracking-wide">
                            {ticket.ticketCode}
                        </span>
                        <div className="flex items-center gap-2">
                            <CategoryBadge category={ticket.category} />
                            <StatusBadge status={ticket.status} />
                            <button
                                onClick={() => onOpenChange(false)}
                                className="w-7 h-7 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                            >
                                &#x2715;
                            </button>
                        </div>
                    </div>

                    {/* Reporter row */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2.5 mb-4">
                        <HaloDekanAvatar name={reporterName} sizeClass="w-9 h-9 text-xs" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {reporterName}
                            </p>
                            <p className="text-[11px] text-gray-400">
                                {ticket.user?.role || "Mahasiswa"} &bull; {ticket.user?.username || ticket.name}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-[11px] text-gray-400">{formatDate(ticket.createdAt)}</p>
                        </div>
                    </div>
                </DialogTitle>

                <div className="h-px bg-gray-100 dark:bg-gray-800 mx-5" />

                {/* ── Body ── */}
                <div className="px-5 py-4 flex flex-col gap-5">
                    {/* Isi Laporan */}
                    <div>
                        <SectionLabel icon={FileText}>Isi Laporan</SectionLabel>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Foto Laporan */}
                    {ticket.attachmentUrl?.length > 0 && (
                        <div className="mt-[-1rem]">
                            <AttachmentGallery urls={ticket.attachmentUrl} />
                        </div>
                    )}

                    {/* Timeline Riwayat */}
                    <div>
                        <SectionLabel icon={Clock}>Riwayat Penanganan</SectionLabel>
                        <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                            {/* Timeline header */}
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <Clock className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Riwayat Penanganan
                                </span>
                                <span className="ml-auto text-[10px] text-gray-400">
                                    {[true, hasAssignment, isResolved].filter(Boolean).length} aktivitas
                                </span>
                            </div>

                            {/* Timeline body */}
                            <div className="px-4 py-4">
                                {/* Step 1: Submitted */}
                                <TimelineItem
                                    icon={ArrowRight}
                                    dotClass="bg-teal-50 dark:bg-teal-900/30"
                                    lineClass="bg-gray-200 dark:bg-gray-700"
                                    title="Laporan dikirimkan"
                                    date={formatDate(ticket.createdAt)}
                                    isLast={!hasAssignment && !isResolved}
                                />

                                {/* Step 2: Assigned */}
                                {hasAssignment && (
                                    <TimelineItem
                                        icon={UserCheck}
                                        dotClass="bg-blue-50 dark:bg-blue-900/30"
                                        lineClass="bg-gray-200 dark:bg-gray-700"
                                        title="Ditugaskan ke unit"
                                        date={formatDate(ticket.assignedAt || ticket.createdAt)}
                                        isLast={!isResolved}
                                    >
                                        {/* Assignee pill */}
                                        <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[11px] font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                            {ticket.assignedTo.name}
                                        </span>

                                        {/* Catatan penugasan */}
                                        {ticket.actionNote && (
                                            <div className="mt-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {ticket.actionNote}
                                            </div>
                                        )}
                                    </TimelineItem>
                                )}

                                {/* Step 3: Resolved */}
                                {isResolved && (
                                    <TimelineItem
                                        icon={CheckCircle2}
                                        dotClass="bg-emerald-50 dark:bg-emerald-900/30"
                                        lineClass="bg-gray-200 dark:bg-gray-700"
                                        title="Laporan diselesaikan"
                                        date={formatDate(ticket.resolvedAt || ticket.updatedAt)}
                                        isLast
                                    >
                                        {/* Catatan penyelesaian */}
                                        {ticket.resolutionNote && (
                                            <div className="mt-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {ticket.resolutionNote}
                                            </div>
                                        )}

                                        {/* Bukti perbaikan */}
                                        {ticket.resolutionProofUrls?.length > 0 && (
                                            <div className="">
                                                <AttachmentGallery urls={ticket.resolutionProofUrls} />
                                            </div>
                                        )}
                                    </TimelineItem>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-gray-500"
                        onClick={() => onOpenChange(false)}
                    >
                        Tutup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
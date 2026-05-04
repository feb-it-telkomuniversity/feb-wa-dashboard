"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Loader2,
    CalendarDays,
    TicketIcon,
    MessageSquare,
    LinkIcon,
    CheckCircle2,
    Clock,
    Ban,
    ActivitySquare
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import AttachmentGallery from "@/components/HaloDekan/AttachmentGallery";
import { decodeId } from "@/lib/hash-ids";

export default function DetailRiwayatTiketPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTicketDetail = async () => {
            try {
                setIsLoading(true)
                const realId = decodeId(id);
                if (!realId) throw new Error("ID Tiket tidak valid");

                const res = await api.get(`/api/halodekan/tickets/${realId}`)
                setTicket(res.data?.data || res.data)
            } catch (err) {
                console.error("Gagal memuat detail tiket:", err)
                const errMessage = err.response?.data?.message || "Gagal memuat detail tiket."
                toast.error(errMessage)
                router.push("/dashboard/halo-dekan/riwayat-tiket")
            } finally {
                setIsLoading(false)
            }
        };

        if (id) fetchTicketDetail()
    }, [id, router])

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
            <Badge className={`${config.styleClass} px-3 py-1 text-xs font-semibold tracking-wide uppercase shadow-sm border-none`}>
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short"
        }).format(date);
    };

    const getStepperData = (status) => {
        let currentStepIndex = 1;

        if (["InProgress", "WaitingApproval", "AssignedToUnit", "RevisionNeeded"].includes(status)) currentStepIndex = 2;
        if (["Resolved", "Close", "Cancelled", "Rejected"].includes(status)) currentStepIndex = 3;

        let step3Title = "Selesai";
        let step3Subtitle = "Laporan telah selesai ditindaklanjuti";
        let step3Icon = <CheckCircle2 className="w-5 h-5" />;
        let isError = false;

        if (["Cancelled", "Rejected"].includes(status)) {
            step3Title = status === "Cancelled" ? "Dibatalkan" : "Ditolak";
            step3Subtitle = status === "Cancelled" ? "Laporan telah dibatalkan" : "Laporan ditolak oleh pihak Dekanat / Admin";
            step3Icon = <Ban className="w-5 h-5" />;
            isError = true;
        }

        return [
            {
                index: 1,
                title: "Laporan Terkirim",
                subtitle: "Laporan berhasil masuk ke sistem",
                isActive: currentStepIndex >= 1,
                isCurrent: currentStepIndex === 1,
                icon: <Clock className="w-5 h-5" />,
            },
            {
                index: 2,
                title: status === "EscalatedToDean" ? "Diteruskan ke Dekan" : "Sedang Diproses",
                subtitle: status === "EscalatedToDean"
                    ? "Dekan sedang meninjau laporan ini"
                    : "Laporan sedang ditindaklanjuti oleh unit yang berwenang",
                isActive: currentStepIndex >= 2,
                isCurrent: currentStepIndex === 2,
                icon: <ActivitySquare className="w-5 h-5" />,
            },
            {
                index: 3,
                title: step3Title,
                subtitle: step3Subtitle,
                isActive: currentStepIndex >= 3,
                isCurrent: currentStepIndex === 3,
                icon: step3Icon,
                isError: isError,
            }
        ];
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Memuat detail tiket...</p>
            </div>
        );
    }

    if (!ticket) return null;

    const steps = getStepperData(ticket.status);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both ease-out">

            {/* 1. Header (Identitas Tiket) */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 rounded-full h-10 w-10 border-border/50 shadow-sm"
                        onClick={() => router.push("/dashboard/halo-dekan/riwayat-tiket")}
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="pt-0.5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary font-mono flex items-center gap-2">
                            <TicketIcon className="h-8 w-8 text-primary/70 shrink-0" />
                            {ticket.ticketCode}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground font-medium text-sm">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(ticket.createdAt)}
                        </div>
                    </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-2 md:pt-1 pl-14 md:pl-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden md:block">Status Saat Ini</span>
                    {getStatusBadge(ticket.status)}
                </div>
            </div>

            {/* 2. Section "Lacak Status" (Tracking) */}
            <Card className="border-border/50 shadow-sm overflow-hidden mt-8">
                <CardHeader className="bg-muted/10 border-b pb-5">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ActivitySquare className="h-5 w-5 text-muted-foreground" />
                        Lacak Status Pengaduan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">

                    {/* Horizontal Stepper */}
                    <div className="relative">
                        {/* Background Line */}
                        <div className="absolute top-6 left-0 w-full h-[2px] bg-border/60 -z-10 hidden sm:block"></div>

                        <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex-1 flex flex-row sm:flex-col items-start sm:items-center relative z-10">
                                    {/* Step Connector Line for Mobile */}
                                    {idx !== steps.length - 1 && (
                                        <div className="absolute top-10 left-[1.3rem] w-[2px] h-[calc(100%-1.5rem)] bg-border/60 -z-10 sm:hidden"></div>
                                    )}

                                    <div className={`
                    h-12 w-12 rounded-full flex items-center justify-center border-4 shadow-sm shrink-0
                    ${step.isActive && !step.isError ? "bg-primary border-primary/20 text-primary-foreground" : ""}
                    ${step.isActive && step.isError ? "bg-red-500 border-red-500/20 text-white" : ""}
                    ${!step.isActive ? "bg-card border-border text-muted-foreground" : ""}
                    transition-all duration-300 transform
                    ${step.isCurrent ? "scale-110 shadow-md ring-4 ring-primary/10" : "scale-100"}
                  `}>
                                        {step.icon}
                                    </div>

                                    <div className="sm:text-center mt-1.5 sm:mt-4 ml-4 sm:ml-0 flex-1">
                                        <h4 className={`text-[15px] font-bold ${step.isCurrent ? (step.isError ? "text-red-500" : "text-primary") : "text-foreground"}`}>
                                            {step.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-snug sm:max-w-[200px] sm:mx-auto">
                                            {step.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Active Progress Line mapped over Background Line */}
                        <div
                            className="absolute top-6 left-0 h-[2px] bg-primary -z-10 hidden sm:block transition-all duration-1000 ease-in-out"
                            style={{
                                width: ticket.status === "Submitted" ? "25%" :
                                    ["InProgress", "EscalatedToDean", "WaitingDeanApproval", "AssignedToUnit", "RevisionNeeded"].includes(ticket.status) ? "55%" :
                                        "100%"
                            }}
                        ></div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Section "Detail Laporan" */}
            <h3 className="text-lg font-bold text-foreground mt-8 mb-4 border-b pb-2 px-1">
                Isi Detail Laporan
            </h3>

            <Card className="bg-card shadow-sm border-border/60">
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Kategori Pengaduan</span>
                        <div className="inline-flex py-1.5 px-3 rounded-md bg-secondary/50 border text-foreground font-semibold">
                            {ticket.category}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Isi / Keterangan Keterangan</span>
                        <div className="bg-muted/30 border border-border/50 rounded-xl p-5 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[120px]">
                            {ticket.description}
                        </div>
                    </div>

                    {ticket.attachmentUrl && (
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Bukti Lampiran</span>
                            <AttachmentGallery urls={ticket.attachmentUrl} />
                        </div>
                    )}
                </CardContent>
            </Card>


            {/* Munculkan bagian ini HANYA JIKA status tiket sudah Resolved atau Waiting Approval */}
            {ticket.status === 'Resolved' && (
                <div className="mt-8 border border-green-200 bg-green-50/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 border-b border-green-200 pb-2">
                        Tanggapan & Penyelesaian Fakultas
                    </h3>

                    <div className="space-y-6">
                        {/* Catatan Penyelesaian */}
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catatan Tindak Lanjut</span>
                            <p className="mt-2 text-gray-800 bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                                {ticket.resolutionNote}
                            </p>
                        </div>

                        {/* Bukti Penyelesaian dari Staf */}
                        {ticket.resolutionProofUrls && ticket.resolutionProofUrls.length > 0 && (
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Bukti Pengerjaan</span>
                                <div className="flex gap-4">
                                    <AttachmentGallery urls={ticket.resolutionProofUrls} />
                                </div>
                            </div>
                        )}

                        {/* (Opsional) Catatan Final dari Admin/Dekan */}
                        {ticket.actionNote && (
                            <div className="pt-4 border-t border-green-200/60">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pesan Admin</span>
                                <p className="mt-1 text-sm text-gray-600 italic">"{ticket.actionNote}"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
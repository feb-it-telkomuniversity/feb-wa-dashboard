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
import { cn } from "@/lib/utils";

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
                const res = await api.get(`/api/halodekan/tickets/${id}`)
                setTicket(res.data?.data || res.data)
            } catch (err) {
                console.error("Gagal memuat detail tiket:", err)
                const errMessage = err.response?.data?.message || "Gagal memuat detail tiket."
                toast.error(errMessage)
                // Kembali ke halaman sebelumnya jika tidak valid
                router.push("/dashboard/halo-dekan/riwayat-tiket")
            } finally {
                setIsLoading(false)
            }
        };

        if (id) fetchTicketDetail()
    }, [id, router])

    const getStatusBadge = (status) => {
        const statusConfig = {
            Submitted: { styleClass: "bg-green-500 text-white", label: "Submitted" },
            InProgress: { styleClass: "bg-blue-500 text-white", label: "In Progress" },
            EscalatedToDean: { styleClass: "bg-orange-500 text-white", label: "Escalated to Dean" },
            Resolved: { styleClass: "bg-emerald-500 text-white", label: "Resolved" },
            Cancelled: { styleClass: "bg-red-500 text-white", label: "Cancelled" },
            Close: { styleClass: "bg-slate-700 text-white", label: "Closed" },
        };

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

        if (["InProgress", "EscalatedToDean"].includes(status)) currentStepIndex = 2;
        if (["Resolved", "Close", "Cancelled"].includes(status)) currentStepIndex = 3;

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
                    : "Admin sedang menindaklanjuti laporan",
                isActive: currentStepIndex >= 2,
                isCurrent: currentStepIndex === 2,
                icon: <ActivitySquare className="w-5 h-5" />,
            },
            {
                index: 3,
                title: status === "Cancelled" ? "Dibatalkan" : "Selesai",
                subtitle: status === "Cancelled"
                    ? "Laporan telah dibatalkan"
                    : "Laporan telah selesai ditindaklanjuti",
                isActive: currentStepIndex >= 3,
                isCurrent: currentStepIndex === 3,
                icon: status === "Cancelled" ? <Ban className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />,
                isError: status === "Cancelled",
            }
        ];
    };

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
                                    ["InProgress", "EscalatedToDean"].includes(ticket.status) ? "55%" :
                                        "100%"
                            }}
                        ></div>
                    </div>

                    {/* Action Note Box (Admin's response) */}
                    {ticket.actionNote && (
                        <div className="mt-8 relative p-5 bg-primary/[0.03] border border-primary/20 rounded-xl">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-primary mb-1">Catatan Tindakan Admin:</h4>
                                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                        {ticket.actionNote}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Bukti Lampiran (Attachment)</span>
                            <div className="bg-background border border-border/50 rounded-xl p-3 flex items-center gap-3">
                                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                                    <LinkIcon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <a
                                        href={ticket.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                                    >
                                        {ticket.attachmentUrl}
                                    </a>
                                </div>
                                <Button variant="secondary" size="sm" asChild className="shrink-0 hidden sm:flex">
                                    <a href={ticket.attachmentUrl} target="_blank" rel="noopener noreferrer">Buka Tautan</a>
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>

        </div>
    );
}
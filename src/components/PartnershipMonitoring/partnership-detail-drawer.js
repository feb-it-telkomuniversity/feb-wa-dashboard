'use client'

import React, { useState, useEffect } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Globe,
    Building2,
    Sparkles,
    CheckCircle2,
    Clock,
    Calendar,
    User,
    Phone,
    AlertCircle,
    ExternalLink,
    MinusCircle,
    XCircle,
    Edit2,
    LoaderIcon,
    Activity,
    Layers,
    PenTool
} from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Textarea } from "../ui/textarea"
import { useAuth } from "@/hooks/use-auth"

const formatDate = (value) => {
    if (!value) return "-"
    const date = new Date(value)
    if (isNaN(date)) return "-"
    const formatter = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
    return formatter.format(date)
}

const PartnershipDetailDrawer = ({
    partnershipId,
    partnership,
    open,
    onOpenChange,
    trigger,
    onSuccess
}) => {
    const { user } = useAuth()
    const isAdmin = ['admin', 'super_admin'].includes(user?.role?.toLowerCase())

    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [notesInput, setNotesInput] = useState(partnership?.notes || "")
    const [isSavingNotes, setIsSavingNotes] = useState(false)

    useEffect(() => {
        if (partnership) {
            setNotesInput(partnership.notes || "")
            setIsEditingNotes(false)
        }
    }, [partnership])

    if (!partnership) return null;

    const handleSaveNotes = async () => {
        const id = partnershipId || partnership.id;
        if (!id) return;
        try {
            setIsSavingNotes(true)
            await api.put(`/api/partnership/${id}`, {
                notes: notesInput
            })
            toast.success("Catatan berhasil diperbarui")
            setIsEditingNotes(false)
            if (onSuccess) onSuccess({ ...partnership, notes: notesInput })
        } catch (error) {
            console.error(error)
            toast.error("Gagal memperbarui catatan")
        } finally {
            setIsSavingNotes(false)
        }
    }

    const getScopeIcon = () => {
        switch (partnership.scope?.toLowerCase()) {
            case 'international': return <Globe className="w-4 h-4" />
            case 'national': return <Building2 className="w-4 h-4" />
            default: return <Building2 className="w-4 h-4" />
        }
    }

    const getPartnershipStatus = () => {
        if (!partnership.validUntil) return null;
        const validDate = new Date(partnership.validUntil);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        validDate.setHours(0, 0, 0, 0);
        return validDate >= today;
    }

    const getStatusColor = () => {
        if (!partnership.validUntil) return "bg-slate-50 text-slate-600 border-slate-200"
        const validDate = new Date(partnership.validUntil)
        const today = new Date()
        const diffMonths = (validDate - today) / (1000 * 60 * 60 * 24 * 30)

        if (diffMonths > 6) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        if (diffMonths > 3) return "bg-amber-500/10 text-amber-600 border-amber-500/20"
        return "bg-red-500/10 text-red-600 border-red-500/20"
    }

    const docTypeStr = partnership?.docType?.trim()?.toLowerCase() || '';
    let approvalSteps = [];

    if (docTypeStr.includes('moa')) {
        approvalSteps = [
            { label: "Wadek II", status: partnership.approvalWadek2 },
            { label: "Wadek I", status: partnership.approvalWadek1 },
            { label: "Dir. SPIO", status: partnership.approvalDirSPIO },
            { label: "Dir. MIK", status: partnership.approvalDirMIK },
            { label: "Ka. Ur. Legal", status: partnership.approvalKaurLegal },
            { label: "Dekan", status: partnership.approvalDekan },
        ];
    } else if (docTypeStr.includes('mou')) {
        approvalSteps = [
            { label: "Wadek II", status: partnership.approvalWadek2 },
            { label: "Wadek I", status: partnership.approvalWadek1 },
            { label: "Dir. SPIO", status: partnership.approvalDirSPIO },
            { label: "Dir. MIK", status: partnership.approvalDirMIK },
            { label: "Ka. Ur. Legal", status: partnership.approvalKaurLegal },
            { label: "Warek I", status: partnership.approvalWarek1 },
            { label: "Rektor", status: partnership.approvalRektor },
        ];
    } else {
        approvalSteps = [
            { label: "Wadek II", status: partnership.approvalWadek2 },
            { label: "Wadek I", status: partnership.approvalWadek1 },
            { label: "Dir. SPIO", status: partnership.approvalDirSPIO },
            { label: "Dekan", status: partnership.approvalDekan },
        ];
    }

    const approvedCount = approvalSteps.filter(s => s.status?.toLowerCase() === 'approved').length;
    const totalApproval = approvalSteps.length;

    const getApprovalStyle = (status) => {
        switch (status) {
            case 'Approved':
                return {
                    bgIcon: 'bg-emerald-500',
                    shadow: 'shadow-emerald-500/30',
                    icon: <CheckCircle2 className="w-3.5 h-3.5 text-white" />,
                    bgCard: 'bg-emerald-50/50 border-emerald-100',
                    text: 'text-emerald-700',
                    label: 'Disetujui'
                }
            case 'Returned':
                return {
                    bgIcon: 'bg-red-500',
                    shadow: 'shadow-red-500/30',
                    icon: <XCircle className="w-3.5 h-3.5 text-white" />,
                    bgCard: 'bg-red-50/50 border-red-100',
                    text: 'text-red-700',
                    label: 'Dikembalikan'
                }
            case 'Submitted':
                return {
                    bgIcon: 'bg-blue-500',
                    shadow: 'shadow-blue-500/30',
                    icon: <Clock className="w-3.5 h-3.5 text-white" />,
                    bgCard: 'bg-blue-50/50 border-blue-100',
                    text: 'text-blue-700',
                    label: 'Diajukan'
                }
            default:
                return {
                    bgIcon: 'bg-slate-200',
                    shadow: '',
                    icon: <MinusCircle className="w-3.5 h-3.5 text-slate-500" />,
                    bgCard: 'bg-slate-50 border-slate-100',
                    text: 'text-slate-400',
                    label: 'Menunggu'
                }
        }
    }

    // Activities handling
    const activities = Array.isArray(partnership?.activities) ? partnership.activities : [];
    const totalActivities = activities.length;
    const doneActivities = activities.filter(a => a.status?.toLowerCase() === 'terlaksana').length;
    const activityPercentage = totalActivities > 0 ? Math.round((doneActivities / totalActivities) * 100) : 0;

    // Partnership types handling
    const partnershipTypes = Array.isArray(partnership.partnershipType)
        ? partnership.partnershipType
        : partnership.partnershipType
            ? [partnership.partnershipType]
            : [];

    const isControlled = open !== undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {!isControlled && trigger !== null && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="ghost" size="sm" className="w-full text-left">
                            <FileText className="size-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Detail Lengkap</span>
                        </Button>
                    )}
                </DialogTrigger>
            )}

            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl p-0 sm:max-w-4xl custom-scrollbar border-0 shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Detail Lengkap Dokumen Kemitraan</DialogTitle>
                    <DialogDescription>Seluruh informasi rincian kemitraan {partnership.partnerName}</DialogDescription>
                </DialogHeader>

                <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
                    {/* Header Banner Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#009da5] via-[#00878e] to-[#006e74] p-6 sm:p-8 shadow-xl text-white">
                        {/* Decorative Background Elements */}
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#004d52]/25 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="relative z-10 space-y-4">
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
                                    <FileText className="w-3.5 h-3.5" />
                                    {partnership.docType || "Dokumen Kerjasama"}
                                </span>

                                {partnership.scope && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30 capitalize">
                                        {getScopeIcon()}
                                        {partnership.scope}
                                    </span>
                                )}

                                {partnershipTypes.map((type, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/30 backdrop-blur-sm text-white text-xs font-semibold border border-emerald-300/30">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {type}
                                    </span>
                                ))}

                                {partnership.yearIssued && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold border border-white/20 ml-auto">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Tahun {partnership.yearIssued}
                                    </span>
                                )}
                            </div>

                            {/* Partner Title */}
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                                    {partnership.partnerName || "Detail Kerjasama"}
                                </h2>
                                <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl font-normal opacity-90">
                                    Dokumen kerjasama resmi kemitraan Fakultas Ekonomi dan Bisnis (FEB) Telkom University.
                                </p>
                            </div>

                            {/* Quick Overview Highlights */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
                                    <p className="text-teal-100 text-[11px] font-medium mb-1">Masa Berlaku</p>
                                    <p className="text-white text-sm sm:text-base font-semibold">
                                        {formatDate(partnership.validUntil)}
                                    </p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
                                    <p className="text-teal-100 text-[11px] font-medium mb-1">Status Keaktifan</p>
                                    <div className="flex items-center gap-1.5 font-semibold text-sm sm:text-base">
                                        {getPartnershipStatus() === null ? (
                                            <MinusCircle className="w-4 h-4 text-slate-300" />
                                        ) : getPartnershipStatus() ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-300" />
                                        )}
                                        <span>
                                            {getPartnershipStatus() === null ? "-" : getPartnershipStatus() ? "Aktif" : "Kadaluarsa"}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
                                    <p className="text-teal-100 text-[11px] font-medium mb-1">Status Persetujuan</p>
                                    <p className="text-white text-sm sm:text-base font-semibold">
                                        {approvedCount}/{totalApproval} Approved
                                    </p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
                                    <p className="text-teal-100 text-[11px] font-medium mb-1">Pelaksanaan</p>
                                    <p className="text-white text-sm sm:text-base font-semibold">
                                        {doneActivities}/{totalActivities} Kegiatan
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Dokumen & Workflow Persetujuan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Timeline Dokumen Card */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Clock className="w-5 h-5 text-teal-600" />
                                <h3 className="text-base font-bold text-slate-800">Timeline & Validitas Dokumen</h3>
                            </div>

                            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                <div className="relative">
                                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                                    <p className="text-xs font-semibold text-slate-500">Tanggal Dibuat</p>
                                    <p className="text-sm font-semibold text-slate-800">{formatDate(partnership.dateCreated)}</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-sm"></div>
                                    <p className="text-xs font-semibold text-slate-500">Tanggal Ditandatangani</p>
                                    <p className="text-sm font-semibold text-slate-800">{formatDate(partnership.dateSigned)}</p>
                                    {partnership.signingType && (
                                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                            <PenTool className="w-3 h-3 text-purple-600" />
                                            Metode: {partnership.signingType}
                                        </p>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                                    <p className="text-xs font-semibold text-slate-500">Berlaku Hingga</p>
                                    <p className="text-sm font-semibold text-emerald-600">{formatDate(partnership.validUntil)}</p>
                                    {partnership.duration && (
                                        <p className="text-xs text-slate-500 mt-0.5">Durasi: {partnership.duration}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Workflow Persetujuan Card */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-base font-bold text-slate-800">Alur Persetujuan (Workflow)</h3>
                                </div>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {approvedCount}/{totalApproval} Disetujui
                                </span>
                            </div>

                            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                {approvalSteps.map((step, index) => {
                                    const style = getApprovalStyle(step.status);
                                    return (
                                        <div key={index} className={`flex items-center justify-between p-2.5 rounded-xl border ${style.bgCard}`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-6 h-6 rounded-full ${style.bgIcon} ${style.shadow} flex items-center justify-center shrink-0`}>
                                                    {style.icon}
                                                </div>
                                                <span className="text-xs sm:text-sm font-semibold text-slate-700">{step.label}</span>
                                            </div>
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/70 shadow-2xs ${style.text}`}>
                                                {step.status || "Menunggu"}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Pelaksanaan Kegiatan / Aktivitas Card */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-teal-600" />
                                <h3 className="text-base font-bold text-slate-800">Pelaksanaan Kegiatan & Implementasi</h3>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                                {doneActivities}/{totalActivities} Terlaksana ({activityPercentage}%)
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                <span>Progress Aktivitas</span>
                                <span>{activityPercentage}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${activityPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Activities List */}
                        {activities.length > 0 ? (
                            <div className="grid gap-2.5 pt-1">
                                {activities.map((act, index) => {
                                    const isDone = act.status?.toLowerCase() === 'terlaksana';
                                    return (
                                        <div
                                            key={act.id || index}
                                            className={`p-3 rounded-xl border transition-all ${
                                                isDone
                                                    ? 'bg-emerald-50/30 border-emerald-200/80'
                                                    : 'bg-slate-50/70 border-slate-200'
                                            }`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="space-y-0.5 flex-1 min-w-[200px]">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                                                        <h4 className="text-sm font-semibold text-slate-800">
                                                            {act.name || act.type || "Kegiatan Kerjasama"}
                                                        </h4>
                                                        {act.category && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                                                                {act.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {act.notes && (
                                                        <p className="text-xs text-slate-600 pl-5">
                                                            <span className="font-medium text-slate-500">Catatan:</span> {act.notes}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                        isDone
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                            : 'bg-slate-100 text-slate-700 border-slate-300'
                                                    }`}>
                                                        {isDone ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        ) : (
                                                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                        )}
                                                        {isDone ? 'Terlaksana' : 'Belum Terlaksana'}
                                                    </span>

                                                    {act.evidenceLink && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs gap-1 border-teal-300 text-teal-700 hover:bg-teal-50"
                                                            onClick={() => window.open(act.evidenceLink, '_blank')}
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Bukti
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-xs sm:text-sm text-slate-500 italic">Belum ada aktivitas yang dicatat untuk kerjasama ini.</p>
                            </div>
                        )}
                    </div>

                    {/* Informasi Nomor Dokumen & Penanggung Jawab (PIC) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Nomor Dokumen Card */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <FileText className="w-5 h-5 text-slate-700" />
                                <h3 className="text-base font-bold text-slate-800">Nomor Registrasi Dokumen</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Nomor Internal</p>
                                    <p className="text-sm font-mono font-bold text-slate-900 break-all">{partnership.docNumberInternal || "-"}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Nomor Eksternal</p>
                                    <p className="text-sm font-mono font-bold text-slate-900 break-all">{partnership.docNumberExternal || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Person In Charge (PIC) Card */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <User className="w-5 h-5 text-slate-700" />
                                <h3 className="text-base font-bold text-slate-800">Penanggung Jawab (PIC)</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gradient-to-br from-teal-50 to-transparent rounded-xl p-3 border border-teal-100">
                                    <p className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider mb-0.5">PIC Internal FEB</p>
                                    <p className="text-sm font-semibold text-slate-900">{partnership.picInternal || "-"}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-transparent rounded-xl p-3 border border-purple-100">
                                    <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider mb-0.5">PIC Eksternal Mitra</p>
                                    <p className="text-sm font-semibold text-slate-900">{partnership.picExternal || "-"}</p>
                                    {partnership.picExternalPhone && (
                                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-mono">
                                            <Phone className="w-3 h-3 text-purple-600" />
                                            {partnership.picExternalPhone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ketersediaan Arsip Dokumen */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Layers className="w-4 h-4 text-slate-700" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ketersediaan Dokumen Fisik & Digital</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <div className={`rounded-xl p-3.5 border-2 transition-all ${partnership.hasHardcopy ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-bold text-slate-800 block">Dokumen Hardcopy</span>
                                        <span className="text-xs text-slate-500">{partnership.hasHardcopy ? "Tersedia di arsip" : "Belum tersedia"}</span>
                                    </div>
                                    {partnership.hasHardcopy ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                            </div>

                            <div className={`rounded-xl p-3.5 border-2 transition-all ${partnership.hasSoftcopy ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-bold text-slate-800 block">Dokumen Softcopy</span>
                                        <span className="text-xs text-slate-500">{partnership.hasSoftcopy ? "Tersedia secara digital" : "Belum tersedia"}</span>
                                    </div>
                                    {partnership.hasSoftcopy ? (
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Catatan Kolaborasi */}
                    <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-yellow-50/60 rounded-2xl p-5 sm:p-6 border border-amber-200/60 shadow-sm space-y-3">
                        <div className="flex items-start gap-3 w-full">
                            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 mt-0.5">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <h3 className="font-bold text-amber-950 text-sm sm:text-base">Catatan Kolaborasi</h3>
                                    {isAdmin && !isEditingNotes && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-amber-800 hover:text-amber-950 hover:bg-amber-200/50"
                                            onClick={() => {
                                                setNotesInput(partnership.notes || "")
                                                setIsEditingNotes(true)
                                            }}
                                        >
                                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Catatan
                                        </Button>
                                    )}
                                </div>

                                {isEditingNotes ? (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <Textarea
                                            value={notesInput}
                                            onChange={(e) => setNotesInput(e.target.value)}
                                            className="w-full text-sm bg-white border-amber-300 focus:ring-amber-500 min-h-[90px]"
                                            placeholder="Ketik catatan kolaborasi di sini..."
                                        />
                                        <div className="flex justify-end gap-2 mt-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs bg-white"
                                                onClick={() => setIsEditingNotes(false)}
                                                disabled={isSavingNotes}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                                                onClick={handleSaveNotes}
                                                disabled={isSavingNotes}
                                            >
                                                {isSavingNotes ? <LoaderIcon className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                                                Simpan
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs sm:text-sm text-amber-900 leading-relaxed whitespace-pre-wrap break-words">
                                        {partnership.notes || <span className="italic opacity-60">Belum ada catatan khusus untuk kerjasama ini...</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="flex flex-wrap gap-3 pt-2 items-center justify-between border-t border-slate-100">
                        <div>
                            {partnership.docLink ? (
                                <Button
                                    onClick={() => window.open(partnership.docLink, '_blank')}
                                    className="bg-gradient-to-r from-[#009da5] to-[#006e74] text-white hover:brightness-105 shadow-md flex items-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Buka Dokumen Resmi
                                </Button>
                            ) : (
                                <span className="text-xs text-slate-400 italic">Tautan dokumen belum dilampirkan</span>
                            )}
                        </div>

                        <DialogClose asChild>
                            <Button className="px-6" variant="outline">
                                Tutup
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PartnershipDetailDrawer
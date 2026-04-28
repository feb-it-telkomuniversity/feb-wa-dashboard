'use client'

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
    AlertCircle,
    ExternalLink,
    MinusCircle,
    XCircle,
    Edit2,
    LoaderIcon
} from "lucide-react"
import { CircleFadingArrowUpIcon } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Textarea } from "../ui/textarea"
import { useState } from "react"

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

const PartnershipDetailDrawer = ({ partnershipId, partnership, onSuccess }) => {
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [notesInput, setNotesInput] = useState(partnership?.notes || "")
    const [isSavingNotes, setIsSavingNotes] = useState(false)

    const handleSaveNotes = async () => {
        if (!partnershipId) return;
        try {
            setIsSavingNotes(true)
            await api.put(`/api/partnership/${partnershipId}`, {
                notes: notesInput
            })
            toast.success("Catatan berhasil diperbarui")
            setIsEditingNotes(false)
            if (onSuccess) onSuccess()
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
        today.setHours(0,0,0,0);
        validDate.setHours(0,0,0,0);
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

    const getApprovalStyle = (status) => {
        switch(status) {
            case 'Approved': 
                return { 
                    bgIcon: 'bg-emerald-500', 
                    shadow: 'shadow-emerald-500/30',
                    icon: <CheckCircle2 className="w-3 h-3 text-white" />,
                    bgCard: 'bg-emerald-50/50 border-emerald-100',
                    text: 'text-emerald-700',
                    label: 'Disetujui'
                }
            case 'Returned': 
                return { 
                    bgIcon: 'bg-red-500', 
                    shadow: 'shadow-red-500/30',
                    icon: <XCircle className="w-3 h-3 text-white" />,
                    bgCard: 'bg-red-50/50 border-red-100',
                    text: 'text-red-700',
                    label: 'Dikembalikan'
                }
            case 'Submitted': 
                return { 
                    bgIcon: 'bg-blue-500', 
                    shadow: 'shadow-blue-500/30',
                    icon: <Clock className="w-3 h-3 text-white" />,
                    bgCard: 'bg-blue-50/50 border-blue-100',
                    text: 'text-blue-700',
                    label: 'Diajukan'
                }
            default:
                return { 
                    bgIcon: 'bg-slate-200', 
                    shadow: '',
                    icon: <MinusCircle className="w-3 h-3 text-slate-500" />,
                    bgCard: 'bg-slate-50 border-slate-100',
                    text: 'text-slate-400',
                    label: 'Menunggu'
                }
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-primary text-primary hover:text-red-200">
                    <CircleFadingArrowUpIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-4xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Detail Kemitraan</DialogTitle>
                    <DialogDescription>Detail informasi kemitraan</DialogDescription>
                </DialogHeader>

                <div className="max-w-4xl mx-auto w-full p-4 pb-8 space-y-6">
                    {/* Header Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e31e25] via-red-400 to-red-900 p-8 mb-6 shadow-2xl">
                        {/* Decorative Elements */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-900/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

                        <div className="relative z-10">
                            {/* Badge Row */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
                                    <FileText className="w-3.5 h-3.5" />
                                    {partnership.docType || "-"}
                                </span>
                                {partnership.scope && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
                                        {getScopeIcon()}
                                        {partnership.scope?.toUpperCase()}
                                    </span>
                                )}
                                {partnership.partnershipType && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/30 backdrop-blur-sm text-white text-xs font-semibold border border-emerald-300/30">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {partnership.partnershipType}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                {partnership.partnerName || "Partnership Detail"}
                            </h2>
                            <p className="text-blue-100 text-sm max-w-2xl">
                                Dokumen kerjasama resmi yang mengatur kolaborasi strategis dalam pengembangan pendidikan dan penelitian berkualitas tinggi.
                            </p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                    <p className="text-blue-100 text-xs mb-1">Tahun Terbit</p>
                                    <p className="text-white text-xl lg:text-2xl max-sm:text-sm font-bold">
                                        {partnership.yearIssued || "-"}
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                    <p className="text-blue-100 text-xs mb-1">Status</p>
                                    <p className="text-white text-xl max-sm:text-sm font-semibold flex items-center gap-1">
                                        {getPartnershipStatus() === null ? (
                                            <MinusCircle className="w-4 h-4 text-slate-300" />
                                        ) : getPartnershipStatus() ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400" />
                                        )}
                                        {getPartnershipStatus() === null ? "-" : getPartnershipStatus() ? "Aktif" : "Tidak Aktif"}
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                    <p className="text-blue-100 text-xs mb-1">Aktivitas</p>
                                    <p className="text-white text-sm font-medium">{partnership.activityType || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline Card */}
                    <div className="space-y-6 md:grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-bold text-slate-800">Timeline Dokumen</h3>
                            </div>

                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 border"></div>

                                {/* Timeline Items */}
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 relative">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 z-10">
                                            <FileText className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-gradient-to-br from-blue-50 to-transparent rounded-xl p-4 border border-blue-100">
                                            <p className="text-xs font-semibold text-blue-700 mb-1">Dokumen Dibuat</p>
                                            <p className="text-slate-900 font-medium">{formatDate(partnership.dateCreated) || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 relative">
                                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30 z-10">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-gradient-to-br from-purple-50 to-transparent rounded-xl p-4 border border-purple-100">
                                            <p className="text-xs font-semibold text-purple-700 mb-1">Dokumen Ditandatangani</p>
                                            <p className="text-slate-900 font-medium">{formatDate(partnership.dateSigned) || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 relative">
                                        <div className={`w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10`}>
                                            <Calendar className="w-4 h-4 text-white" />
                                        </div>
                                        <div className={`flex-1 rounded-xl p-4 border ${getStatusColor()}`}>
                                            <p className="text-xs font-semibold mb-1">Berlaku Hingga</p>
                                            <p className="font-bold text-lg">{formatDate(partnership.validUntil) || "-"}</p>
                                            <p className="text-xs text-slate-500 mt-1">Durasi: {partnership.duration || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg">
                            <div className="flex items-center gap-2 mb-6">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-lg font-bold text-slate-800">Workflow Persetujuan</h3>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {approvalSteps.map((step, index) => {
                                    const style = getApprovalStyle(step.status);
                                    let lineColor = 'bg-slate-200';
                                    if (step.status === 'Approved') lineColor = 'bg-emerald-500';
                                    if (step.status === 'Returned') lineColor = 'bg-red-300';

                                    return (
                                        <div key={index} className={`relative flex gap-3 pb-2`}>
                                            
                                            <div 
                                                className={`absolute left-[11px] top-6 -bottom-3 w-0.5 ${lineColor}`}
                                                aria-hidden="true"
                                            />
                            
                                            {/* 2. ICON BULAT */}
                                            <div className={`relative z-10 w-6 h-6 rounded-full ${style.bgIcon} ${style.shadow} flex items-center justify-center shrink-0`}>
                                                {style.icon}
                                            </div>
                            
                                            {/* 3. CARD INFO */}
                                            <div className={`flex-1 flex items-center justify-between p-3 rounded-xl border ${style.bgCard} -mt-1`}>
                                                <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-md bg-white/50 ${style.text}`}>
                                                    {step.status || "Menunggu"}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Detail Information Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Document Numbers Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-slate-700" />
                                <h3 className="font-bold text-slate-800">Nomor Dokumen</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-xs text-slate-600 mb-1">Internal</p>
                                    <p className="text-sm font-mono font-semibold text-slate-900 break-all">{partnership.docNumberInternal || "-"}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-xs text-slate-600 mb-1">External</p>
                                    <p className="text-sm font-mono font-semibold text-slate-900 break-all">{partnership.docNumberExternal || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* PIC Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-slate-700" />
                                <h3 className="font-bold text-slate-800">Person In Charge</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gradient-to-br from-blue-50 to-transparent rounded-xl p-3 border border-blue-100">
                                    <p className="text-xs text-blue-700 font-semibold mb-1">Internal PIC</p>
                                    <p className="text-sm font-medium text-slate-900">{partnership.picInternal || "-"}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-transparent rounded-xl p-3 border border-purple-100">
                                    <p className="text-xs text-purple-700 font-semibold mb-1">External PIC</p>
                                    <p className="text-sm font-medium text-slate-900">{partnership.picExternal || "-"}</p>
                                    {partnership.picExternalPhone && (
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            📞 {partnership.picExternalPhone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document Availability */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg">
                        <h3 className="font-bold text-slate-800 mb-4">Ketersediaan Dokumen</h3>
                        <div className="flex gap-4">
                            <div className={`flex-1 rounded-xl p-4 border-2 ${partnership.hasHardcopy ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Hardcopy</span>
                                    {partnership.hasHardcopy ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                            </div>
                            <div className={`flex-1 rounded-xl p-4 border-2 ${partnership.hasSoftcopy ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Softcopy</span>
                                    {partnership.hasSoftcopy ? (
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-gradient-to-br from-amber-50 via-orange-50/75 to-yellow-50 rounded-2xl p-6 border border-amber-100 shadow-lg">
                        <div className="flex items-start gap-3 w-full">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30 mt-1">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-amber-900">Catatan Kolaborasi</h3>
                                    {!isEditingNotes && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-200/50"
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
                                            className="w-full text-sm bg-white border-amber-200 focus:ring-amber-500 min-h-[100px]"
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
                                    <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap break-words">
                                        {partnership.notes || <span className="italic opacity-60">Belum ada catatan...</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2 items-center justify-end">
                        <Button
                            onClick={() => window.open(partnership.docLink, '_blank')} 
                            className="bg-gradient-to-r from-[#e31e25] to-red-900 text-white py-4 rounded-md font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Lihat Dokumen
                        </Button>
                        <DialogClose asChild>
                            <Button className="px-6 py-4" variant="outline">
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
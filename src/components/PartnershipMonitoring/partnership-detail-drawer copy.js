'use client'

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
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
} from "lucide-react"
import { CircleFadingArrowUpIcon } from "lucide-react"

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

const PartnershipDetailDrawer = ({ partnership }) => {
    const getScopeIcon = () => {
        switch (partnership.scope?.toLowerCase()) {
            case 'international': return <Globe className="w-4 h-4" />;
            case 'national': return <Building2 className="w-4 h-4" />;
            default: return <Building2 className="w-4 h-4" />;
        }
    }

    const getStatusColor = () => {
        if (!partnership.validUntil) return "bg-slate-50 text-slate-600 border-slate-200";
        const validDate = new Date(partnership.validUntil);
        const today = new Date();
        const diffMonths = (validDate - today) / (1000 * 60 * 60 * 24 * 30);
        
        if (diffMonths > 6) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
        if (diffMonths > 3) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
        return "bg-red-500/10 text-red-600 border-red-500/20";
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-primary text-primary hover:text-red-200">
                    <CircleFadingArrowUpIcon className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white">
                <div className="hidden">
                    <DrawerHeader>
                        <DrawerTitle>Detail kemitraan</DrawerTitle>
                    </DrawerHeader>
                </div>
                <div className="max-w-4xl mx-auto w-full p-4 pb-8 space-y-6">
                    
                    {/* Header Card - Glassmorphic */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#009da5] via-[#008f96] to-[#006e74] p-8 mb-6 shadow-2xl">
                        {/* Decorative Elements */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#004d52]/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl"></div>

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
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 my-3">
                                <p className="text-blue-100 text-xs mb-1">Aktivitas</p>

                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(partnership.activities) && partnership.activities.length > 0 ? (
                                        partnership.activities.map((act) => (
                                            <span
                                                key={act.id}
                                                className="bg-red-100 text-red-900 px-2 py-1 rounded-full text-[12px] font-medium"
                                            >
                                                {act.type}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-white/70 text-sm">-</span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                    <p className="text-blue-100 text-xs mb-1">Tahun Terbit</p>
                                    <p className="text-white text-2xl font-bold">{partnership.yearIssued || "-"}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                    <p className="text-blue-100 text-xs mb-1">Status</p>
                                    <p className="text-white text-lg font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                        Active
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-slate-800">Timeline Dokumen</h3>
                        </div>

                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500"></div>

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
                                    </div>
                                </div>
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
                    {partnership.notes && (
                        <div className="bg-gradient-to-br from-amber-50 via-orange-50/75 to-yellow-50 rounded-2xl p-6 border border-amber-100 shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-amber-900 mb-2">Catatan Kolaborasi</h3>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        {partnership.notes}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
                            <ExternalLink className="w-5 h-5" />
                            Lihat Dokumen
                        </button>
                        <DrawerClose asChild>
                            <Button className="px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all duration-200">
                                Tutup
                            </Button>
                        </DrawerClose>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default PartnershipDetailDrawer
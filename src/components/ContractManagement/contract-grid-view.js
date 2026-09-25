'use client'

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ellipsis, Edit, Calendar, FileText, BarChart3, ChevronRight, Activity } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import DeleteContract from "./delete-contract"
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs as AnimatedTabs } from "@/components/shadcn-space/tabs/tabs-02"
import { ShieldUser, Pencil, Eye, BookA, Bubbles, Cog } from "lucide-react"
import MiniAttachmentViewer from "./MiniAttachmentViewer"
import { useState } from "react"

const CATEGORY_LABELS = {
    "Financial": "FINANCIAL",
    "NonFinancial": "NON FINANCIAL",
    "InternalBusinessProcess": "INTERNAL BUSINESS PROCESS"
};

const ContractGridView = ({ 
    contracts, 
    isAdmin, 
    isLoading, 
    setIsLoading, 
    getContractData, 
    setSelectedContractId,
    setOpen,
    renderValue,
    setSelectedAssignment,
    setAssignmentModalOpen
}) => {
    const [selectedDetail, setSelectedDetail] = useState(null)
    
    return (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((contract, idx) => {
                const categoryLabel = CATEGORY_LABELS[contract.ContractManagementCategory] || contract.ContractManagementCategory?.toUpperCase();
                
                return (
                    <Card 
                        key={contract.id || idx} 
                        onClick={() => setSelectedDetail(contract)}
                        className="group overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-md flex flex-col h-full cursor-pointer"
                    >
                        <CardContent className="p-0 flex flex-col h-full">
                            {/* Header Section */}
                            <div className="p-4 border-b border-border/40 bg-muted/20 relative">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary shrink-0 mt-1">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2" title={contract.responsibility}>
                                                {contract.responsibility || "-"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-[10px] font-semibold bg-primary/5 text-primary">
                                                    {categoryLabel}
                                                </Badge>
                                                {contract.subCategory && (
                                                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md truncate max-w-[120px]" title={contract.subCategory}>
                                                        {contract.subCategory}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 -mr-2">
                                                        <Ellipsis className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSelectedContractId(contract.id)
                                                            setOpen(true)
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DeleteContract
                                                        contractId={contract.id}
                                                        onSuccess={getContractData}
                                                        isLoading={isLoading}
                                                        setIsLoading={setIsLoading}
                                                    />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Body Section */}
                            <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                                <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="text-muted-foreground block mb-0.5">Satuan Unit</span>
                                        <span className="font-semibold">{contract.unitOfMeasurement || '-'}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="text-muted-foreground block mb-0.5">Total Penugasan</span>
                                        <span className="font-semibold flex items-center gap-1">
                                            <Activity className="w-3 h-3 text-emerald-500" />
                                            {contract.assignments?.length || 0} Unit
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="mt-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Pencapaian per Triwulan</span>
                                    <div className="grid grid-cols-4 gap-1 text-center">
                                        {[
                                            { tw: 'TW 1', data: contract.tw1 },
                                            { tw: 'TW 2', data: contract.tw2 },
                                            { tw: 'TW 3', data: contract.tw3 },
                                            { tw: 'TW 4', data: contract.tw4 },
                                        ].map((quarter, i) => (
                                            <div key={i} className="flex flex-col items-center p-1.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                                                <span className="text-[10px] text-muted-foreground font-semibold mb-1">{quarter.tw}</span>
                                                <div className="flex flex-col items-center gap-0.5 w-full">
                                                    <span className="text-[9px] text-slate-500">Target: <span className="font-medium text-slate-700 dark:text-slate-300">{quarter.data?.target !== "-" ? quarter.data.target : "-"}</span></span>
                                                    <span className="text-[9px] text-slate-500">Realisasi: <span className="font-medium text-slate-700 dark:text-slate-300">{quarter.data?.realization !== "-" ? quarter.data.realization : "-"}</span></span>
                                                    <span className={`text-[10px] font-bold mt-0.5 ${quarter.data?.achievement !== "-" ? (Number(quarter.data.achievement) >= 100 ? "text-emerald-600" : "text-blue-600") : "text-slate-400"}`}>
                                                        {quarter.data?.achievement !== "-" ? `${quarter.data.achievement}%` : "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>

        {/* Dialog untuk Detail Kontrak */}
        <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
            <DialogContent className="!max-w-[95vw] md:!max-w-[85vw] lg:!max-w-[1100px] p-0 border-0 bg-transparent shadow-none overflow-hidden h-[90vh] flex flex-col">
                <DialogTitle className="sr-only">Detail Kontrak {selectedDetail?.responsibility}</DialogTitle>
                <div className="flex-1 overflow-y-auto bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl">
                    <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm p-4 border-b border-border/40 flex justify-between items-center">
                        <h2 className="text-lg font-bold truncate pr-4 text-primary">
                            {selectedDetail?.responsibility}
                        </h2>
                    </div>
                    <div className="p-4 md:p-6">
                        {selectedDetail && (
                            <AnimatedTabs
                                tabs={[
                                    {
                                        title: <span className="flex items-center gap-1.5"><ShieldUser className="w-3.5 h-3.5" /> Unit Penanggung Jawab</span>,
                                        value: "assignments",
                                        content: (
                                            <div className="mt-0 outline-none w-full bg-transparent">
                                                {selectedDetail.assignments && selectedDetail.assignments.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {selectedDetail.assignments.map(assign => (
                                                            <div key={assign.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1 text-sm">
                                                                <div className="flex justify-between items-start mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-wrap">{assign.unit?.name || '-'}</span>
                                                                        <span className="w-max text-[10px] font-medium tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full">{assign.unit?.category || '-'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 text-[11px] px-2.5 py-0 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedAssignment({ ...assign, contract: selectedDetail })
                                                                                setAssignmentModalOpen(true)
                                                                            }}
                                                                        >
                                                                            <Pencil className="size-3 mr-1" /> Update Capaian
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {/* KPI View - 4 Quarters */}
                                                                <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                    {[1, 2, 3, 4].map(q => (
                                                                        <div key={`tw${q}`} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50 flex flex-col gap-1.5">
                                                                            <div className="text-center pb-1.5 mb-1 border-b border-slate-200 dark:border-slate-700">
                                                                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">TW-{q}</span>
                                                                            </div>
                                                                            <div className="flex flex-col gap-0.5 text-[11px]">
                                                                                <span className="text-slate-500">Realisasi</span>
                                                                                <span className="font-semibold text-slate-900 dark:text-slate-100 break-all">{assign[`realizationTw${q}`] ?? '-'}</span>
                                                                            </div>
                                                                            <div className="flex flex-col gap-0.5 text-[11px]">
                                                                                <span className="text-slate-500">Capaian</span>
                                                                                <span className="font-bold break-all" style={{
                                                                                    color: (() => {
                                                                                        const val = parseFloat(assign[`persRealTw${q}`]);
                                                                                        if (isNaN(val)) return 'inherit';
                                                                                        if (val >= 100) return '#10b981';
                                                                                        if (val >= 75) return '#f59e0b';
                                                                                        return '#ef4444';
                                                                                    })()
                                                                                }}>
                                                                                    {assign[`persRealTw${q}`] ? `${assign[`persRealTw${q}`]}%` : '-'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {(assign.inputNote || assign.monitorNote) && (
                                                                    <div className="mt-3 pt-3 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 text-xs w-full min-w-0">
                                                                        {assign.inputNote && (
                                                                            <div className="flex items-start bg-slate-50 dark:bg-slate-900/50 p-2 border border-slate-100 dark:border-slate-800 rounded">
                                                                                <div className="flex flex-col gap-1 w-full text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                                                                    <span className="font-semibold text-[10px] uppercase tracking-wider text-slate-500">Catatan/Link Bukti:</span>
                                                                                    {assign.inputNote.includes('http') ? (
                                                                                        <MiniAttachmentViewer url={assign.inputNote} />
                                                                                    ) : (
                                                                                        <span>{assign.inputNote}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {assign.monitorNote && (
                                                                            <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-200 p-2 rounded border border-amber-100 dark:border-amber-800/30">
                                                                                <span className="font-semibold block mb-0.5 text-[10px] uppercase tracking-wider">Catatan Monitor:</span>
                                                                                {assign.monitorNote}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                                                        <div className="text-gray-400 dark:text-gray-500 mb-1"><Eye className="h-8 w-8 mx-auto opacity-50" /></div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada unit yang di-assign pada responsibility ini.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    },
                                    {
                                        title: <span className="flex items-center gap-1.5"><BookA className="w-3.5 h-3.5" /> Definisi</span>,
                                        value: "definition",
                                        content: (
                                            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full">
                                                <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] uppercase tracking-wider mb-2">Definisi Indikator</h5>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedDetail.definition || 'Tidak ada spesifikasi definisi untuk kontrak ini.'}</p>
                                            </div>
                                        )
                                    },
                                    {
                                        title: <span className="flex items-center gap-1.5"><Bubbles className="w-3.5 h-3.5" /> Tujuan</span>,
                                        value: "objective",
                                        content: (
                                            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full">
                                                <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] uppercase tracking-wider mb-2">Tujuan Pengukuran</h5>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedDetail.objective || 'Tidak ada penjelasan tujuan pengukuruan untuk kontrak ini.'}</p>
                                            </div>
                                        )
                                    },
                                    {
                                        title: <span className="flex items-center gap-1.5"><Cog className="w-3.5 h-3.5" /> Perhitungan Indikator</span>,
                                        value: "indicator",
                                        content: (
                                            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full">
                                                <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] uppercase tracking-wider mb-2">Perhitungan Indikator</h5>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedDetail.indicatorCalc || 'Tidak ada detail perhitungan indikator untuk kontrak ini.'}</p>
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    )
}

export default ContractGridView

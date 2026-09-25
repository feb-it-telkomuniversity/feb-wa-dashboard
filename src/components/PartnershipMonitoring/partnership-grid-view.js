'use client'

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ellipsis, CircleFadingArrowUpIcon, Building2, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import EditSubmission from "./edit-submission"
import EditApproval from "./edit-approval"
import EditStatusActivityPartnership from "./edit-status-activity-partnership"
import DeletePartnership from "./delete-partnership"
import { getPartnershipStatusInfo, getApprovalProgress } from './table-combined'

const PartnershipGridView = ({ 
    partnerships, 
    isAdmin, 
    isLoading, 
    setIsLoading, 
    getPartnershipData, 
    currentPage,
    handleRowClick,
    getStoredReminderDays
}) => {
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerships.map((partnership) => {
                const statusInfo = getPartnershipStatusInfo(partnership.validUntil, getStoredReminderDays());
                const { approvedCount, total, isComplete, hasReturned } = getApprovalProgress(partnership);
                
                let approvalColorClass = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300";
                if (isComplete) {
                    approvalColorClass = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300";
                } else if (hasReturned) {
                    approvalColorClass = "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300";
                } else if (approvedCount === 0) {
                    approvalColorClass = "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
                }

                let activityProgress = null;
                if (partnership.activities && partnership.activities.length > 0) {
                    const totalAct = partnership.activities.length;
                    const doneAct = partnership.activities.filter(a => a.status?.toLowerCase() === "terlaksana").length;
                    const percentage = totalAct > 0 ? (doneAct / totalAct) * 100 : 0;
                    activityProgress = { total: totalAct, done: doneAct, percentage };
                }

                return (
                    <Card 
                        key={partnership.id} 
                        className="group overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col h-full"
                        onClick={() => handleRowClick(partnership)}
                    >
                        <CardContent className="p-0 flex flex-col h-full">
                            {/* Header Section */}
                            <div className="p-4 border-b border-border/40 bg-muted/20 relative">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors" title={partnership.partnerName}>
                                                {partnership.partnerName || "-"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                                                    {partnership.docType?.toUpperCase() || "-"}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {partnership.scope || "-"}
                                                </span>
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
                                                    <div className="font-semibold px-2 py-1.5 text-xs text-muted-foreground uppercase">Tampilan Dokumen</div>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleRowClick(partnership)}
                                                        className="cursor-pointer flex items-center gap-2"
                                                    >
                                                        <CircleFadingArrowUpIcon className="size-4 text-primary" />
                                                        <span className="text-sm font-medium">Detail Dokumen</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />
                                                    <div className="font-semibold px-2 py-1.5 text-xs text-muted-foreground uppercase">Data Persetujuan</div>
                                                    <DropdownMenuItem asChild>
                                                        <EditSubmission partnershipId={partnership.id} partnership={partnership} onSuccess={() => getPartnershipData(currentPage)} />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <EditApproval partnershipId={partnership.id} partnership={partnership} onSuccess={() => getPartnershipData(currentPage)} />
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    <div className="font-semibold px-2 py-1.5 text-xs text-muted-foreground uppercase">Data Penerapan</div>
                                                    <DropdownMenuItem asChild>
                                                        <EditStatusActivityPartnership partnershipId={partnership.id} partnership={partnership} activities={partnership.activities} onSuccess={() => getPartnershipData(currentPage)} />
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                        <DeletePartnership partnershipId={partnership.id} isLoading={isLoading} setIsLoading={setIsLoading} onSuccess={() => getPartnershipData(currentPage)} />
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Body Section */}
                            <div className="p-4 flex flex-col gap-4 flex-1">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground">Berlaku Hingga</span>
                                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                            {partnership.validUntil ? new Date(partnership.validUntil).toLocaleDateString('id-ID', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            }) : "-"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground">Tahun / PIC</span>
                                        <div className="flex items-center gap-1 font-medium text-foreground truncate" title={partnership.picInternal}>
                                            <span className="text-muted-foreground mr-1">{partnership.yearIssued || "-"} •</span>
                                            {partnership.picInternal || "-"}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-border/30">
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status & Approval</span>
                                        <div className="flex flex-col gap-1.5">
                                            {statusInfo.status !== 'none' && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border w-fit ${statusInfo.colorClass}`}>
                                                    {statusInfo.label}
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border w-fit ${approvalColorClass}`}>
                                                {approvedCount}/{total} Approved
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Penerapan</span>
                                        {activityProgress ? (
                                            <div className="flex flex-col gap-1.5 w-full mt-1">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="font-semibold text-slate-500">Progress</span>
                                                    <span className="font-bold text-teal-600 dark:text-teal-400">{activityProgress.done}/{activityProgress.total}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-rose-400 to-red-600 rounded-full transition-all" 
                                                        style={{ width: `${activityProgress.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground italic bg-muted/30 px-2 py-1 rounded-md w-fit">
                                                <Clock className="w-3 h-3" /> Belum ada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default PartnershipGridView;

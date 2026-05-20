import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TableRow, TableCell } from "@/components/ui/table"
import { ChevronDown, ChevronRight, Edit, Ellipsis, Eye, Pencil, ShieldUser, BookA, Bubbles, Cog, GripVertical } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs as AnimatedTabs } from "@/components/shadcn-space/tabs/tabs-02"
import DeleteContract from "./delete-contract"
import MiniAttachmentViewer from "./MiniAttachmentViewer"

export function SortableContractRow({
    row,
    rowNumber,
    isExpanded,
    toggleRow,
    renderValue,
    user,
    setSelectedContractId,
    setOpen,
    isLoading,
    setIsLoading,
    getContractData,
    setSelectedAssignment,
    setAssignmentModalOpen,
    showCategoryHeader,
    categoryLabel,
    styles,
    showSubCategoryHeader,
    subCategoryLabel,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: row.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        position: isDragging ? "relative" : "static",
        zIndex: isDragging ? 50 : "auto",
        backgroundColor: isDragging ? "var(--tw-colors-slate-100)" : undefined,
    }

    return (
        <React.Fragment>
            {showCategoryHeader && (
                <TableRow className={`${styles.row} border-y transition-colors`}>
                    <TableCell colSpan={21} className={`${styles.text} font-semibold h-9 py-1 px-4 tracking-wider text-xs`}>
                        {categoryLabel}
                    </TableCell>
                </TableRow>
            )}

            {showSubCategoryHeader && (
                <TableRow className="bg-blue-50/40 dark:bg-blue-900/10 border-y border-blue-100 dark:border-blue-800/30">
                    <TableCell colSpan={27} className="text-blue-600 dark:text-blue-400 font-medium h-8 py-0.5 px-8 tracking-wide text-[11px] uppercase">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-70"></div>
                            {subCategoryLabel}
                        </div>
                    </TableCell>
                </TableRow>
            )}

            <TableRow
                ref={setNodeRef}
                style={style}
                className={`group transition-colors hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 border-b border-slate-100 dark:border-slate-800/50 ${isExpanded ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}`}
            >
                <TableCell className="text-center font-medium text-slate-500 py-3">
                    <div className="flex items-center justify-center gap-2">
                        {user?.role === 'admin' && (
                            <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" {...attributes} {...listeners}>
                                <GripVertical className="w-4 h-4" />
                            </div>
                        )}
                        <span>{rowNumber}</span>
                    </div>
                </TableCell>
                <TableCell className="py-3 px-3 min-w-[600px]">
                    <div className="flex flex-col gap-2 py-1">
                        <span className="font-medium text-wrap" title={row.responsibility || "—"}>{renderValue(row.responsibility)}</span>
                        <button
                            onClick={() => toggleRow(row.id)}
                            className="flex items-center w-max gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50"
                        >
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            <span className="font-medium">{row.assignments?.length || 0} Detail</span>
                        </button>
                    </div>
                </TableCell>
                <TableCell className="text-center text-sm text-slate-600 dark:text-slate-400">{renderValue(row.unitOfMeasurement)}</TableCell>

                <TableCell className="text-center text-sm font-medium text-slate-600 border-l dark:text-slate-200 border-slate-100/50 dark:border-slate-800/30">{renderValue(row.tw1.weight)}</TableCell>
                <TableCell className="text-center text-sm text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/30 dark:bg-slate-900/10">{renderValue(row.tw1.target)}</TableCell>
                <TableCell className="text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10">{renderValue(row.tw1.realization)}</TableCell>
                <TableCell className="text-center text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-900/10 border-r border-slate-100/50 dark:border-slate-800/30">
                    {row.tw1.achievement !== "-" ? `${row.tw1.achievement}%` : renderValue(row.tw1.achievement)}
                </TableCell>

                <TableCell className="text-center text-sm font-medium text-slate-600 border-l dark:text-slate-200 border-slate-100/50 dark:border-slate-800/30">{renderValue(row.tw2.weight)}</TableCell>
                <TableCell className="text-center text-sm text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/30 dark:bg-slate-900/10">{renderValue(row.tw2.target)}</TableCell>
                <TableCell className="text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10">{renderValue(row.tw2.realization)}</TableCell>
                <TableCell className="text-center text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-900/10 border-r border-slate-100/50 dark:border-slate-800/30">
                    {row.tw2.achievement !== "-" ? `${row.tw2.achievement}%` : renderValue(row.tw2.achievement)}
                </TableCell>

                <TableCell className="text-center text-sm font-medium text-slate-600 border-l dark:text-slate-200 border-slate-100/50 dark:border-slate-800/30">{renderValue(row.tw3.weight)}</TableCell>
                <TableCell className="text-center text-sm text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/30 dark:bg-slate-900/10">{renderValue(row.tw3.target)}</TableCell>
                <TableCell className="text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10">{renderValue(row.tw3.realization)}</TableCell>
                <TableCell className="text-center text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-900/10 border-r border-slate-100/50 dark:border-slate-800/30">
                    {row.tw3.achievement !== "-" ? `${row.tw3.achievement}%` : renderValue(row.tw3.achievement)}
                </TableCell>

                <TableCell className="text-center text-sm font-medium text-slate-600 border-l dark:text-slate-200 border-slate-100/50 dark:border-slate-800/30">{renderValue(row.tw4.weight)}</TableCell>
                <TableCell className="text-center text-sm text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/30 dark:bg-slate-900/10">{renderValue(row.tw4.target)}</TableCell>
                <TableCell className="text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10">{renderValue(row.tw4.realization)}</TableCell>
                <TableCell className="text-center text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-900/10">
                    {row.tw4.achievement !== "-" ? `${row.tw4.achievement}%` : renderValue(row.tw4.achievement)}
                </TableCell>
                {user?.role === 'admin' && (
                    <TableCell className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                    <Ellipsis className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        setSelectedContractId(row.id)
                                        setOpen(true)
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DeleteContract
                                    contractId={row.id}
                                    onSuccess={getContractData}
                                    isLoading={isLoading}
                                    setIsLoading={setIsLoading}
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                )}
            </TableRow>
            <AnimatePresence initial={false}>
                {isExpanded && !isDragging && (
                    <TableRow key={`detail-${row.id}`} className="p-0 border-0 hover:bg-transparent">
                        <TableCell colSpan={21} className="p-0 border-0">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                    height: "auto",
                                    opacity: 1,
                                    transition: { type: "spring", stiffness: 100 }
                                }}
                                exit={{
                                    height: 0,
                                    opacity: 0,
                                    transition: { type: "tween", duration: 0.3, ease: "easeInOut" }
                                }}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="bg-gray-50/50 dark:bg-gray-900/20 shadow-inner">
                                    <div className="p-4 pl-8 border-l-4 border-l-blue-500">
                                        <AnimatedTabs
                                            tabs={[
                                                {
                                                    title: <span className="flex items-center gap-1.5"><ShieldUser className="w-3.5 h-3.5" /> Unit Penanggung Jawab</span>,
                                                    value: "assignments",
                                                    content: (
                                                        <div className="mt-0 outline-none w-full bg-transparent">
                                                            {row.assignments && row.assignments.length > 0 ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {row.assignments.map(assign => (
                                                                        <div key={assign.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1 text-sm hover:border-slate-300 transition-colors">
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
                                                                                        onClick={() => {
                                                                                            setSelectedAssignment({ ...assign, contract: row })
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
                                                                                        <div className="flex justify-between items-center text-[11px]">
                                                                                            <span className="text-slate-500">Realisasi</span>
                                                                                            <span className="font-semibold text-slate-900 dark:text-slate-100">{assign[`realizationTw${q}`] ?? '-'}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center text-[11px]">
                                                                                            <span className="text-slate-500">Capaian</span>
                                                                                            <span className="font-bold" style={{
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
                                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full max-w-4xl">
                                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] uppercase tracking-wider mb-2">Definisi Indikator</h5>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{row.definition || 'Tidak ada spesifikasi definisi untuk kontrak ini.'}</p>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    title: <span className="flex items-center gap-1.5"><Bubbles className="w-3.5 h-3.5" /> Tujuan</span>,
                                                    value: "objective",
                                                    content: (
                                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full max-w-4xl">
                                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] uppercase tracking-wider mb-2">Tujuan Pengukuran</h5>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{row.objective || 'Tidak ada penjelasan tujuan pengukuruan untuk kontrak ini.'}</p>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    title: <span className="flex items-center gap-1.5"><Cog className="w-3.5 h-3.5" /> Perhitungan Indikator</span>,
                                                    value: "indicator",
                                                    content: (
                                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full max-w-4xl">
                                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-[13px] uppercase tracking-wider mb-2">Perhitungan Indikator</h5>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{row.indicatorCalc || 'Tidak ada detail perhitungan indikator untuk kontrak ini.'}</p>
                                                        </div>
                                                    )
                                                }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </TableCell>
                    </TableRow>
                )}
            </AnimatePresence>
        </React.Fragment>
    )
}

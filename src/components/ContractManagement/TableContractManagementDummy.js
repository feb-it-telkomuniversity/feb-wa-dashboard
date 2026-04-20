'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight, Edit, Ellipsis, FileEditIcon, FileTextIcon, Eye, Loader2, PackageOpenIcon, PlusCircle, Search, SearchX, Trash2, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import Link from "next/link"

import { Input } from "../ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import FilterTablePartnership from "../PartnershipMonitoring/filter-table"
import AddContract from "./add-contract"
import FilterTableContractManagement from "./filter-table"
import EditContract from "./edit-contract"
import api from "@/lib/axios"

import DeleteContract from "./delete-contract"
import ExportExcelButton from "../shared/ExportExcelButton"

const TableContractManagementDummy = () => {
    const [contractData, setContractData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const debounceSearch = useDebounce(searchTerm, 500)
    const [filters, setFilters] = useState({
        category: null,
        quarterly: null,
        unit: null,
    })

    const [open, setOpen] = useState(false)
    const [selectedContractId, setSelectedContractId] = useState(null)
    const [expandedRows, setExpandedRows] = useState({})

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const getContractData = React.useCallback(async (page = 1) => {
        try {
            setIsLoading(true)

            const filterParams = {}
            if (filters.category) filterParams.category = filters.category
            if (filters.quarterly) filterParams.quarterly = filters.quarterly
            if (filters.unit) filterParams.unit = filters.unit


            const params = {
                page: 1,
                limit: 3000,
                search: debounceSearch || "",
                category: filters.category || undefined,
                quarterly: filters.quarterly || undefined,
                unit: filters.unit || undefined
            }

            const res = await api.get(`/api/contract-management`, {
                params: params,
            })

            if (res.data) {
                const { data = [] } = res.data
                setContractData(Array.isArray(data) ? data : [])
            }

        } catch (err) {
            console.error("Gagal fetch data:", err)
            setContractData([])
        } finally {
            setIsLoading(false)
        }
    }, [debounceSearch, filters]);

    useEffect(() => {
        // console.log('🔄 useEffect triggered - debounceSearch:', debounceSearch)
        getContractData(1)
    }, [debounceSearch, getContractData, filters])

    const handleClearSearch = () => {
        setSearchTerm('')
    }

    const handleResetFilters = () => {
        setFilters({ category: null, quarterly: null, unit: null })
    }

    const groupedContractData = React.useMemo(() => {
        const grouped = {}
        contractData.forEach(item => {
            const key = item.responsibility + (item.unitOfMeasurement || '')
            if (!grouped[key]) {
                grouped[key] = {
                    id: item.id,
                    responsibility: item.responsibility,
                    unitOfMeasurement: item.unitOfMeasurement || "-",
                    assignments: [],
                    tw1: { weight: "-", target: "-" },
                    tw2: { weight: "-", target: "-" },
                    tw3: { weight: "-", target: "-" },
                    tw4: { weight: "-", target: "-" },
                }
            }
            if (item.quarterly === "TW-1" || item.quarterly === "TW 1") {
                grouped[key].tw1 = { weight: item.weight || "-", target: item.target || "-" }
            } else if (item.quarterly === "TW-2" || item.quarterly === "TW 2") {
                grouped[key].tw2 = { weight: item.weight || "-", target: item.target || "-" }
            } else if (item.quarterly === "TW-3" || item.quarterly === "TW 3") {
                grouped[key].tw3 = { weight: item.weight || "-", target: item.target || "-" }
            } else if (item.quarterly === "TW-4" || item.quarterly === "TW 4") {
                grouped[key].tw4 = { weight: item.weight || "-", target: item.target || "-" }
            }

            if (item.assignments && Array.isArray(item.assignments)) {
                item.assignments.forEach(assign => {
                    if (!grouped[key].assignments.some(a => a.id === assign.id)) {
                        grouped[key].assignments.push(assign);
                    }
                })
            }
        })
        return Object.values(grouped)
    }, [contractData])

    const contractManagementColumns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Responsibility', key: 'responsibility', width: 45 },
        { header: 'Unit', key: 'unit', width: 15 },
        { header: 'TW-1 Bobot', key: 'tw1_weight', width: 10 },
        { header: 'TW-1 Target', key: 'tw1_target', width: 10 },
        { header: 'TW-2 Bobot', key: 'tw2_weight', width: 10 },
        { header: 'TW-2 Target', key: 'tw2_target', width: 10 },
        { header: 'TW-3 Bobot', key: 'tw3_weight', width: 10 },
        { header: 'TW-3 Target', key: 'tw3_target', width: 10 },
        { header: 'TW-4 Bobot', key: 'tw4_weight', width: 10 },
        { header: 'TW-4 Target', key: 'tw4_target', width: 10 },
    ]

    const handleMapData = (item) => {
        return {
            responsibility: item.responsibility,
            unit: item.unitOfMeasurement,
            tw1_weight: item.tw1.weight,
            tw1_target: item.tw1.target,
            tw2_weight: item.tw2.weight,
            tw2_target: item.tw2.target,
            tw3_weight: item.tw3.weight,
            tw3_target: item.tw3.target,
            tw4_weight: item.tw4.weight,
            tw4_target: item.tw4.target,
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <FilterTableContractManagement
                    filters={filters}
                    setFilters={setFilters}
                    onReset={handleResetFilters}
                />
                <div className="relative flex-1 hidden max-sm:flex lg:flex">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari berdasarkan responsibility...."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div>
                    <ExportExcelButton
                        apiEndpoint="/api/contract-management"
                        data={groupedContractData}
                        fileName="Kontrak-Manajemen"
                        sheetName="Kontrak-Manajemen"
                        columns={contractManagementColumns}
                        mapData={handleMapData}
                    />
                </div>

                <AddContract getContractData={getContractData} />
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Mencari data...
                </div>
            )}

            {!isLoading && contractData.length === 0 && debounceSearch && (
                <div className="text-center py-8 text-gray-500">
                    <SearchX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada hasil untuk {debounceSearch}</p>
                    <button
                        onClick={handleClearSearch}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                        Hapus pencarian
                    </button>
                </div>
            )}

            {!isLoading && contractData.length === 0 && !debounceSearch && (
                <div className="text-center py-8 text-gray-500">
                    <PackageOpenIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada data kontrak</p>
                </div>
            )}

            <div className="relative border border-gray-200 rounded-lg shadow dark:border-gray-800">
                <div className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead rowSpan={2} className="border-r border-b text-center align-middle" style={{ width: '50px' }}>No</TableHead>
                                <TableHead rowSpan={2} className="border-r border-b text-center align-middle">Responsibility</TableHead>
                                <TableHead rowSpan={2} className="border-r border-b text-center align-middle">Unit</TableHead>
                                <TableHead colSpan={2} className="border-r border-b text-center bg-blue-50/50 dark:bg-blue-900/10">TW-1</TableHead>
                                <TableHead colSpan={2} className="border-r border-b text-center bg-purple-50/50 dark:bg-purple-900/10">TW-2</TableHead>
                                <TableHead colSpan={2} className="border-r border-b text-center bg-orange-50/50 dark:bg-orange-900/10">TW-3</TableHead>
                                <TableHead colSpan={2} className="border-r border-b text-center bg-green-50/50 dark:bg-green-900/10">TW-4</TableHead>
                                <TableHead rowSpan={2} className="border-b text-center align-middle">Aksi</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead className="border-r border-b text-center bg-blue-50/30 dark:bg-blue-900/5">Bobot</TableHead>
                                <TableHead className="border-r border-b text-center bg-blue-50/30 dark:bg-blue-900/5">Target</TableHead>
                                <TableHead className="border-r border-b text-center bg-purple-50/30 dark:bg-purple-900/5">Bobot</TableHead>
                                <TableHead className="border-r border-b text-center bg-purple-50/30 dark:bg-purple-900/5">Target</TableHead>
                                <TableHead className="border-r border-b text-center bg-orange-50/30 dark:bg-orange-900/5">Bobot</TableHead>
                                <TableHead className="border-r border-b text-center bg-orange-50/30 dark:bg-orange-900/5">Target</TableHead>
                                <TableHead className="border-r border-b text-center bg-green-50/30 dark:bg-green-900/5">Bobot</TableHead>
                                <TableHead className="border-r border-b text-center bg-green-50/30 dark:bg-green-900/5">Target</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedContractData.map((row, idx) => {
                                const rowNumber = idx + 1
                                const rowKey = row.id || idx;
                                return (
                                    <React.Fragment key={rowKey}>
                                        <TableRow>
                                            <TableCell className="border-r text-center">{rowNumber}</TableCell>
                                            <TableCell className="border-r">
                                                <div className="flex flex-col gap-2 py-1">
                                                    <span className="font-medium" title={row.responsibility || "-"}>{row.responsibility || "-"}</span>
                                                    <button
                                                        onClick={() => toggleRow(rowKey)}
                                                        className="flex items-center w-max gap-1.5 text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50"
                                                    >
                                                        {expandedRows[rowKey] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                                        <span className="font-medium">Lihat {row.assignments?.length || 0} Unit Penanggung Jawab</span>
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-r text-center">{row.unitOfMeasurement || "-"}</TableCell>

                                            <TableCell className="border-r text-center">{row.tw1.weight}</TableCell>
                                            <TableCell className="border-r text-center">{row.tw1.target}</TableCell>

                                            <TableCell className="border-r text-center">{row.tw2.weight}</TableCell>
                                            <TableCell className="border-r text-center">{row.tw2.target}</TableCell>

                                            <TableCell className="border-r text-center">{row.tw3.weight}</TableCell>
                                            <TableCell className="border-r text-center">{row.tw3.target}</TableCell>

                                            <TableCell className="border-r text-center">{row.tw4.weight}</TableCell>
                                            <TableCell className="border-r text-center">{row.tw4.target}</TableCell>
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
                                        </TableRow>
                                        {expandedRows[rowKey] && (
                                            <TableRow className="bg-gray-50/50 dark:bg-gray-900/20">
                                                <TableCell colSpan={12} className="p-4">
                                                    <div className="pl-6">
                                                        <h4 className="text-sm font-semibold mb-3">Detail Assignments (Unit Penanggung Jawab)</h4>
                                                        {row.assignments && row.assignments.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {row.assignments.map(assign => (
                                                                    <div key={assign.id} className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-1 text-sm">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="font-medium text-blue-600 dark:text-blue-400">{assign.unit?.name || '-'}</span>
                                                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">{assign.unit?.category || '-'}</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                                                            <div>
                                                                                <span className="text-gray-500 dark:text-gray-400 block">Realization</span>
                                                                                <span className="font-medium">{assign.realization ?? '-'}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-500 dark:text-gray-400 block">% Real</span>
                                                                                <span className="font-medium">{assign.persReal ?? '-'}</span>
                                                                            </div>
                                                                        </div>
                                                                        {(assign.inputNote || assign.monitorNote) && (
                                                                            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                                                                                {assign.inputNote && <div className="mb-1"><span className="text-gray-500">Input Note:</span> {assign.inputNote}</div>}
                                                                                {assign.monitorNote && <div><span className="text-gray-500">Monitor Note:</span> {assign.monitorNote}</div>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-500 italic py-2">Belum ada unit yang di-assign pada responsibility ini.</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <EditContract
                open={open}
                setOpen={setOpen}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                contractId={selectedContractId}
                getContractData={getContractData}
            />

            <div className="text-sm border-t border-gray-100 pt-3 text-gray-500 font-medium dark:border-gray-800">
                Total data: {groupedContractData.length} entri
            </div>
        </div>
    )
}

export default TableContractManagementDummy
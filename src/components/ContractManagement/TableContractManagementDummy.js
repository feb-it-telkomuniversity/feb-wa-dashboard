'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Ellipsis, FileEditIcon, FileTextIcon, Eye, Loader2, PackageOpenIcon, PlusCircle, Search, SearchX, Trash2, X } from "lucide-react"
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
            const key = item.responsibility + (item.unit || '')
            if (!grouped[key]) {
                grouped[key] = {
                    id: item.id,
                    responsibility: item.responsibility,
                    unit: item.unit || "-",
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
            unit: item.unit,
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
                                return (
                                    <TableRow key={row.id || idx}>
                                        <TableCell className="border-r text-center">{rowNumber}</TableCell>
                                        <TableCell className="border-r" title={row.responsibility || "-"}>{row.responsibility || "-"}</TableCell>
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
                                                        <Link href={`/dashboard/kontrak-management/${row.id || 'detail'}`} className="flex items-center gap-4">
                                                            <Eye className="w-3.5 h-3.5" /> <span>Detail</span>
                                                        </Link>
                                                    </DropdownMenuItem>
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
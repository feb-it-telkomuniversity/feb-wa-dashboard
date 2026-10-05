'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Checkbox } from "../ui/checkbox";
import { Edit3, ExternalLink, PlusCircleIcon, Search, SearchX, PackageOpenIcon, Loader2, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from "@/hooks/use-debounce";
import React, { useEffect, useState } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import api from "@/lib/axios";
import ExportExcelButton from "../shared/ExportExcelButton";

const formatRangeInfo = (pagination, currentPage) => {
    const total = pagination?.totalItems ?? 0
    const pageSize = pagination?.pageSize ?? 0

    if (total === 0 || pageSize === 0) {
        return "Menampilkan 0-0 dari 0 entri"
    }

    const safePage = Math.max(currentPage || 1, 1)
    const start = (safePage - 1) * pageSize + 1
    const end = Math.min(safePage * pageSize, total)

    return `Menampilkan ${start}-${end} dari ${total} entri`
}

const TableManagementReport = ({
    onEditIndicator,
    onStatusUpdate,
    onStatsUpdate,
    onAddReport,
    refreshKey,
    isLoading,
    setIsLoading
}) => {
    const [indicators, setIndicators] = useState([])
    const [toggleLoading, setToggleLoading] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPage: 0,
        currentPage: 1,
        pageSize: 10,
        currentYear: new Date().getFullYear()
    })

    const [searchTerm, setSearchTerm] = useState('')
    const [rowFilter, setRowFilter] = useState(10)
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear())
    const debounceSearch = useDebounce(searchTerm, 500)

    // Generate year options (current year and 5 years back)
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

    const getManagementReportData = React.useCallback(async (page = 1) => {
        try {
            setIsLoading(true)

            const params = {
                page,
                limit: rowFilter,
                search: debounceSearch || "",
                year: yearFilter || undefined
            }

            const res = await api.get(`/api/management-reports`, {
                params: params,
            })

            if (res.data && res.data.success) {
                const { data = [], pagination: resPagination } = res.data
                setIndicators(Array.isArray(data) ? data : [])

                if (resPagination) {
                    setPagination(resPagination);
                    setCurrentPage(resPagination.currentPage);
                } else {
                    setPagination({
                        totalItems: 0,
                        totalPage: 0,
                        currentPage: page,
                        pageSize: rowFilter,
                        currentYear: yearFilter
                    });
                    setCurrentPage(page);
                }

                if (onStatsUpdate) {
                    const currentPageData = res.data.data || []
                    onStatsUpdate({
                        total: resPagination?.totalItems || 0,
                        completedTW1: currentPageData.filter((i) => i.tw1).length,
                        completedTW2: currentPageData.filter((i) => i.tw2).length,
                        completedTW3: currentPageData.filter((i) => i.tw3).length,
                        completedTW4: currentPageData.filter((i) => i.tw4).length,
                    })
                }
            }

        } catch (err) {
            console.error("Gagal fetch data:", err)
            setIndicators([])
        } finally {
            setIsLoading(false)
        }
    }, [rowFilter, debounceSearch, yearFilter, onStatsUpdate]);

    useEffect(() => {
        getManagementReportData(1)
    }, [rowFilter, debounceSearch, yearFilter, refreshKey])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPage) {
            getManagementReportData(newPage)
        }
    }

    const handleClearSearch = () => {
        setSearchTerm('')
    }

    const handleToggle = async (indicatorId, quarter, currentStatus) => {
        const key = `${indicatorId}-${quarter}`

        // Optimistic update
        setIndicators((prev) =>
            prev.map((ind) =>
                ind.id === indicatorId ? { ...ind, [quarter]: !currentStatus } : ind
            )
        )

        // Set loading state for this specific cell
        setToggleLoading((prev) => ({ ...prev, [key]: true }))

        try {
            await api.patch(
                `/api/management-reports/${indicatorId}/toggle`,
                {
                    quarter,
                    value: !currentStatus,
                }
            )

            if (onStatusUpdate) {
                onStatusUpdate(indicatorId, quarter, !currentStatus)
            }
        } catch (error) {
            console.error("Gagal toggle status indikator:", error)

            // Revert perubahan optimistik jika gagal
            setIndicators((prev) =>
                prev.map((ind) =>
                    ind.id === indicatorId ? { ...ind, [quarter]: currentStatus } : ind
                )
            )
        } finally {
            setToggleLoading((prev) => {
                const { [key]: _, ...rest } = prev
                return rest
            })
        }
    }

    const handleEditIndicator = (indicator) => {
        if (onEditIndicator) {
            onEditIndicator(indicator)
        }
    }

    const managementReportColumns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Indikator', key: 'indicator', width: 40 },
        { header: 'Link bukti', key: 'evidenceLink', width: 40, style: { alignment: { wrapText: true } } },
        { header: 'Tahun', key: 'year', width: 8 },
        { header: 'Triwulan 1', key: 'tw1', width: 15 },
        { header: 'Triwulan 2', key: 'tw2', width: 15 },
        { header: 'Triwulan 3', key: 'tw3', width: 15 },
        { header: 'Triwulan 4', key: 'tw4', width: 15 },
    ]

    const handleMapData = (item) => {
        return {
            indicator: item.indicator,
            evidenceLink: item.evidenceLink,
            year: item.year,
            tw1: item.tw1,
            tw2: item.tw2,
            tw3: item.tw3,
            tw4: item.tw4,
        }
    }

    return (
        <>
            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center w-full">
                        <div className="relative flex-1 w-full lg:w-auto">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari indikator atau link evidence..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-9 w-full"
                            />
                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                            <ExportExcelButton
                                apiEndpoint="/api/management-reports"
                                fileName="Rekap_Lapman"
                                sheetName="Laporan Manajemen"
                                columns={managementReportColumns}
                                mapData={handleMapData}
                            />
                            <Select
                                value={String(yearFilter)}
                                onValueChange={(value) => setYearFilter(parseInt(value))}
                            >
                                <SelectTrigger className="w-[120px] sm:w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearOptions.map((year) => (
                                        <SelectItem key={year} value={String(year)}>
                                            Tahun {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={String(rowFilter)}
                                onValueChange={(value) => setRowFilter(parseInt(value))}
                            >
                                <SelectTrigger className="w-[130px] sm:w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 data</SelectItem>
                                    <SelectItem value="25">25 data</SelectItem>
                                    <SelectItem value="50">50 data</SelectItem>
                                    <SelectItem value="100">100 data</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={onAddReport} className="ml-auto sm:ml-0">
                                <PlusCircleIcon className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Buat Pelaporan</span>
                                <span className="sm:hidden">Buat</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Mencari data...
                </div>
            )}

            {!isLoading && indicators.length === 0 && debounceSearch && (
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

            {!isLoading && indicators.length === 0 && !debounceSearch && (
                <div className="text-center py-8 text-gray-500">
                    <PackageOpenIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada data indikator</p>
                </div>
            )}

            {/* Indicators Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Indikator LAPMAN Fakultas</CardTitle>
                    <CardDescription>
                        Daftar indikator laporan manajemen dengan status per triwulan
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="overflow-x-auto w-full border-t sm:border-t-0">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="min-w-[250px] w-[35%]">
                                        Indikator Lapman Fakultas
                                    </TableHead>
                                    <TableHead className="min-w-[200px] w-[25%]">Link Evidence</TableHead>
                                    <TableHead className="text-center whitespace-nowrap min-w-[90px]">Status TW 1</TableHead>
                                    <TableHead className="text-center whitespace-nowrap min-w-[90px]">Status TW 2</TableHead>
                                    <TableHead className="text-center whitespace-nowrap min-w-[90px]">Status TW 3</TableHead>
                                    <TableHead className="text-center whitespace-nowrap min-w-[90px]">Status TW 4</TableHead>
                                    <TableHead className="text-center whitespace-nowrap min-w-[80px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!isLoading && indicators.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            Tidak ada indikator ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    indicators.map((indicator) => (
                                        <TableRow key={indicator.id}>
                                            <TableCell className="font-medium">
                                                {indicator.indicator}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {indicator.evidenceLink ? (
                                                        indicator.evidenceLink.split("\n").map(
                                                            (link, idx) =>
                                                                link.trim() && (
                                                                    <a
                                                                        key={idx}
                                                                        href={link.trim()}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                                                    >
                                                                        {link.trim()}
                                                                        <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                )
                                                        )
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={indicator.tw1 || false}
                                                    onCheckedChange={() =>
                                                        handleToggle(
                                                            indicator.id,
                                                            "tw1",
                                                            indicator.tw1 || false
                                                        )
                                                    }
                                                    className="mx-auto"
                                                    disabled={
                                                        !!toggleLoading[`${indicator.id}-tw1`] || isLoading
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={indicator.tw2 || false}
                                                    onCheckedChange={() =>
                                                        handleToggle(
                                                            indicator.id,
                                                            "tw2",
                                                            indicator.tw2 || false
                                                        )
                                                    }
                                                    className="mx-auto"
                                                    disabled={
                                                        !!toggleLoading[`${indicator.id}-tw2`] || isLoading
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={indicator.tw3 || false}
                                                    onCheckedChange={() =>
                                                        handleToggle(
                                                            indicator.id,
                                                            "tw3",
                                                            indicator.tw3 || false
                                                        )
                                                    }
                                                    className="mx-auto"
                                                    disabled={
                                                        !!toggleLoading[`${indicator.id}-tw3`] || isLoading
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={indicator.tw4 || false}
                                                    onCheckedChange={() =>
                                                        handleToggle(
                                                            indicator.id,
                                                            "tw4",
                                                            indicator.tw4 || false
                                                        )
                                                    }
                                                    className="mx-auto"
                                                    disabled={
                                                        !!toggleLoading[`${indicator.id}-tw4`] || isLoading
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditIndicator(indicator)}
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {!isLoading && indicators.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 border-t border-border/40 pt-4">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {formatRangeInfo(pagination, currentPage)}
                    </div>

                    <div className="flex justify-end">
                        <Pagination>
                            <PaginationContent className="gap-1.5">
                                <PaginationItem>
                                    <PaginationPrevious href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(currentPage - 1)
                                        }}
                                        className={`h-8 w-8 p-0 flex items-center justify-center rounded-md border [&>span]:hidden ${currentPage === 1 ? "pointer-events-none opacity-50 border-border" : "cursor-pointer border-border/70 hover:bg-muted"}`}
                                    />
                                </PaginationItem>

                                {Array.from({ length: pagination.totalPage }, (_, i) => i + 1).map((page) => {
                                    // Tampilkan halaman 1, halaman terakhir, dan halaman di sekitar current page
                                    if (
                                        page === 1 ||
                                        page === pagination.totalPage ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === currentPage}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(page);
                                                    }}
                                                    className={`h-8 w-8 p-0 flex items-center justify-center rounded-md font-medium text-sm transition-colors ${
                                                        page === currentPage 
                                                            ? "bg-[#009da5] text-white hover:bg-[#008c93] hover:text-white border-transparent" 
                                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent bg-transparent"
                                                    }`}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        // Tampilkan Ellipsis jika ada gap
                                        return <PaginationItem key={page} className="text-slate-400"><PaginationEllipsis /></PaginationItem>
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(currentPage + 1)
                                        }}
                                        className={`h-8 w-8 p-0 flex items-center justify-center rounded-md border [&>span]:hidden ${currentPage === pagination.totalPage ? "pointer-events-none opacity-50 border-border" : "cursor-pointer border-border/70 hover:bg-muted"}`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}
        </>
    )
}

export default TableManagementReport
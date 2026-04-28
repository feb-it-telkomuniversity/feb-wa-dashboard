'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Ellipsis, FileEditIcon, Loader2, PackageOpenIcon, PlusCircle, Search, SearchX, Trash2, X } from "lucide-react"
import React, { useEffect, useState, useRef } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from "@/hooks/use-debounce"
import SubmissionDetailDrawer from "./submission-detail-drawer"
import ImplementationDetailDrawer from "./implementation-detail-drawer"
import { Button } from "../ui/button"
import FilterTablePartnership from "./filter-table"
import AddPartnership from "./addPartnership"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import EditSubmission from "./edit-submission"
import EditApproval from "./edit-approval"
import EditStatusActivityPartnership from "./edit-status-activity-partnership"
import DeletePartnership from "./delete-partnership"
import api from "@/lib/axios"
import ExportExcelButton from "../shared/ExportExcelButton"

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

const isPartnershipActive = (validUntil) => {
  if (!validUntil) return null;
  const validDate = new Date(validUntil);
  const today = new Date();
  today.setHours(0,0,0,0);
  validDate.setHours(0,0,0,0);
  return validDate >= today;
}

const formatRangeInfo = (pagination, currentPage) => {
  const total = pagination?.totalItems ?? 0
  const pageSize = pagination?.pageSize ?? 0

  if (total === 0 || pageSize === 0) {
    return "0–0 dari 0"
  }

  const safePage = Math.max(currentPage || 1, 1)
  const start = (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, total)

  return `${start} – ${end} dari ${total} data`
}

const TableCombined = () => {
  const [partnershipData, setPartnershipData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    totalItem: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 15
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [rowFilter, setRowFilter] = useState(15)
  const debounceSearch = useDebounce(searchTerm, 500)
  const [filters, setFilters] = useState({
    scope: null,
    docType: null,
    status: null,
    archive: null,
    year: null,
  })

  const listRef = useRef(null)

  const getPartnershipData = React.useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      const params = {
        page,
        limit: rowFilter,
        search: debounceSearch || "",
        scope: filters.scope,
        docType: filters.docType,
        status: filters.status,
        archive: filters.archive,
        year: filters.year,
        yearIssued: filters.year,
      }

      const res = await api.get(`/api/partnership`, {
        params: params,
      })

      if (res.data) {
        const { data = [], pagination: resPagination } = res.data
        setPartnershipData(Array.isArray(data) ? data : [])

        if (resPagination) {
          setPagination(resPagination);
          setCurrentPage(resPagination.currentPage);
        } else {
          setPagination({
            totalItem: 0,
            totalPages: 0,
            currentPage: page,
            pageSize: rowFilter,
          });
          setCurrentPage(page);
        }
      }

    } catch (err) {
      console.error("Gagal fetch data:", err)
      setPartnershipData([])
    } finally {
      setIsLoading(false)
    }
  }, [rowFilter, debounceSearch, filters]);

  useEffect(() => {
    getPartnershipData(1)
  }, [rowFilter, debounceSearch, getPartnershipData, filters])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [pagination.currentPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getPartnershipData(newPage)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const handleResetFilters = () => {
    setFilters({ scope: null, docType: null, status: null, archive: null, year: null })
  }

  const partnershipColumns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Tahun', key: 'yearIssued', width: 8 },
    { header: 'Nama Mitra', key: 'partnerName', width: 35, style: { alignment: { wrapText: true } } },
    { header: 'Tipe Dokumen', key: 'docType', width: 15 },
    { header: 'Jenis Kerjasama', key: 'partnershipType', width: 15 },
    { header: 'Lingkup', key: 'scope', width: 15 },
    { header: 'No. Internal', key: 'docNumberInternal', width: 25 },
    { header: 'No. Eksternal', key: 'docNumberExternal', width: 25 },
    { header: 'Link Dokumen', key: 'docLink', width: 30 },
    { header: 'Tgl Dibuat', key: 'dateCreated', width: 15 },
    { header: 'Tgl TTD', key: 'dateSigned', width: 15 },
    { header: 'Berlaku Hingga', key: 'validUntil', width: 15 },
    { header: 'Durasi', key: 'duration', width: 15 },
    { header: 'Tipe Penandatanganan', key: 'signingType', width: 20 },
    { header: 'PIC Internal', key: 'picInternal', width: 20 },
    { header: 'PIC Eksternal', key: 'picExternal', width: 20 },
    { header: 'Telp PIC Eksternal', key: 'picExternalPhone', width: 20 },
    { header: 'Kegiatan (Tipe)', key: 'actType', width: 20, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { header: 'Kegiatan (Status)', key: 'actStatus', width: 20, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { header: 'Kegiatan (Catatan)', key: 'actNotes', width: 30, style: { alignment: { wrapText: true, vertical: 'top' } } },
    { header: 'Appr. Wadek 1', key: 'approvalWadek1', width: 15 },
    { header: 'Appr. Wadek 2', key: 'approvalWadek2', width: 15 },
    { header: 'Appr. Kabag KST', key: 'approvalKabagKST', width: 15 },
    { header: 'Appr. Dir SPIO', key: 'approvalDirSPIO', width: 15 },
    { header: 'Appr. Kaur Legal', key: 'approvalKaurLegal', width: 15 },
    { header: 'Appr. Kabag Sekpim', key: 'approvalKabagSekpim', width: 15 },
    { header: 'Appr. Dir SPS', key: 'approvalDirSPS', width: 15 },
    { header: 'Appr. Dekan', key: 'approvalDekan', width: 15 },
    { header: 'Appr. Warek 1', key: 'approvalWarek1', width: 15 },
    { header: 'Appr. Rektor', key: 'approvalRektor', width: 15 },
    { header: 'Catatan Umum', key: 'notes', width: 30 },
    { header: 'Hardcopy', key: 'hasHardcopy', width: 12 },
    { header: 'Softcopy', key: 'hasSoftcopy', width: 12 },
    { header: 'Last Updated', key: 'updatedAt', width: 20 },
  ]

  const handleMapData = (item) => {
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID') : '-';
    const fmtBool = (b) => b ? "Ada" : "Tidak";

    let actType = "-";
    let actStatus = "-";
    let actNotes = "-";

    if (item.activities && item.activities.length > 0) {
      actType = item.activities.map(a => `• ${a.type}`).join('\n');
      actStatus = item.activities.map(a => a.status).join('\n');
      actNotes = item.activities.map(a => a.notes || '-').join('\n');
    }

    return {
      yearIssued: item.yearIssued,
      partnerName: item.partnerName,
      docType: item.docType,
      partnershipType: item.partnershipType,
      scope: item.scope,
      docNumberInternal: item.docNumberInternal || '-',
      docNumberExternal: item.docNumberExternal || '-',
      docLink: item.docLink || '-',
      dateCreated: fmtDate(item.dateCreated),
      dateSigned: fmtDate(item.dateSigned),
      validUntil: fmtDate(item.validUntil),
      duration: item.duration || '-',
      signingType: item.signingType || '-',
      picInternal: item.picInternal || '-',
      picExternal: item.picExternal || '-',
      picExternalPhone: item.picExternalPhone || '-',
      actType: actType,
      actStatus: actStatus,
      actNotes: actNotes,
      approvalWadek1: item.approvalWadek1 || '-',
      approvalWadek2: item.approvalWadek2 || '-',
      approvalKabagKST: item.approvalKabagKST || '-',
      approvalDirSPIO: item.approvalDirSPIO || '-',
      approvalKaurLegal: item.approvalKaurLegal || '-',
      approvalKabagSekpim: item.approvalKabagSekpim || '-',
      approvalDirSPS: item.approvalDirSPS || '-',
      approvalDekan: item.approvalDekan || '-',
      approvalWarek1: item.approvalWarek1 || '-',
      approvalRektor: item.approvalRektor || '-',
      notes: item.notes || '-',
      hasHardcopy: fmtBool(item.hasHardcopy),
      hasSoftcopy: fmtBool(item.hasSoftcopy),
      updatedAt: fmtDate(item.updatedAt),
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4" ref={listRef}>
        <FilterTablePartnership
          filters={filters}
          setFilter={setFilters}
          onReset={handleResetFilters}
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama mitra...."
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
            apiEndpoint="/api/partnership"
            fileName="Rekap_Partnership"
            sheetName="Partnership"
            columns={partnershipColumns}
            mapData={handleMapData}
            queryParams={filters}
          />
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={String(rowFilter)}
            onValueChange={(value) => (setRowFilter(parseInt(value)))}
          >
            <SelectTrigger className="w-full sm:w-48 text-start">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">Menampilkan 15 data</SelectItem>
              <SelectItem value="30">Menampilkan 30 data</SelectItem>
              <SelectItem value="3000">Semua Data</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AddPartnership getPartnershipData={getPartnershipData} />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Mencari data...
        </div>
      )}

      {!isLoading && partnershipData.length === 0 && debounceSearch && (
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

      {/* Horizontal Scroll Wrapper */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow dark:border-gray-800">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Tahun</TableHead>
              <TableHead className="whitespace-nowrap">Tipe Dokumen</TableHead>
              <TableHead className="whitespace-nowrap min-w-[200px]">Mitra</TableHead>
              <TableHead className="whitespace-nowrap">Tingkat</TableHead>
              <TableHead className="whitespace-nowrap">Jenis Kerjasama</TableHead>
              <TableHead className="whitespace-nowrap">PIC Internal</TableHead>
              <TableHead className="whitespace-nowrap">Berlaku hingga</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap text-center sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] border-l">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partnershipData.map((partnership) => {
              const isActive = isPartnershipActive(partnership.validUntil);
              return (
              <TableRow key={partnership.id}>
                <TableCell className="whitespace-nowrap">{partnership.yearIssued || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {partnership.docType || "-"}
                  </span>
                </TableCell>
                <TableCell className="max-w-[250px] overflow-hidden text-ellipsis px-4 py-2" title={partnership.partnerName || "-"}>
                  <div className="truncate font-medium">{partnership.partnerName || "-"}</div>
                </TableCell>
                <TableCell className="capitalize whitespace-nowrap">{partnership.scope || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{partnership.partnershipType || "-"}</TableCell>
                <TableCell className="capitalize whitespace-nowrap">{partnership.picInternal || "-"}</TableCell>
                <TableCell className="text-emerald-600 font-medium whitespace-nowrap">
                  {formatDate(partnership.validUntil)}
                </TableCell>
                <TableCell>
                  {isActive === null ? "-" : isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Tidak Aktif
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] border-l">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <div className="font-semibold px-2 py-1.5 text-xs text-muted-foreground uppercase">Tampilan Dokumen</div>
                      <DropdownMenuItem asChild>
                        <SubmissionDetailDrawer 
                          partnershipId={partnership.id}
                          partnership={partnership} 
                          onSuccess={() => getPartnershipData(currentPage)}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <ImplementationDetailDrawer 
                          partnershipId={partnership.id}
                          partnership={partnership} 
                          onSuccess={() => getPartnershipData(currentPage)}
                        />
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      
                      <div className="font-semibold px-2 py-1.5 text-xs text-muted-foreground uppercase">Data Persetujuan</div>
                      <DropdownMenuItem asChild>
                        <EditSubmission
                          partnershipId={partnership.id}
                          partnership={partnership}
                          onSuccess={() => getPartnershipData(currentPage)}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <EditApproval
                          partnershipId={partnership.id}
                          partnership={partnership}
                          onSuccess={() => getPartnershipData(currentPage)}
                        />
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <div className="font-semibold px-2 py-1.5 text-xs text-muted-foreground uppercase">Data Penerapan</div>
                      <DropdownMenuItem asChild>
                        <EditStatusActivityPartnership
                          partnershipId={partnership.id}
                          partnership={partnership}
                          activities={partnership.activities}
                          onSuccess={() => getPartnershipData(currentPage)}
                        />
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                        <DeletePartnership
                          partnershipId={partnership.id}
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                          onSuccess={() => getPartnershipData(currentPage)}
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600 mt-2">{formatRangeInfo(pagination, currentPage)}</div>

      <div className="flex justify-start">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(currentPage - 1)
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: Math.max(1, pagination.totalPages) }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === pagination.totalPages ||
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
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(currentPage + 1)
                }}
                className={currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

export default TableCombined

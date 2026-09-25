'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp, ArrowUpDown, CircleFadingArrowUpIcon, Ellipsis, FileEditIcon, Loader2, PackageOpenIcon, PlusCircle, Search, SearchX, Trash2, X, LayoutGrid, TableIcon } from "lucide-react"
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
import { useAuth } from "@/hooks/use-auth"
import PartnershipDetailDrawer from "./partnership-detail-drawer"
import PartnershipGridView from "./partnership-grid-view"
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
import PartnershipReminder, { getStoredReminderDays } from "./partnership-reminder"

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

export const getPartnershipStatusInfo = (validUntil, reminderDays = 30) => {
  if (!validUntil) return { status: 'none', label: '-' };
  const validDate = new Date(validUntil);
  if (isNaN(validDate.getTime())) return { status: 'none', label: '-' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  validDate.setHours(0, 0, 0, 0);

  const diffTime = validDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      label: 'Tidak Aktif',
      colorClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300'
    };
  } else if (diffDays <= reminderDays) {
    return {
      status: 'expiring',
      label: `Akan Berakhir (${diffDays === 0 ? 'Hari Ini' : `H-${diffDays}`})`,
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300'
    };
  } else {
    return {
      status: 'active',
      label: 'Aktif',
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
    };
  }
};

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

const approvalHierarchy = {
  MoA: [
    { name: 'approvalWadek2', label: 'Wadek II' },
    { name: 'approvalWadek1', label: 'Wadek I' },
    { name: 'approvalDirSPIO', label: 'Dir. SPIO' },
    { name: 'approvalDirMIK', label: 'Dir. MIK' },
    { name: 'approvalKaurLegal', label: 'Ka. Ur. Legal' },
    { name: 'approvalDekan', label: 'Dekan' }
  ],
  MoU: [
    { name: 'approvalWadek2', label: 'Wadek II' },
    { name: 'approvalWadek1', label: 'Wadek I' },
    { name: 'approvalDirSPIO', label: 'Dir. SPIO' },
    { name: 'approvalDirMIK', label: 'Dir. MIK' },
    { name: 'approvalKaurLegal', label: 'Ka. Ur. Legal' },
    { name: 'approvalWarek1', label: 'Warek I' },
    { name: 'approvalRektor', label: 'Rektor' }
  ],
  IA: [
    { name: 'approvalWadek2', label: 'Wadek II' },
    { name: 'approvalWadek1', label: 'Wadek I' },
    { name: 'approvalDirSPIO', label: 'Dir. SPIO' },
    { name: 'approvalDekan', label: 'Dekan' }
  ]
};

export const getApprovalProgress = (partnership) => {
  const docTypeStr = partnership?.docType?.trim()?.toLowerCase() || '';
  let key = 'IA';
  if (docTypeStr.includes('moa')) key = 'MoA';
  else if (docTypeStr.includes('mou')) key = 'MoU';
  else if (docTypeStr === 'ia' || docTypeStr.includes('implementation')) key = 'IA';

  const requiredFields = approvalHierarchy[key] || approvalHierarchy.IA;
  const total = requiredFields.length;
  const approvedCount = requiredFields.filter(item => {
    const val = partnership?.[item.name];
    return val && (val.toLowerCase() === 'approved' || val.toLowerCase() === 'disetujui');
  }).length;

  const isComplete = approvedCount === total;
  const hasReturned = requiredFields.some(item => {
    const val = partnership?.[item.name];
    return val && (val.toLowerCase() === 'returned' || val.toLowerCase() === 'dikembalikan');
  });

  return { approvedCount, total, isComplete, hasReturned };
};

const TableCombined = () => {
  const { user } = useAuth()
  const isAdmin = ['admin', 'super_admin'].includes(user?.role?.toLowerCase())

  const [partnershipData, setPartnershipData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState('table')
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
    yearIssued: null,
  })

  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')

  const [selectedPartnership, setSelectedPartnership] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleRowClick = (partnership) => {
    setSelectedPartnership(partnership)
    setIsDetailOpen(true)
  }

  const listRef = useRef(null)

  const getPartnershipData = React.useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      const isClientSort = sortBy === 'statusApproval' || sortBy === 'progress'
      const params = {
        page,
        limit: rowFilter,
        search: debounceSearch || "",
        scope: filters.scope,
        docType: filters.docType,
        status: filters.status,
        archive: filters.archive,
        yearIssued: filters.yearIssued,
        sortBy: !isClientSort ? sortBy || undefined : undefined,
        sortOrder: !isClientSort && sortBy ? sortOrder : undefined,
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
  }, [rowFilter, debounceSearch, filters, sortBy, sortOrder]);

  useEffect(() => {
    getPartnershipData(1)
  }, [rowFilter, debounceSearch, getPartnershipData, filters, sortBy, sortOrder])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [pagination.currentPage])

  useEffect(() => {
    const handleFilterExpiring = () => {
      setFilters(prev => ({ ...prev, status: 'expiring' }))
      if (listRef.current) {
        listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    window.addEventListener('mira:filter-expiring', handleFilterExpiring)
    return () => window.removeEventListener('mira:filter-expiring', handleFilterExpiring)
  }, [])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getPartnershipData(newPage)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const handleResetFilters = () => {
    setFilters({ scope: null, docType: null, status: null, archive: null, yearIssued: null })
    setSortBy(null)
    setSortOrder('asc')
  }

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else {
        setSortBy(null)
        setSortOrder('asc')
      }
    } else {
      setSortBy(columnKey)
      setSortOrder('asc')
    }
  }

  const renderSortIcon = (columnKey) => {
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5 text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 text-primary shrink-0 transition-transform" />
      )
    }
    return (
      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    )
  }

  const displayedData = React.useMemo(() => {
    if (!sortBy || (sortBy !== 'statusApproval' && sortBy !== 'progress')) {
      return partnershipData
    }

    return [...partnershipData].sort((a, b) => {
      if (sortBy === 'statusApproval') {
        const progA = getApprovalProgress(a)
        const ratioA = progA.approvedCount / (progA.total || 1)
        const progB = getApprovalProgress(b)
        const ratioB = progB.approvedCount / (progB.total || 1)
        return sortOrder === 'asc' ? ratioA - ratioB : ratioB - ratioA
      }
      if (sortBy === 'progress') {
        const getPct = (item) => {
          const acts = item.activities || []
          if (!acts.length) return -1
          const done = acts.filter(x => x.status?.toLowerCase() === 'terlaksana').length
          return done / acts.length
        }
        return sortOrder === 'asc' ? getPct(a) - getPct(b) : getPct(b) - getPct(a)
      }
      return 0
    })
  }, [partnershipData, sortBy, sortOrder])

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
    { header: 'Appr. Dir MIK', key: 'approvalDirMIK', width: 15 },
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
      approvalDirMIK: item.approvalDirMIK || '-',
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
      <div className="flex items-center gap-2" ref={listRef}>
        <FilterTablePartnership
          filters={filters}
          setFilter={setFilters}
          onReset={handleResetFilters}
          iconOnly={true}
        />
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama mitra...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <ExportExcelButton
          apiEndpoint="/api/partnership"
          fileName="Rekap_Partnership"
          sheetName="Partnership"
          columns={partnershipColumns}
          mapData={handleMapData}
          queryParams={filters}
          iconOnly={true}
        />
        <Select
          value={String(rowFilter)}
          onValueChange={(value) => (setRowFilter(parseInt(value)))}
        >
          <SelectTrigger className="w-[100px] h-9 shrink-0 text-xs">
            <SelectValue placeholder="15 data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 data</SelectItem>
            <SelectItem value="30">30 data</SelectItem>
            <SelectItem value="3000">Semua</SelectItem>
          </SelectContent>
        </Select>

        {viewMode === 'grid' && (
          <Select
            value={sortBy ? `${sortBy}-${sortOrder}` : 'default'}
            onValueChange={(value) => {
              if (value === 'default') {
                setSortBy(null)
                setSortOrder('asc')
              } else {
                const [key, order] = value.split('-')
                setSortBy(key)
                setSortOrder(order)
              }
            }}
          >
            <SelectTrigger className="w-[180px] h-9 shrink-0 text-xs">
              <SelectValue placeholder="Urutkan..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (Terbaru)</SelectItem>
              <SelectItem value="yearIssued-desc">Tahun (Terbaru)</SelectItem>
              <SelectItem value="yearIssued-asc">Tahun (Terlama)</SelectItem>
              <SelectItem value="partnerName-asc">Nama Mitra (A-Z)</SelectItem>
              <SelectItem value="partnerName-desc">Nama Mitra (Z-A)</SelectItem>
              <SelectItem value="validUntil-desc">Masa Berlaku (Terlama)</SelectItem>
              <SelectItem value="validUntil-asc">Masa Berlaku (Terbaru)</SelectItem>
              <SelectItem value="docType-asc">Tipe Dokumen (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-lg p-1 flex items-center h-9 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            title="Table View"
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>

        {isAdmin && (
          <AddPartnership getPartnershipData={getPartnershipData} iconOnly={true} />
        )}
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

      {/* View Wrapper */}
      {viewMode === 'grid' ? (
        <PartnershipGridView 
            partnerships={partnershipData}
            isAdmin={isAdmin}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            getPartnershipData={getPartnershipData}
            currentPage={currentPage}
            handleRowClick={handleRowClick}
            getStoredReminderDays={getStoredReminderDays}
        />
      ) : (
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow dark:border-gray-800">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => handleSort('yearIssued')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Tahun"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tahun</span>
                  {renderSortIcon('yearIssued')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('docType')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Tipe Dokumen"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tipe Dokumen</span>
                  {renderSortIcon('docType')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('partnerName')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Nama Mitra"
              >
                <div className="flex items-center gap-1.5">
                  <span>Mitra</span>
                  {renderSortIcon('partnerName')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('scope')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Tingkat"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tingkat</span>
                  {renderSortIcon('scope')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('partnershipType')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Bidang Kerjasama"
              >
                <div className="flex items-center gap-1.5">
                  <span>Bidang Kerjasama</span>
                  {renderSortIcon('partnershipType')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('picInternal')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan PIC Internal"
              >
                <div className="flex items-center gap-1.5">
                  <span>PIC Internal</span>
                  {renderSortIcon('picInternal')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('validUntil')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Masa Berlaku"
              >
                <div className="flex items-center gap-1.5">
                  <span>Berlaku hingga</span>
                  {renderSortIcon('validUntil')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('status')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Status Keaktifan"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('statusApproval')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Status Persetujuan"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status Persetujuan</span>
                  {renderSortIcon('statusApproval')}
                </div>
              </TableHead>

              <TableHead
                onClick={() => handleSort('progress')}
                className="whitespace-nowrap cursor-pointer select-none hover:bg-muted/60 transition-colors group"
                title="Urutkan berdasarkan Pelaksanaan"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pelaksanaan</span>
                  {renderSortIcon('progress')}
                </div>
              </TableHead>

              {isAdmin && (
                <TableHead className="whitespace-nowrap text-center sticky right-0 bg-background">Aksi</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedData.map((partnership) => {
              return (
                <TableRow
                  key={partnership.id}
                  onClick={() => handleRowClick(partnership)}
                  className="cursor-pointer hover:bg-teal-50/60 dark:hover:bg-slate-800/60 transition-colors group select-none"
                  title="Klik untuk melihat detail lengkap informasi kemitraan"
                >
                  <TableCell className="whitespace-nowrap">{partnership.yearIssued || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-600 text-teal-200">
                      {partnership.docType || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[250px] overflow-hidden text-ellipsis px-4 py-2" title={partnership.partnerName || "-"}>
                    <div className="truncate font-medium">{partnership.partnerName || "-"}</div>
                  </TableCell>
                  <TableCell className="capitalize whitespace-nowrap">{partnership.scope || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {Array.isArray(partnership.partnershipType) && partnership.partnershipType.length > 0
                      ? (
                        <div className="flex flex-wrap gap-1">
                          {partnership.partnershipType.map((type, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border">
                              {type}
                            </span>
                          ))}
                        </div>
                      )
                      : partnership.partnershipType
                        ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border">
                            {partnership.partnershipType}
                          </span>
                        )
                        : <span className="text-muted-foreground">-</span>
                    }
                  </TableCell>
                  <TableCell className="capitalize whitespace-nowrap">{partnership.picInternal || "-"}</TableCell>
                  <TableCell className="text-emerald-600 font-medium whitespace-nowrap">
                    {formatDate(partnership.validUntil)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {(() => {
                      const statusInfo = getPartnershipStatusInfo(partnership.validUntil, getStoredReminderDays());
                      if (statusInfo.status === 'none') return "-";
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.colorClass}`}>
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {(() => {
                      const { approvedCount, total, isComplete, hasReturned } = getApprovalProgress(partnership);
                      let colorClass = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300";
                      if (isComplete) {
                        colorClass = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300";
                      } else if (hasReturned) {
                        colorClass = "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300";
                      } else if (approvedCount === 0) {
                        colorClass = "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
                      }
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
                          {approvedCount}/{total} Approved
                        </span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    {partnership.activities && partnership.activities.length > 0 ? (() => {
                      const total = partnership.activities.length;
                      const done = partnership.activities.filter(a => a.status?.toLowerCase() === "terlaksana").length;
                      const percentage = total > 0 ? (done / total) * 100 : 0
                      return (
                        <div className="flex flex-col gap-1.5 w-full mt-0.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-medium text-slate-500 dark:text-slate-400">Progress</span>
                            <span className="font-bold text-teal-600 dark:text-rose-400">{done}/{total}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-400 to-red-600 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })() : (
                      <span className="text-[11px] text-slate-400 italic">Belum ada aktivitas</span>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell 
                      className="text-center sticky right-0 bg-background"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Ellipsis className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="">
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
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      )}

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

      {selectedPartnership && (
        <PartnershipDetailDrawer
          partnershipId={selectedPartnership.id}
          partnership={selectedPartnership}
          open={isDetailOpen}
          onOpenChange={(open) => {
            setIsDetailOpen(open);
            if (!open) {
              setSelectedPartnership(null);
            }
          }}
          onSuccess={(updated) => {
            if (updated) {
              setSelectedPartnership(updated);
            }
            getPartnershipData(currentPage);
          }}
        />
      )}
    </div>
  )
}

export default TableCombined

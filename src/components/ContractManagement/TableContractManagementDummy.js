'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight, Edit, Ellipsis, Eye, Loader2, PackageOpenIcon, Search, SearchX, X, Pencil, ShieldUser, BookA, Bubbles, Cog } from "lucide-react"
import React, { useEffect, useState } from "react"

import { Input } from "../ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Tabs as AnimatedTabs } from "@/components/shadcn-space/tabs/tabs-02"
import AddContract from "./add-contract"
import FilterTableContractManagement from "./filter-table"
import EditContract from "./edit-contract"
import api from "@/lib/axios"

import DeleteContract from "./delete-contract"
import InputRealisasiModal from "./InputRealisasiModal"
import ExportExcelButton from "../shared/ExportExcelButton"
import { useAuth } from "@/hooks/use-auth"
import MiniAttachmentViewer from "./MiniAttachmentViewer"
import { motion, AnimatePresence } from "framer-motion";


const CATEGORY_LABELS = {
    "Financial": "FINANCIAL",
    "NonFinancial": "NON FINANCIAL",
    "InternalBusinessProcess": "INTERNAL BUSINESS PROCESS"
};
const SUB_CATEGORY_LABELS = {
    "KepuasanCustomer": "Kepuasan & Customer",
    "InternalBusinessProcess": "Internal Business Process",
    "PendidikanMahasiswa": "Pendidikan Mahasiswa",
    "RisetAbdimas": "Riset dan Abdimas",
    "PrestasiMahasiswa": "Prestasi Mahasiswa",
    "Internasionalisasi": "Internasionalisasi",
    "SDM": "Sumber Daya Manusia (SDM)",
    "TransformasiDigital": "Transformasi Digital dalam Pembelajaran",
    "InovasiEntrepreneurship": "Inovasi dan Entrepreneurship",
    "OperasionalKolaborasi": "Operasional & Kolaborasi (Entrepreneur/Academic Support)",
    "AkreditasiSertifikasi": "Akreditasi, Sertifikasi, dan Pembentukan Prodi Baru",
    "PengembanganSDM": "Pengembangan SDM (Kewajiban & Kontrak Manajemen)",
    "DukunganData": "Dukungan Data, Administrasi, dan Kesekretariatan",
    "Lainnya": "Lainnya"
}

const CATEGORY_STYLES = {
    "Financial": {
        row: "bg-teal-50/80 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50 hover:bg-teal-50/80",
        text: "text-teal-700 dark:text-teal-400"
    },
    "NonFinancial": {
        row: "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 hover:bg-blue-50/80",
        text: "text-blue-700 dark:text-blue-400"
    },
    "InternalBusinessProcess": {
        row: "bg-purple-50/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 hover:bg-purple-50/80",
        text: "text-purple-700 dark:text-purple-400"
    },
    "Default": {
        row: "bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-100/80",
        text: "text-slate-700 dark:text-slate-200"
    }
};

const renderValue = (val) => val ? val : <span className="text-slate-300 dark:text-slate-600">—</span>;

const TableContractManagementDummy = () => {
    const { user } = useAuth()
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
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState(null)

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
        setFilters({ category: null, subCategory: null, quarterly: null, unit: null })
    }

    const availableSubCategories = React.useMemo(() => {
        const subCats = new Set()
        contractData.forEach(item => {
            if (item.subCategory) subCats.add(item.subCategory)
        })
        return Array.from(subCats).sort()
    }, [contractData])

    const groupedContractData = React.useMemo(() => {
        const categoryOrder = {
            "Financial": 1,
            "NonFinancial": 2,
            "InternalBusinessProcess": 3
        }

        const detectSubCategory = (responsibilityText, category) => {
            if (category !== "NonFinancial" || !responsibilityText) return null;

            const text = responsibilityText.toLowerCase();
            if (text.includes("edom") || text.includes("satisfaction")) return "KepuasanCustomer";
            if (text.includes("lulusan mendapat") || text.includes("tepat waktu") || text.includes("do dan undur") || text.includes("kolaboratif dan partisipatif") || text.includes("luar kampus") || text.includes("infrastruktur laboratorium")) return "PendidikanMahasiswa";
            if (text.includes("scopus") || text.includes("didanai pihak") || text.includes("sitasi") || text.includes("desa binaan") || text.includes("riset internasional") || text.includes("kitupan ilmiah") || text.includes("hki")) return "RisetAbdimas";
            if (text.includes("prestasi") || text.includes("hibah kompetisi") || text.includes("membina kompetisi")) return "PrestasiMahasiswa";
            if (text.includes("kelas internasional") || text.includes("inbound mobility") || text.includes("outbound mobility") || text.includes("tersertifikasi internasional") || text.includes("bereputasi internasional")) return "Internasionalisasi";
            if (text.includes("dosen s3") || text.includes("jfa lektor")) return "SDM";
            if (text.includes("online learning") || text.includes("learning factory") || text.includes("sertifikasi (untuk mahasiswa)")) return "TransformasiDigital";
            if (text.includes("trl >=4") || text.includes("startup") || text.includes("diimplementasikan di industri") || text.includes("berkegiatan tridharma") || text.includes("sertifikasi profesi") || text.includes("wrap research") || text.includes("entrepreneurship") || text.includes("academic survey")) return "InovasiEntrepreneurship";
            if (text.includes("prodi baru")) return "AkreditasiSertifikasi";
            if (text.includes("pengembangan sumber daya") || text.includes("peningkatan kompetensi sdm") || text.includes("penurunan kontrak manajemen")) return "PengembanganSDM";
            if (text.includes("lapman")) return "DukunganData";

            return "Lain-lain"
        }

        let filtered = contractData

        if (filters.subCategory) {
            filtered = filtered.filter(item => item.subCategory === filters.subCategory)
        }

        return filtered.map(item => {
            const detectedSubCategory = detectSubCategory(item.responsibility, item.ContractManagementCategory);
            return {
                id: item.id,
                ContractManagementCategory: item.ContractManagementCategory || 'Lainnya',
                subCategory: item.subCategory || detectedSubCategory,
                responsibility: item.responsibility,
                unitOfMeasurement: item.unitOfMeasurement || "-",
                definition: item.definition,
                objective: item.objective,
                indicatorCalc: item.indicatorCalc,
                assignments: item.assignments || [],
                tw1: { weight: item.weightTw1 ?? "-", target: item.targetTw1 ?? "-" },
                tw2: { weight: item.weightTw2 ?? "-", target: item.targetTw2 ?? "-" },
                tw3: { weight: item.weightTw3 ?? "-", target: item.targetTw3 ?? "-" },
                tw4: { weight: item.weightTw4 ?? "-", target: item.targetTw4 ?? "-" },
            }
        }).sort((a, b) => {
            const orderA = categoryOrder[a.ContractManagementCategory] || 99
            const orderB = categoryOrder[b.ContractManagementCategory] || 99
            if (orderA !== orderB) {
                return orderA - orderB
            }

            if (a.ContractManagementCategory === "NonFinancial") {
                const subA = a.subCategory || "Z_Lainnya"
                const subB = b.subCategory || "Z_Lainnya"
                return subA.localeCompare(subB)
            }
            return 0
        })
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
                    availableSubCategories={availableSubCategories}
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

            <div className="relative rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700 hover:bg-slate-50/80">
                                <TableHead rowSpan={2} className="text-center align-middle text-sm font-bold uppercase tracking-wider dark:text-white w-[50px] border-r border-slate-200/40 dark:border-slate-700/40">No</TableHead>
                                <TableHead rowSpan={2} className="align-middle text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40 w-1/2">Responsibility</TableHead>
                                <TableHead rowSpan={2} className="text-center align-middle text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Unit</TableHead>
                                <TableHead colSpan={2} className="text-center text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40 w-24">TW-1</TableHead>
                                <TableHead colSpan={2} className="text-center text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40 w-24">TW-2</TableHead>
                                <TableHead colSpan={2} className="text-center text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40 w-24">TW-3</TableHead>
                                <TableHead colSpan={2} className="text-center text-sm font-bold uppercase tracking-wider dark:text-white w-24">TW-4</TableHead>
                                {user?.role === 'admin' && (
                                    <TableHead rowSpan={2} className="text-center align-middle text-sm font-bold uppercase tracking-wider dark:text-white border-l border-slate-200/40 dark:border-slate-700/40">Aksi</TableHead>
                                )}
                            </TableRow>
                            <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700 hover:bg-slate-50/80">
                                <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Bobot</TableHead>
                                <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Target</TableHead>
                                <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Bobot</TableHead>
                                <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Target</TableHead>
                                <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Bobot</TableHead>
                                <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Target</TableHead>
                                <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Bobot</TableHead>
                                <TableHead className="text-center text-xs font-medium dark:text-white">Target</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedContractData.map((row, idx, arr) => {
                                const rowNumber = idx + 1
                                const rowKey = row.id || idx
                                const isExpanded = expandedRows[rowKey]

                                const prevCategory = idx > 0 ? arr[idx - 1].ContractManagementCategory : null;
                                const currentCategory = row.ContractManagementCategory;
                                const showCategoryHeader = prevCategory !== currentCategory

                                const prevSubCategory = idx > 0 ? arr[idx - 1].subCategory : null;
                                const currentSubCategory = row.subCategory;
                                const showSubCategoryHeader = currentCategory === "NonFinancial" && prevSubCategory !== currentSubCategory && currentSubCategory;

                                const categoryLabel = CATEGORY_LABELS[currentCategory] || currentCategory.toUpperCase();
                                const styles = CATEGORY_STYLES[currentCategory] || CATEGORY_STYLES.Default;
                                const subCategoryLabel = SUB_CATEGORY_LABELS[currentSubCategory] || currentSubCategory;

                                return (
                                    <React.Fragment key={rowKey}>
                                        {showCategoryHeader && (
                                            <TableRow className={`${styles.row} border-y transition-colors`}>
                                                <TableCell colSpan={13} className={`${styles.text} font-semibold h-9 py-1 px-4 tracking-wider text-xs`}>
                                                    {categoryLabel}
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {showSubCategoryHeader && (
                                            <TableRow className="bg-blue-50/40 dark:bg-blue-900/10 border-y border-blue-100 dark:border-blue-800/30">
                                                <TableCell colSpan={13} className="text-blue-600 dark:text-blue-400 font-medium h-8 py-0.5 px-8 tracking-wide text-[11px] uppercase">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-70"></div>
                                                        {subCategoryLabel}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        <TableRow className={`group transition-colors hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 border-b border-slate-100 dark:border-slate-800/50 ${isExpanded ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}`}>
                                            <TableCell className="text-center font-medium text-slate-500 py-3">{rowNumber}</TableCell>
                                            <TableCell className="py-3 px-3">

                                                <div className="flex flex-col gap-2 py-1">
                                                    <span className="font-medium text-wrap" title={row.responsibility || "—"}>{renderValue(row.responsibility)}</span>
                                                    <button
                                                        onClick={() => toggleRow(rowKey)}
                                                        className="flex items-center w-max gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50"
                                                    >
                                                        {expandedRows[rowKey] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                                        <span className="font-medium">{row.assignments?.length || 0} Detail</span>
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-slate-600 dark:text-slate-400">{renderValue(row.unitOfMeasurement)}</TableCell>

                                            <TableCell className="text-center text-sm font-medium text-slate-600 border-l dark:text-slate-200 border-slate-100/50 dark:border-slate-800/30">{renderValue(row.tw1.weight)}</TableCell>
                                            <TableCell className="text-center text-sm text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/30 dark:bg-slate-900/10">{renderValue(row.tw1.target)}</TableCell>

                                            <TableCell className="text-center text-sm font-medium text-slate-600 border-l dark:text-slate-200 border-slate-100/50 dark:border-slate-800/30">{renderValue(row.tw2.weight)}</TableCell>
                                            <TableCell className="text-center text-sm text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/30 dark:bg-slate-900/10">{renderValue(row.tw2.target)}</TableCell>

                                            <TableCell className="text-center text-sm font-medium text-slate-600 border-l dark:text-slate-200 border-slate-100/50 dark:border-slate-800/30">{renderValue(row.tw3.weight)}</TableCell>
                                            <TableCell className="text-center text-sm text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/30 dark:bg-slate-900/10">{renderValue(row.tw3.target)}</TableCell>

                                            <TableCell className="text-center text-sm font-medium text-slate-600 border-l dark:text-slate-200 border-slate-100/50 dark:border-slate-800/30">{renderValue(row.tw4.weight)}</TableCell>
                                            <TableCell className="text-center text-sm text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/30 dark:bg-slate-900/10">{renderValue(row.tw4.target)}</TableCell>
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
                                            {isExpanded && (
                                                <TableRow key={`detail-${rowKey}`} className="p-0 border-0 hover:bg-transparent">
                                                    <TableCell colSpan={13} className="p-0 border-0">
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
                                                                                                                {user?.role !== 'admin' && (
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
                                                                                                                )}
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

            <InputRealisasiModal
                open={assignmentModalOpen}
                setOpen={setAssignmentModalOpen}
                assignment={selectedAssignment}
                onSuccess={() => getContractData(1)}
            />

            <div className="text-sm border-t border-gray-100 pt-3 text-gray-500 font-medium dark:border-gray-800">
                Total data: {groupedContractData.length} entri
            </div>
        </div>
    )
}

export default TableContractManagementDummy
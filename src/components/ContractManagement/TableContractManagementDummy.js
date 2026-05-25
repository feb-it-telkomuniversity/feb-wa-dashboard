'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight, Edit, Ellipsis, Eye, Loader2, PackageOpenIcon, Search, SearchX, X, Pencil, ShieldUser, BookA, Bubbles, Cog } from "lucide-react"
import React, { useEffect, useState } from "react"

import { Input } from "../ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import AddContract from "./add-contract"
import FilterTableContractManagement from "./filter-table"
import EditContract from "./edit-contract"
import api from "@/lib/axios"

import InputRealisasiModal from "./InputRealisasiModal"
import ExportExcelButton from "../shared/ExportExcelButton"
import { useAuth } from "@/hooks/use-auth"
import { SortableContractRow } from "./SortableContractRow"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';


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
    "RataRataPencapaianPengembanganSumberDaya": "Rata-Rata Pencapaian Pengembangan Sumber Daya",
    "RataRataPencapaianDukunganData": "Rata-Rata Pencapaian Dukungan Data, Administrasi, dan Kesekretariatan",
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
        let filtered = contractData

        if (filters.subCategory) {
            filtered = filtered.filter(item => item.subCategory === filters.subCategory)
        }

        return filtered.map(item => {
            return {
                id: item.id,
                order: item.order,
                ContractManagementCategory: item.ContractManagementCategory || 'Lainnya',
                subCategory: item.subCategory,
                responsibility: item.responsibility,
                unitOfMeasurement: item.unitOfMeasurement || "-",
                definition: item.definition,
                objective: item.objective,
                indicatorCalc: item.indicatorCalc,
                assignments: item.assignments || [],
                tw1: { weight: item.weightTw1 ?? "-", target: item.targetTw1 ?? "-", realization: item.realizationTw1 ?? "-", achievement: item.achievementTw1 ?? "-" },
                tw2: { weight: item.weightTw2 ?? "-", target: item.targetTw2 ?? "-", realization: item.realizationTw2 ?? "-", achievement: item.achievementTw2 ?? "-" },
                tw3: { weight: item.weightTw3 ?? "-", target: item.targetTw3 ?? "-", realization: item.realizationTw3 ?? "-", achievement: item.achievementTw3 ?? "-" },
                tw4: { weight: item.weightTw4 ?? "-", target: item.targetTw4 ?? "-", realization: item.realizationTw4 ?? "-", achievement: item.achievementTw4 ?? "-" },
            }
        }).sort((a, b) => {
            const orderA = a.order ?? 999;
            const orderB = b.order ?? 999;
            return orderA - orderB;
        });
    }, [contractData, filters.subCategory])

    const contractManagementColumns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Responsibility', key: 'responsibility', width: 45 },
        { header: 'Unit', key: 'unit', width: 15 },
        { header: 'TW-1 Bobot', key: 'tw1_weight', width: 10 },
        { header: 'TW-1 Target', key: 'tw1_target', width: 10 },
        { header: 'TW-1 Realisasi', key: 'tw1_realization', width: 10 },
        { header: 'TW-1 Achievement (%)', key: 'tw1_achievement', width: 10 },
        { header: 'TW-2 Bobot', key: 'tw2_weight', width: 10 },
        { header: 'TW-2 Target', key: 'tw2_target', width: 10 },
        { header: 'TW-2 Realisasi', key: 'tw2_realization', width: 10 },
        { header: 'TW-2 Achievement (%)', key: 'tw2_achievement', width: 10 },
        { header: 'TW-3 Bobot', key: 'tw3_weight', width: 10 },
        { header: 'TW-3 Target', key: 'tw3_target', width: 10 },
        { header: 'TW-3 Realisasi', key: 'tw3_realization', width: 10 },
        { header: 'TW-3 Achievement (%)', key: 'tw3_achievement', width: 10 },
        { header: 'TW-4 Bobot', key: 'tw4_weight', width: 10 },
        { header: 'TW-4 Target', key: 'tw4_target', width: 10 },
        { header: 'TW-4 Realisasi', key: 'tw4_realization', width: 10 },
        { header: 'TW-4 Achievement (%)', key: 'tw4_achievement', width: 10 },
    ]

    const handleMapData = (item) => {
        return {
            responsibility: item.responsibility,
            unit: item.unitOfMeasurement,
            tw1_weight: item.tw1.weight,
            tw1_target: item.tw1.target,
            tw1_realization: item.tw1.realization,
            tw1_achievement: item.tw1.achievement,
            tw2_weight: item.tw2.weight,
            tw2_target: item.tw2.target,
            tw2_realization: item.tw2.realization,
            tw2_achievement: item.tw2.achievement,
            tw3_weight: item.tw3.weight,
            tw3_target: item.tw3.target,
            tw3_realization: item.tw3.realization,
            tw3_achievement: item.tw3.achievement,
            tw4_weight: item.tw4.weight,
            tw4_target: item.tw4.target,
            tw4_realization: item.tw4.realization,
            tw4_achievement: item.tw4.achievement,
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setContractData((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const updatedItems = arrayMove(items, oldIndex, newIndex);

                const newOrder = updatedItems.map((item, index) => ({
                    id: item.id,
                    order: index + 1
                }));

                api.patch('/api/contract-management/reorder', { newOrder })
                    .catch((error) => {
                        console.error("Gagal update urutan", error);
                        getContractData(); // rollback
                    });

                return updatedItems.map((item, index) => ({ ...item, order: index + 1 }));
            });
        }
    };

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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700 hover:bg-slate-50/80">
                                    <TableHead rowSpan={2} className="text-center align-middle text-sm font-bold uppercase tracking-wider dark:text-white w-[50px] border-r border-slate-200/40 dark:border-slate-700/40">No</TableHead>
                                    <TableHead rowSpan={2} className="align-middle text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Responsibility</TableHead>
                                    <TableHead rowSpan={2} className="text-center align-middle text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Unit</TableHead>
                                    <TableHead colSpan={4} className="text-center text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">TW-1</TableHead>
                                    <TableHead colSpan={4} className="text-center text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">TW-2</TableHead>
                                    <TableHead colSpan={4} className="text-center text-sm font-bold uppercase tracking-wider dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">TW-3</TableHead>
                                    <TableHead colSpan={4} className="text-center text-sm font-bold uppercase tracking-wider dark:text-white">TW-4</TableHead>
                                    {user?.role === 'admin' && (
                                        <TableHead rowSpan={2} className="text-center align-middle text-sm font-bold uppercase tracking-wider dark:text-white border-l border-slate-200/40 dark:border-slate-700/40">Aksi</TableHead>
                                    )}
                                </TableRow>
                                <TableRow className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-700 hover:bg-slate-50/80">
                                    <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Bobot</TableHead>
                                    <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Target</TableHead>
                                    <TableHead className="text-center text-xs font-medium text-white-600 dark:text-white-400 bg-white-50/50 dark:bg-white-900/10 border-r border-slate-200/40 dark:border-slate-700/40">Realisasi</TableHead>
                                    <TableHead className="text-center text-xs font-medium text-white-600 dark:text-white-400 bg-white-50/50 dark:bg-white-900/10 border-r border-slate-200/40 dark:border-slate-700/40">Achievement</TableHead>

                                    <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Bobot</TableHead>
                                    <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Target</TableHead>
                                    <TableHead className="text-center text-xs font-medium text-white-600 dark:text-white-400 bg-white-50/50 dark:bg-white-900/10 border-r border-slate-200/40 dark:border-slate-700/40">Realisasi</TableHead>
                                    <TableHead className="text-center text-xs font-medium text-white-600 dark:text-white-400 bg-white-50/50 dark:bg-white-900/10 border-r border-slate-200/40 dark:border-slate-700/40">Achievement</TableHead>

                                    <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Bobot</TableHead>
                                    <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Target</TableHead>
                                    <TableHead className="text-center text-xs font-medium text-white-600 dark:text-white-400 bg-white-50/50 dark:bg-white-900/10 border-r border-slate-200/40 dark:border-slate-700/40">Realisasi</TableHead>
                                    <TableHead className="text-center text-xs font-medium text-white-600 dark:text-white-400 bg-white-50/50 dark:bg-white-900/10 border-r border-slate-200/40 dark:border-slate-700/40">Achievement</TableHead>

                                    <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Bobot</TableHead>
                                    <TableHead className="text-center text-xs font-medium dark:text-white border-r border-slate-200/40 dark:border-slate-700/40">Target</TableHead>
                                    <TableHead className="text-center text-xs font-medium text-white-600 dark:text-white-400 bg-white-50/50 dark:bg-white-900/10">Realisasi</TableHead>
                                    <TableHead className="text-center text-xs font-medium text-white-600 dark:text-white-400 bg-white-50/50 dark:bg-white-900/10">Achievement</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <SortableContext items={groupedContractData.map(d => d.id)} strategy={verticalListSortingStrategy}>
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
                                            <SortableContractRow
                                                key={rowKey}
                                                row={row}
                                                rowNumber={rowNumber}
                                                isExpanded={isExpanded}
                                                toggleRow={toggleRow}
                                                renderValue={renderValue}
                                                user={user}
                                                setSelectedContractId={setSelectedContractId}
                                                setOpen={setOpen}
                                                isLoading={isLoading}
                                                setIsLoading={setIsLoading}
                                                getContractData={getContractData}
                                                setSelectedAssignment={setSelectedAssignment}
                                                setAssignmentModalOpen={setAssignmentModalOpen}
                                                showCategoryHeader={showCategoryHeader}
                                                categoryLabel={categoryLabel}
                                                styles={styles}
                                                showSubCategoryHeader={showSubCategoryHeader}
                                                subCategoryLabel={subCategoryLabel}
                                            />
                                        )
                                    })}
                                </SortableContext>
                            </TableBody>
                        </Table>
                    </DndContext>
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
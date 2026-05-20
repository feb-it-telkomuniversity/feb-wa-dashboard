'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"
import { LucideFilter, Trash2 } from "lucide-react"
import { Badge } from "../ui/badge"

const SUB_CATEGORY_LABELS = {
    "KepuasanCustomer": "Kepuasan & Customer",
    "InternalBusinessProcess": "Internal Business Process",
    "PendidikanMahasiswa": "Pendidikan Mahasiswa",
    "RisetAbdimas": "Riset dan Abdimas",
    "PrestasiMahasiswa": "Prestasi Mahasiswa",
    "Internasionalisasi": "Internasionalisasi",
    "SDM": "Sumber Daya Manusia (SDM)",
    "TransformasiDigital": "Transformasi Digital dalam Pembelajaran",
    "InovasiEntrepreneurship": "Inovasi dan Entrepreneurial University",
    "OperasionalKolaborasi": "Operasional & Kolaborasi (Entrepreneur/Academic Support)",
    "AkreditasiSertifikasi": "Akreditasi, Sertifikasi, dan Pembentukan Prodi Baru",
    "PengembanganSDM": "Pengembangan SDM (Kewajiban & Kontrak Manajemen)",
    "DukunganData": "Dukungan Data, Administrasi, dan Kesekretariatan",
    "Lainnya": "Lainnya"
}

const FilterTableContractManagement = ({ filters, setFilters, onReset, availableSubCategories = [] }) => {
    const activeFilterCount = Object.values(filters).filter(Boolean).length

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value === "" ? null : value
        }))
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <LucideFilter />
                    Filter
                    {activeFilterCount > 0 && (
                        <Badge
                            className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-slate-200 text-slate-700">{activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>🐚 Kategori</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={filters.category || ""} onValueChange={(value) => handleFilterChange('category', value)}>
                            <DropdownMenuRadioItem value="">Semua Kategori</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Financial">Financial</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="NonFinancial">Non Financial</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="InternalBusinessProcess">Internal Business Process</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>📂 Sub Kategori</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                        <DropdownMenuRadioGroup value={filters.subCategory || ""} onValueChange={(value) => handleFilterChange('subCategory', value)}>
                            <DropdownMenuRadioItem value="">Semua Sub Kategori</DropdownMenuRadioItem>
                            {availableSubCategories.map((sub) => (
                                <DropdownMenuRadioItem key={sub} value={sub}>
                                    {SUB_CATEGORY_LABELS[sub] || sub}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>


                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>📅 Triwulan</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={filters.quarterly || ""} onValueChange={(v) => handleFilterChange('quarterly', v)}>
                            <DropdownMenuRadioItem value="">Semua Triwulan</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="TW-1">Triwulan 1 (TW-1)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="TW-2">Triwulan 2 (TW-2)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="TW-3">Triwulan 3 (TW-3)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="TW-4">Triwulan 4 (TW-4)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>📊 Unit</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={filters.unit || ""} onValueChange={(v) => handleFilterChange('unit', v)}>
                            <DropdownMenuRadioItem value="">Semua Unit</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="%">Persen (%)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Rp">Rupiah (Rp)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Jumlah">Jumlah</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {activeFilterCount > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={onReset}
                            >
                                <Trash2 className="size-4 mr-2" />
                                Reset Filter
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default FilterTableContractManagement
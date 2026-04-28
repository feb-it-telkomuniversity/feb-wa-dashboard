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
import { useState } from "react"

const FilterTablePartnership = ({ filters, setFilter, onReset }) => {
    const activeFilterCount = Object.values(filters).filter(Boolean).length

    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 6}, (_, i) => (currentYear - i).toString());

    const handleFilterChange = (key, value) => {
        setFilter((prev) => ({
            ...prev,
            [key]: value
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
                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">STATUS</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={filters.status || ""} onValueChange={(value) => handleFilterChange('status', value)}>
                    <DropdownMenuRadioItem value="active">Aktif</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="expiring">Segera Berakhir</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="expired">Kadaluarsa</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>📅 Tahun Transaksi</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-56 overflow-y-auto">
                        <DropdownMenuRadioGroup value={filters.year || ""} onValueChange={(v) => handleFilterChange('year', v)}>
                            {years.map(y => (
                                <DropdownMenuRadioItem key={y} value={y}>{y}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>🌍 Cakupan (Scope)</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={filters.scope || ""} onValueChange={(v) => handleFilterChange('scope', v)}>
                            <DropdownMenuRadioItem value="national">Nasional</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="international">Internasional</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {/* Tipe dokumen */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>📑 Tipe Dokumen</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={filters.docType || ""} onValueChange={(v) => handleFilterChange('docType', v)}>
                            <DropdownMenuRadioItem value="MoA">MoA</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="MoU">MoU</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="IA">IA</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Arsip */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>💾 Masalah Arsip</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={filters.archive || ""} onValueChange={(v) => handleFilterChange('archive', v)}>
                            <DropdownMenuRadioItem value="missing_hardcopy">Hardcopy Tidak Ada</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="missing_softcopy">Softcopy Tidak Ada</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="complete">Lengkap</DropdownMenuRadioItem>
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

export default FilterTablePartnership
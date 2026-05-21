"use client";

import RangeCalendar from "@/components/shadcn-space/radix/calendar/calendar-04";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";

// Opsi materi rapat disamakan dengan yang ada di rtm-new-form.js
const materiOptions = [
    "1. Tindak lanjut dari Rapat Tinjauan Manajemen sebelumnya",
    "2. Perubahan yang dipicu oleh isu internal dan eksternal yang mempengaruhi Sistem dan Mutu",
    "3. Hasil Audit",
    "4. Kinerja External Provider (Pemasok, Vendor, Dosen LB, dll)",
    "5. Pencapaian terhadap Sasaran (Sarmut, KM, dll)",
    "6. Umpan Balik dari pihak berkepentingan / pelanggan\n(Tren Hasil Survey Kepuasan Mahasiswa, EDOM/EDWOM/EDPOM, Pegawai, Mitra Kerjasama, Keluhan Pelanggan dll)",
    "7. Kinerja proses dan kesesuaian produk / layanan (Tren hasil pengukuran dan pemantauan)",
    "8. Status tindakan pencegahan dan perbaikan (PTPP)",
    "9. Kecukupan Sumber Daya (Manusia, Teknis, Informasi dan Keuangan)",
    "10. Hasil dari penilaian risiko dan efektivitas tindakan yang diambil untuk menanggapi risiko dan peluang",
    "11. Rekomendasi untuk peningkatan / perbaikan berkelanjutan",
    "12. Kepatuhan dan kesesuaian kebijakan manajemen layanan dan kebijakan lain yang dibutuhkan [ITSMS] (Khusus Dit. PuTI)",
    "13. Tren hasil penilaian formatif dan sumatif [EOMS] (Khusus Fakultas/Prodi)",
    "14. Lainnya",
];

export default function RtmFilter({ filters, setFilters }) {
    const handleDateChange = (date) => {
        setFilters((prev) => ({ ...prev, dateRange: date }));
    };

    const handleMaterialChange = (val) => {
        setFilters((prev) => ({ ...prev, material: val === "all" ? "" : val }));
    };

    const clearFilters = () => {
        setFilters({ dateRange: { from: undefined, to: undefined }, material: "" });
    };

    const hasFilters = (filters.dateRange?.from || filters.dateRange?.to) || filters.material;

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">Filter:</span>
            </div>

            {/* Date Range Filter using the adapted shadcn space component */}
            <RangeCalendar date={filters.dateRange} onDateChange={handleDateChange} />

            {/* Material Filter */}
            <Select value={filters.material || "all"} onValueChange={handleMaterialChange}>
                <SelectTrigger className="w-[300px] bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl shadow-sm h-11">
                    <SelectValue placeholder="Pilih Materi Rapat" />
                </SelectTrigger>
                <SelectContent className="w-1/2">
                    <SelectItem value="all">Semua Materi Rapat</SelectItem>
                    {materiOptions.map((materi, idx) => (
                        <SelectItem key={idx} value={materi}>
                            <span className="line-clamp-2 text-wrap leading-relaxed">{materi}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-11 px-4 rounded-xl"
                >
                    <X className="w-4 h-4 mr-1.5" />
                    Reset
                </Button>
            )}
        </div>
    );
}

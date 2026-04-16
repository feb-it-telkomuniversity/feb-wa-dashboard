"use client";

import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/axios';

/**
 * @param {string} apiEndpoint - Endpoint API (misal: '/api/meetings')
 * @param {string} fileName - Nama file saat didownload (tanpa .xlsx)
 * @param {string} sheetName - Nama sheet di dalam excel
 * @param {Array} columns - Definisi kolom [{ header: 'Judul', key: 'keyData', width: 20 }]
 * @param {Object} queryParams - Parameter tambahan (misal: { year: 2025 })
 * @param {Function} mapData - (Optional) Fungsi custom untuk memformat data sebelum ditulis
 */
export default function ExportExcelButton({
    apiEndpoint,
    fileName = "Export_Data",
    sheetName = "Data",
    columns = [],
    queryParams = {},
    mapData = null,
    data = null
}) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        try {
            setIsLoading(true);

            let rawData = [];

            if (data) {
                rawData = data;
            } else if (apiEndpoint) {
                const params = { ...queryParams, limit: 10000, page: 1 }
                const res = await api.get(apiEndpoint, { params })
                rawData = Array.isArray(res.data) ? res.data : (res.data.data || [])
            }

            if (rawData.length === 0) {
                toast.warning("Oops... Tidak ada data untuk diexport", {
                    style: { background: "#fee2e2", color: "#a1aa18ff" },
                    className: "border border-yellow-500 font-bold"
                })
                return
            }

            // 2. Setup Excel
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet(sheetName)

            // 3. Setup Header
            worksheet.columns = columns

            // Styling Header (Merah MIRA)
            const headerRow = worksheet.getRow(1)
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Putih
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE31E25' } // Merah
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

            // 4. Mapping Data
            // Jika ada fungsi mapData khusus dari parent, pakai itu. Kalau gak, pakai raw.
            const dataToRow = mapData ? rawData.map(mapData) : rawData;

            dataToRow.forEach((item, index) => {
                // Tambahkan nomor urut otomatis jika ada kolom key 'no'
                const rowData = { ...item, no: index + 1 };
                worksheet.addRow(rowData);
            });

            // 5. Download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success("Yess... Data berhasil di export menjadi excel", {
                style: { background: "#f0fdf4", color: "#166534", fontWeight: "bold" },
                className: "border border-green-500 font-bold"
            })
        } catch (error) {
            console.error("Export error:", error)
            toast.error("Oops... terjadi kegagalan saat export data, silahkan dicoba lagi", {
                style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" },
                className: "border border-red-500 font-bold"
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading}
            className="gap-2 dark:bg-green-900 dark:text-green-50 dark:border-green-200 dark:hover:bg-green-100 dark:hover:text-green-800 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
        >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
            {isLoading ? "Downloading..." : "Export Laporan"}
        </Button>
    );
}
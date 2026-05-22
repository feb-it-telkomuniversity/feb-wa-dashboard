import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function ExportRtmExcelButton({ rtmData, isIconOnly = false }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        try {
            setIsLoading(true)
            let fullData = rtmData

            if (rtmData.id) {
                const res = await api.get(`/api/rtm/${rtmData.id}`)
                fullData = res.data?.data || rtmData
            }

            if (!fullData || !fullData.discussions || fullData.discussions.length === 0) {
                toast.warning("Tidak ada data pembahasan untuk diexport", {
                    position: "bottom-center",
                    style: { background: "#fef08a", color: "#92400e" },
                    className: "border border-yellow-500"
                });
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Notulensi RTM');

            // 1. Setup Lebar Kolom
            worksheet.columns = [
                { key: 'A', width: 8 },  // No
                { key: 'B', width: 20 }, // Topik
                { key: 'C', width: 32 }, // Pembahasan
                { key: 'D', width: 35 }, // Rencana
                { key: 'E', width: 45 }, // Luaran
                { key: 'F', width: 18 }, // PIC
                { key: 'G', width: 15 }, // Target
                { key: 'H', width: 12 }  // Status
            ];

            // ==================================================
            // 2. KOP SURAT (Row 1-4)
            // ==================================================

            // Kolom A: Placeholder Logo
            worksheet.mergeCells('A1:A4');
            worksheet.getCell('A1').value = 'LOGO';
            worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

            // Kolom B-F: Identitas Universitas & Judul Dokumen
            worksheet.mergeCells('B1:F1');
            worksheet.getCell('B1').value = 'TELKOM UNIVERSITY';
            worksheet.getCell('B1').font = { bold: true, size: 12 };
            worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('B2:F2');
            worksheet.getCell('B2').value = 'Jl. Telekomunikasi No. 1 Ters. Buah Batu Bandung 40257';
            worksheet.getCell('B2').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('B3:F4');
            worksheet.getCell('B3').value = 'Risalah Rapat Tinjauan Manajemen';
            worksheet.getCell('B3').font = { bold: true, size: 14 };
            worksheet.getCell('B3').alignment = { vertical: 'middle', horizontal: 'center' };

            // Kolom G-H: Kotak Document Control Baku
            const docControls = [
                ['No. Formulir', 'Tel_U-NA-REK-DSU-BSP-USH-FMI-001/007'],
                ['Revisi', '0'],
                ['Berlaku Efektif', 'Jumat, 13 April 2018'],
                ['Hal.', '1 dari 1']
            ];

            docControls.forEach((item, index) => {
                const row = index + 1;
                worksheet.getCell(`G${row}`).value = item[0];
                worksheet.getCell(`G${row}`).font = { bold: true };
                worksheet.getCell(`G${row}`).alignment = { vertical: 'middle', horizontal: 'center' };

                worksheet.getCell(`H${row}`).value = item[1];
                worksheet.getCell(`H${row}`).alignment = { vertical: 'middle', horizontal: 'left' };
            });

            // Set Border Hitam Tipis untuk Seluruh Area Kop (A1:H4)
            for (let r = 1; r <= 4; r++) {
                for (let c = 1; c <= 8; c++) {
                    worksheet.getCell(r, c).border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };
                }
            }

            // ==================================================
            // 3. METADATA RAPAT (Row 6-8)
            // ==================================================
            const meetingDateObj = fullData.meetingDate ? new Date(fullData.meetingDate) : new Date();
            const formattedDate = meetingDateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            // Tanggal
            worksheet.getCell('A6').value = 'Tanggal';
            worksheet.getCell('B6').value = `: ${formattedDate}`;
            worksheet.mergeCells('B6:F6'); // Supaya teks panjang nggak kepotong

            // Tempat
            worksheet.getCell('A7').value = 'Tempat';
            worksheet.getCell('B7').value = `: ${fullData.location || '-'}`;
            worksheet.mergeCells('B7:F7');

            // Agenda
            worksheet.getCell('A8').value = 'Agenda';
            worksheet.getCell('B8').value = `: ${fullData.agenda || '-'}`;
            worksheet.mergeCells('B8:F8');
            worksheet.getCell('B8').alignment = { wrapText: true, vertical: 'top' };

            // Atur alignment teks ke kiri atas untuk label metadata
            ['A6', 'A7', 'A8'].forEach(cell => {
                worksheet.getCell(cell).alignment = { horizontal: 'left', vertical: 'top' };
            });

            // ==================================================
            // 4. HEADER TABEL (Row 10)
            // ==================================================
            const headerRow = worksheet.getRow(10);
            headerRow.values = [
                'No', 'Topik', 'Pembahasan/Permasalahan', 'Rencana Tindakan/Perbaikan',
                'Luaran/ Outcomes', 'PIC', 'Target', 'Status'
            ];

            headerRow.eachCell((cell) => {
                cell.font = { bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });

            // ==================================================
            // 5. ISI TABEL (Row 11 dst)
            // ==================================================
            let currentRow = 11;
            fullData.discussions.forEach((item, index) => {
                const row = worksheet.getRow(currentRow);
                row.values = [
                    index + 1,
                    item.topic,
                    item.problem,
                    item.actionPlan,
                    item.outcome,
                    item.pic,
                    item.target,
                    item.status
                ];

                row.eachCell((cell, colNumber) => {
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                    if ([1, 6, 7, 8].includes(colNumber)) {
                        cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true };
                    } else {
                        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                    }
                });
                currentRow++;
            });

            // ==================================================
            // 6. BLOK TANDA TANGAN 
            // ==================================================
            currentRow += 2; // Kasih jeda 2 baris kosong sebelum area TTD

            const signatureDate = fullData.signatureDate
                ? new Date(fullData.signatureDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                : formattedDate;

            // Baris Tanggal
            worksheet.getCell(`C${currentRow}`).value = signatureDate;
            worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };
            currentRow++;

            // Baris Judul TTD
            worksheet.getCell(`C${currentRow}`).value = 'Dibuat oleh,';
            worksheet.getCell(`F${currentRow}`).value = 'Diperiksa oleh,';
            worksheet.getCell(`H${currentRow}`).value = 'Disetujui oleh,';
            ['C', 'F', 'H'].forEach(col => worksheet.getCell(`${col}${currentRow}`).alignment = { horizontal: 'center' });

            currentRow += 4; // Kasih jeda 4 baris buat ttd basah/cap

            // Baris Nama
            worksheet.getCell(`C${currentRow}`).value = fullData.preparedByName || '-';
            worksheet.getCell(`F${currentRow}`).value = fullData.reviewedByName || '-';
            worksheet.getCell(`H${currentRow}`).value = fullData.approvedByName || '-';
            ['C', 'F', 'H'].forEach(col => worksheet.getCell(`${col}${currentRow}`).alignment = { horizontal: 'center' });
            currentRow++;

            // Baris Jabatan
            worksheet.getCell(`C${currentRow}`).value = fullData.preparedByPosition || 'Ka. Urusan Sekretariat';
            worksheet.getCell(`F${currentRow}`).value = fullData.reviewedByPosition || 'Wakil Dekan I';
            worksheet.getCell(`H${currentRow}`).value = fullData.approvedByPosition || 'Dekan';
            ['C', 'F', 'H'].forEach(col => {
                worksheet.getCell(`${col}${currentRow}`).font = { bold: true };
                worksheet.getCell(`${col}${currentRow}`).alignment = { horizontal: 'center' };
            });

            // Eksekusi Download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileName = `Notulensi_${fullData.rtmCode ? fullData.rtmCode.replace(/\//g, '_') : 'RTM'}.xlsx`;
            saveAs(blob, fileName);

            toast.success("Risalah Rapat berhasil diexport ke Excel!", {
                style: { background: "#f0fdf4", color: "#166534", fontWeight: "bold" },
                className: "border border-green-500 font-bold"
            });

        } catch (error) {
            console.error("Export error:", error);
            toast.error("Gagal melakukan export Excel");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={isIconOnly ? "ghost" : "outline"}
            size={isIconOnly ? "icon" : "default"}
            onClick={handleExport}
            disabled={isLoading}
            title="Export RTM"
            className={isIconOnly 
                ? "h-7 w-7 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-700 dark:text-sky-400 border-0 shadow-none" 
                : "gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 dark:bg-green-900 dark:text-green-50 dark:border-green-200 dark:hover:bg-green-100 dark:hover:text-green-800"
            }
        >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className={isIconOnly ? "size-3.5" : "size-4"} />}
            {!isIconOnly && (isLoading ? "Menyiapkan File..." : "Export Excel RTM")}
        </Button>
    );
}
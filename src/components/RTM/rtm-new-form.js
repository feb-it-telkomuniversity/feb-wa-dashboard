"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Save, Trash2, ClipboardList, Check } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import ButtonWithIcon from "@/components/shadcn-space/radix/button/button-08";

const materiOptions = [
    "1. Tindak lanjut dari Rapat Tinjauan Manajemen sebelumnya",
    "2. Perubahan yang dipicu oleh isu internal dan eksternal yang mempengaruhi Sistem dan Mutu",
    "3. Kinerja proses dan kesesuaian produk / layanan (Tren hasil pengukuran dan pemantauan)",
    "4. Kinerja External Provider (Pemasok, Vendor, Dosen LB, dll)",
    "5. Pencapaian terhadap Sasaran (Sarmut, KM, dll)",
    "6. Umpan Balik dari pihak berkepentingan / pelanggan\n(Tren Hasil Survey Kepuasan Mahasiswa, EDOM/EDWOM/EDPOM, Pegawai, Mitra Kerjasama, Keluhan Pelanggan dll)",
    "7. Hasil Audit",
    "8. Status tindakan pencegahan dan perbaikan (PTPP)",
    "9. Kecukupan Sumber Daya (Manusia, Teknis, Informasi dan Keuangan)",
    "10. Hasil dari penilaian risiko dan efektivitas tindakan yang diambil untuk menanggapi risiko dan peluang",
    "11. Rekomendasi untuk peningkatan / perbaikan berkelanjutan",
    "12. Kepatuhan dan kesesuaian kebijakan manajemen layanan dan kebijakan lain yang dibutuhkan [ITSMS] (Khusus Dit. PuTI)",
    "13. Tren hasil penilaian formatif dan sumatif [EOMS] (Khusus Fakultas/Prodi)"
];


export default function RtmNewForm({ rtm, onBack }) {
    const [formData, setFormData] = useState({
        tanggal: rtm?.tanggal || "",
        tempat: "",
        agenda: rtm?.namaRtm || "",
        items: rtm ? [
            { id: 1, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" },
            { id: 2, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" },
            { id: 3, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" },
        ] : [
            { id: 1, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" },
            { id: 2, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" },
            { id: 3, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" },
            { id: 4, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" },
            { id: 5, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" },
        ],
        notulen: { nama: "", jabatan: "" },
        pejabat: { nama: "", jabatan: "" },
        pimpinan: { nama: "", jabatan: "" },
        pembuatRtm: "",
        materiRapat: [],
        namaRtmInput: rtm?.namaRtm || "",
        pesertaRtm: rtm?.peserta || "",
    });

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const addItemRow = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { id: formData.items.length + 1, topik: "", pembahasan: "", rencana: "", luaran: "", pic: "", target: "", status: "" }
            ]
        });
    };

    const removeItemRow = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleSave = () => {
        alert("Data berhasil disimpan!");
        onBack();
    };

    return (
        <Card className="border-none shadow-sm bg-base-100">
            <CardContent className="">
                <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>

                {/* Input Kegiatan Rapat */}
                <div className="mb-10 pb-10 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Input Kegiatan Rapat</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Minutes of meeting (MOM), Risalah Rapat, Notulensi Rapat Tinjauan Management (RTM)</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 2-column grid for standard inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SOTK */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">SOTK</label>
                                <div className="mt-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 px-4 py-2.5 rounded-xl text-sm font-medium">
                                    Direktorat Fakultas Ekonomi dan Bisnis
                                </div>
                            </div>

                            {/* Pembuat Risalah RTM */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pembuat Risalah RTM</label>
                                <Input
                                    placeholder="Person In Charge"
                                    value={formData.pembuatRtm}
                                    onChange={(e) => setFormData({ ...formData, pembuatRtm: e.target.value })}
                                    className="mt-2 rounded-xl border-gray-200 dark:border-gray-700 focus-visible:ring-primary shadow-sm h-11"
                                />
                            </div>

                            {/* Tanggal RTM */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal RTM</label>
                                <Input
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                    className="mt-2 rounded-xl border-gray-200 dark:border-gray-700 focus-visible:ring-primary shadow-sm h-11"
                                />
                            </div>
                        </div>

                        {/* Nama RTM */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nama RTM</label>
                            <Textarea
                                placeholder="Contoh* Rapat RTM II 2021"
                                value={formData.namaRtmInput}
                                onChange={(e) => setFormData({ ...formData, namaRtmInput: e.target.value })}
                                className="mt-2 min-h-[80px] rounded-xl border-gray-200 dark:border-gray-700 focus-visible:ring-primary shadow-sm resize-y"
                            />
                        </div>

                        {/* Peserta RTM */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Peserta RTM</label>
                            <Textarea
                                placeholder="Contoh* Wakil Dekan II Fakultas Teknik Elektro, Direktur Akademik, dst"
                                value={formData.pesertaRtm}
                                onChange={(e) => setFormData({ ...formData, pesertaRtm: e.target.value })}
                                className="mt-2 min-h-[80px] rounded-xl border-gray-200 dark:border-gray-700 focus-visible:ring-primary shadow-sm resize-y"
                            />
                        </div>

                        {/* Materi Rapat */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Materi Rapat</label>
                                <p className="text-xs text-muted-foreground mt-0.5">Pilih satu atau lebih materi rapat yang relevan.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                {materiOptions.map((option, idx) => {
                                    const isSelected = formData.materiRapat.includes(idx);
                                    return (
                                        <label
                                            key={idx}
                                            className={`relative flex items-start p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${isSelected
                                                ? "border-primary bg-primary/5 shadow-md"
                                                : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    const newMateri = e.target.checked
                                                        ? [...formData.materiRapat, idx]
                                                        : formData.materiRapat.filter(m => m !== idx);
                                                    setFormData({ ...formData, materiRapat: newMateri });
                                                }}
                                            />
                                            <div className="flex-1 min-w-0 pr-6">
                                                <span className={`text-sm font-medium leading-tight block ${isSelected ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>
                                                    {option}
                                                </span>
                                            </div>
                                            <div className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-primary bg-primary text-white" : "border-gray-300 dark:border-gray-600"}`}>
                                                {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Container */}
                <div className="p-6 mb-8 relative overflow-hidden">
                    {/* Header Kop Surat */}
                    <div className="grid grid-cols-1 md:grid-cols-12 border-2 border-border mb-8 rounded-xl overflow-hidden">
                        <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-border p-4 flex items-center justify-center bg-muted/20">
                            <Image src="/logo-telyu.webp" width={700} height={700} alt="Telkom University" className="h-20 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <div className="md:col-span-7 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col items-center justify-center text-center">
                            <h2 className="font-bold text-xl tracking-tight text-primary">TELKOM UNIVERSITY</h2>
                            <p className="text-sm font-medium text-muted-foreground mt-1">Jl. Telekomunikasi No. 1 Ters. Buah Batu Bandung 40257</p>
                            <h3 className="font-bold text-lg mt-3 uppercase tracking-wider">Risalah Rapat Tinjauan Manajemen</h3>
                        </div>
                        <div className="md:col-span-3 bg-muted/10">
                            <div className="grid grid-cols-2 border-b border-border">
                                <div className="p-2.5 text-[11px] font-bold border-r border-border text-muted-foreground uppercase tracking-wider">No. Formulir</div>
                                <div className="p-2.5 text-xs font-semibold">Tel_U-NA-REK-DSU-BSP-USH-FMI-</div>
                            </div>
                            <div className="grid grid-cols-2 border-b border-border">
                                <div className="p-2.5 text-[11px] font-bold border-r border-border text-muted-foreground uppercase tracking-wider">Revisi</div>
                                <div className="p-2.5 text-xs font-semibold">0</div>
                            </div>
                            <div className="grid grid-cols-2 border-b border-border">
                                <div className="p-2.5 text-[11px] font-bold border-r border-border text-muted-foreground uppercase tracking-wider">Berlaku Efektif</div>
                                <div className="p-2.5 text-xs font-semibold">13 April 2018</div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div className="p-2.5 text-[11px] font-bold border-r border-border text-muted-foreground uppercase tracking-wider">Hal.</div>
                                <div className="p-2.5 text-xs font-semibold">1 dari 1</div>
                            </div>
                        </div>
                    </div>

                    {/* Info Rapat */}
                    <div className="space-y-4 mb-8 w-full max-w-3xl">
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                            <div className="sm:col-span-3 text-sm font-bold text-muted-foreground uppercase tracking-wider">Tanggal</div>
                            <div className="sm:col-span-9">
                                <Input
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                    className="bg-transparent border-t-0 border-x-0 border-b-2 border-border rounded-none shadow-none focus-visible:ring-0 focus-visible:border-primary px-0 font-medium"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                            <div className="sm:col-span-3 text-sm font-bold text-muted-foreground uppercase tracking-wider">Tempat</div>
                            <div className="sm:col-span-9">
                                <Input
                                    value={formData.tempat}
                                    onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                                    className="bg-transparent border-t-0 border-x-0 border-b-2 border-border rounded-none shadow-none focus-visible:ring-0 focus-visible:border-primary px-0 font-medium"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-4">
                            <div className="sm:col-span-3 text-sm font-bold text-muted-foreground uppercase tracking-wider pt-2">Agenda</div>
                            <div className="sm:col-span-9">
                                <Textarea
                                    value={formData.agenda}
                                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                                    className="min-h-[60px] bg-transparent border-2 border-border rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-primary font-medium resize-y"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="border-2 border-border rounded-xl shadow-sm overflow-x-auto mb-6 bg-card">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-b-2 border-border hover:bg-transparent">
                                    <TableHead className="w-12 text-center font-bold text-foreground border-r border-border">NO</TableHead>
                                    <TableHead className="font-bold text-foreground min-w-[200px] border-r border-border">Topik</TableHead>
                                    <TableHead className="font-bold text-foreground min-w-[200px] border-r border-border">Pembahasan/Permasalahan</TableHead>
                                    <TableHead className="font-bold text-foreground min-w-[200px] border-r border-border">Rencana Tindakan/Perbaikan</TableHead>
                                    <TableHead className="font-bold text-foreground min-w-[200px] border-r border-border">Luaran/ Outcomes</TableHead>
                                    <TableHead className="w-32 text-center font-bold text-foreground border-r border-border">PIC</TableHead>
                                    <TableHead className="w-32 text-center font-bold text-foreground border-r border-border">Target</TableHead>
                                    <TableHead className="w-32 text-center font-bold text-foreground border-r border-border">Status</TableHead>
                                    <TableHead className="w-16 text-center font-bold text-foreground">Act</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.items.map((item, index) => (
                                    <TableRow key={index} className="border-b border-border last:border-0 hover:bg-muted/20">
                                        <TableCell className="text-center font-medium border-r border-border">{index + 1}</TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Textarea
                                                value={item.topik}
                                                onChange={(e) => handleItemChange(index, "topik", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-primary p-2 resize-none shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Textarea
                                                value={item.pembahasan}
                                                onChange={(e) => handleItemChange(index, "pembahasan", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-primary p-2 resize-none shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Textarea
                                                value={item.rencana}
                                                onChange={(e) => handleItemChange(index, "rencana", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-primary p-2 resize-none shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Textarea
                                                value={item.luaran}
                                                onChange={(e) => handleItemChange(index, "luaran", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-primary p-2 resize-none shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Input
                                                value={item.pic}
                                                onChange={(e) => handleItemChange(index, "pic", e.target.value)}
                                                className="h-10 bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-primary px-3 text-center shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Input
                                                value={item.target}
                                                onChange={(e) => handleItemChange(index, "target", e.target.value)}
                                                className="h-10 bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-primary px-3 text-center shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Input
                                                value={item.status}
                                                onChange={(e) => handleItemChange(index, "status", e.target.value)}
                                                className="h-10 bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-primary px-3 text-center shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 text-center align-middle">
                                            <div className="flex justify-center">
                                                <ButtonWithIcon
                                                    icon={<Trash2 className="h-4 w-4" />}
                                                    onClick={() => removeItemRow(index)}
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 p-0"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-start mb-14">
                        <Button variant="outline" size="sm" onClick={addItemRow} className="gap-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground shadow-sm">
                            <Plus className="h-4 w-4" /> Tambah Baris
                        </Button>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center text-sm mb-4">
                        <div className="flex flex-col justify-end min-h-[140px]">
                            <p className="mb-14 font-medium">Dibuat oleh,</p>
                            <div className="flex flex-col items-center">
                                <Input
                                    placeholder="(nama notulen)"
                                    value={formData.notulen.nama}
                                    onChange={(e) => setFormData({ ...formData, notulen: { ...formData.notulen, nama: e.target.value } })}
                                    className="h-8 bg-transparent border-x-0 border-t-0 border-b-2 border-border rounded-none shadow-none text-center focus-visible:ring-0 focus-visible:border-primary max-w-[220px]"
                                />
                                <Input
                                    placeholder="(jabatan)"
                                    value={formData.notulen.jabatan}
                                    onChange={(e) => setFormData({ ...formData, notulen: { ...formData.notulen, jabatan: e.target.value } })}
                                    className="h-8 bg-transparent border-x-0 border-t-0 border-b-0 rounded-none shadow-none text-center font-bold focus-visible:ring-0 max-w-[220px] text-muted-foreground mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-end min-h-[140px]">
                            <p className="mb-2 font-medium text-muted-foreground">Bandung, {formData.tanggal || "(tanggal)"}</p>
                            <p className="mb-14 font-medium">Diperiksa oleh,</p>
                            <div className="flex flex-col items-center">
                                <Input
                                    placeholder="(nama pejabat)"
                                    value={formData.pejabat.nama}
                                    onChange={(e) => setFormData({ ...formData, pejabat: { ...formData.pejabat, nama: e.target.value } })}
                                    className="h-8 bg-transparent border-x-0 border-t-0 border-b-2 border-border rounded-none shadow-none text-center focus-visible:ring-0 focus-visible:border-primary max-w-[220px]"
                                />
                                <Input
                                    placeholder="(jabatan)"
                                    value={formData.pejabat.jabatan}
                                    onChange={(e) => setFormData({ ...formData, pejabat: { ...formData.pejabat, jabatan: e.target.value } })}
                                    className="h-8 bg-transparent border-x-0 border-t-0 border-b-0 rounded-none shadow-none text-center font-bold focus-visible:ring-0 max-w-[220px] text-muted-foreground mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-end min-h-[140px]">
                            <p className="mb-14 font-medium">Disetujui oleh,</p>
                            <div className="flex flex-col items-center">
                                <Input
                                    placeholder="(nama pimpinan rapat)"
                                    value={formData.pimpinan.nama}
                                    onChange={(e) => setFormData({ ...formData, pimpinan: { ...formData.pimpinan, nama: e.target.value } })}
                                    className="h-8 bg-transparent border-x-0 border-t-0 border-b-2 border-border rounded-none shadow-none text-center focus-visible:ring-0 focus-visible:border-primary max-w-[220px]"
                                />
                                <Input
                                    placeholder="(jabatan)"
                                    value={formData.pimpinan.jabatan}
                                    onChange={(e) => setFormData({ ...formData, pimpinan: { ...formData.pimpinan, jabatan: e.target.value } })}
                                    className="h-8 bg-transparent border-x-0 border-t-0 border-b-0 rounded-none shadow-none text-center font-bold focus-visible:ring-0 max-w-[220px] text-muted-foreground mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t pt-6">
                    <Button variant="outline" onClick={onBack}>Batal</Button>
                    <Button onClick={handleSave} className="gap-2 bg-primary">
                        <Save className="h-4 w-4" />
                        Simpan Notula
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

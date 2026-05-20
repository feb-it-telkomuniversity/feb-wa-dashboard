"use client";

import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Save, Trash2, ClipboardList, Check, Loader2, X, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
import ButtonRipleSpotlight from "../shadcn-space/radix/button/button-16";
import ButtonBlobFill from "../shadcn-space/radix/button/button-17";

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


export default function RtmNewForm({ rtm, onBack }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        tanggal: rtm?.tanggal || "",
        nomorRtm: rtm?.nomorRtm || "",
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

    const handleSave = async () => {
        if (!formData.namaRtmInput) {
            toast.error("Nama RTM wajib diisi");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                sotk: "Direktorat Fakultas Ekonomi dan Bisnis",
                pic: formData.pembuatRtm,
                meetingDate: formData.tanggal,
                name: formData.namaRtmInput,
                participants: formData.pesertaRtm,
                materials: formData.materiRapat.map(idx => materiOptions[idx]),
                documentDate: formData.tanggal,
                location: formData.tempat,
                agenda: formData.agenda,
                preparedByName: formData.notulen.nama,
                preparedByPosition: formData.notulen.jabatan,
                reviewedByName: formData.pejabat.nama,
                reviewedByPosition: formData.pejabat.jabatan,
                approvedByName: formData.pimpinan.nama,
                approvedByPosition: formData.pimpinan.jabatan,
                signatureLocation: "Bandung",
                signatureDate: formData.tanggal,
                discussions: formData.items.map(item => ({
                    topic: item.topik,
                    problem: item.pembahasan,
                    actionPlan: item.rencana,
                    outcome: item.luaran,
                    pic: item.pic,
                    target: item.target,
                    status: item.status
                }))
            };

            const res = await api.post("/api/rtm", payload);
            if (res.data?.success) {
                toast.success("Kegiatan rapat berhasil disimpan");
                onBack();
            }
        } catch (error) {
            console.error("Gagal menyimpan data:", error);
            toast.error(error.response?.data?.message || "Gagal menyimpan kegiatan rapat");
        } finally {
            setIsSubmitting(false);
        }
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

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nomor RTM</label>
                                <Input
                                    value={formData.nomorRtm}
                                    onChange={(e) => setFormData({ ...formData, nomorRtm: e.target.value })}
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
                            
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between rounded-xl h-12 px-4 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm font-normal"
                                    >
                                        <span className="truncate">
                                            {formData.materiRapat.length > 0
                                                ? `${formData.materiRapat.length} Materi Terpilih`
                                                : "Pilih Materi Rapat..."}
                                        </span>
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl max-w-[80vw] sm:max-w-none" align="start">
                                    <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                                        {materiOptions.map((option, idx) => {
                                            const isSelected = formData.materiRapat.includes(idx);
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        const newMateri = isSelected
                                                            ? formData.materiRapat.filter(m => m !== idx)
                                                            : [...formData.materiRapat, idx];
                                                        setFormData({ ...formData, materiRapat: newMateri });
                                                    }}
                                                >
                                                    <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? "border-primary bg-primary text-white" : "border-gray-300 dark:border-gray-600"}`}>
                                                        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                                                    </div>
                                                    <span className={`text-sm leading-snug ${isSelected ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                                                        {option}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {formData.materiRapat.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 p-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-800">
                                    {formData.materiRapat.map((idx) => (
                                        <div
                                            key={idx}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
                                        >
                                            <span className="max-w-[200px] sm:max-w-[300px] md:max-w-[400px] truncate" title={materiOptions[idx]}>
                                                {materiOptions[idx]}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData({ ...formData, materiRapat: formData.materiRapat.filter(m => m !== idx) });
                                                }}
                                                className="p-0.5 hover:bg-primary/20 rounded-full transition-colors ml-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                                className="min-h-[80px] bg-transparent border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary p-2 resize-none shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Textarea
                                                value={item.pembahasan}
                                                onChange={(e) => handleItemChange(index, "pembahasan", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary p-2 resize-none shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Textarea
                                                value={item.rencana}
                                                onChange={(e) => handleItemChange(index, "rencana", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary p-2 resize-none shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Textarea
                                                value={item.luaran}
                                                onChange={(e) => handleItemChange(index, "luaran", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary p-2 resize-none shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Input
                                                value={item.pic}
                                                onChange={(e) => handleItemChange(index, "pic", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary px-3 text-center shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Input
                                                value={item.target}
                                                onChange={(e) => handleItemChange(index, "target", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary px-3 text-center shadow-none"
                                            />
                                        </TableCell>
                                        <TableCell className="p-2.5 border-r border-border align-top">
                                            <Input
                                                value={item.status}
                                                onChange={(e) => handleItemChange(index, "status", e.target.value)}
                                                className="min-h-[80px] bg-transparent border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary px-3 text-center shadow-none"
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
                        <ButtonRipleSpotlight
                            icon={<Plus className="h-4 w-4" />}
                            text="Tambah baris"
                            variant="outline"
                            onClick={addItemRow}
                            className="gap-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground shadow-sm"
                        />
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
                    <ButtonRipleSpotlight
                        onClick={onBack}
                        text="Batal"
                        className="gap-2 border-dashed rounded-lg shadow-sm"
                    />
                    <ButtonBlobFill
                        icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        text={isSubmitting ? "Menyimpan..." : "Simpan Notula"}
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className={`gap-2 rounded-lg shadow-sm ${isSubmitting ? "opacity-70 pointer-events-none" : "border-dashed"}`}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

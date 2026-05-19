"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
            <CardContent className="p-8">
                <Button variant="ghost" onClick={onBack} className="mb-6 -ml-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>

                {/* Input Kegiatan Rapat */}
                <div className="mb-10 pb-10 border-b border-gray-200">
                    <div className="border-b-2 border-sky-400 pb-2 mb-8">
                        <h2 className="text-xl text-gray-700">Input Kegiatan Rapat <span className="text-sm text-gray-400 font-normal">Minutes of meeting (MOM), Risalah Rapat, Notulensi Rapat Tinjauan Management (RTM)</span></h2>
                    </div>

                    <div className="space-y-6 max-w-5xl">
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 text-right text-sm font-bold text-gray-800">SOTK</div>
                            <div className="col-span-9">
                                <div className="bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 text-sm text-center font-bold">
                                    Direktorat Fakultas Ekonomi dan Bisnis
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 text-right text-sm font-bold text-gray-800">Pembuat Risalah RTM</div>
                            <div className="col-span-9">
                                <Input 
                                    placeholder="Person In Charge" 
                                    value={formData.pembuatRtm}
                                    onChange={(e) => setFormData({...formData, pembuatRtm: e.target.value})}
                                    className="border-gray-300 rounded-sm focus-visible:ring-sky-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 text-right text-sm font-bold text-gray-800">Tanggal RTM</div>
                            <div className="col-span-9">
                                <Input 
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                                    className="border-gray-300 rounded-sm focus-visible:ring-sky-500 w-full sm:w-1/3"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3 text-right">
                                <div className="text-sm font-bold text-gray-800">Materi Rapat</div>
                                <div className="text-xs text-gray-500 mt-1 font-semibold">Note* (Anda bisa pilih lebih dari 1 option)</div>
                            </div>
                            <div className="col-span-9 space-y-2">
                                {materiOptions.map((option, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <input 
                                            type="checkbox" 
                                            id={`materi-${idx}`}
                                            checked={formData.materiRapat.includes(idx)}
                                            onChange={(e) => {
                                                const newMateri = e.target.checked 
                                                    ? [...formData.materiRapat, idx]
                                                    : formData.materiRapat.filter(m => m !== idx);
                                                setFormData({...formData, materiRapat: newMateri});
                                            }}
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-600"
                                        />
                                        <label htmlFor={`materi-${idx}`} className="text-sm font-bold text-gray-700 leading-tight whitespace-pre-line cursor-pointer">
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3 text-right text-sm font-bold text-gray-800 pt-2">Nama RTM</div>
                            <div className="col-span-9">
                                <Textarea 
                                    placeholder="Contoh* Rapat RTM II 2021" 
                                    value={formData.namaRtmInput}
                                    onChange={(e) => setFormData({...formData, namaRtmInput: e.target.value})}
                                    className="min-h-[80px] border-gray-300 rounded-sm focus-visible:ring-sky-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3 text-right text-sm font-bold text-gray-800 pt-2">Peserta RTM</div>
                            <div className="col-span-9">
                                <Textarea 
                                    placeholder="Contoh* Wakil Dekan II Fakultas Teknik Elektro, Direktur Akademik, dst" 
                                    value={formData.pesertaRtm}
                                    onChange={(e) => setFormData({...formData, pesertaRtm: e.target.value})}
                                    className="min-h-[80px] border-gray-300 rounded-sm focus-visible:ring-sky-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Kop Surat */}
                <div className="grid grid-cols-12 border border-black mb-8">
                    <div className="col-span-2 border-r border-black p-4 flex items-center justify-center">
                        <img src="/logo_tel_u.png" alt="Telkom University" className="h-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        {!process.browser && <div className="text-center font-bold text-red-600 leading-tight">Telkom<br/>University</div>}
                    </div>
                    <div className="col-span-7 border-r border-black p-4 flex flex-col items-center justify-center text-center">
                        <h2 className="font-bold text-lg">TELKOM UNIVERSITY</h2>
                        <p className="text-sm font-semibold">Jl. Telekomunikasi No. 1 Ters. Buah Batu Bandung 40257</p>
                        <h3 className="font-bold mt-1">Risalah Rapat Tinjauan Manajemen</h3>
                    </div>
                    <div className="col-span-3">
                        <div className="grid grid-cols-2 border-b border-black">
                            <div className="p-1.5 text-xs font-semibold border-r border-black">No. Formulir</div>
                            <div className="p-1.5 text-xs font-semibold">Tel_U-NA-REK-DSU-BSP-USH-FMI-</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-black">
                            <div className="p-1.5 text-xs font-semibold border-r border-black">Revisi</div>
                            <div className="p-1.5 text-xs font-semibold">0</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-black">
                            <div className="p-1.5 text-xs font-semibold border-r border-black">Berlaku Efektif</div>
                            <div className="p-1.5 text-xs font-semibold">Friday, 13 April 2018</div>
                        </div>
                        <div className="grid grid-cols-2">
                            <div className="p-1.5 text-xs font-semibold border-r border-black">Hal.</div>
                            <div className="p-1.5 text-xs font-semibold">1 dari 1</div>
                        </div>
                    </div>
                </div>

                {/* Info Rapat */}
                <div className="space-y-3 mb-8 w-full max-w-2xl">
                    <div className="grid grid-cols-12 items-center gap-2">
                        <div className="col-span-2 text-sm font-semibold">Tanggal :</div>
                        <div className="col-span-10">
                            <Input 
                                type="date" 
                                value={formData.tanggal} 
                                onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                                className="h-8 border-gray-300" 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-12 items-center gap-2">
                        <div className="col-span-2 text-sm font-semibold">Tempat :</div>
                        <div className="col-span-10">
                            <Input 
                                value={formData.tempat} 
                                onChange={(e) => setFormData({...formData, tempat: e.target.value})}
                                className="h-8 border-gray-300" 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-12 items-start gap-2">
                        <div className="col-span-2 text-sm font-semibold mt-1">Agenda :</div>
                        <div className="col-span-10">
                            <Textarea 
                                value={formData.agenda} 
                                onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                                className="min-h-[60px] border-gray-300" 
                            />
                        </div>
                    </div>
                </div>

                {/* Table Data */}
                <div className="border rounded-lg shadow-sm overflow-x-auto mb-4 bg-white">
                    <Table>
                        <TableHeader className="bg-[#f0f9f3]">
                            <TableRow className="border-b border-gray-200 hover:bg-transparent">
                                <TableHead className="w-12 text-center font-bold text-gray-800 border-r border-gray-200">NO</TableHead>
                                <TableHead className="font-bold text-gray-800 min-w-[200px] border-r border-gray-200">Topik</TableHead>
                                <TableHead className="font-bold text-gray-800 min-w-[200px] border-r border-gray-200">Pembahasan/Permasalahan</TableHead>
                                <TableHead className="font-bold text-gray-800 min-w-[200px] border-r border-gray-200">Rencana Tindakan/Perbaikan</TableHead>
                                <TableHead className="font-bold text-gray-800 min-w-[200px] border-r border-gray-200">Luaran/ Outcomes</TableHead>
                                <TableHead className="w-28 text-center font-bold text-gray-800 border-r border-gray-200">PIC</TableHead>
                                <TableHead className="w-28 text-center font-bold text-gray-800 border-r border-gray-200">Target</TableHead>
                                <TableHead className="w-28 text-center font-bold text-gray-800 border-r border-gray-200">Status</TableHead>
                                <TableHead className="w-14 text-center font-bold text-gray-800">Act</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.items.map((item, index) => (
                                <TableRow key={index} className="border-b border-gray-200 last:border-0 hover:bg-slate-50/50">
                                    <TableCell className="text-center font-medium border-r border-gray-200 text-gray-700">{index + 1}</TableCell>
                                    <TableCell className="p-3 border-r border-gray-200 align-top">
                                        <Textarea 
                                            value={item.topik} 
                                            onChange={(e) => handleItemChange(index, "topik", e.target.value)}
                                            className="min-h-[80px] border-gray-200 rounded-md focus-visible:ring-1 focus-visible:ring-sky-500 p-2 resize-none bg-white shadow-sm" 
                                        />
                                    </TableCell>
                                    <TableCell className="p-3 border-r border-gray-200 align-top">
                                        <Textarea 
                                            value={item.pembahasan} 
                                            onChange={(e) => handleItemChange(index, "pembahasan", e.target.value)}
                                            className="min-h-[80px] border-gray-200 rounded-md focus-visible:ring-1 focus-visible:ring-sky-500 p-2 resize-none bg-white shadow-sm" 
                                        />
                                    </TableCell>
                                    <TableCell className="p-3 border-r border-gray-200 align-top">
                                        <Textarea 
                                            value={item.rencana} 
                                            onChange={(e) => handleItemChange(index, "rencana", e.target.value)}
                                            className="min-h-[80px] border-gray-200 rounded-md focus-visible:ring-1 focus-visible:ring-sky-500 p-2 resize-none bg-white shadow-sm" 
                                        />
                                    </TableCell>
                                    <TableCell className="p-3 border-r border-gray-200 align-top">
                                        <Textarea 
                                            value={item.luaran} 
                                            onChange={(e) => handleItemChange(index, "luaran", e.target.value)}
                                            className="min-h-[80px] border-gray-200 rounded-md focus-visible:ring-1 focus-visible:ring-sky-500 p-2 resize-none bg-white shadow-sm" 
                                        />
                                    </TableCell>
                                    <TableCell className="p-3 border-r border-gray-200 align-top">
                                        <Input 
                                            value={item.pic} 
                                            onChange={(e) => handleItemChange(index, "pic", e.target.value)}
                                            className="h-10 border-gray-200 rounded-md focus-visible:ring-1 focus-visible:ring-sky-500 px-3 bg-white text-center shadow-sm" 
                                        />
                                    </TableCell>
                                    <TableCell className="p-3 border-r border-gray-200 align-top">
                                        <Input 
                                            value={item.target} 
                                            onChange={(e) => handleItemChange(index, "target", e.target.value)}
                                            className="h-10 border-gray-200 rounded-md focus-visible:ring-1 focus-visible:ring-sky-500 px-3 bg-white text-center shadow-sm" 
                                        />
                                    </TableCell>
                                    <TableCell className="p-3 border-r border-gray-200 align-top">
                                        <Input 
                                            value={item.status} 
                                            onChange={(e) => handleItemChange(index, "status", e.target.value)}
                                            className="h-10 border-gray-200 rounded-md focus-visible:ring-1 focus-visible:ring-sky-500 px-3 bg-white text-center shadow-sm" 
                                        />
                                    </TableCell>
                                    <TableCell className="p-3 text-center align-middle">
                                        <Button variant="ghost" size="icon" onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-start mb-12">
                    <Button variant="outline" size="sm" onClick={addItemRow} className="gap-2 border-dashed rounded-lg text-gray-600 shadow-sm">
                        <Plus className="h-4 w-4" /> Tambah Baris
                    </Button>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-8 text-center text-sm mb-12">
                    <div className="flex flex-col justify-end min-h-[140px]">
                        <p className="mb-16">Dibuat oleh,</p>
                        <div className="flex flex-col items-center">
                            <Input 
                                placeholder="(nama notulen)" 
                                value={formData.notulen.nama}
                                onChange={(e) => setFormData({...formData, notulen: {...formData.notulen, nama: e.target.value}})}
                                className="h-8 border-x-0 border-t-0 border-b-gray-300 rounded-none shadow-none text-center focus-visible:ring-0 max-w-[200px]" 
                            />
                            <Input 
                                placeholder="(jabatan)" 
                                value={formData.notulen.jabatan}
                                onChange={(e) => setFormData({...formData, notulen: {...formData.notulen, jabatan: e.target.value}})}
                                className="h-8 border-x-0 border-t-0 border-b-gray-300 rounded-none shadow-none text-center font-bold focus-visible:ring-0 max-w-[200px]" 
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-end min-h-[140px]">
                        <p className="mb-2">Bandung, {formData.tanggal || "(tanggal)"}</p>
                        <p className="mb-12">Diperiksa oleh,</p>
                        <div className="flex flex-col items-center">
                            <Input 
                                placeholder="(nama pejabat)" 
                                value={formData.pejabat.nama}
                                onChange={(e) => setFormData({...formData, pejabat: {...formData.pejabat, nama: e.target.value}})}
                                className="h-8 border-x-0 border-t-0 border-b-gray-300 rounded-none shadow-none text-center focus-visible:ring-0 max-w-[200px]" 
                            />
                            <Input 
                                placeholder="(jabatan)" 
                                value={formData.pejabat.jabatan}
                                onChange={(e) => setFormData({...formData, pejabat: {...formData.pejabat, jabatan: e.target.value}})}
                                className="h-8 border-x-0 border-t-0 border-b-gray-300 rounded-none shadow-none text-center font-bold focus-visible:ring-0 max-w-[200px]" 
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-end min-h-[140px]">
                        <p className="mb-16">Disetujui oleh,</p>
                        <div className="flex flex-col items-center">
                            <Input 
                                placeholder="(nama pimpinan rapat)" 
                                value={formData.pimpinan.nama}
                                onChange={(e) => setFormData({...formData, pimpinan: {...formData.pimpinan, nama: e.target.value}})}
                                className="h-8 border-x-0 border-t-0 border-b-gray-300 rounded-none shadow-none text-center focus-visible:ring-0 max-w-[200px]" 
                            />
                            <Input 
                                placeholder="(jabatan)" 
                                value={formData.pimpinan.jabatan}
                                onChange={(e) => setFormData({...formData, pimpinan: {...formData.pimpinan, jabatan: e.target.value}})}
                                className="h-8 border-x-0 border-t-0 border-b-gray-300 rounded-none shadow-none text-center font-bold focus-visible:ring-0 max-w-[200px]" 
                            />
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

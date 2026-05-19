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
                <div className="border border-black overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                        <thead className="bg-[#e6f4ea] border-b border-black">
                            <tr>
                                <th className="border-r border-black p-2 w-12 text-center">NO</th>
                                <th className="border-r border-black p-2 text-left">Topik</th>
                                <th className="border-r border-black p-2 text-left">Pembahasan/Permasalahan</th>
                                <th className="border-r border-black p-2 text-left">Rencana Tindakan/Perbaikan</th>
                                <th className="border-r border-black p-2 text-left">Luaran/ Outcomes</th>
                                <th className="border-r border-black p-2 text-center w-24">PIC</th>
                                <th className="border-r border-black p-2 text-center w-24">Target</th>
                                <th className="border-r border-black p-2 text-center w-24">Status</th>
                                <th className="p-2 text-center w-12">Act</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.items.map((item, index) => (
                                <tr key={index} className="border-b border-black last:border-b-0">
                                    <td className="border-r border-black p-1 text-center font-medium">{index + 1}</td>
                                    <td className="border-r border-black p-1">
                                        <Textarea 
                                            value={item.topik} 
                                            onChange={(e) => handleItemChange(index, "topik", e.target.value)}
                                            className="min-h-[60px] border-0 focus-visible:ring-0 p-1 resize-none bg-transparent" 
                                        />
                                    </td>
                                    <td className="border-r border-black p-1">
                                        <Textarea 
                                            value={item.pembahasan} 
                                            onChange={(e) => handleItemChange(index, "pembahasan", e.target.value)}
                                            className="min-h-[60px] border-0 focus-visible:ring-0 p-1 resize-none bg-transparent" 
                                        />
                                    </td>
                                    <td className="border-r border-black p-1">
                                        <Textarea 
                                            value={item.rencana} 
                                            onChange={(e) => handleItemChange(index, "rencana", e.target.value)}
                                            className="min-h-[60px] border-0 focus-visible:ring-0 p-1 resize-none bg-transparent" 
                                        />
                                    </td>
                                    <td className="border-r border-black p-1">
                                        <Textarea 
                                            value={item.luaran} 
                                            onChange={(e) => handleItemChange(index, "luaran", e.target.value)}
                                            className="min-h-[60px] border-0 focus-visible:ring-0 p-1 resize-none bg-transparent" 
                                        />
                                    </td>
                                    <td className="border-r border-black p-1">
                                        <Input 
                                            value={item.pic} 
                                            onChange={(e) => handleItemChange(index, "pic", e.target.value)}
                                            className="h-10 border-0 focus-visible:ring-0 px-2 bg-transparent text-center" 
                                        />
                                    </td>
                                    <td className="border-r border-black p-1">
                                        <Input 
                                            value={item.target} 
                                            onChange={(e) => handleItemChange(index, "target", e.target.value)}
                                            className="h-10 border-0 focus-visible:ring-0 px-2 bg-transparent text-center" 
                                        />
                                    </td>
                                    <td className="border-r border-black p-1">
                                        <Input 
                                            value={item.status} 
                                            onChange={(e) => handleItemChange(index, "status", e.target.value)}
                                            className="h-10 border-0 focus-visible:ring-0 px-2 bg-transparent text-center" 
                                        />
                                    </td>
                                    <td className="p-1 text-center">
                                        <Button variant="ghost" size="icon" onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Button variant="outline" size="sm" onClick={addItemRow} className="mb-12 gap-2 border-dashed">
                    <Plus className="h-4 w-4" /> Tambah Baris
                </Button>

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

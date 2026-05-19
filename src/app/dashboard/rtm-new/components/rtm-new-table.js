"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Edit, Trash2, Plus } from "lucide-react";

const initialData = [
    {
        id: "1",
        noRtm: "RTM-2-0020-42305",
        tanggal: "2024-04-03",
        namaRtm: "Risalah Tinjauan Manajemen 3 April 2024 terkait Diskusi dengan La Trobe University (Melbourne), KK, KM TW 1, Visi Misi Prodi dan lainnya",
        materiRapat: "- Tindak lanjut dari Rapat Tinjauan Manajemen sebelumnya",
        peserta: "Dekan, Wadek 1 dan 2, Kelompok Keahlian dan Kaprodi S1 MBTI, S1 Akuntansi, S2 MM, S2 MM PJJ",
        linkRtm: "#",
    },
    {
        id: "2",
        noRtm: "RTM-2-0020-18246",
        tanggal: "2024-03-13",
        namaRtm: "Risalah Tinjauan Manajemen 13 Maret 2024 terkait Rencana kegiatan Prodi, KK, KM dan diskusi La Trobe University dan lainnya",
        materiRapat: "- Tindak lanjut dari Rapat Tinjauan Manajemen sebelumnya",
        peserta: "Dekan, Wadek 1 dan 2, Kelompok Keahlian dan Kaprodi S1 MBTI, S1 Akuntansi, S2 MM, S2 MM PJJ",
        linkRtm: "#",
    },
    {
        id: "3",
        noRtm: "RTM-2-0020-83072",
        tanggal: "2024-02-28",
        namaRtm: "Risalah Tinajauan Manajemen 28 Februari 2024 terkait Roadshow Warek 4, Tim Adhoc CoE ke Fakultas perihal Transformasi New KK dan Transformasi TUNC, dan lainnya",
        materiRapat: "- Tindak lanjut dari Rapat Tinjauan Manajemen sebelumnya",
        peserta: "Dekan, Wadek 1 dan 2, Kelompok Keahlian dan Kaprodi S1 MBTI, S1 Akuntansi, S2 MM, S2 MM PJJ",
        linkRtm: "#",
    },
    {
        id: "4",
        noRtm: "RTM-2-0020-49836",
        tanggal: "2024-02-07",
        namaRtm: "Risalah Tinjauan Manajemen 7 Februari 2024 terkait Koordinasi Prodi Bisnis Digital Surabaya, Penyambutan Mahasiswa Magister, dan lainnya",
        materiRapat: "- Tindak lanjut dari Rapat Tinjauan Manajemen sebelumnya",
        peserta: "Dekan, Wadek 1 dan 2, Kelompok Keahlian dan Kaprodi S1 MBTI, S1 Akuntansi, S2 MM, S2 MM PJJ",
        linkRtm: "#",
    },
    {
        id: "5",
        noRtm: "RTM-2-0020-57194",
        tanggal: "2024-01-10",
        namaRtm: "Risalah Tinjauan Manajemen 10 Januari 2024 terkait Plotting Pengajaran, Publikasi, Progres Kurikulum, dan lainnya",
        materiRapat: "- Tindak lanjut dari Rapat Tinjauan Manajemen sebelumnya",
        peserta: "Dekan, Wadek 1 dan 2, Kelompok Keahlian dan Kaprodi S1 MBTI, S1 Akuntansi, S2 MM, S2 MM PJJ",
        linkRtm: "#",
    },
];

export default function RtmNewTable({ onAdd, onEdit }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState(initialData);

    const filteredData = data.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
            item.namaRtm.toLowerCase().includes(query) ||
            item.noRtm.toLowerCase().includes(query) ||
            item.tanggal.includes(query) ||
            item.materiRapat.toLowerCase().includes(query) ||
            item.peserta.toLowerCase().includes(query)
        );
    });

    const handleDelete = (id) => {
        if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
            setData(data.filter(item => item.id !== id));
        }
    };

    return (
        <Card className="border-none shadow-sm bg-base-100">
            <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                <CardTitle className="text-xl font-bold text-sky-500">
                    Riwayat RTM Direktorat Fakultas Ekonomi dan Bisnis
                </CardTitle>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search"
                            className="w-64 h-9 pl-3 pr-4"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={onAdd} className="bg-sky-500 hover:bg-sky-600 text-white gap-2 h-9">
                        <Plus className="h-4 w-4" />
                        Tambah Notula
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[50px] text-center font-bold">No</TableHead>
                            <TableHead className="w-[120px] font-bold">No Rtm</TableHead>
                            <TableHead className="w-[120px] font-bold">Tanggal RTM</TableHead>
                            <TableHead className="w-[300px] font-bold">Nama RTM</TableHead>
                            <TableHead className="w-[200px] font-bold">Materi Rapat</TableHead>
                            <TableHead className="w-[200px] font-bold">Peserta</TableHead>
                            <TableHead className="w-[80px] text-center font-bold">Link RTM</TableHead>
                            <TableHead className="w-[100px] text-center font-bold">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-center">{index + 1}</TableCell>
                                <TableCell>{item.noRtm}</TableCell>
                                <TableCell>{item.tanggal}</TableCell>
                                <TableCell>{item.namaRtm}</TableCell>
                                <TableCell>{item.materiRapat}</TableCell>
                                <TableCell>{item.peserta}</TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" className="text-sky-500 hover:text-sky-600" onClick={() => window.open(item.linkRtm, "_blank")}>
                                        <ExternalLink className="h-5 w-5" />
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <Button variant="default" size="icon" className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 rounded-sm" onClick={() => onEdit(item)}>
                                            <Edit className="h-4 w-4 text-white" />
                                        </Button>
                                        <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-500 hover:bg-red-600 rounded-sm" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4 text-white" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Tidak ada data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                
                <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="h-8 border-slate-300 text-slate-500">Previous</Button>
                        <Button variant="default" size="sm" className="h-8 w-8 bg-sky-600 text-white p-0">1</Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">2</Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">3</Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">4</Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">5</Button>
                        <span className="px-2">...</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">9</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-sky-600">Next</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

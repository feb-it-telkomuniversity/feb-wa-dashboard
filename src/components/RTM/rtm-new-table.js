"use client";

import { useMemo, useState } from "react";
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
import { Search, ExternalLink, Edit, Trash2, Plus, FileText } from "lucide-react";
import ButtonRipleSpotlight from "../shadcn-space/radix/button/button-16";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import ButtonBlobFill from "../shadcn-space/radix/button/button-17";
import ButtonWithIcon from "../shadcn-space/radix/button/button-08";

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
]

const PER_PAGE = 5;

// ─── Peserta Chips ─────────────────────────────────────────────────
function PesertaChips({ peserta = "" }) {
    const list = peserta
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

    const visible = list.slice(0, 3);
    const hidden = list.slice(3);

    return (
        <div className="flex flex-wrap gap-1">
            {visible.map((p, i) => (
                <span
                    key={i}
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 whitespace-nowrap"
                >
                    {p}
                </span>
            ))}
            {hidden.length > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 whitespace-nowrap cursor-pointer">
                                +{hidden.length} lainnya
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs leading-relaxed">
                                {hidden.join(", ")}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
}

// ─── Pagination ────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
    const pages = useMemo(() => {
        const p = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) p.push(i);
        } else {
            p.push(1);
            if (page > 3) p.push("...");
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) p.push(i);
            if (page < totalPages - 2) p.push("...");
            p.push(totalPages);
        }
        return p;
    }, [page, totalPages]);

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => onPage(page - 1)}
            >
                <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`e-${i}`} className="px-1 text-xs text-gray-400">
                        ···
                    </span>
                ) : (
                    <Button
                        key={p}
                        variant={p === page ? "default" : "ghost"}
                        size="icon"
                        className={`h-7 w-7 text-xs ${p === page
                            ? "bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500"
                            : "text-gray-500"
                            }`}
                        onClick={() => onPage(p)}
                    >
                        {p}
                    </Button>
                )
            )}

            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === totalPages}
                onClick={() => onPage(page + 1)}
            >
                <ChevronRight className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

export default function RtmNewTable({ onAdd, onEdit }) {
    // const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState(initialData);

    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    // ── Filter ─────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        if (!q) return data;
        return data.filter(
            (item) =>
                item.namaRtm?.toLowerCase().includes(q) ||
                item.noRtm?.toLowerCase().includes(q) ||
                item.materiRapat?.toLowerCase().includes(q) ||
                item.peserta?.toLowerCase().includes(q)
        );
    }, [data, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
    const rangeEnd = Math.min(safePage * PER_PAGE, filtered.length);

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start mt-1 gap-3">
                    <div className="p-3 rounded-xl bg-primary dark:bg-primary/20">
                        <FileText className="size-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Rekapitulasi Riwayat Tinjauan Manajemen</h1>
                        <p className="text-muted-foreground">
                            Pantau progres dokumen RTM yang telah diajukan.</p>
                    </div>
                </div>
            </div>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                {/* ── Header ── */}
                <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 gap-4 flex-wrap">
                    {/* <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Riwayat RTM
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                {"Direktorat Fakultas Ekonomi dan Bisnis"}
                            </p>
                        </div>
                    </div> */}

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama atau nomor RTM..."
                                className="pl-8 h-8 text-xs w-52"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>

                        {/* Tambah */}
                        <ButtonBlobFill
                            text="Tambah Notula"
                            icon={<Plus className="h-3.5 w-3.5" />}
                            className="h-8 text-xs gap-1.5 rounded-lg text-white"
                            onClick={onAdd}
                        >
                        </ButtonBlobFill>
                    </div>
                </CardHeader>

                {/* ── Table ── */}
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
                                    {[
                                        { label: "No", w: "w-10", center: true },
                                        { label: "No RTM", w: "w-[100px]" },
                                        { label: "Tanggal", w: "w-[95px]" },
                                        { label: "Nama RTM", w: "w-[200px]" },
                                        { label: "Materi Rapat", w: "w-[190px]" },
                                        { label: "Peserta", w: "" },
                                        { label: "Link", w: "w-[56px]", center: true },
                                        { label: "Aksi", w: "w-[72px]", center: true },
                                    ].map((col) => (
                                        <TableHead
                                            key={col.label}
                                            className={`${col.w} py-2.5 px-3 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 ${col.center ? "text-center" : ""}`}
                                        >
                                            {col.label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {slice.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-14"
                                        >
                                            <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                {searchQuery
                                                    ? `Tidak ada hasil untuk "${searchQuery}"`
                                                    : "Belum ada data RTM"}
                                            </p>
                                            {searchQuery && (
                                                <button
                                                    onClick={() => { setSearchQuery(""); setPage(1); }}
                                                    className="mt-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                                                >
                                                    Hapus pencarian
                                                </button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    slice.map((item, i) => (
                                        <TableRow
                                            key={item.id}
                                            className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-teal-50/40 dark:hover:bg-teal-900/10 transition-colors"
                                        >
                                            {/* No */}
                                            <TableCell className="px-3 py-3 text-center text-xs text-gray-400">
                                                {(safePage - 1) * PER_PAGE + i + 1}
                                            </TableCell>

                                            {/* No RTM */}
                                            <TableCell className="px-3 py-3">
                                                <span className="font-mono text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                                    {item.noRtm}
                                                </span>
                                            </TableCell>

                                            {/* Tanggal */}
                                            <TableCell className="px-3 py-3">
                                                <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {item.tanggal}
                                                </span>
                                            </TableCell>

                                            {/* Nama RTM */}
                                            <TableCell className="px-3 py-3">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed cursor-default">
                                                                {item.namaRtm}
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="max-w-[260px]">
                                                            <p className="text-xs">{item.namaRtm}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>

                                            {/* Materi Rapat */}
                                            <TableCell className="px-3 py-3">
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                    {item.materiRapat}
                                                </p>
                                            </TableCell>

                                            {/* Peserta */}
                                            <TableCell className="px-3 py-3">
                                                <PesertaChips peserta={item.peserta} />
                                            </TableCell>

                                            {/* Link RTM */}
                                            <TableCell className="px-3 py-3 text-center">
                                                <ButtonWithIcon
                                                    size="icon"
                                                    icon={<ExternalLink className="h-3.5 w-3.5" />}
                                                    className="h-7 w-7 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/40 text-sky-700 dark:text-sky-400 border-0 shadow-none"
                                                    onClick={() => window.open(item.linkRtm, "_blank")}
                                                    title="Buka Link RTM"
                                                >
                                                </ButtonWithIcon>
                                            </TableCell>

                                            {/* Aksi */}
                                            <TableCell className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <ButtonWithIcon
                                                        size="icon"
                                                        icon={<Edit className="h-3.5 w-3.5" />}
                                                        className="h-7 w-7 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-0 shadow-none"
                                                        onClick={() => onEdit?.(item)}
                                                        title="Edit"
                                                    >
                                                    </ButtonWithIcon>
                                                    <ButtonWithIcon
                                                        size="icon"
                                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                                        className="h-7 w-7 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border-0 shadow-none"

                                                        onClick={() => onDelete?.(item.id)}
                                                        title="Hapus"
                                                    >
                                                    </ButtonWithIcon>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* ── Footer / Pagination ── */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {filtered.length === 0
                                ? "Tidak ada data"
                                : `Menampilkan ${rangeStart}–${rangeEnd} dari ${filtered.length} entri`}
                        </p>
                        {totalPages > 1 && (
                            <Pagination
                                page={safePage}
                                totalPages={totalPages}
                                onPage={setPage}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

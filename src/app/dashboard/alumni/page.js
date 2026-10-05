"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import api from "@/lib/axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { 
    Users, 
    Briefcase, 
    GraduationCap, 
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    LayoutGrid,
    TableIcon,
    X,
    SearchX,
    ListFilter,
    Mail,
    ChevronsUpDown
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import ExportExcelButton from "@/components/shared/ExportExcelButton";
import { AlumniGridView } from "@/components/Alumni/alumni-grid-view";
import { useDebounce } from "@/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#009da5", "#f59e0b", "#3b82f6", "#ef4444", "#10b981", "#8b5cf6"];

export default function AlumniDashboard() {
    const [fullData, setFullData] = useState([]);
    const [availableProdi, setAvailableProdi] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const [viewMode, setViewMode] = useState('table');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    
    // Filters
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [filters, setFilters] = useState({
        prodi: "all",
        status: "all",
        angkatan: "all"
    });
    
    // Sort
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const listRef = useRef(null);

    useEffect(() => {
        fetchStatsData();
    }, []);

    const fetchStatsData = async () => {
        setStatsLoading(true);
        try {
            const res = await api.get(`/api/alumni?limit=5000`);
            if (res.data?.status === "success") {
                setFullData(res.data.data);
                if (res.data.meta?.available_prodi) {
                    setAvailableProdi(res.data.meta.available_prodi);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    };

    // Derived Statistics
    const totalAlumni = fullData.length;
    const countBekerja = fullData.filter(d => d.status_saat_ini?.toLowerCase().includes("bekerja") && !d.status_saat_ini?.toLowerCase().includes("belum")).length;
    const countBelum = totalAlumni - countBekerja;
    
    // Status Chart Data
    const statusCounts = fullData.reduce((acc, curr) => {
        const s = curr.status_saat_ini || "Tidak Diketahui";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));

    // Angkatan Chart Data
    const angkatanCounts = fullData.reduce((acc, curr) => {
        const a = curr.angkatan || "Unknown";
        acc[a] = (acc[a] || 0) + 1;
        return acc;
    }, {});
    const barData = Object.keys(angkatanCounts).sort().map(k => ({ name: k, total: angkatanCounts[k] }));

    // Available Angkatan for filter
    const availableAngkatan = Object.keys(angkatanCounts).sort((a, b) => b.localeCompare(a)); // descending

    // Filtering logic (Client-side)
    const filteredData = useMemo(() => {
        return fullData.filter(d => {
            // Search
            if (debouncedSearch) {
                const q = debouncedSearch.toLowerCase();
                const matchName = d.nama_lengkap?.toLowerCase().includes(q);
                const matchNim = d.nim?.toLowerCase().includes(q);
                const matchPerusahaan = d.nama_perusahaan?.toLowerCase().includes(q);
                if (!matchName && !matchNim && !matchPerusahaan) return false;
            }
            // Filters
            if (filters.prodi !== "all" && d.prodi !== filters.prodi) return false;
            if (filters.angkatan !== "all" && d.angkatan !== filters.angkatan) return false;
            if (filters.status !== "all") {
                const isWorking = d.status_saat_ini?.toLowerCase().includes("bekerja") && !d.status_saat_ini?.toLowerCase().includes("belum");
                if (filters.status === "bekerja" && !isWorking) return false;
                if (filters.status === "belum" && isWorking) return false;
            }
            return true;
        });
    }, [fullData, debouncedSearch, filters]);

    // Sorting logic
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let valA = a[sortConfig.key] || "";
                let valB = b[sortConfig.key] || "";
                
                if (sortConfig.key === 'angkatan') {
                    valA = parseInt(valA) || 0;
                    valB = parseInt(valB) || 0;
                } else if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / limit) || 1;
    const paginatedData = useMemo(() => {
        if (limit === 3000) return sortedData;
        const start = (page - 1) * limit;
        return sortedData.slice(start, start + limit);
    }, [sortedData, page, limit]);

    useEffect(() => {
        setPage(1); // Reset page on filter/search change
    }, [debouncedSearch, filters, limit, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Export Excel Columns
    const excelColumns = [
        { header: 'NIM', key: 'nim', width: 15 },
        { header: 'Nama Lengkap', key: 'nama_lengkap', width: 30 },
        { header: 'Program Studi', key: 'prodi', width: 25 },
        { header: 'Angkatan', key: 'angkatan', width: 10 },
        { header: 'Status Saat Ini', key: 'status_saat_ini', width: 20 },
        { header: 'Nama Perusahaan', key: 'nama_perusahaan', width: 30 },
        { header: 'Bidang Pekerjaan', key: 'bidang_pekerjaan', width: 25 },
        { header: 'Linearitas', key: 'linear_prodi', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'LinkedIn', key: 'linkedin', width: 25 },
    ];

    const handleClearSearch = () => {
        setSearch('');
    }

    const resetFilters = () => {
        setFilters({ prodi: "all", status: "all", angkatan: "all" });
    }

    const activeFilterCount = Object.values(filters).filter(v => v !== "all").length;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Alumni</h2>
                    <p className="text-muted-foreground mt-1">Sistem Informasi Pengelolaan Data Alumni FEB Telkom University</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-gray-200/50 hover:border-primary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalAlumni}</div>
                        <p className="text-xs text-muted-foreground mt-1">Terdaftar dalam database SIGAP</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-gray-200/50 hover:border-primary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sudah Bekerja</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : countBekerja}</div>
                        <p className="text-xs text-muted-foreground mt-1">Sedang aktif bekerja</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-gray-200/50 hover:border-primary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Belum Bekerja / Lanjut Studi</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : countBelum}</div>
                        <p className="text-xs text-muted-foreground mt-1">Termasuk magang dan studi lanjut</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Status Saat Ini</CardTitle>
                        <CardDescription>Persentase status pekerjaan alumni</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {statsLoading ? (
                            <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Sebaran Angkatan</CardTitle>
                        <CardDescription>Jumlah alumni berdasarkan tahun angkatan</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {statsLoading ? (
                            <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="total" fill="#009da5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 pt-4" ref={listRef}>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Filter Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 relative">
                                <ListFilter className="h-4 w-4" />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="start">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm leading-none">Filter Data</h4>
                                    {activeFilterCount > 0 && (
                                        <Button variant="ghost" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary" onClick={resetFilters}>
                                            Reset
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Program Studi</Label>
                                    <Select value={filters.prodi} onValueChange={(v) => setFilters(prev => ({ ...prev, prodi: v }))}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Semua Prodi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Prodi</SelectItem>
                                            {availableProdi.map(p => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Status Pekerjaan</Label>
                                    <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Semua Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="bekerja">Sudah Bekerja</SelectItem>
                                            <SelectItem value="belum">Belum Bekerja / Studi Lanjut</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Angkatan</Label>
                                    <Select value={filters.angkatan} onValueChange={(v) => setFilters(prev => ({ ...prev, angkatan: v }))}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Semua Angkatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Angkatan</SelectItem>
                                            {availableAngkatan.map(a => (
                                                <SelectItem key={a} value={a}>{a}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="relative flex-1 w-full min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari berdasarkan nama, NIM, atau perusahaan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9 h-9 w-full shadow-sm"
                        />
                        {search && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ExportExcelButton
                            data={sortedData}
                            fileName="Direktori_Alumni"
                            sheetName="Alumni"
                            columns={excelColumns}
                            iconOnly={true}
                        />
                        <Select
                            value={String(limit)}
                            onValueChange={(value) => setLimit(parseInt(value))}
                        >
                            <SelectTrigger className="w-[100px] h-9 shrink-0 text-xs bg-card shadow-sm">
                                <SelectValue placeholder="15 data" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15 data</SelectItem>
                                <SelectItem value="30">30 data</SelectItem>
                                <SelectItem value="3000">Semua</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-lg p-1 flex items-center h-9 shrink-0 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md transition-colors ${
                                    viewMode === 'table'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                                title="Table View"
                            >
                                <TableIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-medium">Filter Aktif:</span>
                        {filters.prodi !== "all" && (
                            <Badge variant="secondary" className="text-xs font-normal bg-secondary/50">
                                Prodi: {filters.prodi}
                            </Badge>
                        )}
                        {filters.status !== "all" && (
                            <Badge variant="secondary" className="text-xs font-normal bg-secondary/50">
                                Status: {filters.status === "bekerja" ? "Bekerja" : "Belum Bekerja"}
                            </Badge>
                        )}
                        {filters.angkatan !== "all" && (
                            <Badge variant="secondary" className="text-xs font-normal bg-secondary/50">
                                Angkatan: {filters.angkatan}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Data Display */}
                {statsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                        Mengambil data dari SIGAP...
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-card rounded-xl border border-border shadow-sm">
                        <SearchX className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">Tidak ada data alumni ditemukan</p>
                        <p className="text-xs mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda</p>
                        {(debouncedSearch || activeFilterCount > 0) && (
                            <Button
                                variant="link"
                                onClick={() => { setSearch(''); resetFilters(); }}
                                className="mt-2 text-sm text-primary"
                            >
                                Hapus semua filter & pencarian
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <AlumniGridView alumniList={paginatedData} />
                        ) : (
                            <Card className="shadow-sm">
                                <CardContent className="p-0">
                                    <div className="rounded-md overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border/50 select-none">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort('nim')}>
                                                        <div className="flex items-center gap-1">NIM <ChevronsUpDown className="h-3 w-3 opacity-50" /></div>
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold min-w-[200px] cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort('nama_lengkap')}>
                                                        <div className="flex items-center gap-1">Nama Lengkap <ChevronsUpDown className="h-3 w-3 opacity-50" /></div>
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort('prodi')}>
                                                        <div className="flex items-center gap-1">Program Studi <ChevronsUpDown className="h-3 w-3 opacity-50" /></div>
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-center cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort('angkatan')}>
                                                        <div className="flex items-center justify-center gap-1">Angkatan <ChevronsUpDown className="h-3 w-3 opacity-50" /></div>
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-center cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort('status_saat_ini')}>
                                                        <div className="flex items-center justify-center gap-1">Status Pekerjaan <ChevronsUpDown className="h-3 w-3 opacity-50" /></div>
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold min-w-[250px] cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort('nama_perusahaan')}>
                                                        <div className="flex items-center gap-1">Perusahaan <ChevronsUpDown className="h-3 w-3 opacity-50" /></div>
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold text-center cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort('linear_prodi')}>
                                                        <div className="flex items-center justify-center gap-1">Linearitas <ChevronsUpDown className="h-3 w-3 opacity-50" /></div>
                                                    </th>
                                                    <th className="px-4 py-3 font-semibold">Kontak</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((alumni) => {
                                                    const isWorking = alumni.status_saat_ini?.toLowerCase().includes("bekerja") && !alumni.status_saat_ini?.toLowerCase().includes("belum");
                                                    return (
                                                        <tr key={alumni.nim} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                                                            <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{alumni.nim}</td>
                                                            <td className="px-4 py-3.5 font-medium whitespace-nowrap">{alumni.nama_lengkap}</td>
                                                            <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{alumni.prodi}</td>
                                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">{alumni.angkatan}</td>
                                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-semibold border ${
                                                                    isWorking 
                                                                        ? "bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" 
                                                                        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                                                }`}>
                                                                    {alumni.status_saat_ini || "-"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="truncate max-w-[250px] font-medium" title={alumni.nama_perusahaan}>
                                                                        {alumni.nama_perusahaan || "-"}
                                                                    </span>
                                                                    {alumni.bidang_pekerjaan && (
                                                                        <span className="text-[11px] text-primary/80 truncate max-w-[250px]" title={alumni.bidang_pekerjaan}>
                                                                            {alumni.bidang_pekerjaan}
                                                                        </span>
                                                                    )}
                                                                    {alumni.alamat_perusahaan && (
                                                                        <span className="text-[10px] text-muted-foreground truncate max-w-[250px]" title={alumni.alamat_perusahaan}>
                                                                            {alumni.alamat_perusahaan}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                                {isWorking && alumni.linear_prodi ? (
                                                                    <Badge variant={alumni.linear_prodi?.toLowerCase().includes("tidak") ? "outline" : "default"} className="text-[10px] uppercase">
                                                                        {alumni.linear_prodi}
                                                                    </Badge>
                                                                ) : <span className="text-muted-foreground">-</span>}
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex items-center gap-2">
                                                                    {alumni.email ? (
                                                                        <a href={`mailto:${alumni.email}`} className="p-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors" title={alumni.email}>
                                                                            <Mail className="h-3.5 w-3.5" />
                                                                        </a>
                                                                    ) : <span className="text-muted-foreground">-</span>}
                                                                    
                                                                    {alumni.linkedin ? (
                                                                        <a href={alumni.linkedin.startsWith('http') ? alumni.linkedin : `https://${alumni.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors" title={alumni.linkedin}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                                                                        </a>
                                                                    ) : null}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-border/40 gap-4">
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Menampilkan {sortedData.length === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, sortedData.length)} dari {sortedData.length} entri
                            </div>
                            <div className="flex justify-end">
                                <Pagination>
                                    <PaginationContent className="gap-1.5">
                                        <PaginationItem>
                                            <PaginationPrevious href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    setPage(p => Math.max(1, p - 1));
                                                    if (listRef.current) listRef.current.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className={`h-8 w-8 p-0 flex items-center justify-center rounded-md border [&>span]:hidden ${page === 1 ? "pointer-events-none opacity-50 border-border" : "cursor-pointer border-border/70 hover:bg-muted"}`}
                                            />
                                        </PaginationItem>
                                        
                                        {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((p) => {
                                            if (
                                                p === 1 ||
                                                p === totalPages ||
                                                (p >= page - 1 && p <= page + 1)
                                            ) {
                                                return (
                                                    <PaginationItem key={p}>
                                                        <PaginationLink
                                                            href="#"
                                                            isActive={p === page}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setPage(p);
                                                                if (listRef.current) listRef.current.scrollIntoView({ behavior: 'smooth' });
                                                            }}
                                                            className={`h-8 w-8 p-0 flex items-center justify-center rounded-md font-medium text-sm transition-colors ${
                                                                p === page 
                                                                    ? "bg-[#009da5] text-white hover:bg-[#008c93] hover:text-white border-transparent" 
                                                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent bg-transparent"
                                                            }`}
                                                        >
                                                            {p}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            } else if (
                                                p === page - 2 ||
                                                p === page + 2
                                            ) {
                                                return <PaginationItem key={p} className="text-slate-400"><PaginationEllipsis /></PaginationItem>;
                                            }
                                            return null;
                                        })}

                                        <PaginationItem>
                                            <PaginationNext href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    if (page < totalPages) {
                                                        setPage(p => p + 1);
                                                        if (listRef.current) listRef.current.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }}
                                                className={`h-8 w-8 p-0 flex items-center justify-center rounded-md border [&>span]:hidden ${page >= totalPages ? "pointer-events-none opacity-50 border-border" : "cursor-pointer border-border/70 hover:bg-muted"}`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

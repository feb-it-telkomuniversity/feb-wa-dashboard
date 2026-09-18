'use client'

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, LayoutGrid, Table as TableIcon, Briefcase, GraduationCap, User, ShieldCheck, Filter } from 'lucide-react';
import api from '@/lib/axios';
import AddUser from '@/components/Users/add-user';
import EditUserForm from '@/components/Users/edit-user-form';
import UserGridView from '@/components/Users/user-grid-view';
import UserTableView from '@/components/Users/user-table-view';

const ROLES = [
    'super_admin',
    'admin',
    'dekanat',
    'wadek',
    'kaur',
    'pegawai',
    'tpa',
    'kaprodi',
    'sekprodi',
    'ketua_kk',
    'dosen',
    'mahasiswa',
    'umum'
];

const ROLE_CONFIG = {
    super_admin: { color: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400', label: 'Super Admin', icon: '🔐' },
    admin: { color: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400', label: 'Administrator', icon: '🔐' },
    dekanat: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Dekanat', icon: '🏛️' },
    wadek: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Wakil Dekan', icon: '🏛️' },
    ketua_kk: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Ketua KK', icon: '🏛️' },
    kaprodi: { color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400', label: 'Kaprodi', icon: '👨‍🎓' },
    sekprodi: { color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400', label: 'Sekprodi', icon: '📝' },
    dosen: { color: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', label: 'Dosen', icon: '👨‍🏫' },
    kaur: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Kaur', icon: '🏛️' },
    pegawai: { color: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', label: 'Pegawai', icon: '👔' },
    tpa: { color: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', label: 'TPA', icon: '👨‍🏫' },
    mahasiswa: { color: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400', label: 'Mahasiswa', icon: '🧑' },
    umum: { color: 'bg-gray-500/10 border-gray-500/30 text-gray-600 dark:text-gray-400', label: 'Umum', icon: '👤' },
};

// Grouping Pengguna (Opsi 3: Pegawai = Dosen, Tendik/TPA, Pejabat Struktural)
const USER_GROUPS = {
    all: {
        id: 'all',
        label: 'Semua Pengguna',
        icon: Users,
        roles: ROLES,
    },
    pegawai: {
        id: 'pegawai',
        label: 'Grup Pegawai',
        description: 'Dosen, TPA/Tendik & Struktural',
        icon: Briefcase,
        roles: ['pegawai', 'dosen', 'tpa', 'kaur', 'kaprodi', 'sekprodi', 'ketua_kk', 'dekanat', 'wadek'],
    },
    mahasiswa: {
        id: 'mahasiswa',
        label: 'Grup Mahasiswa',
        description: 'Mahasiswa aktif',
        icon: GraduationCap,
        roles: ['mahasiswa'],
    },
    umum: {
        id: 'umum',
        label: 'Grup Umum',
        description: 'Pengguna umum & eksternal',
        icon: User,
        roles: ['umum'],
    },
    admin: {
        id: 'admin',
        label: 'Administrator',
        description: 'Super Admin & Admin',
        icon: ShieldCheck,
        roles: ['super_admin', 'admin'],
    },
};

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [selectedRole, setSelectedRole] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(res.data.users || []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Perhitungan Ringkasan Statistik per Grup
    const groupStats = useMemo(() => {
        const total = users.length;
        const pegawaiRoles = USER_GROUPS.pegawai.roles;
        const totalPegawai = users.filter(u => pegawaiRoles.includes(u.role)).length;
        const totalMahasiswa = users.filter(u => u.role === 'mahasiswa').length;
        const totalUmum = users.filter(u => u.role === 'umum').length;
        const totalAdmin = users.filter(u => ['super_admin', 'admin'].includes(u.role)).length;

        // Rincian sub-role di dalam Grup Pegawai
        const dosenCount = users.filter(u => u.role === 'dosen').length;
        const tpaCount = users.filter(u => u.role === 'tpa').length;
        const pegawaiCount = users.filter(u => u.role === 'pegawai').length;
        const strukturalCount = users.filter(u => ['kaur', 'kaprodi', 'sekprodi', 'ketua_kk', 'dekanat', 'wadek'].includes(u.role)).length;

        return {
            total,
            totalPegawai,
            totalMahasiswa,
            totalUmum,
            totalAdmin,
            pegawaiBreakdown: { dosenCount, tpaCount, pegawaiCount, strukturalCount }
        };
    }, [users]);

    // Daftar role yang relevan untuk filter sub-role berdasarkan grup yang aktif
    const activeGroupRoles = useMemo(() => {
        if (selectedGroup === 'all') return ROLES;
        return USER_GROUPS[selectedGroup]?.roles || [];
    }, [selectedGroup]);

    // Filter pengguna berdasarkan search query, user group, dan sub-role
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (user.name && user.name.toLowerCase().includes(query)) ||
                (user.username && user.username.toLowerCase().includes(query)) ||
                (user.role && user.role.toLowerCase().includes(query));

            const currentGroupRoles = USER_GROUPS[selectedGroup]?.roles || ROLES;
            const matchesGroup = selectedGroup === 'all' || currentGroupRoles.includes(user.role);
            const matchesRole = selectedRole === 'all' || user.role === selectedRole;

            return matchesSearch && matchesGroup && matchesRole;
        });
    }, [users, searchQuery, selectedGroup, selectedRole]);

    const handleSelectGroup = (groupId) => {
        setSelectedGroup(groupId);
        setSelectedRole('all'); // Reset sub-role ke 'all' saat berganti grup
    };

    const handleSaveSuccess = () => {
        fetchUsers();
        setSelectedUser(null);
    };

    if (selectedUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 p-6">
                <div className="max-w-7xl mx-auto">
                    <EditUserForm
                        user={selectedUser}
                        onSuccess={handleSaveSuccess}
                        onGoBack={() => setSelectedUser(null)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
                            <p className="text-muted-foreground mt-1">
                                Kelola pengguna sistem dengan pembagian grup Pegawai (Dosen & Tendik), Mahasiswa, dan Umum
                            </p>
                        </div>
                    </div>
                </div>

                {/* Executive Group Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Total User */}
                    <Card
                        onClick={() => handleSelectGroup('all')}
                        className={`cursor-pointer transition-all duration-200 border-border/40 backdrop-blur-sm shadow-sm hover:border-primary/40 ${
                            selectedGroup === 'all' ? 'ring-2 ring-primary bg-primary/5 border-primary/40' : 'bg-card/40'
                        }`}
                    >
                        <CardContent className="pt-5 pb-4 px-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total User</p>
                                <Users className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold mt-2">{groupStats.total}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">Seluruh akun terdaftar</p>
                        </CardContent>
                    </Card>

                    {/* Grup Pegawai */}
                    <Card
                        onClick={() => handleSelectGroup('pegawai')}
                        className={`cursor-pointer transition-all duration-200 border-border/40 backdrop-blur-sm shadow-sm hover:border-amber-500/40 ${
                            selectedGroup === 'pegawai' ? 'ring-2 ring-amber-500 bg-amber-500/5 border-amber-500/40' : 'bg-card/40'
                        }`}
                    >
                        <CardContent className="pt-5 pb-4 px-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold">Grup Pegawai</p>
                                <Briefcase className="w-4 h-4 text-amber-600" />
                            </div>
                            <p className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">{groupStats.totalPegawai}</p>
                            <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-muted-foreground">
                                <span>{groupStats.pegawaiBreakdown.pegawaiCount} Pegawai</span> &bull;
                                <span>{groupStats.pegawaiBreakdown.dosenCount} Dosen</span> &bull;
                                <span>{groupStats.pegawaiBreakdown.tpaCount} TPA</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grup Mahasiswa */}
                    <Card
                        onClick={() => handleSelectGroup('mahasiswa')}
                        className={`cursor-pointer transition-all duration-200 border-border/40 backdrop-blur-sm shadow-sm hover:border-purple-500/40 ${
                            selectedGroup === 'mahasiswa' ? 'ring-2 ring-purple-500 bg-purple-500/5 border-purple-500/40' : 'bg-card/40'
                        }`}
                    >
                        <CardContent className="pt-5 pb-4 px-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider font-semibold">Grup Mahasiswa</p>
                                <GraduationCap className="w-4 h-4 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold mt-2 text-purple-600 dark:text-purple-400">{groupStats.totalMahasiswa}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">Mahasiswa FEB aktif</p>
                        </CardContent>
                    </Card>

                    {/* Grup Umum */}
                    <Card
                        onClick={() => handleSelectGroup('umum')}
                        className={`cursor-pointer transition-all duration-200 border-border/40 backdrop-blur-sm shadow-sm hover:border-gray-500/40 ${
                            selectedGroup === 'umum' ? 'ring-2 ring-gray-500 bg-gray-500/5 border-gray-500/40' : 'bg-card/40'
                        }`}
                    >
                        <CardContent className="pt-5 pb-4 px-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Grup Umum</p>
                                <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold mt-2">{groupStats.totalUmum}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">Eksternal / Tamu</p>
                        </CardContent>
                    </Card>

                    {/* Administrator */}
                    <Card
                        onClick={() => handleSelectGroup('admin')}
                        className={`cursor-pointer transition-all duration-200 border-border/40 backdrop-blur-sm shadow-sm hover:border-red-500/40 ${
                            selectedGroup === 'admin' ? 'ring-2 ring-red-500 bg-red-500/5 border-red-500/40' : 'bg-card/40'
                        }`}
                    >
                        <CardContent className="pt-5 pb-4 px-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider font-semibold">Admin</p>
                                <ShieldCheck className="w-4 h-4 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">{groupStats.totalAdmin}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">Pengelola Sistem</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="flex-1">
                        <div className="relative group">
                            <Input
                                placeholder="Cari user berdasarkan nama, username, atau role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-4 pr-10 h-11 bg-card/40 backdrop-blur-sm border-border/40 group-hover:border-primary/50 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-lg p-1 flex items-center h-11">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${
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
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'table'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                                title="Table View"
                            >
                                <TableIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <AddUser onSuccess={fetchUsers} roles={ROLES} role_config={ROLE_CONFIG} />
                    </div>
                </div>

                {/* Filter Section: 1. User Groups Tab, 2. Sub-role Pills */}
                <div className="space-y-3 bg-card/20 p-4 rounded-2xl border border-border/30 backdrop-blur-sm">
                    {/* 1. Filter Grup Utama */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mr-2">
                            <Filter className="w-3.5 h-3.5" /> Grup:
                        </span>
                        {Object.values(USER_GROUPS).map((group) => {
                            const IconComponent = group.icon;
                            const isActive = selectedGroup === group.id;
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => handleSelectGroup(group.id)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                                            : 'bg-card/60 hover:bg-card border border-border/40 text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <IconComponent className="w-3.5 h-3.5" />
                                    <span>{group.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* 2. Filter Sub-Role (menyesuaikan grup yang dipilih) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pt-1 border-t border-border/20">
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap mr-2">
                            Role:
                        </span>
                        <button
                            onClick={() => setSelectedRole('all')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                selectedRole === 'all'
                                    ? 'bg-secondary font-bold text-foreground ring-1 ring-border shadow-sm'
                                    : 'bg-transparent hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Semua ({activeGroupRoles.length} Role)
                        </button>
                        {activeGroupRoles.map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                    selectedRole === role
                                        ? 'bg-secondary font-bold text-foreground ring-1 ring-border shadow-sm'
                                        : 'bg-transparent hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <span>{ROLE_CONFIG[role]?.icon}</span>
                                <span>{ROLE_CONFIG[role]?.label || role}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Content */}
                <div className="space-y-4">
                    {filteredUsers.length === 0 ? (
                        <Card className="border-border/40 bg-card/40 backdrop-blur-sm h-64 flex items-center justify-center">
                            <CardContent>
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center opacity-20">
                                        <Users className="w-16 h-16" />
                                    </div>
                                    <p className="text-muted-foreground font-medium text-lg">
                                        {searchQuery
                                            ? `Tidak ada user dengan kata kunci "${searchQuery}"`
                                            : 'Tidak ada data pengguna dalam filter ini'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : viewMode === 'grid' ? (
                        <UserGridView
                            users={filteredUsers}
                            roleConfig={ROLE_CONFIG}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            fetchUsers={fetchUsers}
                            setSelectedUser={setSelectedUser}
                        />
                    ) : (
                        <UserTableView
                            users={filteredUsers}
                            roleConfig={ROLE_CONFIG}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            fetchUsers={fetchUsers}
                            setSelectedUser={setSelectedUser}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersPage;

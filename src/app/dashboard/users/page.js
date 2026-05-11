'use client'


import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, LayoutGrid, Table as TableIcon } from 'lucide-react';
import api from '@/lib/axios';
import AddUser from '@/components/Users/add-user';
import EditUserForm from '@/components/Users/edit-user-form';
import UserGridView from '@/components/Users/user-grid-view';
import UserTableView from '@/components/Users/user-table-view';

const ROLES = ['super_admin', 'admin', 'dekanat', 'wadek', 'kaur', 'tpa', 'kaprodi', 'sekprodi', 'ketua_kk', 'dosen', 'mahasiswa', 'umum'];

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
    tpa: { color: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', label: 'TPA', icon: '👨‍🏫' },
    mahasiswa: { color: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400', label: 'Mahasiswa', icon: '🧑' },
    umum: { color: 'bg-gray-500/10 border-gray-500/30 text-gray-600 dark:text-gray-400', label: 'Umum', icon: '👤' },
}

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    const filteredUsers = users.filter(
        (user) => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = selectedRole === 'all' || user.role === selectedRole;

            return matchesSearch && matchesRole;
        }
    )

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users')
            setUsers(res.data.users)
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleSaveSuccess = () => {
        fetchUsers()
        setSelectedUser(null)
    }

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
        )
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
                            <p className="text-muted-foreground mt-1">Kelola pengguna sistem dengan mudah dan aman</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-colors">
                        <CardContent className="pt-6">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total User</p>
                                <p className="text-3xl font-bold">{users.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    {ROLES.map((role) => (
                        <Card key={role} className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-colors">
                            <CardContent className="pt-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{ROLE_CONFIG[role].label}</p>
                                    <p className="text-2xl font-bold">{users.filter((u) => u.role === role).length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
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
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('table')} 
                                className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                                title="Table View"
                            >
                                <TableIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <AddUser onSuccess={fetchUsers} roles={ROLES} role_config={ROLE_CONFIG} />
                    </div>
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedRole('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${selectedRole === 'all'
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-card/40 hover:bg-card/80 border border-border/40 backdrop-blur-sm text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Semua Role
                    </button>
                    {ROLES.map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${selectedRole === role
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-card/40 hover:bg-card/80 border border-border/40 backdrop-blur-sm text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span>{ROLE_CONFIG[role]?.icon}</span>
                            {ROLE_CONFIG[role]?.label || role}
                        </button>
                    ))}
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
                                        {searchQuery ? `Tidak ada user dengan kata kunci "${searchQuery}"` : 'Belum ada data user yang tersedia'}
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
}

export default UsersPage

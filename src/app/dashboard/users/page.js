'use client'


import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Users, Lock } from 'lucide-react';
import api from '@/lib/axios';
import AddUser from '@/components/Users/add-user';
import DeleteUser from '@/components/Users/delete-user';
import EditUserForm from '@/components/Users/edit-user-form';

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
                    <AddUser onSuccess={fetchUsers} roles={ROLES} role_config={ROLE_CONFIG} />
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

                {/* User Grid */}
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
                    ) : (
                        <div className="grid gap-4">
                            {filteredUsers.map((user) => (
                                <Card key={user.id} className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                            <div className="flex items-start gap-5 flex-1">
                                                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 group-hover:bg-primary/20 transition-colors h-fit">
                                                    <Lock className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{user.name}</h3>
                                                    <div className="flex flex-col sm:flex-row gap-4 mt-2 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2 bg-secondary/30 px-2 py-0.5 rounded-md">
                                                            <Lock className="w-3.5 h-3.5" />
                                                            <span className="truncate font-medium">{user.username}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 hidden sm:block" />
                                                            <span>Terdaftar: {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <span className={`px-4 py-1 rounded-lg text-xs font-bold border shadow-sm ${ROLE_CONFIG[user.role]?.color || ROLE_CONFIG['kaur'].color}`}>
                                                            {ROLE_CONFIG[user.role]?.icon} {ROLE_CONFIG[user.role]?.label || user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 sm:flex-col sm:min-w-32">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="gap-2 flex-1 sm:flex-none h-10 font-semibold"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Ubah Profile
                                                </Button>
                                                <DeleteUser
                                                    isLoading={isLoading}
                                                    setIsLoading={setIsLoading}
                                                    userId={user.id}
                                                    onSuccess={fetchUsers}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UsersPage

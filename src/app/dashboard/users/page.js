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

const ROLES = ['admin', 'dekan', 'wadek_1', 'wadek_2', 'kaur_sekdek', 'kaur_laa', 'kaur_lab', 'kaur_sdm', 'kaur_kemahasiswaan', 'kaprodi', 'sekprodi', 'dosen', 'mahasiswa'];

const ROLE_CONFIG = {
    admin: { color: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400', label: 'Administrator', icon: '🔐' },
    dekan: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Dekan', icon: '🏛️' },
    wadek_1: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Wadek 1', icon: '🏛️' },
    wadek_2: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Wadek 2', icon: '🏛️' },
    kaur_sekdek: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Kaur Sekdek', icon: '👳🏿‍♀️' },
    kaur_laa: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Kaur Laa', icon: '👳🏿‍♀️' },
    kaur_lab: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Kaur Lab', icon: '👳🏿‍♀️' },
    kaur_sdm: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Kaur SDM', icon: '👳🏿‍♀️' },
    kaur_kemahasiswaan: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', label: 'Kaur Kemahasiswaan', icon: '👳🏿‍♀️' },
    kaprodi: { color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400', label: 'Kaprodi', icon: '👨‍🎓' },
    sekprodi: { color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400', label: 'Sekprodi', icon: '📝' },
    dosen: { color: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', label: 'Dosen', icon: '👨‍🏫' },
    mahasiswa: { color: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400', label: 'Mahasiswa', icon: '🧑' },
}

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role.toLowerCase().includes(searchQuery.toLowerCase())
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

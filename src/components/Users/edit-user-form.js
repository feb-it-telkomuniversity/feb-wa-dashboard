'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Shield, Lock, User, AlertCircle, CheckCircle, LoaderIcon } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

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

export default function EditUserForm({ user, onSuccess, onGoBack }) {
    const [formData, setFormData] = useState({
        name: user.name,
        username: user.username,
        password: '',
        role: user.role,
        supervisorId: user.supervisorId || null,
        unitId: user.unitId || null,
    })

    const [isLoading, setIsLoading] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [supervisors, setSupervisors] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        const fetchSupervisors = async () => {
            try {
                const res = await api.get('/api/users');
                const usersArray = res.data?.users || [];
                const filtered = usersArray.filter(u => ['wadek_1', 'wadek_2'].includes(u.role));
                setSupervisors(filtered);
            } catch (error) {
                console.error("Gagal memuat daftar supervisor", error);
            }
        };

        const fetchUnits = async () => {
            try {
                const res = await api.get('/api/units');
                const unitsArray = res.data?.units || [];
                setUnits(unitsArray);
            } catch (error) {
                console.error("Gagal memuat daftar unit", error);
            }
        };

        fetchSupervisors()
        fetchUnits()
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        if (!formData.name || !formData.username) {
            toast.error("Nama dan Username harus diisi", {
                position: "top-center",
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
            return
        }

        setIsLoading(true)
        try {
            const payload = {
                name: formData.name,
                username: formData.username,
                role: formData.role,
                unitId: formData.unitId ? parseInt(formData.unitId) : null,
            }

            // Jika role nya kaur_ tapi ID atasannya tidak diisi, set null.
            if (formData.role.startsWith('kaur_')) {
                payload.supervisorId = formData.supervisorId ? parseInt(formData.supervisorId) : null;
            } else {
                payload.supervisorId = null;
            }

            if (formData.password && formData.password.trim() !== "") {
                payload.password = formData.password;
            }
            const res = await api.put(`/api/users/${user.id}`, payload)
            if (res.status === 200) {
                toast.success("Data user berhasil diperbarui", {
                    position: "top-center",
                    style: { background: "#059669", color: "#d1fae5" },
                    className: "border border-emerald-500"
                })
                setHasChanges(false)
                onSuccess()
            }
        } catch (error) {
            console.error("Gagal memperbarui user:", error)
            toast.error(error.response?.data?.message || "Oops sepertinya layanan ini sedang kami perbaiki", {
                position: "top-center",
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-4">
                <Button variant="ghost" onClick={onGoBack} className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar User
                </Button>
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-primary/10 dark:bg-primary/20">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Edit Profile User</h1>
                        <p className="text-muted-foreground mt-1">Sesuaikan informasi akun dan level akses pengguna</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Informasi Dasar</CardTitle>
                            <CardDescription>Nama lengkap dan identitas login user</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nama Lengkap</label>
                                <Input
                                    placeholder="Contoh: Ahmad Sidik"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="bg-secondary/50 border-border/40 h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input
                                    placeholder="contoh: ahmadsidik"
                                    value={formData.username}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    className="bg-secondary/50 border-border/40 h-11"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Keamanan
                            </CardTitle>
                            <CardDescription>Update password akun user</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password Baru</label>
                                <Input
                                    type="password"
                                    placeholder="Biarkan kosong jika tidak ingin mengubah password"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className="bg-secondary/50 border-border/40 h-11"
                                />
                            </div>
                            <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                                    Penting: Password baru akan langsung aktif setelah disimpan. Pastikan untuk memberitahu user mengenai perubahan ini.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Role & Status */}
                    <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Role & Akses</CardTitle>
                            <CardDescription>Level perizinan dalam sistem</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className='space-y-2'>
                                <label className="text-sm font-medium">Unit Terdaftar</label>
                                <Select
                                    value={formData.unitId ? formData.unitId.toString() : undefined}
                                    onValueChange={(value) => handleChange('unitId', value)}
                                >
                                    <SelectTrigger className="bg-secondary/50 border-border/40 h-11">
                                        <SelectValue placeholder="Pilih Unit / Belum terdaftar" />
                                    </SelectTrigger>
                                    <SelectContent className="border-border/40">
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                <span className="flex items-center gap-2">
                                                    {unit.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role Pengguna</label>
                                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                                    <SelectTrigger className="bg-secondary/50 border-border/40 h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-border/40">
                                        {ROLES.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                <span className="flex items-center gap-2">
                                                    {ROLE_CONFIG[role]?.icon} {ROLE_CONFIG[role]?.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.role.startsWith('kaur_') && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Atasan (Supervisor) *</label>
                                    <Select
                                        value={formData.supervisorId ? formData.supervisorId.toString() : ""}
                                        onValueChange={(value) => handleChange('supervisorId', value)}
                                    >
                                        <SelectTrigger className="bg-secondary/50 border-border/40 h-11">
                                            <SelectValue placeholder="Pilih Wadek yang mengepalai Kaur ini" />
                                        </SelectTrigger>
                                        <SelectContent className="border-border/40">
                                            {supervisors.length > 0 ? (
                                                supervisors.map((spv) => (
                                                    <SelectItem key={spv.id} value={spv.id.toString()}>
                                                        {spv.name} ({ROLE_CONFIG[spv.role]?.label || spv.role})
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>Mencari Wadek 1 & 2...</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Preview Role</p>
                                <div className="mt-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <span className="text-xl">{ROLE_CONFIG[formData.role]?.icon}</span>
                                    <span className="font-bold">{ROLE_CONFIG[formData.role]?.label}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm opacity-80">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Terakhir aktif</span>
                                <span className="font-mono text-xs">{new Date(user.updatedAt).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Bergabung pada</span>
                                <span>{new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Sticky Actions */}
            <div className="sticky bottom-6 flex gap-4 p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-border/40 shadow-lg">
                <Button
                    variant="outline"
                    onClick={onGoBack}
                    className="flex-1 h-12 bg-transparent hover:bg-secondary/50"
                    disabled={isLoading}
                >
                    Batalkan Perubahan
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isLoading}
                    className="flex-1 h-12 shadow-md shadow-primary/20"
                >
                    {isLoading ? (
                        <>
                            <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Simpan Perubahan
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

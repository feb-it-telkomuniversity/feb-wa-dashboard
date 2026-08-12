import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Plus, LoaderIcon, Eye, EyeClosed, Building2, KeyRound, Fingerprint } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect } from 'react';
import { MenuMultiSelect } from '../menu-multi-select';

export default function AddUser({ onSuccess, roles, role_config }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [supervisors, setSupervisors] = useState([]);
    const [units, setUnits] = useState([])
    const [pwVisible, setPwVisible] = useState(false);
    const [accountType, setAccountType] = useState('manual'); // 'manual' | 'sso'
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        password: '',
        role: 'mahasiswa',
        supervisorId: null,
        unitId: null,
        accessibleMenus: [],
    })

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setAccountType('manual');
        setFormData({ username: '', name: '', password: '', role: 'mahasiswa', supervisorId: null, unitId: null, accessibleMenus: [] })
    }

    useEffect(() => {
        if (isDialogOpen) {
            const fetchSupervisors = async () => {
                try {
                    const res = await api.get('/api/users');
                    const usersArray = res.data?.users || [];
                    const filtered = usersArray.filter(u => ['wadek', 'dekanat'].includes(u.role));
                    setSupervisors(filtered);
                } catch (error) {
                    console.error("Gagal memuat daftar supervisor", error);
                }
            }

            const fetchUnits = async () => {
                try {
                    const res = await api.get('/api/units');
                    const unitsArray = res.data?.units || [];
                    setUnits(unitsArray);
                } catch (error) {
                    console.error("Gagal memuat daftar unit", error);
                }
            }

            fetchSupervisors()
            fetchUnits()
        }
    }, [isDialogOpen])

    const handleSubmit = async () => {
        const isSso = accountType === 'sso';

        if (!formData.username || !formData.name) {
            toast.error("Username dan Nama harus diisi", {
                position: 'top-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
            return
        }

        if (!isSso && !formData.password) {
            toast.error("Password wajib diisi untuk akun manual", {
                position: 'top-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
            return
        }

        try {
            setIsLoading(true);
            const payload = {
                username: formData.username,
                name: formData.name,
                role: formData.role,
                unitId: formData.unitId ? parseInt(formData.unitId) : null,
                accessibleMenus: formData.accessibleMenus,
                isSsoUser: isSso,
            };

            if (!isSso) {
                payload.password = formData.password;
            }

            if (formData.supervisorId && (formData.role === 'kaur' || formData.role === 'tpa')) {
                payload.supervisorId = parseInt(formData.supervisorId);
            }

            await api.post('/api/register-user', payload);

            toast.success(isSso ? "Akun SSO berhasil dipetakan!" : "User berhasil ditambahkan", {
                position: 'top-center',
                style: { background: "#059669", color: "#d1fae5" },
                className: "border border-emerald-500"
            })

            if (onSuccess) {
                onSuccess()
            }
            handleCloseDialog()
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || "Terjadi kesalahan saat menambahkan user", {
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            setIsLoading(false)
        }
    };

    const isSso = accountType === 'sso';

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 h-11 px-6">
                    <Plus className="w-4 h-4" />
                    Tambah User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg border-border/40 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Tambah User Baru
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Account Type Toggle */}
                    <div>
                        <label className="text-sm font-semibold block mb-2">Tipe Akun</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/40 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setAccountType('manual')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                                    accountType === 'manual'
                                        ? 'bg-card shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <KeyRound className="w-4 h-4" />
                                Manual
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType('sso')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                                    accountType === 'sso'
                                        ? 'bg-card shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Fingerprint className="w-4 h-4" />
                                SSO Telkom
                            </button>
                        </div>

                        {/* SSO info banner */}
                        {isSso && (
                            <div className="mt-3 flex gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <Fingerprint className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    Pre-register akun SSO Telkom University. Username harus sama dengan <strong>NIM/NIP</strong> user di Gateway SSO. User tidak perlu password — mereka akan login langsung via SSO.
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-semibold block mb-2">Nama Lengkap</label>
                        <Input
                            placeholder="Masukkan nama lengkap"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-secondary/50 border-border/40 h-10"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold block mb-2">
                            {isSso ? 'Username SSO (NIM / NIP)' : 'Username'}
                        </label>
                        <Input
                            placeholder={isSso ? "Masukkan NIM/NIP sesuai SSO Gateway" : "Masukkan username"}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="bg-secondary/50 border-border/40 h-10"
                        />
                    </div>

                    {/* Password field — hanya tampil jika akun manual */}
                    {!isSso && (
                        <div>
                            <label className="text-sm font-semibold block mb-2">Password</label>
                            <div className="relative">
                                <Input
                                    type={pwVisible ? "text" : "password"}
                                    placeholder="Masukkan password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-secondary/50 border-border/40 h-10"
                                />
                                <Button
                                    onClick={() => setPwVisible(!pwVisible)}
                                    variant="ghost"
                                    className={"absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent"}
                                >
                                    {pwVisible ? <EyeClosed /> : <Eye />}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-semibold block mb-2">Pilih Unit *</label>
                        <Select
                            value={formData.unitId ? formData.unitId.toString() : ""}
                            onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                        >
                            <SelectTrigger className="bg-secondary/50 border-border/40 h-10 w-full">
                                <SelectValue placeholder="Pilih Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" /> {unit.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold block mb-2">Role</label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                            className="bg-secondary/50 border-border/40 h-10"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        <div className="flex items-center gap-2">
                                            {role_config[role]?.icon} {role_config[role]?.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(formData.role === 'kaur') && (
                        <div>
                            <label className="text-sm font-semibold block mb-2">Pilih Atasan (Supervisor) *</label>
                            <Select
                                value={formData.supervisorId ? formData.supervisorId.toString() : ""}
                                onValueChange={(value) => setFormData({ ...formData, supervisorId: value })}
                            >
                                <SelectTrigger className="bg-secondary/50 border-border/40 h-10 w-full">
                                    <SelectValue placeholder="Pilih Wadek yang mengepalai Kaur ini" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supervisors.length > 0 ? (
                                        supervisors.map((spv) => (
                                            <SelectItem key={spv.id} value={spv.id.toString()}>
                                                {spv.name} ({role_config[spv.role]?.label || spv.role})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>Mencari Wadek 1 & 2...</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-semibold block mb-2">Akses Menu Tambahan</label>
                        <MenuMultiSelect
                            selectedMenus={formData.accessibleMenus}
                            onChange={(menus) => setFormData({ ...formData, accessibleMenus: menus })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseDialog} className="flex-1 bg-transparent hover:bg-secondary/50">
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                            {isLoading ? (
                                <>
                                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                isSso ? '🔗 Petakan Akun SSO' : 'Tambah User'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}

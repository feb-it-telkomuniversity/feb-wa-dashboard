import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Plus, LoaderIcon, Eye, EyeClosed, Building2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect } from 'react';

export default function AddUser({ onSuccess, roles, role_config }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [supervisors, setSupervisors] = useState([]);
    const [units, setUnits] = useState([])
    const [pwVisible, setPwVisible] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        password: '',
        role: 'mahasiswa',
        supervisorId: null,
        unitId: null,
    })

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setFormData({ username: '', name: '', password: '', role: 'mahasiswa', supervisorId: null, unitId: null })
    }

    useEffect(() => {
        if (isDialogOpen) {
            const fetchSupervisors = async () => {
                try {
                    const res = await api.get('/api/users');
                    const usersArray = res.data?.users || [];
                    const filtered = usersArray.filter(u => ['wadek_1', 'wadek_2'].includes(u.role));
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
        if (!formData.username || !formData.name || !formData.password) {
            toast.error("Semua field harus diisi", {
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
                password: formData.password,
                role: formData.role,
                unitId: formData.unitId ? parseInt(formData.unitId) : null,
            };

            if (formData.supervisorId && formData.role.startsWith('kaur_')) {
                payload.supervisorId = parseInt(formData.supervisorId);
            }

            await api.post('/api/register-user', payload);

            toast.success("User berhasil ditambahkan", {
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
                        <label className="text-sm font-semibold block mb-2">Username</label>
                        <Input
                            placeholder="Masukkan username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="bg-secondary/50 border-border/40 h-10"
                        />
                    </div>

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

                    {formData.role.startsWith('kaur_') && (
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
                                'Tambah User'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}

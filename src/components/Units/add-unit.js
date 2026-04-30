import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, LoaderIcon } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddUnit({ onSuccess, categories }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Prodi'
    });

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setFormData({ name: '', category: 'Prodi' });
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.category) {
            toast.error("Semua field harus diisi", {
                position: 'top-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            });
            return;
        }

        try {
            setIsLoading(true);
            await api.post('/api/units', formData);

            toast.success("Unit berhasil ditambahkan", {
                position: 'top-center',
                style: { background: "#059669", color: "#d1fae5" },
                className: "border border-emerald-500"
            });

            if (onSuccess) {
                onSuccess();
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Terjadi kesalahan saat menambahkan unit", {
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 h-11 px-6">
                    <Plus className="w-4 h-4" />
                    Tambah Unit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg border-border/40 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Tambah Unit Baru
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold block mb-2">Nama Unit</label>
                        <Input
                            placeholder="Masukkan nama unit (contoh: S1 Akuntansi)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-secondary/50 border-border/40 h-10"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold block mb-2">Kategori Unit</label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="bg-secondary/50 border-border/40 h-10 w-full">
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                'Tambah Unit'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
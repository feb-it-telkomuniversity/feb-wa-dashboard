import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Edit2, LoaderIcon } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function EditUnit({ unit, onSuccess }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: ''
    });

    useEffect(() => {
        if (unit) {
            setFormData({
                name: unit.name || '',
                category: unit.category || ''
            });
        }
    }, [unit]);

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setFormData({
            name: unit.name || '',
            category: unit.category || ''
        });
    }

    const handleSubmit = async () => {
        if (!formData.name && !formData.category) {
            toast.error("Nama atau kategori harus diisi", {
                position: 'top-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            });
            return;
        }

        try {
            setIsLoading(true);
            await api.put(`/api/units/${unit.id}`, formData);

            toast.success("Unit berhasil diubah", {
                position: 'top-center',
                style: { background: "#059669", color: "#d1fae5" },
                className: "border border-emerald-500"
            });

            if (onSuccess) {
                onSuccess();
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Terjadi kesalahan saat mengubah unit", {
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) handleCloseDialog();
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 flex-1 sm:flex-none h-10 font-semibold"
                >
                    <Edit2 className="w-4 h-4" />
                    Ubah Unit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg border-border/40 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Ubah Data Unit
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
                        <Input
                            placeholder="Masukkan kategori (contoh: Prodi, KK)"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="bg-secondary/50 border-border/40 h-10"
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
                                'Simpan Perubahan'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
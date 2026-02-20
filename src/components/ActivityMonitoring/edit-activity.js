'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { formatCamelCaseLabel } from "@/lib/utils";

const EditActivity = ({
    isDialogOpen,
    setIsDialogOpen,
    editingId,
    formData,
    setFormData,
    units,
    rooms,
    officials,
    onSuccess,
    isLoading,
    setIsLoading
}) => {
    const updateActivity = async (id, payload) => {
        setIsLoading(true);
        try {
            const res = await api.put(
                `/api/activity-monitoring/${id}`,
                payload
            )
            return res.data
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        if (!formData.ruangan) {
            toast.error("Ruangan belum dipilih. Silakan pilih ruangan terlebih dahulu.", {
                style: { background: "#b91c1c", color: "#fef2f2" },
                iconTheme: { primary: "#b91c1c", secondary: "#fff" },
            })
            return
        }

        if (!rooms.includes(formData.ruangan)) {
            toast.error(
                "Data ruangan tidak valid. Silakan pilih ulang ruangan.",
                {
                    style: { background: "#b91c1c", color: "#fef2f2" },
                    iconTheme: { primary: "#b91c1c", secondary: "#fff" },
                }
            )
            return
        }

        if (
            formData.ruangan === "Lainnya" &&
            (!formData.locationDetail || formData.locationDetail.trim() === "")
        ) {
            toast.error("Jika memilih 'Lainnya', isi detail lokasi kegiatan.");
            return
        }

        e.preventDefault()

        if (!editingId) {
            toast.error("ID kegiatan tidak ditemukan");
            return;
        }

        try {
            const payload = {
                title: formData.namaKegiatan,
                date: formData.tanggal,
                startTime: new Date(`${formData.tanggal}T${formData.waktuMulai}:00`).toISOString(),
                endTime: new Date(`${formData.tanggal}T${formData.waktuSelesai}:00`).toISOString(),
                participants: Number(formData.jumlahPeserta) || 0,
                description: formData.keterangan,
                unit: formData.unit,
                otherUnit: formData.otherUnit || "",
                room: formData.ruangan,
                locationDetail: formData.locationDetail || "",
                officials: [...new Set(formData.pejabat)],
            }

            await updateActivity(editingId, payload)
            toast.success("Kegiatan berhasil diperbarui")

            setIsDialogOpen(false);

            setFormData({
                namaKegiatan: "",
                tanggal: "",
                waktuMulai: "",
                waktuSelesai: "",
                unit: "",
                otherUnit: "",
                ruangan: "",
                locationDetail: "",
                pejabat: [],
                jumlahPeserta: "",
                keterangan: "",
            });

            onSuccess()
        } catch (err) {
            console.error(err);
            toast.error("Gagal memperbarui kegiatan")
        }
    }

    if (!editingId) {
        return null;
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Edit Kegiatan
                    </DialogTitle>
                    <DialogDescription>
                        Edit informasi kegiatan di bawah. Sistem akan mendeteksi konflik otomatis.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-namaKegiatan">Nama Kegiatan *</Label>
                            <Input
                                id="edit-namaKegiatan"
                                value={formData.namaKegiatan}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        namaKegiatan: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-tanggal">Tanggal *</Label>
                                <Input
                                    id="edit-tanggal"
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) =>
                                        setFormData({ ...formData, tanggal: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-waktuMulai">Waktu Mulai *</Label>
                                <Input
                                    id="edit-waktuMulai"
                                    type="time"
                                    value={formData.waktuMulai}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            waktuMulai: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-waktuSelesai">Waktu Selesai *</Label>
                                <Input
                                    id="edit-waktuSelesai"
                                    type="time"
                                    value={formData.waktuSelesai}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            waktuSelesai: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="edit-unit">Unit Penyelenggara *</Label>
                                    <Select
                                        value={formData.unit}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, unit: value })
                                        }
                                        required
                                    >
                                        <SelectTrigger id="edit-unit" className={"w-full"}>
                                            <SelectValue placeholder="Pilih unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((unit) => (
                                                <SelectItem key={unit} value={unit}>
                                                    {formatCamelCaseLabel(unit)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className={`${formData.unit === "Lainnya" ? "" : "hidden"}`}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="otherUnit" className="text-red-500">Detail Unit Penyelenggara *</Label>
                                        <Input
                                            id="otherUnit"
                                            type="text"
                                            value={formData.otherUnit || ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, otherUnit: e.target.value })
                                            }
                                            placeholder="Tulis detail unit penyelenggara"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="w-full">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="edit-ruangan">Ruangan *</Label>
                                    <Select
                                        value={formData.ruangan}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, ruangan: value })
                                        }
                                        required
                                    >
                                        <SelectTrigger id="edit-ruangan" className={"w-full"}>
                                            <SelectValue placeholder="Pilih ruangan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rooms.map((room) => (
                                                <SelectItem key={room} value={room}>
                                                    {formatCamelCaseLabel(room)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className={`grid gap-2 ${formData.ruangan === "Lainnya" ? "" : "hidden"}`}>
                                    <Label htmlFor="edit-locationDetail">Detail Lokasi</Label>
                                    <Input
                                        id="edit-locationDetail"
                                        type="text"
                                        value={formData.locationDetail || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                locationDetail: e.target.value,
                                            })
                                        }
                                        placeholder="Tulis detail lokasi"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Pejabat yang Hadir *</Label>
                            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                                {officials.map((official) => {
                                    const currentPejabat = Array.isArray(formData.pejabat) ? formData.pejabat : []

                                    // menghilangkan spasi dan mengubah ke lowercase
                                    const normalizeStr = (str) => (str || "").replace(/\s+/g, "").toLowerCase();

                                    // Cek apakah dicentang dengan membandingkan string yang sudah dinormalisasi
                                    const isChecked = currentPejabat.some(p => normalizeStr(p) === normalizeStr(official));

                                    return (
                                        <label
                                            key={official}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            // Masukkan value baru dan pakai Set() biar mustahil double
                                                            pejabat: [...new Set([...currentPejabat, official])],
                                                        })
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            // Filter keluar pejabat yang namanya sama (setelah dinormalisasi)
                                                            pejabat: currentPejabat.filter(
                                                                (p) => normalizeStr(p) !== normalizeStr(official)
                                                            ),
                                                        })
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm">{formatCamelCaseLabel(official)}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-jumlahPeserta">Jumlah Peserta</Label>
                            <Input
                                id="edit-jumlahPeserta"
                                type="number"
                                value={formData.jumlahPeserta}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        jumlahPeserta: e.target.value,
                                    })
                                }
                                placeholder="Estimasi jumlah peserta"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-keterangan">Keterangan</Label>
                            <Textarea
                                id="edit-keterangan"
                                value={formData.keterangan || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, keterangan: e.target.value })
                                }
                                placeholder="Informasi tambahan tentang kegiatan"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                setFormData({
                                    namaKegiatan: "",
                                    tanggal: "",
                                    waktuMulai: "",
                                    waktuSelesai: "",
                                    unit: "",
                                    otherUnit: "",
                                    ruangan: "",
                                    pejabat: [],
                                    jumlahPeserta: "",
                                    keterangan: "",
                                });
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#e31e25] hover:bg-[#c41a20]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="size-4 animate-spin" />
                                    Menyimpan Perubahan...
                                </span>
                            ) : (
                                "Update Kegiatan"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}

export default EditActivity
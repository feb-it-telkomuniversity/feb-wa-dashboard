'use client'

import { useState, useEffect } from "react";
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
import { CalendarPlus, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { formatCamelCaseLabel } from "@/lib/utils";
import { motion } from "framer-motion";
import { RecipientsMultiSelect } from "@/components/Scheduler/recipient-multi-select";

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
    setIsLoading,
    exportToGoogleCalendar
}) => {
    // WhatsApp Reminder States
    const [sendWaReminder, setSendWaReminder] = useState(false)
    const [reminderDate, setReminderDate] = useState('')
    const [reminderTime, setReminderTime] = useState('08:00')
    const [reminderRecipients, setReminderRecipients] = useState([])
    const [reminderDescription, setReminderDescription] = useState('')
    const [contacts, setContacts] = useState([])

    // Fetch contacts
    useEffect(() => {
        if (isDialogOpen) {
            const fetchContacts = async () => {
                try {
                    const res = await api.get('/api/contacts')
                    setContacts(res.data || [])
                } catch (e) {
                    console.error("Gagal mengambil daftar kontak:", e)
                }
            }
            fetchContacts()
            // Reset local states when opening
            setSendWaReminder(false)
            setReminderRecipients([])
            setReminderTime('08:00')
            setReminderDescription('')
        }
    }, [isDialogOpen])

    // Sync reminderDate with activity date
    useEffect(() => {
        if (formData.tanggal) {
            setReminderDate(formData.tanggal)
        }
    }, [formData.tanggal])

    // Generate template description
    useEffect(() => {
        if (formData.namaKegiatan) {
            const roomName = formData.ruangan === "Lainnya" 
                ? (formData.locationDetail || "Lainnya") 
                : formatCamelCaseLabel(formData.ruangan || "");
            
            const dateStr = formData.tanggal 
                ? new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                : "";

            setReminderDescription(
                `Mengingatkan agenda: ${formData.namaKegiatan} pada hari ${dateStr} pukul ${formData.waktuMulai || ''} - ${formData.waktuSelesai || ''} WIB di ${roomName || '-'}. Terima kasih.`
            )
        } else {
            setReminderDescription('')
        }
    }, [formData.namaKegiatan, formData.tanggal, formData.waktuMulai, formData.waktuSelesai, formData.ruangan, formData.locationDetail])

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
                position: 'top-center',
                style: { background: "#b91c1c", color: "#fef2f2" },
                iconTheme: { primary: "#b91c1c", secondary: "#fff" },
            })
            return
        }

        if (!rooms.includes(formData.ruangan)) {
            toast.error(
                "Data ruangan tidak valid. Silakan pilih ulang ruangan.",
                {
                    position: 'top-center',
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
            toast.error("Jika memilih 'Lainnya', isi detail lokasi kegiatan.", {
                position: 'top-center',
                style: { background: "#b91c1c", color: "#fef2f2" },
                iconTheme: { primary: "#b91c1c", secondary: "#fff" },
            })
            return
        }

        e.preventDefault()

        if (!editingId) {
            toast.error("ID kegiatan tidak ditemukan", {
                position: 'top-center',
                style: { background: "#b91c1c", color: "#fef2f2" },
                iconTheme: { primary: "#b91c1c", secondary: "#fff" },
            })
            return;
        }

        if (sendWaReminder && reminderRecipients.length === 0) {
            toast.error("Silakan pilih minimal satu penerima reminder WA!", {
                position: 'top-center',
                style: { background: "#b91c1c", color: "#fef2f2" },
            })
            return
        }

        if (sendWaReminder && (!reminderDate || !reminderTime)) {
            toast.error("Silakan tentukan tanggal dan waktu pengiriman reminder WA!", {
                position: 'top-center',
                style: { background: "#b91c1c", color: "#fef2f2" },
            })
            return
        }

        try {
            const payload = {
                title: formData.namaKegiatan,
                date: formData.tanggal,
                endDate: formData.tanggalBerakhir,
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

            // If WA reminder is active, create the schedule
            if (sendWaReminder) {
                const combinedEventDateTime = new Date(`${formData.tanggal}T${formData.waktuMulai}:00`)
                const combinedReminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`)
                const formattedRecipients = reminderRecipients.map((r) => ({ id: r.id }))

                await api.post(`/api/schedules`, {
                    eventTitle: formData.namaKegiatan,
                    eventDescription: reminderDescription,
                    eventTime: combinedEventDateTime,
                    reminderTime: combinedReminderDateTime,
                    createdBy: '6282318572605@c.us', // Standard value
                    recipients: formattedRecipients
                }, {
                    headers: {
                        "ngrok-skip-browser-warning": true,
                    },
                })
                
                toast.success("Kegiatan diperbarui & pengingat WA berhasil ditambahkan", {
                    position: 'top-center',
                    style: { background: "#16a34a", color: "#fef2f2" },
                    iconTheme: { primary: "#16a34a", secondary: "#fff" },
                })
            } else {
                toast.success("Kegiatan berhasil diperbarui", {
                    position: 'top-center',
                    style: { background: "#16a34a", color: "#fef2f2" },
                    iconTheme: { primary: "#16a34a", secondary: "#fff" },
                })
            }

            setIsDialogOpen(false);

            setFormData({
                namaKegiatan: "",
                tanggal: "",
                tanggalBerakhir: "",
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

            // Reset local states
            setSendWaReminder(false)
            setReminderRecipients([])
            setReminderTime('08:00')
            setReminderDescription('')

            onSuccess()
        } catch (err) {
            console.error(err);
            toast.error("Gagal memperbarui kegiatan", {
                position: 'top-center',
                style: { background: "#b91c1c", color: "#fef2f2" },
                iconTheme: { primary: "#b91c1c", secondary: "#fff" },
            })
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-tanggal">Tanggal Mulai *</Label>
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
                                <Label htmlFor="edit-tanggalBerakhir">Tanggal Berakhir</Label>
                                <Input
                                    id="edit-tanggalBerakhir"
                                    type="date"
                                    value={formData.tanggalBerakhir || ""}
                                    // min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) =>
                                        setFormData({ ...formData, tanggalBerakhir: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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

                        {/* Section WhatsApp Reminder */}
                        <div className="border-t pt-4 mt-2 space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    id="edit-sendWaReminder"
                                    type="checkbox"
                                    checked={sendWaReminder}
                                    onChange={(e) => setSendWaReminder(e.target.checked)}
                                    className="rounded h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                />
                                <Label htmlFor="edit-sendWaReminder" className="font-bold text-sm text-emerald-600 dark:text-emerald-400 cursor-pointer">
                                    Aktifkan Pengingat WhatsApp (WA)
                                </Label>
                            </div>

                            {sendWaReminder && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 bg-emerald-50/50 dark:bg-emerald-950/15 p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/40"
                                >
                                    <div className="grid gap-2">
                                        <Label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Penerima Pengingat WA *</Label>
                                        <RecipientsMultiSelect
                                            value={reminderRecipients}
                                            onChange={setReminderRecipients}
                                            contacts={contacts}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-reminderDate" className="font-semibold text-xs text-slate-700 dark:text-slate-300">Tanggal Pengiriman *</Label>
                                            <Input
                                                id="edit-reminderDate"
                                                type="date"
                                                value={reminderDate}
                                                min={new Date().toISOString().split("T")[0]}
                                                onChange={(e) => setReminderDate(e.target.value)}
                                                required={sendWaReminder}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-reminderTime" className="font-semibold text-xs text-slate-700 dark:text-slate-300">Jam Pengiriman *</Label>
                                            <Input
                                                id="edit-reminderTime"
                                                type="time"
                                                value={reminderTime}
                                                onChange={(e) => setReminderTime(e.target.value)}
                                                required={sendWaReminder}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-reminderDescription" className="font-semibold text-xs text-slate-700 dark:text-slate-300">Isi Pesan Pengingat WA *</Label>
                                        <Textarea
                                            id="edit-reminderDescription"
                                            rows={3}
                                            value={reminderDescription}
                                            onChange={(e) => setReminderDescription(e.target.value)}
                                            placeholder="Tulis pesan pengingat WA di sini..."
                                            required={sendWaReminder}
                                        />
                                    </div>
                                </motion.div>
                            )}
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
                                    tanggalBerakhir: "",
                                    waktuMulai: "",
                                    waktuSelesai: "",
                                    unit: "",
                                    otherUnit: "",
                                    ruangan: "",
                                    pejabat: [],
                                    jumlahPeserta: "",
                                    keterangan: "",
                                });
                                setSendWaReminder(false)
                                setReminderRecipients([])
                                setReminderTime('08:00')
                                setReminderDescription('')
                            }}
                        >
                            Batal
                        </Button>
                        {exportToGoogleCalendar && (
                            <Button
                                type="button"
                                onClick={() => exportToGoogleCalendar(formData)}
                                className="gap-2 border-[#4285F4] bg-[#4285F4] text-white hover:bg-[#3367d6]"
                            >
                                <CalendarPlus className="h-4 w-4" />
                                Google Calendar
                            </Button>
                        )}
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
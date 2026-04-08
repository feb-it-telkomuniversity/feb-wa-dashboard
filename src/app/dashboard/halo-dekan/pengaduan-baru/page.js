"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import AttachmentUploader from "@/components/HaloDekan/AttachmentUpload";

const CATEGORIES = [
    "Akademik",
    "Kemahasiswaan",
    "Keuangan",
    "Fasilitas",
    "SumberDaya",
    "Umum"
]

export default function PengaduanBaruPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: "",
        description: "",
    })
    const [selectedFiles, setSelectedFiles] = useState([])

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category || !formData.description) {
            toast.error("Mohon lengkapi kategori dan deskripsi pengaduan");
            return;
        }

        try {
            setIsLoading(true)
            let uploadedUrls = []

            if (selectedFiles.length > 0) {
                const uploadData = new FormData();
                selectedFiles.forEach((file) => {
                    uploadData.append("attachments", file)
                })

                const uploadRes = await api.post("/api/halodekan/tickets/upload-attachments", uploadData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })

                // Simpan URL balasan dari backend
                uploadedUrls = uploadRes.data.urls
            }

            const payload = {
                category: formData.category,
                description: formData.description,
                attachmentUrl: uploadedUrls,
            }

            await api.post("/api/halodekan/tickets", payload)

            toast.success("Pengaduan berhasil dikirim", {
                style: { background: "#22c55e", color: "#fff" },
                iconTheme: { primary: "#22c55e", secondary: "#fff" }
            })
            router.push("/dashboard/halo-dekan/riwayat-tiket")
        } catch (err) {
            console.error("Gagal mengirim pengaduan:", err)
            const errorMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Gagal mengirim pengaduan"
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/dashboard/halo-dekan")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">
                            Buat Pengaduan Baru
                        </h1>
                        <p className="text-muted-foreground">
                            Sampaikan aspirasi atau keluhan Anda kepada Dekanat
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Pengaduan</CardTitle>
                        <CardDescription>
                            Isi detail pengaduan yang ingin Anda sampaikan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Kategori Pengaduan *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                    required
                                >
                                    <SelectTrigger id="category" className="w-full">
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi Pengaduan *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Ceritakan detail pengaduan atau keluhan Anda..."
                                    rows={6}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Lampiran Bukti (Opsional)</Label>
                                <AttachmentUploader files={selectedFiles} setFiles={setSelectedFiles} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/halo-dekan")}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-[#c41a20]">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Kirim Pengaduan
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
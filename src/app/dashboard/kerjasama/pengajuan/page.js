"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LoaderIcon,
  Send,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import SubmissionHistory from "@/components/PartnershipMonitoring/submission-history"
import { ActivityMultiSelect } from "@/components/PartnershipMonitoring/activity-multi-select"
import { Checkbox } from "@/components/ui/checkbox"
import api from "@/lib/axios"

const docTypeOptions = [
  { label: "MoA", value: "MoA" },
  { label: "MoU", value: "MoU" },
  { label: "IA", value: "IA" },
]

const scopeOptions = [
  { label: "Nasional", value: "national" },
  { label: "Internasional", value: "international" },
]

const partnershipTypeOptions = [
  { label: "Akademik", value: "Akademik" },
  { label: "Penelitian", value: "Penelitian" },
  { label: "Abdimas", value: "Abdimas" },
]

const activityTypeOptions = [
  {
    label: "Sub Akademik",
    options: [
      { label: "Joint Degree", value: "JointDegree" },
      { label: "Double Degree", value: "DoubleDegree" },
      { label: "Joint Class", value: "JointClass" },
      { label: "Student Exchange", value: "StudentExchange" },
      { label: "Visiting Professor", value: "VisitingProfessor" },
    ],
  },
  {
    label: "Sub Penelitian",
    options: [
      { label: "Joint Research", value: "JointResearch" },
      { label: "Joint Publication", value: "JointPublication" },
    ],
  },
  {
    label: "Sub Abdimas",
    options: [
      { label: "Joint Community Service", value: "JointCommunityService" },
      { label: "Social Project", value: "SocialProject" },
    ],
  },
  {
    label: "Umum",
    options: [
      { label: "General", value: "General" },
    ],
  }
]

const saveSubmissionToStorage = (submission) => {
  if (typeof window !== 'undefined') {
    const existingData = JSON.parse(localStorage.getItem('partnershipSubmissions') || '[]')
    existingData.push(submission)
    localStorage.setItem('partnershipSubmissions', JSON.stringify(existingData))
  }
}

const getSubmissionsFromStorage = () => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('partnershipSubmissions') || '[]')
  }
  return []
}

export default function AjukanKerjasamaPage() {
  const [formData, setFormData] = useState({
    partnerName: "",
    yearIssued: new Date().getFullYear().toString(),
    docType: "",
    scope: "",
    picExternal: "",
    picExternalPhone: "",
    picInternal: "",
    docNumberInternal: "",
    docNumberExternal: "",
    partnershipType: "",
    activityType: [],
    dateCreated: "",
    signingType: "",
    dateSigned: "",
    validUntil: "",
    duration: "",
    docLink: "",
    notes: "",
    hasHardcopy: false,
    hasSoftcopy: false,
  })

  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setSubmissions(getSubmissionsFromStorage())
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 5000000) {
        // 5MB
        toast.error("Ukuran file maksimal 5MB")
        return
      }
      setFile(selectedFile)
      toast.success("File berhasil dipilih")
    }
  }

  const normalizeDate = (value) => {
    if (!value) return null
    const parsed = new Date(value)
    return isNaN(parsed) ? null : parsed.toISOString()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      ...formData,
      yearIssued: formData.yearIssued ? Number(formData.yearIssued) : null,
      dateCreated: normalizeDate(formData.dateCreated),
      dateSigned: normalizeDate(formData.dateSigned),
      validUntil: normalizeDate(formData.validUntil),
    }

    if (
      !formData.partnerName ||
      !formData.partnershipType ||
      !formData.scope ||
      formData.activityType.length === 0
    ) {
      toast.error("Mohon lengkapi semua field yang wajib diisi (Nama Mitra, Tipe Kerjasama, Lingkup, dan Aktivitas)")
      return
    }

    try {
      setIsLoading(true)
      await api.post("/api/partnership", payload)

      const today = new Date().toISOString().split('T')[0]
      const newSubmission = {
        id: Date.now(),
        tanggalPengajuan: today,
        namaInstansi: formData.partnerName,
        jenisKerjasama: formData.partnershipType,
        ruangLingkup: formData.scope,
        ...formData,
        status: "Pending",
        keterangan: "Menunggu review dari Wadek II",
        timeline: [
          { tahap: "Pengajuan", tanggal: today, duration: null },
        ],
      }

      // Simpan ke localStorage (masih dipertahankan sesuai kode awal user)
      saveSubmissionToStorage(newSubmission)

      toast.success("Pengajuan kerjasama berhasil dikirim!", {
        style: { background: "#059669", color: "#d1fae5" },
        className: "border border-emerald-500"
      })

      // Navigasi ke halaman persetujuan setelah berhasil
      router.push('/dashboard/partnership-monitoring/persetujuan')

    } catch (error) {
      console.error("Ooops...Gagal menambahkan mitra nih:", error)
      toast.error(error?.response?.data?.message || "Ooops...Gagal menambahkan mitra nih", {
        style: { background: "#fee2e2", color: "#991b1b" },
        className: "border border-red-500"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ajukan Kerjasama
          </h1>
          <p className="text-muted-foreground">
            Form pengajuan dokumen kerjasama baru dengan mitra eksternal
          </p>
        </div>
      </div>

      {/* Form Pengajuan */}
      <Card>
        <CardHeader>
          <CardTitle>Form Pengajuan Kerjasama</CardTitle>
          <CardDescription>
            Lengkapi formulir di bawah ini untuk mengajukan kerjasama baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informasi Mitra */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Dasar & Mitra</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partnerName">
                    Nama Mitra/Instansi *
                  </Label>
                  <Input
                    id="partnerName"
                    placeholder="Contoh: Royal Ignatius"
                    value={formData.partnerName}
                    onChange={(e) =>
                      handleInputChange("partnerName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearIssued">Tahun Terbit</Label>
                  <Input
                    id="yearIssued"
                    type="number"
                    min="1900"
                    max="2100"
                    placeholder="2024"
                    value={formData.yearIssued}
                    onChange={(e) =>
                      handleInputChange("yearIssued", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docType">Tipe Dokumen</Label>
                  <Select
                    value={formData.docType}
                    onValueChange={(value) =>
                      handleInputChange("docType", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tipe dokumen" />
                    </SelectTrigger>
                    <SelectContent>
                      {docTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scope">Lingkup Kerjasama *</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) =>
                      handleInputChange("scope", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih lingkup" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* PIC Kontak */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">PIC & Kontak</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="picExternal">Nama PIC Eksternal</Label>
                  <Input
                    id="picExternal"
                    placeholder="Nama PIC Eksternal"
                    value={formData.picExternal}
                    onChange={(e) =>
                      handleInputChange("picExternal", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="picExternalPhone">No. PIC Eksternal</Label>
                  <Input
                    id="picExternalPhone"
                    placeholder="81234567890"
                    value={formData.picExternalPhone}
                    onChange={(e) =>
                      handleInputChange("picExternalPhone", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="picInternal">Nama PIC Internal (jika ada)</Label>
                  <Input
                    id="picInternal"
                    placeholder="Nama PIC Internal"
                    value={formData.picInternal}
                    onChange={(e) =>
                      handleInputChange("picInternal", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Nomor Dokumen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nomor Dokumen</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="docNumberInternal">Nomor Dokumen Internal</Label>
                  <Input
                    id="docNumberInternal"
                    placeholder="Cth: 001/SPIO/VI/2024"
                    value={formData.docNumberInternal}
                    onChange={(e) =>
                      handleInputChange("docNumberInternal", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docNumberExternal">Nomor Dokumen Eksternal</Label>
                  <Input
                    id="docNumberExternal"
                    placeholder="Cth: 002/MITRA/VII/2024"
                    value={formData.docNumberExternal}
                    onChange={(e) =>
                      handleInputChange("docNumberExternal", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Jenis Kerjasama */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Jenis Kerjasama & Aktivitas</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partnershipType">Tipe Kerjasama *</Label>
                  <Select
                    value={formData.partnershipType}
                    onValueChange={(value) =>
                      handleInputChange("partnershipType", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tipe kerjasama" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnershipTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jenis Aktivitas *</Label>
                  <ActivityMultiSelect
                    value={formData.activityType}
                    onValueChange={(value) => handleInputChange("activityType", value)}
                    activityTypeOptions={activityTypeOptions}
                  />
                </div>
              </div>
            </div>

            {/* Tanggal & Penandatanganan */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tanggal & Penandatanganan</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateCreated">Tanggal Dibuat</Label>
                  <Input
                    id="dateCreated"
                    type="date"
                    value={formData.dateCreated}
                    onChange={(e) =>
                      handleInputChange("dateCreated", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signingType">Metode Penandatanganan</Label>
                  <Input
                    id="signingType"
                    placeholder="Cth: Online / Onsite"
                    value={formData.signingType}
                    onChange={(e) =>
                      handleInputChange("signingType", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateSigned">Tanggal TTD</Label>
                  <Input
                    id="dateSigned"
                    type="date"
                    value={formData.dateSigned}
                    onChange={(e) =>
                      handleInputChange("dateSigned", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Berlaku Sampai</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      handleInputChange("validUntil", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="duration">Durasi</Label>
                  <Input
                    id="duration"
                    placeholder='Cth: "3 tahun"'
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Arsip & Lainnya */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Arsip & Catatan</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="docLink">Link Arsip (jika ada)</Label>
                  <Input
                    id="docLink"
                    placeholder="https://drive.google.com/..."
                    value={formData.docLink}
                    onChange={(e) =>
                      handleInputChange("docLink", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Catatan/Deskripsi</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Keterangan tambahan terkait kerjasama"
                    value={formData.notes}
                    onChange={(e) =>
                      handleInputChange("notes", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">Arsip Hardcopy</Label>
                      <p className="text-sm text-muted-foreground">Tersedia fisik di arsip?</p>
                    </div>
                    <Checkbox
                      checked={formData.hasHardcopy}
                      onCheckedChange={(checked) => handleInputChange("hasHardcopy", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">Arsip Softcopy</Label>
                      <p className="text-sm text-muted-foreground">Tersedia file digital?</p>
                    </div>
                    <Checkbox
                      checked={formData.hasSoftcopy}
                      onCheckedChange={(checked) => handleInputChange("hasSoftcopy", checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    partnerName: "",
                    yearIssued: new Date().getFullYear().toString(),
                    docType: "",
                    scope: "",
                    picExternal: "",
                    picExternalPhone: "",
                    picInternal: "",
                    docNumberInternal: "",
                    docNumberExternal: "",
                    partnershipType: "",
                    activityType: [],
                    dateCreated: "",
                    signingType: "",
                    dateSigned: "",
                    validUntil: "",
                    duration: "",
                    docLink: "",
                    notes: "",
                    hasHardcopy: false,
                    hasSoftcopy: false,
                  })
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoaderIcon className="animate-spin size-4" />
                    <span>Mengirim...</span>
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Pengajuan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* <SubmissionHistory /> */}
    </div >
  )
}

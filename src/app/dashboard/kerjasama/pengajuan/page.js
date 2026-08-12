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
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  LoaderIcon,
  Send,
  CalendarIcon,
  CheckCircle2,
  Trash2,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  Save,
  Info
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ActivityMultiSelect } from "@/components/PartnershipMonitoring/activity-multi-select"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"
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
  {
    label: "Bidang Kerjasama",
    options: [
      { label: "Akademik", value: "Akademik" },
      { label: "Penelitian", value: "Penelitian" },
      { label: "Abdimas", value: "Abdimas" },
    ]
  }
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
      { label: "Internship", value: "Internship" },
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

// Mock existing partners for autocomplete
const existingPartners = [
  "PT Telkom Indonesia",
  "Universitas Indonesia",
  "Institut Teknologi Bandung",
  "Bank Mandiri",
  "PT Pertamina",
  "Kementerian Keuangan",
]

const STEPS = [
  { id: 1, title: "Info Mitra" },
  { id: 2, title: "Dokumen & PIC" },
  { id: 3, title: "Aktivitas" },
  { id: 4, title: "Berkas" },
]

export default function AjukanKerjasamaPage() {
  const [step, setStep] = useState(1)
  const [isClient, setIsClient] = useState(false)
  
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
    partnershipType: [],
    activityType: [],
    dateCreated: null,
    signingType: "",
    dateSigned: null,
    validUntil: null,
    duration: "",
    docLink: "",
    notes: "",
    hasHardcopy: false,
    hasSoftcopy: false,
  })

  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    const draft = localStorage.getItem('kerjasama_draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        // Convert string dates back to Date objects if needed
        if (parsed.dateCreated) parsed.dateCreated = new Date(parsed.dateCreated)
        if (parsed.dateSigned) parsed.dateSigned = new Date(parsed.dateSigned)
        if (parsed.validUntil) parsed.validUntil = new Date(parsed.validUntil)
        if (typeof parsed.partnershipType === 'string') {
          parsed.partnershipType = parsed.partnershipType ? [parsed.partnershipType] : []
        }
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error("Failed to parse draft", e)
      }
    }
  }, [])

  // Auto-save logic
  useEffect(() => {
    if (!isClient) return
    const timer = setTimeout(() => {
      localStorage.setItem('kerjasama_draft', JSON.stringify(formData))
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData, isClient])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSaveDraft = () => {
    localStorage.setItem('kerjasama_draft', JSON.stringify(formData))
    toast.success("Draft berhasil disimpan!", {
      description: "Anda dapat melanjutkan pengisian nanti."
    })
  }

  const validateStep = (currentStep) => {
    const newErrors = {}
    if (currentStep === 1) {
      if (!formData.partnerName) newErrors.partnerName = "Nama Mitra wajib diisi"
      if (!formData.docType) newErrors.docType = "Tipe Dokumen wajib dipilih"
      if (!formData.scope) newErrors.scope = "Lingkup Kerjasama wajib dipilih"
    } else if (currentStep === 3) {
      if (formData.partnershipType.length === 0) newErrors.partnershipType = "Bidang Kerjasama wajib dipilih"
      if (formData.activityType.length === 0) newErrors.activityType = "Minimal pilih 1 jenis aktivitas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, STEPS.length))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.error("Mohon lengkapi field wajib pada langkah ini.")
    }
  }

  const handlePrev = () => {
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      toast.error("File tidak valid. Pastikan format PDF dan maksimal 5MB.")
      return
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1
  })

  const removeFile = () => setFile(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(4)) {
       toast.error("Ada data yang belum lengkap.")
       return
    }

    const payload = {
      ...formData,
      partnershipType: Array.isArray(formData.partnershipType) && formData.partnershipType.length > 0 ? formData.partnershipType[0] : (typeof formData.partnershipType === 'string' && formData.partnershipType ? formData.partnershipType : null),
      yearIssued: formData.yearIssued ? Number(formData.yearIssued) : null,
      dateCreated: formData.dateCreated ? formData.dateCreated.toISOString() : null,
      dateSigned: formData.dateSigned ? formData.dateSigned.toISOString() : null,
      validUntil: formData.validUntil ? formData.validUntil.toISOString() : null,
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

      // Save to history storage
      const existingData = JSON.parse(localStorage.getItem('partnershipSubmissions') || '[]')
      existingData.push(newSubmission)
      localStorage.setItem('partnershipSubmissions', JSON.stringify(existingData))

      // Clear draft
      localStorage.removeItem('kerjasama_draft')

      toast.success("Pengajuan kerjasama berhasil dikirim!", {
        style: { background: "#059669", color: "#d1fae5" },
        className: "border border-emerald-500"
      })

      router.push('/dashboard/partnership-monitoring/persetujuan')

    } catch (error) {
      console.error("Gagal mengajukan:", error)
      toast.error(error?.response?.data?.message || "Gagal mengajukan kerjasama", {
        style: { background: "#fee2e2", color: "#991b1b" },
        className: "border border-red-500"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Prevent hydration mismatch by returning null until client is ready
  if (!isClient) return null

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <Button variant="link" onClick={() => router.back()} className="w-fit p-0 h-auto mb-2 text-muted-foreground">
          &larr; Kembali ke Dashboard Kerjasama
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Ajukan Kerjasama Baru</h1>
        <p className="text-muted-foreground">
          Lengkapi form di bawah untuk mendaftarkan dokumen MoA, MoU, atau IA baru.
        </p>
      </div>

      {/* Stepper */}
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 rounded-full hidden md:block"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 bg-background pr-4 z-10">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm transition-colors",
                  step > s.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : step === s.id
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
              </div>
              <span
                className={cn(
                  "font-medium hidden sm:block",
                  step >= s.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xl">{STEPS[step - 1].title}</CardTitle>
              <CardDescription>
                Langkah {step} dari {STEPS.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* STEP 1: Info Mitra */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="partnerName" className={cn(errors.partnerName && "text-destructive")}>
                        Nama Mitra/Instansi <span className="text-destructive">*</span>
                      </Label>
                      
                      <Combobox
                        value={formData.partnerName}
                        onValueChange={(val) => handleInputChange("partnerName", val)}
                      >
                        <ComboboxInput 
                          placeholder="Pilih atau ketik nama mitra..." 
                          className={cn("w-full", errors.partnerName && "border-destructive")}
                        />
                        <ComboboxContent>
                          <ComboboxList>
                            <ComboboxEmpty>Ketik untuk menambah mitra baru...</ComboboxEmpty>
                            {existingPartners.map((partner) => (
                              <ComboboxItem key={partner} value={partner}>
                                {partner}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {errors.partnerName && <p className="text-sm text-destructive">{errors.partnerName}</p>}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="docType" className={cn(errors.docType && "text-destructive")}>
                          Tipe Dokumen <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.docType}
                          onValueChange={(value) => handleInputChange("docType", value)}
                        >
                          <SelectTrigger className={cn("w-full", errors.docType && "border-destructive")}>
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
                        {errors.docType && <p className="text-sm text-destructive">{errors.docType}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scope" className={cn(errors.scope && "text-destructive")}>
                          Lingkup Kerjasama <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.scope}
                          onValueChange={(value) => handleInputChange("scope", value)}
                        >
                          <SelectTrigger className={cn("w-full", errors.scope && "border-destructive")}>
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
                        {errors.scope && <p className="text-sm text-destructive">{errors.scope}</p>}
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
                          onChange={(e) => handleInputChange("yearIssued", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Dokumen & PIC */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Nomor Dokumen</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="docNumberInternal">Nomor Dokumen Internal</Label>
                          <Input
                            id="docNumberInternal"
                            placeholder="Cth: 001/SPIO/VI/2024"
                            value={formData.docNumberInternal}
                            onChange={(e) => handleInputChange("docNumberInternal", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="docNumberExternal">Nomor Dokumen Eksternal</Label>
                          <Input
                            id="docNumberExternal"
                            placeholder="Cth: 002/MITRA/VII/2024"
                            value={formData.docNumberExternal}
                            onChange={(e) => handleInputChange("docNumberExternal", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-border/50"></div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">PIC & Kontak</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="picExternal">Nama PIC Eksternal</Label>
                          <Input
                            id="picExternal"
                            placeholder="Nama PIC dari pihak mitra"
                            value={formData.picExternal}
                            onChange={(e) => handleInputChange("picExternal", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="picExternalPhone">No. Telp PIC Eksternal</Label>
                          <Input
                            id="picExternalPhone"
                            placeholder="081234567890"
                            value={formData.picExternalPhone}
                            onChange={(e) => handleInputChange("picExternalPhone", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="picInternal">Nama PIC Internal (FEB Tel-U)</Label>
                          <Input
                            id="picInternal"
                            placeholder="Nama PIC dari internal"
                            value={formData.picInternal}
                            onChange={(e) => handleInputChange("picInternal", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Aktivitas & Waktu */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Jenis Kerjasama</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="partnershipType" className={cn(errors.partnershipType && "text-destructive")}>
                            Bidang Kerjasama <span className="text-destructive">*</span>
                          </Label>
                          <div className={cn(errors.partnershipType && "rounded-md border border-destructive p-0.5")}>
                            <ActivityMultiSelect
                              value={formData.partnershipType}
                              onValueChange={(value) => handleInputChange("partnershipType", value)}
                              activityTypeOptions={partnershipTypeOptions}
                            />
                          </div>
                          {errors.partnershipType && <p className="text-sm text-destructive">{errors.partnershipType}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className={cn(errors.activityType && "text-destructive")}>
                            Jenis Aktivitas <span className="text-destructive">*</span>
                          </Label>
                          <div className={cn(errors.activityType && "rounded-md border border-destructive p-0.5")}>
                            <ActivityMultiSelect
                              value={formData.activityType}
                              onValueChange={(value) => handleInputChange("activityType", value)}
                              activityTypeOptions={activityTypeOptions}
                            />
                          </div>
                          {errors.activityType && <p className="text-sm text-destructive">{errors.activityType}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-border/50"></div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tanggal & Durasi</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Tanggal Dibuat</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !formData.dateCreated && "text-muted-foreground")}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.dateCreated ? format(formData.dateCreated, "PPP") : <span>Pilih tanggal</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.dateCreated}
                                onSelect={(date) => handleInputChange("dateCreated", date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Tanggal Ditandatangani</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !formData.dateSigned && "text-muted-foreground")}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.dateSigned ? format(formData.dateSigned, "PPP") : <span>Pilih tanggal</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.dateSigned}
                                onSelect={(date) => handleInputChange("dateSigned", date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>Masa Berlaku Sampai</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !formData.validUntil && "text-muted-foreground")}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.validUntil ? format(formData.validUntil, "PPP") : <span>Pilih tanggal</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.validUntil}
                                onSelect={(date) => handleInputChange("validUntil", date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duration">Durasi Kontrak</Label>
                          <Input
                            id="duration"
                            placeholder='Cth: "3 Tahun"'
                            value={formData.duration}
                            onChange={(e) => handleInputChange("duration", e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="signingType">Metode Penandatanganan</Label>
                          <Input
                            id="signingType"
                            placeholder="Cth: Desk to Desk / Onsite / Virtual"
                            value={formData.signingType}
                            onChange={(e) => handleInputChange("signingType", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Berkas & Ringkasan */}
                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label>Unggah Dokumen Kerjasama (PDF)</Label>
                      <div 
                        {...getRootProps()} 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer",
                          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <UploadCloud className="h-6 w-6 text-primary" />
                          </div>
                          {isDragActive ? (
                            <p className="font-medium text-primary">Lepaskan file di sini...</p>
                          ) : (
                            <>
                              <p className="font-medium">Tarik & Lepas file PDF di sini</p>
                              <p className="text-sm text-muted-foreground">atau klik untuk memilih file dari komputer</p>
                            </>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">Maksimal 5MB. Format: .pdf</p>
                        </div>
                      </div>
                      
                      {file && (
                        <div className="mt-4 p-4 border rounded-lg bg-card flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-destructive/10 p-2 rounded-md">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 2H13L17 6V22H7V2Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M13 2V6H17" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 13H14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 17H14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-medium truncate text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="docLink">Link Arsip Cloud (Opsional)</Label>
                        <Input
                          id="docLink"
                          placeholder="Link Google Drive, OneDrive, dll..."
                          value={formData.docLink}
                          onChange={(e) => handleInputChange("docLink", e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Catatan Tambahan</Label>
                        <Textarea
                          id="notes"
                          rows={3}
                          placeholder="Tambahkan informasi atau keterangan lain di sini..."
                          value={formData.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                        />
                      </div>
                      
                      <div className="md:col-span-2 grid gap-4 sm:grid-cols-2 mt-2">
                        <div className="flex items-center justify-between rounded-lg border p-4 bg-background shadow-sm">
                          <div className="space-y-0.5">
                            <Label className="text-base font-medium">Arsip Fisik (Hardcopy)</Label>
                            <p className="text-sm text-muted-foreground">Tersedia dokumen fisik?</p>
                          </div>
                          <Checkbox
                            checked={formData.hasHardcopy}
                            onCheckedChange={(checked) => handleInputChange("hasHardcopy", checked)}
                            className="h-5 w-5"
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4 bg-background shadow-sm">
                          <div className="space-y-0.5">
                            <Label className="text-base font-medium">Arsip Digital (Softcopy)</Label>
                            <p className="text-sm text-muted-foreground">Tersedia file digital?</p>
                          </div>
                          <Checkbox
                            checked={formData.hasSoftcopy}
                            onCheckedChange={(checked) => handleInputChange("hasSoftcopy", checked)}
                            className="h-5 w-5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Form Controls */}
                <div className="flex items-center justify-between pt-6 mt-8 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={step === 1 || isLoading}
                    className="w-28"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Kembali
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={handleSaveDraft}
                      className="hidden sm:flex text-muted-foreground hover:text-foreground"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Draft
                    </Button>

                    {step < STEPS.length ? (
                      <Button type="button" onClick={handleNext} className="w-28">
                        Lanjut
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isLoading} className="w-auto">
                        {isLoading ? (
                          <>
                            <LoaderIcon className="animate-spin h-4 w-4 mr-2" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Kirim Pengajuan
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info/Help Column */}
        <div className="hidden lg:block space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Informasi Pengajuan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                <strong>Proses Approval:</strong><br />
                Setelah diajukan, dokumen kerjasama Anda akan direview oleh tim Unit Kerjasama FEB.
              </p>
              <p>
                <strong>Draft Otomatis:</strong><br />
                Data yang Anda ketik akan disimpan otomatis sebagai draft. Jika Anda menutup browser tanpa sengaja, data Anda tetap aman.
              </p>
              <p>
                <strong>Upload Dokumen:</strong><br />
                Pastikan dokumen final sudah berformat PDF dan tidak melebihi 5MB. Jika ada banyak dokumen tambahan, gunakan kolom <em>Link Arsip Cloud</em>.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ringkasan Pengajuan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Mitra:</span>
                <span className="font-medium truncate max-w-[150px]">{formData.partnerName || "-"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Tipe:</span>
                <span className="font-medium">{formData.docType || "-"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Jenis:</span>
                <span className="font-medium">{formData.partnershipType?.length ? formData.partnershipType.join(", ") : "-"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Berkas:</span>
                <span className="font-medium">{file ? "✅ Terlampir" : "❌ Belum ada"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

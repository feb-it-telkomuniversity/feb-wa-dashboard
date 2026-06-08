'use client'

import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PenTool,
  Search,
  Plus,
  Trash2,
  FileCheck2,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  QrCode,
  Fingerprint,
  Calendar,
  History,
  FileDown,
  ExternalLink,
  ChevronRight,
  Shield,
  ArrowRight,
  AlertTriangle,
  Pencil,
  Upload,
  Paperclip,
  Loader2
} from 'lucide-react'

// Initial Presets for ISO Audit Trail Logs
const defaultSignatures = [
  {
    id: "sig-1",
    refNumber: "SK-042/FEB-TelU/III/2026",
    documentName: "Surat Keputusan Dekan tentang Pengangkatan Panitia RTM 2026",
    documentType: "Surat Keputusan (SK)",
    requester: "Dr. Ir. Ahmad Sidik, M.B.A.",
    unit: "Sekretariat Dekan",
    submissionDate: "2026-05-10",
    signedDate: "2026-05-12",
    status: "Signed",
    signatureMethod: "Digital (Certificate Hash)",
    certHash: "SHA256:8f7621eba74c3d4f1092a4e21b8c0da98e6df31d4e7",
    notes: "Pengangkatan panitia untuk mendukung pelaksanaan agenda ISO 9001:2015.",
    rejectReason: "",
    timeline: [
      { status: "Submitted", date: "2026-05-10 09:00", actor: "Staff Dekanat", note: "Dokumen awal diajukan" },
      { status: "Verified", date: "2026-05-11 14:30", actor: "Kaur Umum (Verifikator)", note: "Dokumen telah diperiksa kesesuaian formatnya" },
      { status: "Signed", date: "2026-05-12 10:00", actor: "Dekan FEB (Ahmad Sidik)", note: "Tanda tangan digital dibubuhkan via MIRA E-Sign" }
    ]
  },
  {
    id: "sig-2",
    refNumber: "ST-059/FEB-TelU/V/2026",
    documentName: "Surat Tugas Delegasi Dosen FEB ke La Trobe University, Melbourne",
    documentType: "Surat Tugas (ST)",
    requester: "Wakil Dekan I (Akademik)",
    unit: "Layanan Akademik",
    submissionDate: "2026-05-24",
    signedDate: "",
    status: "Pending",
    signatureMethod: "Digital (Certificate Hash)",
    certHash: "",
    notes: "Tugas delegasi kunjungan studi banding kurikulum double degree AACSB.",
    rejectReason: "",
    timeline: [
      { status: "Submitted", date: "2026-05-24 08:15", actor: "Sekretaris Wadek I", note: "Diajukan mendesak untuk keberangkatan awal Juni" },
      { status: "Verified", date: "2026-05-24 11:00", actor: "Kaur Akademik", note: "Kesesuaian nama dosen dan anggaran harian telah diverifikasi" }
    ]
  },
  {
    id: "sig-3",
    refNumber: "MoU-011/FEB-TelU/V/2026",
    documentName: "Memorandum of Understanding (MoU) antara FEB Telkom University dengan Bank Indonesia",
    documentType: "Perjanjian Kerjasama (MoU/MoA)",
    requester: "Unit Layanan Kerja Sama",
    unit: "Layanan Akademik",
    submissionDate: "2026-05-22",
    signedDate: "2026-05-23",
    status: "Signed",
    signatureMethod: "Tanda Tangan Basah (Scan)",
    certHash: "SCAN-STAMP-FEB-BI-9908",
    notes: "Kerjasama program beasiswa, kuliah umum, dan riset bersama ekonomi digital.",
    rejectReason: "",
    timeline: [
      { status: "Submitted", date: "2026-05-22 10:00", actor: "Staf Kerjasama", note: "Draft disetujui oleh Legal Telkom University" },
      { status: "Verified", date: "2026-05-22 16:00", actor: "Wakil Dekan II", note: "Review aspek finansial & non-akademik disetujui" },
      { status: "Signed", date: "2026-05-23 11:30", actor: "Dekan FEB (Ahmad Sidik)", note: "Penandatanganan fisik dilakukan dan dipindai ke sistem" }
    ]
  },
  {
    id: "sig-4",
    refNumber: "PROP-108/FEB/VI/2026",
    documentName: "Proposal Riset Terapan Kelompok Keahlian Manajemen Keuangan Ganjil 2026",
    documentType: "Proposal",
    requester: "Kaur Akademik",
    unit: "Kelompok Keahlian TBM",
    submissionDate: "2026-05-25",
    signedDate: "",
    status: "Pending",
    signatureMethod: "Digital (Certificate Hash)",
    certHash: "",
    notes: "Pengajuan dana internal untuk riset hilirisasi UMKM Jawa Barat.",
    rejectReason: "",
    timeline: [
      { status: "Submitted", date: "2026-05-25 09:30", actor: "Ketua KK Manajemen", note: "Pengajuan proposal riset semester ganjil" }
    ]
  },
  {
    id: "sig-5",
    refNumber: "LK-001/FEB-TelU/IV/2026",
    documentName: "Laporan Keuangan Triwulan I Fakultas Ekonomi dan Bisnis",
    documentType: "Laporan Keuangan",
    requester: "Kaur Keuangan",
    unit: "Layanan Akademik",
    submissionDate: "2026-05-15",
    signedDate: "",
    status: "Rejected",
    signatureMethod: "Digital (Certificate Hash)",
    certHash: "",
    notes: "Rekapitulasi anggaran pengeluaran & pendapatan operasional FEB Q1 2026.",
    rejectReason: "Terdapat ketidaksesuaian nominal rekap anggaran pada lampiran 3 halaman 8. Tolong revisi tabel pengeluaran RTM terlebih dahulu.",
    timeline: [
      { status: "Submitted", date: "2026-05-15 13:00", actor: "Staff Keuangan", note: "Diajukan untuk pelaporan Rektorat" },
      { status: "Verified", date: "2026-05-16 09:00", actor: "Wakil Dekan II", note: "Diverifikasi dengan catatan penyesuaian nominal" },
      { status: "Rejected", date: "2026-05-18 15:45", actor: "Dekan FEB (Ahmad Sidik)", note: "Ditolak karena ketidaksesuaian nominal di lampiran 3." }
    ]
  }
]

export default function LogTandaTanganPage() {
  const { user } = useAuth()
  const userRole = user?.role || 'admin'
  const [mounted, setMounted] = useState(false)

  // Local States
  const [records, setRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Modal control states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isSignModalOpen, setIsSignModalOpen] = useState(false)
  
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Add Form State
  const [newDocData, setNewDocData] = useState({
    refNumber: '',
    documentName: '',
    documentType: 'Surat Tugas (ST)',
    otherDocumentType: '',
    requester: '',
    unit: 'Layanan Akademik',
    otherUnit: '',
    notes: '',
    signatureMethod: 'Digital (Certificate Hash)',
    attachmentName: '',
    attachmentSize: 0,
  })

  // Edit Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [editDocData, setEditDocData] = useState({
    refNumber: '',
    documentName: '',
    documentType: 'Surat Tugas (ST)',
    otherDocumentType: '',
    requester: '',
    unit: 'Layanan Akademik',
    otherUnit: '',
    notes: '',
    signatureMethod: 'Digital (Certificate Hash)',
    attachmentName: '',
    attachmentSize: 0,
  })

  const [uploadedFile, setUploadedFile] = useState(null)
  const [editUploadedFile, setEditUploadedFile] = useState(null)

  // Rejection note state
  const [rejectReasonInput, setRejectReasonInput] = useState('')

  const handleFileUpload = (e, isEdit = false) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal adalah 5 MB!')
        e.target.value = null
        return
      }
      if (isEdit) {
        setEditUploadedFile(file)
        setEditDocData(prev => ({
          ...prev,
          attachmentName: file.name,
          attachmentSize: file.size
        }))
      } else {
        setUploadedFile(file)
        setNewDocData(prev => ({
          ...prev,
          attachmentName: file.name,
          attachmentSize: file.size
        }))
      }
      toast.success(`File ${file.name} berhasil diunggah!`)
    }
  }

  // Helper mapping status dari backend ke frontend
  const mapStatusToFrontend = (status) => {
    if (status === 'Menunggu TTD' || status === 'SUBMITTED') return 'Pending';
    if (status === 'Selesai TTD' || status === 'SIGNED') return 'Signed';
    if (status === 'Ditolak/Revisi' || status === 'REJECTED') return 'Rejected';
    return status;
  }

  // Helper mapping record backend ke format frontend
  const mapBackendToFrontend = (rec) => {
    return {
      id: rec.id,
      refNumber: rec.nomorDokumen || '',
      documentName: rec.namaDokumen || '',
      documentType: rec.jenisDokumen || '',
      requester: rec.namaPengaju || '',
      unit: rec.unitAsal || '',
      submissionDate: rec.tanggalAjuan ? rec.tanggalAjuan.split('T')[0] : '',
      signedDate: rec.tanggalTtd ? rec.tanggalTtd.split('T')[0] : '',
      status: mapStatusToFrontend(rec.status),
      signatureMethod: rec.metodeOtorisasi || '',
      certHash: rec.hashVerifier || '',
      notes: rec.catatanPengaju || '',
      rejectReason: rec.catatanPenyetuju || '',
      attachmentName: rec.berkasPendukung ? rec.berkasPendukung.split('/').pop().split('-').slice(1).join('-') || 'Lampiran' : '',
      attachmentUrl: rec.berkasPendukung || '',
      attachmentSize: 0,
      timeline: (rec.histories || []).map(h => ({
        status: mapStatusToFrontend(h.actionType),
        date: h.createdAt ? new Date(h.createdAt).toISOString().replace('T', ' ').substring(0, 16) : '',
        actor: h.actor?.name || 'Sistem',
        note: h.message || ''
      }))
    }
  }

  const fetchRecords = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/log-ttd-dekan')
      if (response.data?.success) {
        const mapped = response.data.data.map(mapBackendToFrontend)
        setRecords(mapped)
      }
    } catch (err) {
      console.error('Error fetching records:', err)
      toast.error('Gagal mengambil data dari server')
    } finally {
      setIsLoading(false)
    }
  }

  // Load from database
  useEffect(() => {
    setMounted(true)
    fetchRecords()
  }, [])

  // Add Request Handler
  const handleAddRequest = async (e) => {
    e.preventDefault()
    if (!newDocData.documentName || !newDocData.requester) {
      toast.error('Harap isi semua kolom wajib!')
      return
    }

    const docType = newDocData.documentType === 'Lainnya' ? newDocData.otherDocumentType : newDocData.documentType
    const docUnit = newDocData.unit === 'Lainnya' ? newDocData.otherUnit : newDocData.unit

    if (newDocData.documentType === 'Lainnya' && !newDocData.otherDocumentType) {
      toast.error('Harap isi jenis dokumen lainnya!')
      return
    }
    if (newDocData.unit === 'Lainnya' && !newDocData.otherUnit) {
      toast.error('Harap isi unit asal lainnya!')
      return
    }

    try {
      setIsLoading(true)
      let berkasUrl = ''
      
      // Upload file first if there is one
      if (uploadedFile) {
        const formData = new FormData()
        formData.append('file', uploadedFile)
        const uploadRes = await api.post('/api/log-ttd-dekan/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (uploadRes.data?.success) {
          berkasUrl = uploadRes.data.url
        }
      }

      const payload = {
        nomorDokumen: newDocData.refNumber || null,
        namaDokumen: newDocData.documentName,
        jenisDokumen: docType,
        namaPengaju: newDocData.requester,
        unitAsal: docUnit,
        metodeOtorisasi: newDocData.signatureMethod,
        berkasPendukung: berkasUrl || null,
        catatanPengaju: newDocData.notes || null
      }

      const response = await api.post('/api/log-ttd-dekan', payload)
      if (response.data?.success) {
        toast.success('Pengajuan tanda tangan berhasil dikirim ke Dekanat!')
        setIsAddModalOpen(false)
        fetchRecords() // refresh list
        
        // Reset Form
        setNewDocData({
          refNumber: '',
          documentName: '',
          documentType: 'Surat Tugas (ST)',
          otherDocumentType: '',
          requester: user?.name || '',
          unit: 'Layanan Akademik',
          otherUnit: '',
          notes: '',
          signatureMethod: 'Digital (Certificate Hash)',
          attachmentName: '',
          attachmentSize: 0,
        })
        setUploadedFile(null)
      }
    } catch (err) {
      console.error('Error creating record:', err)
      const errMsg = err?.response?.data?.message || 'Gagal mengirim pengajuan'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Edit Request Handler
  const handleEditRequest = async (e) => {
    e.preventDefault()
    if (!editDocData.documentName || !editDocData.requester) {
      toast.error('Harap isi semua kolom wajib!')
      return
    }

    const docType = editDocData.documentType === 'Lainnya' ? editDocData.otherDocumentType : editDocData.documentType
    const docUnit = editDocData.unit === 'Lainnya' ? editDocData.otherUnit : editDocData.unit

    if (editDocData.documentType === 'Lainnya' && !editDocData.otherDocumentType) {
      toast.error('Harap isi jenis dokumen lainnya!')
      return
    }
    if (editDocData.unit === 'Lainnya' && !editDocData.otherUnit) {
      toast.error('Harap isi unit asal lainnya!')
      return
    }

    try {
      setIsLoading(true)
      let berkasUrl = editingRecord.attachmentUrl || ''

      // Upload new file if uploaded
      if (editUploadedFile) {
        const formData = new FormData()
        formData.append('file', editUploadedFile)
        const uploadRes = await api.post('/api/log-ttd-dekan/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (uploadRes.data?.success) {
          berkasUrl = uploadRes.data.url
        }
      } else if (!editDocData.attachmentName) {
        berkasUrl = ''
      }

      const payload = {
        nomorDokumen: editDocData.refNumber || null,
        namaDokumen: editDocData.documentName,
        jenisDokumen: docType,
        namaPengaju: editDocData.requester,
        unitAsal: docUnit,
        metodeOtorisasi: editDocData.signatureMethod,
        berkasPendukung: berkasUrl || null,
        catatanPengaju: editDocData.notes || null
      }

      const response = await api.put(`/api/log-ttd-dekan/${editingRecord.id}`, payload)
      if (response.data?.success) {
        toast.success('Informasi dokumen berhasil diperbarui!')
        setIsEditModalOpen(false)
        setEditingRecord(null)
        setEditUploadedFile(null)
        fetchRecords() // refresh list
      }
    } catch (err) {
      console.error('Error updating record:', err)
      const errMsg = err?.response?.data?.message || 'Gagal memperbarui pengajuan'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Sign Document Handler
  const handleApproveSign = async (id) => {
    try {
      setIsLoading(true)
      const randomHash = 'SHA256:' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
      
      const payload = {
        status: 'Selesai TTD',
        hashVerifier: selectedRecord.signatureMethod.includes('Digital') ? randomHash : `WET-SIGN-${Math.floor(1000 + Math.random() * 9000)}`,
        catatanPenyetuju: 'Dokumen disetujui dan ditandatangani oleh Dekan.'
      }

      const response = await api.patch(`/api/log-ttd-dekan/${id}/status`, payload)
      if (response.data?.success) {
        toast.success('Dokumen berhasil ditandatangani oleh Dekan!')
        setIsSignModalOpen(false)
        setSelectedRecord(null)
        fetchRecords() // refresh list
      }
    } catch (err) {
      console.error('Error signing record:', err)
      const errMsg = err?.response?.data?.message || 'Gagal menandatangani dokumen'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Reject Document Handler
  const handleRejectSign = async (id) => {
    if (!rejectReasonInput.trim()) {
      toast.error('Harap masukkan alasan penolakan!')
      return
    }

    try {
      setIsLoading(true)
      const payload = {
        status: 'Ditolak/Revisi',
        catatanPenyetuju: rejectReasonInput
      }

      const response = await api.patch(`/api/log-ttd-dekan/${id}/status`, payload)
      if (response.data?.success) {
        toast.success('Pengajuan dokumen dikembalikan/ditolak.')
        setRejectReasonInput('')
        setIsSignModalOpen(false)
        setSelectedRecord(null)
        fetchRecords() // refresh list
      }
    } catch (err) {
      console.error('Error rejecting record:', err)
      const errMsg = err?.response?.data?.message || 'Gagal menolak dokumen'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete Handler
  const handleDeleteRecord = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus data log tanda tangan ini?')) {
      try {
        setIsLoading(true)
        const response = await api.delete(`/api/log-ttd-dekan/${id}`)
        if (response.data?.success) {
          toast.success('Log data berhasil dihapus.')
          fetchRecords() // refresh list
        }
      } catch (err) {
        console.error('Error deleting record:', err)
        const errMsg = err?.response?.data?.message || 'Gagal menghapus log data'
        toast.error(errMsg)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Calculate Statistics
  const totalDocs = records.length
  const pendingDocs = records.filter(r => r.status === 'Pending').length
  const signedDocs = records.filter(r => r.status === 'Signed').length
  const rejectedDocs = records.filter(r => r.status === 'Rejected').length

  // Filter Logic
  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.documentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rec.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.unit.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || rec.documentType === filterType
    const matchesTab = activeTab === 'all' || rec.status.toLowerCase() === activeTab.toLowerCase()

    return matchesSearch && matchesType && matchesTab
  })

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = 'No. Dokumen,Nama Dokumen,Jenis,Pengaju,Unit,Tgl Pengajuan,Tgl Tanda Tangan,Status,Metode,Sertifikat Hash\n'
    const csvContent = records.map(rec => {
      return `"${rec.refNumber}","${rec.documentName}","${rec.documentType}","${rec.requester}","${rec.unit}","${rec.submissionDate}","${rec.signedDate || '-'}","${rec.status}","${rec.signatureMethod}","${rec.certHash || '-'}"`
    }).join('\n')

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `log_tanda_tangan_dekan_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Log tanda tangan berhasil diexport ke CSV!')
  }

  // Open Sign Modal
  const openSignModal = (record) => {
    setSelectedRecord(record)
    setRejectReasonInput('')
    setIsSignModalOpen(true)
  }

  // Open Detail Modal
  const openDetailModal = (record) => {
    setSelectedRecord(record)
    setIsDetailModalOpen(true)
  }

  if (!mounted) return null

  // Helper colors for badges
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Signed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400'
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400'
      default:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
            <PenTool className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Log Tanda Tangan Dekan</h1>
            <p className="text-muted-foreground mt-1">
              Sistem pelacakan riwayat otorisasi dokumen oleh Dekan FEB secara digital dan basah.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="rounded-xl gap-2 h-11 border-border bg-card hover:bg-muted text-foreground font-medium"
          >
            <FileDown className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            onClick={() => {
              setNewDocData({
                refNumber: '',
                documentName: '',
                documentType: 'Surat Tugas (ST)',
                requester: user?.name || 'Staff Akademik',
                unit: 'Layanan Akademik',
                notes: '',
                signatureMethod: 'Digital (Certificate Hash)',
              })
              setIsAddModalOpen(true)
            }}
            className="bg-primary hover:bg-[#c41a20] text-primary-foreground rounded-xl gap-2 font-semibold shadow-sm h-11"
          >
            <Plus className="w-4 h-4" /> Ajukan Dokumen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Dokumen</p>
              <h3 className="text-2xl font-black text-foreground">{totalDocs}</h3>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl group-hover:scale-105 transition-transform">
              <FileText className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Menunggu TTD</p>
              <h3 className="text-2xl font-black text-amber-500">{pendingDocs}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Ditandatangani</p>
              <h3 className="text-2xl font-black text-emerald-500">{signedDocs}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <CheckCircle className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Ditolak / Revisi</p>
              <h3 className="text-2xl font-black text-rose-500">{rejectedDocs}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
              <XCircle className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border border-border/60 shadow-sm rounded-2xl bg-card">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Daftar Dokumen Otorisasi</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Log pencatatan validitas tanda tangan Dekan pada FEB Telkom University.</CardDescription>
            </div>
            {/* Tab filter status */}
            <div className="bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-border/50 self-start">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === 'pending' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Menunggu TTD ({pendingDocs})
                </button>
                <button
                  onClick={() => setActiveTab('signed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === 'signed' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Selesai ({signedDocs})
                </button>
                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === 'rejected' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Ditolak ({rejectedDocs})
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="p-4 border-b border-border/40 bg-slate-50/40 dark:bg-slate-900/10 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor dokumen, nama dokumen, atau pengaju..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-950/40 rounded-xl"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-slate-950/40 rounded-xl">
                  <SelectValue placeholder="Jenis Dokumen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="Surat Keputusan (SK)">Surat Keputusan (SK)</SelectItem>
                  <SelectItem value="Surat Tugas (ST)">Surat Tugas (ST)</SelectItem>
                  <SelectItem value="Perjanjian Kerjasama (MoU/MoA)">MoU / Kerja Sama</SelectItem>
                  <SelectItem value="Proposal">Proposal Riset</SelectItem>
                  <SelectItem value="Ijazah / Transkrip">Ijazah / Transkrip</SelectItem>
                  <SelectItem value="Laporan Keuangan">Laporan Keuangan</SelectItem>
                  <SelectItem value="Buku Kurikulum">Buku Kurikulum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40">
                <TableRow>
                  <TableHead className="w-[170px] font-bold">No. Dokumen</TableHead>
                  <TableHead className="font-bold">Nama Dokumen</TableHead>
                  <TableHead className="w-[130px] font-bold">Jenis</TableHead>
                  <TableHead className="w-[160px] font-bold">Pengaju / Unit</TableHead>
                  <TableHead className="w-[110px] font-bold">Tanggal</TableHead>
                  <TableHead className="w-[100px] font-bold">Status</TableHead>
                  <TableHead className="w-[150px] text-right font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((rec) => (
                  <TableRow key={rec.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">{rec.refNumber}</TableCell>
                    <TableCell>
                      <div className="max-w-[320px] md:max-w-md">
                        <div className="font-semibold text-sm line-clamp-2 text-foreground leading-tight">{rec.documentName}</div>
                        {rec.status === 'Signed' && rec.certHash && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-muted-foreground truncate">
                            <Fingerprint className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{rec.certHash}</span>
                          </div>
                        )}
                        {rec.status === 'Rejected' && rec.rejectReason && (
                          <div className="text-[11px] text-rose-500 line-clamp-1 mt-1 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 font-medium">
                            Ket: {rec.rejectReason}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-muted-foreground">{rec.documentType}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-xs text-foreground">{rec.requester}</div>
                        <div className="text-[10px] text-muted-foreground">{rec.unit}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      <div className="text-foreground">
                        {new Date(rec.submissionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                      {rec.signedDate && (
                        <div className="text-[10px] text-emerald-500 flex items-center gap-0.5 mt-0.5 font-semibold">
                          Ttd: {new Date(rec.signedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeStyles(rec.status)}`}>
                        {rec.status === 'Signed' ? 'Selesai TTD' : rec.status === 'Rejected' ? 'Ditolak/Revisi' : 'Menunggu TTD'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetailModal(rec)}
                          title="Lihat Riwayat & Verifikasi"
                          className="h-8.5 w-8.5 text-sky-600 hover:bg-sky-500/10 rounded-lg"
                        >
                          <History className="w-4.5 h-4.5" />
                        </Button>
                        
                        {/* Aksi khusus jika status Pending dan user memiliki role Dekan/Admin */}
                        {rec.status === 'Pending' && (userRole === 'admin' || userRole === 'dekanat') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openSignModal(rec)}
                            title="Proses Tanda Tangan Dekan"
                            className="h-8.5 w-8.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg animate-pulse"
                          >
                            <PenTool className="w-4.5 h-4.5" />
                          </Button>
                        )}

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRecord(rec)
                            const standardTypes = [
                              "Surat Keputusan (SK)",
                              "Surat Tugas (ST)",
                              "Perjanjian Kerjasama (MoU/MoA)",
                              "Proposal",
                              "Ijazah / Transkrip",
                              "Laporan Keuangan"
                            ]
                            const standardUnits = [
                              "Wakil Dekan 1 FEB",
                              "Wakil Dekan 2 FEB",
                              "Sekretariat Dekan",
                              "Layanan Akademik",
                              "Laboratorium",
                              "SDM",
                              "Kemahasiswaan",
                              "Kelompok Keahlian TBM",
                              "Kelompok Keahlian AEFS",
                              "Kelompok Keahlian DBEST",
                              "S1 Manajemen",
                              "S1 Akuntansi",
                              "S1 Administrasi Bisnis",
                              "S1 Leisure Management",
                              "S2 Manajemen",
                              "S2 Manejemen PJJ",
                              "S2 Administrasi Bisnis",
                              "S2 Akuntansi",
                              "S3 Manajemen"
                            ]

                            const isTypeStandard = standardTypes.includes(rec.documentType)
                            const isUnitStandard = standardUnits.includes(rec.unit)

                            setEditDocData({
                              refNumber: rec.refNumber.startsWith('Draft-SIG-') ? '' : rec.refNumber,
                              documentName: rec.documentName,
                              documentType: isTypeStandard ? rec.documentType : 'Lainnya',
                              otherDocumentType: isTypeStandard ? '' : rec.documentType,
                              requester: rec.requester,
                              unit: isUnitStandard ? rec.unit : 'Lainnya',
                              otherUnit: isUnitStandard ? '' : rec.unit,
                              notes: rec.notes,
                              signatureMethod: rec.signatureMethod,
                              attachmentName: rec.attachmentName || '',
                              attachmentSize: rec.attachmentSize || 0
                            })
                            setIsEditModalOpen(true)
                          }}
                          title="Edit Metadata Dokumen"
                          className="h-8.5 w-8.5 text-amber-500 hover:bg-amber-500/10 rounded-lg"
                        >
                          <Pencil className="w-4.5 h-4.5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRecord(rec.id)}
                          title="Hapus Log"
                          className="h-8.5 w-8.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-10 w-10 text-muted-foreground/30" />
                        <span className="font-semibold text-sm">Tidak ada log tanda tangan dokumen.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal 1: Ajukan Tanda Tangan */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Plus className="w-5 h-5 text-sky-500" /> Ajukan Otorisasi TTD Dekan
            </DialogTitle>
            <DialogDescription>
              Pastikan format berkas telah diverifikasi oleh tim legal atau Kaur unit Anda sebelum diajukan ke Dekan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRequest} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="refNumber" className="font-semibold text-xs">Nomor Dokumen</Label>
                <Input
                  id="refNumber"
                  placeholder="Contoh: ST-060/FEB-TelU/V/2026 (Opsional)"
                  value={newDocData.refNumber}
                  onChange={(e) => setNewDocData({ ...newDocData, refNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="documentType" className="font-semibold text-xs">Jenis Dokumen</Label>
                <Select
                  value={newDocData.documentType}
                  onValueChange={(val) => setNewDocData({ ...newDocData, documentType: val })}
                >
                  <SelectTrigger id="documentType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Surat Keputusan (SK)">Surat Keputusan (SK)</SelectItem>
                    <SelectItem value="Surat Tugas (ST)">Surat Tugas (ST)</SelectItem>
                    <SelectItem value="Perjanjian Kerjasama (MoU/MoA)">MoU / Kerja Sama</SelectItem>
                    <SelectItem value="Proposal">Proposal Riset</SelectItem>
                    <SelectItem value="Ijazah / Transkrip">Ijazah / Transkrip</SelectItem>
                    <SelectItem value="Laporan Keuangan">Laporan Keuangan</SelectItem>
                    <SelectItem value="Buku Kurikulum">Buku Kurikulum</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newDocData.documentType === 'Lainnya' && (
              <div className="space-y-1.5 animate-fadeIn">
                <Label htmlFor="otherDocumentType" className="font-semibold text-xs text-sky-500">Tulis Jenis Dokumen Baru <span className="text-red-500">*</span></Label>
                <Input
                  id="otherDocumentType"
                  placeholder="Contoh: Dokumen Akreditasi"
                  value={newDocData.otherDocumentType}
                  onChange={(e) => setNewDocData({ ...newDocData, otherDocumentType: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="documentName" className="font-semibold text-xs">Judul / Perihal Dokumen <span className="text-red-500">*</span></Label>
              <Input
                id="documentName"
                placeholder="Contoh: Surat Keputusan Penguji Sidang Proposal Tesis"
                value={newDocData.documentName}
                onChange={(e) => setNewDocData({ ...newDocData, documentName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="requester" className="font-semibold text-xs">Nama Pengaju <span className="text-red-500">*</span></Label>
                <Input
                  id="requester"
                  placeholder="Nama Lengkap Dosen/Staf"
                  value={newDocData.requester}
                  onChange={(e) => setNewDocData({ ...newDocData, requester: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit" className="font-semibold text-xs">Unit Asal</Label>
                <Select
                  value={newDocData.unit}
                  onValueChange={(val) => setNewDocData({ ...newDocData, unit: val })}
                >
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wakil Dekan 1 FEB">Wakil Dekan 1 FEB</SelectItem>
                    <SelectItem value="Wakil Dekan 2 FEB">Wakil Dekan 2 FEB</SelectItem>
                    <SelectItem value="Sekretariat Dekan">Sekretariat Dekan</SelectItem>
                    <SelectItem value="Layanan Akademik">Layanan Akademik</SelectItem>
                    <SelectItem value="Laboratorium">Laboratorium</SelectItem>
                    <SelectItem value="SDM">SDM</SelectItem>
                    <SelectItem value="Kemahasiswaan">Kemahasiswaan</SelectItem>
                    <SelectItem value="Kelompok Keahlian TBM">Kelompok Keahlian TBM</SelectItem>
                    <SelectItem value="Kelompok Keahlian AEFS">Kelompok Keahlian AEFS</SelectItem>
                    <SelectItem value="Kelompok Keahlian DBEST">Kelompok Keahlian DBEST</SelectItem>
                    <SelectItem value="S1 Manajemen">S1 Manajemen</SelectItem>
                    <SelectItem value="S1 Akuntansi">S1 Akuntansi</SelectItem>
                    <SelectItem value="S1 Administrasi Bisnis">S1 Administrasi Bisnis</SelectItem>
                    <SelectItem value="S1 Leisure Management">S1 Leisure Management</SelectItem>
                    <SelectItem value="S2 Manajemen">S2 Manajemen</SelectItem>
                    <SelectItem value="S2 Manejemen PJJ">S2 Manejemen PJJ</SelectItem>
                    <SelectItem value="S2 Administrasi Bisnis">S2 Administrasi Bisnis</SelectItem>
                    <SelectItem value="S2 Akuntansi">S2 Akuntansi</SelectItem>
                    <SelectItem value="S3 Manajemen">S3 Manajemen</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newDocData.unit === 'Lainnya' && (
              <div className="space-y-1.5 animate-fadeIn">
                <Label htmlFor="otherUnit" className="font-semibold text-xs text-sky-500">Tulis Nama Unit Asal Baru <span className="text-red-500">*</span></Label>
                <Input
                  id="otherUnit"
                  placeholder="Contoh: Unit Kemahasiswaan"
                  value={newDocData.otherUnit}
                  onChange={(e) => setNewDocData({ ...newDocData, otherUnit: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="signatureMethod" className="font-semibold text-xs">Metode Otorisasi TTD</Label>
              <Select
                value={newDocData.signatureMethod}
                onValueChange={(val) => setNewDocData({ ...newDocData, signatureMethod: val })}
              >
                <SelectTrigger id="signatureMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Digital (Certificate Hash)">Digital e-Sign (Sertifikat Elektronik MIRA)</SelectItem>
                  <SelectItem value="Tanda Tangan Basah (Scan)">Tanda Tangan Basah (Tanda Tangan Fisik + Scan)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-xs">Unggah Berkas Pendukung (Semua Tipe, Maks 5 MB)</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-4 pb-5 px-4 text-center">
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <p className="text-[11px] text-muted-foreground font-semibold">Klik untuk memilih file</p>
                    <p className="text-[9px] text-muted-foreground/80 mt-0.5">Maksimal ukuran 5 MB (Semua format berkas)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, false)} 
                  />
                </label>
              </div>
              {uploadedFile && (
                <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 p-2 rounded-lg border border-sky-100 dark:border-sky-950/40 text-xs mt-1.5">
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold truncate flex-1">{uploadedFile.name}</span>
                  <span className="font-mono text-[9px] bg-sky-100 dark:bg-sky-900/40 px-1 py-0.5 rounded shrink-0">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setUploadedFile(null)
                      setNewDocData(prev => ({ ...prev, attachmentName: '', attachmentSize: 0 }))
                    }} 
                    className="text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="font-semibold text-xs">Catatan Pengaju</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Catatan opsional mengenai lampiran dokumen atau tenggat waktu..."
                value={newDocData.notes}
                onChange={(e) => setNewDocData({ ...newDocData, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl" disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Ajukan Otorisasi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Detail Riwayat & Audit Trail (Verifikasi QR) */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-500" /> Histori & Validasi Dokumen
            </DialogTitle>
            <DialogDescription>
              Detail audit trail pelacakan rekam otorisasi tanda tangan sesuai ISO 15489.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 py-2">
              {/* Info Dokumen Card */}
              <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div className="col-span-1 md:col-span-2">
                  <span className="text-muted-foreground font-semibold">Nama Dokumen:</span>
                  <p className="font-bold text-sm text-foreground">{selectedRecord.documentName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">No. Dokumen:</span>
                  <p className="font-mono font-bold text-sky-600 dark:text-sky-400">{selectedRecord.refNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Jenis Dokumen:</span>
                  <p className="font-semibold text-foreground">{selectedRecord.documentType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Pengaju / Unit:</span>
                  <p className="font-semibold text-foreground">{selectedRecord.requester} ({selectedRecord.unit})</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Metode Tanda Tangan:</span>
                  <p className="font-semibold text-foreground">{selectedRecord.signatureMethod}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Tanggal Diajukan:</span>
                  <p className="font-semibold text-foreground">
                    {new Date(selectedRecord.submissionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Status Dokumen:</span>
                  <div className="mt-1">
                    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeStyles(selectedRecord.status)}`}>
                      {selectedRecord.status === 'Signed' ? 'Selesai TTD' : selectedRecord.status === 'Rejected' ? 'Ditolak/Revisi' : 'Menunggu TTD'}
                    </Badge>
                  </div>
                </div>
                {selectedRecord.attachmentName && (
                  <div className="col-span-1 md:col-span-2 mt-2 p-2.5 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 rounded-lg border border-sky-100 dark:border-sky-950/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-semibold truncate flex-1">Lampiran: {selectedRecord.attachmentName}</span>
                      {selectedRecord.attachmentSize > 0 && (
                        <span className="text-[10px] opacity-85 shrink-0 font-mono">({(selectedRecord.attachmentSize / 1024).toFixed(1)} KB)</span>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        if (selectedRecord.attachmentUrl) {
                          window.open(selectedRecord.attachmentUrl, '_blank')
                        } else {
                          toast.error('Berkas lampiran tidak tersedia')
                        }
                      }}
                      className="h-7 px-2.5 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-950/40 rounded shrink-0 border border-sky-200/50"
                    >
                      Lihat File
                    </Button>
                  </div>
                )}
              </div>

              {/* QR Mock & Digital Cert Hash (Jika Signed) */}
              {selectedRecord.status === 'Signed' && (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2 rounded-lg border flex items-center justify-center shrink-0 shadow-sm">
                    <QRCodeSVG
                      value={`${window.location.origin}/verifikasi-dokumen/${selectedRecord.id}`}
                      size={80}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <QrCode className="w-4 h-4" /> QR Code & Dokumen Terverifikasi
                    </div>
                    <p className="text-muted-foreground leading-normal text-[11px]">
                      Dokumen ini telah sah ditandatangani oleh Dekan Fakultas Ekonomi dan Bisnis dan terdaftar di server MIRA dengan sertifikat elektronik penjamin integritas data.
                    </p>
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground block font-mono">HASH SERTIFIKAT DIGITAL:</span>
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-[10px] block truncate">
                        {selectedRecord.certHash}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan Penolakan (Jika Rejected) */}
              {selectedRecord.status === 'Rejected' && selectedRecord.rejectReason && (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 flex gap-3 text-xs">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-600 dark:text-rose-400">Pengajuan Dikembalikan / Perlu Revisi:</span>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {selectedRecord.rejectReason}
                    </p>
                  </div>
                </div>
              )}

              {/* History Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <History className="w-4 h-4 text-sky-500" /> Audit Trail - Histori Pelacakan
                </h4>
                
                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-5 ml-2.5 space-y-5">
                  {selectedRecord.timeline.map((event, index) => (
                    <div key={index} className="relative">
                      {/* Timeline dot icon */}
                      <span className={`absolute -left-[27.5px] top-1 rounded-full p-1 border bg-background shrink-0 shadow-sm ${
                        event.status === 'Signed' ? 'text-emerald-500 border-emerald-500/30' :
                        event.status === 'Rejected' ? 'text-rose-500 border-rose-500/30' :
                        event.status === 'Verified' ? 'text-sky-500 border-sky-500/30' :
                        'text-slate-400 border-slate-200'
                      }`}>
                        {event.status === 'Signed' ? <CheckCircle className="w-3 h-3" /> :
                         event.status === 'Rejected' ? <XCircle className="w-3 h-3" /> :
                         event.status === 'Verified' ? <Shield className="w-3 h-3" /> :
                         <FileText className="w-3 h-3" />}
                      </span>
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {event.status === 'Submitted' ? 'Diajukan oleh Staff' :
                             event.status === 'Verified' ? 'Diverifikasi Administrasi' :
                             event.status === 'Signed' ? 'Ditandatangani Dekan' :
                             event.status === 'Rejected' ? 'Ditolak / Dikembalikan' : event.status}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                            {event.date}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground">{event.actor}</p>
                        {event.note && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic leading-relaxed">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)} className="rounded-xl w-full sm:w-auto">
              Tutup
            </Button>
            {selectedRecord?.status === 'Signed' && (
              <Button
                onClick={() => {
                  toast.success('Bukti validasi tanda tangan berhasil diunduh.')
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 w-full sm:w-auto"
              >
                <FileDown className="w-4 h-4" /> Unduh Dokumen Resmi
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Aksi Otorisasi TTD Dekan (Tolak / Setujui) */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <PenTool className="w-5 h-5 text-emerald-500" /> Proses Tanda Tangan Dekan
            </DialogTitle>
            <DialogDescription>
              Tinjau dokumen di bawah dan bubuhkan otorisasi resmi atau kembalikan untuk revisi.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-2">
              {/* Ringkasan Dokumen */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border text-xs space-y-2">
                <div>
                  <span className="text-muted-foreground font-semibold">Nomor Dokumen:</span>
                  <div className="font-mono font-bold text-foreground">{selectedRecord.refNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Nama / Perihal Dokumen:</span>
                  <div className="font-bold text-foreground">{selectedRecord.documentName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Pengaju & Catatan:</span>
                  <div className="font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                    {selectedRecord.requester} ({selectedRecord.unit})
                    {selectedRecord.notes && <p className="italic mt-1">"{selectedRecord.notes}"</p>}
                  </div>
                </div>
              </div>

              {/* Form Input Penolakan */}
              <div className="space-y-1.5">
                <Label htmlFor="rejectReason" className="font-semibold text-xs text-rose-500">Catatan Penolakan / Revisi (Jika Ditolak)</Label>
                <Textarea
                  id="rejectReason"
                  rows={2}
                  placeholder="Berikan alasan spesifik jika Anda mengembalikan dokumen ini..."
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                />
              </div>

              {/* Buttons Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRejectSign(selectedRecord.id)}
                  disabled={isLoading}
                  className="rounded-xl flex items-center justify-center gap-2 h-10 font-semibold"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Tolak & Kembalikan
                </Button>
                <Button
                  type="button"
                  onClick={() => handleApproveSign(selectedRecord.id)}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 h-10 font-semibold shadow-md shadow-emerald-500/20"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Setujui & TTD
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal 4: Edit Dokumen Otorisasi */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Pencil className="w-5 h-5 text-amber-500" /> Edit Metadata Dokumen
            </DialogTitle>
            <DialogDescription>
              Ubah rincian metadata dokumen otorisasi tanda tangan Dekan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditRequest} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editRefNumber" className="font-semibold text-xs">Nomor Dokumen</Label>
                <Input
                  id="editRefNumber"
                  placeholder="Contoh: ST-060/FEB-TelU/V/2026 (Opsional)"
                  value={editDocData.refNumber}
                  onChange={(e) => setEditDocData({ ...editDocData, refNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editDocumentType" className="font-semibold text-xs">Jenis Dokumen</Label>
                <Select
                  value={editDocData.documentType}
                  onValueChange={(val) => setEditDocData({ ...editDocData, documentType: val })}
                >
                  <SelectTrigger id="editDocumentType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Surat Keputusan (SK)">Surat Keputusan (SK)</SelectItem>
                    <SelectItem value="Surat Tugas (ST)">Surat Tugas (ST)</SelectItem>
                    <SelectItem value="Perjanjian Kerjasama (MoU/MoA)">MoU / Kerja Sama</SelectItem>
                    <SelectItem value="Proposal">Proposal Riset</SelectItem>
                    <SelectItem value="Ijazah / Transkrip">Ijazah / Transkrip</SelectItem>
                    <SelectItem value="Laporan Keuangan">Laporan Keuangan</SelectItem>
                    <SelectItem value="Buku Kurikulum">Buku Kurikulum</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editDocData.documentType === 'Lainnya' && (
              <div className="space-y-1.5 animate-fadeIn">
                <Label htmlFor="editOtherDocumentType" className="font-semibold text-xs text-sky-500">Tulis Jenis Dokumen Baru <span className="text-red-500">*</span></Label>
                <Input
                  id="editOtherDocumentType"
                  placeholder="Contoh: Dokumen Akreditasi"
                  value={editDocData.otherDocumentType}
                  onChange={(e) => setEditDocData({ ...editDocData, otherDocumentType: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="editDocumentName" className="font-semibold text-xs">Judul / Perihal Dokumen <span className="text-red-500">*</span></Label>
              <Input
                id="editDocumentName"
                placeholder="Contoh: Surat Keputusan Penguji Sidang Proposal Tesis"
                value={editDocData.documentName}
                onChange={(e) => setEditDocData({ ...editDocData, documentName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editRequester" className="font-semibold text-xs">Nama Pengaju <span className="text-red-500">*</span></Label>
                <Input
                  id="editRequester"
                  placeholder="Nama Lengkap Dosen/Staf"
                  value={editDocData.requester}
                  onChange={(e) => setEditDocData({ ...editDocData, requester: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editUnit" className="font-semibold text-xs">Unit Asal</Label>
                <Select
                  value={editDocData.unit}
                  onValueChange={(val) => setEditDocData({ ...editDocData, unit: val })}
                >
                  <SelectTrigger id="editUnit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wakil Dekan 1 FEB">Wakil Dekan 1 FEB</SelectItem>
                    <SelectItem value="Wakil Dekan 2 FEB">Wakil Dekan 2 FEB</SelectItem>
                    <SelectItem value="Sekretariat Dekan">Sekretariat Dekan</SelectItem>
                    <SelectItem value="Layanan Akademik">Layanan Akademik</SelectItem>
                    <SelectItem value="Laboratorium">Laboratorium</SelectItem>
                    <SelectItem value="SDM">SDM</SelectItem>
                    <SelectItem value="Kemahasiswaan">Kemahasiswaan</SelectItem>
                    <SelectItem value="Kelompok Keahlian TBM">Kelompok Keahlian TBM</SelectItem>
                    <SelectItem value="Kelompok Keahlian AEFS">Kelompok Keahlian AEFS</SelectItem>
                    <SelectItem value="Kelompok Keahlian DBEST">Kelompok Keahlian DBEST</SelectItem>
                    <SelectItem value="S1 Manajemen">S1 Manajemen</SelectItem>
                    <SelectItem value="S1 Akuntansi">S1 Akuntansi</SelectItem>
                    <SelectItem value="S1 Administrasi Bisnis">S1 Administrasi Bisnis</SelectItem>
                    <SelectItem value="S1 Leisure Management">S1 Leisure Management</SelectItem>
                    <SelectItem value="S2 Manajemen">S2 Manajemen</SelectItem>
                    <SelectItem value="S2 Manejemen PJJ">S2 Manejemen PJJ</SelectItem>
                    <SelectItem value="S2 Administrasi Bisnis">S2 Administrasi Bisnis</SelectItem>
                    <SelectItem value="S2 Akuntansi">S2 Akuntansi</SelectItem>
                    <SelectItem value="S3 Manajemen">S3 Manajemen</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editDocData.unit === 'Lainnya' && (
              <div className="space-y-1.5 animate-fadeIn">
                <Label htmlFor="editOtherUnit" className="font-semibold text-xs text-sky-500">Tulis Nama Unit Asal Baru <span className="text-red-500">*</span></Label>
                <Input
                  id="editOtherUnit"
                  placeholder="Contoh: Unit Kemahasiswaan"
                  value={editDocData.otherUnit}
                  onChange={(e) => setEditDocData({ ...editDocData, otherUnit: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="editSignatureMethod" className="font-semibold text-xs">Metode Otorisasi TTD</Label>
              <Select
                value={editDocData.signatureMethod}
                onValueChange={(val) => setEditDocData({ ...editDocData, signatureMethod: val })}
              >
                <SelectTrigger id="editSignatureMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Digital (Certificate Hash)">Digital e-Sign (Sertifikat Elektronik MIRA)</SelectItem>
                  <SelectItem value="Tanda Tangan Basah (Scan)">Tanda Tangan Basah (Tanda Tangan Fisik + Scan)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-xs">Unggah Berkas Pendukung Baru (Maks 5 MB)</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-3 pb-4 px-4 text-center">
                    <Upload className="w-4 h-4 text-muted-foreground mb-0.5" />
                    <p className="text-[10px] text-muted-foreground font-semibold">Klik untuk mengganti file</p>
                    <p className="text-[8px] text-muted-foreground/80">Maksimal ukuran 5 MB (Semua format)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, true)} 
                  />
                </label>
              </div>
              {editDocData.attachmentName && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-2 rounded-lg border border-amber-100 dark:border-amber-950/40 text-xs mt-1.5">
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold truncate flex-1">{editDocData.attachmentName}</span>
                  {editDocData.attachmentSize > 0 && (
                    <span className="font-mono text-[9px] bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded shrink-0">
                      {(editDocData.attachmentSize / 1024).toFixed(1)} KB
                    </span>
                  )}
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditUploadedFile(null)
                      setEditDocData(prev => ({ ...prev, attachmentName: '', attachmentSize: 0 }))
                    }} 
                    className="text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editNotes" className="font-semibold text-xs">Catatan Pengaju</Label>
              <Textarea
                id="editNotes"
                rows={2}
                placeholder="Catatan opsional..."
                value={editDocData.notes}
                onChange={(e) => setEditDocData({ ...editDocData, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditModalOpen(false)
                setEditingRecord(null)
              }} className="rounded-xl" disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

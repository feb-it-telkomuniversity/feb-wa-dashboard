'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Inbox, 
  Send, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  Sparkles,
  Lock
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { motion, AnimatePresence } from 'framer-motion'

// Sub-components
import DashboardOverview from '@/components/SuratMenyurat/DashboardOverview'
import SuratMasuk from '@/components/SuratMenyurat/SuratMasuk'
import SuratKeluar from '@/components/SuratMenyurat/SuratKeluar'
import TemplateNomor from '@/components/SuratMenyurat/TemplateNomor'
import DisposisiLogs from '@/components/SuratMenyurat/DisposisiLogs'

// Initial Presets for ISO-Compliant Records
const defaultIncoming = [
  {
    id: "inc-1",
    letterNumber: "045.2/821/FEB-TelU/2026",
    sender: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    dateSent: "2026-05-10",
    dateReceived: "2026-05-12",
    classification: "Confidential",
    subject: "Undangan Rapat Koordinasi Akreditasi Internasional Perguruan Tinggi",
    summary: "Undangan untuk menghadiri koordinasi penyelarasan standar akreditasi internasional AACSB dengan Kemendikbud.",
    retention: "5 Years",
    status: "Disposed",
    attachmentName: "undangan_koordinasi_aacsb.pdf"
  },
  {
    id: "inc-2",
    letterNumber: "204/LLDIKTI4/KPT/2026",
    sender: "LLDIKTI Wilayah IV Jawa Barat",
    dateSent: "2026-05-20",
    dateReceived: "2026-05-21",
    classification: "Urgent",
    subject: "Permintaan Laporan Kinerja Dosen Semester Ganjil 2025/2026",
    summary: "Instruksi pengumpulan rekapitulasi LKD semester ganjil paling lambat akhir bulan ini.",
    retention: "10 Years",
    status: "Pending",
    attachmentName: "permintaan_lkd_ganjil.pdf"
  },
  {
    id: "inc-3",
    letterNumber: "EXT/019/M-PT/2026",
    sender: "PT Bank Mandiri (Persero) Tbk",
    dateSent: "2026-05-22",
    dateReceived: "2026-05-23",
    classification: "Normal",
    subject: "Penawaran Program Magang Mahasiswa BUMN Bersertifikat",
    summary: "Penawaran slot magang bersertifikat untuk 15 mahasiswa Fakultas Ekonomi dan Bisnis.",
    retention: "2 Years",
    status: "Pending",
    attachmentName: "magang_bumn_mandiri.pdf"
  }
]

const defaultOutgoing = [
  {
    id: "out-1",
    letterNumber: "SR-102/FEB-TelU/V/2026",
    recipient: "Rektor Universitas Telkom",
    dateSent: "2026-05-15",
    classification: "Normal",
    subject: "Pengajuan Pembukaan Program Studi Baru Digital Finance",
    content: "Dengan hormat, sehubungan dengan rencana pengembangan prodi baru di lingkungan FEB, kami mengajukan permohonan pembukaan prodi Digital Finance...",
    type: "Surat Resmi",
    status: "Sent",
    approver: "Dekan FEB"
  },
  {
    id: "out-2",
    letterNumber: "ST-054/FEB-TelU/WADEK2/V/2026",
    recipient: "Dosen FEB (Terlampir)",
    dateSent: "2026-05-24",
    classification: "Normal",
    subject: "Surat Tugas Kepanitiaan RTM (Rapat Tinjauan Manajemen) 2026",
    content: "Menugaskan nama-nama terlampir untuk bertindak sebagai panitia pelaksana kegiatan RTM FEB yang akan diselenggarakan...",
    type: "Surat Tugas",
    status: "Approved",
    approver: "Wakil Dekan I"
  },
  {
    id: "out-3",
    letterNumber: "Draft-ST-055",
    recipient: "Dr. Ir. Ahmad Sidik, M.B.A.",
    dateSent: "2026-05-25",
    classification: "Normal",
    subject: "Surat Tugas Delegasi Konferensi Ilmiah Internasional AACSB 2026",
    content: "Menugaskan yang bersangkutan untuk menghadiri konferensi internasional di Singapura...",
    type: "Surat Tugas",
    status: "Pending Approval",
    approver: "-"
  }
]

const defaultDispositions = [
  {
    id: "disp-1",
    letterId: "inc-1",
    fromRole: "Dekan FEB",
    toRole: "Wakil Dekan I (Akademik)",
    instruction: "Tindak Lanjuti & Siapkan Dokumen",
    deadline: "2026-06-05",
    notes: "Tolong dikoordinasikan dengan tim AACSB fakultas agar draft disiapkan sebelum rapat.",
    status: "Sedang Diproses"
  }
]

const defaultLogs = [
  {
    id: "log-1",
    timestamp: "2026-05-12T09:00:00Z",
    activity: "Surat Masuk 045.2/821/FEB-TelU/2026 didaftarkan",
    user: "Admin FEB",
    type: "incoming"
  },
  {
    id: "log-2",
    timestamp: "2026-05-12T10:30:00Z",
    activity: "Disposisi Surat Masuk 045.2/821/FEB-TelU/2026 dibuat oleh Dekan ke Wadek I",
    user: "Dekan FEB",
    type: "disposition"
  },
  {
    id: "log-3",
    timestamp: "2026-05-24T14:15:00Z",
    activity: "Draft Surat Keluar ST-054 disetujui",
    user: "Wadek I FEB",
    type: "outgoing"
  }
]

export default function SuratMenyuratPage() {
  const { user } = useAuth()
  const userRole = user?.role || 'admin'
  const [mounted, setMounted] = useState(false)

  // Local States
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [dispositions, setDispositions] = useState([])
  const [logs, setLogs] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  // Load from LocalStorage
  useEffect(() => {
    setMounted(true)
    const storedIncoming = localStorage.getItem('mira_letters_incoming')
    const storedOutgoing = localStorage.getItem('mira_letters_outgoing')
    const storedDispositions = localStorage.getItem('mira_letters_dispositions')
    const storedLogs = localStorage.getItem('mira_letters_logs')

    if (storedIncoming) setIncoming(JSON.parse(storedIncoming))
    else setIncoming(defaultIncoming)

    if (storedOutgoing) setOutgoing(JSON.parse(storedOutgoing))
    else setOutgoing(defaultOutgoing)

    if (storedDispositions) setDispositions(JSON.parse(storedDispositions))
    else setDispositions(defaultDispositions)

    if (storedLogs) setLogs(JSON.parse(storedLogs))
    else setLogs(defaultLogs)
  }, [])

  // Persist Data Helpers
  const saveIncoming = (data) => {
    setIncoming(data)
    localStorage.setItem('mira_letters_incoming', JSON.stringify(data))
  }

  const saveOutgoing = (data) => {
    setOutgoing(data)
    localStorage.setItem('mira_letters_outgoing', JSON.stringify(data))
  }

  const saveDispositions = (data) => {
    setDispositions(data)
    localStorage.setItem('mira_letters_dispositions', JSON.stringify(data))
  }

  const saveLogs = (data) => {
    setLogs(data)
    localStorage.setItem('mira_letters_logs', JSON.stringify(data))
  }

  const addLog = (activity, type = 'general') => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      activity,
      user: user?.name || 'Admin',
      type
    }
    saveLogs([...logs, newLog])
  }

  // Incoming Handlers
  const handleAddIncoming = (newLetter) => {
    const updated = [...incoming, newLetter]
    saveIncoming(updated)
    addLog(`Surat Masuk baru registered: ${newLetter.letterNumber}`, 'incoming')
  }

  const handleDeleteIncoming = (id) => {
    const target = incoming.find(l => l.id === id)
    const updated = incoming.filter(l => l.id !== id)
    saveIncoming(updated)
    if (target) {
      addLog(`Surat Masuk dihapus: ${target.letterNumber}`, 'incoming')
    }
  }

  const handleAddDisposition = (newDisp, letterId) => {
    const updatedDisps = [...dispositions, newDisp]
    saveDispositions(updatedDisps)

    // Update letter status to Disposed
    const updatedLetters = incoming.map(l => {
      if (l.id === letterId) {
        return { ...l, status: 'Disposed' }
      }
      return l
    })
    saveIncoming(updatedLetters)
    addLog(`Disposisi dibuat untuk surat ID ${letterId} ke ${newDisp.toRole}`, 'disposition')
  }

  // Outgoing Handlers
  const handleAddOutgoing = (newLetter) => {
    const updated = [...outgoing, newLetter]
    saveOutgoing(updated)
    addLog(`Draft Surat Keluar dibuat: ${newLetter.subject}`, 'outgoing')
  }

  const handleDeleteOutgoing = (id) => {
    const target = outgoing.find(l => l.id === id)
    const updated = outgoing.filter(l => l.id !== id)
    saveOutgoing(updated)
    if (target) {
      addLog(`Draft Surat Keluar dihapus: ${target.letterNumber}`, 'outgoing')
    }
  }

  const handleApproveOutgoing = (id, officialNumber, approverName) => {
    const updated = outgoing.map(l => {
      if (l.id === id) {
        return {
          ...l,
          letterNumber: officialNumber,
          status: 'Approved',
          approver: approverName
        }
      }
      return l
    })
    saveOutgoing(updated)
    addLog(`Surat Keluar disetujui & nomor diterbitkan: ${officialNumber}`, 'outgoing')
  }

  // Disposition Logs Handlers
  const handleUpdateDispStatus = (id, newStatus) => {
    const updated = dispositions.map(d => {
      if (d.id === id) {
        return { ...d, status: newStatus }
      }
      return d
    })
    saveDispositions(updated)
    addLog(`Status disposisi ID ${id} diubah menjadi ${newStatus}`, 'disposition')
  }

  const handleDeleteDisp = (id) => {
    const updated = dispositions.filter(d => d.id !== id)
    saveDispositions(updated)
    addLog(`Log Disposisi ID ${id} dihapus`, 'disposition')
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start mt-1 gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white shadow-md shadow-primary/20">
            <Mail className="size-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 mb-1">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">ISO 15489 Standardized</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Administrasi Surat Menyurat</h1>
            <p className="text-muted-foreground text-sm">
              Sistem tata kelola, klasifikasi, disposisi, dan standarisasi surat keluar/masuk Fakultas Ekonomi & Bisnis.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border">
          <TabsTrigger value="overview" className="rounded-xl py-2 font-semibold text-xs sm:text-sm gap-2">
            <BarChart3 className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="incoming" className="rounded-xl py-2 font-semibold text-xs sm:text-sm gap-2">
            <Inbox className="w-4 h-4" /> Surat Masuk
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-xl py-2 font-semibold text-xs sm:text-sm gap-2">
            <Send className="w-4 h-4" /> Surat Keluar
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-xl py-2 font-semibold text-xs sm:text-sm gap-2">
            <FileText className="w-4 h-4" /> Template & No
          </TabsTrigger>
          <TabsTrigger value="disposition" className="rounded-xl py-2 font-semibold text-xs sm:text-sm gap-2">
            <ClipboardList className="w-4 h-4" /> Log Disposisi
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents with animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <TabsContent value="overview" className="mt-0 outline-none">
              <DashboardOverview
                incoming={incoming}
                outgoing={outgoing}
                dispositions={dispositions}
                logs={logs}
              />
            </TabsContent>

            <TabsContent value="incoming" className="mt-0 outline-none">
              <SuratMasuk
                letters={incoming}
                onAddLetter={handleAddIncoming}
                onDeleteLetter={handleDeleteIncoming}
                onAddDisposition={handleAddDisposition}
                userRole={userRole}
              />
            </TabsContent>

            <TabsContent value="outgoing" className="mt-0 outline-none">
              <SuratKeluar
                letters={outgoing}
                onAddLetter={handleAddOutgoing}
                onDeleteLetter={handleDeleteOutgoing}
                onApproveLetter={handleApproveOutgoing}
                userRole={userRole}
              />
            </TabsContent>

            <TabsContent value="templates" className="mt-0 outline-none">
              <TemplateNomor />
            </TabsContent>

            <TabsContent value="disposition" className="mt-0 outline-none">
              <DisposisiLogs
                dispositions={dispositions}
                letters={incoming}
                onUpdateStatus={handleUpdateDispStatus}
                onDeleteDisp={handleDeleteDisp}
              />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}

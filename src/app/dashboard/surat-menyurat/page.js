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
import api from '@/lib/axios'

// Sub-components
import DashboardOverview from '@/components/SuratMenyurat/DashboardOverview'
import SuratMasuk from '@/components/SuratMenyurat/SuratMasuk/SuratMasuk'
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

  // Load Data
  useEffect(() => {
    setMounted(true)

    // Fetch Incoming Letters from API
    const fetchIncomingLetters = async () => {
      try {
        const res = await api.get('/api/administrasi-surat/surat-masuk')
        if (res.data?.success) {
          setIncoming(res.data.data)
        } else {
          // Fallback
          const storedIncoming = localStorage.getItem('mira_letters_incoming')
          if (storedIncoming) setIncoming(JSON.parse(storedIncoming))
          else setIncoming(defaultIncoming)
        }
      } catch (error) {
        console.error("Failed to fetch incoming letters", error)
        const storedIncoming = localStorage.getItem('mira_letters_incoming')
        if (storedIncoming) setIncoming(JSON.parse(storedIncoming))
        else setIncoming(defaultIncoming)
      }
    }

    const fetchOutgoingLetters = async () => {
      try {
        const res = await api.get('/api/administrasi-surat/surat-keluar')
        if (res.data?.success) {
          setOutgoing(res.data.data)
        } else {
          const storedOutgoing = localStorage.getItem('mira_letters_outgoing')
          if (storedOutgoing) setOutgoing(JSON.parse(storedOutgoing))
          else setOutgoing(defaultOutgoing)
        }
      } catch (error) {
        console.error("Failed to fetch outgoing letters", error)
        const storedOutgoing = localStorage.getItem('mira_letters_outgoing')
        if (storedOutgoing) setOutgoing(JSON.parse(storedOutgoing))
        else setOutgoing(defaultOutgoing)
      }
    }

    const fetchDispositions = async () => {
      try {
        const res = await api.get('/api/administrasi-surat/disposisi-surat')
        if (res.data?.success) {
          setDispositions(res.data.data)
        } else {
          const storedDispositions = localStorage.getItem('mira_letters_dispositions')
          if (storedDispositions) setDispositions(JSON.parse(storedDispositions))
          else setDispositions(defaultDispositions)
        }
      } catch (error) {
        console.error("Failed to fetch dispositions", error)
        const storedDispositions = localStorage.getItem('mira_letters_dispositions')
        if (storedDispositions) setDispositions(JSON.parse(storedDispositions))
        else setDispositions(defaultDispositions)
      }
    }

    fetchIncomingLetters()
    fetchOutgoingLetters()
    fetchDispositions()

    const storedLogs = localStorage.getItem('mira_letters_logs')
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
    addLog(`Surat Masuk baru registered: ${newLetter.nomorSuratAsal || newLetter.letterNumber}`, 'incoming')
  }

  const handleDeleteIncoming = (id) => {
    const target = incoming.find(l => l.id === id)
    const updated = incoming.filter(l => l.id !== id)
    saveIncoming(updated)
    if (target) {
      addLog(`Surat Masuk dihapus: ${target.nomorSuratAsal || target.letterNumber}`, 'incoming')
    }
  }

  const handleUpdateIncoming = (updatedLetter) => {
    const updated = incoming.map(l => l.id === updatedLetter.id ? updatedLetter : l)
    saveIncoming(updated)
    addLog(`Surat Masuk diperbarui: ${updatedLetter.nomorSuratAsal}`, 'incoming')
  }

  const handleAddDisposition = (newDisp) => {
    // Update status surat masuk secara lokal (API sudah update di backend)
    if (newDisp?.suratMasukId) {
      const updated = incoming.map(l =>
        l.id === newDisp.suratMasukId ? { ...l, status: 'BelumDiproses' } : l
      )
      saveIncoming(updated)
    }
    const updatedDisps = [...dispositions, newDisp]
    saveDispositions(updatedDisps)
    addLog(`Disposisi dibuat untuk surat ID ${newDisp?.suratMasukId} ke ${newDisp?.penerimaUnit?.name || 'unit'}`, 'disposition')
  }

  // Outgoing Handlers
  const handleAddOutgoing = (newLetter) => {
    const updated = [...outgoing, newLetter]
    saveOutgoing(updated)
    addLog(`Draft Surat Keluar dibuat: ${newLetter.perihal || newLetter.subject}`, 'outgoing')
  }

  const handleDeleteOutgoing = (id) => {
    const target = outgoing.find(l => l.id === id)
    const updated = outgoing.filter(l => l.id !== id)
    saveOutgoing(updated)
    if (target) {
      addLog(`Draft Surat Keluar dihapus: ${target.perihal || target.letterNumber || target.subject}`, 'outgoing')
    }
  }

  const handleUpdateOutgoing = (updatedLetter) => {
    const updated = outgoing.map(l => l.id === updatedLetter.id ? updatedLetter : l)
    saveOutgoing(updated)
    addLog(`Surat Keluar diperbarui: ${updatedLetter.perihal || updatedLetter.nomorSurat}`, 'outgoing')
  }

  const handleApproveOutgoing = async (id, officialNumber, approverName) => {
    try {
      const res = await api.put(`/api/administrasi-surat/surat-keluar/${id}`, {
        nomorSurat: officialNumber,
        status: 'Disetujui',
        penyetujuId: user?.id || null,
        tanggalSurat: new Date().toISOString()
      })
      if (res.data?.success) {
        const updated = outgoing.map(l => {
          if (l.id === id) {
            return res.data.data
          }
          return l
        })
        saveOutgoing(updated)
        addLog(`Surat Keluar disetujui & nomor diterbitkan: ${officialNumber}`, 'outgoing')
      }
    } catch (error) {
      console.error("Failed to approve outgoing letter", error)
      toast.error("Gagal menyetujui surat keluar di database")
    }
  }

  // Disposition Logs Handlers
  const handleUpdateDispStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/api/administrasi-surat/disposisi-surat/${id}`, {
        status: newStatus
      })
      if (res.data?.success) {
        const updated = dispositions.map(d => {
          if (d.id === id) {
            return res.data.data
          }
          return d
        })
        saveDispositions(updated)
        addLog(`Status disposisi ID ${id} diubah menjadi ${newStatus}`, 'disposition')
      }
    } catch (error) {
      console.error("Failed to update disposition status", error)
      toast.error("Gagal memperbarui status disposisi di database")
    }
  }

  const handleDeleteDisp = async (id) => {
    try {
      const res = await api.delete(`/api/administrasi-surat/disposisi-surat/${id}`)
      if (res.data?.success) {
        const updated = dispositions.filter(d => d.id !== id)
        saveDispositions(updated)
        addLog(`Log Disposisi ID ${id} dihapus`, 'disposition')
      }
    } catch (error) {
      console.error("Failed to delete disposition", error)
      toast.error("Gagal menghapus disposisi dari database")
    }
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border">
          <TabsTrigger value="overview" className="rounded-xl font-semibold text-xs sm:text-sm gap-2">
            <BarChart3 className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="incoming" className="rounded-xl font-semibold text-xs sm:text-sm gap-2">
            <Inbox className="w-4 h-4" /> Surat Masuk
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-xl font-semibold text-xs sm:text-sm gap-2">
            <Send className="w-4 h-4" /> Surat Keluar
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-xl font-semibold text-xs sm:text-sm gap-2">
            <FileText className="w-4 h-4" /> Template & No
          </TabsTrigger>
          <TabsTrigger value="disposition" className="rounded-xl font-semibold text-xs sm:text-sm gap-2">
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
                onUpdateLetter={handleUpdateIncoming}
                onDeleteLetter={handleDeleteIncoming}
                onAddDisposition={handleAddDisposition}
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
              <TemplateNomor 
                letters={outgoing}
                onUpdateLetter={handleUpdateOutgoing}
              />
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

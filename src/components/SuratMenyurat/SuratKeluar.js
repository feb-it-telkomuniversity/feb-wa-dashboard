'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Mail,
  Printer,
  ChevronDown,
  ArrowUpRight,
  Send,
  Loader2,
  FileCheck2,
  FolderOpen
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function SuratKeluar({ letters = [], onAddLetter, onDeleteLetter, onApproveLetter, userRole }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isMailOpen, setIsMailOpen] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState(null)
  
  // Mail client configuration form
  const [emailConfig, setEmailConfig] = useState({
    toEmail: 'penerima@telkomuniversity.ac.id',
    client: 'gmail' // gmail | outlook | mailto
  })

  // Add Outgoing Form State
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    classification: 'Normal',
    type: 'Surat Resmi',
    content: ''
  })

  const normalizedLetters = (letters || []).map(l => ({
    ...l,
    id: l.id,
    letterNumber: l.letterNumber || l.nomorSurat || '-',
    type: l.type || l.jenisSurat || 'Surat Resmi',
    recipient: l.recipient || l.tujuanPenerima || '-',
    subject: l.subject || l.perihal || '',
    content: l.content || l.isiUtama || '',
    classification: l.classification || l.kerahasiaan || 'Normal',
    status: l.status || 'Draft',
    approver: l.approver || (l.penyetuju ? l.penyetuju.name : null) || '-'
  }))

  const filteredLetters = normalizedLetters.filter(l => {
    const matchesSearch = (l.subject || '').toLowerCase().includes(search.toLowerCase()) || 
                          (l.letterNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (l.recipient || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!formData.recipient || !formData.subject || !formData.content) {
      toast.error('Harap isi semua kolom wajib!')
      return
    }

    // Generate simulated draft ID/number
    const newLetter = {
      id: Date.now().toString(),
      letterNumber: `Draft-SK-${Date.now().toString().substring(8)}`,
      recipient: formData.recipient,
      dateSent: new Date().toISOString().split('T')[0],
      classification: formData.classification,
      subject: formData.subject,
      content: formData.content,
      type: formData.type,
      status: 'Pending Approval',
      approver: '-'
    }

    onAddLetter(newLetter)
    setIsAddOpen(false)
    toast.success('Draft surat keluar berhasil dibuat & diajukan untuk persetujuan!')
    
    // Reset Form
    setFormData({
      recipient: '',
      subject: '',
      classification: 'Normal',
      type: 'Surat Resmi',
      content: ''
    })
  }

  // Handle Approve
  const handleApprove = (letterId) => {
    // Generate official Letter number compliant with Telkom University format
    // Format: [TIPE-SURAT]/[NO-URUT]/FEB-TelU/[BULAN-ROMAWI]/[TAHUN]
    const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    const romanMonth = months[new Date().getMonth()]
    const year = new Date().getFullYear()
    const runningNo = Math.floor(Math.random() * 900) + 100
    
    let prefix = 'SR'
    const match = letters.find(l => l.id === letterId)
    if (match) {
      if (match.type === 'Surat Tugas') prefix = 'ST'
      if (match.type === 'Surat Undangan') prefix = 'SU'
      if (match.type === 'Nota Dinas') prefix = 'ND'
    }

    const officialNumber = `${prefix}-${runningNo}/FEB-TelU/${romanMonth}/${year}`
    onApproveLetter(letterId, officialNumber, userRole || 'Wakil Dekan I')
    toast.success(`Surat disetujui! Nomor resmi diterbitkan: ${officialNumber}`)
  }

  // Handle Send Email integration
  const handleSendEmail = (e) => {
    e.preventDefault()
    if (!emailConfig.toEmail) {
      toast.error('Harap masukkan alamat email tujuan!')
      return
    }

    const subject = encodeURIComponent(`[MIRA FEB] ${selectedLetter.subject}`)
    
    const bodyText = `Yth. Penerima,

Berikut kami sampaikan surat dinas resmi dari Fakultas Ekonomi dan Bisnis, Universitas Telkom:

Nomor Surat: ${selectedLetter.letterNumber}
Kategori: ${selectedLetter.type}
Perihal: ${selectedLetter.subject}
Klasifikasi: ${selectedLetter.classification}

Isi Surat:
------------------------------------------------------------------
${selectedLetter.content}
------------------------------------------------------------------

Surat ini dikirim secara otomatis melalui platform terintegrasi MIRA FEB - Media Informasi dan Relasi Anda.

Hormat kami,
Fakultas Ekonomi dan Bisnis
Universitas Telkom`

    const body = encodeURIComponent(bodyText)
    let composeUrl = ''

    if (emailConfig.client === 'gmail') {
      composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailConfig.toEmail}&su=${subject}&body=${body}`
    } else if (emailConfig.client === 'outlook') {
      // Outlook Live / Office 365 compose URL
      composeUrl = `https://outlook.office.com/mail/deeplink/compose?to=${emailConfig.toEmail}&subject=${subject}&body=${body}`
    } else {
      // Default mailto link
      composeUrl = `mailto:${emailConfig.toEmail}?subject=${subject}&body=${body}`
    }

    window.open(composeUrl, '_blank')
    setIsMailOpen(false)
    toast.success(`Menghubungkan ke ${emailConfig.client === 'mailto' ? 'Aplikasi Email' : emailConfig.client}...`)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sent':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Terkirim</Badge>
      case 'Approved':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Disetujui</Badge>
      case 'Pending Approval':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Menunggu Review</Badge>
      default:
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Draft</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari penerima, nomor, atau subjek surat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/50 dark:bg-slate-900/50"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-white/50 dark:bg-slate-900/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Pending Approval">Menunggu Review</SelectItem>
              <SelectItem value="Approved">Disetujui</SelectItem>
              <SelectItem value="Sent">Terkirim</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Buat Draft Surat Keluar
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40">
              <TableRow>
                <TableHead className="w-[180px] font-bold">No. Surat</TableHead>
                <TableHead className="w-[120px] font-bold">Tipe Surat</TableHead>
                <TableHead className="font-bold">Penerima</TableHead>
                <TableHead className="font-bold">Perihal</TableHead>
                <TableHead className="w-[120px] font-bold">Status</TableHead>
                <TableHead className="w-[120px] font-bold">Penyetuju</TableHead>
                <TableHead className="w-[150px] text-right font-bold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLetters.map((letter) => (
                <TableRow key={letter.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <TableCell className="font-mono text-xs font-semibold">{letter.letterNumber}</TableCell>
                  <TableCell className="text-xs font-semibold">{letter.type}</TableCell>
                  <TableCell className="font-medium">{letter.recipient}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-sm line-clamp-1">{letter.subject}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{letter.content}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(letter.status)}</TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">{letter.approver}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {letter.status === 'Pending Approval' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(letter.id)}
                          title="Setujui & Terbitkan Nomor"
                          className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                        >
                          <FileCheck2 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {(letter.status === 'Approved' || letter.status === 'Sent') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedLetter(letter)
                            setIsMailOpen(true)
                          }}
                          title="Kirim via Gmail/Outlook"
                          className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast.info(`Mencetak dokumen ${letter.letterNumber}`)
                        }}
                        title="Cetak Surat (Format A4)"
                        className="h-8 w-8 text-slate-500 hover:bg-slate-500/10 rounded-lg"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Apakah Anda yakin ingin menghapus draft surat keluar ini?')) {
                            onDeleteLetter(letter.id)
                            toast.success('Draft berhasil dihapus.')
                          }
                        }}
                        title="Hapus"
                        className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLetters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
                      <span>Tidak ada surat keluar yang sesuai filter atau pencarian.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* dialog tambah draft surat keluar */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Buat Draft Surat Keluar
            </DialogTitle>
            <DialogDescription>
              Buat draf surat keluar baru. Setelah diajukan, Wakil Dekan/Dekanat dapat memberikan persetujuan (approval) sebelum nomor resmi diterbitkan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="font-semibold text-xs">Jenis Surat</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Surat Resmi">Surat Resmi</SelectItem>
                    <SelectItem value="Surat Tugas">Surat Tugas</SelectItem>
                    <SelectItem value="Surat Undangan">Surat Undangan</SelectItem>
                    <SelectItem value="Nota Dinas">Nota Dinas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="classification" className="font-semibold text-xs">Klasifikasi Surat</Label>
                <Select
                  value={formData.classification}
                  onValueChange={(val) => setFormData({ ...formData, classification: val })}
                >
                  <SelectTrigger id="classification">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal (Biasa)</SelectItem>
                    <SelectItem value="Confidential">Confidential (Rahasia)</SelectItem>
                    <SelectItem value="Urgent">Urgent (Penting/Segera)</SelectItem>
                    <SelectItem value="Restricted">Restricted (Terbatas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recipient" className="font-semibold text-xs">Tujuan Penerima <span className="text-red-500">*</span></Label>
              <Input
                id="recipient"
                placeholder="Contoh: Rektor Universitas Telkom atau Mitra Industri"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="font-semibold text-xs">Perihal Surat <span className="text-red-500">*</span></Label>
              <Input
                id="subject"
                placeholder="Subjek/perihal surat keluar"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content" className="font-semibold text-xs">Isi Dokumen Surat <span className="text-red-500">*</span></Label>
              <Textarea
                id="content"
                rows={6}
                placeholder="Tulis draf lengkap isi surat dinas di sini..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white rounded-xl">
                Simpan & Ajukan Persetujuan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog kirim email */}
      <Dialog open={isMailOpen} onOpenChange={setIsMailOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Kirim Dokumen via Email
            </DialogTitle>
            <DialogDescription>
              Kirim detail resmi surat {selectedLetter?.letterNumber} melalui Gmail atau Outlook.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendEmail} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="toEmail" className="font-semibold text-xs">Alamat Email Tujuan <span className="text-red-500">*</span></Label>
              <Input
                id="toEmail"
                type="email"
                placeholder="Contoh: rektorat@telkomuniversity.ac.id"
                value={emailConfig.toEmail}
                onChange={(e) => setEmailConfig({ ...emailConfig, toEmail: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client" className="font-semibold text-xs">Platform Email Client</Label>
              <Select
                value={emailConfig.client}
                onValueChange={(val) => setEmailConfig({ ...emailConfig, client: val })}
              >
                <SelectTrigger id="client">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail Web Compose</SelectItem>
                  <SelectItem value="outlook">Outlook (Office 365) Web Compose</SelectItem>
                  <SelectItem value="mailto">Default System Mail (Outlook App / Mail App)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-dashed text-xs space-y-1 text-muted-foreground">
              <span className="font-semibold text-foreground">Catatan Integrasi:</span>
              <p>Aplikasi akan membuka compose tab baru di browser Anda dan otomatis mengisikan subjek, penerima, dan ringkasan isi surat dinas secara terstruktur.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsMailOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white rounded-xl gap-1.5">
                <Send className="w-4 h-4" /> Buka Compose Email
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

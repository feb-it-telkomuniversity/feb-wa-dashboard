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
  Mail,
  Printer,
  Send,
  FileCheck2,
  FolderOpen
} from 'lucide-react'
import { toast } from 'sonner'
import AddSuratKeluar from './SuratKeluar/add-surat-keluar'
import DeleteSuratKeluar from './SuratKeluar/delete-surat-keluar'
import PrintableSuratA4 from './SuratKeluar/printable-surat-a4'
import { formatCamelCaseLabel } from '@/lib/utils'

export default function SuratKeluar({ letters = [], onAddLetter, onDeleteLetter, onApproveLetter, userRole }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isMailOpen, setIsMailOpen] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [printData, setPrintData] = useState(null)

  // Mail client configuration form
  const [emailConfig, setEmailConfig] = useState({
    toEmail: 'penerima@telkomuniversity.ac.id',
    client: 'gmail' // gmail | outlook | mailto
  })

  // Add Outgoing Form State - now handled by separate component


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
      const type = match.jenisSurat || match.type || 'SuratResmi'
      if (type === 'SuratTugas' || type === 'Surat Tugas') prefix = 'ST'
      if (type === 'SuratUndangan' || type === 'Surat Undangan') prefix = 'SU'
      if (type === 'NotaDinas' || type === 'Nota Dinas') prefix = 'ND'
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

    const subjectText = selectedLetter?.perihal || selectedLetter?.subject || ''
    const subject = encodeURIComponent(`[MIRA FEB] ${subjectText}`)

    const letterNum = selectedLetter?.nomorSurat || selectedLetter?.letterNumber || ''
    const type = selectedLetter?.jenisSurat || selectedLetter?.type || ''
    const classification = selectedLetter?.kerahasiaan || selectedLetter?.classification || ''
    const content = selectedLetter?.isiUtama || selectedLetter?.content || ''

    const bodyText = `Yth. Penerima,

Berikut kami sampaikan surat dinas resmi dari Fakultas Ekonomi dan Bisnis, Universitas Telkom:

Nomor Surat: ${letterNum}
Kategori: ${type}
Perihal: ${subjectText}
Klasifikasi: ${classification}

Isi Surat:
------------------------------------------------------------------
${content}
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
      case 'PendingApproval':
      case 'Pending Approval':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Menunggu Review</Badge>
      default:
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Draft</Badge>
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
                  <TableCell className="font-mono text-xs font-semibold">{letter.nomorSurat || letter.letterNumber || '-'}</TableCell>
                  <TableCell className="text-xs font-semibold">{formatCamelCaseLabel(letter.jenisSurat)}</TableCell>
                  <TableCell className="font-medium">{letter.tujuanPenerima || letter.recipient}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-sm line-clamp-1 text-wrap">{letter.perihal || letter.subject}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 text-wrap">{letter.isiUtama || letter.content}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(letter.status)}</TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">{letter.penyetujuId || letter.approver || '-'}</TableCell>
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
                          setPrintData(letter)
                          toast.info(`Menyiapkan dokumen ${letter.nomorSurat || letter.letterNumber || 'Draft'} untuk dicetak...`, {
                            position: 'bottom-center',
                            style: { background: "#fef08a", color: "#92400e" },
                            className: "border border-amber-500"
                          })
                          setTimeout(() => {
                            window.print()
                          }, 300)
                        }}
                        title="Cetak Surat (Format A4)"
                        className="h-8 w-8 text-slate-500 hover:bg-slate-500/10 rounded-lg"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>

                      <DeleteSuratKeluar
                        suratId={letter.id}
                        nomorSurat={letter.nomorSurat || letter.letterNumber}
                        onSuccess={onDeleteLetter}
                      />
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
      <AddSuratKeluar
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={onAddLetter}
      />

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

      {/* Hidden container for printing */}
      <div className="hidden print:block">
        {printData && <PrintableSuratA4 formData={printData} />}
      </div>
    </div>
  )
}

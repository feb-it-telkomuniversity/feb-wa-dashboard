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
  Share2,
  FileText,
  UserCheck,
  Calendar,
  AlertTriangle,
  FolderOpen
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function SuratMasuk({ letters = [], onAddLetter, onDeleteLetter, onAddDisposition, userRole }) {
  const [search, setSearch] = useState('')
  const [filterClassification, setFilterClassification] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isDispOpen, setIsDispOpen] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState(null)

  // Add Form State
  const [formData, setFormData] = useState({
    letterNumber: '',
    sender: '',
    dateSent: '',
    dateReceived: new Date().toISOString().split('T')[0],
    classification: 'Normal',
    subject: '',
    summary: '',
    retention: '5 Years',
    attachmentName: ''
  })

  // Disposition Form State
  const [dispData, setDispData] = useState({
    toRole: '',
    instruction: 'Tindak Lanjuti',
    deadline: '',
    notes: ''
  })

  const normalizedLetters = (letters || []).map(l => ({
    ...l,
    id: l.id,
    letterNumber: l.letterNumber || l.nomorSuratAsal || l.nomorSurat || '-',
    sender: l.sender || l.instansiPengirim || '-',
    subject: l.subject || l.perihal || '',
    summary: l.summary || l.ringkasan || '',
    classification: l.classification || l.kerahasiaan || 'Normal',
    dateReceived: l.dateReceived || l.tanggalDiterima || new Date().toISOString(),
    status: l.status || 'Pending',
    attachmentName: l.attachmentName || l.linkPdf || 'dokumen_surat_masuk.pdf'
  }))

  // Filter letters
  const filteredLetters = normalizedLetters.filter(l => {
    const matchesSearch = (l.subject || '').toLowerCase().includes(search.toLowerCase()) || 
                          (l.letterNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (l.sender || '').toLowerCase().includes(search.toLowerCase())
    const matchesClass = filterClassification === 'all' || l.classification === filterClassification
    return matchesSearch && matchesClass
  })

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!formData.letterNumber || !formData.sender || !formData.subject || !formData.dateSent) {
      toast.error('Harap isi semua kolom wajib!')
      return
    }

    const newLetter = {
      ...formData,
      id: Date.now().toString(),
      status: 'Pending',
      attachmentName: formData.attachmentName || 'dokumen_surat_masuk.pdf'
    }

    onAddLetter(newLetter)
    setIsAddOpen(false)
    toast.success('Surat masuk berhasil didaftarkan!')
    // Reset Form
    setFormData({
      letterNumber: '',
      sender: '',
      dateSent: '',
      dateReceived: new Date().toISOString().split('T')[0],
      classification: 'Normal',
      subject: '',
      summary: '',
      retention: '5 Years',
      attachmentName: ''
    })
  }

  const handleDispSubmit = (e) => {
    e.preventDefault()
    if (!dispData.toRole || !dispData.deadline) {
      toast.error('Harap pilih penerima dan batas waktu disposisi!')
      return
    }

    const newDisposition = {
      id: Date.now().toString(),
      letterId: selectedLetter.id,
      fromRole: userRole || 'Admin',
      toRole: dispData.toRole,
      instruction: dispData.instruction,
      deadline: dispData.deadline,
      notes: dispData.notes,
      status: 'Belum Diproses'
    }

    onAddDisposition(newDisposition, selectedLetter.id)
    setIsDispOpen(false)
    toast.success(`Surat berhasil didisposisikan ke ${dispData.toRole}`)
    
    // Reset Disposition form
    setDispData({
      toRole: '',
      instruction: 'Tindak Lanjuti',
      deadline: '',
      notes: ''
    })
  }

  const getBadgeVariant = (classification) => {
    switch (classification) {
      case 'Confidential':
        return 'destructive'
      case 'Urgent':
        return 'warning'
      case 'Restricted':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getBadgeColor = (classification) => {
    switch (classification) {
      case 'Confidential':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'Urgent':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'Restricted':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'Disposed') {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Didisposisikan</Badge>
    }
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor, pengirim, atau perihal surat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/50 dark:bg-slate-900/50"
            />
          </div>
          <Select value={filterClassification} onValueChange={setFilterClassification}>
            <SelectTrigger className="w-[180px] bg-white/50 dark:bg-slate-900/50">
              <SelectValue placeholder="Klasifikasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Klasifikasi</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Confidential">Confidential</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="Restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Registrasi Surat Masuk
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40">
              <TableRow>
                <TableHead className="w-[180px] font-bold">No. Surat</TableHead>
                <TableHead className="font-bold">Pengirim</TableHead>
                <TableHead className="font-bold">Perihal / Ringkasan</TableHead>
                <TableHead className="w-[120px] font-bold">Klasifikasi</TableHead>
                <TableHead className="w-[120px] font-bold">Tgl Terima</TableHead>
                <TableHead className="w-[100px] font-bold">Status</TableHead>
                <TableHead className="w-[130px] text-right font-bold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLetters.map((letter) => (
                <TableRow key={letter.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <TableCell className="font-mono text-xs font-semibold">{letter.letterNumber}</TableCell>
                  <TableCell className="font-medium">{letter.sender}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-sm line-clamp-1">{letter.subject}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{letter.summary}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBadgeColor(letter.classification)}>
                      {letter.classification}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {new Date(letter.dateReceived).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>{getStatusBadge(letter.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLetter(letter)
                          setIsDispOpen(true)
                        }}
                        title="Disposisi Surat"
                        className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast.info(`Membuka lampiran: ${letter.attachmentName}`)
                        }}
                        title="Lihat Lampiran"
                        className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Apakah Anda yakin ingin menghapus surat masuk ini?')) {
                            onDeleteLetter(letter.id)
                            toast.success('Surat masuk berhasil dihapus.')
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
                      <span>Tidak ada surat masuk yang sesuai filter atau pencarian.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* dialog register surat masuk */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Registrasi Surat Masuk Baru
            </DialogTitle>
            <DialogDescription>
              Catat metadata surat masuk sesuai dengan standar ISO 23081 untuk mempermudah pelacakan dan audit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="letterNumber" className="font-semibold text-xs">Nomor Surat Asal <span className="text-red-500">*</span></Label>
                <Input
                  id="letterNumber"
                  placeholder="Contoh: 002.1/DPK/FEB/2026"
                  value={formData.letterNumber}
                  onChange={(e) => setFormData({ ...formData, letterNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sender" className="font-semibold text-xs">Instansi Pengirim <span className="text-red-500">*</span></Label>
                <Input
                  id="sender"
                  placeholder="Contoh: LLDIKTI Wilayah IV"
                  value={formData.sender}
                  onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dateSent" className="font-semibold text-xs">Tanggal Surat <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="dateSent"
                    type="date"
                    value={formData.dateSent}
                    onChange={(e) => setFormData({ ...formData, dateSent: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateReceived" className="font-semibold text-xs">Tanggal Diterima</Label>
                <Input
                  id="dateReceived"
                  type="date"
                  value={formData.dateReceived}
                  onChange={(e) => setFormData({ ...formData, dateReceived: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="classification" className="font-semibold text-xs">Klasifikasi Kerahasiaan</Label>
                <Select
                  value={formData.classification}
                  onValueChange={(val) => setFormData({ ...formData, classification: val })}
                >
                  <SelectTrigger id="classification">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Confidential">Confidential</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="retention" className="font-semibold text-xs">Masa Retensi Rekam</Label>
                <Select
                  value={formData.retention}
                  onValueChange={(val) => setFormData({ ...formData, retention: val })}
                >
                  <SelectTrigger id="retention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 Year">1 Tahun (Operasional)</SelectItem>
                    <SelectItem value="2 Years">2 Tahun</SelectItem>
                    <SelectItem value="5 Years">5 Tahun (Standar Akreditasi)</SelectItem>
                    <SelectItem value="10 Years">10 Tahun (Kepegawaian/Keuangan)</SelectItem>
                    <SelectItem value="Permanent">Permanent (Arsip Vital)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="font-semibold text-xs">Perihal Surat <span className="text-red-500">*</span></Label>
              <Input
                id="subject"
                placeholder="Subjek formal surat"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="summary" className="font-semibold text-xs">Sari Isi / Ringkasan Surat</Label>
              <Textarea
                id="summary"
                rows={3}
                placeholder="Rangkuman ringkas isi surat untuk mempermudah pembacaan disposisi..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="attachment" className="font-semibold text-xs">Simulasi Unggah Lampiran (PDF)</Label>
              <Input
                id="attachment"
                placeholder="Contoh: salinan_surat_tugas.pdf"
                value={formData.attachmentName}
                onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white rounded-xl">
                Simpan & Daftarkan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog disposisi */}
      <Dialog open={isDispOpen} onOpenChange={setIsDispOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> Disposisi Surat Masuk
            </DialogTitle>
            <DialogDescription>
              Tingkat klasifikasi surat: <strong>{selectedLetter?.classification}</strong>. Lakukan delegasi secara terstruktur.
            </DialogDescription>
          </DialogHeader>

          {selectedLetter && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border text-xs space-y-1">
              <div><strong>Nomor:</strong> {selectedLetter.letterNumber}</div>
              <div><strong>Pengirim:</strong> {selectedLetter.sender}</div>
              <div className="line-clamp-1"><strong>Perihal:</strong> {selectedLetter.subject}</div>
            </div>
          )}

          <form onSubmit={handleDispSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="toRole" className="font-semibold text-xs">Penerima Disposisi</Label>
              <Select
                value={dispData.toRole}
                onValueChange={(val) => setDispData({ ...dispData, toRole: val })}
              >
                <SelectTrigger id="toRole">
                  <SelectValue placeholder="Pilih Jabatan/Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wakil Dekan I (Akademik)">Wakil Dekan I (Akademik)</SelectItem>
                  <SelectItem value="Wakil Dekan II (Sumber Daya)">Wakil Dekan II (Sumber Daya)</SelectItem>
                  <SelectItem value="Kepala Urusan (Kaur) Akademik">Kaur Akademik</SelectItem>
                  <SelectItem value="Kepala Urusan (Kaur) Umum">Kaur Umum</SelectItem>
                  <SelectItem value="Ketua Program Studi (Kaprodi)">Kaprodi</SelectItem>
                  <SelectItem value="Sekretaris Program Studi (Sekprodi)">Sekprodi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="instruction" className="font-semibold text-xs">Instruksi Aksi</Label>
                <Select
                  value={dispData.instruction}
                  onValueChange={(val) => setDispData({ ...dispData, instruction: val })}
                >
                  <SelectTrigger id="instruction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tindak Lanjuti & Laporkan">Tindak Lanjuti & Laporkan</SelectItem>
                    <SelectItem value="Pelajari & Beri Saran">Pelajari & Beri Saran</SelectItem>
                    <SelectItem value="Hadiri / Wakili">Hadiri / Wakili</SelectItem>
                    <SelectItem value="Simpan / Arsipkan">Simpan / Arsipkan</SelectItem>
                    <SelectItem value="Draft Balasan">Draft Balasan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline" className="font-semibold text-xs">Batas Waktu Tindak Lanjut</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={dispData.deadline}
                  onChange={(e) => setDispData({ ...dispData, deadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="font-semibold text-xs">Catatan / Petunjuk Tambahan</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Tulis instruksi khusus yang perlu dikerjakan oleh penerima disposisi..."
                value={dispData.notes}
                onChange={(e) => setDispData({ ...dispData, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDispOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white rounded-xl">
                Kirim Disposisi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  FileText,
  UserCheck,
  FolderOpen,
  Pencil
} from 'lucide-react'
import { toast } from 'sonner'
import AddSuratMasuk from './SuratMasuk/add-surat-masuk'
import EditSuratMasuk from './SuratMasuk/edit-surat-masuk'
import DeleteSuratMasuk from './SuratMasuk/delete-surat-masuk'

export default function SuratMasuk({ letters = [], onAddLetter, onUpdateLetter, onDeleteLetter, onAddDisposition, userRole }) {
  const [search, setSearch] = useState('')
  const [filterClassification, setFilterClassification] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDispOpen, setIsDispOpen] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [editSuratId, setEditSuratId] = useState(null)

  // Disposition Form State
  const [dispData, setDispData] = useState({
    toRole: '',
    instruction: 'Tindak Lanjuti',
    deadline: '',
    notes: ''
  })

  // Filter letters
  const filteredLetters = letters.filter(l => {
    const subject = l.perihal || l.subject || ''
    const letterNumber = l.nomorSuratAsal || l.letterNumber || ''
    const sender = l.instansiPengirim || l.sender || ''
    const classification = l.kerahasiaan || l.classification || ''

    const matchesSearch = subject.toLowerCase().includes(search.toLowerCase()) ||
      letterNumber.toLowerCase().includes(search.toLowerCase()) ||
      sender.toLowerCase().includes(search.toLowerCase())
    const matchesClass = filterClassification === 'all' || classification === filterClassification
    return matchesSearch && matchesClass
  })

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
    if (status === 'Disposed' || status === 'Didisposisikan') {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Didisposisikan</Badge>
    }
    if (status === 'Selesai') {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Selesai</Badge>
    }
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{status === 'Diterima' ? 'Diterima' : 'Pending'}</Badge>
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

        <Button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl"
        >
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
                  <TableCell className="font-mono text-xs font-semibold">{letter.nomorSuratAsal || letter.letterNumber}</TableCell>
                  <TableCell className="font-medium">{letter.instansiPengirim || letter.sender}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-sm line-clamp-1">{letter.perihal || letter.subject}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{letter.ringkasan || letter.summary}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBadgeColor(letter.kerahasiaan || letter.classification)}>
                      {letter.kerahasiaan || letter.classification}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {letter.tanggalDiterima || letter.dateReceived
                      ? new Date(letter.tanggalDiterima || letter.dateReceived).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(letter.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditSuratId(letter.id)
                          setIsEditOpen(true)
                        }}
                        title="Edit Surat Masuk"
                        className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {/* Disposisi */}
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
                      {/* Lihat Lampiran */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast.info(`Membuka lampiran: ${letter.linkPdf || letter.attachmentName || '-'}`)
                        }}
                        title="Lihat Lampiran"
                        className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>

                      <DeleteSuratMasuk
                        suratId={letter.id}
                        nomorSurat={letter.nomorSuratAsal || letter.letterNumber}
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
                      <span>Tidak ada surat masuk yang sesuai filter atau pencarian.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddSuratMasuk
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={onAddLetter}
      />

      <EditSuratMasuk
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        suratId={editSuratId}
        onSuccess={onUpdateLetter}
      />

      {/* Dialog Disposisi */}
      <Dialog open={isDispOpen} onOpenChange={setIsDispOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> Disposisi Surat Masuk
            </DialogTitle>
            <DialogDescription>
              Tingkat klasifikasi surat: <strong>{selectedLetter?.kerahasiaan || selectedLetter?.classification}</strong>. Lakukan delegasi secara terstruktur.
            </DialogDescription>
          </DialogHeader>

          {selectedLetter && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border text-xs space-y-1">
              <div><strong>Nomor:</strong> {selectedLetter.nomorSuratAsal || selectedLetter.letterNumber}</div>
              <div><strong>Pengirim:</strong> {selectedLetter.instansiPengirim || selectedLetter.sender}</div>
              <div className="line-clamp-1"><strong>Perihal:</strong> {selectedLetter.perihal || selectedLetter.subject}</div>
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

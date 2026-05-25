'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Printer, Settings2, FileText, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TemplateNomor() {
  const [templateType, setTemplateType] = useState('Surat Tugas')
  const [formData, setFormData] = useState({
    letterNumber: 'ST-089/FEB-TelU/WADEK1/V/2026',
    date: new Date().toISOString().split('T')[0],
    recipient: 'Segenap Dosen FEB Universitas Telkom',
    subject: 'Surat Tugas Pengawasan Ujian Akhir Semester Ganjil 2025/2026',
    salutation: 'Dengan hormat,',
    opening: 'Dalam rangka pelaksanaan Ujian Akhir Semester (UAS) Ganjil Tahun Akademik 2025/2026 di lingkungan Fakultas Ekonomi dan Bisnis Universitas Telkom, maka dengan ini Dekan Fakultas Ekonomi dan Bisnis memberikan tugas kepada:',
    coreContent: 'Nama: Dr. Ahmad Sidik, M.B.A. (NIP: 14850021)\nJabatan: Lektor Kepala / Dosen Tetap FEB\n\nUntuk bertindak selaku Pengawas Utama pada pelaksanaan UAS Ganjil yang akan diselenggarakan mulai tanggal 1 Juni 2026 s.d 12 Juni 2026 di ruang kelas gedung Manterawu.',
    closing: 'Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab dan dilaporkan perkembangannya.',
    signerName: 'Prof. Dr. Ir. Muhammad Yusuf, M.T.',
    signerTitle: 'Dekan Fakultas Ekonomi dan Bisnis'
  })

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Handle template change to autofill with standard presets
  const handleTemplateChange = (type) => {
    setTemplateType(type)
    
    if (type === 'Surat Resmi') {
      setFormData(prev => ({
        ...prev,
        letterNumber: 'SR-052/FEB-TelU/DEKAN/V/2026',
        subject: 'Permohonan Pengisian Kuesioner Akreditasi Internasional AACSB',
        recipient: 'Yth. Pimpinan Program Studi Akuntansi FEB',
        opening: 'Sehubungan dengan proses re-akreditasi internasional AACSB yang sedang dijalankan oleh fakultas, kami memohon bantuan Saudara untuk menyebarkan kuesioner kepada seluruh dosen aktif.',
        coreContent: 'Pengisian kuesioner ini sangat krusial untuk melengkapi instrumen standardisasi mutu kelembagaan akademik pada kriteria kurikulum internasional.',
        closing: 'Atas perhatian dan kerja sama Saudara, kami ucapkan terima kasih.'
      }))
    } else if (type === 'Surat Tugas') {
      setFormData(prev => ({
        ...prev,
        letterNumber: 'ST-089/FEB-TelU/WADEK1/V/2026',
        subject: 'Surat Tugas Pengawasan Ujian Akhir Semester Ganjil 2025/2026',
        recipient: 'Segenap Dosen FEB Universitas Telkom',
        opening: 'Dalam rangka pelaksanaan Ujian Akhir Semester (UAS) Ganjil Tahun Akademik 2025/2026 di lingkungan Fakultas Ekonomi dan Bisnis Universitas Telkom, maka dengan ini Dekan Fakultas Ekonomi dan Bisnis memberikan tugas kepada:',
        coreContent: 'Nama: Dr. Ahmad Sidik, M.B.A. (NIP: 14850021)\nJabatan: Lektor Kepala / Dosen Tetap FEB\n\nUntuk bertindak selaku Pengawas Utama pada pelaksanaan UAS Ganjil yang akan diselenggarakan mulai tanggal 1 Juni 2026 s.d 12 Juni 2026 di ruang kelas gedung Manterawu.',
        closing: 'Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab dan dilaporkan perkembangannya.'
      }))
    } else if (type === 'Surat Undangan') {
      setFormData(prev => ({
        ...prev,
        letterNumber: 'SU-011/FEB-TelU/KAUR/V/2026',
        subject: 'Undangan Rapat Evaluasi Perkuliahan Tengah Semester',
        recipient: 'Yth. Bapak/Ibu Dosen Koordinator Mata Kuliah FEB',
        opening: 'Mengharap kehadiran Bapak/Ibu pada rapat koordinasi evaluasi perkuliahan yang akan dilaksanakan pada:',
        coreContent: 'Hari/Tanggal: Rabu, 27 Mei 2026\nWaktu: 09.00 - 11.30 WIB\nTempat: Ruang Rapat Manterawu lt. 2\nAgenda: Pembahasan kendala pengisian portal LMS dan rencana UAS.',
        closing: 'Mengingat pentingnya agenda rapat ini, kehadiran Bapak/Ibu sangat kami harapkan. Terima kasih.'
      }))
    } else if (type === 'Nota Dinas') {
      setFormData(prev => ({
        ...prev,
        letterNumber: 'ND-034/FEB-TelU/WADEK2/V/2026',
        subject: 'Nota Dinas: Pemeliharaan AC dan Fasilitas Ruang Kelas Gedung Manterawu',
        recipient: 'Yth. Kepala Bagian Logistik & Sarpras Universitas Telkom',
        opening: 'Sehubungan dengan masukan dari para dosen mengenai kenyamanan ruang kelas perkuliahan, kami mengajukan permohonan pemeliharaan AC.',
        coreContent: 'Kerusakan dilaporkan pada AC kelas MNT-201, MNT-202, dan MNT-205 yang kurang dingin serta mengalami kebocoran air.',
        closing: 'Demikian nota dinas ini kami sampaikan untuk dapat ditindaklanjuti. Terima kasih atas perhatiannya.'
      }))
    }
  }

  // Print function using print stylesheet
  const handlePrint = () => {
    window.print()
    toast.success('Membuka dialog cetak sistem...')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Editor sidebar */}
      <Card className="lg:col-span-2 border border-border/60 bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-1.5">
            <Settings2 className="w-5 h-5 text-primary" /> Pengaturan Isi Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <Label htmlFor="templateType" className="font-semibold text-xs text-muted-foreground">Tipe Dokumen</Label>
            <Select value={templateType} onValueChange={handleTemplateChange}>
              <SelectTrigger id="templateType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Surat Resmi">Surat Resmi (Official Letter)</SelectItem>
                <SelectItem value="Surat Tugas">Surat Tugas (Assignment)</SelectItem>
                <SelectItem value="Surat Undangan">Surat Undangan (Invitation)</SelectItem>
                <SelectItem value="Nota Dinas">Nota Dinas (Memo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="noSurat" className="font-semibold text-xs text-muted-foreground">Nomor Surat Resmi</Label>
              <Input
                id="noSurat"
                value={formData.letterNumber}
                onChange={e => setFormData({ ...formData, letterNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tglSurat" className="font-semibold text-xs text-muted-foreground">Tanggal Surat</Label>
              <Input
                id="tglSurat"
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="penerima" className="font-semibold text-xs text-muted-foreground">Tujuan Penerima</Label>
            <Input
              id="penerima"
              value={formData.recipient}
              onChange={e => setFormData({ ...formData, recipient: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="perihal" className="font-semibold text-xs text-muted-foreground">Perihal / Hal</Label>
            <Input
              id="perihal"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="salamPembuka" className="font-semibold text-xs text-muted-foreground">Salam Pembuka</Label>
            <Input
              id="salamPembuka"
              value={formData.salutation}
              onChange={e => setFormData({ ...formData, salutation: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paragrafPembuka" className="font-semibold text-xs text-muted-foreground">Paragraf Pembuka</Label>
            <Textarea
              id="paragrafPembuka"
              rows={3}
              value={formData.opening}
              onChange={e => setFormData({ ...formData, opening: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="isiUtama" className="font-semibold text-xs text-muted-foreground">Isi Utama Dokumen</Label>
            <Textarea
              id="isiUtama"
              rows={5}
              value={formData.coreContent}
              onChange={e => setFormData({ ...formData, coreContent: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paragrafPenutup" className="font-semibold text-xs text-muted-foreground">Paragraf Penutup</Label>
            <Textarea
              id="paragrafPenutup"
              rows={2}
              value={formData.closing}
              onChange={e => setFormData({ ...formData, closing: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="namaTtd" className="font-semibold text-xs text-muted-foreground">Nama Penandatangan</Label>
              <Input
                id="namaTtd"
                value={formData.signerName}
                onChange={e => setFormData({ ...formData, signerName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jabatanTtd" className="font-semibold text-xs text-muted-foreground">Jabatan Penandatangan</Label>
              <Input
                id="jabatanTtd"
                value={formData.signerTitle}
                onChange={e => setFormData({ ...formData, signerTitle: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handlePrint} className="w-full bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl mt-2 font-semibold">
            <Printer className="w-4 h-4" /> Cetak Dokumen A4
          </Button>
        </CardContent>
      </Card>

      {/* A4 Preview Screen */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" /> Preview Dokumen A4 Standar Internasional
          </span>
          <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Layout Siap Cetak
          </span>
        </div>

        {/* Paper Container */}
        <div 
          id="printable-letter-container" 
          className="border shadow-md bg-white text-black p-12 max-w-[210mm] mx-auto min-h-[297mm] font-serif leading-relaxed text-sm select-text"
        >
          {/* Header Kop Surat FEB */}
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6 gap-4">
            {/* Telkom University Red Logo Mock */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-red-600 flex flex-col items-center justify-center text-[10px] text-white font-black leading-none p-1.5">
                <span className="tracking-tighter">Telkom</span>
                <span className="text-[7px] mt-0.5 tracking-widest opacity-80">University</span>
              </div>
              <div className="text-left font-sans">
                <h2 className="text-md font-extrabold text-red-600 tracking-wide uppercase leading-tight">Universitas Telkom</h2>
                <h1 className="text-lg font-black text-slate-800 uppercase leading-tight">Fakultas Ekonomi dan Bisnis</h1>
                <p className="text-[9px] text-gray-500 font-semibold tracking-tighter mt-0.5 uppercase leading-none">
                  Gedung Manterawu, Jl. Telekomunikasi Terusan Buahbatu No. 1, Bandung
                </p>
              </div>
            </div>
            
            <div className="text-right font-sans text-[8px] text-gray-500 border-l pl-3 leading-tight hidden sm:block">
              <strong>Web:</strong> feb.telkomuniversity.ac.id<br />
              <strong>Email:</strong> feb@telkomuniversity.ac.id<br />
              <strong>ISO:</strong> 9001:2015 Cert.
            </div>
          </div>

          {/* Letter Info Block */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6">
            <div className="space-y-1">
              <div><strong>Nomor:</strong> {formData.letterNumber}</div>
              <div><strong>Hal:</strong> {formData.subject}</div>
              <div><strong>Lampiran:</strong> —</div>
            </div>
            <div className="text-right">
              <div>Bandung, {formatDate(formData.date)}</div>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="mb-6 text-xs font-semibold">
            {formData.recipient}
          </div>

          {/* Salutation */}
          <div className="mb-4">
            {formData.salutation}
          </div>

          {/* Opening Paragraph */}
          <p className="mb-4 text-justify indent-8 text-sm">
            {formData.opening}
          </p>

          {/* Core Content */}
          <div className="mb-4 text-sm whitespace-pre-wrap pl-8">
            {formData.coreContent}
          </div>

          {/* Closing Paragraph */}
          <p className="mb-10 text-justify indent-8 text-sm">
            {formData.closing}
          </p>

          {/* Signer Block */}
          <div className="flex justify-end pr-8">
            <div className="text-center w-64 text-sm">
              <p className="mb-20">{formData.signerTitle},</p>
              <p className="font-bold underline decoration-1 decoration-slate-900 leading-none">{formData.signerName}</p>
              <p className="text-xs text-gray-600 mt-1">NIP. {Math.floor(Math.random() * 8000000) + 1000000}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS @media print overrides for clean A4 printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-letter-container, #printable-letter-container * {
            visibility: visible;
          }
          #printable-letter-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      ` }} />
    </div>
  )
}

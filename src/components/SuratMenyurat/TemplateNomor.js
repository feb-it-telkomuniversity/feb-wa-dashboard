'use client'

import React, { useState, useEffect } from 'react'
import api from '@/lib/axios'
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
import { Printer, Settings2, FileText, CheckCircle2, Save, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import PrintableSuratA4 from './SuratKeluar/printable-surat-a4'

const defaultForm = {
  nomorSurat: '',
  jenisSurat: 'SuratResmi',
  kerahasiaan: 'Normal',
  tujuanPenerima: '',
  perihal: '',
  tanggalSurat: '',
  salamPembuka: '',
  paragrafPembuka: '',
  isiUtama: '',
  paragrafPenutup: '',
  namaPenandatangan: '',
  jabatanPenandatangan: ''
}

export default function TemplateNomor({ letters = [], onUpdateLetter }) {
  const [selectedId, setSelectedId] = useState('new') // 'new' for freeform, or ID for edit
  const [formData, setFormData] = useState(defaultForm)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch data if selectedId is not 'new'
  useEffect(() => {
    if (selectedId && selectedId !== 'new') {
      const fetchLetter = async () => {
        try {
          setIsLoading(true)
          const res = await api.get(`/api/administrasi-surat/surat-keluar/${selectedId}`)
          if (res.data?.success) {
            const d = res.data.data
            setFormData({
              nomorSurat: d.nomorSurat || '',
              jenisSurat: d.jenisSurat || 'SuratResmi',
              kerahasiaan: d.kerahasiaan || 'Normal',
              tujuanPenerima: d.tujuanPenerima || '',
              perihal: d.perihal || '',
              tanggalSurat: d.tanggalSurat ? new Date(d.tanggalSurat).toISOString().split('T')[0] : '',
              salamPembuka: d.salamPembuka || '',
              paragrafPembuka: d.paragrafPembuka || '',
              isiUtama: d.isiUtama || '',
              paragrafPenutup: d.paragrafPenutup || '',
              namaPenandatangan: d.namaPenandatangan || '',
              jabatanPenandatangan: d.jabatanPenandatangan || ''
            })
          }
        } catch (err) {
          console.error('Failed to fetch draft:', err)
          toast.error('Gagal mengambil data surat', {
            position: 'bottom-center',
            style: { background: "#fee2e2", color: "#991b1b" },
            className: "border border-red-500"
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchLetter()
    } else {
      setFormData(defaultForm)
    }
  }, [selectedId])

  const handleSave = async () => {
    if (selectedId === 'new') {
      toast.info('Simpan perubahan hanya berlaku untuk surat yang dipilih dari daftar.')
      return
    }

    try {
      setIsSaving(true)
      const payload = { ...formData }
      // format date if needed
      if (payload.tanggalSurat) {
        payload.tanggalSurat = new Date(payload.tanggalSurat).toISOString()
      } else {
        payload.tanggalSurat = null
      }

      const res = await api.put(`/api/administrasi-surat/surat-keluar/${selectedId}`, payload)

      if (res.data?.success) {
        toast.success('Yes... Template surat berhasil diperbarui', {
          position: 'bottom-center',
          style: { background: "#059669", color: "#d1fae5" },
          className: "border border-emerald-500",
        })
        if (onUpdateLetter) onUpdateLetter(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Yahh... Gagal memperbarui template', {
        position: 'bottom-center',
        style: { background: "#fee2e2", color: "#991b1b" },
        className: "border border-red-500"
      })
    } finally {
      setIsSaving(false)
    }
  }

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

  // Print function using print stylesheet
  const handlePrint = () => {
    window.print()
    toast.success('Membuka dialog cetak sistem...', {
      position: 'bottom-center',
    })
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

          <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
            <Label htmlFor="selectedId" className="font-semibold text-xs text-primary">Pilih Draft Surat Keluar</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger id="selectedId" className="w-full bg-white dark:bg-slate-900">
                <SelectValue placeholder="Pilih draft dari database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">-- Mode (Tanpa Simpan) --</SelectItem>
                {letters.map(l => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.nomorSurat || l.letterNumber || 'Draft'} - {l.perihal || l.subject || '-'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Memuat data surat...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="jenisSurat" className="font-semibold text-xs text-muted-foreground">Tipe Dokumen</Label>
                  <Select value={formData.jenisSurat} onValueChange={(val) => setFormData({ ...formData, jenisSurat: val })}>
                    <SelectTrigger id="jenisSurat" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SuratResmi">Surat Resmi</SelectItem>
                      <SelectItem value="SuratTugas">Surat Tugas</SelectItem>
                      <SelectItem value="SuratUndangan">Surat Undangan</SelectItem>
                      <SelectItem value="NotaDinas">Nota Dinas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kerahasiaan" className="font-semibold text-xs text-muted-foreground">Klasifikasi</Label>
                  <Select value={formData.kerahasiaan} onValueChange={(val) => setFormData({ ...formData, kerahasiaan: val })}>
                    <SelectTrigger id="kerahasiaan" className="w-full">
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nomorSurat" className="font-semibold text-xs text-muted-foreground">Nomor Surat</Label>
                  <Input
                    id="nomorSurat"
                    value={formData.nomorSurat}
                    onChange={e => setFormData({ ...formData, nomorSurat: e.target.value })}
                    disabled // Karena no surat di-generate oleh sistem saat approve
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tanggalSurat" className="font-semibold text-xs text-muted-foreground">Tanggal Surat</Label>
                  <Input
                    id="tanggalSurat"
                    type="date"
                    value={formData.tanggalSurat}
                    onChange={e => setFormData({ ...formData, tanggalSurat: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tujuanPenerima" className="font-semibold text-xs text-muted-foreground">Tujuan Penerima</Label>
                <Input
                  id="tujuanPenerima"
                  value={formData.tujuanPenerima}
                  onChange={e => setFormData({ ...formData, tujuanPenerima: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="perihal" className="font-semibold text-xs text-muted-foreground">Perihal / Hal</Label>
                <Input
                  id="perihal"
                  value={formData.perihal}
                  onChange={e => setFormData({ ...formData, perihal: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="salamPembuka" className="font-semibold text-xs text-muted-foreground">Salam Pembuka</Label>
                <Input
                  id="salamPembuka"
                  placeholder="Contoh: Dengan hormat,"
                  value={formData.salamPembuka}
                  onChange={e => setFormData({ ...formData, salamPembuka: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paragrafPembuka" className="font-semibold text-xs text-muted-foreground">Paragraf Pembuka</Label>
                <Textarea
                  id="paragrafPembuka"
                  rows={3}
                  value={formData.paragrafPembuka}
                  onChange={e => setFormData({ ...formData, paragrafPembuka: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="isiUtama" className="font-semibold text-xs text-muted-foreground">Isi Utama Dokumen</Label>
                <Textarea
                  id="isiUtama"
                  rows={5}
                  value={formData.isiUtama}
                  onChange={e => setFormData({ ...formData, isiUtama: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paragrafPenutup" className="font-semibold text-xs text-muted-foreground">Paragraf Penutup</Label>
                <Textarea
                  id="paragrafPenutup"
                  rows={2}
                  value={formData.paragrafPenutup}
                  onChange={e => setFormData({ ...formData, paragrafPenutup: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="namaPenandatangan" className="font-semibold text-xs text-muted-foreground">Nama Penandatangan</Label>
                  <Input
                    id="namaPenandatangan"
                    value={formData.namaPenandatangan}
                    onChange={e => setFormData({ ...formData, namaPenandatangan: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jabatanPenandatangan" className="font-semibold text-xs text-muted-foreground">Jabatan Penandatangan</Label>
                  <Input
                    id="jabatanPenandatangan"
                    value={formData.jabatanPenandatangan}
                    onChange={e => setFormData({ ...formData, jabatanPenandatangan: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-2 border-t">
                {selectedId !== 'new' && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="outline"
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 gap-2 rounded-xl"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Perubahan
                  </Button>
                )}
                <Button onClick={handlePrint} className="flex-1 bg-primary hover:bg-primary/95 text-white gap-2 rounded-xl">
                  <Printer className="w-4 h-4" /> Cetak Dokumen A4
                </Button>
              </div>
            </>
          )}
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
        <PrintableSuratA4 formData={formData} />
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Calendar,
  User,
  Building,
  PenTool,
  Fingerprint,
  Paperclip,
  ArrowLeft,
  Award,
  Clock,
  History,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function PublicVerifikasiDokumenPage() {
  const params = useParams()
  const router = useRouter()
  const [record, setRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Status mapping helper
  const mapStatusToFrontend = (status) => {
    if (status === 'Menunggu TTD' || status === 'SUBMITTED') return 'Pending';
    if (status === 'Selesai TTD' || status === 'SIGNED') return 'Signed';
    if (status === 'Ditolak/Revisi' || status === 'REJECTED') return 'Rejected';
    return status;
  }

  // Map backend object to expected UI model
  const mapBackendToFrontend = (rec) => {
    return {
      id: rec.id,
      refNumber: rec.nomorDokumen || '-',
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
      timeline: (rec.histories || []).map(h => ({
        status: mapStatusToFrontend(h.actionType),
        date: h.createdAt ? new Date(h.createdAt).toISOString().replace('T', ' ').substring(0, 16) : '',
        actor: h.actor?.name || 'Sistem',
        note: h.message || ''
      }))
    }
  }

  useEffect(() => {
    if (!params.id) return

    const fetchDocument = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get(`/api/public/log-ttd-dekan/${params.id}`)
        if (response.data?.success) {
          setRecord(mapBackendToFrontend(response.data.data))
        } else {
          setError('Dokumen tidak ditemukan atau tidak valid')
        }
      } catch (err) {
        console.error('Error fetching public doc:', err)
        setError('Gagal menghubungkan ke server verifikasi MIRA')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
          Memverifikasi tanda tangan elektronik di server MIRA...
        </p>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-500/20 rounded-3xl p-6 text-center shadow-xl space-y-4">
          <div className="mx-auto w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Verifikasi Gagal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {error || 'Data otorisasi dokumen tidak ditemukan di dalam sistem MIRA FEB.'}
          </p>
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-primary hover:bg-[#c41a20] text-primary-foreground rounded-xl h-11"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    )
  }

  const isSigned = record.status === 'Signed'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* MIRA Banner Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-primary tracking-wider">MIRA E-SIGN</span>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Telkom University</p>
            </div>
          </div>
          <span className="text-xs font-bold font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
            E-Sign Verifier v1.0
          </span>
        </div>

        {/* Verification Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={`border rounded-3xl overflow-hidden shadow-md ${
            isSigned 
              ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10' 
              : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10'
          }`}>
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-5">
              <div className={`p-4 rounded-2xl shrink-0 ${
                isSigned ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {isSigned ? <ShieldCheck className="w-12 h-12" /> : <ShieldAlert className="w-12 h-12" />}
              </div>
              <div className="space-y-2 text-center md:text-left flex-1">
                <Badge className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  isSigned 
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
                }`}>
                  {isSigned ? 'Terverifikasi Asli' : 'Dalam Proses / Tertunda'}
                </Badge>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                  {isSigned 
                    ? 'Dokumen Resmi Terverifikasi Asli' 
                    : 'Dokumen Belum Ditandatangani / Diperiksa'}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {isSigned 
                    ? `Dokumen ini sah dan telah ditandatangani secara digital oleh Dekan Fakultas Ekonomi dan Bisnis (FEB) Telkom University.`
                    : `Dokumen ini sedang berada dalam antrean penandatanganan atau telah dikembalikan untuk revisi.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metadata Details Card */}
        <Card className="border border-border bg-card shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/20">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-500" /> Detail Informasi Dokumen
            </CardTitle>
            <CardDescription className="text-xs">Metadata dokumen resmi yang terdaftar di basis data MIRA FEB.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs md:text-sm">
            <div className="col-span-1 md:col-span-2 space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Judul / Perihal Dokumen:</span>
              <p className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base leading-snug">{record.documentName}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5 font-mono">NO. DOKUMEN:</span>
              <p className="font-mono font-bold text-sky-600 dark:text-sky-400">{record.refNumber}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Jenis Dokumen:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{record.documentType}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Pengaju Otorisasi:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{record.requester}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Unit Kerja Asal:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{record.unit}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5" /> Metode Tanda Tangan:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{record.signatureMethod}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Tanggal Diajukan:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {new Date(record.submissionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {record.signedDate && (
              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-emerald-600"><Calendar className="w-3.5 h-3.5" /> Tanggal Tanda Tangan:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {new Date(record.signedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}

            {isSigned && record.certHash && (
              <div className="col-span-1 md:col-span-2 space-y-1.5 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
                  <Fingerprint className="w-3.5 h-3.5" /> SHA256 Digital Certificate Hash:
                </span>
                <p className="font-mono text-[11px] md:text-xs text-slate-700 dark:text-slate-300 break-all select-all font-semibold">
                  {record.certHash}
                </p>
              </div>
            )}

            {record.attachmentUrl && (
              <div className="col-span-1 md:col-span-2 mt-2 p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 rounded-xl border border-sky-100 dark:border-sky-950/40 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span className="font-semibold truncate text-xs md:text-sm flex-1">Lampiran Berkas: {record.attachmentName}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(record.attachmentUrl, '_blank')}
                  className="h-8 text-xs font-semibold bg-white dark:bg-slate-900 border-sky-200/50 hover:bg-sky-50 hover:text-sky-800 rounded-lg shrink-0 flex items-center gap-1 shadow-sm"
                >
                  Unduh Berkas <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline / Audit Trail Card */}
        <Card className="border border-border bg-card shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/20">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-sky-500" /> Audit Trail - Riwayat Pelacakan Otorisasi
            </CardTitle>
            <CardDescription className="text-xs">Log audit trail penjamin otentisitas rekam jejak sesuai standar ISO 15489.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-5 ml-2.5 space-y-6">
              {record.timeline.map((event, index) => (
                <div key={index} className="relative">
                  <span className={`absolute -left-[27.5px] top-1.5 rounded-full p-1 border bg-background shrink-0 shadow-sm ${
                    event.status === 'Signed' ? 'text-emerald-500 border-emerald-500/30' :
                    event.status === 'Rejected' ? 'text-rose-500 border-rose-500/30' :
                    event.status === 'Verified' ? 'text-sky-500 border-sky-500/30' :
                    'text-slate-400 border-slate-200'
                  }`}>
                    {event.status === 'Signed' ? <CheckCircle className="w-3.5 h-3.5" /> :
                     event.status === 'Rejected' ? <XCircle className="w-3.5 h-3.5" /> :
                     <FileText className="w-3.5 h-3.5" />}
                  </span>
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs md:text-sm font-bold text-foreground">
                        {event.status === 'Submitted' ? 'Dokumen Diajukan' :
                         event.status === 'Verified' ? 'Verifikasi Kelayakan' :
                         event.status === 'Signed' ? 'Tanda Tangan Dibubuhkan' :
                         event.status === 'Rejected' ? 'Ditolak / Perlu Revisi' : event.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-medium">
                        {event.date}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">Aktor: {event.actor}</p>
                    {event.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 italic leading-relaxed bg-slate-100/50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-200/40 dark:border-slate-800/40">
                        {event.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[10px] md:text-xs text-slate-400 dark:text-slate-500 space-y-1 pt-4">
          <p>© 2026 MIRA E-Sign FEB Telkom University. All rights reserved.</p>
          <p>Layanan Verifikasi Elektronik Standar Keaslian Audit Trail ISO 15489 & ISO 27001.</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import api from '@/lib/axios'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ClipboardList,
    AlertTriangle,
    FolderOpen,
    Loader2,
    CheckCircle2,
    Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import DeleteDisposisi from './DisposisiSurat/delete-disposisi'

export default function DisposisiLogs({ dispositions = [], letters = [], onUpdateStatus, onDeleteDisp }) {
  
  // Find related letter info for each disposition
  const mappedDispositions = (dispositions || []).map(disp => {
    const letter = (letters || []).find(l => String(l.id) === String(disp.letterId) || String(l.id) === String(disp.suratMasukId))
    return {
      ...disp,
      letterNumber: letter ? (letter.letterNumber || letter.nomorSuratAsal || 'N/A') : (disp.suratMasuk ? disp.suratMasuk.nomorSuratAsal : 'N/A'),
      subject: letter ? (letter.subject || letter.perihal || 'Surat dihapus') : (disp.suratMasuk ? disp.suratMasuk.perihal : 'Surat dihapus'),
      classification: letter ? (letter.classification || letter.kerahasiaan || 'Normal') : 'Normal',
      fromRole: disp.fromRole || (disp.pemberi ? disp.pemberi.name : 'N/A'),
      toRole: disp.toRole || (disp.penerimaUnit ? disp.penerimaUnit.name : 'N/A'),
      deadline: disp.deadline || disp.batasWaktu,
      notes: disp.notes || disp.catatan,
      instruction: disp.instruction || disp.instruksi || 'Tindak Lanjuti',
      status: disp.status === 'Diproses' ? 'Sedang Diproses' : (disp.status === 'BelumDiproses' ? 'Belum Diproses' : (disp.status || 'Belum Diproses'))
    }
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selesai':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Selesai</Badge>
      case 'Sedang Diproses':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Diproses</Badge>
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Belum Diproses</Badge>
    }
  }

  const handleToggleStatus = (id, currentStatus) => {
    let nextStatus = 'Sedang Diproses'
    if (currentStatus === 'Belum Diproses') nextStatus = 'Sedang Diproses'
    else if (currentStatus === 'Sedang Diproses') nextStatus = 'Selesai'
    else nextStatus = 'Belum Diproses'

    onUpdateStatus(id, nextStatus)
    toast.success(`Status tindak lanjut disposisi diubah menjadi: ${nextStatus}`)
  }

  // Check if deadline is overdue
  const isOverdue = (dateStr, status) => {
    if (status === 'Selesai' || !dateStr) return false
    const today = new Date()
    today.setHours(0,0,0,0)
    const deadline = new Date(dateStr)
    return deadline < today
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-primary" /> Log Delegasi & Disposisi Aktif
        </h3>
      </div>

      <div className="rounded-xl border border-border bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
          <Table className="w-full table-fixed min-w-[980px]">
            <TableHeader className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10 border-b">
              <TableRow>
                <TableHead className="w-[15%] min-w-[125px] font-bold text-xs">No. Surat Masuk</TableHead>
                <TableHead className="w-[17%] min-w-[140px] font-bold text-xs">Perihal</TableHead>
                <TableHead className="w-[10%] min-w-[90px] font-bold text-xs">Pemberi</TableHead>
                <TableHead className="w-[12%] min-w-[105px] font-bold text-xs">Penerima Disposisi</TableHead>
                <TableHead className="w-[18%] min-w-[140px] font-bold text-xs">Instruksi / Catatan</TableHead>
                <TableHead className="w-[10%] min-w-[95px] font-bold text-xs">Batas Waktu</TableHead>
                <TableHead className="w-[8%] min-w-[80px] font-bold text-xs">Status</TableHead>
                <TableHead className="w-[10%] min-w-[95px] text-right font-bold text-xs pr-4">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappedDispositions.map((disp) => {
                const overdue = isOverdue(disp.deadline, disp.status)

                return (
                  <TableRow key={disp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <TableCell className="font-mono text-xs font-semibold truncate py-2.5" title={disp.letterNumber}>
                      {disp.letterNumber}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="font-semibold text-xs truncate" title={disp.subject}>{disp.subject}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground truncate py-2.5" title={disp.fromRole}>
                      {disp.fromRole}
                    </TableCell>
                    <TableCell className="font-medium truncate py-2.5 text-xs" title={disp.toRole}>
                      {disp.toRole}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-primary truncate" title={disp.instruction}>{disp.instruction}</div>
                        {disp.notes && (
                          <div className="text-[11px] text-muted-foreground truncate mt-0.5" title={disp.notes}>{disp.notes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium whitespace-nowrap py-2.5">
                      <div className="flex flex-col">
                        <span>{disp.deadline ? new Date(disp.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                        {overdue && (
                          <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Terlambat!
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">{getStatusBadge(disp.status)}</TableCell>
                    <TableCell className="text-right pr-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(disp.id, disp.status)}
                          className="h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-primary gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Progress
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Hapus log disposisi ini?')) {
                              onDeleteDisp(disp.id)
                              toast.success('Log disposisi dihapus.')
                            }
                          }}
                          className="h-7 w-7 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {mappedDispositions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
                      <span>Belum ada disposisi surat masuk yang tercatat.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

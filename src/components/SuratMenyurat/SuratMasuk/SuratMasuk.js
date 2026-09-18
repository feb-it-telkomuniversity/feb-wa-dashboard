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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import AddSuratMasuk from './add-surat-masuk'
import EditSuratMasuk from './edit-surat-masuk'
import DeleteSuratMasuk from './delete-surat-masuk'
import DetailSuratMasuk from './detail-surat-masuk'
import AddDisposisi from '../DisposisiSurat/add-disposisi'

export default function SuratMasuk({ letters = [], onAddLetter, onUpdateLetter, onDeleteLetter, onAddDisposition }) {
    const [search, setSearch] = useState('')
    const [filterClassification, setFilterClassification] = useState('all')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDispOpen, setIsDispOpen] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [selectedLetter, setSelectedLetter] = useState(null)
    const [selectedDetailLetter, setSelectedDetailLetter] = useState(null)
    const [editSuratId, setEditSuratId] = useState(null)

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
        if (status === 'Disposed' || status === 'Didisposisikan' || status === 'BelumDiproses') {
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
                <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
                    <Table className="w-full table-fixed min-w-[950px]">
                        <TableHeader className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10 border-b">
                            <TableRow>
                                <TableHead className="w-[16%] min-w-[130px] font-bold text-xs">No. Surat</TableHead>
                                <TableHead className="w-[16%] min-w-[130px] font-bold text-xs">Pengirim</TableHead>
                                <TableHead className="w-[24%] min-w-[180px] font-bold text-xs">Perihal / Ringkasan</TableHead>
                                <TableHead className="w-[9%] min-w-[85px] font-bold text-xs">Klasifikasi</TableHead>
                                <TableHead className="w-[10%] min-w-[95px] font-bold text-xs">Tgl Terima</TableHead>
                                <TableHead className="w-[11%] min-w-[105px] font-bold text-xs">Status</TableHead>
                                <TableHead className="w-[14%] min-w-[135px] text-right font-bold text-xs pr-4">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLetters.map((letter) => (
                                <TableRow
                                    key={letter.id}
                                    onClick={() => {
                                        setSelectedDetailLetter(letter)
                                        setIsDetailOpen(true)
                                    }}
                                    className="hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer transition-colors group"
                                    title="Klik untuk melihat informasi lengkap surat"
                                >
                                    <TableCell className="font-mono text-xs font-semibold truncate py-2.5" title={letter.nomorSuratAsal || letter.letterNumber}>
                                        {letter.nomorSuratAsal || letter.letterNumber}
                                    </TableCell>
                                    <TableCell className="font-medium py-2.5">
                                        <div className="line-clamp-2 text-xs" title={letter.instansiPengirim || letter.sender}>
                                            {letter.instansiPengirim || letter.sender}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2.5">
                                        <div className="min-w-0">
                                            <div className="font-semibold text-xs truncate" title={letter.perihal || letter.subject}>
                                                {letter.perihal || letter.subject}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground truncate mt-0.5" title={letter.ringkasan || letter.summary}>
                                                {letter.ringkasan || letter.summary}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2.5">
                                        <Badge className={`${getBadgeColor(letter.kerahasiaan || letter.classification)} text-[10px] px-1.5 py-0.5 whitespace-nowrap`}>
                                            {letter.kerahasiaan || letter.classification}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-medium whitespace-nowrap py-2.5">
                                        {letter.tanggalDiterima || letter.dateReceived
                                            ? new Date(letter.tanggalDiterima || letter.dateReceived).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="py-2.5 whitespace-nowrap">{getStatusBadge(letter.status)}</TableCell>
                                    <TableCell className="text-right pr-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1 shrink-0">
                                            {/* Edit */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditSuratId(letter.id)
                                                    setIsEditOpen(true)
                                                }}
                                                title="Edit Surat Masuk"
                                                className="h-7 w-7 text-amber-500 hover:bg-amber-500/10 rounded-lg shrink-0"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            {/* Disposisi */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedLetter(letter)
                                                    setIsDispOpen(true)
                                                }}
                                                title="Disposisi Surat"
                                                className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg shrink-0"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" />
                                            </Button>
                                            {/* Lihat Lampiran */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (letter.linkPdf) {
                                                        window.open(letter.linkPdf, '_blank')
                                                    } else {
                                                        toast.info('Tidak ada lampiran tersedia untuk surat ini.')
                                                    }
                                                }}
                                                title="Lihat Lampiran"
                                                className="h-7 w-7 text-blue-500 hover:bg-blue-500/10 rounded-lg shrink-0"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                            </Button>
                                            {/* Hapus */}
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

            <DetailSuratMasuk
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                letter={selectedDetailLetter}
                onOpenDisposisi={(letter) => {
                    setSelectedLetter(letter)
                    setIsDispOpen(true)
                }}
                onOpenEdit={(letter) => {
                    setEditSuratId(letter.id)
                    setIsEditOpen(true)
                }}
            />

            <AddDisposisi
                open={isDispOpen}
                onOpenChange={setIsDispOpen}
                suratMasuk={selectedLetter}
                onSuccess={onAddDisposition}
            />
        </div>
    )
}

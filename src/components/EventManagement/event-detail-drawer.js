'use client'

import { useState, useEffect } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    CalendarDays,
    Clock,
    MapPin,
    Building2,
    Users,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    ClipboardList,
    FileEdit,
    Send
} from 'lucide-react'
import { formatCamelCaseLabel } from '@/lib/utils'
import EventChecklist from './event-checklist'
import EventReportForm from './event-report-form'
import { PHASES, PRIORITIES } from '@/hooks/use-event-management'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EventDetailDrawer({
    activity,
    isOpen,
    onClose,
    updatePhase,
    updatePriority,
    updateChecklist,
    updateNotes,
    updateReport,
    defaultTab = 'details'
}) {
    const [activeTab, setActiveTab] = useState('details')
    const [noteText, setNoteText] = useState('')
    const [user, setUser] = useState(null)

    // Synchronize activeTab when isOpen or defaultTab changes
    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab)
        }
    }, [isOpen, defaultTab])

    // Load current user for comment signature
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('auth_user')
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser))
                } catch (e) {
                    console.error("Failed to parse user", e)
                }
            }
        }
    }, [])

    if (!activity) return null

    const handleAddNote = (e) => {
        e.preventDefault()
        if (!noteText.trim()) return

        const newNote = {
            id: Date.now().toString(),
            author: user?.name || 'User MIRA',
            avatar: user?.avatarUrl || '',
            text: noteText.trim(),
            timestamp: new Date().toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        updateNotes(activity.id, [...(activity.notes || []), newNote])
        setNoteText('')
    }

    const handlePhaseChange = (val) => {
        updatePhase(activity.id, val)
    }

    const handlePriorityChange = (val) => {
        updatePriority(activity.id, val)
    }

    const getPriorityBadgeColor = (p) => {
        switch (p) {
            case PRIORITIES.HIGH:
                return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200'
            case PRIORITIES.LOW:
                return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200'
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-200'
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col h-full p-0">
                <SheetHeader className="p-5 border-b shrink-0">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityBadgeColor(activity.priority)}>
                            Prioritas: {activity.priority}
                        </Badge>
                        <Badge className="bg-primary text-white">
                            {activity.phase}
                        </Badge>
                    </div>
                    <SheetTitle className="text-xl font-bold text-foreground truncate mt-1">
                        {activity.namaKegiatan}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground truncate">
                        Diajukan oleh Unit: {formatCamelCaseLabel(activity.unit)}
                    </SheetDescription>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-5 border-b shrink-0 bg-muted/40">
                        <TabsList className="grid grid-cols-3 w-full my-2 bg-muted">
                            <TabsTrigger value="details" className="text-xs gap-1">
                                <ClipboardList className="h-3.5 w-3.5" />
                                Info & Persiapan
                            </TabsTrigger>
                            <TabsTrigger value="comments" className="text-xs gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Catatan ({activity.notes?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="report" className="text-xs gap-1">
                                <FileEdit className="h-3.5 w-3.5" />
                                Laporan
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                        {/* TAB 1: DETAILS & CHECKLIST */}
                        <TabsContent value="details" className="mt-0 space-y-6">
                            {/* Quick Controls */}
                            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-border/60">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Prioritas</Label>
                                    <Select value={activity.priority} onValueChange={handlePriorityChange}>
                                        <SelectTrigger className="h-8 text-xs bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={PRIORITIES.LOW}>Rendah</SelectItem>
                                            <SelectItem value={PRIORITIES.MEDIUM}>Sedang</SelectItem>
                                            <SelectItem value={PRIORITIES.HIGH}>Tinggi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Fase Acara</Label>
                                    <Select value={activity.phase} onValueChange={handlePhaseChange}>
                                        <SelectTrigger className="h-8 text-xs bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={PHASES.PLANNING}>Perencanaan</SelectItem>
                                            <SelectItem value={PHASES.PREPARATION}>Persiapan</SelectItem>
                                            <SelectItem value={PHASES.EXECUTION}>Pelaksanaan</SelectItem>
                                            <SelectItem value={PHASES.EVALUATION}>Evaluasi</SelectItem>
                                            <SelectItem value={PHASES.COMPLETED}>Selesai</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="space-y-3.5">
                                <h4 className="text-sm font-semibold text-foreground">Detail Kegiatan</h4>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-start gap-2.5 text-sm">
                                        <CalendarDays className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block leading-tight">Tanggal</span>
                                            <span className="font-medium">
                                                {activity.tanggal} {activity.tanggalBerakhir ? `s.d ${activity.tanggalBerakhir}` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-sm">
                                        <Clock className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block leading-tight">Waktu</span>
                                            <span className="font-medium">{activity.waktuMulai} - {activity.waktuSelesai} WIB</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-sm">
                                        <MapPin className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block leading-tight">Lokasi / Ruangan</span>
                                            <span className="font-medium">
                                                {activity.ruangan === 'Lainnya' ? activity.locationDetail : formatCamelCaseLabel(activity.ruangan)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-sm">
                                        <Building2 className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block leading-tight">Unit Penyelenggara</span>
                                            <span className="font-medium">
                                                {activity.unit === 'Lainnya' ? activity.otherUnit : formatCamelCaseLabel(activity.unit)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-sm">
                                        <Users className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-muted-foreground block leading-tight">Jumlah Target Peserta</span>
                                            <span className="font-medium">{activity.jumlahPeserta} Orang</span>
                                        </div>
                                    </div>
                                </div>

                                {activity.keterangan && (
                                    <div className="mt-2 bg-muted/20 p-3 rounded-md border border-dashed">
                                        <span className="text-xs font-semibold block text-muted-foreground mb-1">Deskripsi/Keterangan:</span>
                                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{activity.keterangan}</p>
                                    </div>
                                )}
                            </div>

                            <hr className="border-border/60" />

                            {/* Checklist Widget */}
                            <EventChecklist 
                                checklist={activity.checklist} 
                                onUpdate={(items) => updateChecklist(activity.id, items)} 
                            />
                        </TabsContent>

                        {/* TAB 2: COMMENTS & NOTES */}
                        <TabsContent value="comments" className="mt-0 flex flex-col h-full space-y-4">
                            {/* List Catatan */}
                            <div className="flex-1 space-y-3 pr-1 max-h-[24rem] overflow-y-auto">
                                {activity.notes?.map((note) => (
                                    <div key={note.id} className="p-3 bg-muted/40 rounded-lg border border-border/40 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-foreground/90">{note.author}</span>
                                            <span className="text-[10px] text-muted-foreground">{note.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-normal">{note.text}</p>
                                    </div>
                                ))}

                                {(!activity.notes || activity.notes.length === 0) && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <MessageSquare className="h-10 w-10 mx-auto opacity-30 mb-2" />
                                        <p className="text-sm">Belum ada catatan tim. Tulis catatan persiapan/koordinasi di bawah.</p>
                                    </div>
                                )}
                            </div>

                            {/* Form Input */}
                            <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t mt-auto shrink-0">
                                <Input 
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Tulis update persiapan / catatan koordinasi..."
                                    className="h-9 text-sm"
                                />
                                <Button type="submit" size="icon" className="h-9 w-9">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </TabsContent>

                        {/* TAB 3: POST-EVENT REPORT */}
                        <TabsContent value="report" className="mt-0">
                            <EventReportForm 
                                activity={activity} 
                                onSave={(rep) => updateReport(activity.id, rep)} 
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}

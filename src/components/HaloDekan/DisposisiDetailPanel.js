import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    TicketIcon,
    CalendarIcon,
    UserCircle2,
    MessageSquare,
    Save,
    Send,
    CheckCircle2
} from "lucide-react";
import AttachmentGallery from "@/components/HaloDekan/AttachmentGallery";

export default function DisposisiDetailPanel({
    selectedTicket,
    usersList,
    isUpdating,
    assignForm,
    setAssignForm,
    approveForm,
    setApproveForm,
    handleAssignSubmit,
    handleApproveSubmit,
    getStatusBadge,
    formatDate
}) {
    if (!selectedTicket) {
        return (
            <div className="w-full lg:w-[68%] flex flex-col min-h-0 bg-card border border-border/50 rounded-xl shadow-md overflow-hidden shrink-0 relative">
                <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                        <TicketIcon className="h-10 w-10 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Tidak Ada Tiket Terpilih</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                        Silakan pilih salah satu tiket dari panel sebelah kiri untuk meninjau laporan dan memberikan instruksi (Disposisi).
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full lg:w-[68%] flex flex-col min-h-0 bg-card border border-border/50 rounded-xl shadow-md overflow-hidden shrink-0 relative">
            <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Header Panel Detail */}
                <div className="border-b border-border p-5 bg-background shrink-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold font-mono text-primary">{selectedTicket.ticketCode}</h2>
                            {getStatusBadge(selectedTicket.status)}
                        </div>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{selectedTicket.category}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(selectedTicket.createdAt, true)}
                        </span>
                    </div>
                </div>

                {/* Scrollable Content Detail */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-card/50">
                    <div className="space-y-6">

                        {/* Data Pelapor */}
                        <Card className="shadow-none border-border/60 bg-muted/10">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <UserCircle2 className="h-7 w-7 text-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-foreground truncate">{selectedTicket.user?.name || "User Tidak Diketahui"}</span>
                                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider mt-1 w-fit bg-primary/10 px-2 py-0.5 rounded-full">
                                        Pelapor
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deskripsi */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Detail Laporan Pengaduan
                            </Label>
                            <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                                {selectedTicket.description || "Tidak ada deskripsi rinci."}
                            </div>
                        </div>

                        {/* Lampiran Menggunakan Gallery */}
                        <AttachmentGallery urls={selectedTicket.attachmentUrl} />

                        {/* Data Penyelesaian dari Unit (Jika ada) */}
                        {selectedTicket.assignedToId && (selectedTicket.resolutionNote || (selectedTicket.resolutionProofUrls && selectedTicket.resolutionProofUrls.length > 0)) && (
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 space-y-4 my-6">
                                <h4 className="text-base font-bold text-blue-500 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Tindak Lanjut dari: {selectedTicket.assignedTo?.name || "Unit Terkait"}
                                </h4>

                                {selectedTicket.resolutionNote && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground block">Catatan Penyelesaian</Label>
                                        <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                            {selectedTicket.resolutionNote}
                                        </div>
                                    </div>
                                )}

                                {selectedTicket.resolutionProofUrls && selectedTicket.resolutionProofUrls.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-semibold text-foreground mb-2 block">Dokumentasi / Bukti</Label>
                                        <AttachmentGallery urls={selectedTicket.resolutionProofUrls} />
                                    </div>
                                )}
                            </div>
                        )}

                        <hr className="border-border/60" />

                        {/* FORM CONDITIONAL (ASSIGN OR APPROVE) */}
                        <div className="space-y-5 pb-4">
                            {selectedTicket.status === "EscalatedToDean" && (
                                <>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Disposisi & Penugasan</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Tentukan unit mana yang bertanggung jawab untuk menangani aduan ini.
                                        </p>
                                    </div>

                                    <form id="assign-form" onSubmit={handleAssignSubmit} className="space-y-5 bg-background p-5 rounded-xl border border-primary/20 shadow-sm ring-1 ring-primary/5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="assignUser">Tugaskan Laporan Ini Kepada *</Label>
                                            <Select
                                                value={assignForm.assignedToId}
                                                onValueChange={(val) => setAssignForm(prev => ({ ...prev, assignedToId: val }))}
                                            >
                                                <SelectTrigger className="w-full bg-background border-primary/30">
                                                    <SelectValue placeholder="Pilih Penanggung Jawab / Unit (misal: Kaur Akademik)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {usersList.length > 0 ? (
                                                        usersList.map((user) => (
                                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                                {user.name} <span className="text-muted-foreground uppercase text-[10px] ml-2">({user.role})</span>
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="loading" disabled>Memuat user...</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="assignNote">Arahan Tambahan (Opsional)</Label>
                                            <Textarea
                                                id="assignNote"
                                                placeholder="Berikan instruksi khusus kepada unit yang ditunjuk terkait penyelesaian masalah ini..."
                                                value={assignForm.actionNote}
                                                onChange={(e) => setAssignForm(prev => ({ ...prev, actionNote: e.target.value }))}
                                                rows={3}
                                                className="bg-background"
                                            />
                                        </div>
                                    </form>
                                </>
                            )}

                            {selectedTicket.status === "WaitingDeanApproval" && (
                                <>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Persetujuan Evaluasi Akhir</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Unit terkait telah memberikan laporannya. Keputusan penyelesaian ada di tangan Anda.
                                        </p>
                                    </div>

                                    <form id="approve-form" onSubmit={handleApproveSubmit} className="space-y-5 bg-background p-5 rounded-xl border border-primary/20 shadow-sm ring-1 ring-primary/5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="approveStatus">Keputusan Dekan *</Label>
                                            <Select
                                                value={approveForm.status}
                                                onValueChange={(val) => setApproveForm(prev => ({ ...prev, status: val }))}
                                            >
                                                <SelectTrigger className="w-full bg-background border-primary/30">
                                                    <SelectValue placeholder="Pilih keputusan (ACC / Revisi)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Resolved">Setujui & Selesaikan (Resolved)</SelectItem>
                                                    <SelectItem value="RevisionNeeded">Tolak & Minta Revisi Laporan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="approveNote">Catatan Dekan</Label>
                                            <Textarea
                                                id="approveNote"
                                                placeholder="Berikan alasan apabila meminta revisi atau ucapan penyelesaian..."
                                                value={approveForm.actionNote}
                                                onChange={(e) => setApproveForm(prev => ({ ...prev, actionNote: e.target.value }))}
                                                rows={3}
                                                className="bg-background"
                                            />
                                        </div>
                                    </form>
                                </>
                            )}

                            {(!["EscalatedToDean", "WaitingDeanApproval"].includes(selectedTicket.status)) && (
                                <div className="bg-muted/10 p-4 rounded-xl border border-border text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Status tiket ini adalah <strong>{selectedTicket.status}</strong> dan tidak memerlukan pengambilan aksi lebih lanjut dari pihak Dekan saat ini.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                {["EscalatedToDean", "WaitingDeanApproval"].includes(selectedTicket.status) && (
                    <div className="border-t border-border p-4 bg-background shrink-0 flex items-center justify-end gap-3 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                        <Button
                            type="submit"
                            form={selectedTicket.status === "EscalatedToDean" ? "assign-form" : "approve-form"}
                            disabled={isUpdating}
                            className="bg-primary hover:bg-[#c41a20]"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : selectedTicket.status === "EscalatedToDean" ? (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Tugaskan Instrusksi
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Konfirmasi Keputusan
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

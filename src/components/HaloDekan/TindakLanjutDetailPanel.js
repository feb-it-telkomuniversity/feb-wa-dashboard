import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2,
    TicketIcon,
    CalendarIcon,
    UserCircle2,
    MessageSquare,
    Send,
    ClockCheck
} from "lucide-react";
import AttachmentGallery from "@/components/HaloDekan/AttachmentGallery";
import AttachmentUpload from "@/components/HaloDekan/AttachmentUpload";

export default function TindakLanjutDetailPanel({
    selectedTicket,
    isUpdating,
    resolutionForm,
    setResolutionForm,
    handleResolveSubmit,
    resolutionFiles,
    setResolutionFiles,
    getStatusBadge,
    formatDate
}) {
    if (!selectedTicket) {
        return (
            <div className="w-full lg:w-[65%] flex flex-col min-h-0 bg-card border border-border/50 rounded-xl shadow-md overflow-hidden shrink-0 relative">
                <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                        <TicketIcon className="h-10 w-10 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Tidak Ada Tiket Terpilih</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                        Silakan pilih salah satu tiket dari panel sebelah kiri untuk meninjau laporan mahasiswa dan memberikan bukti penyelesaian.
                    </p>
                </div>
            </div>
        );
    }

    const needsAction = ["AssignedToUnit", "RevisionNeeded"].includes(selectedTicket.status);

    return (
        <div className="w-full lg:w-[65%] flex flex-col min-h-0 bg-card border border-border/50 rounded-xl shadow-md overflow-hidden shrink-0 relative">
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

                        {/* Arahan Dekan (Jika Ada) */}
                        {selectedTicket.actionNote && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-orange-600 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    {selectedTicket.status === "RevisionNeeded" ? "Catatan Revisi dari Dekan" : "Instruksi dari Dekan"}
                                </Label>
                                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                                    {selectedTicket.actionNote}
                                </p>
                            </div>
                        )}

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

                        {/* Deskripsi Laporan Mahasiswa */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Isi Laporan
                            </Label>
                            <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                                {selectedTicket.description || "Tidak ada deskripsi rinci."}
                            </div>
                        </div>

                        {/* Bukti Lampiran dari Mahasiswa */}
                        {selectedTicket.attachmentUrl && selectedTicket.attachmentUrl.length > 0 && (
                            <div>
                                <Label className="text-sm font-semibold text-foreground mb-2 block">Bukti dari Pelapor</Label>
                                <AttachmentGallery urls={selectedTicket.attachmentUrl} />
                            </div>
                        )}
                        <hr className="border-border/60" />

                        {/* FORM TINDAK LANJUT ATAU HASIL TINDAK LANJUT */}
                        <div className="space-y-5 pb-4">
                            {needsAction ? (
                                <>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Formulir Penyelesaian</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Kirimkan dokumentasi bukti bahwa masalah telah ditindaklanjuti.
                                        </p>
                                    </div>

                                    <form id="resolve-form" onSubmit={handleResolveSubmit} className="space-y-5 bg-background p-5 rounded-xl border border-primary/20 shadow-sm ring-1 ring-primary/5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="resolutionNote">Catatan / Keterangan Penyelesaian (Opsional)</Label>
                                            <Textarea
                                                id="resolutionNote"
                                                placeholder="Berikan keterangan detail mengenai tindak lanjut yang telah dilakukan unit Anda..."
                                                value={resolutionForm.resolutionNote}
                                                onChange={(e) => setResolutionForm(prev => ({ ...prev, resolutionNote: e.target.value }))}
                                                rows={4}
                                                className="bg-background"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Upload Bukti Foto / Dokumen Penyelesaian *</Label>
                                            <AttachmentUpload files={resolutionFiles} setFiles={setResolutionFiles} />
                                        </div>
                                    </form>
                                </>
                            ) : (
                                /* STATE UNTUK WaitingApproval ATAU Resolved */
                                <div className="space-y-6">
                                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center py-8 ${selectedTicket.status === "Resolved" ? "bg-green-500/10 border-green-500/20" : "bg-blue-500/10 border-blue-500/20"}`}>
                                        <ClockCheck className={`h-12 w-12 mb-3 ${selectedTicket.status === "Resolved" ? "text-green-500" : "text-blue-500"}`} />
                                        <h3 className="text-lg font-bold text-foreground">
                                            {selectedTicket.status === "Resolved" ? "Tuntas / Selesai" : "Menunggu Persetujuan Dekan"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                            {selectedTicket.status === "Resolved"
                                                ? "Laporan telah berhasil diselesaikan oleh unit Anda dan telah disetujui Dekan."
                                                : "Bukti penyelesaian Anda telah dikirim dan menunggu pemeriksaan akhir dari Dekan."}
                                        </p>
                                    </div>

                                    {/* Jika sudah dikirimkan / diselesaikan, tampilkan data resolusi */}
                                    <div className="space-y-4 pt-2">
                                        <h4 className="text-base font-bold text-foreground border-b border-border pb-2">Data Penyelesaian yang Dikirimkan</h4>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-muted-foreground block">Catatan Unit</Label>
                                            <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                {selectedTicket.resolutionNote || "Tidak ada catatan."}
                                            </div>
                                        </div>

                                        {selectedTicket.resolutionProofUrls && selectedTicket.resolutionProofUrls.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-semibold text-muted-foreground block">Lampiran Penyelesaian</Label>
                                                <AttachmentGallery urls={selectedTicket.resolutionProofUrls} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Footer (Only shows if forms exist and are actionable) */}
                {needsAction && (
                    <div className="border-t border-border p-4 bg-background shrink-0 flex items-center justify-end gap-3 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                        <Button
                            type="submit"
                            form="resolve-form"
                            disabled={isUpdating}
                            className="bg-primary hover:bg-[#c41a20]"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Mengunggah Data...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Kirim Bukti Penyelesaian
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

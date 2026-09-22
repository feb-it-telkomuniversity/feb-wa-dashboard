'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    Building2,
    MapPin,
    Users,
    UserCheck,
    AlertTriangle,
    CalendarPlus,
    Pencil,
    Trash2,
    FileText,
    UserCircle2,
} from "lucide-react";
import { formatCamelCaseLabel } from "@/lib/utils";
import DeleteActivity from "./delete-activity";

const formatDateId = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const formatDateTimeId = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }) + " WIB";
};

export default function ActivityDetailModal({
    isOpen,
    onClose,
    activity,
    onEdit,
    onSuccess,
    exportToGoogleCalendar,
    getStatusBadge,
}) {
    if (!activity) return null;

    const unitLabel = activity.unit === "Lainnya"
        ? activity.otherUnit || "Lainnya"
        : formatCamelCaseLabel(activity.unit);

    const roomLabel = activity.ruangan === "Lainnya"
        ? activity.locationDetail || "Lainnya"
        : formatCamelCaseLabel(activity.ruangan);

    const isMultiDay = Boolean(
        activity.tanggalBerakhir &&
        activity.tanggalBerakhir !== activity.tanggal
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
                <DialogHeader className="space-y-2 pb-2 border-b">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 pr-6">
                            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                                {activity.namaKegiatan}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Detail informasi lengkap agenda kegiatan
                            </DialogDescription>
                        </div>
                    </div>
                    <div>
                        {getStatusBadge ? getStatusBadge(activity) : null}
                    </div>
                </DialogHeader>

                {/* Conflict Alert Banner */}
                {activity.hasConflict && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-xs text-red-800 dark:text-red-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold">
                            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                            <span>Perhatian: Terdeteksi Konflik Jadwal</span>
                        </div>
                        {activity.conflictingOfficialsList && activity.conflictingOfficialsList.length > 0 && (
                            <p className="text-red-700 dark:text-red-400 pl-5">
                                Pejabat bentrok: <strong>{activity.conflictingOfficialsList.join(", ")}</strong>
                            </p>
                        )}
                    </div>
                )}

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {/* Tanggal */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Tanggal
                            </span>
                            <div className="text-xs font-semibold text-foreground">
                                {formatDateId(activity.tanggal)}
                            </div>
                            {isMultiDay && (
                                <div className="text-[11px] text-muted-foreground">
                                    s.d. {formatDateId(activity.tanggalBerakhir)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Waktu */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                            <Clock className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Waktu
                            </span>
                            <div className="text-xs font-semibold text-foreground font-mono">
                                {activity.waktuMulai || "-"} – {activity.waktuSelesai || "-"} WIB
                            </div>
                        </div>
                    </div>

                    {/* Unit */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Unit Pelaksana
                            </span>
                            <div className="text-xs font-semibold text-foreground break-words">
                                {unitLabel}
                            </div>
                        </div>
                    </div>

                    {/* Ruangan */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-muted/20">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                            <MapPin className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Ruangan / Lokasi
                            </span>
                            <div className="text-xs font-semibold text-foreground break-words">
                                {roomLabel}
                            </div>
                        </div>
                    </div>

                    {/* Peserta */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-muted/20 sm:col-span-2">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                            <Users className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Estimasi Peserta
                            </span>
                            <div className="text-xs font-semibold text-foreground">
                                {activity.jumlahPeserta || 0} Orang
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pejabat yang Hadir */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Pejabat yang Dilibatkan ({activity.pejabat?.length || 0})</span>
                    </div>
                    {activity.pejabat && activity.pejabat.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border bg-muted/10 max-h-36 overflow-y-auto">
                            {activity.pejabat.map((p, idx) => {
                                const isConflicting = activity.conflictingOfficialsList?.includes(p);
                                return (
                                    <Badge
                                        key={idx}
                                        variant={isConflicting ? "destructive" : "secondary"}
                                        className="text-xs py-1 px-2 gap-1 font-normal"
                                    >
                                        {isConflicting && <AlertTriangle className="h-3 w-3 shrink-0" />}
                                        {formatCamelCaseLabel(p)}
                                    </Badge>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic p-2 rounded border bg-muted/10">
                            Tidak ada pejabat yang ditugaskan.
                        </p>
                    )}
                </div>

                {/* Keterangan / Deskripsi */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Keterangan & Deskripsi</span>
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/20 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                        {activity.keterangan || (
                            <span className="text-muted-foreground italic">Tidak ada keterangan tambahan.</span>
                        )}
                    </div>
                </div>

                {/* Informasi Penginput Kegiatan */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <UserCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Diinput Oleh</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {activity.user?.avatarUrl ? (
                                <img
                                    src={activity.user.avatarUrl}
                                    alt={activity.user.name || activity.user.username || "User"}
                                    className="h-8 w-8 rounded-full object-cover shrink-0 border border-border/50"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                    {(activity.user?.name || activity.user?.username || "U").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate">
                                    {activity.user?.name || activity.user?.username || "Sistem / Tidak tercatat"}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                                    {activity.user?.name && activity.user?.username && (
                                        <span>@{activity.user.username}</span>
                                    )}
                                    {activity.user?.role && (
                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 uppercase font-semibold">
                                            {activity.user.role}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        {activity.createdAt && (
                            <div className="text-[11px] text-muted-foreground text-right shrink-0">
                                <span>{formatDateTimeId(activity.createdAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex flex-row items-center justify-between gap-2 pt-3 border-t">
                    {/* Tombol aksi icon sejajar tanpa text (Sync, Edit, Delete) */}
                    <div className="flex items-center gap-1.5">
                        {exportToGoogleCalendar && (
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => exportToGoogleCalendar(activity)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Sync ke Google Calendar"
                            >
                                <CalendarPlus className="h-4 w-4" />
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                    onClose();
                                    onEdit(activity);
                                }}
                                className="h-8 w-8 text-[#009da5] hover:text-[#009da5] hover:bg-[#009da5]/10 border-[#009da5]/30"
                                title="Edit Kegiatan"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                        <DeleteActivity
                            activityId={activity.id}
                            onSuccess={() => {
                                onClose();
                                if (onSuccess) onSuccess();
                            }}
                            trigger={
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                    title="Hapus Kegiatan"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onClose}
                        className="h-8 px-3.5 text-xs"
                    >
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

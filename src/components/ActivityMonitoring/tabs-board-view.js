import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarPlus, Clock, Building2, MapPin, Users, CalendarCheck } from "lucide-react";
import { formatCamelCaseLabel } from "@/lib/utils";
import Link from "next/link";

const TabsBoardView = ({ filteredActivities, exportToGoogleCalendar, getStatusBadge }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
                <div>
                    <CardTitle>Kartu Kegiatan</CardTitle>
                    <CardDescription>
                        Tampilan kartu agenda kegiatan fakultas
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="gap-2">
                    <Link href="/dashboard/manajemen-acara">
                        <CalendarCheck className="h-4 w-4" />
                        Manajemen Acara
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Group activities by date */}
                    {Object.entries(
                        filteredActivities.reduce((acc, activity) => {
                            const dateObj = activity.tanggal ? new Date(activity.tanggal) : null;
                            const isDateValid = dateObj && !isNaN(dateObj.getTime());
                            const date = isDateValid ? dateObj.toLocaleDateString(
                                "id-ID",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }
                            ) : "Tidak Ada Tanggal";
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(activity);
                            return acc;
                        }, {})
                    )
                        .sort(([dateA], [dateB]) => {
                            if (dateA === "Tidak Ada Tanggal") return 1;
                            if (dateB === "Tidak Ada Tanggal") return -1;

                            const a = filteredActivities.find((act) => {
                                const dObj = act.tanggal ? new Date(act.tanggal) : null;
                                return dObj && !isNaN(dObj.getTime()) && dObj.toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }) === dateA;
                            });
                            const b = filteredActivities.find((act) => {
                                const dObj = act.tanggal ? new Date(act.tanggal) : null;
                                return dObj && !isNaN(dObj.getTime()) && dObj.toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }) === dateB;
                            });

                            const timeA = a && a.tanggal && !isNaN(new Date(a.tanggal).getTime()) ? new Date(a.tanggal).getTime() : 0;
                            const timeB = b && b.tanggal && !isNaN(new Date(b.tanggal).getTime()) ? new Date(b.tanggal).getTime() : 0;
                            return timeA - timeB;
                        })
                        .map(([date, dayActivities]) => (
                            <div key={date} className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#e31e25] text-white px-3 py-1 rounded-md">
                                        <CalendarDays className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-semibold text-lg">{date}</h3>
                                    <Badge variant="secondary">
                                        {dayActivities.length} kegiatan
                                    </Badge>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {dayActivities.map((activity) => (
                                        <Card
                                            key={activity.id}
                                            className={
                                                activity.hasConflict ? "border-red-500" : ""
                                            }
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-base">
                                                            {activity.namaKegiatan}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {getStatusBadge ? getStatusBadge(activity) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span>
                                                        {activity.waktuMulai} -{" "}
                                                        {activity.waktuSelesai}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span>{activity.ruangan === "Lainnya" ? activity.locationDetail : formatCamelCaseLabel(activity.ruangan)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span>{formatCamelCaseLabel(activity.unit)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{activity.jumlahPeserta || 0} peserta</span>
                                                </div>
                                                {activity.pejabat && activity.pejabat.length > 0 && (
                                                    <div className="pt-2 border-t">
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            Pejabat:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {activity.pejabat.map((p, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {formatCamelCaseLabel(p)}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {exportToGoogleCalendar && (
                                                    <div className="pt-2 flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                exportToGoogleCalendar(activity)
                                                            }
                                                            className="flex-1 gap-1"
                                                        >
                                                            <CalendarPlus className="h-3 w-3" />
                                                            Sync
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    {filteredActivities.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada kegiatan ditemukan</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default TabsBoardView;
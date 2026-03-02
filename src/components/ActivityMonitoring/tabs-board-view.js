import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarPlus, Clock, Building2, MapPin, Users } from "lucide-react";
import { formatCamelCaseLabel } from "@/lib/utils";

const TabsBoardView = ({ filteredActivities, exportToGoogleCalendar, getStatusBadge }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Kartu Kegiatan</CardTitle>
                <CardDescription>
                    Tampilan kartu agenda kegiatan fakultas
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Group activities by date */}
                    {Object.entries(
                        filteredActivities.reduce((acc, activity) => {
                            const date = new Date(activity.tanggal).toLocaleDateString(
                                "id-ID",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }
                            );
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(activity);
                            return acc;
                        }, {})
                    )
                        .sort(([dateA], [dateB]) => {
                            const a = filteredActivities.find(
                                (act) =>
                                    new Date(act.tanggal).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }) === dateA
                            );
                            const b = filteredActivities.find(
                                (act) =>
                                    new Date(act.tanggal).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }) === dateB
                            );
                            return new Date(a.tanggal) - new Date(b.tanggal);
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
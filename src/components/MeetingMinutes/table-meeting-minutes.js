'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clock, Eye, FileText, Loader2, Search } from "lucide-react";
import { Input } from "../ui/input";
import { encodeId } from "@/lib/hash-ids";

const TableMeetingMinutes = ({ isLoading, meetings, searchQuery, setSearchQuery }) => {
    const router = useRouter()

    const handleViewNotulensi = (meetingId) => {
        router.push(`/dashboard/notulensi-rapat/${encodeId(meetingId)}`)
    }

    const handleEditNotulensi = (meetingId) => {
        router.push(`/dashboard/notulensi-rapat/${encodeId(meetingId)}/edit`)
    }

    const getStatusBadge = (status) => {
        const config = {
            Selesai: {
                variant: "default",
                className: "bg-green-600 hover:bg-green-700",
            },
            Berlangsung: {
                variant: "default",
                className: "bg-blue-600 hover:bg-blue-700",
            },
            Terjadwal: { variant: "secondary", className: "" },
        };
        const { variant, className } = config[status] || config["Terjadwal"];

        return (
            <Badge variant={variant} className={className}>
                {status}
            </Badge>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search and Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari rapat berdasarkan judul, pemimpin, atau tempat..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Rapat</CardTitle>
                    <CardDescription>
                        Daftar lengkap rapat fakultas dan status notulensi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Judul Rapat</TableHead>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>Ruangan</TableHead>
                                    <TableHead>Pemimpin Rapat</TableHead>
                                    <TableHead>Notulen</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center py-8"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-muted-foreground">Memuat data...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : meetings.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            Tidak ada rapat ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    meetings.map((meeting) => (
                                        <TableRow key={meeting.id}>
                                            <TableCell className="font-medium">
                                                {new Date(meeting.tanggal).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{meeting.judulRapat}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {meeting.waktu}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {meeting.ruangan === "Lainnya" ? meeting.locationDetail : meeting.ruangan}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {meeting.pemimpin}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {meeting.notulen}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(meeting.status)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {meeting.status === "Selesai" ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewNotulensi(meeting.id)}
                                                        className="gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        Lihat
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEditNotulensi(meeting.id)}
                                                        className="gap-1"
                                                    >
                                                        <FileText className="h-3 w-3" />
                                                        Lanjutkan
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card >
        </div>
    )
}

export default TableMeetingMinutes
"use client";

import { use, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  FileText,
  Download,
  ArrowLeft,
  Edit,
  CheckCircle,
  Target,
  Loader2,
  BadgeCheckIcon,
  Timer,
  CalendarCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import ExportPdfButton from "@/components/shared/ExportPdfButton";
import { decodeId, encodeId } from "@/lib/hash-ids";

export default function NotulensiDetailPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const hashedParams = resolvedParams.id
  const id = decodeId(hashedParams)

  const [isLoading, setIsLoading] = useState(true);
  const [notulensi, setNotulensi] = useState(null);

  const fetchMeetingData = async (meetingId) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/meetings/${meetingId}`)

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;

        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const formattedStartTime = startTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const formattedEndTime = endTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const waktuFormatted = `${formattedStartTime} - ${formattedEndTime}`;

        // Map data dari API ke format yang digunakan di UI
        const mappedData = {
          judulRapat: data.title || "",
          tanggal: data.date,
          waktu: waktuFormatted,
          tempat: data.room || "",
          pemimpin: data.leader || "",
          notulen: data.notetaker || "",
          status: data.status || "",
          peserta: data.participants || [],
          agendaRapat: data.agendas?.map((agenda) => agenda.title || "") || [],
          pembahasanKeputusan:
            data.agendas?.map((agenda) => ({
              agenda: agenda.title || "",
              pembahasan: agenda.discussion || "",
              keputusan: agenda.decision || "-",
              tindakLanjut:
                agenda.actionItems?.map((item) => ({
                  id: item.id,
                  tugas: item.task || "",
                  penanggungJawab: item.pic || "",
                  deadline: item.deadline || "",
                  status: item.status || "Open",
                })) || [],
            })) || [],
          penutup: "", // API tidak menyediakan penutup, bisa ditambahkan jika ada
        };

        setNotulensi(mappedData);
      } else {
        toast.error("Data rapat tidak ditemukan");
        router.push("/dashboard/notulensi-rapat");
      }
    } catch (err) {
      console.error("Gagal fetch data rapat:", err);
      toast.error("Gagal memuat data rapat");
      router.push("/dashboard/notulensi-rapat");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      toast.error("ID rapat tidak valid");
      router.push("/dashboard/notulensi-rapat");
      return;
    }

    fetchMeetingData(id);
  }, [id, router])

  const getStatusBadge = (status) => {
    const config = {
      Selesai: {
        variant: "default",
        className: "bg-green-600 hover:bg-green-700 rounded-full",
        icon: BadgeCheckIcon,
      },
      Berlangsung: {
        variant: "default",
        className: "bg-blue-600 hover:bg-blue-700 rounded-full",
        icon: Timer,
      },
      Terjadwal: { variant: "secondary", className: "rounded-full", icon: CalendarCheck },
    };
    const { variant, className, icon: Icon } = config[status] || config["Terjadwal"];

    return (
      <Badge variant={variant} className={className}>
        <Icon className="size-4 inline" />
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#e31e25]" />
              <p className="text-muted-foreground">Memuat data rapat...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!notulensi) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Notulensi Tidak Ditemukan
            </h3>
            <p className="text-muted-foreground mb-4">
              Notulensi rapat belum dibuat atau tidak tersedia
            </p>
            <Button onClick={() => router.push("/dashboard/notulensi-rapat")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/notulensi-rapat")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#e31e25]">
              Notulensi Rapat
            </h1>
            <p className="text-muted-foreground">
              Dokumentasi lengkap hasil rapat
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/notulensi-rapat/${encodeId(id)}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <ExportPdfButton
            data={notulensi}
            fileName={`Notulensi Rapat - ${notulensi.judulRapat}`}
          />
        </div>
      </div>

      {/* Meeting Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-2">
            <CardTitle className="text-2xl">{notulensi.judulRapat}</CardTitle>
            {getStatusBadge(notulensi.status)}
          </div>
          <CardDescription>Informasi Rapat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e31e25]/10">
                <Calendar className="h-5 w-5 text-[#e31e25]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium">
                  {new Date(notulensi.tanggal).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e31e25]/10">
                <Clock className="h-5 w-5 text-[#e31e25]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waktu</p>
                <p className="font-medium">{notulensi.waktu}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e31e25]/10">
                <MapPin className="h-5 w-5 text-[#e31e25]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempat</p>
                <p className="font-medium">{notulensi.tempat}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e31e25]/10">
                <User className="h-5 w-5 text-[#e31e25]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pemimpin Rapat</p>
                <p className="font-medium">{notulensi.pemimpin}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-[#e31e25]" />
              <h3 className="font-semibold">
                Peserta Rapat ({notulensi.peserta.length})
              </h3>
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {notulensi.peserta.map((peserta, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {peserta}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#e31e25]" />
            <span className="text-sm text-muted-foreground">Notulen:</span>
            <span className="font-medium">{notulensi.notulen}</span>
          </div>
        </CardContent>
      </Card>

      {/* Agenda Rapat */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda Rapat</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {notulensi.agendaRapat.map((agenda, index) => (
              <li key={index} className="flex gap-3">
                <span className="font-semibold text-[#e31e25]">
                  {index + 1}.
                </span>
                <span>{agenda}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Pembahasan, Keputusan, dan Tindak Lanjut */}
      <Card>
        <CardHeader>
          <CardTitle>Pembahasan, Keputusan, dan Tindak Lanjut</CardTitle>
          <CardDescription>
            Detail pembahasan, keputusan, dan tindak lanjut untuk setiap agenda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notulensi.pembahasanKeputusan.map((item, index) => (
            <div key={index}>
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <Badge className="bg-[#e31e25] hover:bg-[#c41a20]">
                    Agenda {index + 1}
                  </Badge>
                  <h3 className="font-semibold text-lg">{item.agenda}</h3>
                </div>

                <div className="space-y-4 pl-6">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Pembahasan:
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {item.pembahasan || "Belum ada pembahasan"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Keputusan:
                    </h4>
                    {item.keputusan && item.keputusan !== "-" ? (
                      <div className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed font-medium">
                          {item.keputusan}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-muted-foreground italic">
                        Belum ada keputusan
                      </p>
                    )}
                  </div>

                  {item.tindakLanjut && item.tindakLanjut.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" /> Tindak Lanjut:
                      </h4>
                      <div className="space-y-3 mt-2">
                        {item.tindakLanjut.map((tl, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg p-3 bg-muted/50"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{tl.tugas}</p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{tl.penanggungJawab}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      Deadline:{" "}
                                      {new Date(tl.deadline).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  tl.status === "Closed" || tl.status === "Open"
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "secondary"
                                }
                                className={
                                  tl.status === "Closed" || tl.status === "Open"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                                }
                              >
                                {tl.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {index < notulensi.pembahasanKeputusan.length - 1 && (
                <Separator />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Penutup */}
      {notulensi.penutup && (
        <Card>
          <CardHeader>
            <CardTitle>Penutup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{notulensi.penutup}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

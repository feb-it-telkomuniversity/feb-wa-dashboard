"use client";

import { use, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft, Plus, Trash2, Loader2, BadgeCheckIcon, Timer, CalendarCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteMeeting from "@/components/MeetingMinutes/delete-meeting"
import api from "@/lib/axios";
import { decodeId, encodeId } from "@/lib/hash-ids";

const ROOM_MAPPING = {
  "Ruang Rapat Manterawu lt. 2": "RuangRapatManterawuLt2",
  "Ruang Rapat Miossu lt. 1": "RuangRapatMiossuLt1",
  "Ruang Rapat Miossu lt. 2": "RuangRapatMiossuLt2",
  "Ruang Rapat Maratua lt. 1": "RuangRapatMaratuaLt1",
  "Aula FEB": "AulaFEB",
  "Aula Manterawu": "AulaManterawu",
  "Lainnya": "Lainnya",
};

const rooms = Object.keys(ROOM_MAPPING)

export default function EditNotulensiPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const hashedParams = resolvedParams.id
  const id = decodeId(hashedParams)

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [formData, setFormData] = useState({
    judulRapat: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
    ruangan: "",
    locationDetail: "",
    pemimpin: "",
    notulen: "",
    status: "Terjadwal",
    catatan: "Catatan belum dibuat",
  })

  const [pesertaList, setPesertaList] = useState([""]);
  const [agendaList, setAgendaList] = useState([""]);
  const [pembahasanList, setPembahasanList] = useState([
    {
      agenda: "",
      pembahasan: "",
      keputusan: "",
      actionItems: []
    },
  ]);
  const [tindakLanjutList, setTindakLanjutList] = useState([
    { tugas: "", penanggungJawab: "", deadline: "" },
  ]);
  const [penutup, setPenutup] = useState("");

  const fetchMeetingData = async (meetingId) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/meetings/${meetingId}`)

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;

        const date = new Date(data.date);
        const formattedDate = date.toISOString().split("T")[0];

        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime)

        const toTimeInputValue = (date) => {
          if (!(date instanceof Date) || isNaN(date)) return "";
          const h = String(date.getHours()).padStart(2, "0");
          const m = String(date.getMinutes()).padStart(2, "0");
          return `${h}:${m}`;
        }

        const formattedStartTime = toTimeInputValue(startTime)
        const formattedEndTime = toTimeInputValue(endTime)

        setFormData({
          judulRapat: data.title || "",
          tanggal: formattedDate,
          waktuMulai: formattedStartTime,
          waktuSelesai: formattedEndTime,
          ruangan: Object.keys(ROOM_MAPPING).find(key => ROOM_MAPPING[key] === data.room) || data.room || "",
          locationDetail: data.locationDetail || "",
          pemimpin: data.leader || "",
          notulen: data.notetaker || "",
          status: data.status || "Terjadwal",
          catatan: data.notes || "Catatan belum dibuat"
        })
        console.log(res.data)


        // Set peserta list
        if (data.participants && data.participants.length > 0) {
          setPesertaList(data.participants);
        } else {
          setPesertaList([""]);
        }

        // Set agenda list dan pembahasan list dari agendas
        if (data.agendas && data.agendas.length > 0) {
          const agendaTitles = data.agendas.map((agenda) => agenda.title || "");
          setAgendaList(agendaTitles);

          const pembahasanData = data.agendas.map((agenda) => ({
            id: agenda.id,
            agenda: agenda.title || "",
            pembahasan: agenda.discussion || "",
            keputusan: agenda.decision || "",
            actionItems: agenda.actionItems && agenda.actionItems.length > 0
              ? agenda.actionItems.map(ai => ({
                id: ai.id,
                tugas: ai.task || "",
                penanggungJawab: ai.pic || "",
                deadline: ai.deadline ? new Date(ai.deadline).toISOString().split("T")[0] : "",
                status: ai.status || "Open",
                notes: ai.notes || ""
              }))
              : []
          }));
          setPembahasanList(pembahasanData);
        } else {
          setAgendaList([""]);
          setPembahasanList([{
            agenda: "",
            pembahasan: "",
            keputusan: "",
            actionItems: []
          }]);
        }

        // Set tindak lanjut dari actionItems
        if (data.actionItems && data.actionItems.length > 0) {
          const tindakLanjutData = data.actionItems.map((item) => ({
            tugas: item.task || "",
            penanggungJawab: item.pic || "",
            deadline: item.deadline
              ? new Date(item.deadline).toISOString().split("T")[0]
              : "",
          }));
          setTindakLanjutList(tindakLanjutData);
        } else {
          setTindakLanjutList([{ tugas: "", penanggungJawab: "", deadline: "" }]);
        }

        // Set penutup (jika ada di API, jika tidak kosong)
        setPenutup("");
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

  // Load existing data on mount
  useEffect(() => {
    if (!id) {
      toast.error("ID rapat tidak valid");
      router.push("/dashboard/notulensi-rapat");
      return;
    }

    fetchMeetingData(id);
  }, [id, router]);

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

  const handleAddPeserta = () => setPesertaList([...pesertaList, ""]);
  const handleRemovePeserta = (index) =>
    setPesertaList(pesertaList.filter((_, i) => i !== index));
  const handlePesertaChange = (index, value) => {
    const newList = [...pesertaList];
    newList[index] = value;
    setPesertaList(newList);
  };

  const handleAddAgenda = () => setAgendaList([...agendaList, ""]);
  const handleRemoveAgenda = (index) =>
    setAgendaList(agendaList.filter((_, i) => i !== index));
  const handleAgendaChange = (index, value) => {
    const newList = [...agendaList];
    newList[index] = value;
    setAgendaList(newList);
  };

  const handleAddPembahasan = () =>
    setPembahasanList([
      ...pembahasanList,
      { agenda: "", pembahasan: "", keputusan: "", actionItems: [] },
    ]);
  const handleRemovePembahasan = (index) =>
    setPembahasanList(pembahasanList.filter((_, i) => i !== index));
  const handlePembahasanChange = (index, field, value) => {
    const newList = [...pembahasanList];
    newList[index][field] = value;
    setPembahasanList(newList);
  };

  // Action Items Handlers (Nested inside Agenda)
  const handleAddActionItem = (agendaIndex) => {
    const newList = [...pembahasanList];
    if (!newList[agendaIndex].actionItems) newList[agendaIndex].actionItems = [];

    newList[agendaIndex].actionItems.push({
      tugas: "",
      penanggungJawab: "",
      deadline: "",
      status: "Pending"
    });
    setPembahasanList(newList);
  }

  const handleRemoveActionItem = (agendaIndex, actionIndex) => {
    const newList = [...pembahasanList];
    newList[agendaIndex].actionItems = newList[agendaIndex].actionItems.filter((_, i) => i !== actionIndex);
    setPembahasanList(newList);
  }

  const handleActionItemChange = (agendaIndex, actionIndex, field, value) => {
    const newList = [...pembahasanList];
    newList[agendaIndex].actionItems[actionIndex][field] = value;
    setPembahasanList(newList);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.judulRapat || !formData.tanggal || !formData.pemimpin) {
      toast.error("Mohon lengkapi data rapat");
      return;
    }

    try {
      setIsFetching(true);

      const payload = {
        title: formData.judulRapat,
        date: formData.tanggal,
        startTime: new Date(`${formData.tanggal}T${formData.waktuMulai}:00`).toISOString(),
        endTime: new Date(`${formData.tanggal}T${formData.waktuSelesai}:00`).toISOString(),
        room: ROOM_MAPPING[formData.ruangan] || formData.ruangan || "",
        locationDetail: formData.locationDetail || "",
        leader: formData.pemimpin || "",
        notetaker: formData.notulen || "",
        participants: pesertaList.filter((p) => p.trim() !== ""),
        agendas: pembahasanList
          .filter((p) => p.agenda.trim() !== "")
          .map((item) => ({
            id: item.id,
            title: item.agenda,
            discussion: item.pembahasan?.trim() || null,
            decision: item.keputusan?.trim() || null,
            actionItems: item.actionItems
              ? item.actionItems
                .filter(ai => ai.tugas.trim() !== "")
                .map(ai => ({
                  id: ai.id,
                  task: ai.tugas,
                  pic: ai.penanggungJawab?.trim() || null,
                  deadline: ai.deadline ? `${ai.deadline}T00:00:00` : null,
                  status: ai.status || "Open",
                  notes: ai.notes || "",
                }))
              : []
          })),
      };

      await api.put(`/api/meetings/${id}`, payload)

      toast.success("Notulensi berhasil diperbarui", {
        style: { background: "#22c55e", color: "#fff" },
        iconTheme: { primary: "#22c55e", secondary: "#fff" }
      })
      router.push(`/dashboard/notulensi-rapat/${id}`)
    } catch (err) {
      console.error("Gagal update notulensi:", err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Gagal memperbarui notulensi"
      console.error("Error details:", err?.response?.data);
      toast.error(errorMessage);
    } finally {
      setIsFetching(false);
    }
  }

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
      <Badge variant={variant} className={`${className} px-2 py-1 text-xs h-6 min-h-0`}>
        <Icon className="mr-1 size-3.5 inline align-text-bottom" />
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/dashboard/notulensi-rapat/${encodeId(id)}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#e31e25]">
              Buat/Edit Notulensi Rapat
            </h1>
            <p className="text-muted-foreground">
              Perbarui dokumentasi hasil rapat
            </p>
          </div>
        </div>
        <div>
          <DeleteMeeting isLoading={isLoading} setIsLoading={setIsLoading} meetingId={id} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Informasi Rapat */}
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Informasi Rapat</CardTitle>
                <CardDescription>
                  Data dasar rapat yang dilaksanakan
                </CardDescription>
              </div>
              {getStatusBadge(formData.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="judulRapat">Judul Rapat *</Label>
                <Input
                  id="judulRapat"
                  value={formData.judulRapat}
                  onChange={(e) =>
                    setFormData({ ...formData, judulRapat: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tanggal">Tanggal *</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="waktuMulai">Waktu Mulai *</Label>
                  <Input
                    id="waktuMulai"
                    type="time"
                    value={formData.waktuMulai}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData({ ...formData, waktuMulai: val });
                    }}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="waktuSelesai">Waktu Selesai *</Label>
                  <Input
                    id="waktuSelesai"
                    type="time"
                    value={formData.waktuSelesai}
                    onChange={(e) =>
                      setFormData({ ...formData, waktuSelesai: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              {/* 
                Penjelasan:
                - Gunakan kembali `formData.waktuMulai`, bukan `formattedStartTime`, agar dua arah (input dan perubahan state) tetap sinkron.
                - Jika ingin formatting, lakukan saat menampilkan/submit saja, bukan saat mengisi value input.
              */}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ruangan">Ruangan *</Label>
                  <Select
                    value={formData.ruangan}
                    onValueChange={(value) =>
                      setFormData({ ...formData, ruangan: value })
                    }
                    required
                  >
                    <SelectTrigger id="ruangan" className="w-full">
                      <SelectValue placeholder="Pilih ruangan" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={`grid gap-2 ${formData.ruangan === "Lainnya" ? "" : "hidden"}`}>
                  <Label htmlFor="locationDetail" className="text-red-500">Detail Lokasi *</Label>
                  <Input
                    id="locationDetail"
                    value={formData.locationDetail}
                    onChange={(e) =>
                      setFormData({ ...formData, locationDetail: e.target.value })
                    }
                    required={formData.ruangan === "Lainnya"}
                    disabled={formData.ruangan !== "Lainnya"}
                    placeholder="Contoh: Hotel Papandayan"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pemimpin">Pemimpin Rapat *</Label>
                  <Input
                    id="pemimpin"
                    value={formData.pemimpin}
                    onChange={(e) =>
                      setFormData({ ...formData, pemimpin: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notulen">Notulen *</Label>
                <Input
                  id="notulen"
                  value={formData.notulen}
                  onChange={(e) =>
                    setFormData({ ...formData, notulen: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peserta Rapat */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Peserta Rapat</CardTitle>
                <CardDescription>
                  Daftar peserta yang hadir dalam rapat
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPeserta}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Peserta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pesertaList.map((peserta, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={peserta}
                    onChange={(e) => handlePesertaChange(index, e.target.value)}
                    placeholder={`Peserta ${index + 1}`}
                  />
                  {pesertaList.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemovePeserta(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pembahasan dan Keputusan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pembahasan dan Keputusan</CardTitle>
                <CardDescription>
                  Detail pembahasan dan keputusan setiap agenda
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPembahasan}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pembahasan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pembahasanList.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#e31e25] hover:bg-[#c41a20]">
                      Agenda {index + 1}
                    </Badge>
                    {pembahasanList.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemovePembahasan(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Judul Agenda</Label>
                      <Input
                        value={item.agenda}
                        onChange={(e) =>
                          handlePembahasanChange(
                            index,
                            "agenda",
                            e.target.value
                          )
                        }
                        placeholder="Judul agenda yang dibahas"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Pembahasan</Label>
                      <Textarea
                        value={item.pembahasan}
                        onChange={(e) =>
                          handlePembahasanChange(
                            index,
                            "pembahasan",
                            e.target.value
                          )
                        }
                        placeholder="Detail pembahasan agenda..."
                        rows={4}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Keputusan</Label>
                      <Textarea
                        value={item.keputusan}
                        onChange={(e) =>
                          handlePembahasanChange(
                            index,
                            "keputusan",
                            e.target.value
                          )
                        }
                        placeholder="Keputusan yang diambil..."
                        rows={3}
                      />
                    </div>

                    {/* Tindak Lanjut / Action Items List */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-sm font-semibold text-muted-foreground">
                          Tindak Lanjut Agenda Ini
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddActionItem(index)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah Item
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {item.actionItems && item.actionItems.map((actionItem, actionIdx) => (
                          <div key={actionIdx} className="bg-muted/50 p-3 rounded-lg relative group">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveActionItem(index, actionIdx)}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                            </Button>

                            <div className="grid gap-3">
                              <div className="grid gap-2">
                                <Label className="text-xs font-medium">Tugas</Label>
                                <Input
                                  value={actionItem.tugas}
                                  onChange={(e) =>
                                    handleActionItemChange(
                                      index,
                                      actionIdx,
                                      "tugas",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Deskripsi tugas..."
                                  className="h-8 text-sm"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label className="text-xs font-medium">Penanggung Jawab</Label>
                                  <Input
                                    value={actionItem.penanggungJawab}
                                    onChange={(e) =>
                                      handleActionItemChange(
                                        index,
                                        actionIdx,
                                        "penanggungJawab",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Nama PIC"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-xs font-medium">Deadline</Label>
                                  <Input
                                    type="date"
                                    value={actionItem.deadline}
                                    onChange={(e) =>
                                      handleActionItemChange(
                                        index,
                                        actionIdx,
                                        "deadline",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                              <Textarea
                                value={actionItem.notes}
                                onChange={(e) =>
                                  handleActionItemChange(
                                    index,
                                    actionIdx,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                placeholder="Catatan tambahan (opsional)..."
                                className="min-h-[60px] text-sm resize-none"
                              />
                            </div>
                            <div className="grid gap-2 mt-2">
                              <Label className="text-xs font-medium">Status Tugas</Label>
                              <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit border">
                                <Button
                                  type="button"
                                  variant={actionItem.status === "Open" ? "white" : "ghost"}
                                  size="sm"
                                  className={`h-7 text-xs px-4 rounded-md transition-all ${actionItem.status === "Open"
                                    ? "bg-white text-destructive shadow-sm font-semibold hover:bg-white"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  onClick={() =>
                                    handleActionItemChange(
                                      index,
                                      actionIdx,
                                      "status",
                                      "Open"
                                    )
                                  }
                                >
                                  Open
                                </Button>
                                <Button
                                  type="button"
                                  variant={actionItem.status === "Closed" ? "white" : "ghost"}
                                  size="sm"
                                  className={`h-7 text-xs px-4 rounded-md transition-all ${actionItem.status === "Closed"
                                    ? "bg-green-600 text-white shadow-sm font-semibold hover:bg-green-700"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  onClick={() =>
                                    handleActionItemChange(
                                      index,
                                      actionIdx,
                                      "status",
                                      "Closed"
                                    )
                                  }
                                >
                                  Closed
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!item.actionItems || item.actionItems.length === 0) && (
                          <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                            Belum ada tindak lanjut untuk agenda ini
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/notulensi-rapat`)}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="bg-[#e31e25] hover:bg-[#c41a20]"
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
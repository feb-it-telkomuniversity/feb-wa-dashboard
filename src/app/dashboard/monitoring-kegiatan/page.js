"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import TableActivityMonitoring from "@/components/ActivityMonitoring/table-activity-monitoring";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCamelCaseLabel } from "@/lib/utils";
import AddActivity from "@/components/ActivityMonitoring/add-activity";
import EditActivity from "@/components/ActivityMonitoring/edit-activity";
import api from "@/lib/axios";

const units = [
  "Dekan",
  "WakilDekanI",
  "WakilDekanII",
  "UrusanSekretariatDekan",
  "UrusanLayananAkademik",
  "UrusanLaboratorium",
  "UrusanSDMKeuangan",
  "UrusanKemahasiswaan",
  "ProdiS1Manajemen",
  "ProdiS1AdministrasiBisnis",
  "ProdiS1Akuntansi",
  "ProdiS1LeisureManagement",
  "ProdiS1BisnisDigital",
  "ProdiS2Manajemen",
  "ProdiS2ManajemenPJJ",
  "ProdiS2AdministrasiBisnis",
  "ProdiS2Akuntansi",
  "ProdiS3Manajemen",
  "Lainnya"
]

const rooms = [
  "RuangRapatManterawuLt2",
  "RuangRapatMiossuLt1",
  "RuangRapatMiossuLt2",
  "RuangRapatMaratuaLt1",
  "AulaFEB",
  "AulaManterawu",
  "Lainnya",
]

const officials = [
  "Rektor",
  "WakilRektor1",
  "WakilRektor2",
  "WakilRektor3",
  "WakilRektor4",
  "Dekan",
  "WakilDekanI",
  "Dekanat",
  "WakilDekanII",
  "Ponggawa",
  "KaurSekretariatDekan",
  "KaurAkademik",
  "KaurLaboratorium",
  "KaurSDMKeuangan",
  "KaurKemahasiswaan",
  "KetuaKKAEFS",
  "KetuaKKTBM",
  "KetuaKKDBE",
  "KaprodiS1Manajemen",
  "KaprodiS1AdministrasiBisnis",
  "KaprodiS1Akuntansi",
  "KaprodiS1LeisureManagement",
  "KaprodiS1BisnisDigital",
  "KaprodiS2Manajemen",
  "KaprodiS2ManajemenPJJ",
  "KaprodiS2AdministrasiBisnis",
  "KaprodiS2Akuntansi",
  "KaprodiS3Manajemen",
  "SekprodiS1Manajemen",
  "SekprodiS1ICTBusiness",
  "SekprodiS1Akuntansi",
  "SekprodiS2Manajemen",
  "SekprodiS2ManajemenPJJ",
  "SekprodiS2AdministrasiBisnis",
]

export default function MonitoringKegiatanPage() {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debounceSearch = useDebounce(searchQuery, 500)
  const [filterUnit, setFilterUnit] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState("table")
  const [editingId, setEditingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10
  })
  const pageSize = 10

  const [formData, setFormData] = useState({
    namaKegiatan: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
    unit: "",
    otherUnit: "",
    ruangan: "",
    locationDetail: "",
    pejabat: [],
    jumlahPeserta: "",
    keterangan: "",
  })

  // Helper function to parse conflict types from status
  const parseConflictTypes = (status) => {
    if (!status || status === "Normal") {
      return []
    }

    const conflictTypes = []
    const statusLower = status.toLowerCase()

    // Handle DoubleConflict - means 2 conflicts, typically including pejabat
    if (status === "DoubleConflict" || statusLower === "doubleconflict") {
      // DoubleConflict usually means pejabat conflict + another conflict (ruangan or waktu)
      conflictTypes.push("pejabat")
      conflictTypes.push("ruangan") // Common second conflict, could also be waktu
      return conflictTypes
    }

    // Check for specific conflict types
    if (statusLower.includes("official") || statusLower.includes("pejabat")) {
      conflictTypes.push("pejabat")
    }
    if (statusLower.includes("room") || statusLower.includes("ruangan")) {
      conflictTypes.push("ruangan")
    }
    if (statusLower.includes("time") || statusLower.includes("waktu")) {
      conflictTypes.push("waktu")
    }

    // If status contains "Conflict" but no specific type found
    if (statusLower.includes("conflict") && conflictTypes.length === 0) {
      conflictTypes.push("pejabat") // Default to pejabat as user mentioned it's the focus
    }

    return conflictTypes
  }

  const mapApiDataToComponent = (apiData) => {
    return apiData.map((item) => {
      const date = new Date(item.date)
      const startTime = new Date(item.startTime)
      const endTime = new Date(item.endTime)

      const conflictTypes = parseConflictTypes(item.status)
      const hasConflict = item.status !== "Normal" && item.status !== null

      return {
        id: item.id,
        namaKegiatan: item.title,
        keterangan: item.description,
        tanggal: date.toISOString().split("T")[0],
        waktuMulai: startTime.toTimeString().slice(0, 5),
        waktuSelesai: endTime.toTimeString().slice(0, 5),
        unit: item.unit,
        ruangan: item.room, // Keep raw enum from database
        tempat: item.room, // Keep raw enum from database
        locationDetail: item.locationDetail || "",
        otherUnit: item.otherUnit || "",
        pejabat: (item.officials || []).map(formatCamelCaseLabel),
        jumlahPeserta: item.participants || 0,
        status: item.status || "Normal",
        hasConflict: hasConflict,
        conflictTypes: conflictTypes, // Array of conflict types
        conflictType: conflictTypes.length > 0 ? conflictTypes[0] : null, // For backward compatibility
      }
    })
  }

  const fetchActivities = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)

      const params = {
        page,
        limit: pageSize,
        search: debounceSearch || "",
        unit: filterUnit !== "all" ? filterUnit : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      }

      // Remove undefined params
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key])

      const res = await api.get(
        `/api/activity-monitoring`,
        {
          params,
        }
      )

      if (res.data?.success) {
        let mappedData = mapApiDataToComponent(res.data.data || [])

        // Detect specific official conflicts within the current page
        mappedData = mappedData.map(activity => {
          // Skip check if date is not valid
          if (!activity.tanggal) return activity;

          const conflictingAttributes = new Set();

          mappedData.forEach(other => {
            if (activity.id === other.id) return;
            if (activity.tanggal !== other.tanggal) return;

            // Check time overlap
            // Format is "HH:MM", lexicographical comparison works for 24h
            if (activity.waktuMulai < other.waktuSelesai && activity.waktuSelesai > other.waktuMulai) {
              // Check officials overlap
              const overlap = activity.pejabat.filter(p => other.pejabat.includes(p));
              overlap.forEach(p => conflictingAttributes.add(p));
            }
          });

          return {
            ...activity,
            conflictingOfficialsList: Array.from(conflictingAttributes)
          };
        });

        setActivities(mappedData)

        if (res.data.pagination) {
          setPagination(res.data.pagination)
          setCurrentPage(res.data.pagination.currentPage)
        }
      }
    } catch (err) {
      console.error("Gagal fetch data:", err)
      toast.error("Gagal memuat data kegiatan")
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }, [debounceSearch, filterUnit, filterStatus, pageSize])

  useEffect(() => {
    setCurrentPage(1)
    fetchActivities(1)
  }, [debounceSearch, filterUnit, filterStatus])

  // Fetch data when page changes
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchActivities(page)
  }

  // Stats calculation
  const totalActivities = pagination.totalItems || 0
  const upcomingActivities = activities.filter(
    (a) => new Date(a.tanggal) >= new Date()
  ).length
  const conflictActivities = activities.filter((a) => a.hasConflict).length
  const todayActivities = activities.filter((a) => {
    const today = new Date().toISOString().split("T")[0]
    return a.tanggal === today
  }).length

  const filteredActivities = activities

  const getStatusBadge = (activity) => {
    if (activity.hasConflict && activity.conflictTypes && activity.conflictTypes.length > 0) {
      const conflictLabels = activity.conflictTypes.map((type) => {
        switch (type) {
          case "pejabat":
            const officials = activity.conflictingOfficialsList || [];
            if (officials.length > 0) {
              return (
                <span key="pejabat" title={`Bentrokan Pejabat: ${officials.join(", ")}`}>
                  Pejabat ({officials.length})
                </span>
              )
            }
            return "Pejabat"
          case "ruangan":
            return "Ruangan"
          case "waktu":
            return "Waktu"
          case "multiple":
            return "Multiple"
          default:
            return type
        }
      })

      // If multiple conflicts (e.g., DoubleConflict), show all badges
      if (conflictLabels.length > 1) {
        return (
          <div className="flex flex-wrap gap-1">
            {activity.conflictTypes.map((type, idx) => {
              let label = "Konflik";
              let detail = "";

              if (type === "pejabat") {
                label = "Konflik Pejabat";
                const officials = activity.conflictingOfficialsList || [];
                if (officials.length > 0) {
                  detail = officials.join(", ");
                  label += ` (${officials.length})`;
                }
              } else if (type === "ruangan") {
                label = "Konflik Ruangan";
              } else {
                label = `Konflik ${type}`;
              }

              return (
                <Badge key={idx} variant="destructive" className="gap-1 text-xs cursor-help" title={detail || label}>
                  <AlertTriangle className="h-3 w-3" />
                  {label}
                </Badge>
              )
            })}
          </div>
        )
      }

      // Single conflict
      let label = `Konflik ${conflictLabels[0]}`;
      // Fix for Object render if it returned JSX above
      if (typeof conflictLabels[0] === 'object') {
        // This path handles the specific JSX return I added earlier
        // React might complain if I try to render Object in template literal.
        // Let's simpler logic.
      }

      // Re-do single conflict logic cleaner:
      const type = activity.conflictTypes[0];
      let displayLabel = `Konflik ${type}`;
      let tooltip = "";

      if (type === "pejabat") {
        const officials = activity.conflictingOfficialsList || [];
        if (officials.length > 0) {
          displayLabel = `Konflik Pejabat (${officials.length})`;
          tooltip = `Bentrokan: ${officials.join(", ")}`;
        }
      }

      return (
        <Badge variant="destructive" className="gap-1 cursor-help" title={tooltip}>
          <AlertTriangle className="h-3 w-3" />
          {displayLabel}
        </Badge>
      )
    }

    // Fallback for backward compatibility
    if (activity.hasConflict) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Konflik{" "}
          {activity.conflictType === "pejabat"
            ? "Pejabat"
            : activity.conflictType === "ruangan"
              ? "Ruangan"
              : "Waktu"}
        </Badge>
      )
    }

    return (
      <Badge
        variant="default"
        className="bg-green-600 hover:bg-green-700 gap-1"
      >
        <CheckCircle2 className="h-3 w-3" />
        Normal
      </Badge>
    );
  };


  // Function to export to Google Calendar
  const exportToGoogleCalendar = (activity) => {
    const startDateTime = `${activity.tanggal}T${activity.waktuMulai}:00`
    const endDateTime = `${activity.tanggal}T${activity.waktuSelesai}:00`

    const unitLabel = activity.unit === "Lainnya" ? activity.otherUnit : formatCamelCaseLabel(activity.unit)
    const roomLabel = activity.ruangan === "Lainnya" ? activity.locationDetail : formatCamelCaseLabel(activity.ruangan)

    const details = `
      Unit: ${unitLabel}
      Ruangan: ${roomLabel}
      Pejabat: ${activity.pejabat.join(", ")}
      Jumlah Peserta: ${activity.jumlahPeserta}

${activity.keterangan}`

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      activity.namaKegiatan
    )}&dates=${startDateTime.replace(/[-:]/g, "")}/${endDateTime.replace(
      /[-:]/g,
      ""
    )}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(
      roomLabel
    )}`

    window.open(googleCalendarUrl, "_blank")
    toast.success("Membuka Google Calendar", {
      style: { background: "#fff", color: "#1f2937" },
      className: "border border-gray-200"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e31e25]">
            Daftar Agenda
          </h1>
          <p className="text-muted-foreground">
            Pantau dan kelola agenda kegiatan unit dan program studi untuk
            menghindari konflik jadwal
          </p>
        </div>
        <div className="flex gap-2">
          <AddActivity
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            formData={formData}
            setFormData={setFormData}
            units={units}
            rooms={rooms}
            officials={officials}
            onSuccess={() => fetchActivities(currentPage)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Kegiatan
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Terjadwal dan aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayActivities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Kegiatan berlangsung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mendatang</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingActivities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Kegiatan terjadwal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Konflik Terdeteksi
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {conflictActivities}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Perlu perhatian
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Filters */}
      <TableActivityMonitoring
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterUnit={filterUnit}
        setFilterUnit={setFilterUnit}
        units={units}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filteredActivities={filteredActivities}
        isLoading={isLoading}
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        getStatusBadge={getStatusBadge}
        exportToGoogleCalendar={exportToGoogleCalendar}
        onSuccess={() => fetchActivities(currentPage)}
        onEdit={(activity) => {
          setFormData({
            namaKegiatan: activity.namaKegiatan,
            tanggal: activity.tanggal,
            waktuMulai: activity.waktuMulai,
            waktuSelesai: activity.waktuSelesai,
            unit: activity.unit,
            ruangan: activity.ruangan,
            locationDetail: activity.locationDetail,
            otherUnit: activity.otherUnit,
            pejabat: activity.pejabat || [],
            jumlahPeserta: activity.jumlahPeserta || "",
            keterangan: activity.keterangan || "",
          })
          setEditingId(activity.id)
          setIsEditDialogOpen(true)
        }}
      />

      <EditActivity
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingId(null)
            setFormData({
              namaKegiatan: "",
              tanggal: "",
              waktuMulai: "",
              waktuSelesai: "",
              unit: "",
              otherUnit: "",
              ruangan: "",
              locationDetail: "",
              pejabat: [],
              jumlahPeserta: "",
              keterangan: "",
            })
          }
        }}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        units={units}
        rooms={rooms}
        officials={officials}
        onSuccess={() => {
          fetchActivities(currentPage)
          setEditingId(null)
        }}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}

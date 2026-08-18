"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TicketXIcon,
  List,
  AlarmClock,
  Inbox,
  ParkingMeter,
  Newspaper,
  GraduationCap,
  Award,
  Users,
  GitGraph,
  CalendarClock,
  MapPin,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  ArrowRight,
  WavesLadder,
  Mail,
  CalendarCheck,
  PenTool,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Ticket,
  CalendarDays,
  FileSignature,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/lib/navigation";
import Link from "next/link";
import { MorphingText } from "@/components/ui/text-morphing";
import { TypewriterText } from "@/components/ui/typewritter-text";
import api from "@/lib/axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCamelCaseLabel } from "@/lib/utils";
import { toast } from "sonner";
import ReleaseNotesModal from "@/components/release-note-modal";

// ─── Upcoming Events ──────────────────────────────────────────────────────────
function UpcomingEventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await api.get("/api/activity-monitoring", {
          params: { limit: 100 },
        });

        if (res.data?.success) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const mapped = (res.data.data || []).map((item) => ({
            id: item.id,
            title: item.title,
            date: item.date ? new Date(item.date) : null,
            endDate: item.endDate ? new Date(item.endDate) : null,
            startTime: item.startTime,
            room: item.room,
            locationDetail: item.locationDetail,
          }));

          const filtered = mapped
            .filter((e) => e.date && e.date >= now)
            .sort((a, b) => {
              // Primary sort: date
              const dateDiff = a.date - b.date;
              if (dateDiff !== 0) return dateDiff;
              // Secondary sort: startTime (chronological on same day)
              if (a.startTime && b.startTime) {
                return new Date(a.startTime) - new Date(b.startTime);
              }
              return 0;
            })
            .slice(0, 5);

          setEvents(filtered);
        }
      } catch (error) {
        console.error("Failed to load upcoming events:", error);
        toast.error("Gagal memuat agenda mendatang", {
          description: "Silahkan coba lagi nanti",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-[82px] w-full rounded-2xl bg-primary/5"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-3xl border border-dashed border-border h-40">
        <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-muted-foreground font-medium text-sm">
          Tidak ada agenda mendatang
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((event, idx) => {
        const eventDate = event.date;
        const isToday = eventDate.toDateString() === new Date().toDateString();

        return (
          <div
            key={event.id || idx}
            className="group relative flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:border-primary/30 hover:shadow-md hover:bg-white/80 dark:hover:bg-white/10 transition-all overflow-hidden"
          >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors duration-300 rounded-l-2xl" />

            {/* Date badge */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary ml-1">
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {format(eventDate, "MMM", { locale: id })}
              </span>
              <span className="text-xl font-black leading-none">
                {format(eventDate, "dd")}
              </span>
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[9px] font-bold uppercase tracking-wider shrink-0">
                    Hari Ini
                  </span>
                )}
                <h4 className="font-bold text-foreground truncate text-sm group-hover:text-primary transition-colors">
                  {event.title}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-3 w-3" />
                  <span>
                    {event.startTime
                      ? new Date(event.startTime).toLocaleTimeString(
                          ["id-ID"],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "Seharian"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[140px]">
                    {event.room === "Lainnya"
                      ? event.locationDetail
                      : formatCamelCaseLabel(event.room)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────
function QuickStats({ todayEventsCount }) {
  const stats = [
    {
      label: "Agenda Hari Ini",
      value: todayEventsCount ?? "—",
      icon: CalendarDays,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/dashboard/monitoring-kegiatan",
    },
    {
      label: "Sistem",
      value: "Aktif",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: null,
    },
    {
      label: "FEB Telkom U",
      value: "Online",
      icon: Sparkles,
      color: "text-primary",
      bg: "bg-primary/10",
      href: null,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const content = (
          <div className="group flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:border-primary/30 hover:shadow-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all">
            <div className={`p-2 rounded-xl ${stat.bg} shrink-0`}>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-foreground leading-none">
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        );

        return stat.href ? (
          <Link key={stat.label} href={stat.href}>
            {content}
          </Link>
        ) : (
          <div key={stat.label}>{content}</div>
        );
      })}
    </div>
  );
}

// ─── Menu Items with category-based colors ────────────────────────────────────
const menuItems = [
  // Kategori: Operasional (teal/cyan)
  {
    name: "Ticket Management",
    description: "Kelola tiket bantuan dan layanan WhatsApp",
    href: "/dashboard/ticket-management",
    icon: TicketXIcon,
    color: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    category: "Operasional",
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    name: "Reminder",
    description: "Atur pengingat dan jadwal notifikasi",
    href: "/dashboard/reminder/buat-jadwal",
    icon: AlarmClock,
    color: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    category: "Operasional",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.KAUR,
      ROLES.WADEK,
    ],
  },
  {
    name: "Notulensi Rapat",
    description: "Arsip dan pembuatan notulensi rapat",
    href: "/dashboard/notulensi-rapat",
    icon: Inbox,
    color: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    category: "Operasional",
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KAUR],
  },
  // Kategori: Agenda & Acara (blue/indigo)
  {
    name: "Daftar Agenda",
    description: "Pantau dan kelola agenda kegiatan unit dan program studi",
    href: "/dashboard/monitoring-kegiatan",
    icon: List,
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    category: "Agenda & Acara",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.KAUR,
      ROLES.KAPRODI,
      ROLES.SEKPRODI,
      ROLES.WADEK,
      ROLES.TPA,
      ROLES.KETUA_KK,
    ],
  },
  {
    name: "Manajemen Acara",
    description: "Kelola acara, kanban board, timeline, dan laporan kegiatan",
    href: "/dashboard/manajemen-acara",
    icon: CalendarCheck,
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    category: "Agenda & Acara",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.KAUR,
      ROLES.KAPRODI,
      ROLES.SEKPRODI,
      ROLES.WADEK,
    ],
  },
  // Kategori: Administrasi (violet/purple)
  {
    name: "Administrasi Surat",
    description:
      "Kelola administrasi surat masuk & keluar sesuai standar internasional",
    href: "/dashboard/surat-menyurat",
    icon: Mail,
    color: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    category: "Administrasi",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.KAUR,
      ROLES.WADEK,
    ],
  },
  {
    name: "Log TTD Dekan",
    description: "Catatan riwayat penandatanganan dokumen oleh Dekan",
    href: "/dashboard/log-tanda-tangan",
    icon: PenTool,
    color: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    category: "Administrasi",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.KAUR,
      ROLES.WADEK,
    ],
  },
  // Kategori: Kerjasama & Laporan (amber/orange)
  {
    name: "Partnership Monitoring",
    description: "Pantau kerjasama dengan mitra luar",
    href: "/dashboard/partnership-monitoring/pengajuan",
    icon: ParkingMeter,
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    category: "Kerjasama & Laporan",
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KAUR, ROLES.WADEK],
  },
  {
    name: "Kontrak Manajemen",
    description: "Kelola dokumen kontrak manajemen",
    href: "/dashboard/kontrak-management",
    icon: Newspaper,
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    category: "Kerjasama & Laporan",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.KAUR,
      ROLES.WADEK,
      ROLES.KAPRODI,
      ROLES.KETUA_KK,
      ROLES.DOSEN,
      ROLES.SEKPRODI,
    ],
  },
  {
    name: "Laporan Manajemen",
    description: "Akses berbagai laporan manajemen FEB",
    href: "/dashboard/laporan-management",
    icon: Newspaper,
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    category: "Kerjasama & Laporan",
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    name: "RTM",
    description: "Dokumentasi dan riwayat Rapat Tinjauan Manajemen",
    href: "/dashboard/rtm",
    icon: Newspaper,
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    category: "Kerjasama & Laporan",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.KAUR,
      ROLES.WADEK,
    ],
  },
  // Kategori: Akreditasi (rose/red)
  {
    name: "Akreditasi LAMEMBA",
    description: "Dokumentasi akreditasi LAMEMBA",
    href: "/dashboard/akreditasi-lamemba",
    icon: GraduationCap,
    color: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    category: "Akreditasi",
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    name: "Akreditasi AACSB",
    description: "Dokumentasi akreditasi internasional AACSB",
    href: "/dashboard/akreditasi-aacsb",
    icon: Award,
    color: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    category: "Akreditasi",
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  // Kategori: SDM & Lainnya (slate/green)
  {
    name: "Data Pegawai",
    description: "Rekapitulasi data pegawai FEB",
    href: "/dashboard/jumlah-pegawai",
    icon: Users,
    color: "bg-green-500/15 text-green-600 dark:text-green-400",
    category: "SDM & Lainnya",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.WADEK,
      ROLES.KAUR,
      ROLES.KAPRODI,
      ROLES.SEKPRODI,
      ROLES.DOSEN,
      ROLES.TPA,
      ROLES.KETUA_KK,
    ],
  },
  {
    name: "Halo Dekan",
    description: "Ajukan aspirasi, keluhan, atau saran langsung kepada Dekan",
    href: "/dashboard/halo-dekan/pengaduan-baru",
    icon: WavesLadder,
    color: "bg-green-500/15 text-green-600 dark:text-green-400",
    category: "SDM & Lainnya",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.WADEK,
      ROLES.KAUR,
      ROLES.KAPRODI,
      ROLES.SEKPRODI,
      ROLES.DOSEN,
      ROLES.MAHASISWA,
      ROLES.UMUM,
    ],
  },
  {
    name: "Pusat Bantuan",
    description: "Bantuan memahami setiap langkah penggunaan fitur MIRA",
    href: "/dashboard/pusat-bantuan",
    icon: GitGraph,
    color: "bg-green-500/15 text-green-600 dark:text-green-400",
    category: "SDM & Lainnya",
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.DEKANAT,
      ROLES.KAUR,
      ROLES.KAPRODI,
      ROLES.SEKPRODI,
      ROLES.DOSEN,
      ROLES.MAHASISWA,
      ROLES.WADEK,
      ROLES.KETUA_KK,
      ROLES.TPA,
      ROLES.UMUM,
    ],
  },
];

const INITIAL_SHOWN = 6;

// ─── Dashboard Home ───────────────────────────────────────────────────────────
export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role;
  const [showAll, setShowAll] = useState(false);
  const [todayEventsCount, setTodayEventsCount] = useState(null);

  // Fetch today's event count for Quick Stats
  useEffect(() => {
    async function fetchTodayCount() {
      try {
        const res = await api.get("/api/activity-monitoring", {
          params: { limit: 200 },
        });
        if (res.data?.success) {
          const today = new Date().toDateString();
          const count = (res.data.data || []).filter(
            (item) => item.date && new Date(item.date).toDateString() === today,
          ).length;
          setTodayEventsCount(count);
        }
      } catch {
        // silently fail
      }
    }
    fetchTodayCount();
  }, []);

  const filteredMenu = menuItems.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
    return item.allowedRoles.includes(userRole);
  });

  const visibleMenu = showAll
    ? filteredMenu
    : filteredMenu.slice(0, INITIAL_SHOWN);

  return (
    <div className="space-y-6 pb-8">
      <ReleaseNotesModal />

      {/* ── Compact Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 p-5 md:p-6 shadow-sm backdrop-blur-sm">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              MIRA — Integrated Management System
            </div>

            {/* Heading */}
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-tight">
              Selamat Datang,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                <TypewriterText
                  words={["Sobat Mira", `${user?.name || "Sahabat Mira"}`]}
                />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              <MorphingText
                words={[
                  "Pantau Kegiatan",
                  "Kelola Dokumen",
                  "Tingkatkan Produktivitas",
                ]}
                interval={3000}
                animationDuration={0.5}
                className="whitespace-nowrap inline"
              />{" "}
              FEB Telkom University dalam satu platform terintegrasi.
            </p>
          </div>

          {/* Status pills — more prominent on the right */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/20 rounded-xl shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-semibold">Sistem Aktif</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/20 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-primary">FEB</span>
              <span className="w-px h-3 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                Telkom University
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ──────────────────────────────────────────────────── */}
      <QuickStats todayEventsCount={todayEventsCount} />

      {/* ── Main Grid: Menu + Events ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Menu: Akses Cepat */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Akses Cepat</h2>
            {filteredMenu.length > INITIAL_SHOWN && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {showAll
                  ? "Sembunyikan"
                  : `Lihat Semua (${filteredMenu.length})`}
                {showAll ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMenu.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className="group relative flex flex-col gap-3 p-4 rounded-2xl text-left bg-white/60 dark:bg-white/5 backdrop-blur-md border border-grey-200 dark:border-white/10 hover:border-primary/40 hover:shadow-lg hover:bg-white/90 dark:hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Glass sheen on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

                {/* Icon + arrow */}
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2.5 rounded-xl ${item.color} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  {/* Arrow affordance */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 mt-0.5" />
                </div>

                {/* Text */}
                <div className="space-y-1 relative z-10">
                  <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Category badge */}
                <div className="relative z-10">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {item.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        {user?.role && user.role !== ROLES.MAHASISWA && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                Upcoming Events
              </h2>
              <Link
                href="/dashboard/monitoring-kegiatan"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group"
              >
                Lihat Semua
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <UpcomingEventsList />
          </div>
        )}
      </div>
    </div>
  );
}

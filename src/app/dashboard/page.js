'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Crosshair,
  Sparkles,
  GitGraph,
  CalendarClock,
  MapPin,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ROLES } from '@/lib/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MorphingText } from '@/components/ui/text-morphing'
import { HighlightText } from '@/components/ui/highlight-text'
import { TypewriterText } from '@/components/ui/typewritter-text'
import api from '@/lib/axios'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCamelCaseLabel } from '@/lib/utils'
import { toast } from 'sonner'

function UpcomingEventsList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await api.get('/api/activity-monitoring', {
          params: { limit: 100 }
        })

        if (res.data?.success) {
          const now = new Date()
          now.setHours(0, 0, 0, 0)

          const mapped = (res.data.data || []).map(item => {
            return {
              id: item.id,
              title: item.title,
              date: item.date ? new Date(item.date) : null,
              endDate: item.endDate ? new Date(item.endDate) : null,
              startTime: item.startTime,
              room: item.room,
              locationDetail: item.locationDetail,
            }
          })

          const filtered = mapped
            .filter(e => {
              const eventDate = e.date
              return eventDate && eventDate >= now
            })
            .sort((a, b) => a.date - b.date)
            .slice(0, 5)

          setEvents(filtered)
        }
      } catch (error) {
        console.error("Failed to load upcoming events:", error)
        toast.error("Gagal memuat agenda mendatang", {
          description: "Silahkan coba lagi nanti",
          duration: 5000,
          position: "top-center",
          className: "bg-red-500 text-white",
          descriptionClassName: "text-white",
          icon: <TicketXIcon className="h-5 w-5 text-white" />,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-[88px] w-full rounded-2xl bg-primary/5" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-3xl border border-dashed border-border h-48">
        <CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground font-medium">Tidak ada agenda mendatang</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {events.map((event, idx) => {
        const eventDate = event.date
        const isToday = eventDate.toDateString() === new Date().toDateString()

        return (
          <div
            key={event.id || idx}
            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/20 group-hover:bg-primary transition-colors duration-300" />

            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary">
              <span className="text-[10px] font-bold uppercase tracking-wider">{format(eventDate, 'MMM', { locale: id })}</span>
              <span className="text-2xl font-black leading-none">{format(eventDate, 'dd')}</span>
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-baseline gap-2 mb-1.5">
                {isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-wider shrink-0">
                    Hari Ini
                  </span>
                )}
                <h4 className="font-bold text-foreground truncate text-sm sm:text-base group-hover:text-primary transition-colors">
                  {event.title}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>
                    {event.startTime ? new Date(event.startTime).toLocaleTimeString(['id-ID'], { hour: '2-digit', minute: '2-digit' }) : "Seharian"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">
                    {event.room === 'Lainnya' ? event.locationDetail : formatCamelCaseLabel(event.room)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const menuItems = [
  {
    name: "Ticket Management",
    description: "Kelola tiket bantuan dan layanan WhatsApp",
    href: "/dashboard/ticket-management",
    icon: TicketXIcon,
    color: "bg-blue-500/10 text-blue-500",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    name: "Daftar Agenda",
    description: "Pantau dan kelola agenda kegiatan unit dan program studi untuk menghindari konflik jadwal",
    href: "/dashboard/monitoring-kegiatan",
    icon: List,
    color: "bg-purple-500/10 text-purple-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI],
  },
  {
    name: "Reminder",
    description: "Atur pengingat dan jadwal notifikasi",
    href: "/dashboard/reminder/buat-jadwal",
    icon: AlarmClock,
    color: "bg-orange-500/10 text-orange-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR],
  },
  {
    name: "Notulensi Rapat",
    description: "Arsip dan pembuatan notulensi rapat",
    href: "/dashboard/notulensi-rapat",
    icon: Inbox,
    color: "bg-green-500/10 text-green-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR],
  },
  {
    name: "Partnership Monitoring",
    description: "Pantau kerjasama dengan mitra luar",
    href: "/dashboard/partnership-monitoring/pengajuan",
    icon: ParkingMeter,
    color: "bg-pink-500/10 text-pink-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR],
  },
  {
    name: "Kontrak Manajemen",
    description: "Kelola dokumen kontrak manajemen",
    href: "/dashboard/kontrak-management",
    icon: Newspaper,
    color: "bg-yellow-500/10 text-yellow-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR],
  },
  // {
  //   name: "Sasaran Mutu",
  //   description: "Kelola dan pantau sasaran mutu unit",
  //   href: "/dashboard/sasaran-mutu",
  //   icon: Crosshair,
  //   color: "bg-emerald-500/10 text-emerald-500",
  //   allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR],
  // },
  {
    name: "Laporan Manajemen",
    description: "Akses berbagai laporan manajemen FEB",
    href: "/dashboard/laporan-management",
    icon: Newspaper,
    color: "bg-cyan-500/10 text-cyan-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR],
  },
  {
    name: "Akreditasi LAMEMBA",
    description: "Dokumentasi akreditasi LAMEMBA",
    href: "/dashboard/akreditasi-lamemba",
    icon: GraduationCap,
    color: "bg-red-500/10 text-red-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI],
  },
  {
    name: "Akreditasi AACSB",
    description: "Dokumentasi akreditasi internasional AACSB",
    href: "/dashboard/akreditasi-aacsb",
    icon: Award,
    color: "bg-indigo-500/10 text-indigo-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI],
  },
  {
    name: "Data Pegawai",
    description: "Rekapitulasi data pegawai FEB",
    href: "/dashboard/jumlah-pegawai",
    icon: Users,
    color: "bg-slate-500/10 text-slate-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN],
  },
  {
    name: "Pusat Bantuan",
    description: "Bantuan memahami setiap langkah penggunaan fitur MIRA",
    href: "/dashboard/pusat-bantuan",
    icon: GitGraph,
    color: "bg-green-500/10 text-green-500",
    allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN, ROLES.MAHASISWA],
  },
]

export default function DashboardHome() {
  const router = useRouter()
  const { user } = useAuth()
  const userRole = user?.role

  const filteredNavigation = menuItems.filter((item) => {
    // A. Jika tidak ada batasan role, tampilkan (return true)
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true
    }

    // B. Jika ada batasan, cek apakah role user ada di daftar allowedRoles
    return item.allowedRoles.includes(userRole)
  })

  return (
    <div className="space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-8 md:p-12 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              <HighlightText variant="box" className="text-primary">
                Integrated Management Information System
              </HighlightText>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                Selamat Datang, <br />
                <span>
                  <TypewriterText
                    words={["Sobat Mira", `${user?.name || "Sahabat Mira"}`]}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60"
                  />
                </span>
              </h1>
              <p className="text-lg font-medium text-foreground/80">
                MIRA FEB - Telkom University
              </p>
            </div>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Selamat datang di pusat kendali MIRA. {" "}
              <MorphingText
                words={[
                  "Pantau Kegiatan",
                  "Kelola Dokumen",
                  "Tingkatkan Produktivitas",
                ]}
                interval={3000}
                animationDuration={0.5}
                className="whitespace-nowrap"
              />
              {" "} Fakultas Ekonomi dan Bisnis dalam satu platform terintegrasi.
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-xl shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold">Sistem Aktif</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-xl shadow-sm">
                <span className="text-sm font-bold text-[#377A7F]">FEB</span>
                <span className="w-1 h-3 bg-border rounded-full" />
                <span className="text-sm font-medium text-muted-foreground">Telkom University</span>
              </div>
            </div>
          </div>

          <div className="hidden xl:block relative w-64 h-64">
            {/* Decorative graphic placeholder or icon large */}
            <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-primary/10 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center mt-8">
              <Image
                className='transparent/10'
                src="/logo-feb.png"
                alt="Dashboard"
                width={200}
                height={200}
              />
            </div>
          </div>
        </div>

        {/* Decorative element background */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Menu Layanan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNavigation.map((item) => (
              <Card
                key={item.name}
                className="group hover:border-primary transition-all cursor-pointer hover:shadow-md border-muted-foreground/10"
                onClick={() => router.push(item.href)}
              >
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className={`p-2 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Upcoming Events
            </h2>
            <Link href="/dashboard/monitoring-kegiatan" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
              Lihat Semua
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <UpcomingEventsList />
        </div>
      </div>
    </div>
  )
}

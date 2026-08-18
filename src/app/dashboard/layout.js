"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  ScreenShare,
  ScreenShareOff,
  ChevronRightIcon,
  UserCog2,
  MoreVertical,
  User,
  Palette,
  Search,
  Bell,
  ChevronRight,
  Home,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

import { navigation, ROLES } from "@/lib/navigation";
import RoleGuard from "@/components/Auth/RoleGuard";
import { DropdownMenuSub } from "@radix-ui/react-dropdown-menu";

// ─── Breadcrumb labels ─────────────────────────────────────────────────────────
const routeLabels = {
  "dashboard": "Dashboard",
  "ticket-management": "Ticket Management",
  "monitoring-kegiatan": "Daftar Agenda",
  "reminder": "Reminder",
  "notulensi-rapat": "Notulensi Rapat",
  "partnership-monitoring": "Partnership Monitoring",
  "kerjasama": "Kerjasama",
  "kontrak-management": "Kontrak Manajemen",
  "laporan-management": "Laporan Manajemen",
  "akreditasi-lamemba": "Akreditasi LAMEMBA",
  "akreditasi-aacsb": "Akreditasi AACSB",
  "jumlah-pegawai": "Data Pegawai",
  "halo-dekan": "Halo Dekan",
  "surat-menyurat": "Administrasi Surat",
  "log-tanda-tangan": "Log TTD Dekan",
  "manajemen-acara": "Manajemen Acara",
  "rtm": "RTM",
  "rtm-old": "RTM (Lama)",
  "pusat-bantuan": "Pusat Bantuan",
  "account": "Akun Saya",
  "users": "User Management",
  "units": "Unit Management",
  "ticket-archive": "Arsip Tiket",
  "tickets": "Tiket",
  "tambah-penerima": "Tambah Penerima",
  "buat-jadwal": "Buat Jadwal",
  "pengajuan": "Pengajuan",
  "monitoring": "Monitoring",
  "pengaduan-baru": "Pengaduan Baru",
  "riwayat-tiket": "Riwayat Tiket",
  "verifikasi-laporan": "Verifikasi Laporan",
  "disposisi-laporan": "Disposisi Laporan",
  "tindak-lanjut-pengaduan": "Tindak Lanjut",
  "monitoring-laporan": "Monitoring Laporan",
  "kanban": "Kanban Board",
  "timeline": "Timeline",
  "laporan": "Laporan Kegiatan",
};

function useBreadcrumbs() {
  const pathname = usePathname();
  if (!pathname) return [];
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: routeLabels[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

// ─── Global Search ─────────────────────────────────────────────────────────────
const allSearchableRoutes = Object.entries(routeLabels)
  .filter(([key]) => key !== "dashboard")
  .map(([key, label]) => ({ label, href: `/dashboard/${key}` }));

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  const results =
    query.trim().length > 0
      ? allSearchableRoutes
          .filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6)
      : [];

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (href) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 dark:bg-white/5 border border-border/50 hover:border-primary/40 backdrop-blur-md text-muted-foreground hover:text-foreground transition-all duration-200 text-sm w-48 shadow-sm"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Cari fitur...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
          />
          <div className="absolute top-full left-0 mt-2 w-80 z-50 rounded-2xl border border-border/60 bg-background/95 dark:bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari modul atau fitur..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            {results.length > 0 ? (
              <div className="p-1.5 max-h-60 overflow-y-auto">
                {results.map((r) => (
                  <button
                    key={r.href}
                    onClick={() => handleSelect(r.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm text-left"
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {r.label}
                  </button>
                ))}
              </div>
            ) : query.trim().length > 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Tidak ditemukan untuk &quot;{query}&quot;
              </div>
            ) : (
              <div className="p-3">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                  Navigasi Cepat
                </p>
                {allSearchableRoutes.slice(0, 5).map((r) => (
                  <button
                    key={r.href}
                    onClick={() => handleSelect(r.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm text-left"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Notification Bell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-background/60 dark:bg-white/5 border border-border/50 hover:border-primary/40 backdrop-blur-md text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-background animate-pulse" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 z-50 rounded-2xl border border-border/60 bg-background/95 dark:bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <span className="font-semibold text-sm">Notifikasi</span>
              <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">
                1 Baru
              </span>
            </div>
            <div className="p-3 space-y-1.5">
              <div className="flex gap-3 p-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 animate-pulse" />
                <div>
                  <p className="text-sm font-medium leading-snug">Sistem MIRA aktif</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Semua layanan berjalan normal
                  </p>
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5 border-t border-border/40">
              <p className="text-xs text-muted-foreground text-center">
                Tidak ada notifikasi lain
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── User Dropdown ─────────────────────────────────────────────────────────────
export function UserDropdown({ user, logout, isCollapsed }) {
  const { setTheme } = useTheme();

  const themes = [
    { name: "light", bg: "bg-white", primary: "bg-blue-500", secondary: "bg-slate-200", accent: "bg-pink-500" },
    { name: "dark", bg: "bg-slate-950", primary: "bg-blue-600", secondary: "bg-slate-800", accent: "bg-purple-500" },
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isCollapsed ? (
          <Button variant="ghost" className="h-8 w-8 rounded-2xl p-0 flex items-center justify-center">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
              <AvatarFallback className="rounded-lg">
                {user?.name?.substring(0, 2)?.toUpperCase() || "AO"}
              </AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <div className="group relative isolate overflow-hidden flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-300 w-full bg-card/10 select-none border border-transparent hover:border-border/50 hover:shadow-sm">
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent z-0 transform-gpu will-change-transform ${
                mounted ? "animate-[shimmer-rtl_1.5s_linear_infinite]" : ""
              } group-hover:animate-[shimmer-ltr_1.5s_linear_infinite]`}
            />
            <Avatar className="h-9 w-9 rounded-lg relative z-10 transition-transform duration-300 ease-out group-hover:scale-105">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                {user?.name?.substring(0, 2)?.toUpperCase() || "AO"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left space-y-0.5 relative z-10">
              <p className="text-[13px] font-semibold truncate text-foreground leading-none transition-colors group-hover:text-primary">
                {user?.name || "Anonymous"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-none transition-opacity group-hover:text-foreground">
                {user?.username || "tebakanonim"}
              </p>
            </div>
            <MoreVertical className="w-4 h-4 text-muted-foreground shrink-0 opacity-40 group-hover:opacity-100 transition-opacity relative z-10" />
          </div>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isCollapsed ? "center" : "end"}
        side="right"
        sideOffset={12}
        className="w-60 rounded-xl p-1.5 shadow-xl border-border/40"
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-2 pb-3 mb-1 border-b border-border/40">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {user?.name?.substring(0, 2)?.toUpperCase() || "AO"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left space-y-1">
              <p className="text-sm font-semibold truncate text-foreground leading-none">
                {user?.name || "Anonymous"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-none">
                {user?.role || ""}
              </p>
            </div>
          </div>
        )}

        {user?.role === "admin" && (
          <>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5 py-2">
              <Link href="/dashboard/users" className="flex items-center gap-2.5">
                <UserCog2 className="size-4 opacity-70" />
                <span>User Management</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5 py-2">
              <Link href="/dashboard/units" className="flex items-center gap-2.5">
                <UserCog2 className="size-4 opacity-70" />
                <span>Unit Management</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5 py-2">
          <Link href="/dashboard/account" className="flex items-center gap-2.5">
            <User className="size-4 opacity-70" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-lg cursor-pointer my-0.5 py-2">
            <div className="flex items-center gap-2.5">
              <Palette className="size-4 opacity-70" />
              <span>Appearance</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-xl p-1.5 shadow-xl border-border/40 min-w-[10rem]">
              {themes.map((t) => (
                <DropdownMenuItem
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className="cursor-pointer flex items-center gap-3 py-2"
                >
                  <div className={`${t.bg} flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/50 shadow-sm`}>
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className={`${t.primary} h-1.5 w-1.5 rounded-full`} />
                      <div className={`${t.secondary} h-1.5 w-1.5 rounded-full`} />
                      <div className={`${t.accent} h-1.5 w-1.5 rounded-full`} />
                      <div className={`${t.bg} h-1.5 w-1.5 rounded-full border-[0.5px] border-black/20 dark:border-white/20`} />
                    </div>
                  </div>
                  <span className="capitalize">{t.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <div className="h-px bg-border/50 my-1 -mx-1" />

        <DropdownMenuItem
          onClick={logout}
          className="text-red-500 rounded-lg cursor-pointer focus:text-red-600 focus:bg-red-500/10 dark:focus:bg-red-950 my-0.5 py-2"
        >
          <LogOut className="size-4 mr-2.5 opacity-90" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── App Sidebar ───────────────────────────────────────────────────────────────
function AppSidebar({ isFullscreen, handleFullscreen }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, fetchFreshUserData } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const userRole = user?.role;

  const fullscreenItem = { name: "Fullscreen", action: "fullscreen", icon: ScreenShare };

  const filteredNavigation = navigation.filter((item) => {
    // A. Jika tidak ada batasan role, tampilkan (return true)
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;

    // B. Jika ada batasan, cek apakah role user ada di daftar allowedRoles
    // ATAU apakah menu ini/submenu-nya ada di dalam accessibleMenus
    const hasRoleAccess = item.allowedRoles.includes(userRole);
    const hasAccessibleMenu =
      user?.accessibleMenus?.includes(item.href) ||
      (item.submenu && item.submenu.some((sub) => user?.accessibleMenus?.includes(sub.href)));

    return hasRoleAccess || hasAccessibleMenu;
  });

  // Tambahkan item fullscreen ke navigasi untuk sidebar saja
  const sidebarNavigation = [...filteredNavigation, fullscreenItem];

  useEffect(() => {
    fetchFreshUserData();
  }, []);

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0">
            <Image
              src="/logo-feb.png"
              alt="MIRA Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-md truncate">MIRA</span>
            <span className="font-semibold text-[10px] truncate leading-tight">
              Media Informasi dan Relasi Anda
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarMenu className="px-2 cursor-pointer">
          {sidebarNavigation.map((item, index) => {
            // Jika menu adalah fullscreen
            if (item.action === "fullscreen") {
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <Button
                      variant={isFullscreen ? "default" : "link"}
                      className={`${
                        isFullscreen ? "shadow-lg" : "dark:text-white"
                      } hover:bg-secondary flex items-center justify-start w-full`}
                      onClick={handleFullscreen}
                    >
                      {isFullscreen ? (
                        <ScreenShareOff className="h-4 w-4 shrink-0" />
                      ) : (
                        <item.icon className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">
                        {isFullscreen ? "Exit Fullscreen" : item.name}
                      </span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Jika menu memiliki submenu
            if (item.submenu && item.submenu.length > 0) {
              const isActive = pathname === item.href || pathname?.startsWith(item.href);

              return (
                <Collapsible key={item.name} defaultOpen={false} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={isActive ? "bg-primary text-white font-semibold" : ""}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                        <ChevronRightIcon className="size-4 ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.submenu
                          .filter((subItem) => {
                            if (!subItem.allowedRoles || subItem.allowedRoles.length === 0) return true;
                            return (
                              subItem.allowedRoles.includes(userRole) ||
                              user?.accessibleMenus?.includes(subItem.href)
                            );
                          })
                          .map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                onClick={() => router.push(subItem.href)}
                                isActive={pathname === subItem.href}
                              >
                                {subItem.name.length > 20
                                  ? subItem.name.slice(0, 20) + "..."
                                  : subItem.name}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            // Menu tanpa submenu
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  onClick={() => router.push(item.href)}
                  className={pathname === item.href ? "bg-primary text-white font-semibold" : ""}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t">
        <UserDropdown user={user} logout={logout} isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}

// ─── Topbar ────────────────────────────────────────────────────────────────────
function Topbar() {
  const { user } = useAuth();
  const breadcrumbs = useBreadcrumbs();

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 sticky top-0 z-20 shadow-sm">
      <div className="flex h-14 items-center px-4 gap-3">
        {/* Sidebar toggle */}
        <SidebarTrigger className="-ml-1 shrink-0" />

        {/* Divider */}
        <div className="h-5 w-px bg-border/60 shrink-0" />

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1 min-w-0 flex-1">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5 shrink-0" />
          </Link>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              {crumb.isLast ? (
                <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Spacer on mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Right actions: Search + Bell + Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <GlobalSearch />
          <NotificationBell />

          {/* Avatar shortcut to profile */}
          <Link href="/dashboard/account" className="shrink-0">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-background/60 dark:bg-white/5 border border-border/50 hover:border-primary/40 backdrop-blur-md transition-all duration-200 shadow-sm overflow-hidden group">
              <Avatar className="h-7 w-7 rounded-lg">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold group-hover:bg-primary/20 transition-colors">
                  {user?.name?.substring(0, 2)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard Layout ──────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Error enabling fullscreen:", err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error("Error exiting fullscreen:", err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <RoleGuard>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar isFullscreen={isFullscreen} handleFullscreen={handleFullscreen} />

          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 overflow-auto p-4">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </RoleGuard>
  );
}
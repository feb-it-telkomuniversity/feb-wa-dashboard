"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  ScreenShare,
  ScreenShareOff,
  Sun,
  LoaderIcon,
  ChevronRightIcon,
  UserCog2,
  Settings2,
  Monitor,
  Moon,
  MoreVertical,
  User,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function UserDropdown({ user, logout, isCollapsed }) {
  const { setTheme, theme } = useTheme();

  // // Dark mode keyboard shortcut 'M'
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if ((e.key === "m" || e.key === "M") && !e.ctrlKey && !e.metaKey) {
  //       if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
  //       setTheme(theme === "dark" ? "light" : "dark");
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [theme, setTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isCollapsed ? (
          <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-2xl mx-auto flex items-center justify-center">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
              <AvatarFallback className="rounded-lg">
                {user?.name?.substring(0, 2)?.toUpperCase() || "AO"}
              </AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors w-full bg-card/10 select-none group">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {user?.name?.substring(0, 2)?.toUpperCase() || "AO"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left space-y-0.5">
              <p className="text-[13px] font-semibold truncate text-foreground leading-none">
                {user?.name || "Anonymous"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-none">
                {user?.username || "tebakanonim"}
              </p>
            </div>
            <MoreVertical className="w-4 h-4 text-muted-foreground shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isCollapsed ? "center" : "end"} side="right" sideOffset={12} className="w-60 rounded-xl p-1.5 shadow-xl border-border/40">
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
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5 py-2">
            <Link href="/dashboard/users" className="flex items-center gap-2.5">
              <UserCog2 className="size-4 opacity-70" />
              <span>User Management</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5 py-2">
          <Link href="/dashboard/account" className="flex items-center gap-2.5">
            <User className="size-4 opacity-70" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          className="rounded-lg cursor-pointer my-0.5 py-2 justify-between"
        >
          <div className="flex items-center gap-2.5">
            {theme === "dark" ? <Sun className="size-4 opacity-70" /> : <Moon className="size-4 opacity-70" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            M
          </kbd>
        </DropdownMenuItem>

        <div className="h-px bg-border/50 my-1 -mx-1" />

        <DropdownMenuItem onClick={logout} className="text-red-500 rounded-lg cursor-pointer focus:text-red-600 focus:bg-red-500/10 dark:focus:bg-red-950 my-0.5 py-2">
          <LogOut className="size-4 mr-2.5 opacity-90" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppSidebar({ isFullscreen, handleFullscreen }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoading, fetchFreshUserData } = useAuth()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const userRole = user?.role

  const fullscreenItem = { name: "Fullscreen", action: "fullscreen", icon: ScreenShare }

  const filteredNavigation = navigation.filter((item) => {
    // A. Jika tidak ada batasan role, tampilkan (return true)
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true
    }

    // B. Jika ada batasan, cek apakah role user ada di daftar allowedRoles
    return item.allowedRoles.includes(userRole)
  })

  // Tambahkan item fullscreen ke navigasi untuk sidebar saja
  const sidebarNavigation = [...filteredNavigation, fullscreenItem]

  const handleNavigation = (href) => {
    router.push(href)
  }

  useEffect(() => {
    fetchFreshUserData()
  }, [])

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="p-4">
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
                      className={`${isFullscreen
                        ? "shadow-lg"
                        : "text-black dark:text-white"
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
                <Collapsible
                  key={item.name}
                  defaultOpen={false}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={
                          isActive
                            ? "bg-primary text-white font-semibold"
                            : ""
                        }
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                        <ChevronRightIcon className="size-4 ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.submenu.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              onClick={() => handleNavigation(subItem.href)}
                              isActive={pathname === subItem.href}
                            >
                              {subItem.name}
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
                  onClick={() => handleNavigation(item.href)}
                  className={
                    pathname === item.href
                      ? "bg-primary text-white font-semibold"
                      : ""
                  }
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

export default function DashboardLayout({ children }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error("Error attempting to exit fullscreen:", err);
        });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }
  }, [])

  return (
    <RoleGuard>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar isFullscreen={isFullscreen} handleFullscreen={handleFullscreen} />

          <div className="flex-1 flex flex-col min-w-0">
            <header className="border-b border-dashed bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
              <div className="flex h-14 items-center px-4 gap-2">
                <SidebarTrigger className="-ml-1" />
                <div className="flex-1" />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </RoleGuard>
  );
}
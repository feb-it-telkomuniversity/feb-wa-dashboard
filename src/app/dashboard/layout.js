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

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UserButton({ user, logout, showLogout = false }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
            <AvatarFallback>
              {user?.name
                ?.split(" ")[0]
                ?.substring(0, 2)
                ?.toUpperCase() || "AO"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={8}>
        <DropdownMenuItem>
          <Link href="/dashboard/account" className="flex items-center gap-2">
            <Settings2 /> Manage Account
          </Link>
        </DropdownMenuItem>
        {user?.role === "admin" && (
          <DropdownMenuItem>
            <Link className="flex items-center gap-2" href="/dashboard/users">
              <UserCog2 /> User Management
            </Link>
          </DropdownMenuItem>
        )}
        {showLogout && logout && (
          <>
            <div className="h-px bg-border my-1" />
            <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
        {isCollapsed ? (
          <div className="flex justify-center w-full">
            <UserButton user={user} logout={logout} showLogout={true} />
          </div>
        ) : (
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <UserButton user={user} logout={logout} />
              <div className="flex-1 min-w-0 overflow-hidden space-y-2">
                <p className="text-sm font-semibold truncate leading-none mb-1">
                  {user?.name || "Anonymous"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] text-muted-foreground truncate mt-1">
                    {user?.username || "tebakanonim"}
                  </p>
                  {/* <p className="text-[10px] text-muted-foreground truncate font-medium bg-primary/20 w-fit px-1.5 py-0.5 rounded border border-primary/20">
                    {user?.role || "User"}
                  </p> */}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <ModeToggle />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">
                {isLoading ? (
                  <LoaderIcon className="animate-spin size-4" />
                ) : (
                  "Keluar"
                )}
              </span>
            </Button>
          </Card>
        )}
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
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
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
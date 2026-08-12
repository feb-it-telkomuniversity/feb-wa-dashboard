'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, LayoutGrid, Columns, FileSpreadsheet, Sparkles } from 'lucide-react'

export default function ManajemenAcaraLayout({ children }) {
    const pathname = usePathname()

    const navItems = [
        { name: 'Dashboard', href: '/dashboard/manajemen-acara', icon: LayoutGrid },
        { name: 'Kanban Board', href: '/dashboard/manajemen-acara/kanban', icon: Columns },
        { name: 'Timeline Acara', href: '/dashboard/manajemen-acara/timeline', icon: CalendarDays },
        { name: 'Laporan Kegiatan', href: '/dashboard/manajemen-acara/laporan', icon: FileSpreadsheet },
    ]

    return (
        <div className="space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                        Manajemen Acara
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1.5">
                        Kelola persiapan, pelaksanaan, dan laporan pertanggungjawaban kegiatan secara kolaboratif.
                    </p>
                </div>
            </div>

            {/* Tab Navigation Menu */}
            <div className="flex border-b border-border/80 pb-px overflow-x-auto scrollbar-none shrink-0 gap-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-all border-b-2 outline-hidden whitespace-nowrap ${
                                isActive 
                                    ? 'border-primary text-primary font-bold' 
                                    : 'border-transparent text-muted-foreground hover:text-foreground/90'
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            {/* Main Content Area */}
            <div className="mt-4 animate-in fade-in-50 duration-300">
                {children}
            </div>

        </div>
    )
}

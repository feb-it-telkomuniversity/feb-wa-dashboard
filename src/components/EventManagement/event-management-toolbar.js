'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    Sparkles, 
    Search, 
    SlidersHorizontal, 
    Plus, 
    AlertTriangle,
    LayoutGrid, 
    Columns, 
    CalendarDays, 
    FileSpreadsheet 
} from 'lucide-react'
import { formatCamelCaseLabel } from '@/lib/utils'

export default function EventManagementToolbar({
    title = "Manajemen Acara",
    totalCount = 0,
    conflictCount = 0,
    searchQuery = "",
    setSearchQuery,
    filterUnit = "all",
    setFilterUnit,
    filterStatus = "all",
    setFilterStatus,
    units = [],
    onCreateClick,
    extraActions,
}) {
    const pathname = usePathname()
    const [filterOpen, setFilterOpen] = useState(false)

    const navItems = [
        { name: 'Dashboard', href: '/dashboard/manajemen-acara', icon: LayoutGrid },
        { name: 'Kanban Board', href: '/dashboard/manajemen-acara/kanban', icon: Columns },
        { name: 'Timeline Acara', href: '/dashboard/manajemen-acara/timeline', icon: CalendarDays },
        { name: 'Laporan Kegiatan', href: '/dashboard/manajemen-acara/laporan', icon: FileSpreadsheet },
    ]

    const activeFilterCount = [
        filterUnit && filterUnit !== 'all',
        filterStatus && filterStatus !== 'all'
    ].filter(Boolean).length

    return (
        <Card className="border-border/60 shadow-2xs">
            <CardContent className="p-2 sm:px-3 sm:py-2">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
                    
                    {/* Left: Title & Quick Stats */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-sm font-bold text-primary whitespace-nowrap shrink-0 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-primary shrink-0" />
                            {title}
                        </span>

                        <div className="h-3.5 w-px bg-border shrink-0 hidden sm:block" />

                        <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-muted/40 border-border/60 text-foreground whitespace-nowrap">
                                <span className="font-semibold">{totalCount}</span>
                                <span className="text-muted-foreground text-[11px]">Total</span>
                            </div>
                            {conflictCount > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900 text-red-600 whitespace-nowrap">
                                    <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                                    <span className="font-semibold">{conflictCount}</span>
                                    <span className="text-red-500 text-[11px]">Bentrokan</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Search, Filter, Tabs, Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end min-w-0">
                        
                        {/* Search Input */}
                        {setSearchQuery && (
                            <div className="relative flex-1 sm:w-44 md:w-52 min-w-[130px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Cari kegiatan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8 text-xs w-full"
                                />
                            </div>
                        )}

                        {/* Filter Popover */}
                        {(setFilterUnit || setFilterStatus) && (
                            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1.5 relative shrink-0">
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                        <span className="text-xs hidden sm:inline">Filter</span>
                                        {activeFilterCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center leading-none">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-64 p-3">
                                    <div className="space-y-3">
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Opsi Filter</p>
                                        
                                        {setFilterUnit && (
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Unit</label>
                                                <Select value={filterUnit} onValueChange={setFilterUnit}>
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Semua Unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Unit</SelectItem>
                                                        {units.map((unit) => (
                                                            <SelectItem key={unit} value={unit}>
                                                                {formatCamelCaseLabel(unit)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {setFilterStatus && (
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Status Jadwal</label>
                                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Semua Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Status</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="conflict">Bentrokan Jadwal</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {activeFilterCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs h-7 text-muted-foreground hover:text-foreground"
                                                onClick={() => {
                                                    if (setFilterUnit) setFilterUnit('all')
                                                    if (setFilterStatus) setFilterStatus('all')
                                                }}
                                            >
                                                Reset Filter
                                            </Button>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Segmented Nav Tabs */}
                        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/60 border border-border/50 shrink-0">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap ${
                                            isActive
                                                ? 'bg-background shadow-2xs text-primary font-bold'
                                                : 'text-muted-foreground hover:text-foreground font-medium'
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="hidden md:inline">{item.name}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Extra Actions */}
                        {extraActions}

                        {/* Create Button */}
                        {onCreateClick && (
                            <Button
                                onClick={onCreateClick}
                                size="sm"
                                className="h-8 text-xs px-2.5 gap-1.5 shrink-0"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Buat Acara Baru</span>
                            </Button>
                        )}

                    </div>

                </div>
            </CardContent>
        </Card>
    )
}

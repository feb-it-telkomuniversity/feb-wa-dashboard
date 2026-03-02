'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { CalendarDays, LayoutGrid, Search, Columns } from "lucide-react";
import { Input } from "../ui/input";

import { formatCamelCaseLabel } from "@/lib/utils";
import TabsTableView from "./tabs-table-view";
import TabsBoardView from "./tabs-board-view";
import TabsCalendarView from "./tabs-calendar-view";

const TableActivityMonitoring = ({
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterUnit,
    setFilterUnit,
    units,
    filterStatus,
    setFilterStatus,
    filteredActivities,
    isLoading = false,
    pagination = { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
    currentPage = 1,
    onPageChange,
    getStatusBadge,
    exportToGoogleCalendar,
    onEdit,
    onSuccess
}) => {
    return (
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Filter & Tampilan</CardTitle>
                        <TabsList>
                            <TabsTrigger value="table" className="gap-2">
                                <LayoutGrid className="h-4 w-4" />
                                Tabel
                            </TabsTrigger>
                            <TabsTrigger value="board" className="gap-2">
                                <Columns className="h-4 w-4" />
                                Board
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Calendar
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kegiatan, atau unit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterUnit} onValueChange={setFilterUnit}>
                                <SelectTrigger className="w-[180px]">
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
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="conflict">Ada Konflik</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table View */}
            <TabsContent value="table" className="mt-0">
                <TabsTableView isLoading={isLoading} pagination={pagination} currentPage={currentPage} onPageChange={onPageChange} filteredActivities={filteredActivities} onEdit={onEdit} onSuccess={onSuccess} exportToGoogleCalendar={exportToGoogleCalendar} getStatusBadge={getStatusBadge} />
            </TabsContent>

            {/* Card View */}
            <TabsContent value="board" className="mt-0">
                <TabsBoardView filteredActivities={filteredActivities} exportToGoogleCalendar={exportToGoogleCalendar} getStatusBadge={getStatusBadge} />
            </TabsContent>

            {/* Calendar View */}
            <TabsContent value="calendar" className="mt-0">
                <TabsCalendarView filteredActivities={filteredActivities} onEdit={onEdit} />
            </TabsContent>
        </Tabs>
    )
}

export default TableActivityMonitoring
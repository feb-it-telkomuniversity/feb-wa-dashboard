"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import TableManagementReport from "@/components/ManagementReport/table-management-report";
import AddManagementReport from "@/components/ManagementReport/add-management-report";
import EditManagementReport from "@/components/ManagementReport/edit-management-report";
import ExportExcelButton from "@/components/shared/ExportExcelButton";

export default function LaporanManagementPage() {
  const [selectedIndicator, setSelectedIndicator] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [stats, setStats] = useState({
    total: 0,
    completedTW1: 0,
    completedTW2: 0,
    completedTW3: 0,
    completedTW4: 0,
  });

  // Calculate stats
  const totalIndicators = stats.total
  const completedTW1 = stats.completedTW1
  const completedTW2 = stats.completedTW2
  const completedTW3 = stats.completedTW3
  const completedTW4 = stats.completedTW4

  const handleStatusUpdate = async (indicatorId, quarter, value) => {
    try {
      toast.success("Status berhasil diperbarui", {
        style: { background: "#dcfce7", color: "#166534" },
        className: "border border-green-500"
      })
    } catch (error) {
      console.error("Gagal update status:", error)
      toast.error("Gagal memperbarui status", {
        style: { background: "#fee2e2", color: "#991b1b" },
        className: "border border-red-500"
      })
    }
  };

  const handleEditIndicator = (indicator) => {
    setSelectedIndicator({ ...indicator });
    setIsEditDialogOpen(true);
  }

  const handleStatsUpdate = (newStats) => {
    setStats(newStats);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#e31e25]">
            Laporan Management
          </h1>
          <p className="text-muted-foreground">
            Monitoring indikator laporan manajemen fakultas per triwulan
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Indikator
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIndicators}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Indikator LAPMAN
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TW 1</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTW1}</div>
            <p className="text-xs text-muted-foreground mt-1">
              dari {totalIndicators} indikator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TW 2</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTW2}</div>
            <p className="text-xs text-muted-foreground mt-1">
              dari {totalIndicators} indikator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TW 3</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTW3}</div>
            <p className="text-xs text-muted-foreground mt-1">
              dari {totalIndicators} indikator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TW 4</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTW4}</div>
            <p className="text-xs text-muted-foreground mt-1">
              dari {totalIndicators} indikator
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress TW 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((completedTW1 / totalIndicators) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTW1} dari {totalIndicators} indikator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress TW 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((completedTW2 / totalIndicators) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTW2} dari {totalIndicators} indikator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress TW 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((completedTW3 / totalIndicators) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTW3} dari {totalIndicators} indikator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress TW 4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((completedTW4 / totalIndicators) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTW4} dari {totalIndicators} indikator
            </p>
          </CardContent>
        </Card>
      </div>

      <TableManagementReport
        onEditIndicator={handleEditIndicator}
        onAddReport={() => setIsAddDialogOpen(true)}
        onStatusUpdate={handleStatusUpdate}
        onStatsUpdate={handleStatsUpdate}
        refreshKey={refreshKey}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />

      <AddManagementReport
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          toast.success("Data Laporan Manajemen berhasil ditambahkan", {
            style: { background: "#dcfce7", color: "#166534" },
            className: "border border-green-500"
          })
          setIsAddDialogOpen(false)
          setRefreshKey((prev) => prev + 1)
        }}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />

      <EditManagementReport
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedIndicator={selectedIndicator}
        onSuccess={() => {
          toast.success("Data Laporan Manajemen berhasil diubah", {
            style: { background: "#dcfce7", color: "#166534" },
            className: "border border-green-500"
          })
          setIsEditDialogOpen(false)
          setRefreshKey((prev) => prev + 1)
        }}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />

    </div>
  );
}

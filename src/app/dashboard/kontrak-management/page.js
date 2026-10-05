'use client'

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import TableContractManagement from "@/components/ContractManagement/TableContractManagement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CheckCircle2,
  FileText,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  Download,
  Eye,
  FileBox,
} from "lucide-react";
import api from "@/lib/axios";

const iconMap = {
  FileText,
  Target,
  CheckCircle2,
  BarChart3,
};

const KontrakManagement = () => {
  const { user } = useAuth();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role?.toLowerCase());
  
  const [statsData, setStatsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const res = await api.get("/api/contract-management/stats")
        if (!res.data.success) {
          console.error("Gagal mengambil data stats:", res.data.message)
          return
        }

        const mapped = res.data.data.map((item) => ({
          ...item,
          iconKey: item.iconKey,
        }))
        setStatsData(mapped)
      } catch (error) {
        console.error("Error fetch stats:", error)
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    };

    fetchStats()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start mt-1 gap-3">
          <div className="p-3 rounded-xl bg-primary dark:bg-primary/20">
            <FileText className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Kontrak Manajemen</h1>
            <p className="text-muted-foreground">
              Pantau status Kontrak Manajemen (KM)
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full space-y-4">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="dashboard" className="py-2.5">Dashboard</TabsTrigger>
          <TabsTrigger value="table" className="py-2.5">Tabel Kontrak Manajemen</TabsTrigger>
          <TabsTrigger value="document" className="py-2.5">Dokumen / Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => {
              const IconComponent = iconMap[stat.iconKey] || FileText;

              return (
                <Card key={index} className={isLoading ? "animate-pulse" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={
                          stat.trend === "up" ? "text-green-600" : "text-red-600"
                        }
                      >
                        {stat.change}
                      </span>
                      <span>{stat.description}</span>
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Grafik Per Tahun</CardTitle>
                <CardDescription>Tren capaian kontrak manajemen per tahun</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-md border border-dashed m-6 mt-0">
                <p className="text-muted-foreground flex flex-col items-center gap-2">
                  <BarChart3 className="h-8 w-8 opacity-20" />
                  Visualisasi Grafik Per Tahun
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Capaian Triwulan</CardTitle>
                <CardDescription>Rekapan persentase capaian per triwulan</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-md border border-dashed m-6 mt-0">
                <p className="text-muted-foreground flex flex-col items-center gap-2">
                  <BarChart3 className="h-8 w-8 opacity-20" />
                  Visualisasi Grafik Triwulan
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <TableContractManagement />
        </TabsContent>

        <TabsContent value="document" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dokumen & Laporan</CardTitle>
                <CardDescription>
                  Arsip dokumen kontrak manajemen yang telah disahkan
                </CardDescription>
              </div>
              {isAdmin && (
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Dokumen
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4 border-b bg-muted/50 font-medium grid grid-cols-12 gap-4 text-sm text-muted-foreground">
                  <div className="col-span-1">No</div>
                  <div className="col-span-5">Nama Dokumen</div>
                  <div className="col-span-2">Tanggal Upload</div>
                  <div className="col-span-2">Ukuran</div>
                  <div className="col-span-2 text-right">Aksi</div>
                </div>
                
                {/* Dummy Data */}
                {[
                  { id: 1, name: "Laporan Capaian Kontrak Manajemen Q1 2026.pdf", date: "15 Apr 2026", size: "2.4 MB" },
                  { id: 2, name: "Dokumen Kontrak Manajemen 2026 (Signed).pdf", date: "10 Jan 2026", size: "5.1 MB" },
                ].map((doc, idx) => (
                  <div key={doc.id} className="p-4 border-b last:border-0 grid grid-cols-12 gap-4 items-center text-sm hover:bg-muted/30 transition-colors">
                    <div className="col-span-1 text-muted-foreground">{idx + 1}</div>
                    <div className="col-span-5 font-medium flex items-center gap-2">
                      <FileBox className="h-4 w-4 text-primary opacity-70" />
                      {doc.name}
                    </div>
                    <div className="col-span-2 text-muted-foreground">{doc.date}</div>
                    <div className="col-span-2 text-muted-foreground">{doc.size}</div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default KontrakManagement
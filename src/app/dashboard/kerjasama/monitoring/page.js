'use client'

import { FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { GrowthTrendByYearChart } from "@/components/PartnershipMonitoring/growth-trend-by-year-chart"
import { ProportionPartnershipCategory } from "@/components/PartnershipMonitoring/proportion-partnership-cateogory-chart"
import { ScopeChart } from "@/components/PartnershipMonitoring/scope-chart"
import TableCombined from "@/components/PartnershipMonitoring/table-combined"
import UnifiedPartnershipCard from "@/components/PartnershipMonitoring/unified-partnership-card"
import { getStoredReminderDays } from "@/components/PartnershipMonitoring/partnership-reminder"
import api from "@/lib/axios"

const PersetujuanPenerapan = () => {
    const [statusData, setStatusData] = useState({
        totalMoA: 0,
        totalMoU: 0,
        totalIA: 0,
        activePartnerGroup: 0,
        expiringCount: 0
    })

    const fetchDashboardData = async (days) => {
        try {
            const reminderDays = days || getStoredReminderDays()
            const response = await api.get('/api/partnership/stats', {
                params: { reminderDays }
            })
            if (response.data?.data) {
                setStatusData(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-xl p-2.5 flex justify-center items-center">
                        <FileText className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Persetujuan & Penerapan Kerjasama</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Pantau dokumen persetujuan (MoU/MoA diajukan) serta penerapan kerjasama.
                        </p>
                    </div>
                </div>
            </div>

            {/* Satu Kartu Minimalis: Menyatukan Pengingat Dokumen & 4 Metrik Ringkasan */}
            <UnifiedPartnershipCard
                statusData={statusData}
                onRefreshStats={fetchDashboardData}
            />

            {/* Chart */}
            <div className='grid xl:grid-cols-3 sm:grid-cols-2 gap-3'>
                <GrowthTrendByYearChart />
                <ProportionPartnershipCategory />
                <ScopeChart />
            </div>

            {/* Combined Table */}
            <TableCombined />
        </div>
    )
}

export default PersetujuanPenerapan

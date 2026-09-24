"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import api from "@/lib/axios"

const COLORS = [
  "#0d9488", // teal-600
  "#0284c7", // sky-600
  "#6366f1", // indigo-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#8b5cf6", // purple-500
]

const chartConfig = {
  value: {
    label: "Dokumen",
  },
}

export function ProportionPartnershipCategory() {
  const [chartData, setChartData] = useState([])
  const [total, setTotal] = useState(0)

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/partnership/chart`)
      const rawData = res?.data?.data?.documentByCategory || []
      const formatted = rawData.map((d, i) => ({
        name: d.name || "Lainnya",
        value: Number(d.value) || 0,
        fill: COLORS[i % COLORS.length],
      }))
      setChartData(formatted)
      setTotal(formatted.reduce((acc, curr) => acc + curr.value, 0))
    } catch (error) {
      console.error("Gagal memuat kategori kerjasama:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Proporsi Kategori</CardTitle>
        <CardDescription className="text-xs">
          Distribusi dokumen berdasarkan bidang kerjasama.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2 flex items-center justify-center">
        {chartData.length === 0 ? (
          <p className="text-xs text-muted-foreground py-10 text-center">Data tidak tersedia</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[190px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground flex items-center justify-between">
        <span className="font-medium text-foreground">{chartData.length} kategori aktif</span>
        <span>Total {total} dokumen</span>
      </CardFooter>
    </Card>
  )
}

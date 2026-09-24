"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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
import { useEffect, useState } from "react"
import api from "@/lib/axios"

const chartConfig = {
  desktop: {
    label: "Dokumen",
    color: "var(--chart-1)",
  },
}

export function GrowthTrendByYearChart() {
  const [chartData, setChartData] = useState([])
  const [growthPercentage, setGrowthPercentage] = useState(0)

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/partnership/chart`)
      const rawData = res?.data?.data?.documentsByYear || []

      const mapp = rawData.map((data) => ({
        tahun: data.name,
        jumlah: data.value,
      }))

      setChartData(mapp)

      if (mapp.length >= 2) {
        const last = mapp[mapp.length - 1].jumlah;
        const prev = mapp[mapp.length - 2].jumlah;

        if (prev > 0) {
          const growth = ((last - prev) / prev) * 100;
          setGrowthPercentage(growth);
        } else {
          setGrowthPercentage(0);
        }
      } else {
        setGrowthPercentage(0);
      }
    } catch (error) {
      console.error("Gagal memuat tren pertumbuhan:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Tren Pertumbuhan per Tahun</CardTitle>
        <CardDescription className="text-xs">
          Jumlah dokumen kerjasama per tahun.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        {chartData.length === 0 ? (
          <p className="text-xs text-muted-foreground py-10 text-center">Data tidak tersedia</p>
        ) : (
          <ChartContainer config={chartConfig} className="max-h-[190px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 15,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="tahun"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 4)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="jumlah" fill="var(--color-desktop)" radius={[6, 6, 0, 0]}>
                <LabelList
                  position="top"
                  offset={8}
                  className="fill-foreground font-medium"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1 font-medium text-foreground">
          {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}% tren tahun ini
          <TrendingUp className={`h-3.5 w-3.5 ${growthPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
        </span>
        <span>{chartData.length} tahun terakhir</span>
      </CardFooter>
    </Card>
  )
}

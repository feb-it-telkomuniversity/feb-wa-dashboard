"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"

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

const chartConfig = {
  international: {
    label: "Internasional",
    color: "#0f766e",
  },
  national: {
    label: "Nasional",
    color: "#06b6d4",
  },
  value: {
    label: "Total",
  },
}

export function ScopeChart() {
  const [chartData, setChartData] = useState([])
  const [total, setTotal] = useState(0)

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/partnership/chart`)
      const rawData = res?.data?.data?.documentByScope || []
      const mapp = rawData.map((data) => ({
        name: data.name,
        value: data.value,
      }))
      setChartData(mapp)
      setTotal(mapp.reduce((acc, curr) => acc + curr.value, 0))
    } catch (error) {
      console.error("Gagal memuat data jangkauan mitra:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Jangkauan Mitra</CardTitle>
        <CardDescription className="text-xs">
          Perbandingan mitra internasional vs nasional.
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
              layout="vertical"
              margin={{
                left: 10,
                right: 20,
                top: 15,
                bottom: 5,
              }}
            >
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={6}
                axisLine={false}
                width={80}
                tickFormatter={(value) =>
                  chartConfig[value?.toLowerCase()]?.label || value
                }
              />
              <XAxis dataKey="value" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartConfig[entry.name?.toLowerCase()]?.color || "#0d9488"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground flex items-center justify-between">
        <span className="font-medium text-foreground">Distribusi wilayah</span>
        <span>Total {total} mitra</span>
      </CardFooter>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts"

type ChartData = {
  month: string
  agreements: number
  revenue: number
}

export function DashboardCharts() {
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats")
        const data = await res.json()
        if (res.ok && data.monthlyChartData) {
          setMonthlyData(data.monthlyChartData)
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchChartData()
    
    // Refresh every 30 seconds to stay in sync with stats
    const interval = setInterval(fetchChartData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Generate revenue data from monthly data
  const revenueData = monthlyData.map((item) => ({
    month: item.month,
    revenue: item.revenue,
  }))
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border border-border/60 bg-white shadow-sm">
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/60 bg-white shadow-sm">
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ================= Monthly Agreements ================= */}
      <Card className="rounded-2xl border border-border/60 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-[17px] font-semibold text-foreground">
            Project Statistics
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />

                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                />

                <Bar
                  dataKey="agreements"
                  radius={[10, 10, 0, 0]}
                  fill="url(#barGradient)"
                />

                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C9CFF" />
                    <stop offset="100%" stopColor="#A5B4FC" />
                  </linearGradient>
                </defs>

              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ================= Revenue Trend ================= */}
      <Card className="rounded-2xl border border-border/60 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-[17px] font-semibold text-foreground">
            Revenue Trend
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />

                <Tooltip
                  contentStyle={{
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6EE7B7"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#34D399",
                    strokeWidth: 0,
                  }}
                />

              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, TrendingUp, IndianRupee, Users } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalAgreements: 0,
    monthlyAgreements: 0,
    totalRevenue: 0,
    activeClients: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats")
        const data = await res.json()
        if (res.ok) {
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
    
    // Refresh every 30 seconds to stay in sync with charts
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formatRevenue = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    return `₹${amount.toLocaleString()}`
  }

  const statsData = [
    {
      label: "Total Agreements",
      value: stats.totalAgreements.toLocaleString(),
      change: "+12%",
      icon: FileText,
    },
    {
      label: "Monthly Agreements",
      value: stats.monthlyAgreements.toLocaleString(),
      change: "+8%",
      icon: TrendingUp,
    },
    {
      label: "Total Revenue",
      value: formatRevenue(stats.totalRevenue),
      change: "+15%",
      icon: IndianRupee,
    },
    {
      label: "Active Clients",
      value: stats.activeClients.toLocaleString(),
      change: "+5%",
      icon: Users,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statsData.map((stat) => {
        const Icon = stat.icon

        return (
          <Card
            key={stat.label}
            className="rounded-2xl bg-white border border-border/60 shadow-sm hover:shadow-md transition"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <span className="text-sm font-semibold text-emerald-600">
                  {stat.change}
                </span>
              </div>

              <div className="text-2xl font-bold tracking-tight text-foreground">
                {loading ? "..." : stat.value}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

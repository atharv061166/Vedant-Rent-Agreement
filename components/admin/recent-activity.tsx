"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MapPin, Phone, Briefcase, DollarSign, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Activity = {
  id: string
  client: string
  action: string
  building: string
  region: string
  flatNo: string
  contactNo: string
  agentName: string
  totalAmount: number
  startDate: string
  endDate: string
  ownerName: string
  ownerPhone: string
  tenantName: string
  tenantPhone: string
  ownerTokenNo: string
  tenantTokenNo: string
  time: string
  status: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/dashboard/recent-activity")
      const data = await res.json()
      if (res.ok) {
        setActivities(data.activities || [])
      } else {
        setError(data?.error || "Failed to fetch activities")
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      setError("Failed to fetch activities")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Recently completed agreements (max 20)</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivities}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading activities...</div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{activity.client}</p>
                    <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                      {activity.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{activity.flatNo ? `${activity.flatNo}, ` : ""}{activity.building}, {activity.region}</span>
                    </div>
                    {activity.contactNo && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{activity.contactNo}</span>
                      </div>
                    )}
                    {activity.agentName && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{activity.agentName}</span>
                      </div>
                    )}
                    {activity.totalAmount > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3" />
                        <span>₹{activity.totalAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-black shadow-xl border border-slate-200 max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Completed Agreement Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Property</p>
                            <p className="font-medium">{activity.flatNo ? `${activity.flatNo}, ` : ""}{activity.building}, {activity.region}</p>
                          </div>
                          {activity.ownerName && (
                            <div>
                              <p className="text-muted-foreground">Owner Name</p>
                              <p className="font-medium">{activity.ownerName}</p>
                            </div>
                          )}
                          {activity.ownerPhone && (
                            <div>
                              <p className="text-muted-foreground">Owner Contact</p>
                              <p className="font-medium">{activity.ownerPhone}</p>
                            </div>
                          )}
                          {activity.tenantName && (
                            <div>
                              <p className="text-muted-foreground">Tenant Name</p>
                              <p className="font-medium">{activity.tenantName}</p>
                            </div>
                          )}
                          {activity.tenantPhone && (
                            <div>
                              <p className="text-muted-foreground">Tenant Contact</p>
                              <p className="font-medium">{activity.tenantPhone}</p>
                            </div>
                          )}
                          {activity.ownerTokenNo && (
                            <div>
                              <p className="text-muted-foreground">Owner Token No</p>
                              <p className="font-medium">{activity.ownerTokenNo}</p>
                            </div>
                          )}
                          {activity.tenantTokenNo && (
                            <div>
                              <p className="text-muted-foreground">Tenant Token No</p>
                              <p className="font-medium">{activity.tenantTokenNo}</p>
                            </div>
                          )}
                          {activity.agentName && (
                            <div>
                              <p className="text-muted-foreground">Agent Name</p>
                              <p className="font-medium">{activity.agentName}</p>
                            </div>
                          )}
                          {activity.totalAmount > 0 && (
                            <div>
                              <p className="text-muted-foreground">Total Amount</p>
                              <p className="font-medium">₹{activity.totalAmount.toLocaleString()}</p>
                            </div>
                          )}
                          {activity.startDate && (
                            <div>
                              <p className="text-muted-foreground">Agreement Start Date</p>
                              <p className="font-medium">
                                {new Date(activity.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {activity.endDate && (
                            <div>
                              <p className="text-muted-foreground">Agreement End Date</p>
                              <p className="font-medium">
                                {new Date(activity.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Completed At</p>
                            <p className="font-medium">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No completed agreements yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

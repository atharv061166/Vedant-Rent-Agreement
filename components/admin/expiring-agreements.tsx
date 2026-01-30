"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Phone, MapPin, Eye, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ExpiringClient {
  id: string
  clientName: string
  phone: string
  building: string
  region: string
  endDate: string
  daysLeft: number
  ownerName?: string
  ownerPhone?: string
  tenantName?: string
  tenantPhone?: string
  Token_No?: string
  ownerAgent?: string
  tenantAgent?: string
}

interface ExpiringCardProps {
  client: ExpiringClient
  urgency: "critical" | "warning" | "normal"
}

function ExpiringCard({ client, urgency }: ExpiringCardProps) {
  return (
    <Card
      className={cn(
        "border-l-4",
        urgency === "critical" && "border-l-destructive",
        urgency === "warning" && "border-l-warning",
        urgency === "normal" && "border-l-muted-foreground",
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="font-medium">{client.clientName}</p>
              <Badge
                className={cn(
                  urgency === "critical" && "bg-destructive text-destructive-foreground",
                  urgency === "warning" && "bg-warning text-warning-foreground",
                  urgency === "normal" && "bg-secondary text-secondary-foreground",
                )}
              >
                {client.daysLeft} days left
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {client.phone}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {client.building}, {client.region}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires: {new Date(client.endDate).toLocaleDateString("en-IN")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white text-black shadow-xl border border-slate-200 max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{client.clientName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {client.ownerName && (
                      <div>
                        <p className="text-muted-foreground">Owner Name</p>
                        <p className="font-medium">{client.ownerName}</p>
                      </div>
                    )}
                    {client.ownerPhone && (
                      <div>
                        <p className="text-muted-foreground">Owner Contact</p>
                        <p className="font-medium">{client.ownerPhone}</p>
                      </div>
                    )}
                    {client.tenantName && (
                      <div>
                        <p className="text-muted-foreground">Tenant Name</p>
                        <p className="font-medium">{client.tenantName}</p>
                      </div>
                    )}
                    {client.tenantPhone && (
                      <div>
                        <p className="text-muted-foreground">Tenant Contact</p>
                        <p className="font-medium">{client.tenantPhone}</p>
                      </div>
                    )}
                    {!client.ownerName && !client.tenantName && (
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{client.phone || "N/A"}</p>
                      </div>
                    )}
                    {client.Token_No && (
                      <div>
                        <p className="text-muted-foreground">Token No</p>
                        <p className="font-medium">{client.Token_No}</p>
                      </div>
                    )}
                    {client.ownerAgent && (
                      <div>
                        <p className="text-muted-foreground">Owner Agent</p>
                        <p className="font-medium">{client.ownerAgent}</p>
                      </div>
                    )}
                    {client.tenantAgent && (
                      <div>
                        <p className="text-muted-foreground">Tenant Agent</p>
                        <p className="font-medium">{client.tenantAgent}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Agreement End Date</p>
                      <p className="font-medium">
                        {new Date(client.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days Remaining</p>
                      <p className="font-medium">{client.daysLeft} days</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Renew
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ExpiringAgreements() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients")
        const data = await res.json()
        if (res.ok) {
          setClients(data.clients || [])
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  // Calculate days until expiration and categorize clients
  const expiringData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sevenDays: ExpiringClient[] = []
    const fifteenDays: ExpiringClient[] = []
    const thirtyDays: ExpiringClient[] = []

    clients.forEach((client) => {
      if (!client.agreementEndDate) return

      const endDate = new Date(client.agreementEndDate)
      endDate.setHours(0, 0, 0, 0)

      // Only include future dates
      if (endDate < today) return

      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Determine client name and phone
      let clientName = client.name || ""
      let phone = client.phone || ""

      // If owner/tenant names exist, use them
      if (client.ownerName && client.tenantName) {
        clientName = `${client.ownerName} / ${client.tenantName}`
      } else if (client.ownerName) {
        clientName = client.ownerName
        phone = client.ownerPhone || phone
      } else if (client.tenantName) {
        clientName = client.tenantName
        phone = client.tenantPhone || phone
      }

      // Build token display
      let tokenDisplay = client.tokenNo || ""
      if (client.ownerTokenNo && client.tenantTokenNo) {
        tokenDisplay = `Owner: ${client.ownerTokenNo} | Tenant: ${client.tenantTokenNo}`
      } else if (client.ownerTokenNo) {
        tokenDisplay = client.ownerTokenNo
      } else if (client.tenantTokenNo) {
        tokenDisplay = client.tenantTokenNo
      }

      const expiringClient: ExpiringClient = {
        id: client.id,
        clientName,
        phone,
        building: client.building || "Unknown Building",
        region: client.region || "Unknown Region",
        endDate: client.agreementEndDate,
        daysLeft,
        ownerName: client.ownerName,
        ownerPhone: client.ownerPhone,
        tenantName: client.tenantName,
        tenantPhone: client.tenantPhone,
        Token_No: tokenDisplay,
        ownerAgent: client.ownerAgent,
        tenantAgent: client.tenantAgent,
      }

      if (daysLeft <= 7) {
        sevenDays.push(expiringClient)
      } else if (daysLeft <= 15) {
        fifteenDays.push(expiringClient)
      } else if (daysLeft <= 30) {
        thirtyDays.push(expiringClient)
      }
    })

    // Sort by days left (ascending)
    const sortByDaysLeft = (a: ExpiringClient, b: ExpiringClient) => a.daysLeft - b.daysLeft
    sevenDays.sort(sortByDaysLeft)
    fifteenDays.sort(sortByDaysLeft)
    thirtyDays.sort(sortByDaysLeft)

    return { "7days": sevenDays, "15days": fifteenDays, "30days": thirtyDays }
  }, [clients])

  const totalExpiring = expiringData["7days"].length + expiringData["15days"].length + expiringData["30days"].length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading expiring agreements...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{expiringData["7days"].length}</p>
                <p className="text-sm text-muted-foreground">Expiring in 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{expiringData["15days"].length}</p>
                <p className="text-sm text-muted-foreground">Expiring in 15 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{expiringData["30days"].length}</p>
                <p className="text-sm text-muted-foreground">Expiring in 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring in 7 Days */}
      {expiringData["7days"].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Expiring in 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringData["7days"].map((client) => (
              <ExpiringCard key={client.id} client={client} urgency="critical" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Expiring in 15 Days */}
      {expiringData["15days"].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-warning" />
              Expiring in 15 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringData["15days"].map((client) => (
              <ExpiringCard key={client.id} client={client} urgency="warning" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Expiring in 30 Days */}
      {expiringData["30days"].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Expiring in 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringData["30days"].map((client) => (
              <ExpiringCard key={client.id} client={client} urgency="normal" />
            ))}
          </CardContent>
        </Card>
      )}

      {totalExpiring === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No agreements expiring soon</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

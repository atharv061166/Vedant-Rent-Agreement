"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, User, Eye, Pencil, X, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function ClientManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog & Editing State
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)

  // Accordion State
  const [expandedRegions, setExpandedRegions] = useState<string[]>([])
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>([])

  // Fetch Data
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

  // Prepare Form Data when Client is selected
  useEffect(() => {
    if (selectedClient) {
      setFormData({ ...selectedClient })
      setIsEditing(false) 
    }
  }, [selectedClient])

  // Handle Input Change
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle Save (Update Backend)
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        // 1. Update the local clients list so the UI refreshes instantly
        setClients((prevClients) =>
          prevClients.map((client) => (client.id === formData.id ? formData : client))
        )
        // 2. Update the selected client view
        setSelectedClient(formData)
        // 3. Exit edit mode
        setIsEditing(false)
        console.log("Client updated successfully")
      } else {
        const errData = await res.json();
        console.error("Failed to update client:", errData.error)
        alert(`Error: ${errData.error || "Failed to update"}`)
      }
    } catch (error) {
      console.error("Network error updating client:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Memoized Data Organization
  const clientsData = useMemo(() => {
    const organized: Record<string, Record<string, any[]>> = {}
    
    clients.forEach((client) => {
      const region = client.region || "Unknown Region"
      const building = client.building || "Unknown Building"
      
      if (!organized[region]) organized[region] = {}
      if (!organized[region][building]) organized[region][building] = []
      
      let tokenDisplay = client.tokenNo || ""
      if (client.ownerTokenNo && client.tenantTokenNo) {
        tokenDisplay = `Owner: ${client.ownerTokenNo} | Tenant: ${client.tenantTokenNo}`
      } else if (client.ownerTokenNo) {
        tokenDisplay = client.ownerTokenNo
      } else if (client.tenantTokenNo) {
        tokenDisplay = client.tenantTokenNo
      }

      organized[region][building].push({
        ...client,
        Token_No: tokenDisplay || "N/A", 
      })
    })
    return organized
  }, [clients])

  // Filter Logic
  const filteredClientsData = useMemo(() => {
    if (!searchQuery) return clientsData

    const lowerQuery = searchQuery.toLowerCase()
    const filteredRegions: Record<string, Record<string, any[]>> = {}

    Object.entries(clientsData).forEach(([region, buildings]) => {
      const filteredBuildings: Record<string, any[]> = {}

      Object.entries(buildings).forEach(([building, buildingClients]) => {
        const matchingClients = buildingClients.filter((client) => {
          const searchableText = [
            client.name, client.phone, client.flatNo, client.ownerName,
            client.ownerPhone, client.tenantName, client.tenantPhone,
            client.Token_No, client.ownerAgent, client.tenantAgent
          ].filter(Boolean).join(" ").toLowerCase()
          return searchableText.includes(lowerQuery)
        })

        if (matchingClients.length > 0) filteredBuildings[building] = matchingClients
      })

      if (Object.keys(filteredBuildings).length > 0) filteredRegions[region] = filteredBuildings
    })

    return filteredRegions
  }, [clientsData, searchQuery])

  // Auto-Expansion Logic
  useEffect(() => {
    if (searchQuery) {
      const regionsToOpen = Object.keys(filteredClientsData)
      const buildingsToOpen: string[] = []
      Object.values(filteredClientsData).forEach(buildings => {
        buildingsToOpen.push(...Object.keys(buildings))
      })
      setExpandedRegions(regionsToOpen)
      setExpandedBuildings(buildingsToOpen)
    } else {
      setExpandedRegions([])
      setExpandedBuildings([])
    }
  }, [filteredClientsData, searchQuery])

  // Helper to safely format date for Input type="date"
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    // Handles ISO strings correctly
    return new Date(dateString).toISOString().split('T')[0]
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Client, Owner, Tenant or Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Content */}
      {Object.keys(filteredClientsData).length === 0 && searchQuery ? (
        <div className="text-center py-10 text-muted-foreground">
          No results found for "{searchQuery}"
        </div>
      ) : (
        <Accordion 
          type="multiple" 
          className="space-y-4" 
          value={expandedRegions} 
          onValueChange={setExpandedRegions}
        >
          {Object.entries(filteredClientsData).map(([region, buildings]) => (
            <div key={region} className="border border-border rounded-lg bg-background bg-thick">
              <AccordionItem value={region} className="border border-slate-900 rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:bg-secondary/50 hover:no-underline overflow-hidden">
                  <span className="font-semibold">{region}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Accordion 
                    type="multiple" 
                    className="space-y-3"
                    value={expandedBuildings}
                    onValueChange={setExpandedBuildings}
                  >
                    {Object.entries(buildings).map(([building, buildingClients]) => (
                      <div key={building} className="border border-slate-900 rounded-lg">
                        <AccordionItem value={building} className="border-none">
                          <AccordionTrigger className="px-4 py-3 hover:bg-secondary/50 hover:no-underline text-sm">
                            <div className="flex items-center gap-2">
                              <span>{building}</span>
                              <Badge variant="secondary" className="text-xs">
                                {buildingClients.length} clients
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3">
                              {buildingClients.map((client) => (
                                <Card key={client.id}>
                                  <CardContent className="p-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                      {/* Client Summary */}
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <div>
                                            <p className="font-medium">{client.name}</p>
                                            {client.flatNo && (
                                              <p className="text-sm text-muted-foreground">
                                                Flat: <span className="font-medium">{client.flatNo}</span>
                                              </p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                              {client.phone || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Actions */}
                                      <div className="flex items-center gap-2">
                                        <Badge variant={client.agreementStatus === "active" ? "default" : "outline"}>
                                          {client.agreementStatus}
                                        </Badge>
                                        
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => {
                                            setSelectedClient(client)
                                            setIsDialogOpen(true)
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </div>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      )}

      {/* EDIT/VIEW DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white text-black shadow-xl border border-slate-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <DialogTitle className="text-xl">
              {isEditing ? "Edit Client Details" : selectedClient?.name}
            </DialogTitle>
            
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel Edit
              </Button>
            )}
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6 py-4">
              {/* Primary Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.name || ""} 
                      onChange={(e) => handleInputChange("name", e.target.value)} 
                    />
                  ) : (
                    <p className="font-medium p-2 bg-secondary/20 rounded-md">{selectedClient.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Client Phone</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.phone || ""} 
                      onChange={(e) => handleInputChange("phone", e.target.value)} 
                    />
                  ) : (
                    <p className="font-medium p-2 bg-secondary/20 rounded-md">{selectedClient.phone || "N/A"}</p>
                  )}
                </div>

                {/* Flat No */}
                <div className="space-y-2">
                  <Label>Flat No</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.flatNo || ""} 
                      onChange={(e) => handleInputChange("flatNo", e.target.value)} 
                    />
                  ) : (
                    <p className="font-medium p-2 bg-secondary/20 rounded-md">{selectedClient.flatNo || "N/A"}</p>
                  )}
                </div>

                {/* Agreement Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.agreementStatus || ""} 
                      placeholder="active, pending, expired"
                      onChange={(e) => handleInputChange("agreementStatus", e.target.value)} 
                    />
                  ) : (
                    <p className="font-medium p-2 bg-secondary/20 rounded-md capitalize">{selectedClient.agreementStatus || "N/A"}</p>
                  )}
                </div>
              </div>

              <hr />

              {/* Owner Details */}
              <h3 className="font-semibold text-lg text-muted-foreground">Owner Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  {isEditing ? (
                    <Input value={formData.ownerName || ""} onChange={(e) => handleInputChange("ownerName", e.target.value)} />
                  ) : (
                    <p className="font-medium">{selectedClient.ownerName || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Owner Phone</Label>
                  {isEditing ? (
                    <Input value={formData.ownerPhone || ""} onChange={(e) => handleInputChange("ownerPhone", e.target.value)} />
                  ) : (
                    <p className="font-medium">{selectedClient.ownerPhone || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Owner Agent</Label>
                  {isEditing ? (
                    <Input value={formData.ownerAgent || ""} onChange={(e) => handleInputChange("ownerAgent", e.target.value)} />
                  ) : (
                    <p className="font-medium">{selectedClient.ownerAgent || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Owner Token No</Label>
                  {isEditing ? (
                    <Input value={formData.ownerTokenNo || ""} onChange={(e) => handleInputChange("ownerTokenNo", e.target.value)} />
                  ) : (
                    <p className="font-medium">{selectedClient.ownerTokenNo || "-"}</p>
                  )}
                </div>
              </div>

              <hr />

              {/* Tenant Details */}
              <h3 className="font-semibold text-lg text-muted-foreground">Tenant Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tenant Name</Label>
                  {isEditing ? (
                    <Input value={formData.tenantName || ""} onChange={(e) => handleInputChange("tenantName", e.target.value)} />
                  ) : (
                    <p className="font-medium">{selectedClient.tenantName || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tenant Phone</Label>
                  {isEditing ? (
                    <Input value={formData.tenantPhone || ""} onChange={(e) => handleInputChange("tenantPhone", e.target.value)} />
                  ) : (
                    <p className="font-medium">{selectedClient.tenantPhone || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tenant Agent</Label>
                  {isEditing ? (
                    <Input value={formData.tenantAgent || ""} onChange={(e) => handleInputChange("tenantAgent", e.target.value)} />
                  ) : (
                    <p className="font-medium">{selectedClient.tenantAgent || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tenant Token No</Label>
                  {isEditing ? (
                    <Input value={formData.tenantTokenNo || ""} onChange={(e) => handleInputChange("tenantTokenNo", e.target.value)} />
                  ) : (
                    <p className="font-medium">{selectedClient.tenantTokenNo || "-"}</p>
                  )}
                </div>
              </div>

              <hr />

              {/* Agreement Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label>Agreement End Date</Label>
                  {isEditing ? (
                    <Input 
                      type="date"
                      value={formatDateForInput(formData.agreementEndDate)} 
                      onChange={(e) => handleInputChange("agreementEndDate", e.target.value)} 
                    />
                  ) : (
                    <p className="font-medium">
                      {selectedClient.agreementEndDate 
                        ? new Date(selectedClient.agreementEndDate).toLocaleDateString() 
                        : "N/A"}
                    </p>
                  )}
                </div>
              </div>

            </div>
          )}

          {isEditing && (
            <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
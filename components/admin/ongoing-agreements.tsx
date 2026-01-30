"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Eye,
  User,
  Phone,
  Folder,
  MapPin,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Plus,
  Save,
  Calendar
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Agreement = {
  id?: string | number;
  flatNo: string;
  building?: string;
  region?: string;
  clientType?: "owner" | "tenant";
  clientName?: string;
  contactNo?: string;
  amount?: number;
  agentName?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  status?: string;
  profit?: number;
  ownerAgentCommission?: number;
  owner?: {
    clientName: string;
    contactNo?: string;
    amount?: number;
    agentName?: string;
    startDate?: string;
    endDate?: string;
    tokenNo?: string;
  };
  tenant?: {
    clientName: string;
    contactNo?: string;
    amount?: number;
    agentName?: string;
    startDate?: string;
    endDate?: string;
    tokenNo?: string;
  };
};

/* ===================== HELPER COMPONENTS ===================== */

// 1. Create Folder Dialog Component (For NEW Folders)
const CreateFolderDialog = ({
  onSave,
  saving,
}: {
  onSave: (data: any[]) => Promise<void>;
  saving: boolean;
}) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    flatNo: "",
    building: "",
    region: "Magarpatta city",
    agreementStartDate: "",
    agreementEndDate: "",
    // owner fields
    ownerName: "",
    ownerContact: "",
    ownerAmount: "",
    ownerAgent: "",
    ownerTokenNo: "",
    // tenant fields
    tenantName: "",
    tenantContact: "",
    tenantAmount: "",
    tenantAgent: "",
    tenantTokenNo: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.flatNo) return;

    const payload: any = {
      flatNo: formData.flatNo,
      building: formData.building,
      region: formData.region,

      // ✅ single agreement dates
      startDate: formData.agreementStartDate,
      endDate: formData.agreementEndDate,
    };

    if (formData.ownerName) {
      payload.owner = {
        clientName: formData.ownerName,
        contactNo: formData.ownerContact,
        amount: formData.ownerAmount
          ? Number(formData.ownerAmount)
          : 0,
        agentName: formData.ownerAgent,
        tokenNo: formData.ownerTokenNo,
      };
    }

    if (formData.tenantName) {
      payload.tenant = {
        clientName: formData.tenantName,
        contactNo: formData.tenantContact,
        amount: formData.tenantAmount
          ? Number(formData.tenantAmount)
          : 0,
        agentName: formData.tenantAgent,
        tokenNo: formData.tenantTokenNo,
      };
    }

    if (!payload.owner && !payload.tenant) return;

    // ✅ AUTO-CREATE AGENTS IF THEY DON'T EXIST
    const agentsToCreate: any[] = [];
    if (formData.ownerAgent) {
      agentsToCreate.push({ name: formData.ownerAgent, phone: "", email: "" });
    }
    if (formData.tenantAgent) {
      agentsToCreate.push({ name: formData.tenantAgent, phone: "", email: "" });
    }

    // Process agent creation in background (don't block UI)
    agentsToCreate.forEach(agent => {
      fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent)
      }).catch(err => console.error("Error creating agent:", err));
    });

    await onSave([payload]);

    setOpen(false);

    setFormData({
      flatNo: "",
      building: "",
      region: "Magarpatta city",
      agreementStartDate: "",
      agreementEndDate: "",

      ownerName: "",
      ownerContact: "",
      ownerAmount: "",
      ownerAgent: "",
      ownerTokenNo: "",

      tenantName: "",
      tenantContact: "",
      tenantAmount: "",
      tenantAgent: "",
      tenantTokenNo: "",
    });
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="h-4 w-4" /> New Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white text-black">
        <DialogHeader>
          <DialogTitle>Create New Property Folder</DialogTitle>
          <DialogDescription>
            Enter property details and optional owner/tenant details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 bg-white">
          {/* Property Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider"></h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="flatNo">Flat No / Folder Name</Label>
                <Input id="flatNo" placeholder="e.g. B2-104" value={formData.flatNo} onChange={(e) => handleChange("flatNo", e.target.value)} />
              </div>
              <div className="grid gap-2, bg-white">
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(val) => handleChange("region", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Magarpatta city">Magarpatta City</SelectItem>
                    <SelectItem value="Amanora">Amanora</SelectItem>
                    <SelectItem value="Hadapsar">Hadapsar</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="building">Building Name</Label>
                <Input id="building" placeholder="e.g. Jasmine Towers" value={formData.building} onChange={(e) => handleChange("building", e.target.value)} />

                <div className="grid gap-2 col-span-2">
                  <Label>Agreement Start Date</Label>
                  <Input
                    type="date"
                    value={formData.agreementStartDate}
                    onChange={(e) =>
                      handleChange("agreementStartDate", e.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2 col-span-2">
                  <Label>Agreement End Date</Label>
                  <Input
                    type="date"
                    value={formData.agreementEndDate}
                    onChange={(e) =>
                      handleChange("agreementEndDate", e.target.value)
                    }
                  />
                </div>

              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Token No</Label>
            <Input placeholder="Token Number" value={formData.ownerTokenNo} onChange={(e) => handleChange("ownerTokenNo", e.target.value)} />
          </div>

          {/* Owner Details */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">Owner Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Owner Name</Label>
                <Input placeholder="Owner full name" value={formData.ownerName} onChange={(e) => handleChange("ownerName", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Contact No</Label>
                <Input placeholder="+91..." value={formData.ownerContact} onChange={(e) => handleChange("ownerContact", e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Agent Name</Label>
                <Input placeholder="Agent Name" value={formData.ownerAgent} onChange={(e) => handleChange("ownerAgent", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="0.00" value={formData.ownerAmount} onChange={(e) => handleChange("ownerAmount", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Tenant Details */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">Tenant Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tenant Name</Label>
                <Input placeholder="Tenant full name" value={formData.tenantName} onChange={(e) => handleChange("tenantName", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Contact No</Label>
                <Input placeholder="+91..." value={formData.tenantContact} onChange={(e) => handleChange("tenantContact", e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Agent Name</Label>
                <Input placeholder="Agent Name" value={formData.tenantAgent} onChange={(e) => handleChange("tenantAgent", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="0.00" value={formData.tenantAmount} onChange={(e) => handleChange("tenantAmount", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 2. Add Missing Client Dialog (To add Owner/Tenant to existing folder)
const CreateClientDialog = ({
  type,
  flatNo,
  existingData,
  onSave
}: {
  type: 'owner' | 'tenant',
  flatNo: string,
  existingData: any,
  onSave: (data: any) => void
}) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    clientName: "",
    contactNo: "",
    amount: "",
    agentName: "",
  })

  // Pre-fill building/region from existing folder data (cannot change property details here)
  const building = existingData?.building || ""
  const region = existingData?.region || ""

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.clientName) return;

    onSave({
      id: Date.now(),
      flatNo,
      building,
      region,
      clientType: type,
      ...formData,
      amount: Number(formData.amount)
    })
    setOpen(false)
    setFormData({ clientName: "", contactNo: "", amount: "", agentName: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-blue-600 gap-1">
          <Plus className="h-3 w-3" /> Add {type === 'owner' ? 'Owner' : 'Tenant'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {type === 'owner' ? 'Owner' : 'Tenant'} to {flatNo}</DialogTitle>
          <DialogDescription>
            Adding details for the missing {type} in this property folder.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Full Name" value={formData.clientName} onChange={(e) => handleChange("clientName", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Contact No</Label>
              <Input placeholder="+91..." value={formData.contactNo} onChange={(e) => handleChange("contactNo", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Agent Name</Label>
              <Input placeholder="Agent Name" value={formData.agentName} onChange={(e) => handleChange("agentName", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Amount (₹)</Label>
            <Input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => handleChange("amount", e.target.value)} />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save {type === 'owner' ? 'Owner' : 'Tenant'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


// 3. Person Card Component

const PersonCard = ({
  data,
  type,
  flatNo,
  agreementId,
  existingSiblingData,
  onAddClient
}: {
  data: any
  type: "owner" | "tenant"
  flatNo: string
  agreementId: string
  existingSiblingData: any
  onAddClient: (newData: any) => void
}) => {


  // ✅ local editable amount
  const [amount, setAmount] = useState<number>(data.amount || 0)
  const [saving, setSaving] = useState(false)

  // ✅ save updated amount to firebase
  const handleSaveAmount = async () => {
    try {
      setSaving(true)

      await fetch(`/api/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientType: type,
          amount: amount,
        }),
      })

    } catch (err) {
      console.error("Failed to update amount", err)
    } finally {
      setSaving(false)
    }
  }

  // =============================
  // EMPTY CARD
  // =============================
  if (!data) {
    return (
      <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground bg-gray-50/50 h-full min-h-[160px]">
        <User className="h-8 w-8 mb-2 opacity-20" />
        <span className="text-sm">No {type} assigned</span>

        <CreateClientDialog
          type={type}
          flatNo={flatNo}
          existingData={existingSiblingData}
          onSave={onAddClient}
        />
      </div>
    )
  }

  const isOwner = type === "owner"

  const badgeColor = isOwner
    ? "bg-blue-100 text-blue-800"
    : "bg-purple-100 text-purple-800"

  const borderColor = isOwner
    ? "border-blue-200"
    : "border-purple-200"

  return (
    <div
      className={`relative border rounded-lg p-4 bg-white hover:shadow-md transition-all ${borderColor} border-l-4`}
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <Badge className={`${badgeColor} mb-2 capitalize border-0`}>
            {type}
          </Badge>

          <h4 className="font-semibold text-lg">
            {data.clientName}
          </h4>
        </div>


      </div>

      {/* ================= BODY ================= */}
      <div className="space-y-3">

        {/* phone */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3 w-3" />
          {data.contactNo || "N/A"}
        </div>

        {/* dates */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {data.agreementStartDate
            ? new Date(data.agreementStartDate).toLocaleDateString()
            : "N/A"}
          {" — "}
          {data.agreementEndDate
            ? new Date(data.agreementEndDate).toLocaleDateString()
            : "N/A"}
        </div>

        {/* ================= AMOUNT ================= */}
        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
            Amount
          </label>

          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              ₹
            </span>

            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="pl-7 bg-white border-slate-300 font-medium"
            />
          </div>

          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={handleSaveAmount}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Amount"}
          </Button>
        </div>
      </div>
    </div>
  )
}


// 4. Property Folder Component
const PropertyFolder = ({
  folderName,
  data,
  onAddClient,
  onComplete,
  agreementId
}: {
  folderName: string,
  data: any,
  onAddClient: (newData: any) => void,
  onComplete: (id: string) => void,
  agreementId: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Basic info from whichever client exists
  const infoSource = {
    building: data.building || data.owner?.building || data.tenant?.building,
    region: data.region || data.owner?.region || data.tenant?.region,
  }


  // Determine Agent Name Logic
  const ownerAgent = data.owner?.agentName;
  const tenantAgent = data.tenant?.agentName;

  let displayAgent = "No Agent Assigned";

  if (ownerAgent && tenantAgent) {
    // If both exist, show combined or unique
    displayAgent = ownerAgent === tenantAgent
      ? ownerAgent
      : `${ownerAgent} (Owner) & ${tenantAgent} (Tenant)`;
  } else {
    // Show whichever exists
    displayAgent = ownerAgent || tenantAgent || "No Agent Assigned";
  }

  // ✅ Root Level Profit & Commission State
  const [profit, setProfit] = useState<number>(data.profit || 0)
  const [ownerCommission, setOwnerCommission] = useState<number>(data.ownerAgentCommission || 0)
  const [savingProfit, setSavingProfit] = useState(false)

  const handleSaveProfit = async () => {
    try {
      setSavingProfit(true)
      await fetch(`/api/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profit: profit,
          ownerAgentCommission: ownerCommission,
        }),
      })
    } catch (err) {
      console.error("Failed to update profit", err)
    } finally {
      setSavingProfit(false)
    }
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white shadow-sm mb-4 transition-all">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border-b"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 shrink-0">
            <Folder className="h-6 w-6 fill-yellow-600/20" />
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-800 leading-tight">{folderName}</h3>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{infoSource.building || "Unknown Building"}, {infoSource.region}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded w-fit">
                <Briefcase className="h-3 w-3" />
                {/* ONLY AGENT NAME DISPLAYED HERE */}
                <span>Agent: {displayAgent}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(agreementId);
            }}
          >
            Completed
          </Button>
          <div className="hidden sm:flex items-center gap-2 mr-4">
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${data.owner ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              {data.owner ? 'Owner Active' : 'No Owner'}
            </span>
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${data.tenant ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
              {data.tenant ? 'Tenant Active' : 'No Tenant'}
            </span>
          </div>
          {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* OWNER */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                Owner File
              </h5>

              <PersonCard
                type="owner"
                data={
                  data.owner
                    ? {
                      ...data.owner,
                      agreementStartDate: data.startDate ?? "",
                      agreementEndDate: data.endDate ?? "",
                    }
                    : null
                }
                flatNo={folderName}
                agreementId={agreementId}
                existingSiblingData={data.tenant}
                onAddClient={onAddClient}
              />
            </div>

            {/* TENANT */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                Tenant File
              </h5>

              <PersonCard
                type="tenant"
                data={
                  data.tenant
                    ? {
                      ...data.tenant,
                      agreementStartDate: data.startDate ?? "",
                      agreementEndDate: data.endDate ?? "",
                    }
                    : null
                }
                flatNo={folderName}
                agreementId={agreementId}
                existingSiblingData={data.owner}
                onAddClient={onAddClient}
              />
            </div>
          </div>

          {/* ✅ AGREEMENT PROFIT & COMMISSION SECTION */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm max-w-4xl">

              {/* Total Profit */}
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                  Total Profit (Revenue)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={profit}
                    onChange={(e) => setProfit(Number(e.target.value))}
                    className="pl-7 bg-white border-slate-300 font-medium"
                  />
                </div>
              </div>

              {/* Owner Agent Commission */}
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                  Owner Agent Commission
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={ownerCommission}
                    onChange={(e) => setOwnerCommission(Number(e.target.value))}
                    className="pl-7 bg-white border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="mt-5">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleSaveProfit}
                  disabled={savingProfit}
                >
                  {savingProfit ? "Saving..." : "Save Details"}
                </Button>
              </div>
            </div>
          </div>


        </div>

      )}
    </div>
  )
}

/* ===================== MAIN COMPONENT ===================== */

export function OngoingAgreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [regionFilter, setRegionFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgreements = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/agreements")
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "Failed to load agreements")
        setAgreements(data.agreements || [])
      } catch (err: any) {
        setError(err?.message || "Failed to load agreements")
      } finally {
        setLoading(false)
      }
    }
    fetchAgreements()
  }, [])

  // Handle adding a completely new folder
  const handleCreateFolder = async (newData: any[]) => {
    setSaving(true)
    setError(null)
    try {
      // Send array to API - it handles arrays
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to save folder")

      // API returns array when we send array
      const created = Array.isArray(data) ? data : [data]
      setAgreements((prev) => [...created, ...prev])
    } catch (err: any) {
      setError(err?.message || "Failed to save folder")
    } finally {
      setSaving(false)
    }
  }

  // Handle adding a client to an existing folder
  const handleAddClientToFolder = (newData: any) => {
    setAgreements((prev) => [...prev, newData])
  }

  // Handle completing an agreement
  const handleComplete = async (agreementId: string) => {
    if (!agreementId || agreementId === "undefined" || agreementId === "") {
      setError("Agreement ID is missing. Please refresh the page and try again.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      // Find the agreement data
      // ALWAYS FETCH FRESH DATA FROM FIRESTORE
      const resAgreement = await fetch("/api/agreements")
      const agreementJson = await resAgreement.json()

      const agreement = agreementJson.agreements.find(
        (a: any) => String(a.id) === String(agreementId)
      )

      if (!agreement) {
        throw new Error("Agreement not found")
      }


      if (!agreement) {
        throw new Error("Agreement not found. It may have already been completed.")
      }

      // Mark agreement as completed
      const res = await fetch(`/api/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to complete agreement")

      // Create a single client entry for the whole folder (owner + tenant together)
      const ownerName = agreement.owner?.clientName || ""
      const tenantName = agreement.tenant?.clientName || ""
      const ownerToken = agreement.owner?.tokenNo || ""
      const tenantToken = agreement.tenant?.tokenNo || ""
      const ownerAgent = agreement.owner?.agentName || ""
      const tenantAgent = agreement.tenant?.agentName || ""

      // Combine names for display
      let displayName = ""
      if (ownerName && tenantName) {
        displayName = `${ownerName} & ${tenantName}`
      } else {
        displayName = ownerName || tenantName || "Unknown"
      }

      // Use owner token if available, otherwise tenant token
      const tokenNo = ownerToken || tenantToken || ""

      // Combine phone numbers
      const ownerPhone = agreement.owner?.contactNo || ""
      const tenantPhone = agreement.tenant?.contactNo || ""
      const phone = ownerPhone || tenantPhone || ""

      // Combine agent names
      let agentName = ""
      if (ownerAgent && tenantAgent) {
        agentName = ownerAgent === tenantAgent ? ownerAgent : `${ownerAgent} (Owner) & ${tenantAgent} (Tenant)`
      } else {
        agentName = ownerAgent || tenantAgent || ""
      }

      // Total amount
      const totalAmount = (agreement.owner?.amount || 0) + (agreement.tenant?.amount || 0)

      // Create single client entry representing the whole folder
      const clientData = {
        name: displayName,
        phone: phone,

        region: agreement.region || "",
        building: agreement.building || "",
        flatNo: agreement.flatNo || "",

        tokenNo: tokenNo,
        agentName: agentName,

        ownerName: ownerName,
        ownerPhone: ownerPhone,
        ownerTokenNo: ownerToken,
        ownerAmount: agreement.owner?.amount || 0,
        ownerAgent: ownerAgent,


        tenantName: tenantName,
        tenantPhone: tenantPhone,
        tenantTokenNo: tenantToken,
        tenantAmount: agreement.tenant?.amount || 0,
        tenantAgent: tenantAgent,

        agreementStartDate: agreement.startDate || "",
        agreementEndDate: agreement.endDate || "",


        agreementStatus: "active",
        documents: [],
      }


      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      })

      // Remove from ongoing agreements
      setAgreements((prev) => prev.filter((a) => a.id !== agreementId))
    } catch (err: any) {
      setError(err?.message || "Failed to complete agreement")
    } finally {
      setSaving(false)
    }
  }

  // Group Data Logic - only include non-completed agreements
  // Agreements are already stored with owner/tenant nested, so we just need to filter and organize
  const groupedAgreements = useMemo(() => {
    const groups: Record<
      string,
      {
        owner: any
        tenant: any

        // ✅ add these two
        startDate?: string
        endDate?: string
        building?: string
        region?: string
        agreementId?: string
        profit?: number
        ownerAgentCommission?: number
        tenantAgentCommission?: number
      }
    > = {}


    agreements
      .filter((item) => item.status !== "completed")
      .forEach((item) => {
        // Ensure we have an ID
        if (!item.id) {
          console.warn("Agreement missing ID:", item)
          return
        }

        // If agreement already has owner/tenant structure (new format)
        if (item.owner || item.tenant) {
          if (!groups[item.flatNo]) {
            groups[item.flatNo] = {
              owner: item.owner || null,
              tenant: item.tenant || null,

              // ✅ THIS WAS MISSING
              startDate: item.startDate || "",
              endDate: item.endDate || "",

              building: item.building || "",

              region: item.region,
              agreementId: String(item.id),
              profit: item.profit || 0,
              ownerAgentCommission: item.ownerAgentCommission || 0,
            }
          }


        } else {
          // Legacy format - group by clientType
          if (!groups[item.flatNo]) {
            groups[item.flatNo] = {
              owner: null,
              tenant: null,
              region: item.region,
              agreementId: String(item.id || ""),
              profit: item.profit || 0,
              ownerAgentCommission: item.ownerAgentCommission || 0,
            }
          }
          if (item.clientType === "owner") {
            groups[item.flatNo].owner = item
          } else if (item.clientType === "tenant") {
            groups[item.flatNo].tenant = item
          }
          // Keep the agreement ID
          if (!groups[item.flatNo].agreementId) {
            groups[item.flatNo].agreementId = String(item.id || "")
          }
        }
      })

    return groups
  }, [agreements])

  // Filter Logic
  const filteredFolders = Object.entries(groupedAgreements).filter(([folderName, data]) => {
    const searchLower = searchQuery.toLowerCase()
    const infoSource = data.owner || data.tenant

    // Search logic including clients and agents
    const ownerAgent = data.owner?.agentName || "";
    const tenantAgent = data.tenant?.agentName || "";
    const ownerName = data.owner?.clientName || "";
    const tenantName = data.tenant?.clientName || "";

    const matchesSearch =
      folderName.toLowerCase().includes(searchLower) ||
      ownerName.toLowerCase().includes(searchLower) ||
      tenantName.toLowerCase().includes(searchLower) ||
      (infoSource && infoSource.building?.toLowerCase().includes(searchLower)) ||
      ownerAgent.toLowerCase().includes(searchLower) ||
      tenantAgent.toLowerCase().includes(searchLower)

    const matchesRegion = regionFilter === "all" || infoSource?.region === regionFilter

    return matchesSearch && matchesRegion
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2">

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agreement Folders</h2>
        <p className="text-muted-foreground">Manage owner and tenant agreements by property.</p>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folder, client, building, or agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <CreateFolderDialog onSave={handleCreateFolder} saving={saving} />
        </div>

        <div className="flex justify-end">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white">
              <SelectValue placeholder="Filter Region" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Magarpatta city">Magarpatta City</SelectItem>
              <SelectItem value="Amanora">Amanora</SelectItem>
              <SelectItem value="Hadapsar">Hadapsar</SelectItem>
              <SelectItem value="Pune">Pune</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading agreements...</div>
        ) : filteredFolders.length > 0 ? (
          filteredFolders.map(([folderName, data]) => (
            <PropertyFolder
              key={folderName}
              folderName={folderName}
              data={data}
              onAddClient={handleAddClientToFolder}
              onComplete={handleComplete}
              agreementId={String(data.agreementId || "")}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed">
            <Folder className="h-12 w-12 mx-auto text-slate-300 mb-2" />
            <h3 className="font-medium text-slate-900">No folders found</h3>
            <p className="text-slate-500 text-sm">Create a new folder or adjust filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
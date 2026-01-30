"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Phone,
  User,
  Trash2,
  FileText,
  UserCheck,
  Building2,
  Users,
  ChevronDown, // New Icon
  FilePen      // New Icon
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Make sure you have this component installed

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/* ================= TYPES ================= */

type ClientData = {
  surname: string;
  firstName: string;
  middleName?: string;
  clientPhone?: string;
  [key: string]: any;
};

type ContactRequest = {
  id: string;
  clients?: ClientData[];
  isDraft?: boolean; // Added isDraft field
  [key: string]: any;
};

/* ================= FIELD GROUPS ================= */
// ... (Your field constants remain unchanged)
const CLIENT_META_FIELDS = ["clientType", "partyType", "partyEntityType", "executing", "clientCount"];
const CLIENT_PERSONAL_FIELDS = ["surname", "firstName", "middleName", "clientAge", "gender", "clientPhone", "panCard", "cinNo", "aadharBuilding", "aadharFlat", "aadharRoad", "aadharLocation", "aadharVillage", "aadharDistrict", "aadharState", "aadharPincode"];
const POA_FIELDS = ["poaSurname", "poaFirstName", "poaMiddleName", "poaClientAge", "poaGender", "poaClientPhone", "poaPanCard", "poaCinNo", "poaAadharBuilding", "poaAadharFlat", "poaAadharRoad", "poaAadharLocation", "poaAadharVillage", "poaAadharDistrict", "poaAadharState", "poaAadharPincode"];
const PROPERTY_FIELDS = ["unitType", "address", "buildingName", "flatNumber", "road", "village", "pincode", "residentialStatus"];
const AGREEMENT_FIELDS = ["agreementMonths", "fromDate", "deposit", "rent", "varyingMonth", "varyingRent"];

/* ================= COMPONENT ================= */

export default function RequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [open, setOpen] = useState(false);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((d) => setRequests(d.contacts || []));
  }, []);

  /* ================= UPDATE DRAFT LOGIC ================= */

  const handleDraftUpdate = async (requestId: string, status: boolean) => {
    // 1. Optimistic Update (Update UI immediately)
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, isDraft: status } : req
      )
    );

    try {
      // 2. Call Backend
      const res = await fetch(`/api/contact/${requestId}`, {
        method: "PATCH", // Ensure your API handles PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDraft: status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
    } catch (error) {
      console.error(error);
      alert("Failed to update draft status.");
      // Revert optimistic update on failure could be added here
    }
  };

  /* ================= DELETE LOGIC ================= */

  const handleDelete = async (requestId?: string) => {
    const targetId = requestId || selected?.id;

    if (!targetId) return;
    if (!confirm("Are you sure you want to delete this request permanently?")) return;

    try {
      const res = await fetch(`/api/contact/${targetId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setRequests((prev) => prev.filter((r) => r.id !== targetId));

      if (selected?.id === targetId) {
        setOpen(false);
        setSelected(null);
      }
    } catch (error) {
      console.error(error);
      alert("Delete failed. Please try again.");
    }
  };

  /* ================= RENDER FIELD HELPER ================= */

  const getDynamicLabel = (key: string, entityType: string = "") => {
    if (key.toLowerCase().includes("cinno")) return "CIN No.";
    if (key === "panCard" || key === "poaPanCard") return "PAN Card";

    if (key === "surname") {
      if (["Proprietorship", "Partnership"].includes(entityType)) return "Firm Name";
      if (["Private Limited Company", "Limited Liability Partnership"].includes(entityType)) return "Company Name";
      if (entityType.includes("Government")) return "Name of Undertaking";
      return "Surname"; 
    }

    return key.replace(/([A-Z])/g, " $1").trim();
  };

  const renderField = (key: string, value: any, entityType: string = "") => {
    if (value === undefined || value === null || value === "") return null;
    const label = getDynamicLabel(key, entityType);

    return (
      <div key={key} className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-md">
        <div className="text-muted-foreground capitalize text-xs sm:text-sm font-medium self-center">
          {label}
        </div>
        <div className="font-semibold text-gray-900 text-right break-words text-sm">
          {String(value)}
        </div>
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900">Form Requests</h1>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <p className="text-muted-foreground italic">No requests found.</p>
        ) : (
          requests.map((req) => {
            const hasClientsArray = Array.isArray(req.clients) && req.clients.length > 0;
            const primaryClient = hasClientsArray ? req.clients![0] : req;
            const totalClients = hasClientsArray ? req.clients!.length : 1;

            let displayName = "";
            const isCompany = req.partyEntityType && req.partyEntityType !== "Individual / Self";
            
            if (isCompany) {
              displayName = primaryClient.surname; 
            } else {
              displayName = [primaryClient.firstName, primaryClient.middleName, primaryClient.surname]
                .filter(Boolean)
                .join(" ");
            }

            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow border-gray-200">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* LEFT SIDE: INFO */}
                  <div>
                    <div className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      {isCompany ? (
                        <Building2 className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <User className="h-5 w-5 text-orange-500" />
                      )}
                      <span>{displayName || "Unknown Client"}</span>
                      
                      {totalClients > 1 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Users size={12} /> +{totalClients - 1}
                        </span>
                      )}

                      {/* Draft Status Badge (Visual Indicator) */}
                      {req.isDraft && (
                        <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                          Draft
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{primaryClient.clientPhone || req.poaClientPhone || "No Phone"}</span>
                        </div>
                        {(req.buildingName || req.flatNumber) && (
                            <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-blue-500" />
                            <span className="text-gray-600 font-medium">
                                {req.buildingName}{req.flatNumber && `, Flat:  ${req.flatNumber}`}
                            </span>
                            </div>
                        )}
                        <div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border w-fit ${
                                req.clientType === "Owner" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }`}>
                                {req.clientType}
                            </span>
                            {req.executing === "Through POA" && (
                                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                POA
                                </span>
                            )}
                        </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: BUTTONS */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => { setSelected(req); setOpen(true); }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>

                    {/* NEW: DRAFT DROPDOWN */}
                    <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="outline"
      size="sm"
      className={`flex-1 sm:flex-none border-dashed transition-colors
        ${
          req.isDraft
            ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
            : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
        }
      `}
    >
      <FilePen className="h-3.5 w-3.5 mr-2" />
      Draft: {req.isDraft ? "Complete" : "Incomplete"}
      <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end">
    <DropdownMenuItem
      onClick={() => handleDraftUpdate(req.id, true)}
      className="text-green-600 hover:bg-green-100 focus:bg-green-100"
    >
      ✅ Complete
    </DropdownMenuItem>

    <DropdownMenuItem
      onClick={() => handleDraftUpdate(req.id, false)}
      className="text-red-600 hover:bg-red-100 focus:bg-red-100"
    >
      ❌ Incomplete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>


                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(req.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 shadow-none px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ================= DETAILS DIALOG (Kept same as provided) ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white w-[95vw] max-w-3xl overflow-hidden flex flex-col h-[90vh] p-0 gap-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-orange-500" />
              <span>Request Details</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm bg-gray-50/30">
            {/* 1. CLIENT META DATA */}
            <div className="bg-white p-5 rounded-xl border shadow-sm">
               <h3 className="text-md font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
                 <FileText className="w-4 h-4 text-gray-500" />
                 Agreement Meta Data
               </h3>
               <div className="space-y-2">
                   {CLIENT_META_FIELDS.map((k) => renderField(k, selected?.[k]))}
               </div>
            </div>

            {/* 2. CLIENTS PERSONAL DETAILS (LOOP) */}
            <section className="space-y-4">
              {selected?.clients && Array.isArray(selected.clients) && selected.clients.length > 0 ? (
                selected.clients.map((client, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <h3 className="text-md font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
                      {selected?.partyEntityType && selected.partyEntityType !== "Individual / Self" ? (
                        <Building2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <User className="w-4 h-4 text-emerald-600" />
                      )}
                      {selected?.clientType} {index + 1} Profile
                    </h3>
                    <div className="space-y-2">
                      {CLIENT_PERSONAL_FIELDS.map((k) => renderField(k, client[k], selected?.partyEntityType))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                   <h3 className="text-md font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      Client Profile
                   </h3>
                   <div className="space-y-2">
                     {CLIENT_PERSONAL_FIELDS.map((k) => renderField(k, selected?.[k], selected?.partyEntityType))}
                   </div>
                </div>
              )}
            </section>

            {/* 3. POA DETAILS */}
            {selected?.executing === "Through POA" && (
              <section className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 shadow-sm">
                <h3 className="text-md font-bold text-emerald-900 border-b border-emerald-200 pb-3 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Authorized Person (POA)
                </h3>
                <div className="space-y-2">
                  {POA_FIELDS.map((k) => renderField(k, selected?.[k]))}
                </div>
              </section>
            )}

            {/* 4. PROPERTY DETAILS */}
            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-md font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
                 <Building2 className="w-4 h-4 text-blue-600" />
                Property Information
              </h3>
              <div className="space-y-2">
                {PROPERTY_FIELDS.map((k) => renderField(k, selected?.[k]))}
              </div>
            </section>

            {/* 5. AGREEMENT DETAILS */}
            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-md font-bold text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Agreement Terms
              </h3>
              <div className="space-y-2">
                {AGREEMENT_FIELDS.map((k) => renderField(k, selected?.[k]))}
              </div>
            </section>
          </div>

          <DialogFooter className="p-4 border-t bg-white gap-2 flex-col sm:flex-row sm:justify-end">
            <Button
              variant="destructive"
              onClick={() => handleDelete()}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center gap-2 justify-center"
            >
              <Trash2 className="h-4 w-4" />
              Delete Permanently
            </Button>
            <Button variant="default" onClick={() => setOpen(false)} className="bg-gray-900 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
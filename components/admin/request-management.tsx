"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Phone,
  Eye,
  MapPin,
  User,
  Trash2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ======================================================
   TYPE
====================================================== */

type ContactRequest = {
  id: string;
  status?: string;
  createdAt?: string;
  [key: string]: any;
};

export function RequestManagement() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<ContactRequest | null>(null);
  const [open, setOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => setRequests(data.contacts || []));
  }, []);

  /* ================= SEARCH ================= */

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return requests.filter((req) => {
      const name = [
        req.firstName,
        req.middleName,
        req.surname,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        name.includes(q) ||
        String(req.clientPhone || "").includes(searchQuery)
      );
    });
  }, [requests, searchQuery]);

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!selectedRequest) return;

    if (!confirm("Delete this request permanently?")) return;

    const id = selectedRequest.id;

    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setRequests((prev) =>
        prev.filter((r) => r.id !== id)
      );

      setOpen(false);
      setSelectedRequest(null);
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* SEARCH */}
      <div className="flex justify-between items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Total: {filteredRequests.length}
        </div>
      </div>

      {/* REQUEST LIST */}
      <div className="space-y-3">
        {filteredRequests.map((req) => {
          const name =
            [req.firstName, req.middleName, req.surname]
              .filter(Boolean)
              .join(" ") || "Unknown";

          const address = [
            req.flatNumber,
            req.buildingName,
            req.road,
            req.village,
            req.pincode,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <Card key={req.id}>
              <CardContent className="p-4 flex flex-col lg:flex-row justify-between gap-4">

                {/* INFO */}
                <div className="space-y-1 flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {name}
                  </p>

                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {req.clientPhone || "—"}
                  </p>

                  {address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {address}
                    </p>
                  )}
                </div>

                {/* VIEW */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(req);
                    setOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ✅ SINGLE DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto text-sm">
            {Object.entries(selectedRequest ?? {}).map(
              ([key, value]) => {
                if (
                  key === "id" ||
                  key === "createdAt" ||
                  key === "status"
                )
                  return null;

                return (
                  <div
                    key={key}
                    className="grid grid-cols-2 gap-4 border-b pb-2"
                  >
                    <div className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>

                    <div className="font-medium text-right break-words">
                      {String(value)}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* ✅ DELETE BUTTON — NOW ALWAYS VISIBLE */}
          <div className="flex justify-end pt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              Delete Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

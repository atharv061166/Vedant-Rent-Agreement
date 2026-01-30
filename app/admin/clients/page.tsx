import { ClientManagement } from "@/components/admin/client-management"

export default function ClientsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Client Management</h1>
        <p className="text-muted-foreground">Manage clients by region and building</p>
      </div>

      <ClientManagement />
    </div>
  )
}
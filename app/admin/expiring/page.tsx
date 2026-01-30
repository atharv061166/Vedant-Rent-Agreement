import { ExpiringAgreements } from "@/components/admin/expiring-agreements"

export default function ExpiringPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expiring Agreements</h1>
        <p className="text-muted-foreground">Agreements requiring attention</p>
      </div>

      <ExpiringAgreements />
    </div>
  )
}

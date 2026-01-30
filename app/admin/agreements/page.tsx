import { OngoingAgreements } from "@/components/admin/ongoing-agreements"

export default function AgreementsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ongoing Agreements</h1>
        <p className="text-muted-foreground">Track and manage all active agreements</p>
      </div>

      <OngoingAgreements />
    </div>
  )
}

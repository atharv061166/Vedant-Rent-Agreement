import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const runtime = "nodejs"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ MUST AWAIT PARAMS
    const { id } = await params
    const body = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "Agreement ID missing" },
        { status: 400 }
      )
    }

    const agreementRef = adminDb.collection("agreements").doc(id)
    const agreementSnap = await agreementRef.get()

    if (!agreementSnap.exists) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // ✅ update amount (per client)
    if (body.clientType && typeof body.amount === "number") {
      updateData[`${body.clientType}.amount`] = body.amount;
    }

    // ✅ update profit (root level)
    if (typeof body.profit === "number") {
      updateData.profit = body.profit;
    }

    // ✅ update ownerAgentCommission (root level)
    if (typeof body.ownerAgentCommission === "number") {
      updateData.ownerAgentCommission = body.ownerAgentCommission;
    }

    // ✅ update status
    if (body.status) {
      updateData.status = body.status
      updateData.completedAt =
        body.status === "completed"
          ? new Date().toISOString()
          : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    await agreementRef.update(updateData)

    return NextResponse.json({
      success: true,
      id,
      updated: updateData,
    })
  } catch (error: any) {
    console.error("Agreement PATCH error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message,
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

// --- GET: Fetch All Clients ---
export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Server configuration error: database not initialized" },
        { status: 500 }
      );
    }

    const snapshot = await adminDb
      .collection("clients")
      .orderBy("createdAt", "desc")
      .get();

    const clients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Record<string, unknown>),
    }));

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

// --- POST: Create New Client ---
export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Server configuration error: database not initialized" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      name,
      phone,
      region,
      building,
      flatNo,
      agreementStartDate,
      agreementEndDate,
      clientType,
      amount,
      tokenNo,
      agentName,
      ownerName,
      ownerPhone,
      ownerTokenNo,
      ownerAmount,
      ownerAgent,
      tenantName,
      tenantPhone,
      tenantTokenNo,
      tenantAmount,
      tenantAgent,
      modeOfAgreement,
      documents,
      agreementStatus,
    } = body;

    if (!name || !region || !building) {
      return NextResponse.json(
        { error: "Missing required fields: name, region, building" },
        { status: 400 }
      );
    }

    const clientData: any = {
      name,
      phone: phone || "",
      region,
      building,
      flatNo: flatNo || "",
      agreementStartDate: agreementStartDate || "",
      agreementEndDate: agreementEndDate || "",
      clientType: clientType || "tenant",
      amount: amount ? Number(amount) : 0,
      tokenNo: tokenNo || "",
      agentName: agentName || "",
      modeOfAgreement: modeOfAgreement || "Self Executed",
      documents: documents || [],
      agreementStatus: agreementStatus || "active",
      createdAt: new Date().toISOString(),
    };

    if (ownerName) {
      clientData.ownerName = ownerName;
      clientData.ownerPhone = ownerPhone || "";
      clientData.ownerTokenNo = ownerTokenNo || "";
      clientData.ownerAmount = ownerAmount ? Number(ownerAmount) : 0;
      clientData.ownerAgent = ownerAgent || "";
    }

    if (tenantName) {
      clientData.tenantName = tenantName;
      clientData.tenantPhone = tenantPhone || "";
      clientData.tenantTokenNo = tenantTokenNo || "";
      clientData.tenantAmount = tenantAmount ? Number(tenantAmount) : 0;
      clientData.tenantAgent = tenantAgent || "";
    }

    const docRef = await adminDb.collection("clients").add(clientData);

    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

// --- PUT: Update Existing Client ---
export async function PUT(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Server configuration error: database not initialized" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body; // Separate ID from the rest of the data

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    // Convert numeric strings to numbers if present in the update
    if (updateData.amount) updateData.amount = Number(updateData.amount);
    if (updateData.ownerAmount) updateData.ownerAmount = Number(updateData.ownerAmount);
    if (updateData.tenantAmount) updateData.tenantAmount = Number(updateData.tenantAmount);

    // Update Firestore
    await adminDb.collection("clients").doc(id).update(updateData);

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}
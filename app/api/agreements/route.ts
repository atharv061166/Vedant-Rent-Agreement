import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ===============================
    // MULTIPLE AGREEMENTS (bulk create)
    // ===============================
    if (Array.isArray(body)) {
      const created: any[] = [];

      for (const agreement of body) {
        const { flatNo, building, region, owner, tenant } = agreement;

        if (!flatNo) continue;

        const agreementData: any = {
          flatNo,
          building: building || "",
          region: region || "",

          // ✅ FIXED
          startDate: agreement.startDate || "",
          endDate: agreement.endDate || "",

          createdAt: new Date().toISOString(),
          status: "ongoing",
        };

        if (owner?.clientName) {
          agreementData.owner = {
            clientName: owner.clientName,
            contactNo: owner.contactNo || "",
            amount: owner.amount ? Number(owner.amount) : 0,
            agentName: owner.agentName || "",
            tokenNo: owner.tokenNo || "",
          };
        }

        if (tenant?.clientName) {
          agreementData.tenant = {
            clientName: tenant.clientName,
            contactNo: tenant.contactNo || "",
            amount: tenant.amount ? Number(tenant.amount) : 0,
            agentName: tenant.agentName || "",
            tokenNo: tenant.tokenNo || "",
          };
        }

        const docRef = await adminDb
          .collection("agreements")
          .add(agreementData);

        const snapshot = await docRef.get();

        created.push({
          id: docRef.id,
          ...snapshot.data(),
        });
      }

      return NextResponse.json(created);
    }

    // ===============================
    // SINGLE AGREEMENT
    // ===============================
    const { flatNo, owner, tenant } = body;

    if (!flatNo) {
      return NextResponse.json(
        { error: "Missing required field: flatNo" },
        { status: 400 }
      );
    }

    const agreementData: any = {
      flatNo,
      building: body.building || "",
      region: body.region || "",

      // ✅ FIXED
      startDate: body.startDate || "",
      endDate: body.endDate || "",

      createdAt: new Date().toISOString(),
      status: "ongoing",
    };

    if (owner?.clientName) {
      agreementData.owner = {
        clientName: owner.clientName,
        contactNo: owner.contactNo || "",
        amount: owner.amount ? Number(owner.amount) : 0,
        agentName: owner.agentName || "",
        tokenNo: owner.tokenNo || "",
      };
    }

    if (tenant?.clientName) {
      agreementData.tenant = {
        clientName: tenant.clientName,
        contactNo: tenant.contactNo || "",
        amount: tenant.amount ? Number(tenant.amount) : 0,
        agentName: tenant.agentName || "",
        tokenNo: tenant.tokenNo || "",
      };
    }

    const docRef = await adminDb
      .collection("agreements")
      .add(agreementData);

    const snapshot = await docRef.get();

    return NextResponse.json({
      id: docRef.id,
      ...snapshot.data(),
    });
  } catch (error: any) {
    console.error("Agreement POST error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("agreements")
      .orderBy("createdAt", "desc")
      .get();

    const agreements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ agreements });
  } catch (error: any) {
    console.error("Agreement GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

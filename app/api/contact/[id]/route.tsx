import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/* ================= PATCH (Update Draft Status) ================= */
export async function PATCH(req: Request) {
  try {
    // 1. Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    // 2. Get Data from Body
    const body = await req.json();
    const { isDraft } = body;

    // 3. Update Firestore
    await adminDb
      .collection("contacts")
      .doc(id)
      .update({
        isDraft: isDraft,
        // Optional: Add an updated timestamp if you wish
        // updatedAt: new Date().toISOString() 
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/* ================= DELETE (Remove Request) ================= */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await adminDb
      .collection("contacts")
      .doc(id)
      .delete();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/* ======================================
   POST — SAVE CONTACT FORM
====================================== */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await adminDb.collection("contacts").add({
      ...body,

      status: "new",
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch (error: any) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit form",
      },
      { status: 500 }
    );
  }
}

/* ======================================
   GET — FETCH ALL REQUESTS
====================================== */

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("contacts")
      .orderBy("createdAt", "desc")
      .get();

    const contacts = snapshot.docs.map((doc) => {
      const data = doc.data();

      // convert Firestore objects → plain JSON
      const cleanData: any = {};

      Object.keys(data).forEach((key) => {
        const value = data[key];

        if (value?.toDate) {
          cleanData[key] = value.toDate().toISOString();
        } else {
          cleanData[key] = value ?? "";
        }
      });

      return {
        id: doc.id,
        ...cleanData,
      };
    });

    return Response.json({ contacts });
  } catch (err) {
    return Response.json(
      { error: "Failed to load requests" },
      { status: 500 }
    );
  }
}


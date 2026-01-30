import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
    try {
        const agentsRef = adminDb.collection("agents");
        const snapshot = await agentsRef.get();

        const agents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ agents });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, email } = body;

        if (!name) {
            return NextResponse.json({ error: "Agent Name is required" }, { status: 400 });
        }

        const agentsRef = adminDb.collection("agents");

        // Check if agent already exists
        const snapshot = await agentsRef.where("name", "==", name).get();

        if (!snapshot.empty) {
            // Agent exists, return the existing one
            const doc = snapshot.docs[0];
            return NextResponse.json({
                message: "Agent already exists",
                agent: { id: doc.id, ...doc.data() }
            });
        }

        // Create new agent
        const newAgent = {
            name,
            phone: phone || "",
            email: email || "",
            createdAt: new Date().toISOString(),
        };

        const docRef = await agentsRef.add(newAgent);

        return NextResponse.json({
            message: "Agent created successfully",
            agent: { id: docRef.id, ...newAgent }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

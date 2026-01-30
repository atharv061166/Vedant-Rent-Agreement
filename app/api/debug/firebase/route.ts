import { NextResponse } from "next/server";
import admin from "firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return NextResponse.json({
    hasProjectId: Boolean(projectId),
    hasClientEmail: Boolean(clientEmail),
    hasPrivateKey: Boolean(privateKey),
    adminAppsCount: admin.apps.length,
    privateKeyLength: privateKey?.length ?? 0,
    privateKeyStart: privateKey?.slice(0, 40) ?? null,
    privateKeyEnd: privateKey?.slice(-40) ?? null,
  });
}


import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Server configuration error: database not initialized" },
        { status: 500 }
      );
    }

    // Get all agreements
    const agreementsSnapshot = await adminDb
      .collection("agreements")
      .get();

    const agreements = agreementsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Record<string, unknown>),
    }));

    // Calculate stats
    const totalAgreements = agreements.length;

    // Monthly agreements (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyAgreements = agreements.filter((agreement: any) => {
      if (!agreement.createdAt) return false;
      const createdDate = new Date(agreement.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    // Total revenue (sum of all PROFIT from ALL agreements)
    let totalRevenue = 0;
    agreements.forEach((agreement: any) => {
      totalRevenue += Number(agreement.profit) || 0;
    });

    // Active clients (unique clients from all agreements)
    const activeClients = new Set();
    agreements.forEach((agreement: any) => {
      // ✅ Only count clients from active (non-completed) agreements
      if (agreement.status === "completed") return;

      if (agreement.owner?.clientName) activeClients.add(agreement.owner.clientName);
      if (agreement.tenant?.clientName) activeClients.add(agreement.tenant.clientName);
    });

    // Calculate monthly chart data for last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyChartData: { month: string; agreements: number; revenue: number }[] = [];

    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthName = monthNames[month];

      // Count agreements created in this month
      const monthAgreements = agreements.filter((agreement: any) => {
        if (!agreement.createdAt) return false;
        const createdDate = new Date(agreement.createdAt);
        return createdDate.getMonth() === month && createdDate.getFullYear() === year;
      });

      // Calculate revenue from agreements created/completed in this month
      const monthRevenue = agreements
        .filter((agreement: any) => {
          // Use completedAt if available, otherwise createdAt
          const dateStr = agreement.completedAt || agreement.createdAt;
          if (!dateStr) return false;

          const refDate = new Date(dateStr);
          return refDate.getMonth() === month && refDate.getFullYear() === year;
        })
        .reduce((sum: number, agreement: any) => {
          return sum + (Number(agreement.profit) || 0);
        }, 0);

      monthlyChartData.push({
        month: monthName,
        agreements: monthAgreements.length,
        revenue: monthRevenue,
      });
    }

    return NextResponse.json({
      totalAgreements,
      monthlyAgreements,
      totalRevenue,
      activeClients: activeClients.size,
      monthlyChartData,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

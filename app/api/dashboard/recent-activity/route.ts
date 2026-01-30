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

    let activities: any[] = [];
    
    // Try to use indexed query first (requires composite index: status + completedAt)
    try {
      const snapshot = await adminDb
        .collection("agreements")
        .where("status", "==", "completed")
        .orderBy("completedAt", "desc")
        .limit(20)
        .get();

      activities = snapshot.docs.map((doc) => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
    } catch (indexError: any) {
      // If index doesn't exist, fallback to fetching all and filtering in memory
      console.warn("Composite index not found, using fallback query:", indexError?.message);
      
      // Fetch all agreements and filter/sort in memory
      const allSnapshot = await adminDb
        .collection("agreements")
        .get();
      
      // Filter completed agreements and sort by completedAt
      activities = allSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((agreement: any) => agreement.status === "completed")
        .sort((a: any, b: any) => {
          const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return bTime - aTime; // Descending order
        })
        .slice(0, 20); // Limit to 20
    }

    // Process activities
    const processedActivities = activities.map((item: any) => {
      const data = item;
      const id = item.id;
      const owner = (data.owner || {}) as any;
      const tenant = (data.tenant || {}) as any;
      
      // Combine owner and tenant names for display
      let clientName = "";
      if (owner.clientName && tenant.clientName) {
        clientName = `${owner.clientName} & ${tenant.clientName}`;
      } else {
        clientName = owner.clientName || tenant.clientName || "Unknown Client";
      }
      
      // Combine contact numbers
      const contactNo = owner.contactNo || tenant.contactNo || "";
      
      // Combine agent names
      let agentName = "";
      if (owner.agentName && tenant.agentName) {
        agentName = owner.agentName === tenant.agentName 
          ? owner.agentName 
          : `${owner.agentName} (Owner) & ${tenant.agentName} (Tenant)`;
      } else {
        agentName = owner.agentName || tenant.agentName || "";
      }
      
      // Total amount
      const totalAmount = (owner.amount || 0) + (tenant.amount || 0);
      
      // Agreement dates
      const startDate = data.startDate || "";
      const endDate = data.endDate || "";
      
      return {
        id: id,
        client: clientName,
        action: "Agreement Completed",
        building: data.building || "Unknown Building",
        region: data.region || "Unknown Region",
        flatNo: data.flatNo || "",
        contactNo: contactNo,
        agentName: agentName,
        totalAmount: totalAmount,
        startDate: startDate,
        endDate: endDate,
        ownerName: owner.clientName || "",
        ownerPhone: owner.contactNo || "",
        tenantName: tenant.clientName || "",
        tenantPhone: tenant.contactNo || "",
        ownerTokenNo: owner.tokenNo || "",
        tenantTokenNo: tenant.tokenNo || "",
        time: data.completedAt || data.createdAt,
        status: "completed",
      };
    });

    // Format time relative to now
    const formatTime = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    };

    const formattedActivities = processedActivities.map((activity) => ({
      ...activity,
      time: formatTime(activity.time),
    }));

    return NextResponse.json({ activities: formattedActivities }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

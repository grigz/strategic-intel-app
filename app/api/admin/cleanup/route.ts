import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { competitors } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST() {
  try {
    const duplicateId = "1c81752f-4609-45ea-b6d5-e5aa6c995647";

    // Try to delete the duplicate
    await db.delete(competitors).where(eq(competitors.id, duplicateId));

    // Get all remaining competitors
    const remaining = await db.select().from(competitors);

    return NextResponse.json({
      success: true,
      message: "Deleted duplicate SUSE entry",
      remaining: remaining.map(c => ({ id: c.id, name: c.name, domain: c.domain }))
    });
  } catch (error: any) {
    console.error("Cleanup failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

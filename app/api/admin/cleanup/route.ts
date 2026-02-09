import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { competitors } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST() {
  try {
    const duplicateId = "1c81752f-4609-45ea-b6d5-e5aa6c995647";

    // Try using raw SQL instead
    await db.execute(sql`DELETE FROM competitors WHERE id = ${duplicateId}`);

    // Get all remaining competitors
    const remaining = await db.select().from(competitors);

    return NextResponse.json({
      success: true,
      message: "Deleted duplicate SUSE entry using raw SQL",
      remaining: remaining.map(c => ({ id: c.id, name: c.name, domain: c.domain }))
    });
  } catch (error: any) {
    console.error("Cleanup failed:", error);

    // Get more details about the error
    const errorDetails = {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      table: error.table,
    };

    return NextResponse.json({
      success: false,
      error: error.message,
      details: errorDetails
    }, { status: 500 });
  }
}

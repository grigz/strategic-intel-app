import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { monitoredPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const pages = await db.select().from(monitoredPages);
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Failed to fetch monitored pages:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, name, competitorId, signalType } = await request.json();

    if (!url || !name || !signalType) {
      return NextResponse.json(
        { error: "Missing required fields: url, name, signalType" },
        { status: 400 }
      );
    }

    const [page] = await db
      .insert(monitoredPages)
      .values({
        url,
        name,
        competitorId: competitorId || null,
        signalType,
        enabled: "true",
      })
      .returning();

    return NextResponse.json(page);
  } catch (error) {
    console.error("Failed to add monitored page:", error);
    return NextResponse.json({ error: "Failed to add monitored page" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, lastHash, lastChecked } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    const updates: any = {};
    if (lastHash !== undefined) updates.lastHash = lastHash;
    if (lastChecked !== undefined) updates.lastChecked = new Date(lastChecked);

    const [page] = await db
      .update(monitoredPages)
      .set(updates)
      .where(eq(monitoredPages.id, id))
      .returning();

    return NextResponse.json(page);
  } catch (error) {
    console.error("Failed to update monitored page:", error);
    return NextResponse.json({ error: "Failed to update monitored page" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    await db.delete(monitoredPages).where(eq(monitoredPages.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete monitored page:", error);
    return NextResponse.json({ error: "Failed to delete monitored page" }, { status: 500 });
  }
}

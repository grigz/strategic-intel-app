import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { competitors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { name, domain } = await request.json();

    if (!name || !domain) {
      return NextResponse.json(
        { error: "Missing required fields: name, domain" },
        { status: 400 }
      );
    }

    const [competitor] = await db.insert(competitors).values({ name, domain }).returning();

    return NextResponse.json(competitor);
  } catch (error) {
    console.error("Failed to add competitor:", error);
    return NextResponse.json({ error: "Failed to add competitor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allCompetitors = await db.select().from(competitors);
    return NextResponse.json(allCompetitors);
  } catch (error) {
    console.error("Failed to fetch competitors:", error);
    // Return empty array to prevent UI crash when DB not configured
    return NextResponse.json([]);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    await db.delete(competitors).where(eq(competitors.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete competitor:", error);
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}

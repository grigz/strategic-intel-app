import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { competitors } from "@/lib/db/schema";

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
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
  }
}

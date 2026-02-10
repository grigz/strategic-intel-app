import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { keywords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { term, category } = await request.json();

    if (!term || !category) {
      return NextResponse.json(
        { error: "Missing required fields: term, category" },
        { status: 400 }
      );
    }

    const [keyword] = await db.insert(keywords).values({ term, category }).returning();

    return NextResponse.json(keyword);
  } catch (error) {
    console.error("Failed to add keyword:", error);
    return NextResponse.json({ error: "Failed to add keyword" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allKeywords = await db.select().from(keywords);
    return NextResponse.json(allKeywords);
  } catch (error) {
    console.error("Failed to fetch keywords:", error);
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

    await db.delete(keywords).where(eq(keywords.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete keyword:", error);
    return NextResponse.json({ error: "Failed to delete keyword" }, { status: 500 });
  }
}

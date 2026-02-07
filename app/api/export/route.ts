import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { intelItems, competitors, keywords } from "@/lib/db/schema";
import { subDays } from "date-fns";
import { eq, gte, isNotNull, and } from "drizzle-orm";
import { generateCSV } from "@/lib/export";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "all";
    const format = searchParams.get("format") || "json";

    // Calculate date 5 days ago
    const fiveDaysAgo = subDays(new Date(), 5);

    // Build where conditions based on scope
    let whereConditions = gte(intelItems.createdAt, fiveDaysAgo);

    if (scope === "companies") {
      whereConditions = and(whereConditions, isNotNull(intelItems.competitorId))!;
    } else if (scope === "keywords") {
      whereConditions = and(whereConditions, isNotNull(intelItems.keywordId))!;
    }

    // Build query
    const results = await db
      .select({
        id: intelItems.id,
        title: intelItems.title,
        rawContent: intelItems.rawContent,
        sourceUrl: intelItems.sourceUrl,
        sourcePlatform: intelItems.sourcePlatform,
        signalType: intelItems.signalType,
        createdAt: intelItems.createdAt,
        competitorName: competitors.name,
        competitorDomain: competitors.domain,
        keywordTerm: keywords.term,
        keywordCategory: keywords.category,
      })
      .from(intelItems)
      .leftJoin(competitors, eq(intelItems.competitorId, competitors.id))
      .leftJoin(keywords, eq(intelItems.keywordId, keywords.id))
      .where(whereConditions);

    // Format response
    if (format === "csv") {
      const csv = generateCSV(results);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="intel-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } else {
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error("Export error:", error);

    // Return empty array for JSON format, empty string for CSV
    // This allows the app to work even without database configured
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    if (format === "csv") {
      return new NextResponse("", {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="intel-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } else {
      // Return empty array instead of error object to prevent UI crash
      return NextResponse.json([]);
    }
  }
}

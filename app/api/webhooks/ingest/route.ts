import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== process.env.WEBHOOK_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const signalType = searchParams.get("type");
    const competitorId = searchParams.get("comp_id");
    const keywordId = searchParams.get("keyword_id");
    const platform = searchParams.get("platform");

    if (!signalType || !platform) {
      return NextResponse.json(
        { error: "Missing required query parameters: type, platform" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, content, url } = body;

    if (!title || !content || !url) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, url" },
        { status: 400 }
      );
    }

    // Send to Inngest for async processing
    await inngest.send({
      name: "intel/webhook.received",
      data: {
        title,
        content,
        url,
        platform,
        signalType,
        competitorId: competitorId || undefined,
        keywordId: keywordId || undefined,
      },
    });

    return NextResponse.json({ success: true, message: "Webhook queued for processing" });
  } catch (error) {
    console.error("Webhook ingestion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

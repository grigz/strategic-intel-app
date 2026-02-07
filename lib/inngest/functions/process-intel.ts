import { inngest } from "../client";
import { db } from "@/lib/db";
import { intelItems } from "@/lib/db/schema";

export const processIntelItem = inngest.createFunction(
  { id: "process-intel-item", retries: 3 },
  { event: "intel/webhook.received" },
  async ({ event, step }) => {
    const { title, content, url, platform, signalType, competitorId, keywordId } = event.data;

    // Validate required fields
    if (!title || !content || !url || !platform || !signalType) {
      throw new Error("Missing required fields");
    }

    // Insert into database with retry logic
    const result = await step.run("insert-intel-item", async () => {
      const [item] = await db
        .insert(intelItems)
        .values({
          title,
          rawContent: content,
          sourceUrl: url,
          sourcePlatform: platform,
          signalType,
          competitorId: competitorId || null,
          keywordId: keywordId || null,
        })
        .returning();

      return item;
    });

    return { success: true, itemId: result.id };
  }
);

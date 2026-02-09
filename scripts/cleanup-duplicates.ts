import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "@/lib/db";
import { competitors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function cleanupDuplicates() {
  console.log("Cleaning up duplicate SUSE entries...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
  console.log("First 50 chars:", process.env.DATABASE_URL?.substring(0, 50));

  // Delete the last duplicate
  const idToDelete = "1c81752f-4609-45ea-b6d5-e5aa6c995647";

  try {
    await db.delete(competitors).where(eq(competitors.id, idToDelete));
    console.log(`✅ Deleted competitor: ${idToDelete}`);
  } catch (error) {
    console.error("❌ Failed to delete:", error);
  }

  // Show remaining competitors
  const remaining = await db.select().from(competitors);
  console.log("\nRemaining competitors:");
  console.table(remaining.map(c => ({ id: c.id, name: c.name, domain: c.domain })));

  process.exit(0);
}

cleanupDuplicates();

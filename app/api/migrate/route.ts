import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Create monitored_pages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS monitored_pages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        url text NOT NULL,
        name text NOT NULL,
        competitor_id uuid,
        signal_type text NOT NULL,
        last_hash text,
        last_checked timestamp,
        enabled text DEFAULT 'true' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);

    // Add foreign key constraint
    await db.execute(sql`
      ALTER TABLE monitored_pages
      ADD CONSTRAINT IF NOT EXISTS monitored_pages_competitor_id_competitors_id_fk
      FOREIGN KEY (competitor_id) REFERENCES public.competitors(id)
      ON DELETE no action ON UPDATE no action
    `);

    return NextResponse.json({ success: true, message: "Migration completed successfully" });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 }
    );
  }
}

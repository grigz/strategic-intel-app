import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const competitors = pgTable("competitors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const keywords = pgTable("keywords", {
  id: uuid("id").defaultRandom().primaryKey(),
  term: text("term").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const intelItems = pgTable(
  "intel_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    rawContent: text("raw_content").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourcePlatform: text("source_platform").notNull(), // Reddit, X, LinkedIn, Website
    signalType: text("signal_type").notNull(), // Hiring, Market Shift, Culture, Customer Pain
    competitorId: uuid("competitor_id").references(() => competitors.id),
    keywordId: uuid("keyword_id").references(() => keywords.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    createdAtIdx: index("intel_items_created_at_idx").on(table.createdAt),
  })
);

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"; // Removed varchar, added text
import { relations, sql } from "drizzle-orm"; // sql is used for database-level defaults

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Using text for UUIDs
  email: text('email').unique().notNull(), // Changed varchar to text
  provider: text('provider', { length: 50 }), // Changed varchar to text (length is ignored by SQLite, but useful for documentation/migration)
  providerId: text('provider_id', { length: 256 }), // Changed varchar to text
  // For SQLite, integer is used for Unix epoch timestamps (seconds).
  createdAt: integer('created_at', { mode: 'number' }).default(sql`(unixepoch())`).notNull(),
});

export const webAnalyses = sqliteTable('web_analyses', {
  id: text('web_id').primaryKey(), // Explicitly named 'id' and .primaryKey()
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  url: text('url', { length: 2048 }).notNull(), // Changed varchar to text
  geminiModel: text('gemini_model', { length: 50 }).notNull(), // Changed varchar to text
  requestPayload: text('request_payload'), // Already text, no change needed
  responsePayload: text('response_payload'), // Already text, no change needed
  analysisSummary: text('analysis_summary'),
  status: text('status', { length: 20 }).notNull().default('PENDING'), // Changed varchar to text
  errorMessage: text('error_message'),
  // Using integer for timestamps in seconds
  createdAt: integer('created_at', { mode: 'number' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).default(sql`(unixepoch())`).notNull(),
});

// Relationships definition remains largely the same
export const webAnalysesRelations = relations(webAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [webAnalyses.userId],
    references: [users.id],
  }),
}));
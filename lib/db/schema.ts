import { pgTable, text, integer, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

// ---- Community Templates ----
export const communityTemplates = pgTable('community_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  tags: text('tags').array().notNull().default([]),
  category: text('category').notNull().default('backend'),
  difficulty: text('difficulty').notNull().default('Beginner'),
  prompt: text('prompt').notNull(),
  likes: integer('likes').notNull().default(0),
  copies: integer('copies').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---- Analytics Events ----
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(),
  templateId: text('template_id'),
  userId: text('user_id'),
  userName: text('user_name'),
  provider: text('provider'),
  lang: text('lang'),
  meta: jsonb('meta'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

// ---- User Prompts (saved) ----
export const userPrompts = pgTable('user_prompts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull().default(''),
  content: text('content').notNull(),
  tags: text('tags').array().notNull().default([]),
  platform: text('platform').notNull().default('claude'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---- Template Feedback ----
export const templateFeedback = pgTable('template_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: text('template_id').notNull(),
  userId: text('user_id').notNull(),
  value: text('value').notNull(), // 'up' | 'down'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---- Schema types ----
export type CommunityTemplate = typeof communityTemplates.$inferSelect;
export type NewCommunityTemplate = typeof communityTemplates.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type UserPrompt = typeof userPrompts.$inferSelect;
export type NewUserPrompt = typeof userPrompts.$inferInsert;

import { pgTable, text, boolean, jsonb } from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  readTime: text('read_time').notNull(),
  publishedAt: text('published_at').notNull(),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
});

export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  alias: text('alias'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  category: text('category').notNull(),
  mode: text('mode').notNull(),
  date: text('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('menunggu'),
  createdAt: text('created_at').notNull(),
});

export const curhat = pgTable('curhat', {
  id: text('id').primaryKey(),
  alias: text('alias').notNull(),
  category: text('category').notNull(),
  message: text('message').notNull(),
  answer: text('answer'),
  isAnswered: boolean('is_answered').notNull().default(false),
  isPublic: boolean('is_public').notNull().default(true),
  createdAt: text('created_at').notNull(),
  answeredAt: text('answered_at'),
});

export type ArticleRecord = typeof articles.$inferSelect;
export type InsertArticleRecord = typeof articles.$inferInsert;

export type BookingRecord = typeof bookings.$inferSelect;
export type InsertBookingRecord = typeof bookings.$inferInsert;

export type CurhatRecord = typeof curhat.$inferSelect;
export type InsertCurhatRecord = typeof curhat.$inferInsert;

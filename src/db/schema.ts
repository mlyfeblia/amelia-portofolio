import { pgTable, text, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const articles = pgTable(
  'articles',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull(),
    content: text('content').notNull(),
    category: text('category').notNull(),
    readTime: text('read_time').notNull(),
    publishedAt: text('published_at').notNull(),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isPublished: boolean('is_published').notNull().default(true),
    showOnLandingPage: boolean('show_on_landing_page').notNull().default(false),
  },
  (table) => [
    index('articles_category_idx').on(table.category),
    index('articles_published_idx').on(table.isPublished),
    index('articles_landing_idx').on(table.showOnLandingPage),
  ]
);

export const bookings = pgTable(
  'bookings',
  {
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
  },
  (table) => [
    index('bookings_created_idx').on(table.createdAt),
    index('bookings_status_idx').on(table.status),
  ]
);

export const curhat = pgTable(
  'curhat',
  {
    id: text('id').primaryKey(),
    alias: text('alias').notNull(),
    category: text('category').notNull(),
    message: text('message').notNull(),
    answer: text('answer'),
    isAnswered: boolean('is_answered').notNull().default(false),
    isPublic: boolean('is_public').notNull().default(true),
    showOnLandingPage: boolean('show_on_landing_page').notNull().default(false),
    createdAt: text('created_at').notNull(),
    answeredAt: text('answered_at'),
  },
  (table) => [
    index('curhat_public_created_idx').on(table.isPublic, table.createdAt),
    index('curhat_created_idx').on(table.createdAt),
    index('curhat_landing_idx').on(table.showOnLandingPage),
  ]
);

export type ArticleRecord = typeof articles.$inferSelect;
export type InsertArticleRecord = typeof articles.$inferInsert;

export type BookingRecord = typeof bookings.$inferSelect;
export type InsertBookingRecord = typeof bookings.$inferInsert;

export type CurhatRecord = typeof curhat.$inferSelect;
export type InsertCurhatRecord = typeof curhat.$inferInsert;

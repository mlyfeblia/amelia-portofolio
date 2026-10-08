import {
  pgTable,
  text,
  boolean,
  jsonb,
  index,
  integer,
  pgEnum,
  timestamp,
} from 'drizzle-orm/pg-core';

export const bookingStatusEnum = pgEnum('booking_status', [
  'menunggu',
  'terkonfirmasi',
  'selesai',
  'dibatalkan',
]);

export const counselingModeEnum = pgEnum('counseling_mode', [
  'online_meet',
  'online_chat',
  'tatap_muka_cirebon',
]);

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
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isPublished: boolean('is_published').notNull().default(true),
    showOnLandingPage: boolean('show_on_landing_page').notNull().default(false),
    views: integer('views').notNull().default(0),
    coverImage: text('cover_image'),
  },
  (table) => [
    index('articles_category_idx').on(table.category),
    index('articles_published_idx').on(table.isPublished),
    index('articles_landing_idx').on(table.showOnLandingPage),
    index('articles_cat_pub_date_idx').on(table.category, table.isPublished, table.publishedAt),
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
    mode: counselingModeEnum('mode').notNull(),
    date: text('date').notNull(),
    timeSlot: text('time_slot').notNull(),
    notes: text('notes'),
    status: bookingStatusEnum('status').notNull().default('menunggu'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('bookings_created_idx').on(table.createdAt),
    index('bookings_status_idx').on(table.status),
    index('bookings_status_date_idx').on(table.status, table.date),
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
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    answeredAt: timestamp('answered_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index('curhat_public_created_idx').on(table.isPublic, table.createdAt),
    index('curhat_created_idx').on(table.createdAt),
    index('curhat_landing_idx').on(table.showOnLandingPage),
  ]
);

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: text('id').primaryKey(),
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    role: text('role').notNull().default('client'),
    bookingCode: text('booking_code'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('push_sub_endpoint_idx').on(table.endpoint),
    index('push_sub_code_idx').on(table.bookingCode),
  ]
);

export type ArticleRecord = typeof articles.$inferSelect;
export type InsertArticleRecord = typeof articles.$inferInsert;

export type BookingRecord = typeof bookings.$inferSelect;
export type InsertBookingRecord = typeof bookings.$inferInsert;

export type CurhatRecord = typeof curhat.$inferSelect;
export type InsertCurhatRecord = typeof curhat.$inferInsert;

export type PushSubscriptionRecord = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscriptionRecord = typeof pushSubscriptions.$inferInsert;

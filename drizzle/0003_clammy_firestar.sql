CREATE TYPE "public"."booking_status" AS ENUM('menunggu', 'terkonfirmasi', 'selesai', 'dibatalkan');--> statement-breakpoint
CREATE TYPE "public"."counseling_mode" AS ENUM('online_meet', 'online_chat', 'tatap_muka_cirebon');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"role" text DEFAULT 'client' NOT NULL,
	"booking_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "published_at" SET DATA TYPE timestamp with time zone USING "published_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "published_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "mode" SET DATA TYPE "public"."counseling_mode" USING "mode"::"public"."counseling_mode";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'menunggu'::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."booking_status" USING "status"::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "curhat" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "curhat" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "curhat" ALTER COLUMN "answered_at" SET DATA TYPE timestamp with time zone USING "answered_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "cover_image" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "push_sub_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "push_sub_code_idx" ON "push_subscriptions" USING btree ("booking_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_cat_pub_date_idx" ON "articles" USING btree ("category","is_published","published_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_status_date_idx" ON "bookings" USING btree ("status","date");
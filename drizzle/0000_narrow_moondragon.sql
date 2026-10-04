CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"read_time" text NOT NULL,
	"published_at" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"alias" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"category" text NOT NULL,
	"mode" text NOT NULL,
	"date" text NOT NULL,
	"time_slot" text NOT NULL,
	"notes" text,
	"status" text DEFAULT 'menunggu' NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "bookings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "curhat" (
	"id" text PRIMARY KEY NOT NULL,
	"alias" text NOT NULL,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"answer" text,
	"is_answered" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"answered_at" text
);
--> statement-breakpoint
CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "bookings_created_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "curhat_public_created_idx" ON "curhat" USING btree ("is_public","created_at");--> statement-breakpoint
CREATE INDEX "curhat_created_idx" ON "curhat" USING btree ("created_at");
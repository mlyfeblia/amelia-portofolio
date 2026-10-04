ALTER TABLE "articles" ADD COLUMN "is_published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "articles" USING btree ("is_published");
ALTER TABLE "articles" ADD COLUMN "show_on_landing_page" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "curhat" ADD COLUMN "show_on_landing_page" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "articles_landing_idx" ON "articles" USING btree ("show_on_landing_page");--> statement-breakpoint
CREATE INDEX "curhat_landing_idx" ON "curhat" USING btree ("show_on_landing_page");
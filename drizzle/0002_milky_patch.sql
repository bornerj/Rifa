DROP TABLE "otp_challenges" CASCADE;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "email" varchar(255);--> statement-breakpoint
UPDATE "participants" SET "email" = 'participante+' || "id"::text || '@migration.local' WHERE "email" IS NULL;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quota_reservations" ADD COLUMN "receipt_email_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "raffle_item_images" ADD COLUMN "is_real_item_image" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN IF EXISTS "phone_verified_at";

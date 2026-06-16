ALTER TABLE "users" ADD COLUMN "gmailRefreshToken" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "gmailAccessToken";
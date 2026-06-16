CREATE TABLE "toolChats" (
	"toolChatId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"role" "ToolChatRole" DEFAULT 'user' NOT NULL,
	"message" text NOT NULL,
	"log" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"modifiedBy" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "toolChats" ADD CONSTRAINT "toolChats_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
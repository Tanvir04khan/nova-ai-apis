import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { MessageRole } from "../enum";
import { text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const messages = pgTable("messages", {
  messageId: uuid("messageId").primaryKey().defaultRandom().notNull(),
  conversationId: uuid("conversationId")
    .notNull()
    .references(() => conversations.conversationId),
  role: MessageRole("role").notNull().default("user"),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  modifiedBy: varchar("modifiedBy", { length: 255 }).notNull(),
});

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.conversationId],
  }),
}));

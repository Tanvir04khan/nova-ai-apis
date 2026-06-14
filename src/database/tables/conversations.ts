import { relations } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";
import { messages } from "./messages";

export const conversations = pgTable("conversations", {
  conversationId: uuid("conversationId").primaryKey().defaultRandom().notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.userId),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  modifiedBy: varchar("modifiedBy", { length: 255 }).notNull(),
});

export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.userId],
    }),
    messages: many(messages),
  }),
);

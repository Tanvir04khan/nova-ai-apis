import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";
import { ToolChatRole } from "../enum";
import { text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const toolChats = pgTable("toolChats", {
  toolChatId: uuid("toolChatId").primaryKey().defaultRandom().notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.userId),
  role: ToolChatRole("role").notNull().default("user"),
  message: text("message").notNull(),
  log: text("log"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  modifiedBy: varchar("modifiedBy", { length: 255 }).notNull(),
});

export const toolChatsRelation = relations(toolChats, ({ one }) => ({
  user: one(users, {
    fields: [toolChats.userId],
    references: [users.userId],
  }),
}));

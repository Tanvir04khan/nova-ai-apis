import { relations } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { toolChats } from "./toolChats";

export const users = pgTable("users", {
  userId: uuid("userId").primaryKey().defaultRandom().notNull(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phoneNumber", { length: 10 }).unique(),
  password: text("password").notNull(),
  refreshToken: text("refreshToken"),
  refreshTokenExpiry: timestamp("refreshTokenExpiry"),
  gmailRefreshToken: text("gmailRefreshToken"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  modifiedBy: varchar("modifiedBy", { length: 255 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  toolChats: many(toolChats),
}));

import { pgEnum } from "drizzle-orm/pg-core";

export const MessageRole = pgEnum("MessageRole", ["user", "model"]);

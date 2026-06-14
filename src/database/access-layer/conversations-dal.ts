import { and, asc, desc, eq } from "drizzle-orm";
import { Database } from "..";
import { conversations, messages } from "../schema";

class ConversationDAL {
  readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  createConversation(userId: string, title: string) {
    return this.database
      .insert(conversations)
      .values({
        userId,
        createdBy: userId,
        modifiedBy: userId,
        title,
      })
      .returning({
        conversationId: conversations.conversationId,
      });
  }

  getConversations(userId: string) {
    return this.database.query.conversations.findMany({
      columns: {
        userId: true,
        conversationId: true,
        title: true,
        createdAt: true,
      },
      where: (t) => eq(t.userId, userId),
      orderBy: desc(conversations.createdAt),
    });
  }

  getConversationMessages(userId: string, conversationId: string) {
    return this.database.query.conversations.findFirst({
      columns: {
        conversationId: true,
        title: true,
        createdAt: true,
      },

      with: {
        messages: {
          columns: {
            content: true,
            conversationId: true,
            messageId: true,
            createdAt: true,
            role: true,
          },

          orderBy: asc(messages.createdAt),
        },
      },

      where: (t) =>
        and(eq(t.conversationId, conversationId), eq(t.userId, userId)),
    });
  }
}

export default ConversationDAL;

import { eq } from "drizzle-orm";
import { Database } from "..";
import { messages } from "../schema";
import { MessageRole } from "../../utils";

class MessageDAL {
  readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  createMessages(
    userId: string,
    conversationId: string,
    role: MessageRole,
    content: string,
  ) {
    return this.database
      .insert(messages)
      .values({
        content,
        conversationId,
        createdBy: userId,
        modifiedBy: userId,
        role,
      })
      .returning({
        messageId: messages.messageId,
      });
  }

  getMessages(conversationId: string) {
    return this.database.query.messages.findMany({
      columns: {
        messageId: true,
        conversationId: true,
        content: true,
        createdAt: true,
        createdBy: true,
        role: true,
      },
      where: (t) => eq(t.conversationId, conversationId),
    });
  }
}

export default MessageDAL;

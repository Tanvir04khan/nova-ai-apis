import { and, eq } from "drizzle-orm";
import { Database } from "..";
import { ToolChatRole } from "../../utils";
import { toolChats } from "../schema";

class ToolChatsDAL {
  readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  createToolChat(
    userId: string,
    role: ToolChatRole,
    message: string,
    log: string,
  ) {
    return this.database
      .insert(toolChats)
      .values({
        createdBy: userId,
        message,
        modifiedBy: userId,
        userId,
        role,
        log,
      })
      .returning({
        toolChatId: toolChats.toolChatId,
      });
  }

  updateToolChat(toolChatId: string, userId: string, log: string) {
    return this.database
      .update(toolChats)
      .set({
        log,
      })
      .where(
        and(eq(toolChats.toolChatId, toolChatId), eq(toolChats.userId, userId)),
      )
      .returning({
        toolChatId: toolChats.toolChatId,
      });
  }

  getToolChats(userId: string) {
    return this.database.query.toolChats.findMany({
      columns: {
        toolChatId: true,
        userId: true,
        createdAt: true,
        createdBy: true,
        message: true,
        role: true,
        modifiedBy: true,
        updatedAt: true,
      },
      where: eq(toolChats.userId, userId),
    });
  }
}

export default ToolChatsDAL;

import database from "..";
import ConversationDAL from "./conversations-dal";
import MessageDAL from "./messages-dal";
import ToolChatsDAL from "./toolChats-dal";
import UserDAL from "./users-dal";

class DatabaseAccessLayer {
  readonly database = database;
  readonly userDAL: UserDAL;
  readonly conversationDAL: ConversationDAL;
  readonly messageDAL: MessageDAL;
  readonly toolChatDAL: ToolChatsDAL;

  constructor() {
    this.userDAL = new UserDAL(this.database);
    this.conversationDAL = new ConversationDAL(this.database);
    this.messageDAL = new MessageDAL(this.database);
    this.toolChatDAL = new ToolChatsDAL(this.database);
  }
}

export default DatabaseAccessLayer;

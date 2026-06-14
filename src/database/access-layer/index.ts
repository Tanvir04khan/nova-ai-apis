import database from "..";
import ConversationDAL from "./conversations-dal";
import MessageDAL from "./messages-dal";
import UserDAL from "./users-dal";

class DatabaseAccessLayer {
  readonly database = database;
  readonly userDAL: UserDAL;
  readonly conversationDAL: ConversationDAL;
  readonly messageDAL: MessageDAL;

  constructor() {
    this.userDAL = new UserDAL(this.database);
    this.conversationDAL = new ConversationDAL(this.database);
    this.messageDAL = new MessageDAL(this.database);
  }
}

export default DatabaseAccessLayer;

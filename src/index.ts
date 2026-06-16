import express, { json, urlencoded } from "express";
import { env } from "./config/env";
import cors from "cors";
import attachDAL from "./middleware/database";
import cookieParser from "cookie-parser";
import signupRouter from "./router/v1/signupRouter";
import loginRouter from "./router/v1/loginRouter";
import userRouter from "./router/v1/userRouter";
import userLookupRouter from "./router/v1/userLookupRouter";
import errorHandler from "./controller/errorHandler";
import { getOrigin } from "./utils";
import chatRouter from "./router/v1/chatRouter";
import conversationRouter from "./router/v1/conversationRouter";
import messageRouter from "./router/v1/messageRouter";
import googleAuthRouter from "./router/v1/googleAuthRouter";
import toolRouter from "./router/v1/toolsRouter";

const app = express();

app
  .disable("x-powered-by")
  .use(urlencoded({ extended: true }))
  .use(cors({ origin: getOrigin(), credentials: true }))
  .use(json())
  .use(cookieParser())
  .use(attachDAL);

app.get("/", (_, res) => {
  res.send("NovaAI API Running");
});

app.use(signupRouter);

app.use(loginRouter);

app.use(userRouter);

app.use(chatRouter);

app.use(userLookupRouter);

app.use(conversationRouter);

app.use(messageRouter);

app.use(googleAuthRouter);

app.use(toolRouter);

app.use(errorHandler);

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`);
});

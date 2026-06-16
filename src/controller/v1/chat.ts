import { NextFunction, Request, Response } from "express";
import { ErrorModel } from "../../models/errorModel";
import { APIStatus, MessageRole, StatusCode } from "../../utils";
import {
  GeminiModels,
  generateGeminiStream,
} from "../../services/google-genai";
import DatabaseAccessLayer from "../../database/access-layer";

import { model as dModel } from "../../utils";

const getResponseFromAI = async (
  res: Response,
  service: string,
  model: GeminiModels,
  message: string,
  context: {
    role: "user" | "model";
    parts: {
      text: string;
    }[];
  }[],
  userId: string,
  conversationId: string,
  dal: DatabaseAccessLayer,
) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  let fullText = "";

  try {
    if (service === "gemini") {
      await generateGeminiStream(
        [
          ...context,
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
        model ?? dModel,
        (chunk: string) => {
          fullText += chunk;
          res.write(chunk);
        },
      );
    }

    const newMessage = await dal.messageDAL.createMessages(
      userId,
      conversationId,
      MessageRole.Model,
      fullText,
    );
  } catch (error: any) {
    throw new Error(error.message);
  }

  // return newMessage[0].messageId;
};

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, service, model, conversationId, userId } = req.body;

    const database: DatabaseAccessLayer = req.dal;

    if (!message || !conversationId || !userId) {
      throw new ErrorModel(
        "message, userId and conversationId are reuired.",
        StatusCode.BAD_REQUEST,
        APIStatus.ERROR,
      );
    }

    const context = await database.conversationDAL.getConversationMessages(
      userId,
      conversationId,
    );

    const messages =
      context?.messages.map(({ content, role }) => ({
        role,
        parts: [
          {
            text: content,
          },
        ],
      })) ?? [];

    await getResponseFromAI(
      res,
      service,
      model,
      message,
      messages,
      userId,
      conversationId,
      database,
    );

    res.end();
  } catch (error) {
    next(error);
  }
};

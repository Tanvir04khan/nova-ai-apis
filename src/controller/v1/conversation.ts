import { NextFunction, Request, Response } from "express";
import { ErrorModel } from "../../models/errorModel";
import { APIStatus, MessageRole, model, StatusCode } from "../../utils";
import DatabaseAccessLayer from "../../database/access-layer";
import { generateGeminiContent } from "../../services/google-genai";
import { ResponseModel } from "../../models/responseModel";

const generateTitle = async (message: string) => {
  const prompt = `
You are a chat title generator.

Generate a short title for the following user question.

Requirements:
- Maximum 50 characters.
- 3 to 8 words preferred.
- Return only the title text.
- No markdown.
- No quotes.
- No explanations.
- No trailing period.

Question:
${message}
`;

  const title = await generateGeminiContent(prompt, model);

  if (!title) {
    const maxWords = 6;
    const maxLength = 50;
    const cleaned = message.trim().replace(/\s+/g, " ").replace(/\n/g, " ");

    const words = cleaned.split(" ");

    let title = words.slice(0, maxWords).join(" ");

    if (title.length > maxLength) {
      title = title.slice(0, maxLength).trim();
    }

    if (words.length > maxWords || cleaned.length > title.length) {
      title += "...";
    }

    return title;
  }

  return title;
};

export const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, message } = req.body;

    const database: DatabaseAccessLayer = req.dal;

    if (!userId || !message) {
      throw new ErrorModel(
        "userId and message are required.",
        StatusCode.BAD_REQUEST,
        APIStatus.ERROR,
      );
    }

    const title = await generateTitle(message);

    const conversation = await database.conversationDAL.createConversation(
      userId,
      title,
    );

    if (!conversation.length) {
      throw new ErrorModel(
        "Error while creating the conversation.",
        StatusCode.SERVER_ERROR,
        APIStatus.ERROR,
      );
    }

    const newMessage = await database.messageDAL.createMessages(
      userId,
      conversation[0].conversationId,
      MessageRole.User,
      message,
    );

    if (!newMessage.length) {
      throw new ErrorModel(
        "Error while creating the message.",
        StatusCode.SERVER_ERROR,
        APIStatus.ERROR,
      );
    }

    res.status(StatusCode.OK).json(
      new ResponseModel(
        {
          conversationId: conversation[0].conversationId,
          messageId: newMessage[0].messageId,
        },
        APIStatus.SUCCESS,
        StatusCode.OK,
        "Conversation created successfully.",
      ),
    );
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    const database: DatabaseAccessLayer = req.dal;

    if (!userId) {
      throw new ErrorModel(
        "userId is required.",
        StatusCode.BAD_REQUEST,
        APIStatus.ERROR,
      );
    }

    const conversations = await database.conversationDAL.getConversations(
      userId as string,
    );

    res
      .status(StatusCode.OK)
      .json(
        new ResponseModel(
          conversations,
          APIStatus.SUCCESS,
          StatusCode.OK,
          "Conversations found.",
        ),
      );
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import { ErrorModel } from "../../models/errorModel";
import { APIStatus, MessageRole, StatusCode } from "../../utils";
import DatabaseAccessLayer from "../../database/access-layer";
import { ResponseModel } from "../../models/responseModel";

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, conversationId, message } = req.body;

    const database: DatabaseAccessLayer = req.dal;

    if (!userId || !conversationId || !message) {
      throw new ErrorModel(
        "userId, conversationId and message are required.",
        StatusCode.BAD_REQUEST,
        APIStatus.ERROR,
      );
    }

    const newMessage = await database.messageDAL.createMessages(
      userId,
      conversationId,
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
          messageId: newMessage[0].messageId,
        },
        APIStatus.SUCCESS,
        StatusCode.OK,
        "Message created.",
      ),
    );
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { conversationId } = req.body;
    const { userId } = req.params;

    const database: DatabaseAccessLayer = req.dal;

    if (!userId || !conversationId) {
      throw new ErrorModel(
        "userId and conversationId are required.",
        StatusCode.BAD_REQUEST,
        APIStatus.ERROR,
      );
    }

    const messages = await database.conversationDAL.getConversationMessages(
      userId as string,
      conversationId,
    );

    res
      .status(StatusCode.OK)
      .json(
        new ResponseModel(
          messages,
          APIStatus.SUCCESS,
          StatusCode.OK,
          "Message found.",
        ),
      );
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import { APIStatus, StatusCode } from "../../utils";
import { ErrorModel } from "../../models/errorModel";
import { ResponseModel } from "../../models/responseModel";
import DatabaseAccessLayer from "../../database/access-layer";

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.userId as string;
    const dal: DatabaseAccessLayer = req.dal;

    if (!userId) {
      throw new ErrorModel(
        "User ID is required.",
        StatusCode.BAD_REQUEST,
        APIStatus.ERROR,
      );
    }

    const user = await dal.userDAL.getUserById(userId);

    if (!user.length) {
      throw new ErrorModel(
        "User not found.",
        StatusCode.NOT_FOUND,
        APIStatus.ERROR,
      );
    }

    res.status(StatusCode.OK).json(
      new ResponseModel(
        {
          userId: user[0].userId,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          email: user[0].email,
          phoneNumber: user[0].phoneNumber,
        },
        APIStatus.SUCCESS,
        StatusCode.OK,
        "User retrieved successfully.",
      ),
    );
  } catch (error) {
    next(error);
  }
};

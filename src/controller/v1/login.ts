import { NextFunction, Request, Response } from "express";
import { ErrorModel } from "../../models/errorModel";
import { APIStatus, generateRefreshAndJWTToken, StatusCode } from "../../utils";
import DatabaseAccessLayer from "../../database/access-layer";
import bcrypt from "bcrypt";
import { env } from "../../config/env";
import { ResponseModel } from "../../models/responseModel";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, phoneNumber, password } = req.body;
    const dal: DatabaseAccessLayer = req.dal;

    if ((!email && !phoneNumber) || !password) {
      throw new ErrorModel(
        "Email or phone number is required.",
        StatusCode.BAD_REQUEST,
        APIStatus.ERROR,
      );
    }

    const loginDetails = await dal.userDAL.getLoginDetails(email, phoneNumber);

    if (!loginDetails.length) {
      throw new ErrorModel(
        "Invalid credentials.",
        StatusCode.UNAUTHORIZED,
        APIStatus.ERROR,
      );
    }

    const isPasswordValid = bcrypt.compareSync(
      password + env.SERVER_KEY,
      loginDetails[0].password,
    );

    if (!isPasswordValid) {
      throw new ErrorModel(
        "Invalid credentials.",
        StatusCode.UNAUTHORIZED,
        APIStatus.ERROR,
      );
    }

    const { refreshToken, jwtToken } = await generateRefreshAndJWTToken(
      loginDetails[0].userId,
      loginDetails[0].email,
      dal,
    );

    res.status(StatusCode.OK).json(
      new ResponseModel(
        {
          userId: loginDetails[0].userId,
          accessToken: jwtToken,
          refreshToken,
        },
        APIStatus.SUCCESS,
        StatusCode.OK,
        "logged in successfully.",
      ),
    );
  } catch (error) {
    next(error);
  }
};

import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { ErrorModel } from "../../models/errorModel";
import { APIStatus, generateRefreshAndJWTToken, StatusCode } from "../../utils";
import DatabaseAccessLayer from "../../database/access-layer";
import { env } from "../../config/env";
import { SignupRequestBody } from "../../types/signup";
import { ResponseModel } from "../../models/responseModel";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      email,
      phoneNumber,
      password,
      firstName,
      lastName,
    }: SignupRequestBody = req.body;

    const dal: DatabaseAccessLayer = req.dal;

    if (!email || !password || !firstName || !lastName) {
      throw new ErrorModel(
        "Email, password, first name, and last name are required.",
        StatusCode.BAD_REQUEST,
        APIStatus.ERROR,
      );
    }

    const user = await dal.userDAL.checkUserExist(email, phoneNumber ?? "");

    if (user.length > 0) {
      throw new ErrorModel(
        "User with the provided email or phone number already exists.",
        StatusCode.CONFLICT,
        APIStatus.ERROR,
      );
    }

    const passwordHash = bcrypt.hashSync(
      password + env.SERVER_KEY,
      Number(env.SALT_ROUNDS),
    );

    const newUser = await dal.userDAL.createUser(
      firstName,
      lastName,
      email,
      passwordHash,
      "",
      phoneNumber,
    );

    if (newUser.length === 0) {
      throw new ErrorModel(
        "Failed to create user.",
        StatusCode.SERVER_ERROR,
        APIStatus.ERROR,
      );
    }

    const { refreshToken, jwtToken } = await generateRefreshAndJWTToken(
      newUser[0].userId,
      email,
      dal,
    );

    res
      .status(StatusCode.CREATED)
      .json(
        new ResponseModel(
          { userId: newUser[0].userId, accessToken: jwtToken, refreshToken },
          APIStatus.SUCCESS,
          StatusCode.CREATED,
          "User created successfully.",
        ),
      );
  } catch (error) {
    next(error);
  }
};

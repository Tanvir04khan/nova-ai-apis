import { Request, Response } from "express";
import { oauth2Client } from "../../google";
import { ErrorModel } from "../../models/errorModel";
import { APIStatus, StatusCode } from "../../utils";
import DatabaseAccessLayer from "../../database/access-layer";
import { env } from "../../config/env";

export const redirectToAuthURL = (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId) {
    throw new ErrorModel(
      "userId is required.",
      StatusCode.BAD_REQUEST,
      APIStatus.ERROR,
    );
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    state: userId as string,
    scope: ["https://www.googleapis.com/auth/gmail.send"],
  });

  res.redirect(url);
};

export const handleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  const database: DatabaseAccessLayer = req.dal;

  const { tokens } = await oauth2Client.getToken(code);

  const user = await database.userDAL.saveGmailRefreshToken(
    state,
    tokens.refresh_token ?? "",
  );

  if (!user.length) {
    throw new ErrorModel(
      "Error while saving gmail refresh token.",
      StatusCode.SERVER_ERROR,
      APIStatus.ERROR,
    );
  }

  res.redirect(`${env.NOVA_WEBAPP_URL}/tools`);
  res.send("Gmail Connected");
};

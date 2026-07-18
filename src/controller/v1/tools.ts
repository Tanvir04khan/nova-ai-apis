import { NextFunction, Request, Response } from "express";
import { ResponseModel } from "../../models/responseModel";
import {
  APIStatus,
  generateMCPRequestHeader,
  getMCPURL,
  mcpRoute,
  model,
  StatusCode,
  ToolChatRole,
} from "../../utils";
import axios from "axios";
import { env } from "../../config/env";
import {
  ApiResponse,
  EmailRequest,
  MCPToolsResponse,
} from "../../types/mcpApiResponse";
import { generateGeminiContent } from "../../services/google-genai";
import DatabaseAccessLayer from "../../database/access-layer";
import { ErrorModel } from "../../models/errorModel";

const getInputSchemaPrompt = (tools: string, message: string) => {
  return `
    You are an MCP Tool Input Generator.

Your job is to analyze the user's message and generate the JSON input required by the most appropriate tool.

Rules:

1. Select the most appropriate tool based on the user's message.
2. Generate a valid JSON object containing all required input fields for that tool.
3. Return ONLY valid JSON.
4. Do NOT return markdown.
5. Do NOT wrap the response in code blocks.
6. Do NOT return explanations, comments, notes, or additional text.
7. The response must always be a parseable JSON object.
8. If a required field cannot be determined from the user's message, set its value to null.
9. Preserve the exact property names defined in the tool schema.
10. Include a property called "toolName" containing the selected tool name.
11. and "eventName" must match with the selected tool's eventName.

Available Tools:

${tools}

User Message:

${message}

Expected Response Format:
Must be in JSON and structure should be as mentioned in Tools Schema

    `;
};

export const getMessageResponsePrompt = (
  message: string,
  mcpResponse: string,
) => {
  return `
    You are NovaAI.

You will receive:

1. The user's original request.
2. The MCP tool response.

Your task is to generate a short, natural, user-facing response.

Rules:

1. If status is "success":

   * Generate a short confirmation message.
   * Do not mention technical details.
   * Example:

     * "Your email has been sent successfully."
     * "The meeting has been scheduled."
     * "The file has been uploaded."

2. If status is "error":

   * Generate a short failure message.
   * Do not explain the technical error.
   * Do not include status codes.
   * Do not include internal error messages.
   * Example:

     * "I couldn't send the email."
     * "I couldn't schedule the meeting."
     * "I couldn't upload the file."

3. Keep the response under 20 words.

4. Never mention MCP, APIs, tools, JSON, status codes, or internal system details.

5. Return only the final user-facing message.

User Request:
${message}

MCP Response:
${mcpResponse}

    `;
};

const getToolErrorResponsePrompt = (userMessage: string) => {
  return `
    You are NovaAI.

The user's request could not be processed.

Generate a short, user-facing error message that:
1. Is under 20 words.
2. Does not mention internal details, tools, JSON, APIs, or status codes.
3. Does not include technical error information.
4. Confirms the request could not be completed and asks the user to try again.

User Request:
${userMessage}
`;
};

const sendToolErrorResponse = async (
  res: Response,
  userMessage: string,
  statusCode: StatusCode,
  databse: DatabaseAccessLayer,
  userId: string,
) => {
  let message = "I couldn't process your request. Please try again.";

  try {
    const generated = await generateGeminiContent(
      getToolErrorResponsePrompt(userMessage),
      model,
    );

    if (generated) {
      message = generated;
    }

    await databse.toolChatDAL.createToolChat(
      userId,
      ToolChatRole.Model,
      message,
      "",
    );

    return res.status(statusCode).json(
      new ResponseModel(
        {
          aiResponse: message,
        },
        APIStatus.ERROR,
        statusCode,
        message,
      ),
    );
  } catch {
    // fallback message stays
  }
};

export const tools = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, message } = req.body;

    const databse: DatabaseAccessLayer = req.dal;

    if (!userId || !message) {
      return await sendToolErrorResponse(
        res,
        message ?? "The request could not be processed.",
        StatusCode.BAD_REQUEST,
        databse,
        userId,
      );
    }

    const userToolChat = await databse.toolChatDAL.createToolChat(
      userId,
      ToolChatRole.User,
      message,
      "",
    );

    if (!userToolChat.length) {
      return await sendToolErrorResponse(
        res,
        message,
        StatusCode.SERVER_ERROR,
        databse,
        userId,
      );
    }

    console.log("userToolChat", userToolChat);

    const availableTools = await axios.get<ApiResponse<MCPToolsResponse>>(
      getMCPURL(mcpRoute.GetTools),
      {
        headers: {
          "Content-Type": "application/json",
          authorization: env.MCP_SERVER_SECRETKEY,
        },
      },
    );

    console.log("availableTools", availableTools.data.data);

    if (!availableTools?.data?.data?.tools?.length) {
      return await sendToolErrorResponse(
        res,
        message,
        StatusCode.SERVER_ERROR,
        databse,
        userId,
      );
    }

    const response = await generateGeminiContent(
      getInputSchemaPrompt(JSON.stringify(availableTools.data.data), message),
      model,
    );

    console.log("G response", response);

    if (!response) {
      return await sendToolErrorResponse(
        res,
        message,
        StatusCode.SERVER_ERROR,
        databse,
        userId,
      );
    }

    const updtaedUserToolChat = await databse.toolChatDAL.updateToolChat(
      userToolChat[0].toolChatId,
      userId,
      response,
    );

    console.log("updatedUserToolChat", updtaedUserToolChat);

    if (!updtaedUserToolChat.length) {
      return await sendToolErrorResponse(
        res,
        message,
        StatusCode.SERVER_ERROR,
        databse,
        userId,
      );
    }

    const headers = await generateMCPRequestHeader(response, databse, userId);

    console.log("MCP headers", headers);

    const toolResponse = await axios.post(
      getMCPURL(mcpRoute.processEvent),
      JSON.parse(response),
      { headers },
    );

    console.log("toolResponse", toolResponse.data);

    const geminiFinalResponse = await generateGeminiContent(
      getMessageResponsePrompt(message, JSON.stringify(toolResponse.data)),
      model,
    );

    console.log("geminiFinalResponse", geminiFinalResponse);

    if (!geminiFinalResponse) {
      return await sendToolErrorResponse(
        res,
        message,
        StatusCode.SERVER_ERROR,
        databse,
        userId,
      );
    }

    const modelToolChatId = await databse.toolChatDAL.createToolChat(
      userId,
      ToolChatRole.Model,
      geminiFinalResponse,
      JSON.stringify(toolResponse.data),
    );

    console.log("modelToolChatId", modelToolChatId);

    res.status(StatusCode.OK).json(
      new ResponseModel(
        {
          aiResponse: message,
        },
        APIStatus.SUCCESS,
        StatusCode.OK,
        "taksed prformed successfully.",
      ),
    );
  } catch (error) {
    next(error);
  }
};

export const getToolChats = async (
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

    const toolChats = await database.toolChatDAL.getToolChats(userId as string);

    res
      .status(StatusCode.OK)
      .json(
        new ResponseModel(
          toolChats,
          APIStatus.SUCCESS,
          StatusCode.OK,
          "Tool chats found.",
        ),
      );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error");
      console.error("URL:", error.config?.url);
      console.error("Method:", error.config?.method);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("Headers:", error.response?.headers);
    } else {
      console.error(error);
    }

    next(error);

    next(error);
  }
};

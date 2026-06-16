export type ApiResponse<T = null> = {
  status: string;
  statusCode: number;
  message: string;
  data: T;
};

type JsonSchemaProperty = {
  type: string;
};

type InputSchema = {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
};

type MCPTool = {
  eventName: string;
  description: string;
  inputSchema: InputSchema;
};

export type MCPToolsResponse = {
  tools: MCPTool[];
};

export type EmailRequest = {
  eventName: string;
  to: string;
  subject: string;
  body: string;
};

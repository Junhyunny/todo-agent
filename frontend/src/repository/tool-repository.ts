import { getFastAPI, type ToolResponse } from "../api/generated/agents";

const { getToolsApiToolsGet } = getFastAPI();

export const getTools = async (): Promise<ToolResponse[]> => {
  const response = await getToolsApiToolsGet();
  return response.data;
};

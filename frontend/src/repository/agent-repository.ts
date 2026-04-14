import { type AgentResponse, type PostAgentRequest, getFastAPI } from "../api/generated/agents";

const { getAgentsAgentsGet, createAgentAgentsPost } = getFastAPI();

export const createAgent = async (
  request: PostAgentRequest,
): Promise<AgentResponse> => {
  const response = await createAgentAgentsPost(request);
  return response.data;
};

export const getAgents = async (): Promise<AgentResponse[]> => {
  const response = await getAgentsAgentsGet();
  return response.data;
};

import {
  type AgentResponse,
  getFastAPI,
  type PostAgentRequest,
} from "../api/generated/agents";

const { getAgentsApiAgentsGet, createAgentApiAgentsPost } = getFastAPI();

export const createAgent = async (
  request: PostAgentRequest,
): Promise<AgentResponse> => {
  const response = await createAgentApiAgentsPost(request);
  return response.data;
};

export const getAgents = async (): Promise<AgentResponse[]> => {
  const response = await getAgentsApiAgentsGet();
  return response.data;
};

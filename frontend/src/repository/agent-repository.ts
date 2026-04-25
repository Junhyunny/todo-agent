import {
  type AgentRequest,
  type AgentResponse,
  getFastAPI,
} from "../api/generated/agents";

const {
  getAgentsApiAgentsGet,
  createAgentApiAgentsPost,
  existsAgentApiAgentsExistsGet,
  updateAgentApiAgentsAgentIdPut,
  deleteAgentApiAgentsAgentIdDelete,
} = getFastAPI();

export const createAgent = async (
  request: AgentRequest,
): Promise<AgentResponse> => {
  const response = await createAgentApiAgentsPost(request);
  return response.data;
};

export const getAgents = async (): Promise<AgentResponse[]> => {
  const response = await getAgentsApiAgentsGet();
  return response.data;
};

export const updateAgent = async (
  id: string,
  request: AgentRequest,
): Promise<AgentResponse> => {
  const response = await updateAgentApiAgentsAgentIdPut(id, request);
  return response.data;
};

export const existsAgentByName = async (name: string): Promise<boolean> => {
  const response = await existsAgentApiAgentsExistsGet({ name });
  return response.data;
};

export const deleteAgent = async (id: string): Promise<void> => {
  await deleteAgentApiAgentsAgentIdDelete(id);
};

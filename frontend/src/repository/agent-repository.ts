import type { AgentResponse, PostAgentRequest } from "../api/generated/agents";

export const createAgent = async (
  _request: PostAgentRequest,
): Promise<AgentResponse> => {
  throw new Error("not implemented");
};

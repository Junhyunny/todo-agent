import { describe, expect, test, vi } from "vitest";
import { createAgent, getAgents } from "./agent-repository";

const mockGetAgentsAgentsGet = vi.hoisted(() => vi.fn());
const mockCreateAgentAgentsPost = vi.hoisted(() => vi.fn());
vi.mock("../api/generated/agents", () => ({
  getFastAPI: () => ({
    getAgentsAgentsGet: mockGetAgentsAgentsGet,
    createAgentAgentsPost: mockCreateAgentAgentsPost,
  }),
}));

describe("agent-repository", () => {
  test("getAgents는 GET /agents를 호출하고 에이전트 목록을 반환한다", async () => {
    const agents = [
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
      { id: "2", name: "에이전트B", system_prompt: "프롬프트B" },
    ];
    mockGetAgentsAgentsGet.mockResolvedValue({ data: agents });

    const result = await getAgents();

    expect(result).toEqual(agents);
    expect(mockGetAgentsAgentsGet).toHaveBeenCalledTimes(1);
  });

  test("createAgent는 POST /agents를 호출하고 생성된 에이전트를 반환한다", async () => {
    const request = { name: "새 에이전트", system_prompt: "너는 AI야" };
    const created = { id: "1", name: "새 에이전트", system_prompt: "너는 AI야" };
    mockCreateAgentAgentsPost.mockResolvedValue({ data: created });

    const result = await createAgent(request);

    expect(result).toEqual(created);
    expect(mockCreateAgentAgentsPost).toHaveBeenCalledWith(request);
  });
});

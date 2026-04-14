import { describe, expect, test, vi } from "vitest";
import { createAgent, getAgents } from "./agent-repository";

const mockGetAgentsApiAgentsGet = vi.hoisted(() => vi.fn());
const mockCreateAgentApiAgentsPost = vi.hoisted(() => vi.fn());
vi.mock("../api/generated/agents", () => ({
  getFastAPI: () => ({
    getAgentsApiAgentsGet: mockGetAgentsApiAgentsGet,
    createAgentApiAgentsPost: mockCreateAgentApiAgentsPost,
  }),
}));

describe("agent-repository", () => {
  test("getAgents는 GET /agents를 호출하고 에이전트 목록을 반환한다", async () => {
    const agents = [
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
      { id: "2", name: "에이전트B", system_prompt: "프롬프트B" },
    ];
    mockGetAgentsApiAgentsGet.mockResolvedValue({ data: agents });

    const result = await getAgents();

    expect(result).toEqual(agents);
    expect(mockGetAgentsApiAgentsGet).toHaveBeenCalledTimes(1);
  });

  test("createAgent는 POST /agents를 호출하고 생성된 에이전트를 반환한다", async () => {
    const request = { name: "새 에이전트", system_prompt: "너는 AI야" };
    const created = {
      id: "1",
      name: "새 에이전트",
      system_prompt: "너는 AI야",
    };
    mockCreateAgentApiAgentsPost.mockResolvedValue({ data: created });

    const result = await createAgent(request);

    expect(result).toEqual(created);
    expect(mockCreateAgentApiAgentsPost).toHaveBeenCalledWith(request);
  });
});

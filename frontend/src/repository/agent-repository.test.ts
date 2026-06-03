import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import * as generatedAgents from "../api/generated/agents";

const mockGetAgentsApiAgentsGet = vi.fn();
const mockCreateAgentApiAgentsPost = vi.fn();
const mockExistsAgentApiAgentsExistsGet = vi.fn();
const mockUpdateAgentApiAgentsAgentIdPut = vi.fn();
const mockDeleteAgentApiAgentsAgentIdDelete = vi.fn();
const actualFastAPI = generatedAgents.getFastAPI();

vi.spyOn(generatedAgents, "getFastAPI").mockReturnValue({
  ...actualFastAPI,
  getAgentsApiAgentsGet: mockGetAgentsApiAgentsGet,
  createAgentApiAgentsPost: mockCreateAgentApiAgentsPost,
  existsAgentApiAgentsExistsGet: mockExistsAgentApiAgentsExistsGet,
  updateAgentApiAgentsAgentIdPut: mockUpdateAgentApiAgentsAgentIdPut,
  deleteAgentApiAgentsAgentIdDelete: mockDeleteAgentApiAgentsAgentIdDelete,
});

let repository: typeof import("./agent-repository");

describe("agent-repository", () => {
  beforeAll(async () => {
    repository = await import("./agent-repository.js");
  });

  beforeEach(() => {
    mockGetAgentsApiAgentsGet.mockReset();
    mockCreateAgentApiAgentsPost.mockReset();
    mockExistsAgentApiAgentsExistsGet.mockReset();
    mockUpdateAgentApiAgentsAgentIdPut.mockReset();
    mockDeleteAgentApiAgentsAgentIdDelete.mockReset();
  });

  test("getAgents는 GET /agents를 호출하고 에이전트 목록을 반환한다", async () => {
    const agents = [
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
      { id: "2", name: "에이전트B", system_prompt: "프롬프트B" },
    ];
    mockGetAgentsApiAgentsGet.mockResolvedValue({ data: agents });

    const result = await repository.getAgents();

    expect(result).toEqual(agents);
    expect(mockGetAgentsApiAgentsGet).toHaveBeenCalledTimes(1);
  });

  test("createAgent는 POST /agents를 호출하고 생성된 에이전트를 반환한다", async () => {
    const request = {
      name: "새 에이전트",
      description: "",
      system_prompt: "너는 AI야",
      tools: [],
    };
    const created = {
      id: "1",
      name: "새 에이전트",
      description: "",
      system_prompt: "너는 AI야",
      tools: [],
    };
    mockCreateAgentApiAgentsPost.mockResolvedValue({ data: created });

    const result = await repository.createAgent(request);

    expect(result).toEqual(created);
    expect(mockCreateAgentApiAgentsPost).toHaveBeenCalledWith(request);
  });

  test("updateAgent PUT /agents를 호출하고 변경된 에이전트를 반환한다", async () => {
    const request = {
      name: "새 에이전트",
      description: "",
      system_prompt: "너는 대단한 AI야",
      tools: [],
    };
    const created = {
      id: "1",
      name: "새 에이전트",
      description: "",
      system_prompt: "너는 대단한 AI야",
      tools: [],
    };
    mockUpdateAgentApiAgentsAgentIdPut.mockResolvedValue({ data: created });

    const result = await repository.updateAgent("1", request);

    expect(result).toEqual(created);
    expect(mockUpdateAgentApiAgentsAgentIdPut).toHaveBeenCalledWith(
      "1",
      request,
    );
  });

  test("deleteAgent는 DELETE /agents/{id}를 호출한다", async () => {
    mockDeleteAgentApiAgentsAgentIdDelete.mockResolvedValue({});

    await repository.deleteAgent("1");

    expect(mockDeleteAgentApiAgentsAgentIdDelete).toHaveBeenCalledWith("1");
  });
});

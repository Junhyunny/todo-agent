import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import * as generatedAgents from "../api/generated/agents";

const mockGetToolsApiToolsGet = vi.fn();
const actualFastAPI = generatedAgents.getFastAPI();

vi.spyOn(generatedAgents, "getFastAPI").mockReturnValue({
  ...actualFastAPI,
  getToolsApiToolsGet: mockGetToolsApiToolsGet,
});

let repository: typeof import("./tool-repository");

describe("tool-repository", () => {
  beforeAll(async () => {
    repository = await import("./tool-repository.js");
  });

  beforeEach(() => {
    mockGetToolsApiToolsGet.mockReset();
  });

  test("getTools는 GET /tools를 호출하고 툴 목록을 반환한다", async () => {
    const tools = [
      { id: "1", name: "웹 검색(web search)" },
      { id: "2", name: "코드 실행" },
    ];
    mockGetToolsApiToolsGet.mockResolvedValue({ data: tools });

    const result = await repository.getTools();

    expect(result).toEqual(tools);
    expect(mockGetToolsApiToolsGet).toHaveBeenCalledTimes(1);
  });
});
